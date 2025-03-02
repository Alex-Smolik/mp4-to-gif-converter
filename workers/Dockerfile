# Use Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the worker script
COPY . .

RUN apt-get update && apt-get install -y ffmpeg

# Start the worker
CMD ["node", "worker.js"]
