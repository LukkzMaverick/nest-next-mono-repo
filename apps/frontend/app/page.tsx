import type { StatusResponse } from "@/lib/supabase/client";

const API_URL = process.env.INTERNAL_API_URL || "http://localhost:3000";

async function getStatus(): Promise<StatusResponse | null> {
  try {
    const res = await fetch(`${API_URL}/api/status`, {
      cache: "no-store",
    });
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const apiData = await getStatus();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🚀 NestJS + Next.js Monorepo
        </h1>

        <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-2xl font-semibold mb-4">API Status</h2>
          {apiData ? (
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">Error while loading api data</p>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            ✅ Frontend Next.js served by NestJS
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Monorepo fullstack with unique deploy
          </p>
        </div>
      </div>
    </main>
  );
}
