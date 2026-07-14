# Monkefit Master Knowledge Base

This directory is the structured single source of truth for Monkefit AI Consultant.

## Active Structure
- `company/` — company operations and approved business information
- `products/` — product cards for Hussar300RS, Hussar800RS, and Hussar1000RS
- `pricing/` — payment and discount policy
- `service/` — warranty, installation, shipping, technician transport, and troubleshooting
- `sales/` — active sales rules, conversation style, objection handling, closing, negotiation, and follow-up
- `faq/` — verified customer-facing answers
- `decision-engine/` — recommendation, qualification, and escalation routing
- `intelligence/` — conversation state, memory, persona, customer goal, confidence, and next best action
- `consultant/` — package, gym, investment, and expansion planning
- `ai/` — guardrails, workflows, profile, lead score, handover payload, and master system prompt
- `uat/` — UAT plan, test cases, bug report, and release checklist

## Control Files
- `index.yaml` lists the files loaded by the AI runtime.
- `manifest.yaml` records active and legacy modules for the current release.
- `validation-checklist.yaml` defines structural validation requirements.

## Source of Truth Rules
- Product and operational facts must come from approved Monkefit sources.
- Content from `monkefit.com` may be used except prices shown in the Shop section.
- Live stock must be verified with the team until a stock integration is available.
- Internal COGS, margin, profit, and minimum selling price must never be stored as public AI output.

## Active Business Rules
- Discount handled by AI is limited to 5%; requests above 5% are routed to Niken.
- Freight estimate is IDR 500,000–1,500,000 depending on area and shipment.
- Technician transport is IDR 300,000.
- Standard lead time is 5–7 working days, subject to stock and destination verification.
- Warranty is one year for spare parts and service.
- Installation coverage: Jabodetabek, Bandung, Medan, Surabaya, and Yogyakarta.

## Versioning
- Every structured card must include an ID, version, status, owner, and review date.
- Newer active modules replace legacy modules through `index.yaml` and `manifest.yaml`.
- Legacy files remain for traceability but must not be loaded into production behavior.
