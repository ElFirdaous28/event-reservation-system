FROM node:20-alpine

WORKDIR /app
RUN npm install -g pnpm

COPY . .

RUN pnpm install
RUN pnpm --filter @repo/shared build
RUN pnpm --filter web build

EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]
