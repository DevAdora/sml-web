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

        const { data: authData } = await supabase.auth.getUser();
        const viewerId = authData?.user?.id ?? null;

        if (!viewerId || viewerId !== profileId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const url = new URL(request.url);
        const page = Math.max(1, Number(url.searchParams.get("page") || 1));
        const limit = Math.min(20, Math.max(1, Number(url.searchParams.get("limit") || 10)));
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await supabase
            .schema("sml")
            .from("post_saves")
            .select(
                `
        created_at,
        post:posts (
          id,
          title,
          excerpt,
          genre,
          read_time,
          created_at,
          likes_count,
          comments_count,
          author_id,
          cover_image_url,
          cover_image_caption
        )
      `,
                { count: "exact" }
            )
            .eq("user_id", profileId)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching bookmarks:", error);
            return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
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
        console.error("GET /users/[id]/bookmarks crash:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
