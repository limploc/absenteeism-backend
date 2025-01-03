import { ConfigService } from "@nestjs/config";
import { DatabaseClient } from "./database";
import { PostgreService } from "./postgre/postgre.service";
import { Pool } from "pg";


export function createDatabaseClient(configService: ConfigService) {
    if (configService.get('DATABASE') == 'postgre') {
        return new PostgreService(configService);
    }
    return new DatabaseClient<Pool>();
}