# MKB Changelog

## 1.0.0-rc1 — 2026-07-14

### Added
- Master Knowledge Base for Hussar300RS, Hussar800RS, and Hussar1000RS.
- Company, warranty, installation, payment, shipping, and service knowledge.
- Conversation state, memory, persona, customer goal, confidence, and next-best-action engines.
- Lead scoring and structured handover payload for Niken.
- Sales conversation style v1.1, sales rules v1.1, objection brain, closing brain, negotiation, and follow-up engine.
- Package, gym, investment, and expansion planning modules.
- Master system prompt and AI guardrails.
- UAT plan containing 30 acceptance scenarios.

### Changed
- `mkb/index.yaml` now loads only active production modules.
- Legacy sales files are excluded from active runtime behavior.
- Pricing answers must use contextual recommendations and public approved prices.
- Maximum AI-managed discount set to 5%.

### Business Rules Confirmed
- Warranty: one year covering spare parts and service.
- Technician transport: IDR 300,000.
- Freight estimate: IDR 500,000–1,500,000.
- Lead time: 5–7 working days, subject to stock and destination.
- Installation coverage: Jabodetabek, Bandung, Medan, Surabaya, and Yogyakarta.
- Sales and Admin PIC: Niken.

### Pending Before Final 1.0.0
- Execute TC001–TC030.
- Record results and close any high-severity findings.
- Add live stock integration in a future sprint.
