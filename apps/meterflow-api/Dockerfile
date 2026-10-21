
FROM node:24-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/meterflow-api/package.json apps/meterflow-api/package.json

RUN pnpm install --filter @learning/meterflow-api... --no-frozen-lockfile

COPY apps/meterflow-api ./apps/meterflow-api

WORKDIR /workspace/apps/meterflow-api

CMD ["pnpm", "exec", "tsx", "src/index.ts"]
