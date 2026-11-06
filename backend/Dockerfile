# Node.js Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start server
CMD ["node", "server.js"]
