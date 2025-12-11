# Detailed Guide: NestJS + Next.js Integrated Monorepo

## Objective

Build a monorepo where **NestJS fully serves Next.js pages**:

- NestJS is the main server (port 3000)
- NestJS exposes `/api/*` endpoints for the API
- NestJS also delivers the Next.js frontend
- **Single deploy**: only the NestJS server is deployed

## Architecture

```
Browser
    ↓
NestJS Server (port 3000)
    ├── /api/*  → NestJS API handlers
    └── /*      → Next.js pages rendered by NestJS
```

---

## STEP 1: Initialize the Monorepo Layout

### 1.1. Create the folder structure

```powershell
mkdir apps
mkdir apps\backend
mkdir apps\frontend
```

### 1.2. Add the root package.json

**File:** `package.json`

```json
{
  "name": "nest-next-monorepo",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["apps/backend", "apps/frontend"],
  "scripts": {
    "dev": "npm run dev --workspace=apps/backend",
    "build": "npm run build --workspace=apps/frontend && npm run build --workspace=apps/backend",
    "start": "npm run start:prod --workspace=apps/backend",
    "install:all": "npm install"
  },
  "devDependencies": {}
}
```

---

## STEP 2: Create the NestJS Backend

### 2.1. (Optional) Install the Nest CLI globally

```powershell
npm install -g @nestjs/cli
```

### 2.2. Generate the NestJS project

```powershell
cd apps/backend
nest new . --skip-git --package-manager npm
# choose "backend" when prompted
cd ../..
```

### 2.3. Update the backend package.json

Add Next.js and React dependencies:

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "next": "^14.2.33",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  }
}
```

### 2.4. Install the dependencies

```powershell
cd apps/backend
npm install
cd ../..
```

---

## STEP 3: Create the Next.js Frontend

### 3.1. Scaffold the frontend project

```powershell
cd apps/frontend
npx create-next-app@latest . --typescript --tailwind --app --import-alias "@/*" --no-git
cd ../..
```

### 3.2. Expected structure in `apps/frontend`

```
apps/frontend/
├── app/
│   ├── page.tsx
│   └── layout.tsx
├── public/
├── next.config.js
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## STEP 4: Plug Next.js into NestJS

### 4.1. Create the Next module

**File:** `apps/backend/src/next/next.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { NextService } from "./next.service";

@Module({
  providers: [NextService],
  exports: [NextService],
})
export class NextModule {}
```

### 4.2. Create the Next service

**File:** `apps/backend/src/next/next.service.ts`

```typescript
import { Injectable, OnModuleInit } from "@nestjs/common";
import next from "next";
import { NextServer } from "next/dist/server/next";
import * as path from "path";

@Injectable()
export class NextService implements OnModuleInit {
  private server: NextServer | null = null;
  private readyPromise: Promise<void> | null = null;

  async onModuleInit() {
    await this.ensureReady();
  }

  async ensureReady() {
    if (!this.readyPromise) {
      this.readyPromise = this.initializeNext();
    }

    try {
      await this.readyPromise;
    } catch (error) {
      this.readyPromise = null;
      throw error;
    }
  }

  private async initializeNext() {
    try {
      const frontendDir = path.join(__dirname, "..", "..", "..", "frontend");

      this.server = next({
        dev: process.env.NODE_ENV !== "production",
        dir: frontendDir,
      });

      await this.server.prepare();
      console.log("✅ Next.js prepared successfully");
    } catch (error) {
      this.server = null;
      console.error("❌ Error preparing Next.js:", error);
      throw error;
    }
  }

  getNextServer(): NextServer {
    if (!this.server) {
      throw new Error("Next.js has not been initialized yet");
    }
    return this.server;
  }

  getRequestHandler() {
    if (!this.server) {
      throw new Error("Next.js has not been initialized yet");
    }
    return this.server.getRequestHandler();
  }
}
```

### 4.3. Mount Next middleware in `main.ts`

We rely on a middleware registered before NestJS routes that passes all non-`/api` requests to Next.js. This approach keeps routing centralized and avoids an extra controller.

### 4.4. Import the Next module in AppModule

