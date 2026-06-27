import authSeller from "@/middlewares/authSeller";
import { uploadValidatedImage, UploadValidationError } from "@/lib/uploadImage";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const storeId = await authSeller(userId)
        if (!storeId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData();
        const image = formData.get("image");

        if (!image || typeof image === 'string') {
            return NextResponse.json(
                { message: "No image provided" },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await image.arrayBuffer());

        const { url, fileId } = await uploadValidatedImage(buffer, {
            folder: "/products",
            originalName: image.name,
            transformations: [{
                format: "webp",
                width: "1024",
                quality: "85"
            }],
        });

        return NextResponse.json({
            success: true,
            url,
            fileId
        });

    } catch (error) {
        if (error instanceof UploadValidationError) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        console.error("Error uploading image:", error);
        return NextResponse.json(
            { message: "Failed to upload image", error: error.message },
            { status: 500 }
        );
    }
}
