# 🎥 GIF Converter Service

A scalable and reliable web service that converts **MP4 videos** to **GIF animations** using **Node.js, Redis, and FFmpeg**.  
Built for **high-load environments** with **Docker Swarm**.

---

## 🚀 Features
- ✅ Upload **MP4 (max 1024x768, 10 sec)**
- ✅ Convert **MP4 to GIF (-1:400, 5 FPS)**
- ✅ Scalable **multi-worker architecture**
- ✅ Queue-based processing (**Redis + BullMQ**)
- ✅ Fully containerized with **Docker Swarm**
- ✅ Supports **multi-user concurrent uploads**
- ✅ Built-in **processing timeout (5 sec - 5 min)**
- ✅ Reverse proxy support (**NGINX**)
- ✅ Production-ready **HTTPS & auto-deploy**

---

## 🛠️ Development Setup

### 1️⃣ Install dependencies
Ensure you have **Docker & Docker Swarm** installed:
```bash
docker --version  # Check if Docker is installed
