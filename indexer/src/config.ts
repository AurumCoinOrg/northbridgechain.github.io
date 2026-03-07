import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error("Missing required env var: " + name);
  }
  return value;
}

export const config = {
  databaseUrl: required("DATABASE_URL"),
  rpcUrl: required("RPC_URL"),
  apiPort: Number(process.env.API_PORT || 4100),
  confirmations: Number(process.env.INDEXER_CONFIRMATIONS || 0),
  startBlock: Number(process.env.INDEXER_START_BLOCK || 0)
};
