

// import { Worker, Job } from 'bullmq';
// import fs from 'fs';
// import readline from 'readline';
// import Redis from 'ioredis';
// import supabase from '../supabase';

// interface JobData {
//   fileId: string;
//   filePath: string;
// }

// // Create Redis connection with error handling
// let redis: Redis;
// try {
//   redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
//     maxRetriesPerRequest: null,
//     enableReadyCheck: true,
//   });
//   redis.on('error', (error) => {
//     console.error('Redis connection error:', error);
//   });
// } catch (error) {
//   console.error('Failed to initialize Redis:', error);
//   process.exit(1); // Exit the process if Redis cannot be initialized
// }

// // Worker setup with error handling
// new Worker<JobData>(
//   'log-processing-queue',
//   async (job: Job<JobData>) => {
//     const { fileId, filePath } = job.data;
//     console.log(`Processing job: ${job.id}`);

//     try {
//       // Open the file stream and handle potential file errors
//       if (!fs.existsSync(filePath)) {
//         throw new Error(`File does not exist: ${filePath}`);
//       }

//       const logStream = fs.createReadStream(filePath, 'utf-8');
//       const rl = readline.createInterface({ input: logStream });

//       const logsToInsert = [];
//       const keywords = (process.env.CONFIG_KEYWORDS || '').split(',');

//       try {
//         // Process the file line by line
//         for await (const line of rl) {
//           const match = line.match(/\[(.*?)\] (.*?) (.*?) ({.*})?/);
//           if (!match) continue;

//           const [, timestamp, level, message, jsonPayload] = match;

//           let containsKeyword = false;
//           const matchingKeywords = [];
//           for (const keyword of keywords) {
//             if (message.includes(keyword)) {
//               containsKeyword = true;
//               matchingKeywords.push(keyword);
//             }
//           }

//           // Only store logs with errors or keywords
//           if (level === 'ERROR' || containsKeyword) {
//             let parsedPayload = null;
//             try {
//               if (jsonPayload) {
//                 parsedPayload = JSON.parse(jsonPayload);
//               }
//             } catch (jsonError) {
//               console.error('Error parsing JSON payload:', jsonError, 'Line:', line);
//             }

//             logsToInsert.push({
//               file_id: fileId,
//               // timestamp,
//               level,
//               message,
//               json_payload: parsedPayload,
//               error: level === 'ERROR',
//               keywords: matchingKeywords.join(','),
//               ip_address: parsedPayload?.ip || null,
//             });
//           }
//         }
//       } catch (streamError) {
//         console.error('Error reading the file stream:', streamError);
//         throw streamError;
//       }

//       if (logsToInsert.length > 0) {
//         console.log('Inserting into Supabase:', logsToInsert);

//         // Insert results into Supabase with error handling
//         // const { error: supabaseError } = await supabase.from('log_entries').insert(logsToInsert);
//         const { data, error: supabaseError } = await supabase.from('log_stats').insert(logsToInsert);
//         console.log('Supabase Response:', { data, supabaseError });

//         if (supabaseError) {
//           console.log(supabaseError)
//           console.error('Supabase insert error:', supabaseError);
//           throw supabaseError;
//         }
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
//   }
// ).on('error', (workerError) => {
//   console.error('Worker encountered an error:', workerError);
// });


// #########################################################################################
// import { Worker, Job } from 'bullmq';
// import fs from 'fs';
// import readline from 'readline';
// import Redis from 'ioredis';
// import supabase from '../supabase';

// interface JobData {
//   fileId: string;
//   filePath: string;
// }

// // Create Redis connection with error handling
// let redis: Redis;
// try {
//   redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
//     maxRetriesPerRequest: null,
//     enableReadyCheck: true,
//   });
//   redis.on('error', (error) => {
//     console.error('Redis connection error:', error);
//   });
// } catch (error) {
//   console.error('Failed to initialize Redis:', error);
//   process.exit(1);
// }

// // Worker setup with error handling
// new Worker<JobData>(
//   'log-processing-queue',
//   async (job: Job<JobData>) => {
//     const { fileId, filePath } = job.data;
//     console.log(`Processing job: ${job.id}`);

