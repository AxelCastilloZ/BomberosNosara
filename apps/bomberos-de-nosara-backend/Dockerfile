# Etapa de construcción
FROM node:18 AS builder

WORKDIR /app

# Copiar archivos del monorepo raíz
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copiar el código del monorepo
COPY apps ./apps
COPY shared ./shared

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Construir solo el backend
RUN pnpm --filter bomberos-de-nosara-backend run build

# Etapa de producción
FROM node:18 AS runner

WORKDIR /app

# ⚠️ Habilitar soporte para crypto (necesario con WebCrypto en NestJS)
ENV NODE_OPTIONS="--experimental-global-webcrypto"

# ✅ Copiar build correcta
COPY --from=builder /app/apps/bomberos-de-nosara-backend/dist ./dist

# Copiar package.json del backend
COPY --from=builder /app/apps/bomberos-de-nosara-backend/package.json ./package.json

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependencias de producción
RUN pnpm install --prod

# Exponer el puerto del backend
EXPOSE 3000

# Comando de arranque
CMD ["node", "dist/main"]
