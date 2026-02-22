# Northbridge Chain — Roadmap (v0.1)
Status: FROZEN (until explicitly revised)
Last updated: 2026

This roadmap defines phases and “done” criteria. No phase is considered complete until its checklist is complete.

---

## Phase 0 — Foundation (DONE)
Goal: Establish real project presence and infrastructure.

DONE CHECKLIST:
- [x] Domain acquired: northbridgechain.com
- [x] Professional email active
- [x] Developer-style website live on GitHub Pages
- [x] HTTPS enabled
- [x] Whitepaper v0.1 published
- [x] spec.md created (technical freeze doc)
- [x] roadmap.md created

Deliverables:
- Website + whitepaper + spec + roadmap in repo

---

## Phase 1 — L1 Blueprint (Design Freeze)
Goal: Lock the exact technical build plan before code.

DONE CHECKLIST:
- [ ] Choose base implementation path (framework selection)
- [ ] Lock consensus protocol (specific)
- [ ] Lock execution environment (EVM or alternative)
- [ ] Lock finality target (seconds + definition)
- [ ] Define validator requirements + slashing rules
- [ ] Define networking model + node types
- [ ] Define token model intent (gas/stake/governance)
- [ ] Create architecture diagram + component list

Deliverables:
- `architecture.md`
- `consensus.md`
- `execution.md`
- `tokenomics.md` (draft)
- `nodes.md` (hardware + ops)

---

## Phase 2 — Core L1 Build (Dev)
Goal: Build the minimum functioning L1.

DONE CHECKLIST:
- [ ] Create core chain repo (separate from website repo)
- [ ] Build node: networking + mempool + block production
- [ ] Implement state + storage layer
- [ ] Implement consensus + deterministic finality
- [ ] Implement RPC endpoints (basic)
- [ ] Implement CLI tools (node, key, tx)
- [ ] Genesis creation tooling
- [ ] Local devnet (single-node + multi-node)

Deliverables:
- Running devnet
- Genesis + config templates
- Basic docs for running a node

---

## Phase 3 — Testnet (Public)
Goal: Make it real with external nodes.

DONE CHECKLIST:
- [ ] Launch public testnet
- [ ] Publish testnet docs (run a node)
- [ ] Block explorer (basic)
- [ ] Faucet
- [ ] Monitoring + dashboards
- [ ] Bug bounty plan
- [ ] Performance testing + stabilization

Deliverables:
- Public testnet
- Node operator docs
- Explorer + faucet live

---

## Phase 4 — Security + Audit
Goal: Reduce risk before mainnet.

DONE CHECKLIST:
- [ ] Threat model doc
- [ ] Internal security review
- [ ] External audit (core protocol)
- [ ] Fix audit findings
- [ ] Re-audit critical fixes (if needed)
- [ ] Finalize mainnet release candidate

Deliverables:
- Audit report(s)
- Security hardening notes
- Release candidate build

---

## Phase 5 — Mainnet Launch
Goal: Launch L1 with deterministic finality and security posture.

DONE CHECKLIST:
- [ ] Mainnet genesis + validator set
- [ ] Validator onboarding process
- [ ] Final docs (node ops, upgrades, governance)
- [ ] Release + changelog
- [ ] Public comms + launch checklist
- [ ] Incident response plan

Deliverables:
- Mainnet live
- Public docs
- Operational processes

---

## Phase 6 — Phase 2+ (L2 / Expansion)
Goal: Scale and expand without breaking the base layer.

DONE CHECKLIST:
- [ ] L2 strategy doc (rollups / validiums / appchains)
- [ ] Cross-chain messaging strategy
- [ ] Ecosystem tooling + SDK
- [ ] Account abstraction UX roadmap
- [ ] Business rails (optional module)

Deliverables:
- L2 test environment
- Messaging prototypes
- SDK + dev tooling

---
