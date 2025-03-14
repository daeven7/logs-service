
import { QueueEvents, Job, Queue  } from 'bullmq';
import { WebSocketServer, WebSocket } from 'ws';
import supabase from '../supabase';
import { logProcessingQueue } from './queue';

const queueEvents = new QueueEvents('log-processing-queue');
export const wss = new WebSocketServer({ noServer: true });

// const queue = new Queue('log-processing-queue');

// Log when a new client connects
wss.on('connection', (ws) => {
  console.log('New client connected');
  broadcast({ event: 'client-connectd', msg: 'New client connected'  })
  ws.on('close', () => console.log('Client disconnected'));
});

// Handle BullMQ events
// queueEvents.on('completed', async ({ jobId }) => {
//   try {
//     console.log("queue event completed")
//     const { data, error } = await supabase.from('log_stats').select('*').eq('file_id', jobId);
//     console.log("queue event completed",data,error, jobId)
//     if (error) {
//       console.error('Supabase error:', error);
//       return;
//     }
//     if (data && data.length > 0) {
//       broadcast({ event: 'job-completed', stats: data[0] });
//     }
//   } catch (err) {
//     console.error('Error in completed event handler:', err);
//   }
// });

queueEvents.on('completed', async ({ jobId }) => {
  try {
    // Fetch job data
    const job = await Job.fromId(logProcessingQueue, jobId);
    if (!job) {
      console.error(`Job ${jobId} not found.`);
      return;
    }

    // Fetch stats from Supabase
    const { data, error } = await supabase
      .from('log_stats')
      .select('*')
      .eq('file_id', job.data.fileId);

    if (error) {
      console.error('Supabase error:', error);
      return;
    }

    if (data && data.length > 0) {
      broadcast({ event: 'job-completed', stats: data });
    }
  } catch (err) {
    console.error('Error in completed event handler:', err);
  }
});

// queueEvents.on('failed', ({ jobId, failedReason }) => {
//   broadcast({ event: 'job-failed', jobId, reason: failedReason });
// });

queueEvents.on('failed', async ({ jobId, failedReason }) => {
  try {
    // Fetch job data
    const job = await Job.fromId(logProcessingQueue, jobId);
    if (!job) {
      console.error(`Job ${jobId} not found.`);
      return;
    }

    // Broadcast failure event
    broadcast({
      event: 'job-failed',
      jobId,
      fileId: job.data.fileId,
      reason: failedReason,
    });
  } catch (err) {
    console.error('Error in failed event handler:', err);
  }
});

// Broadcast to all connected clients
function broadcast(data: Record<string, unknown>) {
  console.log("broadcast called with data", data)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
