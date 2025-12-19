// app/api/posts/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await context.params;
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

        const url = new URL(request.url);
        const page = Math.max(1, Number(url.searchParams.get("page") || 1));
        const limitRaw = Number(url.searchParams.get("limit") || 20);
        const limit = Math.min(50, Math.max(1, limitRaw));
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id ?? null;

        // 1) Fetch comments only
        const { data: rows, error, count } = await supabase
            .schema("sml")
            .from("comments")
            .select(
                "id, post_id, user_id, content, created_at, updated_at, parent_comment_id, likes_count",
                { count: "exact" }
            )
            .eq("post_id", postId)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching comments:", error);
            return NextResponse.json(
                {
                    error: "Failed to fetch comments",
                    supabase: {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: (error as any).code,
                    },
                },
                { status: 500 }
            );
        }

        const comments = rows ?? [];

        // 2) Fetch profiles for these users (best-effort)
        const userIds = Array.from(new Set(comments.map((c) => c.user_id).filter(Boolean)));

        let profilesById = new Map<string, { full_name: string | null; avatar_url: string | null }>();

        if (userIds.length > 0) {
            const { data: profiles, error: profileError } = await supabase
                .schema("sml")
                .from("profiles")
                .select("id, full_name, avatar_url")
                .in("id", userIds);

            if (profileError) {
                // Don’t fail comments if profiles fail
                console.error("Error fetching profiles:", profileError);
            } else {
                (profiles ?? []).forEach((p: any) => {
                    profilesById.set(p.id, {
                        full_name: p.full_name ?? null,
                        avatar_url: p.avatar_url ?? null,
                    });
                });
            }
        }

        const shaped = comments.map((c: any) => {
            const profile = profilesById.get(c.user_id);
            return {
                id: c.id,
                post_id: c.post_id,
                user_id: c.user_id,
                content: c.content,
                created_at: c.created_at,
                updated_at: c.updated_at ?? null,
                parent_id: c.parent_comment_id ?? null,
                likes_count: c.likes_count ?? 0,
                author: profile?.full_name ?? "Anonymous",
                avatar_url: profile?.avatar_url ?? null,
                can_edit: userId ? c.user_id === userId : false,
            };
        });

        return NextResponse.json(
            {
                comments: shaped,
                page,
                limit,
                total: count ?? shaped.length,
                has_more: (count ?? 0) > page * limit,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in GET comments:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: postId } = await context.params;
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
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) {
            console.error("Auth error:", authErr);
        }
        const userId = authData?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const content = (body?.content ?? "").toString().trim();
        const parent_comment_id = body?.parent_comment_id
            ? String(body.parent_comment_id)
            : null;

        if (content.length > 2000) {
            return NextResponse.json({ error: "Content is too long" }, { status: 400 });
        }

        const { data: inserted, error } = await supabase
            .schema("sml")
            .from("comments")
            .insert({
                post_id: postId,
                user_id: userId,
                content,
                parent_comment_id,
            })
            .select("id, post_id, user_id, content, created_at, updated_at, parent_comment_id, likes_count")
            .single();


        if (error || !inserted) {
            console.error("Error inserting comment:", {
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: (error as any)?.code,
            });

            return NextResponse.json(
                {
                    error: "Failed to create comment",
                    supabase: {
                        message: error?.message,
                        details: error?.details,
                        hint: error?.hint,
                        code: (error as any)?.code,
                    },
                },
                { status: 500 }
            );
        }


        const { data: profile } = await supabase
            .schema("sml")
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", userId)
            .single();

        return NextResponse.json(
            {
                ...inserted,
                author: profile?.full_name ?? "Anonymous",
                avatar_url: profile?.avatar_url ?? null,
                can_edit: true,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error in POST comments:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
