# syntax=docker/dockerfile:experimental
FROM node:12.22-alpine AS builder

RUN apk add --no-cache python make g++

WORKDIR /app

COPY package.json yarn.lock tsconfig.base.json tsconfig.production.json ./
COPY src ./src
COPY typings ./typings

RUN --mount=type=secret,id=npmrc,dst=/app/.npmrc --mount=type=cache,sharing=private,target=/usr/local/share/.cache/yarn/v6 \
	yarn install && yarn build:prod

FROM node:12.22-alpine

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/dist ./dist

RUN --mount=type=secret,id=npmrc,dst=/app/.npmrc --mount=type=cache,sharing=private,target=/usr/local/share/.cache/yarn/v6 \
	apk add --no-cache --virtual .gyp python make g++ && \
	yarn install --production &&\
	apk del .gyp

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD node dist/main.js
