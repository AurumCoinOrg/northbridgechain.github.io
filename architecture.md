# Northbridge Chain — Architecture (v0.1)
Status: DRAFT (to be frozen in Phase 1)
Last updated: 2026

This document describes the high-level architecture of Northbridge Chain (L1). It is implementation-agnostic and focuses on components, interfaces, and responsibilities.

---

## 1. Overview

Northbridge Chain is an independent Layer-1 blockchain designed around:
- deterministic finality
- security-first protocol design
- infrastructure-grade stability
- an explicit upgrade path for Layer-2 scaling

At a high level, the system is composed of:
1) Networking + mempool
2) Consensus + finality
3) Execution + state transition
4) Storage (state + history)
5) Node services (RPC, indexing, metrics)
6) Governance + upgrade mechanism

---

## 2. Node Types

### 2.1 Validator Node
Participates in:
- proposing blocks
- voting / finalizing blocks
- maintaining full state
- signing consensus messages

### 2.2 Full Node
- validates blocks and finality proofs
- maintains full state
- serves RPC to apps/wallets
- does NOT participate in proposing/finalizing

### 2.3 Archive Node (optional)
- stores full chain history + historical state
- supports explorers/analytics

### 2.4 Light Client (future)
- verifies headers + finality proofs
- minimal storage
- wallet/mobile friendly

---

## 3. Networking & Gossip

### 3.1 P2P Layer
Responsibilities:
- peer discovery
- secure connections
- message propagation
- DoS resistance basics (rate limits, bans)

Message classes:
- transactions (tx gossip)
- block proposals
- finality/consensus votes
- peer metadata

### 3.2 Mempool
Responsibilities:
- accept tx
- validate basic rules (signature, nonce, fee)
- apply anti-spam constraints
- order tx for block proposal (policy-defined)

---

## 4. Consensus & Finality

Northbridge Chain targets deterministic finality:
- blocks are not considered final until finalized by the consensus finality mechanism
- once finalized, blocks are irreversible under protocol rules

Consensus subsystem responsibilities:
- leader/proposer selection
- block proposal + voting
- finality proof generation
- fork-choice rules
- slashing conditions for provable misbehavior

Finality proof must be:
- verifiable by all nodes
- includable in blocks or derivable from consensus messages
- lightweight enough for light clients (future)

---

## 5. Execution & State Transition

### 5.1 Execution Layer
Responsibilities:
- apply transactions to state
- produce receipts/events
- charge fees (gas)
- enforce deterministic outcomes (no ambiguity)

### 5.2 Account Model
Phase 1 supports a standard account model:
- accounts / keys
- balances
- nonces
- basic permissions

Account abstraction features may begin as groundwork, but full UX stack is not required for Phase 1 mainnet.

---

## 6. Storage

### 6.1 State Database
- stores current state (accounts, contracts, balances)
- supports fast reads/writes
- supports snapshots for fast sync

### 6.2 Block/Chain Database
- stores blocks, headers, finality proofs
- stores transaction history for indexing

### 6.3 Snapshot / Fast Sync
Goal:
- reduce node sync time
- support practical decentralization
- allow operators to join without multi-day sync

---

## 7. RPC & Developer Surface

### 7.1 RPC Server
Minimum set:
- health/status
- latest block/header
- send raw tx
- get tx receipt
- account balance/nonce
- event/log queries (basic)

### 7.2 CLI Tools
- key management (dev/test)
- run node (validator/full)
- send tx (dev)
- inspect chain state (debug)

---

## 8. Observability & Operations

- logs
- metrics endpoint
- alerts for validator downtime
- basic dashboards (testnet)

---

## 9. Security Model (High Level)

- deterministic finality reduces settlement uncertainty
- slashing for provable consensus misbehavior
- conservative upgrade process
- audit-first before mainnet
- threat model + incident response defined in Phase 4

---

## 10. Phase 2+ Extensions

- Layer-2 integration (scaling)
- cross-chain messaging strategy
- light clients
- account abstraction UX rollout
- ecosystem SDK + tooling

---
