

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { logProcessingQueue } from '../queue/queue';
import supabase from '../supabase';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';


const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// router.use((req, res, next) => {
//   console.log('Cookies:', req.cookies); // Log cookies to the console
//   next();
// });

router.post('/upload-logs', upload.single('logFile'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    console.log("aaa ", req.cookies)
    const { originalname: originalName, buffer, mimetype } = req.file;

    const bucketName = 'logs';
    const fileId =  uuidv4()
    const filePath = `uploaded_logs/${originalName}/${fileId}`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimetype,
        // upsert: false, // Prevent overwriting
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      res.status(500).json({ error: 'Failed to upload file to Supabase Storage' });
      return;
    }

    const fileUrl = data?.path || '';

    // Add the file processing job to the queue
    await logProcessingQueue.add('process-log', {
      fileId: filePath,
      filePath: fileUrl,
    });

    res.status(200).json({ jobId: filePath });
  } catch (err) {
    console.error('Unexpected error during file upload:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