**File:** `apps/backend/src/app.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { NextModule } from "./next/next.module";

@Module({
  imports: [NextModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 4.5. Define the API controller

**File:** `apps/backend/src/app.controller.ts`

```typescript
import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("")
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("status")
  getStatus() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      message: "NestJS API is running",
      service: "NestJS + Next.js Monorepo",
    };
  }
}
```

### 4.6. Configure `main.ts`

**File:** `apps/backend/src/main.ts`

```typescript
import { NestFactory } from "@nestjs/core";
import type { NextFunction, Request, Response } from "express";
import { AppModule } from "./app.module";
import { NextService } from "./next/next.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  const apiPrefix = "api";
  app.setGlobalPrefix(apiPrefix);

  const nextService = app.get(NextService);
  await nextService.ensureReady();
  const handle = nextService.getRequestHandler();
  const server = app.getHttpAdapter().getInstance();

  server.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.url.startsWith(`/${apiPrefix}`)) {
      return next();
    }

    try {
      await handle(req, res);
    } catch (error) {
      next(error);
    }
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📡 API available at http://localhost:${port}/api`);
  console.log(`🎨 Frontend Next.js served at http://localhost:${port}`);
}
bootstrap();
```

---

## STEP 5: Configure the Frontend

### 5.1. Update `next.config.js`

**File:** `apps/frontend/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
};

module.exports = nextConfig;
```

### 5.2. Example page for API calls

**File:** `apps/frontend/app/page.tsx`

```tsx
"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setApiData(data))
      .catch((err) => console.error("Error fetching API:", err));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">NestJS + Next.js Monorepo</h1>
      <div className="border rounded-lg p-6 bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4">API Status</h2>
        {apiData ? (
          <pre className="bg-gray-900 text-green-400 p-4 rounded">
            {JSON.stringify(apiData, null, 2)}
          </pre>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <p className="mt-8 text-gray-600">Frontend served by NestJS 🚀</p>
    </main>
  );
}
```

---

## STEP 6: Scripts and Commands

### 6.1. Backend scripts (`apps/backend/package.json`)

```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix"
  }
}
```

### 6.2. Root commands

```powershell
npm run dev
npm run build
npm start
```

---

## STEP 7: Testing

1. Install dependencies from the workspace root:

```powershell
npm install
```

2. Run the development server:

```powershell
npm run dev
```

3. Validate the endpoints:
   - `http://localhost:3000` → Next.js frontend
   - `http://localhost:3000/api/status` → API status JSON

Use `curl http://localhost:3000/api/status` to confirm the API responds.

---

## STEP 8: Dependency Management & Deployment

### 8.1. Dependency Structure

With npm workspaces, **all dependencies are hoisted to the root `node_modules`**:

```
node_modules/           ← shared across backend and frontend
apps/backend/           ← uses root node_modules (no local copy)
apps/frontend/          ← uses root node_modules (no local copy)
```

This is the optimal setup for a single deployment since we only deploy the NestJS backend.

**Note:** If local `node_modules` are created in workspaces, run `npm run clean:workspaces` to remove them.

### 8.2. Prepare for Production Deployment

Run this command to clean, install only production dependencies, and build:

```powershell
npm run deploy:prepare
```

This will:

1. Clean all build artifacts and node_modules
2. Install only production dependencies (omit dev deps)
3. Build both frontend (Next.js output) and backend (Nest dist)

### 8.3. What Gets Deployed

Your production server should include:

```
dist/                      ← Backend compiled code (apps/backend/dist)
apps/frontend/.next/       ← Frontend compiled code
node_modules/              ← Production dependencies only
package.json & package-lock.json
```

Example Dockerfile snippet:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY apps/backend/dist ./apps/backend/dist
COPY apps/frontend/.next ./apps/frontend/.next

EXPOSE 3000

CMD ["node", "apps/backend/dist/main.js"]
```

---

## Final Notes

- ✅ Single server deployment: only NestJS is deployed
- ✅ Shared routing for both API and frontend
- ✅ Hot reload available in development
- ✅ Next.js retains SSR/SSG capabilities
- ✅ API routes remain under `/api/*`
- ✅ Optimized dependency hoisting to root `node_modules`
