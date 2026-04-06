FROM node:18-alpine

RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    bash

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]