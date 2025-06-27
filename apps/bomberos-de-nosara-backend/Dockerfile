# Backend Dockerfile
FROM node:18

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --frozen-lockfile
RUN pnpm --filter bomberos-de-nosara-backend build

EXPOSE 3000
CMD ["pnpm", "--filter", "bomberos-de-nosara-backend", "start:prod"]
