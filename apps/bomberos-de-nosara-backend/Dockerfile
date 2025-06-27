FROM node:18 AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./ 
COPY apps ./apps 
COPY shared ./shared
COPY tsconfig.base.json ./

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
RUN pnpm --filter bomberos-de-nosara-backend run build

FROM node:18 AS runner

WORKDIR /app

# Agregá esta línea 👇
ENV NODE_OPTIONS="--experimental-global-webcrypto"

COPY --from=builder /app/apps/bomberos-de-nosara-backend/dist ./dist
COPY --from=builder /app/apps/bomberos-de-nosara-backend/package.json ./package.json

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --prod

CMD ["node", "dist/main"]
