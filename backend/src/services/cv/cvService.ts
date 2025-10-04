import { supabase } from "../../supabaseClient";

/**
 * Upload and process a CV file
 * @param file - The CV file to upload
 * @param userId - The ID of the user uploading the CV
 */
export const processCv = async (file: Express.Multer.File, userId: string) => {
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${file.originalname}`;
    
    // Upload file to Supabase storage in the "cvs" bucket
    const { data, error } = await supabase.storage
      .from("cvs")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600"
      });
    
    if (error) {
      console.error("CV upload error:", error);
      return { 
        success: false,
        error: error.message || "Upload failed",
      };
    }
    
    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from("cvs")
      .getPublicUrl(fileName);
    
    if (!urlData?.publicUrl) {
      return { success: false, error: "Could not get public URL" };
    }
    
    // Update the job_seekers table to link the CV to the job seeker
    const { error: updateError } = await supabase
      .from("job_seekers")
      .update({ cv_file_path: urlData.publicUrl })
      .eq("user_id", userId);
    
    if (updateError) {
      console.error("Failed to update job seeker CV URL:", updateError);

      // Attempt to delete the uploaded file to prevent orphaned files
      const { error: removeError } = await supabase.storage
        .from("cvs")
        .remove([fileName]);
      if (removeError) {
        console.error("Failed to remove orphaned CV file:", removeError);
      }
      return {
        success: false,
        error: "Failed to link CV to user. Uploaded file has been removed.",
      };
    }
    
    return {
      success: true,
      fileUrl: urlData.publicUrl,
      fileName,
    };
  } catch (error: any) {
    console.error("CV processing error:", error);
    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
};
