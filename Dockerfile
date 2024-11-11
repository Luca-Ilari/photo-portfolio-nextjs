# Install dependencies only when needed
FROM node:20.12.2-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Rebuild the source code only when needed
FROM node:20.12.2-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM node:20.12.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# If you are using a reverse proxy, this is required
ENV PORT 3000

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
