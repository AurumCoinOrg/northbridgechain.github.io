import express from "express";
import { config } from "./config";
import { getState, pool, query } from "./db";

const app = express();

app.get("/health", async (_req, res) => {
  const lastIndexed = await getState("last_indexed_block");
  res.json({
    ok: true,
    lastIndexedBlock: lastIndexed ? Number(lastIndexed) : null
  });
});

app.get("/blocks", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const result = await query(
    `
    SELECT number, hash, parent_hash, timestamp, gas_used, tx_count
    FROM blocks
    ORDER BY number DESC
    LIMIT $1
    `,
    [limit]
  );
  res.json(result.rows);
});

app.get("/txs", async (req, res) => {
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const result = await query(
    `
    SELECT hash, block_number, tx_index, from_address, to_address, value_wei, nonce, gas, gas_price, status, timestamp
    FROM transactions
    ORDER BY block_number DESC, tx_index DESC
    LIMIT $1
    `,
    [limit]
  );
  res.json(result.rows);
});

app.get("/address/:address", async (req, res) => {
  const address = String(req.params.address || "").toLowerCase();

  const activity = await query(
    `
    SELECT hash, block_number, tx_index, from_address, to_address, value_wei, status, timestamp
    FROM transactions
    WHERE from_address = $1 OR to_address = $1
    ORDER BY block_number DESC, tx_index DESC
    LIMIT 100
    `,
    [address]
  );

  const summary = await query(
    `
    SELECT address, first_seen_block, last_seen_block, tx_in_count, tx_out_count
    FROM addresses
    WHERE address = $1
    `,
    [address]
  );

  const transfers = await query(
    `
    SELECT tx_hash, log_index, token_address, from_address, to_address, amount_raw, block_number, timestamp
    FROM token_transfers
    WHERE from_address = $1 OR to_address = $1
    ORDER BY block_number DESC, log_index DESC
    LIMIT 100
    `,
    [address]
  );

  res.json({
    summary: summary.rows[0] ?? null,
    transactions: activity.rows,
    tokenTransfers: transfers.rows
  });
});

app.get("/holders/:token", async (req, res) => {
  const token = String(req.params.token || "").toLowerCase();
  const limit = Math.min(Number(req.query.limit || 100), 500);

  const result = await query(
    `
    SELECT holder_address, balance_raw, updated_block
    FROM token_holders
    WHERE token_address = $1
    ORDER BY balance_raw::numeric DESC
    LIMIT $2
    `,
    [token, limit]
  );

  res.json(result.rows);
});

app.listen(config.apiPort, () => {
  console.log("indexer api listening on", config.apiPort);
});

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});
