// app/api/posts/[id]/bookmark/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(
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

        // Get authenticated user
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Check if bookmark already exists
        const { data: existingBookmark } = await supabase
            .schema("sml")
            .from("post_saves")
            .select("id")
            .eq("post_id", postId)
            .eq("user_id", userId)
            .maybeSingle();

        if (existingBookmark) {
            return NextResponse.json(
                { message: "Post already bookmarked" },
                { status: 200 }
            );
        }

        // Create bookmark
        const { data: bookmark, error: bookmarkError } = await supabase
            .schema("sml")
            .from("post_saves")
            .insert({
                post_id: postId,
                user_id: userId,
            })
            .select()
            .single();

        if (bookmarkError) {
            console.error("Error creating bookmark:", bookmarkError);
            return NextResponse.json(
                { error: "Failed to bookmark post" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Post bookmarked successfully", bookmark },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error in bookmark POST:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

        // Get authenticated user
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Delete bookmark
        const { error: deleteError } = await supabase
            .schema("sml")
            .from("post_saves")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId);

        if (deleteError) {
            console.error("Error deleting bookmark:", deleteError);
            return NextResponse.json(
                { error: "Failed to remove bookmark" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Bookmark removed successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in bookmark DELETE:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
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

        const { count: likesCount } = await supabase
            .schema("sml")
            .from("post_likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId);

        const { count: commentsCount } = await supabase
            .schema("sml")
            .from("post_comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId);

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

        let userBookmarked = false;
        if (userId) {
            const { data: bookmarkData } = await supabase
                .schema("sml")
                .from("post_saves")
                .select("id")
                .eq("post_id", postId)
                .eq("user_id", userId)
                .maybeSingle();

            userBookmarked = !!bookmarkData;
        }

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