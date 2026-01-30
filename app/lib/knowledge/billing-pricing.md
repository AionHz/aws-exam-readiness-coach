# Billing & Pricing (CLF-C02)

## Core definitions
- Pricing models: Ways AWS charges for services (On-Demand, Reserved Instances, Savings Plans, Spot).
- Cost allocation tags: Tags used to group and track spend by team or project.

## Common traps (don't confuse X with Y)
- Reserved Instances vs Savings Plans: RI is instance-family/region scoped; Savings Plans are more flexible across compute.
- Cost Explorer vs Budgets: Cost Explorer analyzes trends; Budgets sets alerts.
- Free Tier vs Credits: Free Tier is limited usage; credits are promotional balances.

## Rules of thumb
- Steady usage -> Savings Plans or Reserved Instances; bursty usage -> On-Demand.
- Spot is cheap but interruptible; use for non-critical batch work.
- Turn on cost allocation tags early to avoid messy chargeback later.
- Set budget alerts before you experiment.
