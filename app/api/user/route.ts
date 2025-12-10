import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET() {
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
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
        return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const { data: profileData, error: profileError } = await supabase
        .schema("sml")
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", authData.user.id)
        .maybeSingle();


    if (profileError) {
        return NextResponse.json(
            {
                authenticated: true,
                id: authData.user.id,
                email: authData.user.email,
                full_name: null,
                username: null,
                avatar_url: null,
                profile_error: profileError.message,
            },
            { status: 200 }
        );
    }

    return NextResponse.json(
        {
            authenticated: true,
            id: authData.user.id,
            email: authData.user.email,
            full_name: profileData?.full_name ?? null,
            avatar_url: profileData?.avatar_url ?? null,
        },
        { status: 200 }
    );

}