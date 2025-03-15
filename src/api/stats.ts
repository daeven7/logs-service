import { Router } from 'express';
import supabase from '../supabase';

const router = Router();

// router.get('/stats', async (_, res) => {
//   const { data } = await supabase.from('log_stats').select('*');
//   res.json(data);
// });

router.get('/stats', async (_, res, next) => {
  try {
    const { data } = await supabase.from('log_stats').select('*');
    res.json(data);
  } catch (error) {
    next(error); // Forward errors to the error-handling middleware
  }
});

// router.get('/stats/:jobId', async (req, res) => {
//   const { jobId } = req.params;
//   const { data } = await supabase.from('log_stats').select('*').eq('file_id', jobId);
//   res.json(data);
// });

router.get('/stats/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { data } = await supabase.from('log_stats').select('*').eq('job_id', jobId);
    res.json(data);
  } catch (error) {
    next(error); // Forward the error to the error-handling middleware
  }
});

export default router;
