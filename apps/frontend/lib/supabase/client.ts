export type { Database, Tables } from '@repo/supabase-types';

import type { Tables } from '@repo/supabase-types';

export type StatusCheck = Tables<'status_checks'>;

export interface StatusResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  message: string;
  service: string;
  supabaseSample: StatusCheck | null;
  supabaseError?: string;
}
