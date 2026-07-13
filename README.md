# Monkefit AI Platform

Monkefit AI Platform is the shared knowledge and orchestration layer for Monkefit’s AI customer service and sales assistant.

## Purpose
- Serve WhatsApp customers with fast, professional support
- Guide customers to the right Monkefit product
- Keep AI knowledge separate from channel tools like Botcake
- Create a reusable company asset that can power multiple channels later

## Scope
- Customer Service
- Sales Consultant
- Technical Support guidance
- Escalation to human admin for complaints and sensitive cases

## Core Principles
- Knowledge is the source of truth
- Prompt stays short and general
- Product data must be structured
- Complaints are handled by humans
- All changes should be versioned in Git

## Repository Structure
- `docs/` — charter, roadmap, architecture
- `knowledge/` — company, products, FAQ, warranty, shipping, troubleshooting, promotions, branches, escalation
- `prompts/` — system and agent prompts
- `sop/` — service and sales procedures
- `testing/` — test cases and benchmarks
- `integrations/` — Botcake, WhatsApp, OpenAI, website notes
- `assets/` — manuals and supporting files

## Current Status
Foundation phase in progress.
