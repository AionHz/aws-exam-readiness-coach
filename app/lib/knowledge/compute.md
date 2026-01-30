# Compute (CLF-C02)

## Core definitions
- EC2: Virtual servers you manage with full OS control.
- Lambda: Serverless functions that run on demand.

## Common traps (don't confuse X with Y)
- Auto Scaling vs Load Balancing: Auto Scaling changes capacity; ELB distributes traffic.
- Lambda vs Fargate: Lambda runs functions; Fargate runs containers.
- Reserved Instances vs Savings Plans: RI is instance-scoped; Savings Plans are more flexible.

## Rules of thumb
- Use Auto Scaling for unpredictable demand on EC2.
- Use Lambda for event-driven tasks and minimal ops.
- Spot works for stateless, retryable jobs.
