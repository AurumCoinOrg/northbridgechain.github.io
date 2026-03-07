"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.getState = getState;
exports.setState = setState;
const pg_1 = require("pg");
const config_1 = require("./config");
exports.pool = new pg_1.Pool({
    connectionString: config_1.config.databaseUrl
});
async function query(text, params = []) {
    return exports.pool.query(text, params);
}
async function getState(key) {
    const res = await exports.pool.query("SELECT value FROM indexer_state WHERE key = $1", [key]);
    return res.rows[0]?.value ?? null;
}
async function setState(key, value) {
    await exports.pool.query(`
    INSERT INTO indexer_state (key, value)
    VALUES ($1, $2)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, [key, value]);
}
