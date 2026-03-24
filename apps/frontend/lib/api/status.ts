export interface StatusResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  message: string;
  service: string;
  database: Record<string, unknown> | null;
  databaseError?: string;
}