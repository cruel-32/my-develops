FROM node:22-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
# Install pnpm and turbo globally
RUN npm install -g pnpm turbo@^2
COPY . .

# Generate a partial monorepo with a pruned lockfile for backend workspace
RUN turbo prune backend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm run build

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Copy built application
COPY --from=installer --chown=nodejs:nodejs /app/apps/backend/dist ./apps/backend/dist
COPY --from=installer --chown=nodejs:nodejs /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=installer --chown=nodejs:nodejs /app/node_modules ./node_modules

# Set working directory to backend
WORKDIR /app/apps/backend

# Set environment variables for backend
ENV PORT=4000
ENV HOST=0.0.0.0

EXPOSE 4000

CMD ["node", "dist/index.js"]
