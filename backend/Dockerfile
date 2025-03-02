FROM node:18

WORKDIR /app

# Устанавливаем зависимости проекта
COPY package*.json ./
RUN npm install

# Копируем весь код
COPY . .

# Устанавливаем FFmpeg внутри контейнера
RUN apt-get update && apt-get install -y ffmpeg
RUN mkdir -p uploads

# Открываем порт 3000
EXPOSE 3000

# Запускаем сервер
CMD ["node", "server.js"]
