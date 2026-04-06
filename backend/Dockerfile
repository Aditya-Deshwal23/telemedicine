FROM node:18-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

ENV PORT=5000

EXPOSE 5000

CMD ["sh", "-c", "node dist/index.js"]