//     try {
//       // Open the file stream and handle potential file errors
//       if (!fs.existsSync(filePath)) {
//         throw new Error(`File does not exist: ${filePath}`);
//       }

//       const logStream = fs.createReadStream(filePath, 'utf-8');
//       const rl = readline.createInterface({ input: logStream });

//       const logsToInsert = [];
//       const keywords = (process.env.CONFIG_KEYWORDS || 'timeout,connection,error').split(',');

//       try {
//         // Process the file line by line
//         for await (const line of rl) {
//           const match = line.match(/\[(.*?)\] (\w+) (.+?) ({.*})?/);
//           if (!match) continue;

//           const [, timestamp, level, message, jsonPayload] = match;

//           let containsKeyword = false;
//           const matchingKeywords = [];

//           for (const keyword of keywords) {
//             if (message.toLowerCase().includes(keyword.toLowerCase())) {
//               containsKeyword = true;
//               matchingKeywords.push(keyword);
//             }
//           }

//           // Only store logs with errors or keywords
//           if (level === 'ERROR' || containsKeyword) {
//             let parsedPayload = null;
//             let ipAddress = null;

//             try {
//               if (jsonPayload) {
//                 parsedPayload = JSON.parse(jsonPayload);
//                 ipAddress = parsedPayload?.ip || null;
//               }
//             } catch (jsonError) {
//               console.error('Error parsing JSON payload:', jsonError, 'Line:', line);
//             }

//             logsToInsert.push({
//               file_id: fileId,
//               timestamp,
//               level,
//               message,
//               json_payload: parsedPayload,
//               error: level === 'ERROR',
//               keywords: matchingKeywords.join(','),
//               ip_address: ipAddress,
//             });
//           }
//         }
//       } catch (streamError) {
//         console.error('Error reading the file stream:', streamError);
//         throw streamError;
//       }

//       if (logsToInsert.length > 0) {
//         console.log('Inserting into Supabase:', logsToInsert);

//         // Insert results into Supabase with error handling
//         const { data, error: supabaseError } = await supabase.from('log_stats').insert(logsToInsert);
//         console.log('Supabase Response:', { data, supabaseError });

//         if (supabaseError) {
//           console.error('Supabase insert error:', supabaseError);
//           throw supabaseError;
//         }
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
//   }
// ).on('error', (workerError) => {
//   console.error('Worker encountered an error:', workerError);
// });


// #########################################################################################

// import { Worker, Job } from 'bullmq';
// import fs from 'fs';
// import readline from 'readline';
// import Redis from 'ioredis';
// import supabase from '../supabase';

// interface JobData {
//   fileId: string;
//   filePath: string;
// }

// // Create Redis connection with error handling
// let redis: Redis;
// try {
//   redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
//     maxRetriesPerRequest: null,
//     enableReadyCheck: true,
//   });
//   redis.on('error', (error) => {
//     console.error('Redis connection error:', error);
//   });
// } catch (error) {
//   console.error('Failed to initialize Redis:', error);
//   process.exit(1);
// }

// // Worker setup with error handling
// new Worker<JobData>(
//   'log-processing-queue',
//   async (job: Job<JobData>) => {
//     const { fileId, filePath } = job.data;
//     console.log(`Processing job: ${job.id}`);

//     try {
//       // Open the file stream and handle potential file errors
//       if (!fs.existsSync(filePath)) {
//         throw new Error(`File does not exist: ${filePath}`);
//       }

//       const logStream = fs.createReadStream(filePath, 'utf-8');
//       const rl = readline.createInterface({ input: logStream });

//       const logsToInsert = [];
//       const keywords = (process.env.CONFIG_KEYWORDS || 'timeout,connection,error,permissions,unauthorized').split(',');

//       try {
//         // Process the file line by line
//         for await (const line of rl) {
//           const match = line.match(/\[(.*?)\] (\w+) (.*?) ({.*})?/); // Adjusted regex for full message
//           if (!match) continue;

//           console.log(" match ", match)
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
//           if (level === 'ERROR' || containsKeyword) {
//             let parsedPayload = null;
//             let ipAddress = null;

