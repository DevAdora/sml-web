import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const cookiesToSet: Array<{ name: string; value: string; options: any }> = [];

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        const cookieHeader = request.headers.get("cookie");
                        if (!cookieHeader) return [];
                        return cookieHeader.split(";").map((c) => {
                            const [name, ...rest] = c.trim().split("=");
                            return { name, value: decodeURIComponent(rest.join("=")) };
                        });
                    },
                    setAll(newCookies) {
                        cookiesToSet.push(...newCookies);
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
        }

        // Create final response and apply cookies
        const response = NextResponse.json({ ok: true, user: data.user });

        cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
        });

        return response;
    } catch {
        return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
}
