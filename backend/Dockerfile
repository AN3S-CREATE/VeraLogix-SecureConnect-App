FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/src/db/migrations ./dist/db/migrations
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh && chown -R app:app /app
USER app
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
