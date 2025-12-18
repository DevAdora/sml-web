// File location: app/api/posts/[id]/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const cookieStore = await cookies();
        const postId = params.id;

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;

        // Fetch the post with all fields including image data
        const { data: post, error: postError } = await supabase
            .schema("sml")
            .from("posts")
            .select("*")
            .eq("id", postId)
            .single();

        if (postError || !post) {
            console.error("Post not found:", postError);
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        // Fetch author profile
        let authorProfile = null;
        if (post.author_id) {
            const { data: profile } = await supabase
                .schema("sml")
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("id", post.author_id)
                .single();

            authorProfile = profile;
        }

        // Get likes count
        const { count: likesCount } = await supabase
            .schema("sml")
            .from("post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId);

        // Get comments count
        const { count: commentsCount } = await supabase
            .schema("sml")
            .from("post_comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId);

        // Check if user liked the post
        let userLiked = false;
        if (userId) {
            const { data: likeData } = await supabase
                .schema("sml")
                .from("post_likes")
                .select("id")
                .eq("post_id", postId)
                .eq("user_id", userId)
                .maybeSingle();

            userLiked = !!likeData;
        }

        // Check if user bookmarked the post
        let userBookmarked = false;
        if (userId) {
            const { data: bookmarkData } = await supabase
                .schema("sml")
                .from("bookmarks")
                .select("id")
                .eq("post_id", postId)
                .eq("user_id", userId)
                .maybeSingle();

            userBookmarked = !!bookmarkData;
        }

        // Fetch tags
        let tags: string[] = [];
        try {
            const { data: tagData } = await supabase
                .schema("sml")
                .from("post_tags")
                .select(`
          tags (
            name
          )
        `)
                .eq("post_id", postId);

            tags = tagData?.map((t: any) => t.tags?.name).filter(Boolean) || [];
        } catch (error) {
            console.log("Tags not available");
        }

        // Build response with all data including image fields
        const response = {
            id: post.id,
            title: post.title,
            content: post.content || post.excerpt,
            excerpt: post.excerpt,
            genre: post.genre || "General",
            read_time: post.read_time || 5,
            created_at: post.created_at,
            author: authorProfile?.full_name || "Anonymous",
            author_id: post.author_id,
            avatar_url: authorProfile?.avatar_url || null,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            user_liked: userLiked,
            user_bookmarked: userBookmarked,
            tags: tags,
            // NEW: Image fields
            cover_image_url: post.cover_image_url || null,
            cover_image_caption: post.cover_image_caption || null,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}