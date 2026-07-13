# Architecture Overview

Monkefit AI Platform is designed as a reusable knowledge and decision layer for Monkefit customer interactions.

## Design Goals
- Keep business knowledge separate from channel tools
- Make product data reusable across AI, web, and internal tools
- Allow future integration with Botcake, WhatsApp API, and the website
- Support structured knowledge for better answer quality

## Core Layers
1. **Knowledge Layer**
   - Company profile
   - Product data
   - FAQ
   - Warranty
   - Shipping
   - Troubleshooting
   - Promotions
   - Branch information

2. **Prompt Layer**
   - Identity
   - Behavior rules
   - Response style
   - Escalation rules
   - Sales guidance
   - Customer service guidance

3. **Playbook Layer**
   - Sales playbook
   - Customer service playbook
   - Technical support playbook
   - After-sales playbook

4. **Integration Layer**
   - Botcake
   - WhatsApp API
   - Website widget
   - Future automation tools

## Operating Principle
- Knowledge tells the AI what is true.
- Prompt tells the AI how to behave.
- Playbooks tell the AI how to act.
- Integrations deliver the response to the customer.
