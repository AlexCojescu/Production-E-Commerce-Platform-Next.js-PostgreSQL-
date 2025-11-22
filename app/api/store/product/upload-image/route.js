import imagekit from "@/configs/imagekit";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const image = formData.get("image");

        if (!image) {
            return NextResponse.json(
                { message: "No image provided" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/heic", "image/heif"];
        if (!allowedTypes.includes(image.type)) {
            return NextResponse.json(
                { message: "Invalid file type. Only JPEG, PNG, WebP, and HEIC are allowed" },
                { status: 400 }
            );
        }

        // Convert image to buffer
        const buffer = Buffer.from(await image.arrayBuffer());

        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: image.name,
            folder: "/products"
        });

        // Generate optimized URL
        const optimizedUrl = imagekit.url({
            path: uploadResponse.filePath,
            transformation: [{
                format: "webp",
                width: "1024",
                quality: "85"
            }]
        });

        return NextResponse.json({
            success: true,
            url: optimizedUrl,
            fileId: uploadResponse.fileId
        });

    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json(
            { message: "Failed to upload image", error: error.message },
            { status: 500 }
        );
    }
}
