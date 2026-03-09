import type { NextApiRequest, NextApiResponse } from "next";
import { NBCX, STAKING, LOCK } from "../../lib/config";

const RPC_URL = "https://northbridgechain.com/api/rpc";
const CHAIN_ID = 9000;

// Governance constants (mainnet)
const MULTISIG = "0x1f8d52151cbEa7098aA0A628079DEEBC3F15ab17";
const OWNERS = [
  "0xE476CA2dCe810f2aECB96fb1B3522f17Fa9161A9",
  "0xfbBC8cb66CF2db89A8059f161ccDc3653B17ECba",
  "0xAb22B5283050E218f5B08878D2E5b7B7c9420978"
];
const THRESHOLD = 2;

const TIMELOCK = "0x21e2962b917B7bA8B49540d0A0898981Bc88AE2D";
const TIMELOCK_DELAY_SECONDS = 259200;



// Timelock function selectors
const SEL_PENDING = "0x584b153e";
const SEL_READY   = "0x13bc9f20";
const SEL_DONE    = "0x2ab0f529";
const SEL_TS      = "0xd45c4435";
async function rpc(method: string, params: any[] = []) {
  const r = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "rpc error");
  return j.result;
}

function hexToInt(h: string) {
  return parseInt(h, 16);
}

function asBool(x: string) {
  return x === "0x" + "0".repeat(63) + "1";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const opIdRaw = (req.query.opId as string | undefined) || "";
  const opId = opIdRaw && opIdRaw.startsWith("0x") && opIdRaw.length === 66 ? opIdRaw : "";

  let timelockStatus: any = null;

  try {
    if (opId) {
      const pad = opId.slice(2).padStart(64, "0");

      // function selectors:
      // isOperationPending(bytes32) 0x7e2d27b7
      // isOperationReady(bytes32)   0x8c12c7fc
      // isOperationDone(bytes32)    0x7a0d87b1
      // getTimestamp(bytes32)       0x5c4f9f7e
      const arg = opId.slice(2).padStart(64, "0");

      const [pending, ready, done, tsHex, block] = await Promise.all([
        rpc("eth_call", [{ to: TIMELOCK, data: SEL_PENDING + arg }, "latest"]),
        rpc("eth_call", [{ to: TIMELOCK, data: SEL_READY   + arg }, "latest"]),
        rpc("eth_call", [{ to: TIMELOCK, data: SEL_DONE    + arg }, "latest"]),
        rpc("eth_call", [{ to: TIMELOCK, data: SEL_TS      + arg }, "latest"]),
        rpc("eth_getBlockByNumber", ["latest", false])
      ]);
const ts = hexToInt(tsHex);
      const now = hexToInt(block.timestamp);
      const secondsLeft = Math.max(0, ts - now);

      timelockStatus = {
        opId,
        pending: parseInt(pending,16) !== 0,
        ready: parseInt(ready,16) !== 0,
        done: parseInt(done,16) !== 0,
        timestamp: ts,
        now,
        secondsLeft
      };
    }
  } catch (e: any) {
    timelockStatus = { opId, error: String(e?.message || e) };
  }

  res.status(200).json({
    chainId: CHAIN_ID,
    rpc: RPC_URL,
    currencySymbol: "NBC",

    governance: {
      multisig: MULTISIG,
      owners: OWNERS,
      threshold: THRESHOLD,
      timelock: TIMELOCK,
      timelockDelaySeconds: TIMELOCK_DELAY_SECONDS,
      timelockDelayHuman: "72 hours"
    },

    core: {
      tokenV2: NBCX,
      stakingV2: STAKING,
      lockV2: LOCK
    },

    tokenomics: {
      fixedSupply: "100000000",
      stakingPoolPrefunded: "35000000"
    },

    timelockStatus
  });
}
