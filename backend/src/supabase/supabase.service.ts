import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult } from 'pg';

@Injectable()
export class SupabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(SupabaseService.name);
  private pool: Pool;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    if (!databaseUrl) {
      this.logger.error('Database configuration is missing');
      throw new Error('DATABASE_URL must be provided');
    }

    this.pool = new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false, // Neon requires SSL
      },
    });

    this.logger.log('PostgreSQL connection pool initialized');
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('PostgreSQL connection pool closed');
  }

  getPool(): Pool {
    return this.pool;
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  // Helper method to execute queries with automatic user context
  async queryWithUser<T = any>(
    userId: string,
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      // Set the user context for RLS policies
      await client.query(`SET LOCAL app.current_user_id = '${userId}'`);
      return await client.query<T>(text, params);
    } finally {
      client.release();
    }
  }
}
