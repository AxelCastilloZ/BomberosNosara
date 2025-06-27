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

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Ejecutar build solo del frontend
RUN pnpm --filter bomberos-de-nosara-frontend run build

# Etapa de producción (sirviendo con Vite Preview)
FROM node:18 AS runner

WORKDIR /app

# Copiar la build generada
COPY --from=builder /app/apps/bomberos-de-nosara-frontend/dist ./dist

# Copiar package.json del frontend
COPY --from=builder /app/apps/bomberos-de-nosara-frontend/package.json ./package.json

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar TODAS las dependencias para que funcione vite preview
RUN pnpm install

# Exponer el puerto de vite preview
EXPOSE 4173

# Comando para servir la app
CMD ["pnpm", "preview", "--host"]
