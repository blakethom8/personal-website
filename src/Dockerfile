FROM node:22-alpine AS builder
WORKDIR /app/src
COPY src/package*.json ./
RUN npm ci

WORKDIR /app
COPY content ./content
COPY src ./src

WORKDIR /app/src
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/src
ENV NODE_ENV=production

COPY --from=builder /app/src/.next/standalone ./
COPY --from=builder /app/src/.next/static ./.next/static
COPY --from=builder /app/src/public ./public
COPY --from=builder /app/content ../content

EXPOSE 3000
CMD ["node", "server.js"]
