# Showcraft Live (v2.3.0) — Stateless Cloud Run / Railway / Fly.io Container
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY server.mjs ./
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3456

EXPOSE 3456

CMD ["node", "server.mjs"]
