import { Request, Response } from "express";
import { processCv, getCvById } from "../../services/cv/cvService";
import { parseCv } from "../../services/cv/parsingService";
import { supabase } from "../../supabaseClient";
import multer from "multer";

// CV upload logic with integrated authentication and error handling
export const uploadCv = (req: Request, res: Response) => {
  // Set up multer for file uploads
  const storage = multer.memoryStorage();
  const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'));
      }
    }
  }).single('cv');

  // Process the file upload
  upload(req, res, async function(err) {
    // Handle multer error
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    try {
      // Get user ID from request (set by auth middleware)
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      // Process and store CV
      const result = await processCv(req.file, userId);
      
      if (!result.success) {
        console.error("CV upload failed:", result.error);
        return res.status(500).json({ 
          error: "Failed to upload CV", 
          details: result.error 
        });
      }
      
      console.log("CV uploaded successfully:", result.fileUrl);
      
      // After successful upload, extract data from the CV and update profile
      try {
        console.log("Starting CV data extraction and profile update...");
        
        // We can parse directly from the buffer to avoid downloading the file we just uploaded
        // This function will both extract data and update the profile in the service layer
        const parseResult = await parseCv(req.file.buffer, userId);
        
        if (!parseResult.success) {
          console.error("Warning: CV parsing or profile update had issues:", parseResult.error);
          // We continue even if extraction has issues, as the CV was uploaded successfully
        }
      } catch (extractError) {
        console.error("Error during CV data extraction:", extractError);
        // We continue even if extraction fails, as the CV was uploaded successfully
      }
      
      res.status(200).json({ 
        message: "CV uploaded successfully", 
        fileUrl: result.fileUrl,
        fileName: result.fileName,
        cvId: result.cvId // Include the new CV ID in the response
      });
    } catch (error: any) {
      console.error("Unexpected CV upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};

// Get CV by ID
export const getCv = async (req: Request, res: Response) => {
  try {
    const cvId = req.params.id;
    
    // Get user ID from request (set by auth middleware)
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!cvId) {
      return res.status(400).json({ error: "CV ID is required" });
    }

    // Fetch the CV using the service
    const result = await getCvById(cvId, userId);

    if (!result.success) {
      const statusCode = result.error.includes("not found") ? 404 : 403;
      return res.status(statusCode).json({ error: result.error });
    }

    // Return the CV data
    res.status(200).json({
      message: "CV retrieved successfully",
      cv: result.data
    });
  } catch (error: any) {
    console.error("Error getting CV:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
