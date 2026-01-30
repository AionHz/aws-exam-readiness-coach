# Networking (CLF-C02)

## Core definitions
- VPC: Isolated virtual network with subnets, routes, and gateways.
- Route 53: DNS service with routing policies and health checks.

## Common traps (don't confuse X with Y)
- Public vs private subnet: Public has a route to an Internet Gateway; private does not.
- VPC peering vs Transit Gateway: Peering is one-to-one; TGW scales many-to-many.
- Security groups vs NACLs: SGs are stateful instance firewalls; NACLs are stateless subnet filters.

## Rules of thumb
- Put web tiers in public subnets and data tiers in private subnets.
- Use NAT Gateway for outbound internet access from private subnets.
- Use VPC endpoints for private access to AWS services.
