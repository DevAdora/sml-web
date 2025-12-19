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

        // Create new bookmark
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
            console.error("[BOOKMARK] Error creating bookmark:", bookmarkError);
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
        console.error("[BOOKMARK] Error:", error);
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
            console.error("[BOOKMARK] Error deleting bookmark:", deleteError);
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
        console.error("[BOOKMARK] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}