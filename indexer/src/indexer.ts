import { config } from "./config";
import { getState, pool, query, setState } from "./db";
import { getBlockByNumber, getLatestBlockNumber, getReceipt } from "./rpc";

const ERC20_TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function hexToNumber(value: string | null | undefined): number {
  if (!value) return 0;
  return parseInt(value, 16);
}

function hexToDecimalString(value: string | null | undefined): string {
  if (!value) return "0";
  return BigInt(value).toString(10);
}

function normalizeStatus(status: unknown): number | null {
  if (status === null || status === undefined) return null;
  if (typeof status === "number") return status;
  if (typeof status === "string") {
    const s = status.toLowerCase();
    if (s === "0x1" || s === "1") return 1;
    if (s === "0x0" || s === "0") return 0;
  }
  return null;
}

function topicToAddress(topic: string | null | undefined): string | null {
  if (!topic) return null;
  return "0x" + topic.slice(-40).toLowerCase();
}

async function upsertAddress(address: string | null | undefined, blockNumber: number, direction: "in" | "out"): Promise<void> {
  if (!address) return;

  await query(
    `
    INSERT INTO addresses (
      address,
      first_seen_block,
      last_seen_block,
      tx_in_count,
      tx_out_count,
      updated_at
    )
    VALUES (
      $1,
      $2,
      $2,
      $3,
      $4,
      NOW()
    )
    ON CONFLICT (address) DO UPDATE SET
      first_seen_block = LEAST(addresses.first_seen_block, EXCLUDED.first_seen_block),
      last_seen_block = GREATEST(addresses.last_seen_block, EXCLUDED.last_seen_block),
      tx_in_count = addresses.tx_in_count + EXCLUDED.tx_in_count,
      tx_out_count = addresses.tx_out_count + EXCLUDED.tx_out_count,
      updated_at = NOW()
    `,
    [
      address.toLowerCase(),
      blockNumber,
      direction === "in" ? 1 : 0,
      direction === "out" ? 1 : 0
    ]
  );
}

async function processBlock(blockNumber: number): Promise<void> {
  const block = await getBlockByNumber(blockNumber);

  if (!block) {
    throw new Error("Block not found: " + blockNumber);
  }

  const timestamp = hexToNumber(block.timestamp);
  const txCount = Array.isArray(block.transactions) ? block.transactions.length : 0;

  await query("BEGIN");

  try {
    await query(
      `
      INSERT INTO blocks (number, hash, parent_hash, timestamp, gas_used, tx_count)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (number) DO UPDATE SET
        hash = EXCLUDED.hash,
        parent_hash = EXCLUDED.parent_hash,
        timestamp = EXCLUDED.timestamp,
        gas_used = EXCLUDED.gas_used,
        tx_count = EXCLUDED.tx_count
      `,
      [
        blockNumber,
        block.hash,
        block.parentHash,
        timestamp,
        hexToDecimalString(block.gasUsed),
        txCount
      ]
    );

    for (const tx of block.transactions || []) {
      const receipt = await getReceipt(tx.hash).catch(() => null);
      const status = normalizeStatus(receipt?.status);

      await query(
        `
        INSERT INTO transactions (
          hash,
          block_number,
          tx_index,
          from_address,
          to_address,
          value_wei,
          nonce,
          gas,
          gas_price,
          status,
          timestamp
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        ON CONFLICT (hash) DO UPDATE SET
          block_number = EXCLUDED.block_number,
          tx_index = EXCLUDED.tx_index,
          from_address = EXCLUDED.from_address,
          to_address = EXCLUDED.to_address,
          value_wei = EXCLUDED.value_wei,
          nonce = EXCLUDED.nonce,
          gas = EXCLUDED.gas,
          gas_price = EXCLUDED.gas_price,
          status = EXCLUDED.status,
          timestamp = EXCLUDED.timestamp
        `,
        [
          tx.hash,
          blockNumber,
          hexToNumber(tx.transactionIndex),
          tx.from?.toLowerCase() ?? null,
          tx.to?.toLowerCase() ?? null,
          hexToDecimalString(tx.value),
          hexToNumber(tx.nonce),
          hexToDecimalString(tx.gas),
          hexToDecimalString(tx.gasPrice),
          status,
          timestamp
        ]
      );

      await upsertAddress(tx.from, blockNumber, "out");
      await upsertAddress(tx.to, blockNumber, "in");

      for (const log of receipt?.logs || []) {
        if (!Array.isArray(log.topics) || log.topics[0]?.toLowerCase() !== ERC20_TRANSFER_TOPIC) {
          continue;
        }

        const fromAddress = topicToAddress(log.topics[1]);
        const toAddress = topicToAddress(log.topics[2]);
        const tokenAddress = log.address?.toLowerCase();
        const amountRaw = BigInt(log.data || "0x0").toString(10);
        const logIndex = hexToNumber(log.logIndex);

        await query(
          `
          INSERT INTO token_transfers (
            tx_hash,
            log_index,
            token_address,
            from_address,
            to_address,
            amount_raw,
            block_number,
            timestamp
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          ON CONFLICT (tx_hash, log_index) DO UPDATE SET
            token_address = EXCLUDED.token_address,
            from_address = EXCLUDED.from_address,
            to_address = EXCLUDED.to_address,
            amount_raw = EXCLUDED.amount_raw,
            block_number = EXCLUDED.block_number,
            timestamp = EXCLUDED.timestamp
          `,
          [
            tx.hash,
            logIndex,
            tokenAddress,
            fromAddress,
            toAddress,
            amountRaw,
            blockNumber,
            timestamp
          ]
        );

        if (tokenAddress && fromAddress) {
          await query(
            `
            INSERT INTO token_holders (token_address, holder_address, balance_raw, updated_block)
            VALUES ($1, $2, '0', $3)
            ON CONFLICT (token_address, holder_address) DO NOTHING
            `,
            [tokenAddress, fromAddress, blockNumber]
          );

          await query(
            `
            UPDATE token_holders
            SET balance_raw = GREATEST((balance_raw::numeric - $3::numeric), 0)::text,
                updated_block = $4
            WHERE token_address = $1 AND holder_address = $2
            `,
            [tokenAddress, fromAddress, amountRaw, blockNumber]
          );
        }

        if (tokenAddress && toAddress) {
          await query(
            `
            INSERT INTO token_holders (token_address, holder_address, balance_raw, updated_block)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (token_address, holder_address) DO UPDATE SET
              balance_raw = (token_holders.balance_raw::numeric + EXCLUDED.balance_raw::numeric)::text,
              updated_block = EXCLUDED.updated_block
            `,
            [tokenAddress, toAddress, amountRaw, blockNumber]
          );
        }
      }
    }

    await setState("last_indexed_block", String(blockNumber));
    await query("COMMIT");
    console.log("indexed block", blockNumber, "txs", txCount);
  } catch (err) {
    await query("ROLLBACK");
    throw err;
  }
}

async function getStartBlock(): Promise<number> {
  const saved = await getState("last_indexed_block");
  if (saved !== null) return Number(saved) + 1;
  return config.startBlock;
}

async function main(): Promise<void> {
  const startAt = await getStartBlock();
  console.log("indexer starting at block", startAt);

  while (true) {
    try {
      const latest = await getLatestBlockNumber();
      const target = latest - config.confirmations;

      let next = await getStartBlock();

      while (next <= target) {
        await processBlock(next);
        next += 1;
      }
    } catch (err) {
      console.error("indexer loop error", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

main().catch(async (err) => {
  console.error("fatal indexer error", err);
  await pool.end();
  process.exit(1);
});
