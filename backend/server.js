const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { Queue } = require("bullmq");
const Redis = require("ioredis");
const http = require("http");
const { Server } = require("socket.io");

const rateLimit = require("express-rate-limit");
const app = express();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const ffmpeg = require("fluent-ffmpeg");

app.use(cors());
app.use("/app/uploads", express.static(path.join(__dirname, "uploads")));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: "Too many requests, please try again later."
});

app.use(limiter);

const redisConnection = new Redis({ 
  host: "redis", 
  port: 6379, 
  maxRetriesPerRequest: null 
});

const redisSubscriber = new Redis({ 
  host: "redis", 
  port: 6379 
});

const conversionQueue = new Queue("conversionQueue", { connection: redisConnection });

const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;

  ffmpeg.ffprobe(filePath, async (err, metadata) => {
    if (err) {
      console.error("FFmpeg error:", err);
      return res.status(500).json({ error: "Error analyzing video" });
    }

    const { width, height } = metadata.streams.find(s => s.codec_type === "video") || {};
    const duration = metadata.format.duration;

    if (width > 1024 || height > 768) {
      return res.status(400).json({ error: "Video resolution exceeds 1024x768" });
    }

    if (duration > 10) {
      return res.status(400).json({ error: "Video length exceeds 10 seconds" });
    }

    const job = await conversionQueue.add("convert", { filePath });

    io.emit("job-added", { jobId: job.id, filename: req.file.filename });

    res.json({ message: "File uploaded, processing started...", jobId: job.id });
  });
});

redisSubscriber.subscribe("job-completed");
redisSubscriber.on("message", (channel, message) => {
  if (channel === "job-completed") {
    const jobData = JSON.parse(message);
    io.emit("job-completed", jobData);
  }
});

io.on("connection", (socket) => {
  console.log("Client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
