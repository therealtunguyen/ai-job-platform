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
    const originalName = file.originalname;
    const fileExt = originalName.split('.').pop()?.toLowerCase() || 'pdf';
    const fileName = `cv_${userId}_${timestamp}.${fileExt}`;
    
    // Upload file to Supabase storage in the "cvs" bucket
    const { data, error } = await supabase.storage
      .from("cvs")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600"
      });
    
    if (error) {
      console.error("CV upload error:", error);
      return { success: false, error };
    }
    
    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from("cvs")
      .getPublicUrl(fileName);
    
    if (!urlData?.publicUrl) {
      return { success: false, error: "Failed to get public URL" };
    }
    
    // Update the job_seekers table to link the CV to the job seeker
    const { error: updateError } = await supabase
      .from("job_seekers")
      .update({ CV_url: urlData.publicUrl })
      .eq("user_id", userId);
    
    if (updateError) {
      console.error("Failed to update job seeker CV URL:", updateError);
    }
    
    return {
      success: true,
      fileUrl: urlData.publicUrl
    };
  } catch (error) {
    console.error("CV processing error:", error);
    return { success: false, error };
  }
};
