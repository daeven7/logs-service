// import { Queue, Worker, 
//     // QueueScheduler
//  } from 'bullmq';
// import { Redis } from 'ioredis';
// import { createClient } from '@supabase/supabase-js';

// const connection = new Redis(process.env.REDIS_URL || '');

// export const logProcessingQueue = new Queue('log-processing-queue', { connection });
// // new QueueScheduler('log-processing-queue', { connection });

// const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');

// const worker = new Worker('log-processing-queue', async (job) => {
//   const { fileId, filePath } = job.data;
//   // Process the file here
//   console.log(`Processing file ${fileId} at ${filePath}`);

//   // Example log processing
//   const logStats = {
//     job_id: job.id,
//     errors: 0,
//     keywords: ['error', 'timeout'],
//     ips: ['192.168.1.1'],
//   };

//   // Store results in Supabase
//   const { error } = await supabase.from('log_stats').insert([logStats]);
//   if (error) {
//     console.error(`Failed to store stats for job ${job.id}: ${error.message}`);
//   }
// }, { connection, concurrency: 4 });

// worker.on('completed', (job) => {
//   console.log(`Job ${job.id} completed`);
// });

// worker.on('failed', (job: any, err) => {
//   console.error(`Job ${job.id} failed: ${err.message}`);
// });