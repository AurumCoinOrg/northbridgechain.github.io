# Northbridge Chain — Node & Validator Model (v0.1)
Status: DRAFT (to be frozen before testnet)
Last updated: 2026

This document defines node roles, validator requirements, and decentralization strategy.

---

## 1. Node Types

### 1.1 Validator Node

Validators:

- Propose blocks
- Validate transactions
- Participate in finality voting
- Sign consensus messages

Requirements:
- Bonded stake
- High uptime
- Secure key management

---

### 1.2 Full Node

Full nodes:

- Validate all blocks
- Verify finality proofs
- Maintain full state
- Serve RPC endpoints

Full nodes do NOT:
- Propose blocks
- Participate in finality voting

Goal:
Full nodes must remain practical to run.

---

### 1.3 Archive Node

Archive nodes:

- Store full historical chain data
- Support explorers and analytics
- Not required for consensus

---

### 1.4 Light Client (Future)

Light clients:

- Verify headers and finality proofs
- Minimal storage
- Designed for wallets and mobile use

---

## 2. Validator Requirements (Phase 1 Targets)

Exact numbers to finalize in v0.2.

Baseline targets:

CPU:
- Multi-core modern processor

RAM:
- Sufficient to handle state + mempool (TBD)

Storage:
- SSD required
- Snapshot-based sync supported

Network:
- Stable broadband connection
- Public IP required

Goal:
Validator operation should be achievable without enterprise-only hardware.

---

## 3. Validator Set Size

Initial validator set (TBD):
- Conservative size at genesis
- Expand over time

Design goals:
- Prevent centralization
- Maintain network performance
- Avoid over-fragmentation early

---

## 4. Staking Model

Validators must:

- Lock stake
- Remain online
- Follow protocol rules

Misbehavior leads to:

- Slashing
- Possible removal from active set

Delegation model (to finalize):
- Direct stake only?
- Delegated staking allowed?

---

## 5. Decentralization Strategy

Northbridge Chain decentralization principles:

- Avoid reliance on a single hosting provider
- Encourage geographic diversity
- Publish node operation guides
- Avoid extreme hardware requirements

---

## 6. Sync Model

Fast sync / snapshot support:

- New nodes should not require multi-day sync
- Snapshot verification must maintain security
- Full verification remains possible

---

## 7. Operational Security

Validators should:

- Use secure key storage (HSM recommended)
- Separate signing keys from public nodes
- Monitor uptime and performance
- Maintain update discipline

---

## 8. Upgrade Process

Node upgrades must:

- Be versioned
- Be announced in advance
- Include activation block height
- Avoid chain splits

---

## 9. Decisions Required for v0.2

- Initial validator count
- Minimum stake requirement
- Delegation model
- Hardware baseline specification
- Slashing percentages
