import { Router, Request, Response } from "express";
import multer from "multer";
import { logProcessingQueue } from "../queue/queue";
import supabase from "../supabase";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload-logs",
  upload.single("logFile"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const { originalname: originalName, buffer, mimetype } = req.file;

      const bucketName = "logs";
      const fileId = uuidv4();
      const filePath = `uploaded_logs/${originalName}/${fileId}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: mimetype,
        });

      if (error) {
        console.error("Error uploading to Supabase Storage:", error);
        res
          .status(500)
          .json({ error: "Failed to upload file to Supabase Storage" });
        return;
      }

      const fileUrl = data?.path || "";

      const { data: metadata, error: metadataError } = await supabase.storage
        .from("logs")
        .info(filePath);

      if (metadataError || !metadata) {
        console.error("Error fetching file metadata:", metadataError);
        res.status(500).json({ error: "Failed to retrieve file metadata" });
        return;
      }
      console.log("xxxxx", metadata?.size);
      const fileSize = metadata.size || 0;
      console.log(`File size for ${filePath}: ${fileSize}`);

      const job = await logProcessingQueue.add(
        "process-log",
        {
          fileId: filePath,
          filePath: fileUrl,
        },
        {
          priority: fileSize % 2097151,
          attempts: 3,
        }
      );

      res.status(200).json({ jobId: job.id });
    } catch (err) {
      console.error("Error during file upload:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
