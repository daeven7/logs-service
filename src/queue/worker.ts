// import { Worker, Job } from "bullmq";
// import fs from "fs";
// import readline from "readline";
// import axios from "axios"; 
// import Redis from "ioredis";
// import supabase from "../supabase";
// import dotenv from "dotenv";
// dotenv.config();

// interface JobData {
//   fileId: string;
//   filePath: string; 
// }

// let redis: Redis;
// try {
//   redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
//     maxRetriesPerRequest: null,
//     enableReadyCheck: true,
//   });
//   redis.on("error", (error) => {
//     console.error("Redis connection error:", error);
//   });
// } catch (error) {
//   console.error("Failed to initialize Redis:", error);
//   process.exit(1);
// }

// // Worker setup with error handling
// new Worker<JobData>(
//   "log-processing-queue",
//   async (job: Job<JobData>) => {
//     const { fileId, filePath } = job.data;
//     console.log(`Processing job: ${job.id}`);

//     try {
//       // Download the file from Supabase Storage
//       const { data: signedUrlData, error: signedUrlError } =
//         await supabase.storage
//           .from("logs") // Replace 'logs' with your Supabase bucket name
//           .createSignedUrl(filePath, 60 * 60); // Signed URL valid for 1 hour

//       if (signedUrlError || !signedUrlData) {
//         throw new Error("Failed to generate signed URL for file");
//       }

//       const fileStream = await axios.get(signedUrlData.signedUrl, {
//         responseType: "stream",
//       });

//       const rl = readline.createInterface({ input: fileStream.data });

//       if (!process.env.CONFIG_KEYWORDS)
//         throw new Error("Keywords not defined in env");

//       const keywords = process.env.CONFIG_KEYWORDS.split(",");
//       const batchSize = 100; // Insert logs in batches
//       let logsBatch: any[] = [];

//       const insertLogsBatch = async () => {
//         if (logsBatch.length > 0) {
//           try {
//             console.log("Inserting batch into Supabase:", logsBatch);
//             const { data, error: supabaseError } = await supabase
//               .from("log_stats")
//               .insert(logsBatch);

//             if (supabaseError) {
//               console.error("Supabase insert error:", supabaseError);
//               throw supabaseError;
//             }
//             logsBatch = []; // Clear the batch after successful insertion
//           } catch (error) {
//             console.error("Error inserting batch into Supabase:", error);
//             throw error;
//           }
//         }
//       };

//       try {
//         // Process the file line by line
//         for await (const line of rl) {
//           const match = line.match(/\[(.*?)\] (\w+) (.*?) \{(.*?)\}/); // Updated regex for full message and JSON payload
//           if (!match) continue;
//           const [, timestamp, level, message, jsonPayload] = match;

//           let containsKeyword = false;
//           const matchingKeywords = [];

//           // Check for keywords in the message
//           for (const keyword of keywords) {
//             if (message.toLowerCase().includes(keyword.toLowerCase())) {
//               containsKeyword = true;
//               matchingKeywords.push(keyword);
//             }
//           }

//           // Only store logs with errors or keywords
//           if (level === "ERROR" || containsKeyword) {
//             let parsedPayload = null;
//             let ipAddress = null;

//             try {
//               if (jsonPayload) {
//                 parsedPayload = JSON.parse("{" + jsonPayload + "}"); // Properly parse the JSON part
//                 ipAddress = parsedPayload?.ip || null;
//               }
//             } catch (jsonError) {
//               console.error(
//                 "Error parsing JSON payload:",
//                 jsonError,
//                 "Line:",
//                 line
//               );
//             }

//             logsBatch.push({
//               file_id: fileId,
//               timestamp,
//               level,
//               message,
//               json_payload: parsedPayload,
//               error: level === "ERROR",
//               keywords: matchingKeywords.join(","),
//               ip_address: ipAddress,
//               user_Id: parsedPayload?.userId || null, // Extract userId from parsed JSON
//             });

//             // Insert logs when batch size is reached
//             if (logsBatch.length >= batchSize) {
//               await insertLogsBatch();
//             }
//           }
//         }

//         // Insert any remaining logs
//         await insertLogsBatch();
//       } catch (streamError) {
//         console.error("Error reading the file stream:", streamError);
//         throw streamError;
//       }

//       console.log(`Job ${job.id} completed successfully.`);
//     } catch (jobError) {
//       console.error(`Error processing job ${job.id}:`, jobError);
//       throw jobError; // Fail the job in BullMQ
//     }
//   },
//   {
//     concurrency: 4,
//     connection: redis, // Pass ioredis connection here
//     limiter: {
//       max: 5, // Maximum number of jobs processed per interval
//       duration: 1000, // Interval duration in milliseconds
//     },
 
