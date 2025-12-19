import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: profileId } = await context.params;
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll: () => cookieStore.getAll(),
                    setAll: (cookiesToSet) => {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        const url = new URL(request.url);
        const page = Math.max(1, Number(url.searchParams.get("page") || 1));
        const limit = Math.min(20, Math.max(1, Number(url.searchParams.get("limit") || 10)));
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        // Assumption: sml.post_saves has columns: post_id, user_id, created_at
        const { data, error, count } = await supabase
            .schema("sml")
            .from("post_saves")
            .select(
                `
        created_at,
        post:posts (
          id, title, excerpt, genre, created_at, read_time,
          likes_count, comments_count, cover_image_url, cover_image_caption,
          author_id
        )
      `,
                { count: "exact" }
            )
            .eq("user_id", profileId)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("saved-posts error:", error);
            return NextResponse.json({ error: "Failed to fetch saved posts" }, { status: 500 });
        }

        const posts = (data ?? [])
            .map((row: any) => row.post)
            .filter(Boolean);

        return NextResponse.json({
            posts,
            page,
            limit,
            total: count ?? posts.length,
            has_more: (count ?? 0) > page * limit,
        });
    } catch (e) {
        console.error("GET saved posts crash:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
