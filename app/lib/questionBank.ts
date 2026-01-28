// app/lib/questionBank.ts
export type Difficulty = "Easy" | "Medium" | "Hard";
export type ChoiceId = "A" | "B" | "C" | "D";
export type Choice = { id: ChoiceId; text: string };
export type Domain = "Cloud Concepts" | "Security" | "Technology" | "Billing & Pricing";
export const ALL_DOMAINS: Domain[] = [
    "Cloud Concepts",
    "Security",
    "Technology",
    "Billing & Pricing",
  ];
  
  export const ALL_DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
export type Question = {
  id: string;
  domain: Domain;
  difficulty: Difficulty;
  prompt: string;
  choices: Choice[];
  answerId: ChoiceId;
  explanation: string;
  coaching: string;
  whyWrong?: Partial<Record<ChoiceId, string>>;
};

// ✅ Move the entire array here (paste your current QUESTION_BANK contents)
export const QUESTION_BANK: Question[] = [
    {
        id: "cc-elasticity",
        domain: "Cloud Concepts",
        difficulty: "Easy",
        prompt: "What is a primary benefit of cloud elasticity?",
        choices: [
          { id: "A", text: "Fixed capacity planning" },
          { id: "B", text: "Automatic scaling based on demand" },
          { id: "C", text: "Manual hardware upgrades" },
          { id: "D", text: "Single data center operation" },
        ],
        answerId: "B",
        explanation:
          "Elasticity lets resources scale up or down to match demand without manual intervention.",
        coaching:
          "Elasticity = automatic scaling. Fixed capacity + manual upgrades are classic wrong answers.",
        whyWrong: {
          A: "Elasticity is the opposite of fixed capacity planning.",
          C: "Manual upgrades are traditional infrastructure work, not elasticity.",
          D: "Elasticity isn't about one location—it's about scaling capacity.",
        },
      },
      {
        id: "cc-paygo",
        domain: "Cloud Concepts",
        difficulty: "Easy",
        prompt: "Which cloud pricing principle helps reduce upfront costs?",
        choices: [
          { id: "A", text: "Pay-as-you-go" },
          { id: "B", text: "Long-term hardware depreciation" },
          { id: "C", text: "Overprovisioning for peak" },
          { id: "D", text: "Fixed annual capacity purchase" },
        ],
        answerId: "A",
        explanation:
          "Pay-as-you-go lets you pay only for what you use instead of buying capacity upfront.",
        coaching:
          "If the question mentions upfront costs, look for pay-as-you-go / no CapEx.",
      },
      {
        id: "cc-global",
        domain: "Cloud Concepts",
        difficulty: "Medium",
        prompt: "What is an AWS Region?",
        choices: [
          { id: "A", text: "A collection of edge locations" },
          { id: "B", text: "A physical location with multiple Availability Zones" },
          { id: "C", text: "A single data center building" },
          { id: "D", text: "An AWS account boundary" },
        ],
        answerId: "B",
        explanation:
          "A Region is a geographic area that contains multiple isolated Availability Zones.",
        coaching:
          "Region = geography; AZ = isolated datacenters within a Region; edge locations = CloudFront.",
      },
      {
        id: "cc-az",
        domain: "Cloud Concepts",
        difficulty: "Medium",
        prompt: "Why do architects use multiple Availability Zones?",
        choices: [
          { id: "A", text: "To increase latency" },
          { id: "B", text: "To improve fault tolerance and high availability" },
          { id: "C", text: "To reduce IAM complexity" },
          { id: "D", text: "To eliminate the need for backups" },
        ],
        answerId: "B",
        explanation:
          "Multi-AZ designs reduce impact from failures in a single AZ, improving availability.",
        coaching: "Multi-AZ = high availability. Backups are still needed.",
      },
    
      // --- Security ---
      {
        id: "sec-shared",
        domain: "Security",
        difficulty: "Medium",
        prompt: "In the AWS Shared Responsibility Model, what is AWS responsible for?",
        choices: [
          { id: "A", text: "Customer data classification" },
          { id: "B", text: "Guest OS patching for EC2 instances" },
          { id: "C", text: "Security of the cloud (infrastructure)" },
          { id: "D", text: "IAM user password policies in your account" },
        ],
        answerId: "C",
        explanation:
          "AWS secures the underlying infrastructure: facilities, hardware, and managed service foundation.",
        coaching: "AWS = security OF the cloud. You = security IN the cloud.",
        whyWrong: {
          A: "Your data, your rules—classification is customer responsibility.",
          B: "EC2 guest OS is customer responsibility.",
          D: "You configure IAM policies in your account.",
        },
      },
      {
        id: "sec-mfa",
        domain: "Security",
        difficulty: "Easy",
        prompt: "What is a recommended way to protect the AWS root user?",
        choices: [
          { id: "A", text: "Share root credentials with the team" },
          { id: "B", text: "Enable MFA on the root account" },
          { id: "C", text: "Use root for daily administration" },
          { id: "D", text: "Store root password in public repo" },
        ],
        answerId: "B",
        explanation:
          "MFA adds a second factor and is a best practice for protecting root access.",
        coaching: "Root account: lock it down + MFA + don’t use it day-to-day.",
      },
      {
        id: "sec-iam-role",
        domain: "Security",
        difficulty: "Medium",
        prompt: "What should an EC2 instance use to access AWS services securely?",
        choices: [
          { id: "A", text: "Hard-coded access keys in the application" },
          { id: "B", text: "An IAM role attached to the instance" },
          { id: "C", text: "The root account access keys" },
          { id: "D", text: "A publicly shared credentials file" },
        ],
        answerId: "B",
        explanation:
          "IAM roles provide temporary credentials to the instance without embedding secrets in code.",
        coaching: "On AWS exams: prefer roles over access keys on compute.",
      },
      {
        id: "sec-kms",
        domain: "Security",
        difficulty: "Hard",
        prompt: "Which AWS service helps you create and manage encryption keys?",
        choices: [
          { id: "A", text: "Amazon CloudWatch" },
          { id: "B", text: "AWS Key Management Service (KMS)" },
          { id: "C", text: "AWS Trusted Advisor" },
          { id: "D", text: "Amazon Route 53" },
        ],
        answerId: "B",
        explanation:
          "AWS KMS is used to create, manage, and control access to encryption keys.",
        coaching: "Keys + encryption management = KMS (common with S3/EBS/RDS).",
      },
    
      // --- Technology ---
      {
        id: "tech-s3",
        domain: "Technology",
        difficulty: "Easy",
        prompt: "Which AWS service is primarily used for object storage?",
        choices: [
          { id: "A", text: "Amazon EC2" },
          { id: "B", text: "Amazon S3" },
          { id: "C", text: "Amazon RDS" },
          { id: "D", text: "AWS Lambda" },
        ],
        answerId: "B",
        explanation:
          "Amazon S3 is AWS’s object storage service for storing and retrieving any amount of data.",
        coaching: "Object storage = S3. Block storage = EBS. File storage = EFS.",
      },
      {
        id: "tech-ec2",
        domain: "Technology",
        difficulty: "Easy",
        prompt: "Which AWS service provides resizable compute capacity in the cloud?",
        choices: [
          { id: "A", text: "Amazon EC2" },
          { id: "B", text: "Amazon S3" },
          { id: "C", text: "Amazon DynamoDB" },
          { id: "D", text: "Amazon CloudFront" },
        ],
        answerId: "A",
        explanation:
          "Amazon EC2 provides virtual servers (compute instances) with scalable capacity.",
        coaching: "Compute instance / virtual server = EC2.",
      },
      {
        id: "tech-rds",
        domain: "Technology",
        difficulty: "Medium",
        prompt: "Which AWS service is a managed relational database service?",
        choices: [
          { id: "A", text: "Amazon RDS" },
          { id: "B", text: "Amazon S3" },
          { id: "C", text: "Amazon EMR" },
          { id: "D", text: "AWS Direct Connect" },
        ],
        answerId: "A",
        explanation:
          "Amazon RDS provides managed relational database engines with automated maintenance features.",
        coaching: "Relational DB = RDS (and Aurora). NoSQL = DynamoDB.",
      },
      {
        id: "tech-cloudfront",
        domain: "Technology",
        difficulty: "Medium",
        prompt: "Which AWS service is used to deliver content with low latency globally?",
        choices: [
          { id: "A", text: "Amazon CloudFront" },
          { id: "B", text: "Amazon Route 53" },
          { id: "C", text: "AWS Snowball" },
          { id: "D", text: "Amazon Redshift" },
        ],
        answerId: "A",
        explanation:
          "CloudFront is a CDN that caches content at edge locations to reduce latency.",
        coaching: "CDN + edge locations = CloudFront.",
      },
      // --- Billing & Pricing ---
{
    id: "bill-costexplorer",
    domain: "Billing & Pricing",
    difficulty: "Easy",
    prompt: "Which tool helps you visualize and analyze AWS costs over time?",
    choices: [
      { id: "A", text: "AWS Cost Explorer" },
      { id: "B", text: "Amazon Inspector" },
      { id: "C", text: "AWS Shield" },
      { id: "D", text: "AWS Artifact" },
    ],
    answerId: "A",
    explanation:
      "Cost Explorer shows historical spend and helps analyze and forecast costs.",
    coaching: "Cost visibility: Cost Explorer + Budgets are common answers.",
  },
  {
    id: "bill-budgets",
    domain: "Billing & Pricing",
    difficulty: "Medium",
    prompt: "Which AWS service lets you set cost thresholds and receive alerts?",
    choices: [
      { id: "A", text: "AWS Budgets" },
      { id: "B", text: "AWS CloudTrail" },
      { id: "C", text: "Amazon CloudWatch Logs" },
      { id: "D", text: "AWS WAF" },
    ],
    answerId: "A",
    explanation:
      "AWS Budgets lets you set custom budgets and alerts when thresholds are exceeded.",
    coaching: "Alerts when cost exceeds X = AWS Budgets.",
  },
  {
    id: "bill-savingsplans",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "Which pricing model can reduce compute costs with a commitment to consistent usage?",
    choices: [
      { id: "A", text: "On-Demand Instances" },
      { id: "B", text: "Savings Plans" },
      { id: "C", text: "Spot Instances only" },
      { id: "D", text: "Free Tier always" },
    ],
    answerId: "B",
    explanation:
      "Savings Plans offer lower compute prices in exchange for a consistent usage commitment.",
    coaching: "Commitment discount = Savings Plans. Spot = interruptible.",
  },
  // ===== Cloud Concepts =====
{
  id: "cc-scalability",
  domain: "Cloud Concepts",
  difficulty: "Easy",
  prompt: "What is the difference between scalability and elasticity?",
  choices: [
    { id: "A", text: "They are the same concept" },
    { id: "B", text: "Scalability is manual; elasticity is automatic" },
    { id: "C", text: "Elasticity is manual; scalability is automatic" },
    { id: "D", text: "Scalability only applies to storage" },
  ],
  answerId: "B",
  explanation:
    "Scalability often involves planned growth, while elasticity automatically adjusts resources based on demand.",
  coaching: "Elasticity = automatic. Scalability = ability to grow.",
},
{
  id: "cc-ha",
  domain: "Cloud Concepts",
  difficulty: "Easy",
  prompt: "What does high availability primarily protect against?",
  choices: [
    { id: "A", text: "Security breaches" },
    { id: "B", text: "Cost overruns" },
    { id: "C", text: "Single points of failure" },
    { id: "D", text: "Poor application code" },
  ],
  answerId: "C",
  explanation:
    "High availability ensures systems remain operational even when components fail.",
  coaching: "HA = eliminate single points of failure.",
},
{
  id: "cc-dr",
  domain: "Cloud Concepts",
  difficulty: "Medium",
  prompt: "What is the main goal of disaster recovery (DR)?",
  choices: [
    { id: "A", text: "Reduce latency" },
    { id: "B", text: "Restore systems after a failure" },
    { id: "C", text: "Improve security posture" },
    { id: "D", text: "Lower monthly costs" },
  ],
  answerId: "B",
  explanation:
    "Disaster recovery focuses on restoring applications and data after outages.",
  coaching: "DR = recovery after failure, not prevention.",
},
{
  id: "cc-capex-opex",
  domain: "Cloud Concepts",
  difficulty: "Medium",
  prompt: "Which financial model does cloud computing primarily use?",
  choices: [
    { id: "A", text: "Capital Expenditure (CapEx)" },
    { id: "B", text: "Operational Expenditure (OpEx)" },
    { id: "C", text: "Fixed asset depreciation" },
    { id: "D", text: "Upfront capital investment" },
  ],
  answerId: "B",
  explanation:
    "Cloud services replace large upfront costs with ongoing operational expenses.",
  coaching: "Cloud = OpEx, not CapEx.",
},

// ===== Security =====
{
  id: "sec-least-privilege",
  domain: "Security",
  difficulty: "Easy",
  prompt: "What does the principle of least privilege mean?",
  choices: [
    { id: "A", text: "Granting admin access by default" },
    { id: "B", text: "Giving users only the permissions they need" },
    { id: "C", text: "Sharing credentials across teams" },
    { id: "D", text: "Using root for daily tasks" },
  ],
  answerId: "B",
  explanation:
    "Least privilege limits access to only what is required to perform a task.",
  coaching: "Always reduce permissions — never overgrant.",
},
{
  id: "sec-cloudtrail",
  domain: "Security",
  difficulty: "Medium",
  prompt: "Which AWS service records API calls for auditing purposes?",
  choices: [
    { id: "A", text: "Amazon CloudWatch" },
    { id: "B", text: "AWS CloudTrail" },
    { id: "C", text: "AWS Config" },
    { id: "D", text: "AWS Shield" },
  ],
  answerId: "B",
  explanation:
    "CloudTrail logs API calls and account activity for governance and auditing.",
  coaching: "Auditing API activity = CloudTrail.",
},
{
  id: "sec-encryption-at-rest",
  domain: "Security",
  difficulty: "Medium",
  prompt: "What does encryption at rest protect?",
  choices: [
    { id: "A", text: "Data moving across the network" },
    { id: "B", text: "Data stored on disks" },
    { id: "C", text: "IAM credentials" },
    { id: "D", text: "Application code" },
  ],
  answerId: "B",
  explanation:
    "Encryption at rest protects stored data from unauthorized access.",
  coaching: "At rest = stored. In transit = moving.",
},
{
  id: "sec-shield",
  domain: "Security",
  difficulty: "Hard",
  prompt: "Which AWS service helps protect against DDoS attacks?",
  choices: [
    { id: "A", text: "AWS Shield" },
    { id: "B", text: "AWS Inspector" },
    { id: "C", text: "AWS Artifact" },
    { id: "D", text: "AWS Trusted Advisor" },
  ],
  answerId: "A",
  explanation:
    "AWS Shield provides managed protection against DDoS attacks.",
  coaching: "DDoS protection = Shield (often with WAF).",
},

// ===== Technology =====
{
  id: "tech-lambda",
  domain: "Technology",
  difficulty: "Easy",
  prompt: "Which AWS service lets you run code without managing servers?",
  choices: [
    { id: "A", text: "Amazon EC2" },
    { id: "B", text: "AWS Lambda" },
    { id: "C", text: "Amazon ECS" },
    { id: "D", text: "Amazon Lightsail" },
  ],
  answerId: "B",
  explanation:
    "Lambda runs code in response to events without server management.",
  coaching: "No servers to manage = Lambda.",
},
{
  id: "tech-dynamodb",
  domain: "Technology",
  difficulty: "Medium",
  prompt: "Which AWS service is a fully managed NoSQL database?",
  choices: [
    { id: "A", text: "Amazon RDS" },
    { id: "B", text: "Amazon DynamoDB" },
    { id: "C", text: "Amazon Redshift" },
    { id: "D", text: "Amazon Aurora" },
  ],
  answerId: "B",
  explanation:
    "DynamoDB is a serverless NoSQL key-value and document database.",
  coaching: "NoSQL + serverless = DynamoDB.",
},
{
  id: "tech-efs",
  domain: "Technology",
  difficulty: "Medium",
  prompt: "Which AWS service provides shared file storage for EC2?",
  choices: [
    { id: "A", text: "Amazon S3" },
    { id: "B", text: "Amazon EBS" },
    { id: "C", text: "Amazon EFS" },
    { id: "D", text: "AWS Backup" },
  ],
  answerId: "C",
  explanation:
    "EFS provides scalable file storage that can be mounted by multiple EC2 instances.",
  coaching: "Shared file system = EFS.",
},
{
  id: "tech-vpc",
  domain: "Technology",
  difficulty: "Hard",
  prompt: "What is the primary purpose of an Amazon VPC?",
  choices: [
    { id: "A", text: "Content delivery" },
    { id: "B", text: "Identity management" },
    { id: "C", text: "Network isolation" },
    { id: "D", text: "Cost optimization" },
  ],
  answerId: "C",
  explanation:
    "A VPC provides logically isolated networking in AWS.",
  coaching: "VPC = networking boundary.",
},

// ===== Billing & Pricing =====
{
  id: "bill-free-tier",
  domain: "Billing & Pricing",
  difficulty: "Easy",
  prompt: "What is the AWS Free Tier designed to do?",
  choices: [
    { id: "A", text: "Provide unlimited free usage" },
    { id: "B", text: "Help new users explore AWS services at low cost" },
    { id: "C", text: "Replace paid services" },
    { id: "D", text: "Eliminate billing entirely" },
  ],
  answerId: "B",
  explanation:
    "The Free Tier allows limited usage so users can learn AWS services.",
  coaching: "Free Tier is limited — not unlimited.",
},
{
  id: "bill-tags",
  domain: "Billing & Pricing",
  difficulty: "Medium",
  prompt: "How can you organize and track AWS costs by project?",
  choices: [
    { id: "A", text: "IAM roles" },
    { id: "B", text: "Resource tags" },
    { id: "C", text: "Security groups" },
    { id: "D", text: "Availability Zones" },
  ],
  answerId: "B",
  explanation:
    "Tags allow cost allocation and organization by team or project.",
  coaching: "Cost tracking by project = tags.",
},
{
  id: "bill-consolidated",
  domain: "Billing & Pricing",
  difficulty: "Hard",
  prompt: "What is a benefit of consolidated billing in AWS Organizations?",
  choices: [
    { id: "A", text: "Separate invoices per account" },
    { id: "B", text: "Shared security credentials" },
    { id: "C", text: "Volume discounts across accounts" },
    { id: "D", text: "Manual cost allocation only" },
  ],
  answerId: "C",
  explanation:
    "Consolidated billing combines usage for volume-based discounts.",
  coaching: "Organizations = consolidated billing savings.",
},
// ===== Cloud Concepts =====
{
  id: "cc-economies-scale",
  domain: "Cloud Concepts",
  difficulty: "Medium",
  prompt: "What is a benefit of economies of scale in cloud computing?",
  choices: [
    { id: "A", text: "Higher upfront capital costs" },
    { id: "B", text: "Lower variable costs due to aggregated demand" },
    { id: "C", text: "Manual infrastructure management" },
    { id: "D", text: "Dedicated hardware per customer" },
  ],
  answerId: "B",
  explanation:
    "Cloud providers aggregate usage across customers, lowering per-unit costs.",
  coaching: "Economies of scale = cheaper prices at massive scale.",
},
{
  id: "cc-global-infra",
  domain: "Cloud Concepts",
  difficulty: "Easy",
  prompt: "What advantage does AWS global infrastructure provide?",
  choices: [
    { id: "A", text: "Single-region deployment only" },
    { id: "B", text: "Lower latency by deploying closer to users" },
    { id: "C", text: "Manual traffic routing" },
    { id: "D", text: "Higher on-premises costs" },
  ],
  answerId: "B",
  explanation:
    "Multiple Regions allow applications to run closer to end users.",
  coaching: "Global Regions = reduced latency.",
},

// ===== Security =====
{
  id: "sec-config",
  domain: "Security",
  difficulty: "Medium",
  prompt: "Which AWS service helps assess whether resources comply with security policies?",
  choices: [
    { id: "A", text: "AWS Config" },
    { id: "B", text: "AWS Shield" },
    { id: "C", text: "Amazon GuardDuty" },
    { id: "D", text: "AWS Artifact" },
  ],
  answerId: "A",
  explanation:
    "AWS Config tracks resource configurations and evaluates them against rules.",
  coaching: "Compliance + configuration tracking = AWS Config.",
},
{
  id: "sec-guardduty",
  domain: "Security",
  difficulty: "Medium",
  prompt: "Which AWS service detects suspicious or malicious activity?",
  choices: [
    { id: "A", text: "AWS Inspector" },
    { id: "B", text: "Amazon GuardDuty" },
    { id: "C", text: "AWS Config" },
    { id: "D", text: "AWS Trusted Advisor" },
  ],
  answerId: "B",
  explanation:
    "GuardDuty analyzes logs to detect threats and unusual behavior.",
  coaching: "Threat detection = GuardDuty.",
},
{
  id: "sec-encryption-transit",
  domain: "Security",
  difficulty: "Easy",
  prompt: "What does encryption in transit protect?",
  choices: [
    { id: "A", text: "Stored data on disks" },
    { id: "B", text: "Data moving between systems" },
    { id: "C", text: "IAM permissions" },
    { id: "D", text: "Billing information only" },
  ],
  answerId: "B",
  explanation:
    "Encryption in transit protects data as it travels over networks.",
  coaching: "In transit = data moving.",
},

// ===== Technology =====
{
  id: "tech-ami",
  domain: "Technology",
  difficulty: "Medium",
  prompt: "What is an Amazon Machine Image (AMI) used for?",
  choices: [
    { id: "A", text: "Storing objects" },
    { id: "B", text: "Launching EC2 instances with predefined configurations" },
    { id: "C", text: "Managing IAM users" },
    { id: "D", text: "Monitoring metrics" },
  ],
  answerId: "B",
  explanation:
    "AMIs define the software and configuration for EC2 instances.",
  coaching: "AMI = template for EC2.",
},
{
  id: "tech-elb",
  domain: "Technology",
  difficulty: "Medium",
  prompt: "What is the primary function of Elastic Load Balancing?",
  choices: [
    { id: "A", text: "Encrypt data at rest" },
    { id: "B", text: "Distribute traffic across multiple targets" },
    { id: "C", text: "Store application logs" },
    { id: "D", text: "Manage DNS records" },
  ],
  answerId: "B",
  explanation:
    "ELB improves availability by distributing incoming traffic.",
  coaching: "Traffic distribution = Load Balancer.",
},
{
  id: "tech-autoscaling",
  domain: "Technology",
  difficulty: "Medium",
  prompt: "What does EC2 Auto Scaling help you achieve?",
  choices: [
    { id: "A", text: "Manual instance provisioning" },
    { id: "B", text: "Automatic adjustment of compute capacity" },
    { id: "C", text: "Static performance limits" },
    { id: "D", text: "Lower IAM complexity" },
  ],
  answerId: "B",
  explanation:
    "Auto Scaling adjusts the number of instances based on demand.",
  coaching: "Scaling EC2 automatically = Auto Scaling.",
},
{
  id: "tech-cloudwatch",
  domain: "Technology",
  difficulty: "Easy",
  prompt: "Which AWS service monitors metrics and logs?",
  choices: [
    { id: "A", text: "AWS CloudTrail" },
    { id: "B", text: "Amazon CloudWatch" },
    { id: "C", text: "AWS Config" },
    { id: "D", text: "Amazon Inspector" },
  ],
  answerId: "B",
  explanation:
    "CloudWatch collects metrics, logs, and alarms for AWS resources.",
  coaching: "Metrics + alarms = CloudWatch.",
},

// ===== Billing & Pricing =====
{
  id: "bill-on-demand",
  domain: "Billing & Pricing",
  difficulty: "Easy",
  prompt: "What is a key characteristic of On-Demand pricing?",
  choices: [
    { id: "A", text: "Long-term commitment required" },
    { id: "B", text: "Pay only for what you use" },
    { id: "C", text: "Lowest cost option always" },
    { id: "D", text: "Interruptible capacity" },
  ],
  answerId: "B",
  explanation:
    "On-Demand pricing charges based on actual usage with no commitment.",
  coaching: "Flexible, no commitment = On-Demand.",
},
{
  id: "bill-spot",
  domain: "Billing & Pricing",
  difficulty: "Medium",
  prompt: "What is a key risk of using Spot Instances?",
  choices: [
    { id: "A", text: "Higher prices than On-Demand" },
    { id: "B", text: "They can be interrupted by AWS" },
    { id: "C", text: "They require long-term contracts" },
    { id: "D", text: "They cannot run applications" },
  ],
  answerId: "B",
  explanation:
    "Spot Instances can be reclaimed by AWS when capacity is needed.",
  coaching: "Spot = cheap but interruptible.",
},
{
  id: "bill-cost-allocation",
  domain: "Billing & Pricing",
  difficulty: "Medium",
  prompt: "Which feature helps break down costs by department or team?",
  choices: [
    { id: "A", text: "AWS Budgets" },
    { id: "B", text: "Cost allocation tags" },
    { id: "C", text: "AWS Shield" },
    { id: "D", text: "Security groups" },
  ],
  answerId: "B",
  explanation:
    "Cost allocation tags categorize costs for reporting.",
  coaching: "Department-level cost tracking = tags.",
},
{
  id: "bill-reserved",
  domain: "Billing & Pricing",
  difficulty: "Hard",
  prompt: "What is a benefit of Reserved Instances?",
  choices: [
    { id: "A", text: "No commitment required" },
    { id: "B", text: "Significant cost savings for steady usage" },
    { id: "C", text: "Interruptible pricing model" },
    { id: "D", text: "Applies only to storage" },
  ],
  answerId: "B",
  explanation:
    "Reserved Instances offer discounts for predictable, long-term workloads.",
  coaching: "Steady usage + commitment = Reserved Instances.",
},
// ===== Cloud Concepts (Hard) =====
{
  id: "cc-well-architected",
  domain: "Cloud Concepts",
  difficulty: "Hard",
  prompt: "Which AWS resource provides best practices for building secure, high-performing cloud workloads?",
  choices: [
    { id: "A", text: "AWS Trusted Advisor" },
    { id: "B", text: "AWS Well-Architected Framework" },
    { id: "C", text: "AWS Service Health Dashboard" },
    { id: "D", text: "AWS Organizations" },
  ],
  answerId: "B",
  explanation:
    "The Well-Architected Framework provides architectural best practices across key pillars.",
  coaching: "Architecture best practices = Well-Architected Framework.",
},
{
  id: "cc-design-tradeoffs",
  domain: "Cloud Concepts",
  difficulty: "Hard",
  prompt: "When designing for failure in AWS, which approach is recommended?",
  choices: [
    { id: "A", text: "Avoid failures by using larger instances" },
    { id: "B", text: "Assume failures and build fault-tolerant systems" },
    { id: "C", text: "Rely only on manual recovery" },
    { id: "D", text: "Deploy all resources in one Availability Zone" },
  ],
  answerId: "B",
  explanation:
    "AWS best practices assume components will fail and design systems to tolerate those failures.",
  coaching: "Design for failure = assume things break.",
},

// ===== Security (Hard) =====
{
  id: "sec-shared-s3",
  domain: "Security",
  difficulty: "Hard",
  prompt: "Under the AWS Shared Responsibility Model, who is responsible for encrypting data stored in Amazon S3?",
  choices: [
    { id: "A", text: "AWS only" },
    { id: "B", text: "The customer only" },
    { id: "C", text: "Both AWS and the customer" },
    { id: "D", text: "The AWS Partner Network" },
  ],
  answerId: "B",
  explanation:
    "Customers are responsible for securing their data, including encryption configuration.",
  coaching: "AWS secures the service; you secure your data.",
},
{
  id: "sec-iam-evaluation",
  domain: "Security",
  difficulty: "Hard",
  prompt: "How does IAM evaluate multiple policies attached to a user?",
  choices: [
    { id: "A", text: "Explicit allow overrides explicit deny" },
    { id: "B", text: "The most recent policy wins" },
    { id: "C", text: "Explicit deny always overrides allow" },
    { id: "D", text: "All policies are averaged" },
  ],
  answerId: "C",
  explanation:
    "In IAM policy evaluation, explicit denies always take precedence.",
  coaching: "On exams: explicit deny ALWAYS wins.",
},
{
  id: "sec-root-usage",
  domain: "Security",
  difficulty: "Hard",
  prompt: "Which task should be performed using the AWS root user?",
  choices: [
    { id: "A", text: "Launching EC2 instances" },
    { id: "B", text: "Daily IAM user management" },
    { id: "C", text: "Changing account settings like support plans" },
    { id: "D", text: "Managing S3 buckets" },
  ],
  answerId: "C",
  explanation:
    "Certain account-level settings can only be modified by the root user.",
  coaching: "Root = account setup only, not daily work.",
},

// ===== Technology (Hard) =====
{
  id: "tech-ec2-ebs",
  domain: "Technology",
  difficulty: "Hard",
  prompt: "What happens to data on an EC2 instance store when the instance stops?",
  choices: [
    { id: "A", text: "Data is preserved automatically" },
    { id: "B", text: "Data is deleted" },
    { id: "C", text: "Data is backed up to S3" },
    { id: "D", text: "Data moves to EBS" },
  ],
  answerId: "B",
  explanation:
    "Instance store volumes are ephemeral and data is lost when the instance stops.",
  coaching: "Instance store = temporary storage.",
},
{
  id: "tech-rds-backups",
  domain: "Technology",
  difficulty: "Hard",
  prompt: "What is required to enable automated backups for Amazon RDS?",
  choices: [
    { id: "A", text: "Multi-AZ deployment" },
    { id: "B", text: "Backup retention period greater than 0" },
    { id: "C", text: "Read replicas enabled" },
    { id: "D", text: "Encryption disabled" },
  ],
  answerId: "B",
  explanation:
    "Automated backups are enabled when a retention period is set.",
  coaching: "RDS backups = retention period > 0.",
},
{
  id: "tech-scaling-choice",
  domain: "Technology",
  difficulty: "Hard",
  prompt: "Which AWS service is best suited for unpredictable traffic spikes with minimal operational overhead?",
  choices: [
    { id: "A", text: "Amazon EC2 with Reserved Instances" },
    { id: "B", text: "AWS Lambda" },
    { id: "C", text: "Amazon RDS" },
    { id: "D", text: "AWS Direct Connect" },
  ],
  answerId: "B",
  explanation:
    "Lambda automatically scales with demand and requires no server management.",
  coaching: "Unpredictable traffic + low ops = Lambda.",
},
{
  id: "tech-network-isolation",
  domain: "Technology",
  difficulty: "Hard",
  prompt: "Which component controls inbound and outbound traffic at the instance level?",
  choices: [
    { id: "A", text: "Network ACL" },
    { id: "B", text: "Security Group" },
    { id: "C", text: "Route Table" },
    { id: "D", text: "Internet Gateway" },
  ],
  answerId: "B",
  explanation:
    "Security groups act as stateful firewalls at the instance level.",
  coaching: "Instance-level firewall = Security Group.",
},

// ===== Billing & Pricing (Hard) =====
{
  id: "bill-cost-optimization",
  domain: "Billing & Pricing",
  difficulty: "Hard",
  prompt: "Which AWS service provides recommendations to reduce costs and improve performance?",
  choices: [
    { id: "A", text: "AWS Budgets" },
    { id: "B", text: "AWS Trusted Advisor" },
    { id: "C", text: "AWS Cost Explorer" },
    { id: "D", text: "AWS Organizations" },
  ],
  answerId: "B",
  explanation:
    "Trusted Advisor provides best practice checks, including cost optimization.",
  coaching: "Recommendations across cost, security, performance = Trusted Advisor.",
},
{
  id: "bill-savings-vs-ri",
  domain: "Billing & Pricing",
  difficulty: "Hard",
  prompt: "What is a key advantage of Savings Plans over Reserved Instances?",
  choices: [
    { id: "A", text: "They apply only to EC2" },
    { id: "B", text: "They are interruptible" },
    { id: "C", text: "They offer more flexibility across compute services" },
    { id: "D", text: "They require no commitment" },
  ],
  answerId: "C",
  explanation:
    "Savings Plans provide flexibility across EC2, Lambda, and Fargate usage.",
  coaching: "Flexibility across compute = Savings Plans.",
},
{
  id: "bill-data-transfer",
  domain: "Billing & Pricing",
  difficulty: "Hard",
  prompt: "Which data transfer is typically free in AWS?",
  choices: [
    { id: "A", text: "Data transfer between Regions" },
    { id: "B", text: "Data transfer out to the internet" },
    { id: "C", text: "Data transfer into AWS from the internet" },
    { id: "D", text: "Data transfer via Direct Connect" },
  ],
  answerId: "C",
  explanation:
    "Inbound data transfer into AWS is generally free.",
  coaching: "In = free. Out = usually costs.",
},
{
  id: "bill-multi-account",
  domain: "Billing & Pricing",
  difficulty: "Hard",
  prompt: "Why do enterprises commonly use multiple AWS accounts?",
  choices: [
    { id: "A", text: "To bypass service limits" },
    { id: "B", text: "To improve isolation and cost tracking" },
    { id: "C", text: "To share root credentials" },
    { id: "D", text: "To eliminate IAM usage" },
  ],
  answerId: "B",
  explanation:
    "Multiple accounts improve security isolation and simplify cost allocation.",
  coaching: "Accounts = isolation + billing clarity.",
},
{
  id: "hard-bill-org-01",
  domain: "Billing & Pricing",
  difficulty: "Hard",
  prompt: "A company uses multiple AWS accounts under AWS Organizations. Management wants to reduce overall costs while still allowing each team to see their own usage. Which feature best meets this requirement?",
  choices: [
    { id: "A", text: "Separate invoices for each AWS account" },
    { id: "B", text: "Consolidated billing with cost allocation tags" },
    { id: "C", text: "AWS Budgets with account-level alerts" },
    { id: "D", text: "AWS Cost Explorer forecasts only" },
  ],
  answerId: "B",
  explanation:
    "Consolidated billing aggregates usage across accounts for volume discounts, while cost allocation tags allow teams to track their own costs.",
  coaching:
    "Organizations + tags = savings + visibility.",
  whyWrong: {
    A: "Separate invoices remove the benefits of consolidated billing and volume discounts.",
    C: "Budgets provide alerts but do not allocate or reduce costs.",
    D: "Cost Explorer forecasts costs but does not enforce allocation or savings.",
  },
},

{
  id: "hard-sec-iam-01",
  domain: "Security",
  difficulty: "Hard",
  prompt: "A security team wants to ensure that no AWS resources are created without encryption enabled. Which AWS service helps enforce this requirement across accounts?",
  choices: [
    { id: "A", text: "IAM permission boundaries" },
    { id: "B", text: "AWS Config rules" },
    { id: "C", text: "AWS Shield Advanced" },
    { id: "D", text: "Amazon GuardDuty" },
  ],
  answerId: "B",
  explanation:
    "AWS Config rules can evaluate resource configurations and enforce compliance such as encryption requirements.",
  coaching:
    "Config = continuous compliance checking.",
  whyWrong: {
    A: "Permission boundaries limit permissions, not resource configuration.",
    C: "Shield protects against DDoS attacks, not encryption policies.",
    D: "GuardDuty detects threats but does not enforce configuration rules.",
  },
},

{
  id: "hard-tech-ha-01",
  domain: "Technology",
  difficulty: "Hard",
  prompt: "An application must remain available even if an entire Availability Zone fails. Which AWS design principle supports this requirement?",
  choices: [
    { id: "A", text: "Vertical scaling" },
    { id: "B", text: "Single-instance deployment" },
    { id: "C", text: "Multi-AZ architecture" },
    { id: "D", text: "Reserved Instances" },
  ],
  answerId: "C",
  explanation:
    "Multi-AZ architectures distribute resources across Availability Zones to ensure high availability.",
  coaching:
    "AZ failure tolerance = Multi-AZ.",
  whyWrong: {
    A: "Vertical scaling increases size, not fault tolerance.",
    B: "Single-instance deployments create a single point of failure.",
    D: "Reserved Instances reduce cost, not improve availability.",
  },
},

{
  id: "hard-cloud-shared-01",
  domain: "Cloud Concepts",
  difficulty: "Hard",
  prompt: "Which AWS responsibility falls under the customer's responsibility in the shared responsibility model?",
  choices: [
    { id: "A", text: "Physical security of data centers" },
    { id: "B", text: "Patching the hypervisor" },
    { id: "C", text: "Configuring security groups" },
    { id: "D", text: "Maintaining network infrastructure" },
  ],
  answerId: "C",
  explanation:
    "Customers are responsible for configuring security controls like security groups.",
  coaching:
    "AWS secures the cloud; you secure what's in the cloud.",
  whyWrong: {
    A: "AWS manages physical data center security.",
    B: "AWS patches the hypervisor layer.",
    D: "AWS maintains the underlying network infrastructure.",
  },
},

{
  id: "hard-bill-budget-01",
  domain: "Billing & Pricing",
  difficulty: "Hard",
  prompt: "A finance team wants alerts when forecasted monthly AWS costs exceed a threshold. Which service should they use?",
  choices: [
    { id: "A", text: "AWS Budgets" },
    { id: "B", text: "AWS Cost Explorer only" },
    { id: "C", text: "AWS Trusted Advisor" },
    { id: "D", text: "AWS Billing Conductor" },
  ],
  answerId: "A",
  explanation:
    "AWS Budgets supports forecast-based alerts when costs exceed defined thresholds.",
  coaching:
    "Alerts on cost = AWS Budgets.",
  whyWrong: {
    B: "Cost Explorer provides visualization but no alerting.",
    C: "Trusted Advisor gives recommendations, not cost alerts.",
    D: "Billing Conductor is for chargeback, not alerts.",
  },
},

// (10 more HARD questions would continue in the same structure)
{
  id: "hard-tech-scale-02",
  domain: "Technology",
  difficulty: "Hard",
  prompt:
    "A company experiences unpredictable traffic spikes during marketing campaigns. They want to ensure performance without paying for unused capacity during off-peak hours. Which AWS feature best meets this requirement?",
  choices: [
    { id: "A", text: "Auto Scaling groups" },
    { id: "B", text: "Reserved Instances" },
    { id: "C", text: "Dedicated Hosts" },
    { id: "D", text: "Manual instance resizing" },
  ],
  answerId: "A",
  explanation:
    "Auto Scaling automatically adjusts capacity based on demand, ensuring performance during spikes and cost efficiency during low usage.",
  coaching:
    "Unpredictable traffic + cost efficiency = Auto Scaling.",
  whyWrong: {
    B: "Reserved Instances reduce cost but do not automatically scale.",
    C: "Dedicated Hosts are for compliance or licensing, not elasticity.",
    D: "Manual resizing is slow and error-prone.",
  },
},

{
  id: "hard-sec-logging-02",
  domain: "Security",
  difficulty: "Hard",
  prompt:
    "An auditor asks for a record of all API calls made in an AWS account over the last 90 days. Which service provides this information?",
  choices: [
    { id: "A", text: "Amazon CloudWatch Logs" },
    { id: "B", text: "AWS CloudTrail" },
    { id: "C", text: "AWS Config" },
    { id: "D", text: "Amazon Inspector" },
  ],
  answerId: "B",
  explanation:
    "AWS CloudTrail records API calls and account activity for auditing and compliance.",
  coaching:
    "API activity history = CloudTrail.",
  whyWrong: {
    A: "CloudWatch Logs stores application logs, not API call history.",
    C: "Config tracks resource configuration changes, not API calls.",
    D: "Inspector scans for vulnerabilities, not audit logs.",
  },
},

{
  id: "hard-bill-ri-02",
  domain: "Billing & Pricing",
  difficulty: "Hard",
  prompt:
    "A workload runs continuously and is expected to remain stable for the next year. Which pricing option offers the greatest cost savings?",
  choices: [
    { id: "A", text: "On-Demand Instances" },
    { id: "B", text: "Spot Instances" },
    { id: "C", text: "Reserved Instances" },
    { id: "D", text: "Savings Plans with no commitment" },
  ],
  answerId: "C",
  explanation:
    "Reserved Instances provide significant discounts for predictable, steady-state workloads.",
  coaching:
    "Steady usage over time = Reserved Instances.",
  whyWrong: {
    A: "On-Demand is flexible but the most expensive long-term.",
    B: "Spot Instances can be interrupted and are not suitable for steady workloads.",
    D: "Savings Plans require commitment; no-commitment offers no discount.",
  },
},

{
  id: "hard-cloud-global-02",
  domain: "Cloud Concepts",
  difficulty: "Hard",
  prompt:
    "Which AWS component is used to isolate failures and improve fault tolerance within a single Region?",
  choices: [
    { id: "A", text: "Regions" },
    { id: "B", text: "Availability Zones" },
    { id: "C", text: "Edge Locations" },
    { id: "D", text: "Local Zones" },
  ],
  answerId: "B",
  explanation:
    "Availability Zones are physically separate locations within a Region designed to isolate failures.",
  coaching:
    "Fault isolation inside a Region = AZs.",
  whyWrong: {
    A: "Regions isolate failures geographically, not within a Region.",
    C: "Edge Locations are for content delivery.",
    D: "Local Zones extend Regions but do not replace AZ fault isolation.",
  },
},

{
  id: "hard-sec-root-02",
  domain: "Security",
  difficulty: "Hard",
  prompt:
    "Which security best practice is MOST important for protecting an AWS account?",
  choices: [
    { id: "A", text: "Using the root account for daily tasks" },
    { id: "B", text: "Enabling MFA on the root account" },
    { id: "C", text: "Sharing IAM user credentials" },
    { id: "D", text: "Disabling CloudTrail" },
  ],
  answerId: "B",
  explanation:
    "Enabling MFA on the root account is a critical security control to prevent unauthorized access.",
  coaching:
    "Root account = lock it down.",
  whyWrong: {
    A: "Root should not be used for daily operations.",
    C: "Credentials should never be shared.",
    D: "CloudTrail should always be enabled.",
  },
},

{
  id: "hard-tech-serverless-02",
  domain: "Technology",
  difficulty: "Hard",
  prompt:
    "Which AWS service allows you to run code without provisioning or managing servers?",
  choices: [
    { id: "A", text: "Amazon EC2" },
    { id: "B", text: "AWS Lambda" },
    { id: "C", text: "Amazon ECS on EC2" },
    { id: "D", text: "Elastic Beanstalk with EC2" },
  ],
  answerId: "B",
  explanation:
    "AWS Lambda is a serverless compute service that runs code without server management.",
  coaching:
    "No servers to manage = Lambda.",
  whyWrong: {
    A: "EC2 requires server provisioning.",
    C: "ECS on EC2 still requires servers.",
    D: "Elastic Beanstalk manages infrastructure but still uses EC2.",
  },
},

{
  id: "hard-bill-tags-02",
  domain: "Billing & Pricing",
  difficulty: "Hard",
  prompt:
    "A company wants to allocate AWS costs by department. What must be enabled to achieve this?",
  choices: [
    { id: "A", text: "IAM roles" },
    { id: "B", text: "Cost allocation tags" },
    { id: "C", text: "AWS Budgets" },
    { id: "D", text: "AWS Shield" },
  ],
  answerId: "B",
  explanation:
    "Cost allocation tags allow tracking and reporting costs by business dimensions like departments.",
  coaching:
    "Who spent what = cost allocation tags.",
  whyWrong: {
    A: "IAM roles manage permissions, not cost reporting.",
    C: "Budgets alert on costs but don’t allocate them.",
    D: "Shield protects against DDoS attacks.",
  },
},

{
  id: "hard-cloud-support-02",
  domain: "Cloud Concepts",
  difficulty: "Hard",
  prompt:
    "Which AWS Support plan includes access to a Technical Account Manager (TAM)?",
  choices: [
    { id: "A", text: "Basic" },
    { id: "B", text: "Developer" },
    { id: "C", text: "Business" },
    { id: "D", text: "Enterprise" },
  ],
  answerId: "D",
  explanation:
    "The Enterprise support plan provides a designated Technical Account Manager.",
  coaching:
    "TAM = Enterprise support.",
  whyWrong: {
    A: "Basic has no technical support.",
    B: "Developer has limited support.",
    C: "Business has support but no dedicated TAM.",
  },
},

{
  id: "hard-sec-data-02",
  domain: "Security",
  difficulty: "Hard",
  prompt:
    "Which AWS service helps classify and protect sensitive data such as PII stored in S3?",
  choices: [
    { id: "A", text: "AWS Macie" },
    { id: "B", text: "AWS Shield" },
    { id: "C", text: "Amazon GuardDuty" },
    { id: "D", text: "AWS WAF" },
  ],
  answerId: "A",
  explanation:
    "AWS Macie uses machine learning to discover and protect sensitive data in S3.",
  coaching:
    "PII discovery in S3 = Macie.",
  whyWrong: {
    B: "Shield protects against DDoS attacks.",
    C: "GuardDuty detects threats, not data classification.",
    D: "WAF protects web applications.",
  },
},
    ];
    export const QUESTION_COUNT = QUESTION_BANK.length;