//             try {
//               if (jsonPayload) {
//                 parsedPayload = JSON.parse(jsonPayload);
//                 ipAddress = parsedPayload?.ip || null;
//               }
//             } catch (jsonError) {
//               console.error('Error parsing JSON payload:', jsonError, 'Line:', line);
//             }

//             logsToInsert.push({
//               file_id: fileId,
//               timestamp,
//               level,
//               message,
//               json_payload: parsedPayload,
//               error: level === 'ERROR',
//               keywords: matchingKeywords.join(','),
//               ip_address: ipAddress,
//             });
//           }
//         }
//       } catch (streamError) {
//         console.error('Error reading the file stream:', streamError);
//         throw streamError;
//       }

//       if (logsToInsert.length > 0) {
//         console.log('Inserting into Supabase:', logsToInsert);

//         // Insert results into Supabase with error handling
//         const { data, error: supabaseError } = await supabase.from('log_stats').insert(logsToInsert);
//         console.log('Supabase Response:', { data, supabaseError });

//         if (supabaseError) {
//           console.error('Supabase insert error:', supabaseError);
//           throw supabaseError;
//         }
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
//   }
// ).on('error', (workerError) => {
//   console.error('Worker encountered an error:', workerError);
// });


// #################################################################################

// import { Worker, Job } from 'bullmq';
// import fs from 'fs';
// import readline from 'readline';
// import Redis from 'ioredis';
// import supabase from '../supabase';

// interface JobData {
//   fileId: string;
//   filePath: string;
// }

// // Create Redis connection with error handling
// let redis: Redis;
// try {
//   redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
//     maxRetriesPerRequest: null,
//     enableReadyCheck: true,
//   });
//   redis.on('error', (error) => {
//     console.error('Redis connection error:', error);
//   });
// } catch (error) {
//   console.error('Failed to initialize Redis:', error);
//   process.exit(1);
// }

// // Worker setup with error handling
// new Worker<JobData>(
//   'log-processing-queue',
//   async (job: Job<JobData>) => {
//     const { fileId, filePath } = job.data;
//     console.log(`Processing job: ${job.id}`);

//     try {
//       // Open the file stream and handle potential file errors
//       if (!fs.existsSync(filePath)) {
//         throw new Error(`File does not exist: ${filePath}`);
//       }

//       const logStream = fs.createReadStream(filePath, 'utf-8');
//       const rl = readline.createInterface({ input: logStream });

//       const keywords = (process.env.CONFIG_KEYWORDS || 'timeout,connection,error,permissions,unauthorized').split(',');
//       const batchSize = 100; // Insert logs in batches
//       let logsBatch: any[] = [];

//       const insertLogsBatch = async () => {
//         if (logsBatch.length > 0) {
//           try {
//             console.log('Inserting batch into Supabase:', logsBatch);
//             const { data, error: supabaseError } = await supabase.from('log_stats').insert(logsBatch);

//             if (supabaseError) {
//               console.error('Supabase insert error:', supabaseError);
//               throw supabaseError;
//             }
//             logsBatch = []; // Clear the batch after successful insertion
//           } catch (error) {
//             console.error('Error inserting batch into Supabase:', error);
//             throw error;
//           }
//         }
//       };

//       try {
//         // Process the file line by line
//         for await (const line of rl) {
//           const match = line.match(/\[(.*?)\] (\w+) (.+?) ({.*})?/); // Adjusted regex for full message
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
//           if (level === 'ERROR' || containsKeyword) {
//             let parsedPayload = null;
//             let ipAddress = null;

//             try {
//               if (jsonPayload) {
//                 parsedPayload = JSON.parse(jsonPayload);
//                 ipAddress = parsedPayload?.ip || null;
//               }
//             } catch (jsonError) {
//               console.error('Error parsing JSON payload:', jsonError, 'Line:', line);
//             }

//             logsBatch.push({
//               file_id: fileId,
//               timestamp,
//               level,
//               message,
//               json_payload: parsedPayload,
//               error: level === 'ERROR',
//               keywords: matchingKeywords.join(','),
//               ip_address: ipAddress,
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
//         console.error('Error reading the file stream:', streamError);
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
//   }
// ).on('error', (workerError) => {
//   console.error('Worker encountered an error:', workerError);
// });


