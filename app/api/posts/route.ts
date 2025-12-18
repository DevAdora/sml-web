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
        const unlimited = searchParams.get('unlimited') === 'true';

        // First, get the total count of published posts
        const { count: totalCount, error: countError } = await supabase
            .schema("sml")
            .from("posts")
            .select("*", { count: 'exact', head: true })
            .eq("status", "published");

        if (countError) {
            console.error("Count error:", countError);
        }

        const actualTotalPosts = totalCount || 0;
        console.log(`Total posts in database: ${actualTotalPosts}`);

        let posts;
        let postsError;

        if (unlimited && actualTotalPosts > 0) {
            // UNLIMITED MODE: Cycle through posts indefinitely
            const postsPerCycle = actualTotalPosts;
            const cycleNumber = Math.floor(((page - 1) * limit) / postsPerCycle);
            const offsetWithinCycle = ((page - 1) * limit) % postsPerCycle;

            console.log(`Unlimited mode - Page: ${page}, Cycle: ${cycleNumber}, Offset: ${offsetWithinCycle}`);

            // Fetch posts with cycling - include image fields
            const result = await supabase
                .schema("sml")
                .from("posts")
                .select("*")
                .eq("status", "published")
                .order("published_at", { ascending: false })
                .range(offsetWithinCycle, offsetWithinCycle + limit - 1);

            posts = result.data;
            postsError = result.error;

            // If we don't have enough posts to fill the limit, wrap around
            if (posts && posts.length < limit && actualTotalPosts > 0) {
                const remaining = limit - posts.length;
                const wrapResult = await supabase
                    .schema("sml")
                    .from("posts")
                    .select("*")
                    .eq("status", "published")
                    .order("published_at", { ascending: false })
                    .range(0, remaining - 1);

                if (wrapResult.data) {
                    posts = [...posts, ...wrapResult.data];
                }
            }
        } else {
            // NORMAL MODE: Standard pagination
            const offset = (page - 1) * limit;

            const result = await supabase
                .schema("sml")
                .from("posts")
                .select("*")
                .eq("status", "published")
                .order("published_at", { ascending: false })
                .range(offset, offset + limit - 1);

            posts = result.data;
            postsError = result.error;
        }

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
                    hasMore: unlimited ? true : false,
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

        // Combine posts with author information and image data
        const postsWithAuthors = posts.map(post => {
            const authorProfile = profileMap.get(post.author_id);
            return {
                ...post,
                author_name: authorProfile?.full_name || null,
                cover_image_url: post.cover_image_url || null,
                cover_image_caption: post.cover_image_caption || null,
            };
        });

        // Determine if there are more posts
        let hasMore = unlimited ? true : false;

        if (!unlimited) {
            const offset = (page - 1) * limit;
            const { data: nextPageCheck } = await supabase
                .schema("sml")
                .from("posts")
                .select("id")
                .eq("status", "published")
                .order("published_at", { ascending: false })
                .range(offset + limit, offset + limit);

            hasMore = (nextPageCheck?.length ?? 0) > 0;
        }

        return NextResponse.json(
            {
                success: true,
                posts: postsWithAuthors,
                count: postsWithAuthors.length,
                page: page,
                limit: limit,
                hasMore: hasMore,
                unlimited: unlimited,
                totalPostsInDB: actualTotalPosts,
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
        const {
            title,
            excerpt,
            content,
            genre,
            tags,
            status,
            read_time,
            cover_image_url,
            cover_image_caption,
        } = body;

        // Validate required fields
        if (!title || !excerpt || !content || !genre) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Insert post into database using sml schema with image support
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
                cover_image_url: cover_image_url || null,
                cover_image_caption: cover_image_caption || null,
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