//   }
// ).on("error", (workerError) => {
//   console.error("Worker encountered an error:", workerError);
// });



import { Worker, Job } from "bullmq";
import fs from "fs";
import readline from "readline";
import axios from "axios";
import Redis from "ioredis";
import supabase from "../supabase";
import dotenv from "dotenv";
import cluster from "cluster";
import os from "os";

dotenv.config();

interface JobData {
  fileId: string;
  filePath: string;
}

if (cluster.isPrimary) {
  // Master process logic
  const numCPUs = os.cpus().length;
  console.log(`Master process is running. Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Worker ${worker.process.pid} exited with code ${code}, signal ${signal}`
    );
    console.log("Starting a new worker...");
    cluster.fork(); // Restart the worker
  });
} else {
  // Worker process logic
  let redis: Redis;
  try {
    // redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    //   maxRetriesPerRequest: null,
    //   enableReadyCheck: true,
    // });
    redis = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });
    redis.on("error", (error) => {
      console.error("Redis connection error:", error);
    });
  } catch (error) {
    console.error("Failed to initialize Redis:", error);
    process.exit(1);
  }

  new Worker<JobData>(
    "log-processing-queue",
    async (job: Job<JobData>) => {
      const { fileId, filePath } = job.data;
      console.log(
        `Worker ${process.pid} processing job: ${job.id} (File ID: ${fileId})`
      );

      try {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("logs") // Replace 'logs' with your Supabase bucket name
            .createSignedUrl(filePath, 60 * 60); // Signed URL valid for 1 hour

        if (signedUrlError || !signedUrlData) {
          throw new Error("Failed to generate signed URL for file");
        }

        const fileStream = await axios.get(signedUrlData.signedUrl, {
          responseType: "stream",
        });

        const rl = readline.createInterface({ input: fileStream.data });

        if (!process.env.CONFIG_KEYWORDS)
          throw new Error("Keywords not defined in env");

        const keywords = process.env.CONFIG_KEYWORDS.split(",");
        const batchSize = 100; // Insert logs in batches
        let logsBatch: any[] = [];

        const insertLogsBatch = async () => {
          if (logsBatch.length > 0) {
            try {
              console.log("Inserting batch into Supabase:", logsBatch);
              const { data, error: supabaseError } = await supabase
                .from("log_stats")
                .insert(logsBatch);

              if (supabaseError) {
                console.error("Supabase insert error:", supabaseError);
                throw supabaseError;
              }
              logsBatch = []; // Clear the batch after successful insertion
            } catch (error) {
              console.error("Error inserting batch into Supabase:", error);
              throw error;
            }
          }
        };

        for await (const line of rl) {
          const match = line.match(/\[(.*?)\] (\w+) (.*?) \{(.*?)\}/);
          if (!match) continue;
          const [, timestamp, level, message, jsonPayload] = match;

          let containsKeyword = false;
          const matchingKeywords = [];

          for (const keyword of keywords) {
            if (message.toLowerCase().includes(keyword.toLowerCase())) {
              containsKeyword = true;
              matchingKeywords.push(keyword);
            }
          }

          if (level === "ERROR" || containsKeyword) {
            let parsedPayload = null;
            let ipAddress = null;

            try {
              if (jsonPayload) {
                parsedPayload = JSON.parse("{" + jsonPayload + "}");
                ipAddress = parsedPayload?.ip || null;
              }
            } catch (jsonError) {
              console.error("Error parsing JSON payload:", jsonError, "Line:", line);
            }

            logsBatch.push({
              file_id: fileId,
              timestamp,
              level,
              message,
              json_payload: parsedPayload,
              error: level === "ERROR",
              keywords: matchingKeywords.join(","),
              ip_address: ipAddress,
              user_id: parsedPayload?.userId || null,
              job_id: job.id
            });

            if (logsBatch.length >= batchSize) {
              await insertLogsBatch();
            }
          }
        }

        await insertLogsBatch();
        console.log(`Job ${job.id} completed successfully.`);
      } catch (jobError) {
        console.error(`Error processing job ${job.id}:`, jobError);
        throw jobError;
      }
    },
    {
      concurrency: 4,
      connection: redis,
      limiter: {
        max: 5,
        duration: 1000,
      },
    }
  ).on("error", (workerError) => {
    console.error("Worker encountered an error:", workerError);
  });

  console.log(`Worker process ${process.pid} is ready.`);
}
