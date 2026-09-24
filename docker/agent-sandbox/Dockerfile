FROM node:22-bookworm

RUN npm install -g pnpm@11.22.0

RUN apt-get update \
  && apt-get install -y git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace