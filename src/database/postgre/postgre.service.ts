import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DatabaseClient } from '../database';
import { Pool, PoolClient } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostgreService extends DatabaseClient<Pool> implements OnModuleInit, OnModuleDestroy {
    private pool: Pool;
    private maxPool: number;
    private minPool: number;

    constructor(private configService: ConfigService) {
        super();
    }

    private async initializedPool() {
        const tempPool: Pool = new Pool({
            host: this.configService.get('DB_HOST'),
            port: this.configService.get('DB_PORT'),
            password: this.configService.get('DB_PASSWORD'),
            database: this.configService.get('DB_NAME'),
            user: this.configService.get('DB_USER')
        });

        try {
            const client = await tempPool.connect();
            const result = await client.query(`SELECT setting FROM pg_settings WHERE name = 'max_connections'`);
            client.release();
            const maxConnections = result.rows[0].setting;

            this.maxPool = Math.floor(maxConnections - 0.2 * maxConnections);
            this.minPool = Math.floor(maxConnections * 0.2);

            this.pool = new Pool({
                host: this.configService.get('DB_HOST'),
                port: this.configService.get('DB_PORT'),
                password: this.configService.get('DB_PASSWORD'),
                database: this.configService.get('DB_NAME'),
                user: this.configService.get('DB_USER'),
                max: this.maxPool,
                min: this.minPool,
                connectionTimeoutMillis: 5000
            });

            console.log(`Max pool size set to: ${this.maxPool}, Min pool size set to: ${this.minPool}`);
        } catch(error) {
            console.warn(`Failed to initialize pool: ${error}`);
            throw error;
        } finally {
            await tempPool.end();
        }
    }

    getPool(): Pool {
        return this.pool;
    }

    async startTransaction(): Promise<PoolClient> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
        } catch(error) {
            client.release();
            throw error;
        }
        return client;
    }

    async commitTransaction(client: PoolClient): Promise<void> {
        try {
            await client.query('COMMIT');
        } finally {
            client.release();
        }
    }

    async rollbackTransaction(client: PoolClient): Promise<void> {
        try {
            await client.query('ROLLBACK');
        } finally {
            client.release();
        }
    }

    async onModuleInit() {
        try {
            await this.initializedPool();
            const client = await this.pool.connect();
            console.log('Successfully integrated with database.');
            client.release();
        } catch(error) {
            console.warn(`Database error: ${error}`);
            throw error;
        }
    }

    async onModuleDestroy() {
        try {
            await this.pool.end();
            console.log('databaase succesfully disconected');
        } catch(error) {
            console.warn(`Error disconnect: ${error}`);
            throw error;
        }
    }
}
