FROM node:20-alpine

WORKDIR /app
RUN npm install -g pnpm

COPY . .

RUN pnpm install

# Build shared + api
RUN pnpm --filter @repo/shared build
RUN pnpm --filter api build

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
