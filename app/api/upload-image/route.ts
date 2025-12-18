// File location: app/api/upload-image/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "File must be an image" },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File size must be less than 5MB" },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `post-images/${fileName}`;

        // Convert File to ArrayBuffer then to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("post-images")
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return NextResponse.json(
                { error: `Upload failed: ${uploadError.message}` },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("post-images")
            .getPublicUrl(filePath);

        return NextResponse.json(
            {
                success: true,
                url: urlData.publicUrl,
                path: filePath,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Image upload error:", error);
        return NextResponse.json(
            { error: "An error occurred while uploading the image" },
            { status: 500 }
        );
    }
}