CREATE TABLE IF NOT EXISTS indexer_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blocks (
  number BIGINT PRIMARY KEY,
  hash TEXT NOT NULL UNIQUE,
  parent_hash TEXT,
  timestamp BIGINT NOT NULL,
  gas_used NUMERIC,
  tx_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  hash TEXT PRIMARY KEY,
  block_number BIGINT NOT NULL REFERENCES blocks(number) ON DELETE CASCADE,
  tx_index INTEGER,
  from_address TEXT,
  to_address TEXT,
  value_wei NUMERIC,
  nonce BIGINT,
  gas NUMERIC,
  gas_price NUMERIC,
  status SMALLINT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_block_number ON transactions(block_number);
CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);

CREATE TABLE IF NOT EXISTS addresses (
  address TEXT PRIMARY KEY,
  first_seen_block BIGINT,
  last_seen_block BIGINT,
  tx_in_count BIGINT NOT NULL DEFAULT 0,
  tx_out_count BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS token_transfers (
  id BIGSERIAL PRIMARY KEY,
  tx_hash TEXT NOT NULL REFERENCES transactions(hash) ON DELETE CASCADE,
  log_index INTEGER NOT NULL,
  token_address TEXT NOT NULL,
  from_address TEXT,
  to_address TEXT,
  amount_raw TEXT NOT NULL,
  block_number BIGINT NOT NULL,
  timestamp BIGINT NOT NULL,
  UNIQUE (tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_token_transfers_token_address ON token_transfers(token_address);
CREATE INDEX IF NOT EXISTS idx_token_transfers_from_address ON token_transfers(from_address);
CREATE INDEX IF NOT EXISTS idx_token_transfers_to_address ON token_transfers(to_address);
CREATE INDEX IF NOT EXISTS idx_token_transfers_block_number ON token_transfers(block_number);

CREATE TABLE IF NOT EXISTS token_holders (
  token_address TEXT NOT NULL,
  holder_address TEXT NOT NULL,
  balance_raw TEXT NOT NULL DEFAULT '0',
  updated_block BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (token_address, holder_address)
);

CREATE INDEX IF NOT EXISTS idx_token_holders_token_balance ON token_holders(token_address, balance_raw DESC);
