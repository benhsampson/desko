FROM node:16-alpine
ENV NODE_ENV=production
RUN apk add --no-cache rsync

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --production


