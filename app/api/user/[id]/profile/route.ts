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

        const { data: profile, error: profileError } = await supabase
            .schema("sml")
            .from("profiles")
            .select("id, full_name, avatar_url, bio, location, website, created_at")
            .eq("id", profileId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const [{ count: postsCount }, { count: followersCount }, { count: followingCount }, { count: bookmarksCount }] =
            await Promise.all([
                supabase
                    .schema("sml")
                    .from("posts")
                    .select("*", { count: "exact", head: true })
                    .eq("author_id", profileId),

                supabase
                    .schema("sml")
                    .from("user_follows")
                    .select("*", { count: "exact", head: true })
                    .eq("following_id", profileId),

                supabase
                    .schema("sml")
                    .from("user_follows")
                    .select("*", { count: "exact", head: true })
                    .eq("follower_id", profileId),

                supabase
                    .schema("sml")
                    .from("post_saves")
                    .select("*", { count: "exact", head: true })
                    .eq("user_id", profileId),
            ]);

        let isFollowing = false;
        if (viewerId && viewerId !== profileId) {
            const { data: followRow } = await supabase
                .schema("sml")
                .from("user_follows")
                .select("follower_id, following_id")
                .eq("follower_id", viewerId)
                .eq("following_id", profileId)
                .maybeSingle();

            isFollowing = !!followRow;
        }

        return NextResponse.json({
            profile: {
                id: profile.id,
                full_name: profile.full_name ?? "Anonymous",
                avatar_url: profile.avatar_url ?? null,
                bio: profile.bio ?? "",
                location: profile.location ?? "",
                website: profile.website ?? "",
                created_at: profile.created_at,
            },
            stats: {
                reviews: postsCount ?? 0,
                followers: followersCount ?? 0,
                following: followingCount ?? 0,
                readingLists: bookmarksCount ?? 0
            },
            viewer: {
                is_following: isFollowing,
                is_me: viewerId === profileId,
            },
        });
    } catch (e) {
        console.error("GET /api/user/[id]/profile crash:", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
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

        // Check authentication
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id ?? null;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify user can only edit their own profile
        if (userId !== profileId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Parse request body
        const body = await request.json();
        const { full_name, bio, location, website, avatar_url } = body;

        // Prepare update data
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (full_name !== undefined) updateData.full_name = full_name;
        if (bio !== undefined) updateData.bio = bio;
        if (location !== undefined) updateData.location = location;
        if (website !== undefined) updateData.website = website;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

        // Update profile
        const { data: updatedProfile, error: updateError } = await supabase
            .schema("sml")
            .from("profiles")
            .update(updateData)
            .eq("id", profileId)
            .select("id, full_name, avatar_url, bio, location, website, created_at")
            .single();

        if (updateError) {
            console.error("Error updating profile:", updateError);
            return NextResponse.json(
                { error: "Failed to update profile" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            profile: updatedProfile,
        });
    } catch (e) {
        console.error("PATCH /api/user/[id]/profile crash:", e);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}