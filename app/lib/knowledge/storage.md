# Storage (CLF-C02)

## Core definitions
- S3: Object storage with buckets and storage classes.
- EBS: Block storage volumes attached to EC2.

## Common traps (don't confuse X with Y)
- S3 vs EBS: Object storage vs block storage attached to instances.
- EFS vs EBS: EFS is shared file storage; EBS is single-instance block storage.
- Glacier vs Standard-IA: Glacier is archival with slower retrieval; Standard-IA is infrequent access.

## Rules of thumb
- Use S3 for durable object storage and backups.
- Use EBS for EC2 boot and data volumes.
- Use EFS when multiple instances need the same files.
