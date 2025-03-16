import { QueueEvents, Job, Queue } from "bullmq";
import { WebSocketServer, WebSocket } from "ws";
import supabase from "../supabase";
import { logProcessingQueue } from "./queue";

const queueEvents = new QueueEvents("log-processing-queue");
export const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
  console.log("New client connected");
  broadcast({ event: "client-connectd", msg: "New client connected" });
  ws.on("close", () => console.log("Client disconnected"));
});

queueEvents.on("completed", async ({ jobId }) => {
  try {
    const job = await Job.fromId(logProcessingQueue, jobId);
    if (!job) {
      console.error(`Job ${jobId} not found.`);
      return;
    }

    const { data, error } = await supabase
      .from("log_stats")
      .select("*")
      .eq("file_id", job.data.fileId);

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    if (data && data.length > 0) {
      broadcast({ event: "job-completed", stats: data });
    }
  } catch (err) {
    console.error("Error in completed event handler:", err);
  }
});

queueEvents.on("failed", async ({ jobId, failedReason }) => {
  try {
    const job = await Job.fromId(logProcessingQueue, jobId);
    if (!job) {
      console.error(`Job ${jobId} not found.`);
      return;
    }

    broadcast({
      event: "job-failed",
      jobId,
      fileId: job.data.fileId,
      reason: failedReason,
    });
  } catch (err) {
    console.error("Error in failed event handler:", err);
  }
});

function broadcast(data: Record<string, unknown>) {
  console.log("broadcast called with data", data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
