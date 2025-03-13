import { Router } from 'express';
import { logProcessingQueue } from '../queue/queue';

const router = Router();

router.get('/queue-status', async (_, res) => {
  const status = await logProcessingQueue.getJobCounts();
  res.json(status);
});

export default router;
