import { Pool } from "pg";
import { config } from "./config";

export const pool = new Pool({
  connectionString: config.databaseUrl
});

export async function query(text: string, params: any[] = []) {
  return pool.query(text, params);
}

export async function getState(key: string): Promise<string | null> {
  const res = await pool.query(
    "SELECT value FROM indexer_state WHERE key = $1",
    [key]
  );

  return res.rows[0]?.value ?? null;
}

export async function setState(key: string, value: string): Promise<void> {
  await pool.query(
    `
    INSERT INTO indexer_state (key, value)
    VALUES ($1, $2)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `,
    [key, value]
  );
}
