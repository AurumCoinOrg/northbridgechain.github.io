"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error("Missing required env var: " + name);
    }
    return value;
}
exports.config = {
    databaseUrl: required("DATABASE_URL"),
    rpcUrl: required("RPC_URL"),
    apiPort: Number(process.env.API_PORT || 4100),
    confirmations: Number(process.env.INDEXER_CONFIRMATIONS || 0),
    startBlock: Number(process.env.INDEXER_START_BLOCK || 0)
};
