# AI Agent Instructions

## Monorepo Rules
- Always run `npm install` at the repository root.
- Each workspace declares its own dependencies in its `package.json`. npm workspaces hoists them automatically.
- Backend deps (NestJS, etc.) go in `apps/backend/package.json`.
- Frontend deps (Next.js, React, etc.) go in `apps/frontend/package.json`.
- Shared dev tooling (TypeScript, ESLint, Prettier) stays in the root `package.json`.

## Development Commands
- Start app: `npm run dev`
- Build all: `npm run build`

## Environment Variables
- All env variables live in a single `.env` at the repo root.
- Backend Supabase:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Safety Rules
- Never commit secrets or `.env` files.
- Keep service role key only in backend environment.
- Use anon key in frontend only.
