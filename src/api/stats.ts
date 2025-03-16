import { Router } from "express";
import supabase from "../supabase";

const router = Router();

router.get("/stats", async (_, res, next) => {
  try {
    const { data } = await supabase.from("log_stats").select("*");
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/stats/:jobId", async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { data } = await supabase
      .from("log_stats")
      .select("*")
      .eq("job_id", jobId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
