import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const getDbClient = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    return client;
};
