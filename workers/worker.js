const { Worker } = require("bullmq");
const Redis = require("ioredis");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

const redisConnection = new Redis({ 
  host: "redis", 
  port: 6379, 
  maxRetriesPerRequest: null 
});

const redisPublisher = new Redis({ 
  host: "redis", 
  port: 6379 
});

const minProcessingTime = 5000;
const maxProcessingTime = 300000;

const worker = new Worker(
  "conversionQueue",
  async (job) => {
    console.log(`Processing file: ${job.data.filePath}`);

    const inputFilePath = path.resolve("/app/uploads", path.basename(job.data.filePath));
    const outputFilePath = inputFilePath.replace(".mp4", ".gif");

    if (!fs.existsSync(inputFilePath)) {
      console.error("File not found:", inputFilePath);

      redisPublisher.publish("job-failed", JSON.stringify({
        jobId: job.id,
        error: "File not found. Please try again."
      }));

      return;
    }

    let ffmpegProcess;
    const abortController = new AbortController();
    const processingTimeout = setTimeout(() => {
      console.error(`Processing timeout! Job ${job.id} took too long.`);

      if (ffmpegProcess) {
        ffmpegProcess.kill("SIGKILL");
        console.error(`FFmpeg process killed for job ${job.id}`);
      }

      redisPublisher.publish("job-failed", JSON.stringify({
        jobId: job.id,
        error: "Processing time exceeded 5 minutes. Conversion stopped."
      }));

      abortController.abort();
    }, maxProcessingTime);

    const startTime = Date.now();

    try {
      await new Promise((resolve, reject) => {
        ffmpegProcess = ffmpeg(inputFilePath)
          .outputOptions([
            "-vf", "scale=-1:400",
            "-r 5",
            "-preset ultrafast",
          ])
          .toFormat("gif")
          .on("end", () => {
            clearTimeout(processingTimeout);

            const processingTime = Date.now() - startTime;
            const remainingWaitTime = Math.max(minProcessingTime - processingTime, 0);

            console.log(`File converted: ${outputFilePath}`);

            setTimeout(() => {
              redisPublisher.publish("job-completed", JSON.stringify({
                jobId: job.id,
                outputPath: outputFilePath
              }));

              fs.unlinkSync(inputFilePath);
              resolve();
            }, remainingWaitTime);
          })
          .on("error", (err) => {
            clearTimeout(processingTimeout);
            console.error("FFmpeg error:", err);
            redisPublisher.publish("job-failed", JSON.stringify({
              jobId: job.id,
              error: "Conversion failed."
            }));
            reject(err);
          })
          .save(outputFilePath);
      });

      redisPublisher.publish("job-completed", JSON.stringify({ jobId: job.id, outputPath: outputFilePath }));
    } catch (error) {
      console.error("Error processing file:", error);
    }
  },
  { connection: redisConnection }
);

console.log("Worker started, waiting for jobs...");
