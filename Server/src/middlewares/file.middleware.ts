import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { cloud } from "../lib/index.js"; // Import your Cloudinary instance

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const fileUploadMiddleware = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "audio", maxCount: 1 },
  { name: "file", maxCount: 1 }
]);

export const processFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files) return next();
  
      const fileFields = ["image", "video", "audio", "file"];
      const uploadedFiles: Record<string, string> = {};
      const fileMap = req.files as { [key: string]: Express.Multer.File[] }; // Explicit assertion
  
      for (const field of fileFields) {
        const file = fileMap[field]?.[0];
  
        if (file) {
          const result = await cloud.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) {
                return res.status(500).json({ message: "File upload failed", error });
              }
              uploadedFiles[field] = result?.secure_url || "";
  
              // Ensure we call `next()` only after all uploads are completed
              if (Object.keys(uploadedFiles).length === fileFields.filter(f => fileMap[f])?.length) {
                Object.assign(req.body, uploadedFiles);
                next();
              }
            }
          );
  
          result.end(file.buffer);
        }
      }
    } catch (error) {
      res.status(500).json({ message: "File processing error", error });
    }
  };
  
