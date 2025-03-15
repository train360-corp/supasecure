# build web components
FROM node:18-alpine AS web-deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY web/package.json web/package-lock.json* ./
RUN npm ci --force

FROM web-deps AS web-builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY web/. .

ENV NEXT_TELEMETRY_DISABLED=1

ARG VERSION

ENV NEXT_PUBLIC_VERSION=$VERSION

ENV SUPABASE_URL=http://127.0.0.1:54321
ENV SUPABASE_ANON_KEY=not-set

RUN npm run build

FROM web-builder AS web
WORKDIR /app

COPY --from=web-builder /app/public ./public
COPY --from=web-builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=web-builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# use supabase as base image
FROM ghcr.io/train360-corp/supabase:6f5c1fc AS supabase

# copy supervisor configurations
COPY /supervisor /etc/supervisor/conf.d

# mount migrations
COPY supabase/migrations /supabase/migrations
ENV AUTO_MIGRATIONS_MODE=mounted

# copy frontend
WORKDIR /supasecure/web
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=web --chown=nextjs:nodejs /app .
ENV WEB_HOSTNAME="0.0.0.0"
ENV WEB_PORT=3030
ENV WEB_NODE_ENV=production
ENV WEB_NEXT_TELEMETRY_DISABLED=1

# set the shell
SHELL ["/bin/bash", "-ec"]