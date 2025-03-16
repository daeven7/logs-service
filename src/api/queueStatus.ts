import { Router } from "express";
import { logProcessingQueue } from "../queue/queue";

const router = Router();

router.get("/queue-status", async (_, res, next) => {
  try {
    const status = await logProcessingQueue.getJobCounts();
    res.json(status);
  } catch (error) {
    next(error);
  }
});

export default router;
