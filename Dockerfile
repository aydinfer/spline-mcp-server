FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .

ENTRYPOINT ["node", "src/index.js"]
