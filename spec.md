# Northbridge Chain — Technical Specification (v0.1)
Status: FROZEN (until explicitly revised)
Last updated: 2026

## 1) Identity
- Chain: Northbridge Chain
- Type: Independent Layer-1 (L1)
- Positioning: Deterministic infrastructure for secure decentralized systems
- Roadmap: L1 first, L2 scaling in Phase 2+

## 2) Non-negotiable goals
- Deterministic finality (irreversible settlement once finalized)
- Security-first protocol design
- Predictable transaction economics
- Validator accessibility (practical decentralization)
- Upgrade path for L2 scaling

## 3) Security posture
- Slashing for provable malicious validator behavior
- Clear finality guarantees (no probabilistic “maybe final”)
- Conservative defaults (safety over marketing TPS)
- Audit-first approach prior to mainnet

## 4) Feature scope (Phase 1 / L1)
IN SCOPE:
- Core L1 network + validator set
- Finality mechanism + fork-choice rules
- Basic transaction + account model
- Explorer + RPC endpoints
- Testnet → audited mainnet launch

OUT OF SCOPE (Phase 1):
- Complex bridging
- Advanced DeFi modules
- Full business tooling suite
- Full account abstraction UX stack (can begin groundwork)

## 5) Phase 2+ (L2 / expansion)
- L2 scaling design and integration
- Secure cross-chain messaging strategy
- Ecosystem tooling expansion

## 6) Decisions still to lock (v0.2)
These are intentionally not finalized yet:
- Consensus implementation choice (specific protocol)
- Execution environment (EVM vs alternative)
- Token supply / emissions / staking economics
- Governance mechanics detail
