import { Injectable, OnModuleInit } from '@nestjs/common';
import next from 'next';
import * as path from 'path';

@Injectable()
export class NextService implements OnModuleInit {
  private server: any = null;
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
      const frontendDir = path.join(__dirname, '..', '..', '..', 'frontend');

      this.server = next({
        dev: process.env.NODE_ENV !== 'production',
        dir: frontendDir,
      });

      if (this.server) {
        await this.server.prepare();
        console.log('✅ Next.js prepared successfully');
      } else {
        throw new Error('Failed to initialize Next.js server');
      }
    } catch (error) {
      this.server = null;
      console.error('❌ Error preparing Next.js:', error);
      throw error;
    }
  }

  getNextServer(): any {
    if (!this.server) {
      throw new Error('Next.js was not initialized yet');
    }
    return this.server;
  }

  getRequestHandler() {
    if (!this.server) {
      throw new Error('Next.js was not initialized yet');
    }
    return this.server.getRequestHandler();
  }
}