// #########################################################################################

import { Worker, Job } from 'bullmq';
import fs from 'fs';
import readline from 'readline';
import Redis from 'ioredis';
import supabase from '../supabase';
import dotenv from 'dotenv';
dotenv.config();

interface JobData {
  fileId: string;
  filePath: string;
}

// Create Redis connection with error handling
let redis: Redis;
try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });
  redis.on('error', (error) => {
    console.error('Redis connection error:', error);
  });
} catch (error) {
  console.error('Failed to initialize Redis:', error);
  process.exit(1);
}

// Worker setup with error handling
new Worker<JobData>(
  'log-processing-queue',
  async (job: Job<JobData>) => {
    const { fileId, filePath } = job.data;
    console.log(`Processing job: ${job.id}`);

    try {
      // Open the file stream and handle potential file errors
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }

      const logStream = fs.createReadStream(filePath, 'utf-8');
      const rl = readline.createInterface({ input: logStream });

      // const keywords = (process.env.CONFIG_KEYWORDS || 'timeout,connection,error,permissions,unauthorized').split(',');
      if(!process.env.CONFIG_KEYWORDS)
        throw new Error("Keywords not defined in env")

      const keywords = (process.env.CONFIG_KEYWORDS).split(',');
      const batchSize = 100; // Insert logs in batches
      let logsBatch: any[] = [];

      const insertLogsBatch = async () => {
        if (logsBatch.length > 0) {
          try {
            console.log('Inserting batch into Supabase:', logsBatch);
            const { data, error: supabaseError } = await supabase.from('log_stats').insert(logsBatch);

            if (supabaseError) {
              console.error('Supabase insert error:', supabaseError);
              throw supabaseError;
            }
            logsBatch = []; // Clear the batch after successful insertion
          } catch (error) {
            console.error('Error inserting batch into Supabase:', error);
            throw error;
          }
        }
      };

      try {
        // Process the file line by line
        for await (const line of rl) {
          const match = line.match(/\[(.*?)\] (\w+) (.*?) \{(.*?)\}/); // Updated regex for full message and JSON payload
          if (!match) continue;
          const [, timestamp, level, message, jsonPayload] = match;

          let containsKeyword = false;
          const matchingKeywords = [];

          // Check for keywords in the message
          for (const keyword of keywords) {
            if (message.toLowerCase().includes(keyword.toLowerCase())) {
              containsKeyword = true;
              matchingKeywords.push(keyword);
            }
          }

          // Only store logs with errors or keywords
          if (level === 'ERROR' || containsKeyword) {
            let parsedPayload = null;
            let ipAddress = null;

            try {
              if (jsonPayload) {
                parsedPayload = JSON.parse('{' + jsonPayload + '}'); // Properly parse the JSON part
                ipAddress = parsedPayload?.ip || null;
              }
            } catch (jsonError) {
              console.error('Error parsing JSON payload:', jsonError, 'Line:', line);
            }

            logsBatch.push({
              file_id: fileId,
              timestamp,
              level,
              message,
              json_payload: parsedPayload,
              error: level === 'ERROR',
              keywords: matchingKeywords.join(','),
              ip_address: ipAddress,
              user_Id: parsedPayload?.userId || null, // Extract userId from parsed JSON
            });

            // Insert logs when batch size is reached
            if (logsBatch.length >= batchSize) {
              await insertLogsBatch();
            }
          }
        }

        // Insert any remaining logs
        await insertLogsBatch();
      } catch (streamError) {
        console.error('Error reading the file stream:', streamError);
        throw streamError;
      }

      console.log(`Job ${job.id} completed successfully.`);
    } catch (jobError) {
      console.error(`Error processing job ${job.id}:`, jobError);
      throw jobError; // Fail the job in BullMQ
    }
  },
  {
    concurrency: 4,
    connection: redis, // Pass ioredis connection here
  }
).on('error', (workerError) => {
  console.error('Worker encountered an error:', workerError);
});
