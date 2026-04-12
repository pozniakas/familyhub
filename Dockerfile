# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Compiled server
COPY --from=builder /app/dist ./dist

# Frontend static files served by Express
COPY index.html manifest.json sw.js ./
COPY css ./css
COPY js ./js
COPY icons ./icons

EXPOSE 3000
CMD ["node", "dist/index.js"]
