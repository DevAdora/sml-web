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

        const { data: post, error: postError } = await supabase
            .schema("sml")
            .from("posts")
            .select("likes_count, saves_count, comments_count")
            .eq("id", postId)
            .single();

        if (postError || !post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        let userLiked = false;
        let userBookmarked = false;

        if (userId) {
            const { data: likeData } = await supabase
                .schema("sml")
                .from("post_likes")
                .select("id")
                .eq("post_id", postId)
                .eq("user_id", userId)
                .maybeSingle();

            userLiked = !!likeData;

            const { data: bookmarkData } = await supabase
                .schema("sml")
                .from("post_saves")
                .select("id")
                .eq("post_id", postId)
                .eq("user_id", userId)
                .maybeSingle();

            userBookmarked = !!bookmarkData;
        }

        return NextResponse.json({
            user_liked: userLiked,
            user_bookmarked: userBookmarked,
            likes_count: post.likes_count || 0,
            saves_count: post.saves_count || 0,
            comments_count: post.comments_count || 0,
        });
    } catch (error) {
        console.error("Error fetching post interactions:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}