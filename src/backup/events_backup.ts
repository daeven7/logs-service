// import { QueueEvents } from 'bullmq';
// import { WebSocketServer } from 'ws';
// import supabase from '../supabase';

// const queueEvents = new QueueEvents('log-processing-queue');
// export const wss = new WebSocketServer({ noServer: true });

// queueEvents.on('completed', async ({ jobId }) => {
//   const { data } = await supabase.from('log_stats').select('*').eq('file_id', jobId);
//   if (data && data.length > 0) {
//     broadcast({ event: 'job-completed', stats: data[0] });
//   }
// });

// queueEvents.on('failed', ({ jobId, failedReason }) => {
//   broadcast({ event: 'job-failed', jobId, reason: failedReason });
// });

// function broadcast(data: Record<string, unknown>) {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocketServer.OPEN) {
//       client.send(JSON.stringify(data));
//     }
//   });
// }


// import { QueueEvents } from 'bullmq';
// import { WebSocketServer, WebSocket } from 'ws'; // Import WebSocket
// import supabase from '../supabase';

// const queueEvents = new QueueEvents('log-processing-queue');
// export const wss = new WebSocketServer({ noServer: true });

// wss.on('connection', (ws) => {
//   console.log('New client connected');
//   ws.on('close', () => console.log('Client disconnected'));
// });

// queueEvents.on('completed', async ({ jobId }) => {
//   const { data } = await supabase.from('log_stats').select('*').eq('file_id', jobId);
//   if (data && data.length > 0) {
//     broadcast({ event: 'job-completed', stats: data[0] });
//   }
// });

// queueEvents.on('failed', ({ jobId, failedReason }) => {
//   broadcast({ event: 'job-failed', jobId, reason: failedReason });
// });

// function broadcast(data: Record<string, unknown>) {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) { // Use WebSocket.OPEN
//       client.send(JSON.stringify(data));
//     }
//   });
// }


import { QueueEvents } from 'bullmq';
import { WebSocketServer, WebSocket } from 'ws';
import supabase from '../supabase';

const queueEvents = new QueueEvents('log-processing-queue');
export const wss = new WebSocketServer({ noServer: true });

// Log when a new client connects
wss.on('connection', (ws) => {
  console.log('New client connected');
  broadcast({ event: 'client-connectd', msg: 'New client connected'  })
  ws.on('close', () => console.log('Client disconnected'));
});

// Handle BullMQ events
queueEvents.on('completed', async ({ jobId }) => {
  try {
    console.log("queue event completed")
    const { data, error } = await supabase.from('log_stats').select('*').eq('file_id', jobId);
    console.log("queue event completed",data,error, jobId)
    if (error) {
      console.error('Supabase error:', error);
      return;
    }
    if (data && data.length > 0) {
      broadcast({ event: 'job-completed', stats: data[0] });
    }
  } catch (err) {
    console.error('Error in completed event handler:', err);
  }
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  broadcast({ event: 'job-failed', jobId, reason: failedReason });
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
