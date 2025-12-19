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

        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = authData.user.id;

        const { error: likeError } = await supabase
            .schema("sml")
            .from("post_likes")
            .insert({
                post_id: postId,
                user_id: userId,
            });

        if (likeError) {
            if (likeError.code === "23505") {
                return NextResponse.json(
                    { message: "Already liked" },
                    { status: 200 }
                );
            }
            throw likeError;
        }

        return NextResponse.json({ message: "Liked successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error liking post:", error);
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

        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = authData.user.id;

        const { error: deleteError } = await supabase
            .schema("sml")
            .from("post_likes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", userId);

        if (deleteError) {
            throw deleteError;
        }

        return NextResponse.json({ message: "Unliked successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error unliking post:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}