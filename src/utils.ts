import sql from 'mssql';

import { DbTypes, IDbConnection } from './types';

const cachedDbConnections = new Map<string, { db: any, close: any }>();
export async function getDb(databaseConfig: IDbConnection, dbType: DbTypes) {
    const dbKey = JSON.stringify(databaseConfig);
    if (cachedDbConnections.has(dbKey)) {
        const dbConnection = cachedDbConnections.get(dbKey);
        if (dbConnection) {
            return dbConnection.db;
        }
    }
    if (dbType === 'mssql') {
        const pool = new sql.ConnectionPool({ ...databaseConfig } as sql.config);
        const db = await pool.connect();
        cachedDbConnections.set(dbKey, {
            db,
            close: pool.close.bind(pool),
        });
        return db;
    } else {
        const pgp = require('pg-promise')({ schema: databaseConfig.schema || 'public', });
        const db = pgp(databaseConfig);
        cachedDbConnections.set(dbKey, {
            db,
            close: pgp.end,
        });
        return db;
    }
};

export async function closeDbConnection(databaseConfig: IDbConnection) {
    const dbKey = JSON.stringify(databaseConfig);
    if (cachedDbConnections.has(dbKey)) {
        const dbConnection = cachedDbConnections.get(dbKey);
        if (dbConnection) {
            await dbConnection.close();
            cachedDbConnections.delete(dbKey);
        }
    }
}