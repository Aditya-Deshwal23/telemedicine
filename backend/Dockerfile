FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build TS
RUN npm run db:generate
RUN npm run build

EXPOSE 5000

# Start script that runs migrations then starts the server
CMD ["sh", "-c", "npm run db:push && npm start"]
