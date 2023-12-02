FROM node:20-alpine AS bootstrap

WORKDIR /build
COPY . .
RUN npm ci && npm run build
RUN rm -rf node_modules
RUN npm ci --omit=dev

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

FROM node:20-alpine AS lambda

RUN apk add curl
WORKDIR /lambda
COPY --from=bootstrap /build/dist .
COPY --from=bootstrap /build/node_modules ./node_modules

HEALTHCHECK CMD curl --fail http://localhost:3000/health 2> /dev/null || exit 1 

ENTRYPOINT ["node", "index.js"]
