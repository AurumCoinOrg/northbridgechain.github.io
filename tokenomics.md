# Northbridge Chain — Tokenomics (v0.1)
Status: DRAFT (to be frozen before testnet economics)
Last updated: 2026

This document defines the economic design of Northbridge Chain. v0.1 sets purpose, constraints, and choices to finalize. Numbers are intentionally not finalized yet.

---

## 1. Token Purpose (Non-Negotiable)

The native token (ticker TBD) exists to support the network, not speculation.

Primary functions:
1) **Fees (Gas):** pay for transaction execution and network resource usage
2) **Staking:** secure the network by bonding stake to validator behavior
3) **Governance:** participate in protocol upgrades and parameter changes

---

## 2. Fee Model (Gas)

Goals:
- predictable cost structure
- protection against spam
- sustainable validator incentives

Fee components:
- base fee (network demand component)
- priority fee (optional, proposer incentive)

Policy direction:
- prefer predictable fees over “fee spikes”
- parameters can be tuned via governance

---

## 3. Staking & Validator Incentives

Validators are incentivized through:
- block rewards (if emission exists)
- transaction fees
- optional MEV policy (future)

Security requirements:
- bonded stake required to validate
- slashing for provable misbehavior
- downtime penalties (if adopted)

---

## 4. Slashing (Security Economics)

Slashing must be:
- objective (provable by evidence)
- predictable (rules clear in protocol)
- strong enough to deter attacks

Potential slashable offenses:
- double-signing / equivocation
- invalid finality votes (if applicable)
- censorship or non-participation (policy decision)

---

## 5. Supply Model (To Finalize)

Supply models under consideration:
A) Fixed cap (deflationary style)
B) Controlled inflation (security budget model)
C) Hybrid (cap + tail emission)

Constraints:
- must fund validator security long-term
- must remain understandable and auditable
- must avoid “marketing tokenomics” complexity

---

## 6. Distribution (To Finalize)

Distribution should support:
- long-term security
- ecosystem development
- decentralization over time

Components typically include:
- genesis allocation (foundation/treasury)
- validator / staking incentives
- ecosystem grants
- optional community distribution programs

Rules:
- transparent vesting schedules
- on-chain enforced unlocks when possible
- no hidden allocations

---

## 7. Governance Controls (To Finalize)

Governance may control:
- fee parameters
- staking parameters
- validator set limits
- upgrade scheduling

Rules:
- upgrades must be time-delayed
- emergency actions must be bounded and transparent

---

## 8. Decisions Needed for v0.2 (Lock List)

- Token name + ticker
- Supply model selection (A/B/C)
- Emission schedule (if any)
- Validator set target (initial + growth)
- Slashing policy details
- Governance model detail

---
