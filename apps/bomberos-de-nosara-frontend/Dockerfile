# Frontend Dockerfile
FROM node:18

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm install --frozen-lockfile
RUN pnpm --filter bomberos-de-nosara-frontend build

EXPOSE 5173
CMD ["pnpm", "--filter", "bomberos-de-nosara-frontend", "preview", "--host"]
