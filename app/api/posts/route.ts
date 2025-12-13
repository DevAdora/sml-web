import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
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

    try {
        // Get pagination parameters from URL
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Fetch posts with pagination
        const { data: posts, error: postsError } = await supabase
            .schema("sml")
            .from("posts")
            .select("*")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .range(offset, offset + limit - 1); // Pagination range

        if (postsError) {
            console.error("Fetch posts error:", postsError);
            return NextResponse.json(
                { error: postsError.message, posts: [] },
                { status: 500 }
            );
        }

        if (!posts || posts.length === 0) {
            return NextResponse.json(
                {
                    success: true,
                    posts: [],
                    count: 0,
                    hasMore: false,
                },
                { status: 200 }
            );
        }

        // Get unique author IDs
        const authorIds = [...new Set(posts.map(post => post.author_id))];

        // Fetch author profiles
        const { data: profiles, error: profilesError } = await supabase
            .schema("sml")
            .from("profiles")
            .select("id, full_name")
            .in("id", authorIds);

        if (profilesError) {
            console.error("Fetch profiles error:", profilesError);
        }

        // Create profile map for quick lookup
        const profileMap = new Map();
        (profiles || []).forEach(profile => {
            profileMap.set(profile.id, profile);
        });

        // Combine posts with author information
        const postsWithAuthors = posts.map(post => {
            const authorProfile = profileMap.get(post.author_id);
            return {
                ...post,
                author_name: authorProfile?.full_name || null,
            };
        });

        // Check if there are more posts
        // Fetch one more post to see if there's a next page
        const { data: nextPageCheck } = await supabase
            .schema("sml")
            .from("posts")
            .select("id")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .range(offset + limit, offset + limit);

        const hasMore = nextPageCheck && nextPageCheck.length > 0;

        return NextResponse.json(
            {
                success: true,
                posts: postsWithAuthors,
                count: postsWithAuthors.length,
                page: page,
                limit: limit,
                hasMore: hasMore,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching posts", posts: [] },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
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

    // Check authentication
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
        return NextResponse.json(
            { error: "Unauthorized - Please sign in" },
            { status: 401 }
        );
    }

    try {
        const body = await request.json();
        const { title, excerpt, content, genre, tags, status, read_time } = body;

        // Validate required fields
        if (!title || !excerpt || !content || !genre) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Insert post into database using sml schema
        const { data: post, error: insertError } = await supabase
            .schema("sml")
            .from("posts")
            .insert({
                author_id: authData.user.id,
                title,
                excerpt,
                content,
                genre,
                tags: tags || [],
                status: status || "draft",
                read_time: read_time || 1,
                published_at: status === "published" ? new Date().toISOString() : null,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            return NextResponse.json(
                { error: insertError.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                post,
                message:
                    status === "published"
                        ? "Post published successfully!"
                        : "Post saved as draft",
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "An error occurred while creating the post" },
            { status: 500 }
        );
    }
}