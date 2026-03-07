import { config } from "./config";

type RpcResult<T> = {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: { code: number; message: string };
};

async function rpc<T>(method: string, params: any[] = []): Promise<T> {
  const res = await fetch(config.rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params
    })
  });

  if (!res.ok) {
    throw new Error("RPC HTTP error: " + res.status);
  }

  const json = (await res.json()) as RpcResult<T>;

  if (json.error) {
    throw new Error("RPC error: " + json.error.message);
  }

  if (json.result === undefined) {
    throw new Error("RPC returned no result for method: " + method);
  }

  return json.result;
}

export async function getLatestBlockNumber(): Promise<number> {
  const hex = await rpc<string>("eth_blockNumber", []);
  return parseInt(hex, 16);
}

export async function getBlockByNumber(blockNumber: number): Promise<any> {
  return rpc<any>("eth_getBlockByNumber", ["0x" + blockNumber.toString(16), true]);
}

export async function getReceipt(txHash: string): Promise<any> {
  return rpc<any>("eth_getTransactionReceipt", [txHash]);
}
