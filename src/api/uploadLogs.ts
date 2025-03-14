// import { Router } from 'express';
// import multer from 'multer';
// import { logProcessingQueue } from '../queue/queue';

// const router = Router();
// const upload = multer({ dest: 'uploads/' });

// router.post('/upload-logs', upload.single('logFile'), async (req, res) => {
//   const fileId = req.file?.filename || '';
//   // console.log("upload logs", req.file)

//   await logProcessingQueue.add('process-log', {
//     fileId,
//     filePath: req.file?.path || '',
//   });

//   res.status(200).json({ jobId: fileId });
// });

// export default router;

// ####################################################################################

// import { Router } from 'express';
// import multer from 'multer';
// import { logProcessingQueue } from '../queue/queue';
// import supabase from '../supabase';

// const router = Router();
// // const upload = multer({ dest: 'uploads/' });
// const upload = multer({ storage: multer.memoryStorage() });

// router.post('/upload-logs', upload.single('logFile'), async (req, res) => {
//   const fileId = req.file?.filename || '';
//   const originalName = req.file?.filename || '';
//   const buffer = req.file?.buffer || ''
//   const mimetype = req.file?.mimetype || ''
//   // if (!req.file) {
//   //   return res.status(400).json({ error: 'No file uploaded' });
//   // }

//   // const {  buffer, mimetype } = req.file;

//   const bucketName = 'logs';
//   const filePath = `uploaded_logs/${fileId}`;

//   // Upload the file to Supabase Storage
//   const { data, error } = await supabase.storage
//     .from(bucketName)
//     .upload(filePath, buffer, {
//       contentType: mimetype,
//       upsert: false, // Set to true if you want to overwrite existing files with the same name
//     });

//     if (error) {
//       console.error('Error uploading to Supabase Storage:', error);
//       return res.status(500).json({ error: 'Failed to upload file to Supabase Storage' });
//     }

//     const fileUrl = data?.path;

//   await logProcessingQueue.add('process-log', {
//     fileId: data?.path,
//     filePath: fileUrl,
//   });

//   res.status(200).json({ jobId: fileId });
// });

// export default router;





import { Router, Request, Response } from 'express';
import multer from 'multer';
import { logProcessingQueue } from '../queue/queue';
import supabase from '../supabase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-logs', upload.single('logFile'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { originalname: originalName, buffer, mimetype } = req.file;

    // console.log("file info ", originalName, buffer, mimetype, req.file )
    console.log("file info ", req.file.filename )
    const bucketName = 'logs';
    const fileId =  uuidv4()
    const filePath = `uploaded_logs/${originalName}/${fileId}`;
    // const filePath = `uploaded_logs/${req.file?.filename}`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimetype,
        // upsert: false, // Prevent overwriting
      });


      // const { data, error } = await supabase
      // .storage
      // .from('logs')
      // .upload('uploaded_logs/avatar1.png', buffer, {
      //   cacheControl: '3600',
      //   upsert: false
      // })

      console.log("jjj")
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
