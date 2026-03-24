# GitHub Copilot Instructions

## Repo conventions

- Install dependencies from repo root: `npm install`
- Monorepo workspaces:
  - Backend deps in `apps/backend/package.json`
  - Frontend deps in `apps/frontend/package.json`
  - Shared tooling deps in root `package.json`

## Commands

- Start app: `npm run dev`
- Build all: `npm run build`
- Build backend: `npm run build --workspace=apps/backend`
- Build frontend: `npm run build --workspace=apps/frontend`

## Environment

- Use one `.env` at repo root.
- Backend database access is Prisma + Postgres via `DATABASE_URL`.

## Security

- Never commit secrets or `.env` files.
