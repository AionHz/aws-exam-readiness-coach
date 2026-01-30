# Monitoring & Auditing (CLF-C02)

## Core definitions
- CloudWatch: Metrics, logs, alarms, and dashboards for operational monitoring.
- CloudTrail: Records API calls and account activity for audit.

## Common traps (don't confuse X with Y)
- CloudWatch vs CloudTrail: CloudWatch monitors performance/logs; CloudTrail tracks API activity.
- Alarms vs Events: Alarms evaluate metrics; EventBridge routes events.
- Logs vs metrics: Logs are detailed records; metrics are numeric time series.

## Rules of thumb
- Use CloudWatch alarms for thresholds (CPU, errors).
- Use CloudTrail for "who did what" auditing.
- Centralize logs before you need to investigate.
