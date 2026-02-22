import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/supabase-types';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient<Database>;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    const supabaseKey = this.configService.getOrThrow<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );

    this.client = createClient<Database>(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient<Database> {
    return this.client;
  }
}
