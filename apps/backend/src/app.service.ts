import { Injectable } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';

@Injectable()
export class AppService {
  constructor(private readonly supabaseService: SupabaseService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getStatus() {
    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase
        .from('status_checks')
        .select('id, name, message, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);
      console.error(error)
      if (error && Object.keys(error).length > 0) {
        return {
          status: 'degraded',
          timestamp: new Date().toISOString(),
          message: 'NestJS API is running, but Supabase query failed',
          service: 'NestJS + Next.js Monorepo',
          supabaseError: error.message,
          supabaseSample: null,
        };
      }
      console.log(data)
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'NestJS API is running',
        service: 'NestJS + Next.js Monorepo',
        supabaseSample: data?.[0] ?? null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        message: 'NestJS API is running, but Supabase is not configured',
        service: 'NestJS + Next.js Monorepo',
        supabaseError: message,
        supabaseSample: null,
      };
    }
  }
}
