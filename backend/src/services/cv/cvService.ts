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
    
    // Insert the CV record into the cvs table
    const { error: insertError, data: cvRecord } = await supabase
      .from("cvs")
      .insert({
        file_name: file.originalname,
        file_path: fileName, // Store the path in Supabase storage
        file_type: file.mimetype,
        file_size: file.size,
        job_seeker_id: userId,
        status: 'UPLOADED'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error("Failed to insert CV record:", insertError);

      // Attempt to delete the uploaded file to prevent orphaned files
      const { error: removeError } = await supabase.storage
        .from("cvs")
        .remove([fileName]);
      if (removeError) {
        console.error("Failed to remove orphaned CV file:", removeError);
      }
      return {
        success: false,
        error: "Failed to save CV record. Uploaded file has been removed.",
      };
    }
    
    // Update the job_seekers table to link the CV to the job seeker
    const { error: updateError } = await supabase
      .from("job_seekers")
      .update({ cv_file_path: urlData.publicUrl })
      .eq("user_id", userId);
    
    if (updateError) {
      console.error("Failed to update job seeker CV URL:", updateError);
      
      // Attempt to delete the CV record we just inserted to maintain consistency
      const { error: deleteError } = await supabase
        .from("cvs")
        .delete()
        .eq("cv_id", cvRecord.cv_id);
      if (deleteError) {
        console.error("Failed to remove incomplete CV record:", deleteError);
      }

      // Attempt to delete the uploaded file to prevent orphaned files
      const { error: removeError } = await supabase.storage
        .from("cvs")
        .remove([fileName]);
      if (removeError) {
        console.error("Failed to remove orphaned CV file:", removeError);
      }
      return {
        success: false,
        error: "Failed to link CV to user. CV record and uploaded file have been removed.",
      };
    }
    
    return {
      success: true,
      fileUrl: urlData.publicUrl,
      fileName,
      cvId: cvRecord.cv_id, // Return the new CV ID
    };
  } catch (error: any) {
    console.error("CV processing error:", error);
    return {
      success: false,
      error: error.message || "Internal server error",
    };
  }
};

/**
 * Get a CV by its ID
 * @param cvId - The ID of the CV to retrieve
 * @param userId - The ID of the user requesting the CV (for access control)
 * @returns CV details if found and accessible, otherwise null
 */
export const getCvById = async (cvId: string, userId: string) => {
  try {
    // First get the CV record from the database
    const { data: cvData, error } = await supabase
      .from("cvs")
      .select("*")
      .eq("cv_id", cvId)
      .single();

    if (error) {
      console.error("Error fetching CV:", error);
      return { success: false, error: error.message || "Failed to fetch CV" };
    }

    if (!cvData) {
      return { success: false, error: "CV not found" };
    }

    // Check if the requesting user has access to this CV
    if (cvData.job_seeker_id !== userId) {
      return { success: false, error: "Access denied: You don't have permission to view this CV" };
    }

    // Return CV details with file access information
    return {
      success: true,
      data: cvData
    };
  } catch (error: any) {
    console.error("Error retrieving CV:", error);
    return { success: false, error: error.message || "Internal server error" };
  }
};
