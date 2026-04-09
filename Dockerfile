FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

COPY scripts/entrypoint.sh ./scripts/entrypoint.sh
RUN chmod +x ./scripts/entrypoint.sh

EXPOSE 3333

CMD ["sh", "./scripts/entrypoint.sh"]
