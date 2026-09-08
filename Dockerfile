FROM node:24.11.0-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY public ./public
COPY src ./src
COPY db ./db
COPY scripts ./scripts
COPY server.mjs ./
RUN node scripts/build.mjs && mkdir -p /app/data/evidence-v2 /app/.secrets && chown -R node:node /app
USER node
ENV NODE_ENV=production APP_MODE=evaluation PORT=3000 HOST=0.0.0.0
EXPOSE 3000
CMD ["node", "server.mjs"]
