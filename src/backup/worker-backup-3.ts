
import { Worker, Job } from 'bullmq';
import fs from 'fs';
import readline from 'readline';
import Redis from 'ioredis';
import supabase from '../supabase';

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

      const keywords = (process.env.CONFIG_KEYWORDS || 'timeout,connection,error,permissions,unauthorized').split(',');
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
          const match = line.match(/\[(.*?)\] (\w+) (.+?) ({.*})?/); // Adjusted regex for full message
          if (!match) continue;
          const [, timestamp, level, message, jsonPayload] = match;

          // const match = line.match(/\[(.*?)\] (\w+) (.*?) \{(.*?)\}/g)
          // if (!match) continue;
          
          // const timestamp = match[1];
          // const level = match[2];
          // const message = match[3];
          // // const jsonPayload = JSON.parse('{' + match[4] + '}');  // Parse the JSON part
          // // const jsonPayload='{''userId':'9', 'ip':"989"}
          // // const jsonPayload = JSON.parse('{' + {'userId':'9', 'ip':"989"} + '}')

          // // Extract the userId and ip from the JSON
          // const { userId, ip } = jsonPayload;
          // console.log("xxxxxxxxxx", {
          //   timestamp,
          //   level,
          //   message,
          //   jsonPayload,
          //   userId,
          //   ip
          // })

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
                parsedPayload = JSON.parse(jsonPayload);
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
