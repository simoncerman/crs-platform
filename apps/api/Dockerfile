FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --filter api

# Copy API source
COPY apps/api ./apps/api

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["pnpm", "run", "dev"]
