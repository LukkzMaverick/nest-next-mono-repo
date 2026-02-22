# AI Agent Instructions

## Monorepo Rules
- Always run `npm install` at the repository root.
- Dependencies are installed at the repository root and shared via npm workspaces.
- Do not run dependency installation inside `apps/backend` or `apps/frontend`.

## Development Commands
- Start app: `npm run dev`
- Build all: `npm run build`
- Backend only: `npm run build --workspace=apps/backend`
- Frontend only: `npm run build --workspace=apps/frontend`

## Environment Variables
- Frontend Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Backend Supabase:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Safety Rules
- Never commit secrets or `.env` files.
- Keep service role key only in backend environment.
- Use anon key in frontend only.
