import { Router } from 'express';
import multer from 'multer';
import { logProcessingQueue } from '../queue/queue';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload-logs', upload.single('logFile'), async (req, res) => {
  const fileId = req.file?.filename || '';
  // console.log("upload logs", req.file)

  await logProcessingQueue.add('process-log', {
    fileId,
    filePath: req.file?.path || '',
  });

  res.status(200).json({ jobId: fileId });
});

export default router;
