FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose port (informational; platform sets actual mapping)
EXPOSE 8080

# Use environment PORT if provided by platform
ENV NODE_ENV=production

# Start the server
CMD ["node", "app.js"]


