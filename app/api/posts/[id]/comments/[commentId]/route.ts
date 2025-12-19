// app/api/posts/[id]/comments/[commentId]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";


export async function PATCH(
    request: Request,
    context: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        const { id: postId, commentId } = await context.params;
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
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const content = (body?.content ?? "").toString().trim();

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }
        if (content.length > 5000) {
            return NextResponse.json({ error: "Content is too long" }, { status: 400 });
        }

        const { data: existing, error: exErr } = await supabase
            .schema("sml")
            .from("comments")
            .select("id, user_id")
            .eq("id", commentId)
            .eq("post_id", postId)
            .single();

        if (exErr || !existing) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        if (existing.user_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { data: updated, error } = await supabase
            .schema("sml")
            .from("comments")
            .update({ content })
            .eq("id", commentId)
            .select("id, post_id, user_id, content, created_at, updated_at, parent_id")
            .single();

        if (error || !updated) {
            console.error("Error updating comment:", error);
            return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
        }

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("Error in PATCH comment:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


export async function DELETE(
    _request: Request,
    context: { params: Promise<{ id: string; commentId: string }> }
) {
    try {
        const { id: postId, commentId } = await context.params;
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
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: existing, error: exErr } = await supabase
            .schema("sml")
            .from("comments")
            .select("id, user_id")
            .eq("id", commentId)
            .eq("post_id", postId)
            .single();

        if (exErr || !existing) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        if (existing.user_id !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { error } = await supabase
            .schema("sml")
            .from("comments")
            .delete()
            .eq("id", commentId);

        if (error) {
            console.error("Error deleting comment:", error);
            return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error in DELETE comment:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
