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

        const url = new URL(request.url);
        const limit = Math.min(20, Math.max(1, Number(url.searchParams.get("limit") || 5)));

        const { data: authData } = await supabase.auth.getUser();
        const me = authData?.user?.id ?? null;

        let q = supabase
            .schema("sml")
            .from("profiles")
            .select("id, full_name, avatar_url")
            .limit(limit);

        if (me) q = q.neq("id", me);

        const { data: profiles, error: profileError } = await q;

        if (profileError) {
            console.error("suggested profiles error:", profileError);
            return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
        }

        const list = profiles ?? [];

        if (!me || list.length === 0) {
            return NextResponse.json({
                users: list.map((p: any) => ({
                    id: p.id,
                    full_name: p.full_name ?? "Anonymous",
                    avatar_url: p.avatar_url ?? null,
                    is_following: false,
                })),
            });
        }

        const ids = list.map((p: any) => p.id);
        const { data: follows, error: followError } = await supabase
            .schema("sml")
            .from("user_follows")
            .select("following_id")
            .eq("follower_id", me)
            .in("following_id", ids);

        if (followError) {
            console.error("follows lookup error:", followError);
            return NextResponse.json({
                users: list.map((p: any) => ({
                    id: p.id,
                    full_name: p.full_name ?? "Anonymous",
                    avatar_url: p.avatar_url ?? null,
                    is_following: false,
                })),
            });
        }

        const followed = new Set((follows ?? []).map((f: any) => f.following_id));

        return NextResponse.json({
            users: list.map((p: any) => ({
                id: p.id,
                full_name: p.full_name ?? "Anonymous",
                avatar_url: p.avatar_url ?? null,
                is_following: followed.has(p.id),
            })),
        });
    } catch (e) {
        console.error("GET /api/users/suggested crash:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
