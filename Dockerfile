FROM node:22-alpine
FROM node:22-alpine

WORKDIR /app

# Install deps first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app
COPY src ./src
COPY docs ./docs
COPY docs ./docs

ENV NODE_ENV=production
EXPOSE 4000

# run migrations then start server
CMD ["sh", "-c", "node src/migrate.js && node src/index.js"]
