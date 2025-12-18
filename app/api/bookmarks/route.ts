// app/api/bookmarks/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();

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

        // Fetch bookmarks with post details
        const { data: bookmarks, error: bookmarksError } = await supabase
            .schema("sml")
            .from("post_saves")
            .select(`
                id,
                created_at,
                post_id,
                posts (
                    id,
                    title,
                    excerpt,
                    content,
                    genre,
                    read_time,
                    created_at,
                    author_id,
                    cover_image_url,
                    cover_image_caption
                )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (bookmarksError) {
            console.error("Error fetching bookmarks:", bookmarksError);
            return NextResponse.json(
                { error: "Failed to fetch bookmarks" },
                { status: 500 }
            );
        }

        // Format the response
        const formattedBookmarks = await Promise.all(
            bookmarks.map(async (bookmark: any) => {
                const post = bookmark.posts;

                if (!post) return null;

                // Fetch author profile
                let authorName = "Anonymous";
                if (post.author_id) {
                    const { data: profile } = await supabase
                        .schema("sml")
                        .from("profiles")
                        .select("full_name")
                        .eq("id", post.author_id)
                        .single();

                    if (profile) {
                        authorName = profile.full_name;
                    }
                }

                // Get likes and comments count
                const { count: likesCount } = await supabase
                    .schema("sml")
                    .from("post_likes")
                    .select("*", { count: "exact", head: true })
                    .eq("post_id", post.id);

                const { count: commentsCount } = await supabase
                    .schema("sml")
                    .from("post_comments")
                    .select("*", { count: "exact", head: true })
                    .eq("post_id", post.id);

                return {
                    id: post.id,
                    title: post.title,
                    excerpt: post.excerpt,
                    content: post.content,
                    genre: post.genre || "General",
                    read_time: post.read_time || 5,
                    created_at: post.created_at,
                    author: authorName,
                    author_id: post.author_id,
                    likes_count: likesCount || 0,
                    comments_count: commentsCount || 0,
                    cover_image_url: post.cover_image_url || null,
                    cover_image_caption: post.cover_image_caption || null,
                    bookmarked_at: bookmark.created_at,
                };
            })
        );

        const validBookmarks = formattedBookmarks.filter(Boolean);

        return NextResponse.json({
            success: true,
            bookmarks: validBookmarks,
            count: validBookmarks.length,
        });
    } catch (error) {
        console.error("Error in bookmarks API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}