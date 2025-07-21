# Frontend Dockerfile for ARM64 architecture
FROM node:18-alpine AS base

# Set platform for ARM64 compatibility
ARG TARGETPLATFORM
ARG BUILDPLATFORM
RUN echo "Building on $BUILDPLATFORM, targeting $TARGETPLATFORM"

# Install system dependencies for ARM64
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    curl \
    wget \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with ARM64 optimizations
RUN npm ci --only=production --no-audit --no-fund \
    && npm cache clean --force

# Development dependencies for building
FROM base AS dev-deps
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund \
    && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dev dependencies
COPY --from=dev-deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments
ARG NODE_ENV=production
ARG NEXT_PUBLIC_STRAPI_API_URL
ARG NEXT_PUBLIC_STRAPI_URL
ARG NEXT_PUBLIC_SITE_URL

# Environment variables for build
ENV NODE_ENV=$NODE_ENV
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_STRAPI_API_URL=$NEXT_PUBLIC_STRAPI_API_URL
ENV NEXT_PUBLIC_STRAPI_URL=$NEXT_PUBLIC_STRAPI_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Build the application
RUN npm run build

# Production image
FROM base AS production
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Create necessary directories
RUN mkdir -p .next /app/logs \
    && chown -R nextjs:nodejs .next /app/logs

# Copy built application with proper ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create health check endpoint
RUN echo '{"status":"ok","timestamp":"'$(date -Iseconds)'"}' > ./public/health.json

# Switch to non-root user
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health.json || exit 1

# Expose port
EXPOSE 3000

# Environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]