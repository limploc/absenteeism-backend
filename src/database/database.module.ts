import { Module } from '@nestjs/common';
import { DATABASE_CLIENT } from './database';
import { createDatabaseClient } from './database.service';
import { ConfigService } from '@nestjs/config';
import { PostgreService } from './postgre/postgre.service';

@Module({
    providers: [
        {
            provide: DATABASE_CLIENT,
            useFactory: createDatabaseClient,
            inject: [ConfigService]
        },
        PostgreService
    ], 
    exports: [DATABASE_CLIENT]
})
export class DatabaseModule {}
