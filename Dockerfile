ARG PORT=3000
ARG MAINTAINER="ICpEP.SE - TUPV <tupv.bscpe@tup.edu.ph>"
ARG DESCRIPTION="KodIt Docker image"
ARG VERSION="1.0.0-beta.0"

FROM node:18.17.1-alpine AS builder
LABEL maintainer=${MAINTAINER}
LABEL description=${DESCRIPTION}
LABEL version=${VERSION}

ENV CLIENT_PORT=${PORT}
ENV SERVER_PORT=${PORT}
ENV NODE_ENV=production

RUN apk update
RUN apk add --no-cache python3 gcc g++ make
RUN apk add --no-cache bash curl jq tar

WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci --build-from-source --include=dev

# Copy frontend files for build
COPY public/ public/
COPY src/ src/
COPY tsconfig.json .
COPY webpack.config.js .
RUN npm run build

# Download KodIt user program image
WORKDIR /usr/local/bin
RUN wget -q https://raw.githubusercontent.com/moby/moby/master/contrib/download-frozen-image-v2.sh
RUN chmod +x download-frozen-image-v2.sh
RUN download-frozen-image-v2.sh /usr/src/kodit-program eidoriantan/kodit-program:latest

FROM docker:dind
LABEL maintainer=${MAINTAINER}
LABEL description=${DESCRIPTION}
LABEL version=${VERSION}

RUN apk update
RUN apk add --no-cache nodejs=18.17.1-r0 npm

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules/ node_modules/
COPY --from=builder /usr/src/app/build/ build/
COPY server/ server/
COPY LICENSE.txt .
COPY package*.json .
RUN npm prune --omit=dev

WORKDIR /usr/src/kodit-program
COPY --from=builder /usr/src/kodit-program .

WORKDIR /usr/local/bin
COPY scripts/start.sh .
RUN chmod +x start.sh

EXPOSE ${PORT}
ENTRYPOINT ["start.sh"]
CMD ["3000"]
