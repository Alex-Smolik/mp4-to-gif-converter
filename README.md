# MP4 to GIF converter service

## Features
- Upload **MP4 (max 1024x768, 10 sec)**
- Convert **MP4 to GIF (-1:400, 5 FPS)**

## Getting Started

You need to install:
- Node.js (**`node -v`** to check if it is installed)
- Angular CLI (**`ng version`** to check if it is installed)
- Docker & Docker Swarm (**`docker --version`** to check if it is installed)

### Project installation
- Download the project
- Open a terminal in it

### Run commands
- `docker build -t gif-converter-backend ./backend`
- `docker build -t gif-converter-worker ./worker`
- `docker stack deploy -c docker-compose.yml gif-converter`

#### For running frontent part run:
- `cd frontend`
- `npm i`
- `ng serve`