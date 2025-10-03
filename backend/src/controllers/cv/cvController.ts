import { Request, Response } from "express";
import { processCv } from "../../services/cv/cvService";
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
        cb(null, false);
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
      const user = (req as any).user;
      console.log("User object from auth middleware:", user);
      
      // Handle different possible user ID locations based on auth implementation
      const userId = user?.id || user?.sub || 
                    (user?.user_id) || 
                    (user?.user && user?.user.id);
      
      if (!userId) {
        console.error("Authentication error: No valid user ID found in request", { user });
        return res.status(401).json({ error: "Authentication required: Valid user ID not found" });
      }
      
      console.log("Using user ID for CV upload:", userId);
      
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
      res.status(200).json({ 
        message: "CV uploaded successfully", 
        fileUrl: result.fileUrl 
      });
    } catch (error: any) {
      console.error("Unexpected CV upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};

// Placeholder for getting CV data
export const getCv = (req: Request, res: Response) => {
  res.status(200).json({ message: "Get CV data (placeholder)" });
};
