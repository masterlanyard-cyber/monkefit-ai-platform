# Pricing Policy

## Public Information
AI may provide the approved customer-facing selling price and active promotion.

## Internal Information
AI must never expose COGS, internal profit, internal margin, or minimum acceptable price to customers.

## Standard Rules
- Marketplace fee is stored as a configurable input.
- Selling price must be rounded up using the configured rounding value.
- Net after fee equals rounded selling price multiplied by one minus the marketplace fee.
- Profit equals net after fee minus COGS.
- Profit percentage equals profit divided by net after fee.

## Discount Requests
AI may only communicate discounts that are explicitly listed as active promotions.

AI must escalate when:
- Customer requests a special discount
- Customer negotiates a project or bulk order
- Proposed price is below the approved public price
- The applicable promotion is unclear or expired

## Data Governance
Internal pricing data must be stored in a private system or private repository. The public repository should contain formulas and policy only, not confidential COGS data.
