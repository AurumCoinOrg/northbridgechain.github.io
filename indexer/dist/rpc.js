"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestBlockNumber = getLatestBlockNumber;
exports.getBlockByNumber = getBlockByNumber;
exports.getReceipt = getReceipt;
const config_1 = require("./config");
async function rpc(method, params = []) {
    const res = await fetch(config_1.config.rpcUrl, {
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
    const json = (await res.json());
    if (json.error) {
        throw new Error("RPC error: " + json.error.message);
    }
    if (json.result === undefined) {
        throw new Error("RPC returned no result for method: " + method);
    }
    return json.result;
}
async function getLatestBlockNumber() {
    const hex = await rpc("eth_blockNumber", []);
    return parseInt(hex, 16);
}
async function getBlockByNumber(blockNumber) {
    return rpc("eth_getBlockByNumber", ["0x" + blockNumber.toString(16), true]);
}
async function getReceipt(txHash) {
    return rpc("eth_getTransactionReceipt", [txHash]);
}
