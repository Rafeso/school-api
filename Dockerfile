FROM node:22-alpine AS base

RUN apk update && apk add --no-cache curl
RUN npm i -g npm && npm i -g pm2

FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 fastify
USER fastify

COPY --from=builder --chown=fastify:nodejs /app/build ./build
COPY --from=builder --chown=fastify:nodejs /app/ecosystem.config.json ./

EXPOSE 3000

CMD ["pm2-runtime","ecosystem.config.json"]

