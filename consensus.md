# Northbridge Chain — Consensus Design (v0.1)
Status: DRAFT (to be frozen in Phase 1)
Last updated: 2026

---

## 1. Objective

Northbridge Chain is designed to provide **deterministic finality**.

Deterministic finality means:

- Once a block is finalized, it cannot be reverted under normal protocol rules.
- Finality does not rely on "probabilistic confirmations".
- Settlement guarantees are explicit and verifiable.

---

## 2. High-Level Model

Northbridge Chain uses a **validator-based BFT-style consensus architecture**.

Core components:

1. Block Proposer (leader)
2. Validator set
3. Voting rounds
4. Finalization rule
5. Slashing for provable misbehavior

---

## 3. Block Lifecycle

Step 1:
A proposer creates a block.

Step 2:
Validators verify:
- transaction validity
- state transitions
- protocol rules

Step 3:
Validators vote on the block.

Step 4:
Once the required threshold of validator votes is reached,
the block becomes FINALIZED.

After finalization:
- The block cannot be reverted.
- All subsequent blocks build on finalized state.

---

## 4. Finality Threshold

Finality requires:

- Supermajority validator approval (exact % to be defined in v0.2)
- Cryptographic proof of validator signatures

Finality proof must be:
- Verifiable by full nodes
- Verifiable by light clients (future)
- Lightweight and efficient

---

## 5. Fork-Choice Rule

Before finality:
- Competing proposals may exist.

After finality:
- Competing chains are invalid.

The protocol must clearly define:
- How temporary forks are resolved
- When blocks transition from "proposed" to "final"

---

## 6. Validator Responsibilities

Validators must:

- Maintain uptime
- Validate blocks
- Participate in voting rounds
- Sign finality messages

Failure modes:

- Double-signing
- Conflicting votes
- Invalid block proposals

These behaviors are slashable.

---

## 7. Slashing Principles

Slashing must be:

- Deterministic
- Evidence-based
- Transparent

Slashing penalties must:

- Deter malicious behavior
- Not excessively punish accidental downtime (policy decision)

---

## 8. Performance Target (To Finalize)

Target block time:
(TBD — likely 2–5 seconds)

Target finality time:
(TBD — target < 10 seconds)

Security > marketing TPS.

---

## 9. Upgrade Path

Consensus upgrades must:

- Be versioned
- Be approved via governance
- Include safe activation thresholds
- Avoid chain splits

---

## 10. Decisions Required for v0.2

- Exact consensus protocol (specific implementation)
- Finality percentage threshold
- Block time target
- Validator set size (initial)
- Slashing penalty values
