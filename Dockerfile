# ---- 1) Base deps with pnpm (Node 22.18.0) ----
FROM node:22.18.0-slim AS deps
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm \
    PNPM_STORE_DIR=/pnpm-store
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate \
    && mkdir -p "$PNPM_HOME" "$PNPM_STORE_DIR"

# Copy lockfiles for reproducible installs
# (include pnpm-workspace.yaml/.npmrc if you use them)
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./

# Prefetch dependencies into the global store (no node_modules yet)
RUN pnpm fetch


# ---- 2) Builder: install (+prefer-offline) + build Next.js standalone ----
FROM node:22.18.0-slim AS builder
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm \
    PNPM_STORE_DIR=/pnpm-store
WORKDIR /app

# Enable pnpm and restore the fetched store
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate \
    && mkdir -p "$PNPM_HOME" "$PNPM_STORE_DIR"

COPY --from=deps /pnpm-store /pnpm-store
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./

# Install node_modules from the fetched store, locked (but allow fallback)
# NOTE: prefer-offline prevents hard fail if a tarball wasn't fetched
RUN pnpm install --frozen-lockfile --prefer-offline

# Copy the rest of your source
COPY . .

# Build (make sure next.config.js has `output: 'standalone'`)
RUN pnpm build


# ---- 3) Runner: PM2-managed, minimal, non-root ----
FROM node:22.18.0-slim AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3005 \
    HOSTNAME=0.0.0.0

# Lightweight utils (curl for healthcheck) + PM2
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && npm i -g pm2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the Next.js standalone server & static assets
# .next/standalone contains server.js + app files + a minimal node_modules
COPY --from=builder /app/.next/standalone ./ 
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY ecosystem.config.js ./ecosystem.config.js



COPY --chown=node:node docker-entry.sh ./docker-entry.sh
RUN chmod +x ./docker-entry.sh

# Drop privileges (image provides user "node")
USER node

EXPOSE 3005

# Use the deploy script as the container entrypoint
ENTRYPOINT ["/app/docker-entry.sh"]
