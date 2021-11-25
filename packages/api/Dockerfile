FROM node:16-alpine AS base
WORKDIR /app/base
COPY package.json .
COPY yarn.lock .
COPY packages/api/package.json packages/api/
RUN yarn install --immutable --immutable-cache --check-cache
COPY base.tsconfig.json .
COPY tsconfig.json .
COPY packages/api/tsconfig.json packages/api/
COPY packages/api/.env packages/api/
COPY packages/api/src packages/api/src
RUN yarn workspace api build

FROM node:16-alpine AS api
WORKDIR /app/api
COPY --from=base /app/base/package.json .
COPY --from=base /app/base/yarn.lock .
COPY --from=base /app/base/packages/api/package.json packages/api/
COPY --from=base /app/base/packages/api/.env . 
COPY --from=base /app/base/packages/api/dist/ packages/api/dist/
ENV NODE_ENV production
RUN yarn install --production
# TODO: Use ENV
EXPOSE 4000 
CMD ["node", "-r", "dotenv/config", "packages/api/dist/index.js"]
