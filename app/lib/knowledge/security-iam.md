# Security & IAM (CLF-C02)

## Core definitions
- IAM: Manages identities (users, roles) and permissions with policies.
- MFA: Second factor to protect sensitive identities, especially root.

## Common traps (don't confuse X with Y)
- IAM users vs roles: Users are long-term identities; roles are assumed with temporary credentials.
- Authentication vs authorization: Authn verifies identity; authz grants access.
- Security groups vs NACLs: SGs are stateful instance firewalls; NACLs are stateless subnet filters.

## Rules of thumb
- Use roles on EC2/Lambda instead of hard-coded keys.
- Enforce least privilege and scope by resource and action.
- Enable MFA on root and avoid daily root usage.
- Encrypt data at rest using KMS where supported.
