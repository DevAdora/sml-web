import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetId } = await context.params;
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
        const me = authData?.user?.id;

        if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (me === targetId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

        const { error } = await supabase
            .schema("sml")
            .from("user_follows")
            .insert({ follower_id: me, following_id: targetId });

        if (error) {
            // ignore duplicates gracefully
            if ((error as any).code === "23505") {
                return NextResponse.json({ success: true }, { status: 200 });
            }
            console.error("follow error:", error);
            return NextResponse.json({ error: "Failed to follow user" }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (e) {
        console.error("POST follow crash:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: targetId } = await context.params;
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
        const me = authData?.user?.id;

        if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { error } = await supabase
            .schema("sml")
            .from("user_follows")
            .delete()
            .eq("follower_id", me)
            .eq("following_id", targetId);

        if (error) {
            console.error("unfollow error:", error);
            return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
        console.error("DELETE follow crash:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
