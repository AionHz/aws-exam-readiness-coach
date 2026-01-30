# Shared Responsibility & Support (CLF-C02)

## Core definitions
- Shared responsibility model: AWS secures the cloud; customers secure what they deploy in the cloud.
- Support plans: Basic, Developer, Business, Enterprise tiers with increasing access and response times.

## Common traps (don't confuse X with Y)
- AWS responsibility vs customer responsibility: AWS handles facilities/host layer; customers handle data, IAM, and configs.
- Support vs Trusted Advisor: Support is human help; Trusted Advisor is automated checks.
- Business vs Enterprise: Enterprise includes a Technical Account Manager (TAM).

## Rules of thumb
- If it is infrastructure under the service, AWS owns it; if it is your data or access, you own it.
- Use Trusted Advisor for automated checks, not as a support plan.
- Pick Business/Enterprise when you need faster response or deeper guidance.
