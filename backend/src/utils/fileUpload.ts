import { supabase } from "../supabaseClient";
import { Request } from "express";
import multer from "multer";
import path from "path";

// Configure multer for memory storage to handle file uploads
const storage = multer.memoryStorage();
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req: Express.Request, file: Express.Multer.File, cb: any) => {
        // Only accept image files
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"), false);
        }
    },
});

/**
 * Upload file to Supabase storage
 * @param file - The file to upload
 * @param bucketName - The storage bucket name
 * @param filePath - The path where the file will be stored in the bucket
 * @returns Object with public URL or error
 */
export const uploadFileToSupabase = async (
    file: Express.Multer.File,
    bucketName: string,
    filePath: string,
): Promise<{ publicUrl?: string; error?: any }> => {
    try {
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file.buffer, {
                cacheControl: "3600",
                upsert: true,
                contentType: file.mimetype,
            });

        if (error) {
            console.error("Upload error:", error);
            return { error };
        }

        // Get the public URL for the uploaded file
        const { data: publicData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (!publicData?.publicUrl) {
            return { error: new Error("Could not get public URL") };
        }

        return { publicUrl: publicData.publicUrl };
    } catch (error: any) {
        console.error("Upload error:", error);
        return { error };
    }
};

/**
 * Delete file from Supabase storage
 * @param bucketName - The storage bucket name
 * @param filePath - The path of the file to delete
 * @returns Object with success status or error
 */
export const deleteFileFromSupabase = async (
    bucketName: string,
    filePath: string,
): Promise<{ success: boolean; error?: any }> => {
    try {
        const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

        if (error) {
            console.error("Delete error:", error);
            return { success: false, error };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Delete error:", error);
        return { success: false, error };
    }
};

/**
 * Upload profile image during registration
 * @param fileBuffer - The file buffer to upload
 * @param userId - The ID of the user
 * @param originalName - The original filename
 * @returns Object with public URL or error
 */
export const uploadProfileImageForRegistration = async (
    fileBuffer: Buffer,
    userId: string,
    originalName: string,
    mimeType: string,
): Promise<{ publicUrl?: string; error?: any }> => {
    try {
        // Define the file path in the storage bucket
        const fileName = `profile_${userId}_${Date.now()}_${originalName}`;
        const filePath = `avatars/${fileName}`;

        const { data, error } = await supabase.storage
            .from("avatars") // This bucket should exist in Supabase storage
            .upload(filePath, fileBuffer, {
                cacheControl: "3600",
                upsert: true,
                contentType: mimeType,
            });

        if (error) {
            console.error("Upload error during registration:", error);
            return { error };
        }

        // Get the public URL for the uploaded file
        const { data: publicData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);

        if (!publicData?.publicUrl) {
            return { error: new Error("Could not get public URL") };
        }

        return { publicUrl: publicData.publicUrl };
    } catch (error: any) {
        console.error("Upload error during registration:", error);
        return { error };
    }
};

