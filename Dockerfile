FROM node:20-alpine AS app-files

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY public ./public


FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=app-files /app/package.json ./package.json
COPY --from=app-files /app/server.js ./server.js
COPY --from=app-files /app/public ./public

USER node

EXPOSE 3000

CMD ["node", "server.js"]
