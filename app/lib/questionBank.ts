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
  explanation?: string;
  coaching: string;
  whyCorrect: string;
  whyWrong?: Partial<Record<ChoiceId, string>>;
  memoryHook?: string;
  testedConcepts?: string[];
  sources?: { title: string; url: string }[];
  verified?: boolean;
};

type QuestionBase = Omit<
  Question,
  "whyCorrect" | "whyWrong" | "memoryHook" | "testedConcepts" | "sources" | "verified"
> & {
  whyWrong?: Partial<Record<ChoiceId, string>>;
};

// ✅ Move the entire array here (paste your current QUESTION_BANK contents)
const QUESTION_BANK_BASE: QuestionBase[] = [
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

const NOT_VERIFIED = "Not verified yet — add a source or knowledge entry.";
const buildDefaultWhyWrong = (
  correct: ChoiceId,
): Partial<Record<ChoiceId, string>> => {
  const all: Partial<Record<ChoiceId, string>> = {
    A: NOT_VERIFIED,
    B: NOT_VERIFIED,
    C: NOT_VERIFIED,
    D: NOT_VERIFIED,
  };
  delete all[correct];
  return all;
};

const mergeWhyWrong = (
  correct: ChoiceId,
  overrides?: Partial<Record<ChoiceId, string>>,
) => ({
  ...buildDefaultWhyWrong(correct),
  ...(overrides ?? {}),
});

type QuestionKnowledge = {
  whyCorrect: string;
  memoryHook: string;
  whyWrong?: Partial<Record<ChoiceId, string>>;
};

const QUESTION_KNOWLEDGE: Record<string, QuestionKnowledge> = {
  "sec-shared": {
    whyCorrect:
      "The shared responsibility model says AWS secures the cloud infrastructure, while customers secure what they deploy in the cloud. That makes \"security of the cloud (infrastructure)\" the AWS responsibility.",
    whyWrong: {
      A: "The knowledge base assigns customer responsibility for data and access, so data classification is not AWS's role.",
      D: "IAM and configuration are customer responsibilities under the shared responsibility model.",
    },
    memoryHook: "AWS = security of the cloud; you = security in the cloud.",
  },
  "cc-paygo": {
    whyCorrect:
      "Billing knowledge lists pricing models such as On-Demand, and the question describes a pay-as-you-go principle that reduces upfront costs. Pay-as-you-go aligns with paying only for usage instead of buying capacity upfront.",
    memoryHook: "Pay-as-you-go = no upfront buy.",
  },
  "sec-mfa": {
    whyCorrect:
      "The knowledge base recommends enabling MFA on the root account and locking it down. MFA adds a second factor to protect the most sensitive identity.",
    whyWrong: {
      C: "The knowledge base says to avoid daily root usage; using root for daily administration conflicts with that guidance.",
    },
    memoryHook: "Root + MFA, then lock it down.",
  },
  "sec-iam-role": {
    whyCorrect:
      "The knowledge base says to use IAM roles for EC2 to access AWS services without storing keys. An instance role provides temporary credentials, so this is the secure approach.",
    whyWrong: {
      A: "The knowledge base recommends roles instead of storing access keys on instances.",
      D: "The knowledge base recommends roles instead of exposed credentials.",
    },
    memoryHook: "EC2 access = IAM role.",
  },
  "sec-kms": {
    whyCorrect:
      "The knowledge base points to AWS KMS for encryption keys used with S3 and EBS. Therefore KMS is the service for creating and managing encryption keys.",
    memoryHook: "Keys = KMS.",
  },
  "sec-least-privilege": {
    whyCorrect:
      "The knowledge base says to apply least-privilege policies. That means granting only the permissions needed to perform a task.",
    whyWrong: {
      A: "Least privilege is the opposite of default admin access.",
      D: "The knowledge base advises against daily root usage; least privilege avoids that.",
    },
    memoryHook: "Least privilege = minimum access.",
  },
  "sec-cloudtrail": {
    whyCorrect:
      "Monitoring knowledge defines CloudTrail as recording API calls and account activity for audit. That matches the question.",
    whyWrong: {
      A: "CloudWatch is for metrics and logs, while CloudTrail is for API auditing.",
    },
    memoryHook: "Trail = API audit log.",
  },
  "sec-shared-s3": {
    whyCorrect:
      "The shared responsibility model says customers secure their data and configurations. Encrypting data stored in S3 is part of securing customer data, so it is the customer's responsibility.",
    whyWrong: {
      A: "The knowledge base assigns AWS responsibility to infrastructure, not customer data.",
      C: "The knowledge base assigns data security to the customer, so \"both\" does not match the described split.",
    },
    memoryHook: "Your data, your responsibility.",
  },
  "hard-sec-root-02": {
    whyCorrect:
      "The knowledge base explicitly recommends enabling MFA on the root account and locking it down. That is the most important protection step listed.",
    whyWrong: {
      A: "The knowledge base says to avoid daily root usage, so using root daily is a bad practice.",
    },
    memoryHook: "Protect root with MFA.",
  },
  "tech-ec2": {
    whyCorrect:
      "Compute knowledge defines EC2 as virtual servers you manage. Resizable compute capacity in the cloud matches EC2.",
    memoryHook: "EC2 = virtual servers.",
  },
  "tech-lambda": {
    whyCorrect:
      "Compute knowledge defines Lambda as serverless functions that run on demand. That matches running code without managing servers.",
    memoryHook: "No servers? Lambda.",
  },
  "tech-efs": {
    whyCorrect:
      "Storage knowledge defines EFS as shared file storage that can be mounted by multiple EC2 instances. That matches shared file storage for EC2.",
    whyWrong: {
      A: "S3 is object storage, not a shared file system.",
      B: "EBS is block storage for a single instance.",
    },
    memoryHook: "EFS = shared file system.",
  },
  "tech-vpc": {
    whyCorrect:
      "Networking knowledge defines a VPC as an isolated virtual network. The primary purpose is network isolation.",
    memoryHook: "VPC = isolated network.",
  },
  "tech-elb": {
    whyCorrect:
      "Compute knowledge says ELB distributes traffic while Auto Scaling changes capacity. The primary function of ELB is traffic distribution across targets.",
    memoryHook: "ELB spreads traffic.",
  },
  "tech-autoscaling": {
    whyCorrect:
      "Compute knowledge says Auto Scaling changes capacity and adds EC2 instances during peak traffic. That is automatic adjustment of compute capacity.",
    memoryHook: "Auto Scaling adds/removes instances.",
  },
  "tech-cloudwatch": {
    whyCorrect:
      "Monitoring knowledge defines CloudWatch as metrics, logs, alarms, and dashboards. That matches monitoring metrics and logs.",
    whyWrong: {
      A: "CloudTrail is for API auditing, while CloudWatch is for monitoring.",
    },
    memoryHook: "CloudWatch = metrics/logs.",
  },
  "tech-network-isolation": {
    whyCorrect:
      "Security and networking knowledge say security groups are stateful instance firewalls. Instance-level inbound and outbound control is a security group.",
    whyWrong: {
      A: "NACLs are stateless subnet filters, not instance-level firewalls.",
    },
    memoryHook: "Instance firewall = SG.",
  },
  "tech-scaling-choice": {
    whyCorrect:
      "Compute knowledge defines Lambda as serverless functions that run on demand. That fits unpredictable spikes with minimal operational overhead.",
    memoryHook: "Spikes + low ops = Lambda.",
  },
  "hard-tech-scale-02": {
    whyCorrect:
      "Compute knowledge says Auto Scaling changes capacity and adds EC2 instances during peak traffic. That matches handling unpredictable spikes without paying for idle capacity.",
    memoryHook: "Spikes = Auto Scaling.",
  },
  "tech-s3": {
    whyCorrect:
      "Storage knowledge defines S3 as object storage. The question asks for object storage, so S3 fits.",
    memoryHook: "Objects live in S3 buckets.",
  },
  "bill-costexplorer": {
    whyCorrect:
      "Billing knowledge says Cost Explorer analyzes and visualizes spend trends. That matches visualizing and analyzing costs over time.",
    memoryHook: "Explore costs with Cost Explorer.",
  },
  "bill-budgets": {
    whyCorrect:
      "Billing knowledge says to set AWS Budgets alerts at thresholds like 80% and 100% of a target. That matches setting cost thresholds and alerts.",
    whyWrong: {
      B: "CloudTrail is for auditing API activity, not cost alerts.",
      C: "CloudWatch is for monitoring metrics and logs, not cost alerts.",
    },
    memoryHook: "Budget = alert.",
  },
  "bill-savingsplans": {
    whyCorrect:
      "Billing knowledge says Savings Plans are used for steady compute usage and are more flexible pricing models. A commitment to consistent usage matches Savings Plans.",
    memoryHook: "Steady compute = Savings Plans.",
  },
  "bill-free-tier": {
    whyCorrect:
      "Billing knowledge states Free Tier is limited usage. The option about helping new users explore services at low cost matches that.",
    whyWrong: {
      A: "Free Tier is limited usage, not unlimited.",
      C: "Free Tier is limited usage, not a replacement for paid services.",
      D: "Free Tier does not eliminate billing; it provides limited usage.",
    },
    memoryHook: "Free Tier is limited.",
  },
  "bill-tags": {
    whyCorrect:
      "Billing knowledge defines cost allocation tags for tracking spend by team or project. That matches organizing costs by project.",
    memoryHook: "Tags = cost allocation.",
  },
  "bill-cost-allocation": {
    whyCorrect:
      "Billing knowledge defines cost allocation tags for tracking spend by team or project. That matches breaking down costs by department.",
    whyWrong: {
      A: "Budgets are for alerts, not allocation by department.",
    },
    memoryHook: "Cost allocation = tags.",
  },
  "bill-spot": {
    whyCorrect:
      "Billing knowledge says Spot is cheap but interruptible and is used for non-critical batch jobs. That implies the key risk is interruption by AWS.",
    memoryHook: "Spot = cheap but interruptible.",
  },
  "bill-savings-vs-ri": {
    whyCorrect:
      "Billing knowledge says Savings Plans are more flexible across compute services than Reserved Instances. That flexibility is the key advantage.",
    whyWrong: {
      A: "Savings Plans are described as more flexible across compute, not only EC2.",
    },
    memoryHook: "Savings Plans = flexible coverage.",
  },
  "bill-cost-optimization": {
    whyCorrect:
      "Support knowledge says Trusted Advisor provides automated checks and recommendations, including cost-related checks. That matches recommendations to reduce costs and improve performance.",
    whyWrong: {
      A: "Budgets are for alerts, not recommendations.",
      C: "Cost Explorer analyzes trends, not recommendations.",
    },
    memoryHook: "Advisor = recommendations.",
  },
  "hard-bill-budget-01": {
    whyCorrect:
      "Billing knowledge says Budgets set alerts at thresholds, which aligns with forecasted cost alerts.",
    whyWrong: {
      B: "Cost Explorer analyzes trends, not alerts.",
      C: "Trusted Advisor provides automated checks, not cost alerts.",
    },
    memoryHook: "Forecast alerts = Budgets.",
  },
  "hard-bill-tags-02": {
    whyCorrect:
      "Billing knowledge says cost allocation tags track spend by team or department. That is required to allocate costs by department.",
    whyWrong: {
      C: "Budgets are for alerts, not allocation by department.",
    },
    memoryHook: "Departments = cost tags.",
  },
  "hard-cloud-support-02": {
    whyCorrect:
      "Support knowledge states Enterprise includes a Technical Account Manager (TAM).",
    memoryHook: "TAM = Enterprise.",
  },
  "hard-cloud-shared-01": {
    whyCorrect:
      "The shared responsibility model says customers handle configurations, and security groups are customer configuration. That makes security group configuration the customer responsibility.",
    whyWrong: {
      A: "The knowledge base assigns AWS responsibility to facilities and the underlying host layer.",
    },
    memoryHook: "Config is on you.",
  },
  "hard-sec-logging-02": {
    whyCorrect:
      "Monitoring knowledge defines CloudTrail as recording API calls and account activity for audit. That matches an audit request for API calls.",
    whyWrong: {
      A: "CloudWatch is for metrics and logs, while CloudTrail is for API auditing.",
    },
    memoryHook: "CloudTrail = API audit.",
  },
  "cc-elasticity": {
    whyCorrect:
      "Elasticity means resources scale up or down automatically to match demand, which reduces upfront capacity planning.",
    whyWrong: {
      A: "Fixed capacity planning is the opposite of elastic scaling.",
      C: "Manual hardware upgrades are traditional infrastructure work, not elasticity.",
      D: "Single data center operation is about location, not scaling.",
    },
    memoryHook: "Elasticity = automatic scale.",
  },
  "cc-global": {
    whyCorrect:
      "An AWS Region is a geographic area that contains multiple Availability Zones.",
    whyWrong: {
      A: "Edge locations are for content delivery, not Regions.",
      C: "A single data center is smaller than a Region and does not define it.",
      D: "An AWS account boundary is an identity boundary, not a Region.",
    },
    memoryHook: "Region = geography + multiple AZs.",
  },
  "cc-az": {
    whyCorrect:
      "Multiple Availability Zones improve fault tolerance and high availability by avoiding a single point of failure.",
    whyWrong: {
      A: "AZs are used to improve availability, not increase latency.",
      C: "IAM complexity is unrelated to Availability Zones.",
      D: "Backups are still required even with Multi-AZ designs.",
    },
    memoryHook: "Multi-AZ = high availability.",
  },
  "tech-rds": {
    whyCorrect:
      "Amazon RDS is the managed relational database service in AWS.",
    whyWrong: {
      B: "Amazon S3 is object storage, not a relational database.",
      C: "Amazon EMR is for big data processing, not relational databases.",
      D: "AWS Direct Connect is networking, not a database service.",
    },
    memoryHook: "Relational DB = RDS.",
  },
  "tech-cloudfront": {
    whyCorrect:
      "Amazon CloudFront is a content delivery network that caches content at edge locations for low latency.",
    whyWrong: {
      B: "Route 53 is DNS, not a CDN.",
      C: "Snowball is for data transfer, not global content delivery.",
      D: "Redshift is a data warehouse, not a CDN.",
    },
    memoryHook: "CDN + edge = CloudFront.",
  },
  "cc-scalability": {
    whyCorrect:
      "Scalability refers to planned growth, while elasticity adjusts resources automatically based on demand.",
    whyWrong: {
      A: "Scalability and elasticity are related but not the same.",
      C: "This reverses the typical distinction between scalability and elasticity.",
      D: "Scalability applies to more than just storage.",
    },
    memoryHook: "Scalability plans; elasticity auto-adjusts.",
  },
  "cc-ha": {
    whyCorrect:
      "High availability is designed to avoid single points of failure so services remain up during component failures.",
    whyWrong: {
      A: "HA is about availability, not preventing security breaches.",
      B: "HA does not directly control costs.",
      D: "HA addresses infrastructure failures, not application code quality.",
    },
    memoryHook: "HA = no single point of failure.",
  },
  "cc-dr": {
    whyCorrect:
      "Disaster recovery focuses on restoring systems and data after an outage or failure.",
    whyWrong: {
      A: "Reducing latency is a performance goal, not DR.",
      C: "Security posture is a separate concern from recovery after failure.",
      D: "DR is about recovery, not lowering monthly costs.",
    },
    memoryHook: "DR = recover after failure.",
  },
  "cc-capex-opex": {
    whyCorrect:
      "Cloud services primarily shift spending to operational expenditure (OpEx) rather than upfront capital expenditure (CapEx).",
    whyWrong: {
      A: "CapEx is upfront investment, which cloud aims to reduce.",
      C: "Depreciation is an on-prem accounting model, not a cloud pricing model.",
      D: "Upfront capital investment is the opposite of cloud's OpEx model.",
    },
    memoryHook: "Cloud = OpEx.",
  },
  "sec-encryption-at-rest": {
    whyCorrect:
      "Encryption at rest protects data stored on disks or storage media.",
    whyWrong: {
      A: "Data moving across networks is encryption in transit.",
      C: "IAM credentials are identities, not stored data.",
      D: "Application code is not the focus of encryption at rest.",
    },
    memoryHook: "At rest = stored data.",
  },
  "sec-shield": {
    whyCorrect:
      "AWS Shield is the managed service that protects against DDoS attacks.",
    whyWrong: {
      B: "Inspector is for vulnerability scanning, not DDoS protection.",
      C: "Artifact is for compliance reports, not DDoS protection.",
      D: "Trusted Advisor provides recommendations, not DDoS protection.",
    },
    memoryHook: "DDoS protection = Shield.",
  },
  "tech-dynamodb": {
    whyCorrect:
      "Amazon DynamoDB is a fully managed NoSQL database service.",
    whyWrong: {
      A: "Amazon RDS is relational, not NoSQL.",
      C: "Amazon Redshift is a data warehouse, not NoSQL.",
      D: "Amazon Aurora is relational, not NoSQL.",
    },
    memoryHook: "NoSQL = DynamoDB.",
  },
  "bill-consolidated": {
    whyCorrect:
      "Consolidated billing combines usage across accounts, which enables volume discounts.",
    whyWrong: {
      A: "Separate invoices reduce consolidation benefits.",
      B: "Credentials should not be shared across accounts.",
      D: "Consolidated billing supports automated allocation beyond manual methods.",
    },
    memoryHook: "Consolidated billing = volume discounts.",
  },
  "cc-economies-scale": {
    whyCorrect:
      "Economies of scale lower per-unit costs when demand is aggregated across many customers.",
    whyWrong: {
      A: "Economies of scale reduce, not increase, upfront costs.",
      C: "Manual management is not a benefit of scale.",
      D: "Dedicated hardware per customer reduces scale efficiency.",
    },
    memoryHook: "Scale = lower unit cost.",
  },
  "cc-global-infra": {
    whyCorrect:
      "Global infrastructure lets you deploy closer to users to reduce latency.",
    whyWrong: {
      A: "Global infrastructure enables multi-region, not single-region only.",
      C: "Traffic routing is automated through AWS services, not manual by default.",
      D: "Global infrastructure reduces, not increases, on-prem costs.",
    },
    memoryHook: "Global = closer to users.",
  },
  "sec-config": {
    whyCorrect:
      "AWS Config evaluates resource configurations against rules for compliance.",
    whyWrong: {
      B: "AWS Shield is DDoS protection, not configuration compliance.",
      C: "GuardDuty detects threats, not configuration compliance.",
      D: "Artifact provides compliance reports, not configuration evaluation.",
    },
    memoryHook: "Config = compliance rules.",
  },
  "sec-guardduty": {
    whyCorrect:
      "Amazon GuardDuty analyzes logs to detect suspicious or malicious activity.",
    whyWrong: {
      A: "Inspector focuses on vulnerabilities, not threat detection.",
      C: "AWS Config checks configuration compliance, not threats.",
      D: "Trusted Advisor provides recommendations, not threat detection.",
    },
    memoryHook: "Threat detection = GuardDuty.",
  },
  "sec-encryption-transit": {
    whyCorrect:
      "Encryption in transit protects data as it moves between systems over a network.",
    whyWrong: {
      A: "Stored data is protected by encryption at rest.",
      C: "IAM permissions are access control, not data-in-transit protection.",
      D: "Encryption in transit applies broadly, not only to billing data.",
    },
    memoryHook: "In transit = data moving.",
  },
  "tech-ami": {
    whyCorrect:
      "An AMI is a template used to launch EC2 instances with predefined configurations.",
    whyWrong: {
      A: "Object storage is handled by S3, not AMIs.",
      C: "IAM user management is separate from AMIs.",
      D: "Monitoring metrics is handled by CloudWatch, not AMIs.",
    },
    memoryHook: "AMI = EC2 template.",
  },
  "bill-on-demand": {
    whyCorrect:
      "On-Demand pricing charges only for actual usage without long-term commitments.",
    whyWrong: {
      A: "On-Demand does not require long-term commitments.",
      C: "On-Demand is flexible, but not always the lowest cost.",
      D: "Interruptible capacity is a Spot characteristic, not On-Demand.",
    },
    memoryHook: "On-Demand = pay per use.",
  },
  "bill-reserved": {
    whyCorrect:
      "Reserved Instances provide significant cost savings for steady, predictable usage.",
    whyWrong: {
      A: "Reserved Instances require a commitment.",
      C: "Interruptible pricing is a Spot characteristic, not Reserved Instances.",
      D: "Reserved Instances apply to compute usage, not only storage.",
    },
    memoryHook: "RI = steady usage savings.",
  },
  "cc-well-architected": {
    whyCorrect:
      "The AWS Well-Architected Framework provides best practices for secure, high-performing workloads.",
    whyWrong: {
      A: "Trusted Advisor gives recommendations but is not the formal framework.",
      C: "Service Health Dashboard reports outages, not best practices.",
      D: "Organizations is governance, not architecture guidance.",
    },
    memoryHook: "Best practices = Well-Architected.",
  },
  "cc-design-tradeoffs": {
    whyCorrect:
      "Designing for failure means assuming components will fail and building fault tolerance.",
    whyWrong: {
      A: "Larger instances do not eliminate failure risk.",
      C: "Manual recovery alone is not fault-tolerant design.",
      D: "Single-AZ deployments increase failure risk.",
    },
    memoryHook: "Assume failure; design for it.",
  },
  "sec-iam-evaluation": {
    whyCorrect:
      "In IAM policy evaluation, an explicit deny always overrides an allow.",
    whyWrong: {
      A: "Allow never overrides an explicit deny.",
      B: "Policy order does not override explicit deny.",
      D: "IAM does not average policies.",
    },
    memoryHook: "Explicit deny wins.",
  },
  "sec-root-usage": {
    whyCorrect:
      "Root is intended for account-level tasks such as changing support plans or account settings.",
    whyWrong: {
      A: "Launching EC2 is routine and should be done with IAM users or roles.",
      B: "Daily IAM management should not use the root user.",
      D: "Managing S3 is a routine task and should not use root.",
    },
    memoryHook: "Root = account setup only.",
  },
  "tech-ec2-ebs": {
    whyCorrect:
      "Instance store data is ephemeral and is lost when the instance stops.",
    whyWrong: {
      A: "Instance store does not persist after stop.",
      C: "Instance store is not automatically backed up to S3.",
      D: "Instance store data does not move to EBS automatically.",
    },
    memoryHook: "Instance store = temporary.",
  },
  "tech-rds-backups": {
    whyCorrect:
      "Automated RDS backups are enabled when the backup retention period is greater than zero.",
    whyWrong: {
      A: "Multi-AZ improves availability but does not enable backups.",
      C: "Read replicas are for scaling reads, not enabling backups.",
      D: "Disabling encryption is unrelated to automated backups.",
    },
    memoryHook: "Backups = retention > 0.",
  },
  "bill-data-transfer": {
    whyCorrect:
      "Inbound data transfer into AWS from the internet is typically free.",
    whyWrong: {
      A: "Inter-Region transfer usually has charges.",
      B: "Data transfer out to the internet typically incurs charges.",
      D: "Direct Connect data transfer is not generally free.",
    },
    memoryHook: "Data in = free.",
  },
  "bill-multi-account": {
    whyCorrect:
      "Multiple accounts improve isolation and simplify cost tracking and chargeback.",
    whyWrong: {
      A: "Accounts are not meant to bypass service limits.",
      C: "Sharing root credentials is a security anti-pattern.",
      D: "Multiple accounts still rely on IAM.",
    },
    memoryHook: "Accounts = isolation + cost clarity.",
  },
  "hard-bill-org-01": {
    whyCorrect:
      "Consolidated billing provides volume discounts, and cost allocation tags let teams track their own spend.",
    whyWrong: {
      A: "Separate invoices lose consolidation benefits.",
      C: "Budgets provide alerts but not allocation visibility.",
      D: "Cost Explorer forecasts costs but does not allocate or reduce them.",
    },
    memoryHook: "Organizations + tags = savings + visibility.",
  },
  "hard-sec-iam-01": {
    whyCorrect:
      "AWS Config rules can evaluate resource configurations for compliance, including encryption requirements.",
    whyWrong: {
      A: "Permission boundaries limit permissions, not configuration compliance.",
      C: "Shield Advanced is for DDoS protection, not encryption enforcement.",
      D: "GuardDuty detects threats, not configuration compliance.",
    },
    memoryHook: "Config rules = enforce compliance.",
  },
  "hard-tech-ha-01": {
    whyCorrect:
      "Multi-AZ architecture distributes resources across Availability Zones for high availability.",
    whyWrong: {
      A: "Vertical scaling increases size, not fault tolerance.",
      B: "Single-instance deployments create a single point of failure.",
      D: "Reserved Instances reduce cost, not improve availability.",
    },
    memoryHook: "AZ failure tolerance = Multi-AZ.",
  },
  "hard-bill-ri-02": {
    whyCorrect:
      "Reserved Instances offer the largest savings for steady, predictable workloads over a long period.",
    whyWrong: {
      A: "On-Demand is flexible but more expensive for steady use.",
      B: "Spot instances can be interrupted and are not ideal for steady workloads.",
      D: "Savings Plans require a commitment; a no-commitment option offers no discount.",
    },
    memoryHook: "Steady year = Reserved Instances.",
  },
  "hard-cloud-global-02": {
    whyCorrect:
      "Availability Zones are separate locations within a Region used for fault isolation.",
    whyWrong: {
      A: "Regions provide geographic isolation, not intra-region fault isolation.",
      C: "Edge locations are for content delivery, not fault isolation inside a Region.",
      D: "Local Zones extend Regions but are not the primary fault isolation units.",
    },
    memoryHook: "Inside a Region = AZs.",
  },
  "hard-tech-serverless-02": {
    whyCorrect:
      "AWS Lambda runs code without provisioning or managing servers.",
    whyWrong: {
      A: "EC2 requires you to manage servers.",
      C: "ECS on EC2 still requires server management.",
      D: "Elastic Beanstalk uses EC2 under the hood.",
    },
    memoryHook: "Serverless code = Lambda.",
  },
  "hard-sec-data-02": {
    whyCorrect:
      "AWS Macie discovers and helps protect sensitive data stored in S3.",
    whyWrong: {
      B: "Shield protects against DDoS attacks, not data classification.",
      C: "GuardDuty detects threats, not sensitive data classification.",
      D: "WAF protects web applications, not S3 data classification.",
    },
    memoryHook: "PII in S3 = Macie.",
  },
};

const EXTRA_QUESTIONS: Question[] = [
  {
    id: "clf-071",
    domain: "Cloud Concepts",
    difficulty: "Medium",
    prompt: "Which statement best describes the AWS Shared Responsibility Model?",
    choices: [
      {
        id: "A",
        text:
          "AWS is responsible for security in the cloud, and the customer is responsible for security of the cloud.",
      },
      {
        id: "B",
        text: "AWS and the customer always share every security task equally.",
      },
      {
        id: "C",
        text:
          "AWS is responsible for security of the cloud, and the customer is responsible for security in the cloud.",
      },
      {
        id: "D",
        text: "The customer is responsible for physical security of AWS data centers.",
      },
    ],
    answerId: "C",
    explanation:
      "AWS secures the underlying infrastructure (security of the cloud). Customers secure what they build and configure (security in the cloud).",
    whyCorrect:
      "The Shared Responsibility Model splits responsibilities: AWS handles the infrastructure layers (facilities, hardware, virtualization), while customers manage configuration, identity, data protection, and application-level controls depending on the services used.",
    whyWrong: {
      A: "This reverses the model. Customers do not secure the underlying AWS infrastructure layers.",
      B: "Responsibilities vary by service model (IaaS vs PaaS vs SaaS); tasks are not always equal.",
      D: "Physical data center security is AWS’s responsibility, not the customer’s.",
    },
    coaching:
      "Exam rule: **AWS = security OF the cloud; You = security IN the cloud.** Trap: answers that flip those two phrases are almost always wrong.",
    memoryHook: "OF = AWS’s roof; IN = your stuff inside.",
    testedConcepts: [
      "Shared Responsibility Model",
      "IaaS vs PaaS vs SaaS responsibility boundaries",
    ],
    sources: [
      {
        title: "Shared Responsibility Model (AWS)",
        url: "https://aws.amazon.com/compliance/shared-responsibility-model/",
      },
    ],
    verified: true,
  },
  {
    id: "clf-072",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A workload runs continuously and uses consistent compute capacity. Which pricing option typically provides the lowest cost while still allowing flexibility across compute services?",
    choices: [
      { id: "A", text: "On-Demand Instances" },
      { id: "B", text: "Spot Instances" },
      { id: "C", text: "Compute Savings Plans" },
      { id: "D", text: "Dedicated Hosts" },
    ],
    answerId: "C",
    explanation:
      "Compute Savings Plans offer discounted pricing for a committed spend, applying across EC2 instance families, AWS Fargate, and Lambda (subject to plan terms).",
    whyCorrect:
      "Compute Savings Plans generally provide strong discounts for steady usage and are more flexible than Reserved Instances because they apply across instance families/regions (within the plan) and also cover Fargate/Lambda.",
    whyWrong: {
      A: "On-Demand is flexible but usually more expensive for steady, predictable usage.",
      B: "Spot can be cheapest but is interruptible; not ideal for continuous guaranteed capacity without interruption tolerance.",
      D: "Dedicated Hosts are for compliance/licensing needs and are typically not the lowest-cost option.",
    },
    coaching:
      "Keyword spotting: **steady, always-on** → look for **Savings Plans/Reserved**. Trap: **Spot** is cheap but interruptible; don’t pick it unless the question says “fault-tolerant/interruptible.”",
    memoryHook: "Steady spend → Savings Plan.",
    testedConcepts: ["Savings Plans vs Reserved Instances", "Spot interruptibility", "Pricing models"],
    sources: [{ title: "Savings Plans (AWS)", url: "https://aws.amazon.com/savingsplans/" }],
    verified: true,
  },
  {
    id: "clf-073",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "Which AWS service is primarily used to distribute incoming application traffic across multiple targets such as EC2 instances?",
    choices: [
      { id: "A", text: "Amazon Route 53" },
      { id: "B", text: "Elastic Load Balancing (ELB)" },
      { id: "C", text: "Amazon CloudFront" },
      { id: "D", text: "AWS Direct Connect" },
    ],
    answerId: "B",
    explanation:
      "Elastic Load Balancing distributes incoming traffic across multiple targets (for example, EC2 instances, containers, IPs).",
    whyCorrect:
      "ELB is designed to balance traffic across targets to improve availability and fault tolerance at the application layer.",
    whyWrong: {
      A: "Route 53 is DNS (name resolution/traffic routing at the DNS level), not an in-path load balancer.",
      C: "CloudFront is a CDN for caching and edge delivery; it’s not the primary L7/L4 load balancer for targets.",
      D: "Direct Connect is a dedicated network connection from on-prem to AWS; it doesn’t distribute application traffic.",
    },
    coaching:
      "Exam shortcut: **“distribute traffic across EC2/targets” = ELB.** Trap: Route 53 routes at DNS, CloudFront caches at edge—neither is a classic load balancer.",
    memoryHook: "ELB = balances live requests.",
    testedConcepts: ["Load balancing", "High availability", "Networking basics"],
    sources: [
      {
        title: "Elastic Load Balancing (AWS)",
        url: "https://aws.amazon.com/elasticloadbalancing/",
      },
    ],
    verified: true,
  },
  {
    id: "clf-074",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A company needs to centrally manage permissions across many AWS accounts using roles and permission sets. Which AWS service is designed for this?",
    choices: [
      { id: "A", text: "AWS Identity and Access Management (IAM) users in each account" },
      { id: "B", text: "AWS IAM Identity Center (AWS Single Sign-On)" },
      { id: "C", text: "Amazon Cognito user pools" },
      { id: "D", text: "AWS Key Management Service (KMS)" },
    ],
    answerId: "B",
    explanation:
      "IAM Identity Center centralizes workforce access to multiple AWS accounts with permission sets and role-based access.",
    whyCorrect:
      "IAM Identity Center is purpose-built to manage workforce access across AWS Organizations accounts using permission sets that map to roles in each account.",
    whyWrong: {
      A: "Managing IAM users separately in each account is not centralized and doesn’t scale well.",
      C: "Cognito is for app end-user authentication, not workforce access across AWS accounts.",
      D: "KMS manages encryption keys; it is not an identity/permission management solution.",
    },
    coaching:
      "If you see **“central access across many AWS accounts”** and **permission sets**, the answer is **IAM Identity Center**. Trap: Cognito = app users; IAM users per account = not centralized.",
    memoryHook: "Workforce SSO = Identity Center.",
    testedConcepts: [
      "Workforce identity",
      "Organizations multi-account access",
      "Permission sets vs IAM users",
    ],
    sources: [
      {
        title: "IAM Identity Center (AWS)",
        url: "https://aws.amazon.com/iam/identity-center/",
      },
    ],
    verified: true,
  },
  {
    id: "clf-075",
    domain: "Billing & Pricing",
    difficulty: "Medium",
    prompt:
      "Which AWS tool is best for visualizing historical spend trends and filtering costs by service over time?",
    choices: [
      { id: "A", text: "AWS Budgets" },
      { id: "B", text: "AWS Cost Explorer" },
      { id: "C", text: "AWS CloudTrail" },
      { id: "D", text: "Amazon CloudWatch" },
    ],
    answerId: "B",
    explanation:
      "Cost Explorer provides dashboards to analyze and visualize historical AWS costs and usage.",
    whyCorrect:
      "Cost Explorer is designed for interactive cost analysis: trends, filters, groupings, and time-based exploration.",
    whyWrong: {
      A: "Budgets is for thresholds and alerts; it’s not the primary interactive spend exploration tool.",
      C: "CloudTrail records API calls for auditing, not cost analysis.",
      D: "CloudWatch is monitoring/metrics/logs, not cost analytics.",
    },
    coaching:
      "Keyword: **visualize / trends / over time** → **Cost Explorer**. Keyword: **alerts / thresholds** → **Budgets**.",
    memoryHook: "Explorer = explore spend; Budgets = alerts.",
    testedConcepts: ["Cost Explorer vs Budgets", "Cost management tools"],
    sources: [
      {
        title: "AWS Cost Explorer (AWS)",
        url: "https://aws.amazon.com/aws-cost-management/aws-cost-explorer/",
      },
    ],
    verified: true,
  },
  {
    id: "clf-076",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "Which AWS service provides a managed container orchestration platform for running and scaling containers without managing control plane servers?",
    choices: [
      { id: "A", text: "Amazon ECS with AWS Fargate" },
      { id: "B", text: "Amazon EC2 Auto Scaling" },
      { id: "C", text: "Amazon S3" },
      { id: "D", text: "AWS Storage Gateway" },
    ],
    answerId: "A",
    explanation:
      "ECS is a container orchestrator; Fargate removes the need to manage servers for container workloads.",
    whyCorrect:
      "ECS + Fargate lets you run containers with orchestration while AWS manages the underlying compute (no server management for the customer).",
    whyWrong: {
      B: "Auto Scaling scales EC2 capacity but does not provide container orchestration by itself.",
      C: "S3 is object storage, not compute/orchestration.",
      D: "Storage Gateway connects on-prem to AWS storage; unrelated to containers.",
    },
    coaching:
      "Look for phrasing like **“containers + no servers to manage”** → **Fargate** (with ECS/EKS). Trap: Auto Scaling scales servers, not container scheduling.",
    memoryHook: "Fargate = ‘no servers’ containers.",
    testedConcepts: ["Containers", "Serverless containers", "ECS/Fargate basics"],
    sources: [{ title: "AWS Fargate (AWS)", url: "https://aws.amazon.com/fargate/" }],
    verified: true,
  },
  {
    id: "clf-077",
    domain: "Cloud Concepts",
    difficulty: "Medium",
    prompt:
      "Which AWS design principle supports fault tolerance by running resources in physically separate locations within a Region?",
    choices: [
      { id: "A", text: "Using multiple AWS Regions for every workload" },
      { id: "B", text: "Deploying across multiple Availability Zones" },
      { id: "C", text: "Using edge locations for compute" },
      { id: "D", text: "Storing objects in a single S3 bucket" },
    ],
    answerId: "B",
    explanation:
      "Availability Zones are isolated locations within a Region. Spreading across multiple AZs improves resilience.",
    whyCorrect:
      "Multi-AZ architectures reduce single points of failure because AZs are physically separated and independently powered/cooled.",
    whyWrong: {
      A: "Multi-Region can increase resilience but is not required by the question (it asks within a Region).",
      C: "Edge locations are for content delivery and some edge compute; not the primary “within a Region” fault tolerance approach.",
      D: "A single bucket doesn’t imply resilience strategy; resilience depends on architecture and service features.",
    },
    coaching:
      "If the question says **“within a Region”** and **physically separate**, think **Availability Zones**. Trap: Multi-Region is bigger scope than asked.",
    memoryHook: "Region contains AZs.",
    testedConcepts: ["Regions vs AZs", "High availability design"],
    sources: [
      {
        title: "Regions and Availability Zones (AWS)",
        url: "https://aws.amazon.com/about-aws/global-infrastructure/regions_az/",
      },
    ],
    verified: true,
  },
  {
    id: "clf-078",
    domain: "Security",
    difficulty: "Medium",
    prompt:
      "Which AWS service helps protect web applications from common web exploits such as SQL injection and cross-site scripting (XSS)?",
    choices: [
      { id: "A", text: "AWS WAF" },
      { id: "B", text: "AWS Shield Standard" },
      { id: "C", text: "Amazon GuardDuty" },
      { id: "D", text: "AWS Key Management Service (KMS)" },
    ],
    answerId: "A",
    explanation:
      "AWS WAF is a web application firewall that helps block common web exploits (SQLi, XSS) using rules.",
    whyCorrect:
      "WAF is designed to filter and monitor HTTP(S) requests to protect web apps from common layer-7 attacks.",
    whyWrong: {
      B: "Shield is primarily DDoS protection; it doesn’t focus on SQLi/XSS rules for web apps.",
      C: "GuardDuty detects threats from logs/events; it doesn’t block web exploits at the request layer.",
      D: "KMS manages encryption keys; unrelated to web request filtering.",
    },
    coaching:
      "Keyword: **SQLi / XSS / web requests** → **WAF**. Trap: Shield = DDoS; GuardDuty = detection; WAF = request filtering.",
    memoryHook: "WAF = Web App Firewall.",
    testedConcepts: ["WAF vs Shield vs GuardDuty", "Layer-7 protections"],
    sources: [{ title: "AWS WAF (AWS)", url: "https://aws.amazon.com/waf/" }],
    verified: true,
  },
  {
    id: "clf-079",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company wants to reduce overall costs using AWS Organizations while still letting each team view and track their own spend. What is the best approach?",
    choices: [
      { id: "A", text: "Create separate invoices for each AWS account" },
      { id: "B", text: "Enable consolidated billing and use cost allocation tags" },
      { id: "C", text: "Use AWS CloudTrail to track spending by account" },
      { id: "D", text: "Use Amazon CloudWatch dashboards for billing" },
    ],
    answerId: "B",
    explanation:
      "Organizations consolidated billing can aggregate usage for discounts, while cost allocation tags help attribute costs to teams/projects.",
    whyCorrect:
      "Consolidated billing helps optimize overall costs and visibility across accounts; tags (and cost categories) enable chargeback/showback to teams.",
    whyWrong: {
      A: "Separate invoices removes consolidated billing benefits and isn’t the best cost-optimization strategy here.",
      C: "CloudTrail logs API calls, not billing attribution.",
      D: "CloudWatch is operational monitoring; it’s not the primary billing attribution tool.",
    },
    coaching:
      "Pattern: **Organizations + reduce cost + team visibility** → **Consolidated billing + tags**. Trap: CloudTrail/CloudWatch are not billing tools.",
    memoryHook: "Consolidate to save; tag to attribute.",
    testedConcepts: ["Organizations consolidated billing", "Cost allocation tags"],
    sources: [
      {
        title: "AWS Organizations Consolidated Billing (AWS)",
        url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_accounts.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-080",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "Which AWS service is primarily used to record and audit AWS API calls for governance, compliance, and operational troubleshooting?",
    choices: [
      { id: "A", text: "Amazon CloudWatch" },
      { id: "B", text: "AWS CloudTrail" },
      { id: "C", text: "AWS Trusted Advisor" },
      { id: "D", text: "AWS Config" },
    ],
    answerId: "B",
    explanation: "CloudTrail records account activity by logging AWS API calls and events.",
    whyCorrect:
      "CloudTrail is the source of truth for ‘who did what, when, from where’ in AWS via API event logs.",
    whyWrong: {
      A: "CloudWatch monitors metrics/logs/alarms; it’s not the primary audit log of AWS API activity.",
      C: "Trusted Advisor provides recommendations; it doesn’t log API calls.",
      D: "Config records resource configuration changes and compliance state; it is not the full API call audit trail.",
    },
    coaching:
      "Keyword: **audit API calls** / **who changed what** → **CloudTrail**. Trap: Config = configuration history; CloudTrail = API event history.",
    memoryHook: "Trail = breadcrumb trail of API calls.",
    testedConcepts: ["CloudTrail vs Config vs CloudWatch", "Auditing and governance"],
    sources: [{ title: "AWS CloudTrail (AWS)", url: "https://aws.amazon.com/cloudtrail/" }],
    verified: true,
  },
  {
    id: "clf-081",
    domain: "Cloud Concepts",
    difficulty: "Hard",
    prompt: "Which statement best describes the main benefit of elasticity in the AWS Cloud?",
    choices: [
      {
        id: "A",
        text:
          "You can permanently reserve the same amount of capacity for the lowest price.",
      },
      {
        id: "B",
        text: "You can automatically scale resources up and down to match demand.",
      },
      {
        id: "C",
        text: "You can eliminate all security responsibilities by using AWS.",
      },
      {
        id: "D",
        text: "You can deploy workloads only in one AWS Region to reduce latency.",
      },
    ],
    answerId: "B",
    explanation:
      "Elasticity is the ability to dynamically adjust resources based on current workload demand.",
    whyCorrect:
      "Elasticity enables scaling out/in (or up/down) so you run the right amount of resources at the right time, improving cost-efficiency and performance during variable demand.",
    whyWrong: {
      A: "That describes capacity reservation/commitments (like RIs/Savings Plans), not elasticity.",
      C: "Shared Responsibility still applies; AWS does not eliminate all customer security responsibilities.",
      D: "Region choice can impact latency, but elasticity is about resource scaling with demand.",
    },
    coaching:
      "Keyword: **elasticity = match demand automatically**. Trap: commitments (RIs/Savings Plans) are cost tools, not elasticity.",
    memoryHook: "Elastic = stretches with demand.",
    testedConcepts: ["Elasticity vs scalability", "Cloud value proposition"],
    sources: [
      {
        title: "AWS Cloud Benefits (Elasticity/Scalability)",
        url: "https://aws.amazon.com/what-is-cloud-computing/",
      },
    ],
    verified: true,
  },
  {
    id: "clf-082",
    domain: "Billing & Pricing",
    difficulty: "Medium",
    prompt:
      "Which AWS feature in a consolidated billing setup allows charges to be assigned to teams or projects for showback/chargeback?",
    choices: [
      { id: "A", text: "Cost allocation tags" },
      { id: "B", text: "Security groups" },
      { id: "C", text: "IAM policies" },
      { id: "D", text: "Amazon VPC route tables" },
    ],
    answerId: "A",
    explanation:
      "Cost allocation tags help categorize and track AWS costs by key/value metadata (e.g., team, project, environment).",
    whyCorrect:
      "Cost allocation tags are designed to attribute spend to owners (teams/projects/apps) so you can allocate costs and build chargeback models.",
    whyWrong: {
      B: "Security groups control network access, not cost attribution.",
      C: "IAM policies control permissions, not billing allocation.",
      D: "Route tables control traffic routing, not cost tracking.",
    },
    coaching:
      "If it’s **who owns the cost** → **tags** (and cost categories). Trap: IAM/security groups are control-plane, not billing attribution.",
    memoryHook: "Tag it to track it.",
    testedConcepts: ["Cost allocation tags", "Chargeback/showback"],
    sources: [
      {
        title: "AWS Cost Allocation Tags (Docs)",
        url: "https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-083",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "Which AWS service can help you detect potentially compromised EC2 instances by analyzing VPC Flow Logs, DNS logs, and CloudTrail events?",
    choices: [
      { id: "A", text: "Amazon GuardDuty" },
      { id: "B", text: "AWS WAF" },
      { id: "C", text: "AWS Trusted Advisor" },
      { id: "D", text: "AWS Shield Advanced" },
    ],
    answerId: "A",
    explanation:
      "GuardDuty is a threat detection service that analyzes multiple log sources to identify suspicious activity.",
    whyCorrect:
      "GuardDuty continuously monitors for malicious activity using signals like CloudTrail, VPC Flow Logs, and DNS logs, and produces findings for investigation.",
    whyWrong: {
      B: "WAF filters web requests; it does not analyze account/network logs for threat detection across services.",
      C: "Trusted Advisor provides best-practice checks; it is not a threat detection engine.",
      D: "Shield Advanced focuses on DDoS protection, not general threat detection from log analysis.",
    },
    coaching:
      "Keyword: **detect threats from logs** → **GuardDuty**. Trap: WAF/Shield protect traffic; GuardDuty detects suspicious behavior.",
    memoryHook: "GuardDuty = ‘guard on duty’ watching logs.",
    testedConcepts: ["Threat detection", "GuardDuty log sources", "Security services differences"],
    sources: [{ title: "Amazon GuardDuty (AWS)", url: "https://aws.amazon.com/guardduty/" }],
    verified: true,
  },
  {
    id: "clf-084",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "Which AWS service provides a fully managed NoSQL database designed for single-digit millisecond performance at any scale?",
    choices: [
      { id: "A", text: "Amazon RDS" },
      { id: "B", text: "Amazon DynamoDB" },
      { id: "C", text: "Amazon Redshift" },
      { id: "D", text: "Amazon Aurora" },
    ],
    answerId: "B",
    explanation:
      "DynamoDB is a managed NoSQL key-value and document database built for low-latency performance at scale.",
    whyCorrect:
      "DynamoDB is purpose-built for high scale and low latency without managing servers, making it the classic AWS managed NoSQL choice.",
    whyWrong: {
      A: "RDS is managed relational (SQL) databases, not NoSQL.",
      C: "Redshift is a data warehouse for analytics, not low-latency NoSQL workloads.",
      D: "Aurora is a relational database (MySQL/PostgreSQL compatible), not NoSQL.",
    },
    coaching:
      "Keyword: **NoSQL + low latency at scale** → **DynamoDB**. Trap: Aurora/RDS are SQL; Redshift is analytics.",
    memoryHook: "DynamoDB = NoSQL speed.",
    testedConcepts: ["Database types", "NoSQL vs SQL", "Managed services"],
    sources: [{ title: "Amazon DynamoDB (AWS)", url: "https://aws.amazon.com/dynamodb/" }],
    verified: true,
  },
  {
    id: "clf-085",
    domain: "Cloud Concepts",
    difficulty: "Medium",
    prompt:
      "A startup runs a production workload across multiple accounts and asks for a dedicated Technical Account Manager to help with architecture reviews and proactive guidance. Which AWS Support plan should they choose? (Trap keyword: cross-Region)",
    choices: [
      { id: "A", text: "Business Support with cross-Region routing" },
      { id: "B", text: "Developer Support with inter-AZ optimization" },
      { id: "C", text: "Basic Support with Trusted Advisor Core Checks" },
      { id: "D", text: "Enterprise Support with a Technical Account Manager (TAM)" },
    ],
    answerId: "D",
    explanation:
      "Enterprise Support includes a Technical Account Manager (TAM) and proactive guidance.",
    whyCorrect:
      "Enterprise Support is the only plan that provides a Technical Account Manager for proactive, account-level guidance and ongoing architectural engagement.",
    whyWrong: {
      A: "Business Support improves response times and guidance but does not include a dedicated TAM; 'cross-Region' is a networking trap.",
      B: "Developer Support is limited in scope and does not include a TAM; 'inter-AZ' is a misleading keyword.",
      C: "Basic Support offers self-service and limited checks; it does not provide a TAM or proactive engagement.",
    },
    coaching:
      "Rule: **TAM = Enterprise**. Trap: keywords like **cross-Region** or **inter-AZ** are networking topics, not support plan features. Spot the request for a *dedicated* advisor.",
    memoryHook: "TAM sits at the Enterprise tier.",
    testedConcepts: ["AWS Support plans", "TAM availability"],
    sources: [
      { title: "AWS Support Plans (AWS)", url: "https://aws.amazon.com/premiumsupport/plans/" },
    ],
    verified: true,
  },
  {
    id: "clf-086",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "Which pricing model is best suited for workloads that can tolerate interruptions and need the lowest possible compute cost?",
    choices: [
      { id: "A", text: "On-Demand Instances" },
      { id: "B", text: "Reserved Instances" },
      { id: "C", text: "Spot Instances" },
      { id: "D", text: "Dedicated Instances" },
    ],
    answerId: "C",
    explanation:
      "Spot Instances can provide steep discounts but may be interrupted when AWS needs the capacity back.",
    whyCorrect:
      "Spot is designed for flexible, fault-tolerant workloads and typically offers the lowest compute prices compared to On-Demand and Reserved options.",
    whyWrong: {
      A: "On-Demand is flexible but usually costs more than Spot.",
      B: "Reserved reduces cost for steady usage, but is not the cheapest option for interruptible workloads.",
      D: "Dedicated Instances isolate hardware but are not a cost-minimizing option.",
    },
    coaching:
      "Keyword: **interruptible / fault-tolerant + cheapest** → **Spot**. Trap: If the question says ‘must not be interrupted’, Spot is wrong.",
    memoryHook: "Spot = spare capacity bargains.",
    testedConcepts: ["Spot vs On-Demand vs Reserved", "Interruptible workloads"],
    sources: [{ title: "Amazon EC2 Spot Instances (AWS)", url: "https://aws.amazon.com/ec2/spot/" }],
    verified: true,
  },
  {
    id: "clf-087",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "Which AWS service provides a managed way to create and enforce rules that evaluate AWS resource configurations for compliance?",
    choices: [
      { id: "A", text: "AWS Config" },
      { id: "B", text: "AWS CloudTrail" },
      { id: "C", text: "Amazon CloudWatch" },
      { id: "D", text: "AWS Budgets" },
    ],
    answerId: "A",
    explanation:
      "AWS Config tracks resource configuration changes and can evaluate them against rules for compliance.",
    whyCorrect:
      "Config provides configuration history, change tracking, and compliance evaluation through Config rules—exactly matching governance/compliance validation needs.",
    whyWrong: {
      B: "CloudTrail logs API events (‘who did what’), not configuration compliance rules.",
      C: "CloudWatch is metrics/logs/alarms, not configuration compliance evaluation.",
      D: "Budgets is cost alerting, not compliance enforcement.",
    },
    coaching:
      "Keyword: **resource configuration + compliance rules** → **AWS Config**. Trap: CloudTrail = audit trail of actions, not compliance rules.",
    memoryHook: "Config = configuration compliance.",
    testedConcepts: ["CloudTrail vs Config", "Compliance and governance"],
    sources: [{ title: "AWS Config (AWS)", url: "https://aws.amazon.com/config/" }],
    verified: true,
  },
  {
    id: "clf-088",
    domain: "Security",
    difficulty: "Medium",
    prompt: "Which AWS service is used to create, manage, and control encryption keys used to encrypt data?",
    choices: [
      { id: "A", text: "AWS Key Management Service (KMS)" },
      { id: "B", text: "Amazon Inspector" },
      { id: "C", text: "AWS Artifact" },
      { id: "D", text: "AWS Organizations" },
    ],
    answerId: "A",
    explanation:
      "KMS is the managed service for creating and controlling cryptographic keys used across AWS services.",
    whyCorrect:
      "KMS centrally manages encryption keys and integrates with many AWS services for encryption at rest and key usage control.",
    whyWrong: {
      B: "Inspector scans for vulnerabilities; it does not manage encryption keys.",
      C: "Artifact provides compliance reports and agreements; not key management.",
      D: "Organizations manages multiple accounts; not encryption keys.",
    },
    coaching:
      "Keyword: **encryption keys** → **KMS**. Trap: ‘security’ options like Inspector/Artifact are common distractors but don’t manage keys.",
    memoryHook: "KMS = Key Management Service.",
    testedConcepts: ["Encryption at rest", "Key management"],
    sources: [{ title: "AWS KMS (AWS)", url: "https://aws.amazon.com/kms/" }],
    verified: true,
  },
  {
    id: "clf-089",
    domain: "Cloud Concepts",
    difficulty: "Hard",
    prompt:
      "A company wants to improve reliability by removing single points of failure in its architecture. Which approach best aligns with AWS best practices?",
    choices: [
      {
        id: "A",
        text:
          "Deploy all resources into a single Availability Zone to reduce complexity.",
      },
      {
        id: "B",
        text:
          "Use multiple Availability Zones and implement health checks with automatic failover.",
      },
      { id: "C", text: "Use a single, larger EC2 instance instead of multiple smaller instances." },
      {
        id: "D",
        text:
          "Store backups only on local disk attached to an EC2 instance.",
      },
    ],
    answerId: "B",
    explanation:
      "Multi-AZ deployment and automated failover improve availability and reduce single points of failure.",
    whyCorrect:
      "AWS Well-Architected reliability guidance emphasizes redundancy, fault isolation, and automated recovery—multi-AZ plus health checks is a classic pattern.",
    whyWrong: {
      A: "Single AZ increases risk; it creates a single point of failure.",
      C: "A single bigger instance can still fail and becomes a single point of failure.",
      D: "Local disk is not durable like managed storage; backups should use durable storage (e.g., S3) and multi-location strategies.",
    },
    coaching:
      "Keyword: **single point of failure** → **redundancy + multi-AZ + automated recovery**. Trap: ‘bigger single server’ is the opposite of fault-tolerant design.",
    memoryHook: "Multi-AZ = resilience.",
    testedConcepts: ["High availability", "Fault tolerance", "Well-Architected Reliability"],
    sources: [
      {
        title: "AWS Well-Architected Framework – Reliability Pillar",
        url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-090",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "Which AWS service is commonly used as highly durable object storage for backups, static assets, and data lakes?",
    choices: [
      { id: "A", text: "Amazon EBS" },
      { id: "B", text: "Amazon S3" },
      { id: "C", text: "Amazon EFS" },
      { id: "D", text: "Amazon FSx for Windows File Server" },
    ],
    answerId: "B",
    explanation:
      "Amazon S3 is AWS’s object storage service designed for durability, scalability, and a wide range of storage use cases.",
    whyCorrect:
      "S3 is the standard AWS service for object storage—backups, static content, logs, and data lake storage are common use cases.",
    whyWrong: {
      A: "EBS is block storage for EC2; it’s not object storage and is tied to instances/AZs.",
      C: "EFS is a shared file system (NFS) for Linux workloads, not object storage.",
      D: "FSx is managed file storage, not object storage.",
    },
    coaching:
      "Keyword: **object storage / backups / static assets** → **S3**. Trap: EBS/EFS/FSx are storage too, but they’re block/file, not object.",
    memoryHook: "S3 = Simple Storage (object).",
    testedConcepts: ["Storage types: object vs block vs file", "S3 use cases"],
    sources: [{ title: "Amazon S3 (AWS)", url: "https://aws.amazon.com/s3/" }],
    verified: true,
  },
  {
    id: "VER-001",
    domain: "Billing & Pricing",
    difficulty: "Medium",
    prompt:
      "Your company runs steady compute usage across EC2, AWS Fargate, and AWS Lambda and wants cost savings without committing to specific instance families. Which option provides the best balance of savings and flexibility?",
    choices: [
      { id: "A", text: "Reserved Instances" },
      { id: "B", text: "Spot Instances" },
      { id: "C", text: "Compute Savings Plans" },
      { id: "D", text: "Dedicated Hosts" },
    ],
    answerId: "C",
    explanation:
      "Compute Savings Plans provide flexible discounts across EC2, Fargate, and Lambda without tying you to instance families or regions.",
    whyCorrect:
      "Compute Savings Plans provide flexible discounts across EC2, Fargate, and Lambda without tying you to instance families or regions.",
    whyWrong: {
      A: "Reserved Instances are less flexible and tied to specific instance families or regions.",
      B: "Spot Instances can be interrupted and are not ideal for steady workloads.",
      D: "Dedicated Hosts focus on isolation and licensing, not cost optimization.",
    },
    coaching:
      "Keyword rule: **steady usage + flexible across compute services** → **Compute Savings Plans**.",
    sources: [{ title: "AWS Savings Plans", url: "https://aws.amazon.com/savingsplans/" }],
    verified: true,
  },
  {
    id: "VER-002",
    domain: "Security",
    difficulty: "Easy",
    prompt:
      "What is the AWS-recommended best practice for protecting the root user of an AWS account?",
    choices: [
      { id: "A", text: "Use the root user for daily administrative tasks" },
      { id: "B", text: "Share root credentials with trusted administrators" },
      { id: "C", text: "Enable MFA on the root account and restrict its use" },
      { id: "D", text: "Create multiple root users" },
    ],
    answerId: "C",
    explanation:
      "The root user has unrestricted access. Enabling MFA and limiting its use is a core AWS security best practice.",
    whyCorrect:
      "The root user has unrestricted access. Enabling MFA and limiting its use is a core AWS security best practice.",
    whyWrong: {
      A: "Root should not be used for daily administration.",
      B: "Root credentials should never be shared.",
      D: "There is only one root user per AWS account.",
    },
    coaching:
      "Security rule: **root = lock it down** → enable **MFA** and use it only when required.",
    sources: [
      {
        title: "AWS IAM Best Practices",
        url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html",
      },
    ],
    verified: true,
  },
  {
    id: "VER-003",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "You need a private, dedicated network connection from your on-premises data center to AWS with consistent latency. Which service should you use?",
    choices: [
      { id: "A", text: "AWS Site-to-Site VPN" },
      { id: "B", text: "AWS Direct Connect" },
      { id: "C", text: "Amazon CloudFront" },
      { id: "D", text: "AWS PrivateLink" },
    ],
    answerId: "B",
    explanation:
      "AWS Direct Connect provides a dedicated private connection with predictable performance.",
    whyCorrect:
      "AWS Direct Connect provides a dedicated private connection with predictable performance.",
    whyWrong: {
      A: "VPN uses the public internet and has variable latency.",
      C: "CloudFront is a CDN, not a connectivity service.",
      D: "PrivateLink is for private access to AWS services, not on-prem connectivity.",
    },
    coaching:
      "Keyword rule: **dedicated private connection + consistent latency** → **Direct Connect**.",
    sources: [{ title: "AWS Direct Connect", url: "https://aws.amazon.com/directconnect/" }],
    verified: true,
  },
  {
    id: "VER-005",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "Which AWS service is a fully managed relational database that automates backups, patching, and scaling?",
    choices: [
      { id: "A", text: "Amazon EC2 with MySQL installed" },
      { id: "B", text: "Amazon RDS" },
      { id: "C", text: "Amazon DynamoDB" },
      { id: "D", text: "Amazon S3" },
    ],
    answerId: "B",
    explanation:
      "Amazon RDS is a fully managed relational database service handling backups, patching, and scaling.",
    whyCorrect:
      "Amazon RDS is a fully managed relational database service handling backups, patching, and scaling.",
    whyWrong: {
      A: "EC2 requires manual database management.",
      C: "DynamoDB is a NoSQL database.",
      D: "S3 is object storage, not a relational database.",
    },
    coaching:
      "Keyword rule: **managed relational database** → **RDS**.",
    sources: [{ title: "Amazon RDS", url: "https://aws.amazon.com/rds/" }],
    verified: true,
  },
  {
    id: "VER-006",
    domain: "Security",
    difficulty: "Medium",
    prompt:
      "A company must encrypt data stored in Amazon S3 and centrally manage encryption keys with auditability. Which solution best meets this requirement?",
    choices: [
      { id: "A", text: "SSE-S3" },
      { id: "B", text: "Client-side encryption only" },
      { id: "C", text: "SSE-KMS with customer-managed keys" },
      { id: "D", text: "TLS encryption in transit only" },
    ],
    answerId: "C",
    explanation:
      "SSE-KMS with customer-managed keys provides centralized key management, access control, and audit logging.",
    whyCorrect:
      "SSE-KMS with customer-managed keys provides centralized key management, access control, and audit logging.",
    whyWrong: {
      A: "SSE-S3 does not provide customer-managed keys.",
      B: "Client-side encryption lacks centralized key governance in AWS KMS.",
      D: "TLS protects data in transit, not at rest.",
    },
    coaching:
      "Keyword rule: **central key management + auditing** → **SSE-KMS (CMK)**.",
    sources: [
      {
        title: "Using SSE-KMS for S3",
        url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html",
      },
    ],
    verified: true,
  },
  {
    id: "VER-008",
    domain: "Billing & Pricing",
    difficulty: "Medium",
    prompt:
      "Which AWS tool is best for visualizing historical spend trends and filtering costs by service?",
    choices: [
      { id: "A", text: "AWS Budgets" },
      { id: "B", text: "AWS Cost Explorer" },
      { id: "C", text: "AWS CloudTrail" },
      { id: "D", text: "Amazon CloudWatch" },
    ],
    answerId: "B",
    explanation:
      "AWS Cost Explorer provides detailed cost visualizations and filtering.",
    whyCorrect:
      "AWS Cost Explorer provides detailed cost visualizations and filtering.",
    whyWrong: {
      A: "Budgets focus on alerts and thresholds.",
      C: "CloudTrail tracks API activity, not cost trends.",
      D: "CloudWatch monitors metrics and logs, not billing trends.",
    },
    coaching:
      "Keyword rule: **cost trends/filters** → **Cost Explorer**.",
    sources: [
      {
        title: "AWS Cost Explorer",
        url: "https://aws.amazon.com/aws-cost-management/aws-cost-explorer/",
      },
    ],
    verified: true,
  },
  {
    id: "VER-009",
    domain: "Technology",
    difficulty: "Easy",
    prompt:
      "Which AWS service distributes incoming application traffic across multiple targets such as EC2 instances?",
    choices: [
      { id: "A", text: "Amazon Route 53" },
      { id: "B", text: "Elastic Load Balancing (ELB)" },
      { id: "C", text: "Amazon CloudFront" },
      { id: "D", text: "AWS Direct Connect" },
    ],
    answerId: "B",
    explanation:
      "Elastic Load Balancing distributes traffic across multiple targets.",
    whyCorrect:
      "Elastic Load Balancing distributes traffic across multiple targets.",
    whyWrong: {
      A: "Route 53 is DNS-based routing.",
      C: "CloudFront is a CDN, not a load balancer.",
      D: "Direct Connect is dedicated connectivity, not traffic distribution.",
    },
    coaching:
      "Keyword rule: **distribute traffic across targets** → **ELB**.",
    sources: [
      {
        title: "Elastic Load Balancing",
        url: "https://aws.amazon.com/elasticloadbalancing/",
      },
    ],
    verified: true,
  },
  {
    id: "VER-010",
    domain: "Billing & Pricing",
    difficulty: "Easy",
    prompt: "What is a primary benefit of Reserved Instances?",
    choices: [
      { id: "A", text: "No long-term commitment" },
      { id: "B", text: "Significant cost savings for steady usage" },
      { id: "C", text: "Interruptible workloads" },
      { id: "D", text: "Applies only to storage" },
    ],
    answerId: "B",
    explanation:
      "Reserved Instances offer significant savings for predictable, steady workloads.",
    whyCorrect:
      "Reserved Instances offer significant savings for predictable, steady workloads.",
    whyWrong: {
      A: "Reserved Instances require a commitment.",
      C: "Interruptible workloads describe Spot Instances.",
      D: "Reserved Instances apply to compute, not storage only.",
    },
    coaching:
      "Keyword rule: **steady usage + savings** → **Reserved Instances**.",
    sources: [
      {
        title: "Amazon EC2 Reserved Instances",
        url: "https://aws.amazon.com/ec2/pricing/reserved-instances/",
      },
    ],
    verified: true,
  },
  {
    id: "aws-verified-041",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "Which AWS service provides automatic scaling and load balancing for containerized applications without requiring you to manage servers?",
    choices: [
      { id: "A", text: "Amazon EC2 Auto Scaling" },
      { id: "B", text: "Amazon ECS with AWS Fargate" },
      { id: "C", text: "Amazon Elastic Load Balancing only" },
      { id: "D", text: "AWS Elastic Beanstalk on EC2" },
    ],
    answerId: "B",
    explanation:
      "Amazon ECS with AWS Fargate runs containers without managing servers and handles scaling/infrastructure automatically.",
    whyCorrect:
      "ECS on Fargate is serverless for containers, so AWS manages the underlying infrastructure while ECS scales tasks.",
    whyWrong: {
      A: "EC2 Auto Scaling still requires managing EC2 instances.",
      C: "ELB distributes traffic but does not run or scale containers.",
      D: "Elastic Beanstalk on EC2 still requires EC2 capacity management.",
    },
    coaching:
      "Keyword rule: **containers + no servers** → **ECS with Fargate**.",
    sources: [{ title: "AWS Fargate", url: "https://aws.amazon.com/fargate/" }],
    verified: true,
  },
  {
    id: "aws-verified-042",
    domain: "Security",
    difficulty: "Medium",
    prompt:
      "Which AWS feature ensures that data stored in Amazon S3 is automatically replicated across multiple Availability Zones within a Region?",
    choices: [
      { id: "A", text: "S3 Cross-Region Replication" },
      { id: "B", text: "S3 Versioning" },
      { id: "C", text: "S3 Standard storage class" },
      { id: "D", text: "S3 Lifecycle policies" },
    ],
    answerId: "C",
    explanation:
      "S3 Standard stores data redundantly across multiple Availability Zones within a Region.",
    whyCorrect:
      "The S3 Standard storage class provides multi-AZ redundancy by default within a Region.",
    whyWrong: {
      A: "Cross-Region Replication copies objects to a different Region.",
      B: "Versioning keeps multiple versions, not AZ replication behavior.",
      D: "Lifecycle policies control transitions/expiration, not redundancy.",
    },
    coaching:
      "In-region multi-AZ durability is **S3 Standard** by default.",
    sources: [{ title: "Amazon S3 Storage Classes", url: "https://aws.amazon.com/s3/storage-classes/" }],
    verified: true,
  },
  {
    id: "aws-verified-043",
    domain: "Cloud Concepts",
    difficulty: "Medium",
    prompt:
      "Which AWS Cloud benefit allows customers to experiment, innovate, and fail quickly with minimal financial risk?",
    choices: [
      { id: "A", text: "High availability" },
      { id: "B", text: "Economies of scale" },
      { id: "C", text: "Pay-as-you-go pricing" },
      { id: "D", text: "Global infrastructure" },
    ],
    answerId: "C",
    explanation:
      "Pay-as-you-go pricing lets customers pay only for what they use, reducing upfront risk and enabling rapid experimentation.",
    whyCorrect:
      "Pay-as-you-go pricing reduces upfront commitment and lets teams iterate quickly with minimal financial risk.",
    whyWrong: {
      A: "High availability improves reliability, not experimentation cost.",
      B: "Economies of scale lower prices, but do not enable rapid experimentation directly.",
      D: "Global infrastructure improves reach, not financial risk.",
    },
    coaching:
      "Experiment fast = **no upfront cost** → **pay-as-you-go**.",
    sources: [
      {
        title: "AWS Cloud Economics",
        url: "https://aws.amazon.com/economics/",
      },
    ],
    verified: true,
  },
  {
    id: "aws-verified-044",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "Which AWS pricing model provides the greatest discount for workloads with steady, predictable usage across multiple compute services?",
    choices: [
      { id: "A", text: "Spot Instances" },
      { id: "B", text: "Reserved Instances" },
      { id: "C", text: "Compute Savings Plans" },
      { id: "D", text: "On-Demand Instances" },
    ],
    answerId: "C",
    explanation:
      "Compute Savings Plans provide flexible discounts across EC2, Lambda, and Fargate for consistent usage.",
    whyCorrect:
      "Compute Savings Plans apply across multiple compute services and offer strong discounts for steady usage.",
    whyWrong: {
      A: "Spot is cheapest but interruptible, not guaranteed for steady workloads.",
      B: "Reserved Instances are less flexible across services.",
      D: "On-Demand has no discount for steady usage.",
    },
    coaching:
      "Steady usage across services → **Compute Savings Plans**.",
    sources: [{ title: "AWS Savings Plans", url: "https://aws.amazon.com/savingsplans/" }],
    verified: true,
  },
  {
    id: "aws-verified-045",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "Which AWS service is best suited for storing and retrieving any amount of unstructured data with high durability?",
    choices: [
      { id: "A", text: "Amazon EBS" },
      { id: "B", text: "Amazon RDS" },
      { id: "C", text: "Amazon S3" },
      { id: "D", text: "Amazon DynamoDB" },
    ],
    answerId: "C",
    explanation:
      "Amazon S3 is designed for storing unstructured data with very high durability.",
    whyCorrect:
      "S3 provides highly durable object storage for virtually unlimited unstructured data.",
    whyWrong: {
      A: "EBS is block storage attached to EC2 instances.",
      B: "RDS is a managed relational database.",
      D: "DynamoDB is a NoSQL database, not object storage.",
    },
    coaching:
      "Unstructured object storage → **S3**.",
    sources: [{ title: "Amazon S3", url: "https://aws.amazon.com/s3/" }],
    verified: true,
  },
  {
    id: "aws-verified-046",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "Which AWS service helps centrally manage encryption keys and control their use across AWS services?",
    choices: [
      { id: "A", text: "AWS Secrets Manager" },
      { id: "B", text: "AWS Key Management Service (KMS)" },
      { id: "C", text: "AWS Shield" },
      { id: "D", text: "Amazon CloudWatch" },
    ],
    answerId: "B",
    explanation:
      "AWS KMS provides centralized creation, management, and auditing of encryption keys.",
    whyCorrect:
      "KMS is the managed service for creating and controlling encryption keys used by AWS services.",
    whyWrong: {
      A: "Secrets Manager stores and rotates secrets, not encryption keys.",
      C: "Shield protects against DDoS attacks.",
      D: "CloudWatch is for monitoring and logs.",
    },
    coaching:
      "Central key management = **KMS**.",
    sources: [{ title: "AWS Key Management Service", url: "https://aws.amazon.com/kms/" }],
    verified: true,
  },
  {
    id: "aws-verified-047",
    domain: "Cloud Concepts",
    difficulty: "Medium",
    prompt:
      "What is the primary benefit of using multiple Availability Zones for an application?",
    choices: [
      { id: "A", text: "Lower storage costs" },
      { id: "B", text: "Improved fault tolerance" },
      { id: "C", text: "Faster global content delivery" },
      { id: "D", text: "Simpler identity management" },
    ],
    answerId: "B",
    explanation:
      "Deploying across multiple Availability Zones improves fault tolerance and availability.",
    whyCorrect:
      "Multiple AZs reduce the impact of a single AZ failure, improving fault tolerance.",
    whyWrong: {
      A: "Multi-AZ is about resilience, not lower storage cost.",
      C: "Global delivery is a CDN/edge function use case.",
      D: "Identity management is unrelated to AZ design.",
    },
    coaching:
      "Multi-AZ = **fault tolerance + high availability**.",
    sources: [
      {
        title: "AWS Global Infrastructure",
        url: "https://aws.amazon.com/about-aws/global-infrastructure/",
      },
    ],
    verified: true,
  },
  {
    id: "aws-verified-048",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "Which AWS service enables event-driven serverless workflows by connecting AWS services using events?",
    choices: [
      { id: "A", text: "Amazon SQS" },
      { id: "B", text: "Amazon EventBridge" },
      { id: "C", text: "AWS Step Functions" },
      { id: "D", text: "Amazon SNS" },
    ],
    answerId: "B",
    explanation:
      "Amazon EventBridge routes events between AWS services and applications to build event-driven architectures.",
    whyCorrect:
      "EventBridge is the event bus service for routing events across AWS services and SaaS sources.",
    whyWrong: {
      A: "SQS is a queueing service, not an event bus.",
      C: "Step Functions orchestrate workflows but do not route events between services.",
      D: "SNS is pub/sub messaging but not a full event bus with routing rules.",
    },
    coaching:
      "Event-driven routing across services → **EventBridge**.",
    sources: [
      {
        title: "Amazon EventBridge",
        url: "https://aws.amazon.com/eventbridge/",
      },
    ],
    verified: true,
  },
  {
    id: "aws-verified-049",
    domain: "Billing & Pricing",
    difficulty: "Medium",
    prompt:
      "Which AWS tool allows customers to receive alerts when their estimated charges exceed a predefined threshold?",
    choices: [
      { id: "A", text: "AWS Cost Explorer" },
      { id: "B", text: "AWS Budgets" },
      { id: "C", text: "AWS Trusted Advisor" },
      { id: "D", text: "Amazon CloudWatch Logs" },
    ],
    answerId: "B",
    explanation:
      "AWS Budgets lets you set cost thresholds and receive alerts.",
    whyCorrect:
      "Budgets supports threshold-based alerts for cost and usage.",
    whyWrong: {
      A: "Cost Explorer visualizes costs but does not manage alert thresholds by itself.",
      C: "Trusted Advisor provides recommendations, not billing alerts.",
      D: "CloudWatch Logs stores logs, not cost alerts.",
    },
    coaching:
      "Cost thresholds + alerts → **AWS Budgets**.",
    sources: [
      {
        title: "AWS Budgets",
        url: "https://aws.amazon.com/aws-cost-management/aws-budgets/",
      },
    ],
    verified: true,
  },
  {
    id: "aws-verified-050",
    domain: "Security",
    difficulty: "Medium",
    prompt:
      "Which AWS responsibility belongs to the customer under the AWS Shared Responsibility Model?",
    choices: [
      { id: "A", text: "Physical security of data centers" },
      { id: "B", text: "Hardware maintenance" },
      { id: "C", text: "Configuring security groups and network ACLs" },
      { id: "D", text: "Availability Zone design" },
    ],
    answerId: "C",
    explanation:
      "Customers are responsible for configuring security groups and network ACLs.",
    whyCorrect:
      "Security group and network ACL configuration is part of security in the cloud (customer responsibility).",
    whyWrong: {
      A: "AWS is responsible for physical data center security.",
      B: "AWS maintains underlying hardware.",
      D: "AWS designs and operates Availability Zones.",
    },
    coaching:
      "Shared responsibility: **you configure** SGs/NACLs.",
    sources: [
      {
        title: "AWS Shared Responsibility Model",
        url: "https://aws.amazon.com/compliance/shared-responsibility-model/",
      },
    ],
    verified: true,
  },
  {
    id: "aws-verified-051",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "Which AWS service allows users to run code in response to events without provisioning or managing servers?",
    choices: [
      { id: "A", text: "Amazon EC2" },
      { id: "B", text: "Amazon ECS" },
      { id: "C", text: "AWS Lambda" },
      { id: "D", text: "AWS Elastic Beanstalk" },
    ],
    answerId: "C",
    explanation:
      "AWS Lambda is a serverless compute service that runs code in response to events without managing servers.",
    whyCorrect:
      "Lambda runs code on-demand and abstracts server management.",
    whyWrong: {
      A: "EC2 requires server provisioning and management.",
      B: "ECS requires managing the container environment and capacity.",
      D: "Elastic Beanstalk still relies on underlying compute resources.",
    },
    coaching:
      "Event-driven, no servers → **Lambda**.",
    sources: [{ title: "AWS Lambda", url: "https://aws.amazon.com/lambda/" }],
    verified: true,
  },
  {
    id: "aws-verified-052",
    domain: "Security",
    difficulty: "Medium",
    prompt:
      "Which AWS service provides protection against distributed denial-of-service (DDoS) attacks at no additional cost?",
    choices: [
      { id: "A", text: "AWS Shield Standard" },
      { id: "B", text: "AWS Shield Advanced" },
      { id: "C", text: "AWS WAF" },
      { id: "D", text: "Amazon GuardDuty" },
    ],
    answerId: "A",
    explanation:
      "AWS Shield Standard provides automatic DDoS protection at no additional cost.",
    whyCorrect:
      "Shield Standard is included and protects against common DDoS attacks.",
    whyWrong: {
      B: "Shield Advanced is a paid service.",
      C: "WAF filters web traffic but is not the base DDoS service.",
      D: "GuardDuty detects threats but does not provide DDoS protection.",
    },
    coaching:
      "Free DDoS protection → **Shield Standard**.",
    sources: [
      { title: "AWS Shield", url: "https://aws.amazon.com/shield/" },
    ],
    verified: true,
  },
  {
    id: "aws-verified-053",
    domain: "Billing & Pricing",
    difficulty: "Medium",
    prompt:
      "Which AWS service helps identify underutilized resources and provides cost optimization recommendations?",
    choices: [
      { id: "A", text: "AWS Budgets" },
      { id: "B", text: "AWS Trusted Advisor" },
      { id: "C", text: "AWS Cost Explorer" },
      { id: "D", text: "Amazon CloudWatch" },
    ],
    answerId: "B",
    explanation:
      "AWS Trusted Advisor provides recommendations for cost optimization, security, and performance.",
    whyCorrect:
      "Trusted Advisor checks for underutilized resources and cost-saving opportunities.",
    whyWrong: {
      A: "Budgets track spending and alerts, not optimization recommendations.",
      C: "Cost Explorer visualizes costs but doesn’t recommend optimizations.",
      D: "CloudWatch monitors metrics and logs, not cost optimizations.",
    },
    coaching:
      "Cost optimization recommendations → **Trusted Advisor**.",
    sources: [
      { title: "AWS Trusted Advisor", url: "https://aws.amazon.com/premiumsupport/technology/trusted-advisor/" },
    ],
    verified: true,
  },
  {
    id: "aws-verified-054",
    domain: "Cloud Concepts",
    difficulty: "Medium",
    prompt:
      "Which aspect of the AWS Cloud enables customers to quickly deploy resources worldwide with low latency?",
    choices: [
      { id: "A", text: "High availability" },
      { id: "B", text: "Elasticity" },
      { id: "C", text: "Global infrastructure" },
      { id: "D", text: "Pay-as-you-go pricing" },
    ],
    answerId: "C",
    explanation:
      "AWS global infrastructure (Regions and Availability Zones) enables low-latency deployments worldwide.",
    whyCorrect:
      "A broad global footprint lets you deploy close to users to reduce latency.",
    whyWrong: {
      A: "High availability improves resilience, not geographic reach.",
      B: "Elasticity scales resources but doesn’t provide global reach.",
      D: "Pay-as-you-go affects cost, not latency or reach.",
    },
    coaching:
      "Low latency worldwide → **Global infrastructure**.",
    sources: [
      { title: "AWS Global Infrastructure", url: "https://aws.amazon.com/about-aws/global-infrastructure/" },
    ],
    verified: true,
  },
  {
    id: "aws-verified-055",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "Which AWS service is best suited for decoupling application components using a fully managed message queue?",
    choices: [
      { id: "A", text: "Amazon SNS" },
      { id: "B", text: "Amazon SQS" },
      { id: "C", text: "Amazon EventBridge" },
      { id: "D", text: "AWS Step Functions" },
    ],
    answerId: "B",
    explanation:
      "Amazon SQS is a fully managed message queuing service designed to decouple application components.",
    whyCorrect:
      "SQS provides durable queues to decouple producers and consumers.",
    whyWrong: {
      A: "SNS is pub/sub, not a queue.",
      C: "EventBridge routes events; it isn’t a message queue.",
      D: "Step Functions orchestrate workflows, not message queuing.",
    },
    coaching:
      "Decoupling with queues → **SQS**.",
    sources: [
      { title: "Amazon SQS", url: "https://aws.amazon.com/sqs/" },
    ],
    verified: true,
  },
];

export const QUESTION_BANK: Question[] = [
  ...QUESTION_BANK_BASE.map((q) => {
    const knowledge = QUESTION_KNOWLEDGE[q.id];
    return {
      ...q,
      whyCorrect: knowledge?.whyCorrect ?? NOT_VERIFIED,
      whyWrong: mergeWhyWrong(q.answerId, knowledge?.whyWrong),
      memoryHook: knowledge?.memoryHook ?? NOT_VERIFIED,
      sources: [],
      verified: false,
    };
  }),
  ...EXTRA_QUESTIONS,
  // --- Added exam-grade questions (verified) ---
  {
    id: "clf-101",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A security team needs to detect and investigate unusual API activity across multiple AWS accounts. Which combination best supports centralized visibility and forensic review?",
    choices: [
      {
        id: "A",
        text:
          "Enable AWS CloudTrail in each account and deliver logs to a centralized S3 bucket in a logging account",
      },
      {
        id: "B",
        text: "Use Amazon CloudWatch Logs only and disable CloudTrail to reduce costs",
      },
      {
        id: "C",
        text: "Enable AWS Config only and review configuration changes for API calls",
      },
      { id: "D", text: "Use AWS Budgets alerts to identify suspicious API activity" },
    ],
    answerId: "A",
    whyCorrect:
      "CloudTrail records account activity and API calls. Centralizing CloudTrail logs (often via an Organizations trail) into an S3 bucket in a dedicated logging account supports cross-account visibility, retention, and investigation workflows.",
    whyWrong: {
      A: "Correct — CloudTrail is the authoritative record of API calls and can be centralized.",
      B: "CloudWatch Logs is useful for metrics/logs, but CloudTrail is the primary service for API activity history.",
      C: "AWS Config tracks configuration changes and resource compliance; it does not replace CloudTrail’s API call history.",
      D: "Budgets alerts cost anomalies, not API-level security events.",
    },
    coaching:
      "Keyword rule: **API activity history / forensic trail** → **CloudTrail**. Trap: Config tracks *state*, not *who-called-what*.",
    memoryHook: "CloudTrail = who did what (API calls).",
    testedConcepts: ["cloudtrail-api-history", "centralized-logging", "multi-account-security"],
    sources: [
      {
        title: "AWS CloudTrail — What is CloudTrail?",
        url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
      },
      {
        title: "Creating an organization trail (AWS Organizations)",
        url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/creating-trail-organization.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-102",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A workload needs the lowest compute cost and can tolerate interruptions. Which purchasing option is the best fit, and what is the key operational risk?",
    choices: [
      { id: "A", text: "On-Demand Instances; risk is long-term commitment" },
      { id: "B", text: "Reserved Instances; risk is instance interruption at any time" },
      {
        id: "C",
        text:
          "Spot Instances; risk is the instance can be interrupted when capacity is needed elsewhere",
      },
      { id: "D", text: "Dedicated Hosts; risk is capacity is shared with other customers" },
    ],
    answerId: "C",
    whyCorrect:
      "Spot Instances offer steep discounts in exchange for the possibility of interruption when EC2 needs the capacity back. That matches fault-tolerant workloads seeking the lowest cost.",
    whyWrong: {
      A: "On-Demand has no commitment, but it’s typically not the lowest-cost option compared to Spot.",
      B: "Reserved Instances reduce cost with commitment, but they are not designed to be interruptible.",
      C: "Correct — Spot is cheapest but interruptible.",
      D: "Dedicated Hosts are about compliance/isolation and are typically more expensive, not cheaper.",
    },
    coaching:
      "Keyword rule: **interruptible / fault-tolerant + cheapest** → **Spot**. Trap: if it says **must not be interrupted**, Spot is wrong.",
    memoryHook: "Spot = spare capacity bargains (but can be taken back).",
    testedConcepts: ["ec2-spot", "pricing-models"],
    sources: [
      {
        title: "Amazon EC2 Spot Instances",
        url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-103",
    domain: "Cloud Concepts",
    difficulty: "Hard",
    prompt:
      "A company wants to reduce blast radius and simplify billing separation across teams while still applying centralized governance. Which AWS feature best supports this?",
    choices: [
      {
        id: "A",
        text:
          "AWS Organizations with multiple AWS accounts (OUs) and consolidated billing",
      },
      { id: "B", text: "One AWS account with IAM users for each team" },
      { id: "C", text: "Multiple Regions in a single account" },
      { id: "D", text: "Amazon VPC peering only" },
    ],
    answerId: "A",
    whyCorrect:
      "AWS Organizations enables multi-account strategy (separation of duties and blast radius reduction) while providing consolidated billing and centralized policy controls (e.g., SCPs).",
    whyWrong: {
      A: "Correct — multi-account with centralized governance and consolidated billing.",
      B: "Single account increases blast radius and mixes billing/limits across teams.",
      C: "Regions don’t provide billing separation or governance boundaries between teams.",
      D: "VPC peering is networking; it doesn’t address account-level governance and billing.",
    },
    coaching:
      "Keyword rule: **multi-team separation + centralized governance** → **Organizations**. Trap: IAM users ≠ account boundary.",
    memoryHook: "Organizations = many accounts, one boss.",
    testedConcepts: ["aws-organizations", "multi-account-strategy", "scp-governance"],
    sources: [
      {
        title: "AWS Organizations — What is AWS Organizations?",
        url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-104",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A web application experiences unpredictable traffic spikes. The team wants automatic scaling without managing servers. Which AWS compute option is the best fit?",
    choices: [
      { id: "A", text: "AWS Lambda" },
      { id: "B", text: "Amazon EC2 Dedicated Hosts" },
      {
        id: "C",
        text: "Amazon EC2 instances in a single Availability Zone without Auto Scaling",
      },
      { id: "D", text: "Amazon ECS on self-managed EC2 with fixed cluster size" },
    ],
    answerId: "A",
    whyCorrect:
      "AWS Lambda is serverless and automatically scales with request volume (within service limits) without requiring server management. It’s a common fit for event-driven or request-based workloads with bursty traffic.",
    whyWrong: {
      A: "Correct — serverless, auto-scales, no server management.",
      B: "Dedicated Hosts are for compliance/licensing needs and require managing capacity.",
      C: "Single AZ + no Auto Scaling won’t handle spikes reliably and reduces availability.",
      D: "ECS on fixed EC2 still requires managing the underlying instances and scaling the cluster.",
    },
    coaching:
      "Keyword rule: **no servers to manage + bursty traffic** → **Lambda**. Trap: “serverless” ≠ “runs forever” (timeouts apply).",
    memoryHook: "Lambda = code runs on demand.",
    testedConcepts: ["serverless-lambda", "autoscaling-managed-compute"],
    sources: [
      {
        title: "AWS Lambda — Developer Guide",
        url: "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-105",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A company must ensure data stored in Amazon S3 is encrypted at rest and that encryption keys are centrally managed with access controls and auditability. Which solution best meets this?",
    choices: [
      { id: "A", text: "Enable SSE-S3 and allow all users to manage keys in S3" },
      {
        id: "B",
        text: "Use SSE-KMS with AWS Key Management Service (KMS) customer managed keys (CMKs)",
      },
      {
        id: "C",
        text: "Use client-side encryption only and store keys in plaintext on an EC2 instance",
      },
      { id: "D", text: "Disable S3 encryption and rely on TLS in transit" },
    ],
    answerId: "B",
    whyCorrect:
      "SSE-KMS uses AWS KMS keys for encryption at rest with strong access control via key policies/IAM, plus logging and auditability (e.g., CloudTrail for KMS API calls).",
    whyWrong: {
      A: "SSE-S3 is encryption at rest but does not provide the same centralized key control features as KMS CMKs.",
      B: "Correct — KMS CMKs provide centralized control, policies, and auditability.",
      C: "Client-side encryption can work, but plaintext key storage is insecure and violates centralized controlled key management.",
      D: "TLS only protects in transit, not at rest.",
    },
    coaching:
      "Keyword rule: **central key management + auditability** → **SSE-KMS**. Trap: TLS ≠ encryption at rest.",
    memoryHook: "KMS = controlled keys + audit trail.",
    testedConcepts: ["s3-encryption", "kms-cmk", "encryption-at-rest"],
    sources: [
      {
        title: "Protecting data using server-side encryption with AWS KMS keys (SSE-KMS)",
        url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html",
      },
      {
        title: "AWS Key Management Service (KMS)",
        url: "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-106",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A company wants private connectivity from its on-premises network to AWS that does not traverse the public internet. Which service provides this and what is a common benefit?",
    choices: [
      {
        id: "A",
        text:
          "AWS Direct Connect; more consistent network performance and potentially reduced egress costs",
      },
      {
        id: "B",
        text: "Internet Gateway; private connectivity with dedicated bandwidth",
      },
      { id: "C", text: "NAT Gateway; private connectivity without public internet" },
      { id: "D", text: "VPC Peering; connects on-premises directly to AWS without internet" },
    ],
    answerId: "A",
    whyCorrect:
      "AWS Direct Connect provides dedicated private connectivity between on-premises and AWS. It can offer more consistent throughput/latency and may reduce data transfer costs compared to internet-based connectivity.",
    whyWrong: {
      A: "Correct — Direct Connect is private and dedicated.",
      B: "Internet Gateway is public internet routing for a VPC.",
      C: "NAT Gateway enables outbound internet access for private subnets; it’s not on-prem private connectivity.",
      D: "VPC peering connects VPC-to-VPC, not on-prem to AWS by itself.",
    },
    coaching:
      "Keyword rule: **on-prem → AWS private link** → **Direct Connect**. Trap: NAT/IGW are still internet-based paths.",
    memoryHook: "Direct Connect = dedicated private pipe.",
    testedConcepts: ["direct-connect", "hybrid-connectivity"],
    sources: [
      {
        title: "AWS Direct Connect — User Guide",
        url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-107",
    domain: "Billing & Pricing",
    difficulty: "Medium",
    prompt:
      "A team wants to track AWS costs by project across multiple accounts and generate cost reports filtered by those projects. Which approach is most appropriate?",
    choices: [
      {
        id: "A",
        text:
          "Use Cost Allocation Tags and activate them for billing, then filter in Cost Explorer",
      },
      { id: "B", text: "Use Security Groups as project identifiers" },
      { id: "C", text: "Use Route Tables to label project spend" },
      { id: "D", text: "Use AWS Shield to generate cost reports per project" },
    ],
    answerId: "A",
    whyCorrect:
      "Cost allocation tags (once activated) can be used in billing and Cost Explorer to allocate and filter costs by project, environment, owner, and more.",
    whyWrong: {
      A: "Correct — tags + Cost Explorer are built for cost allocation reporting.",
      B: "Security Groups are networking controls, not billing allocation mechanisms.",
      C: "Route Tables are routing constructs and not cost allocation mechanisms.",
      D: "AWS Shield is for DDoS protection, unrelated to cost reporting by project.",
    },
    coaching:
      "Keyword rule: **cost by project/team** → **cost allocation tags**. Trap: infra objects (SG/RT) aren’t billing dimensions.",
    memoryHook: "Tags turn into billing filters.",
    testedConcepts: ["cost-allocation-tags", "cost-explorer"],
    sources: [
      {
        title: "AWS Billing — Cost allocation tags",
        url: "https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html",
      },
      {
        title: "AWS Cost Explorer",
        url: "https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-108",
    domain: "Cloud Concepts",
    difficulty: "Hard",
    prompt:
      "Which statement best describes the AWS Shared Responsibility Model for security in the cloud?",
    choices: [
      {
        id: "A",
        text:
          "AWS is responsible for security in the cloud, and customers are responsible for security of the cloud",
      },
      {
        id: "B",
        text:
          "AWS manages security of the cloud, and customers manage security in the cloud (e.g., data, IAM, configurations)",
      },
      {
        id: "C",
        text:
          "Customers are fully responsible for all security controls, including physical data center security",
      },
      {
        id: "D",
        text:
          "AWS is responsible only for patching guest operating systems on Amazon EC2 instances",
      },
    ],
    answerId: "B",
    whyCorrect:
      "Under the Shared Responsibility Model, AWS secures the underlying infrastructure (facilities, hardware, virtualization), while customers secure what they run and store in AWS (data, IAM, OS/app configs depending on the service).",
    whyWrong: {
      A: "This reverses the model. AWS is responsible for security *of* the cloud; customers for security *in* the cloud.",
      B: "Correct — AWS secures the infrastructure; customers secure their data/config/identity and workloads.",
      C: "Physical security is AWS responsibility.",
      D: "On EC2, customers patch the guest OS; AWS patches the underlying infrastructure.",
    },
    coaching:
      "Keyword rule: **Shared Responsibility** → AWS = **of** the cloud, you = **in** the cloud. Trap: EC2 guest OS patching is on you.",
    memoryHook: "AWS handles the floor; you handle what’s on it.",
    testedConcepts: ["shared-responsibility-model"],
    sources: [
      {
        title: "AWS Shared Responsibility Model",
        url: "https://aws.amazon.com/compliance/shared-responsibility-model/",
      },
    ],
    verified: true,
  },
  {
    id: "clf-109",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A company needs highly available DNS with health checks and automatic failover routing. Which AWS service provides this?",
    choices: [
      { id: "A", text: "Amazon Route 53" },
      { id: "B", text: "AWS WAF" },
      { id: "C", text: "Amazon CloudFront" },
      { id: "D", text: "AWS Config" },
    ],
    answerId: "A",
    whyCorrect:
      "Amazon Route 53 is AWS’s DNS service and supports routing policies such as failover with health checks to route traffic away from unhealthy endpoints.",
    whyWrong: {
      A: "Correct — Route 53 provides DNS with health checks and failover routing.",
      B: "WAF is a web application firewall, not DNS.",
      C: "CloudFront is a CDN; it can help performance but doesn’t replace DNS failover logic.",
      D: "Config tracks resource configurations/compliance, not DNS routing.",
    },
    coaching:
      "Keyword rule: **DNS + health checks + failover** → **Route 53**. Trap: CloudFront improves delivery, not authoritative DNS routing.",
    memoryHook: "Route 53 = DNS + smart routing.",
    testedConcepts: ["route53-dns", "health-check-failover"],
    sources: [
      {
        title: "Amazon Route 53 — Developer Guide",
        url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html",
      },
    ],
    verified: true,
  },
  {
    id: "clf-110",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company wants to set a monthly cost threshold and receive notifications when forecasted costs are likely to exceed it. Which AWS service should they use?",
    choices: [
      { id: "A", text: "AWS Budgets" },
      { id: "B", text: "AWS CloudTrail" },
      { id: "C", text: "Amazon Inspector" },
      { id: "D", text: "AWS IAM Access Analyzer" },
    ],
    answerId: "A",
    whyCorrect:
      "AWS Budgets lets you set cost and usage budgets and receive alerts (including forecast-based alerts) when spend is expected to exceed thresholds.",
    whyWrong: {
      A: "Correct — budgets support actual and forecast alerts for cost thresholds.",
      B: "CloudTrail is for auditing API activity, not cost thresholds.",
      C: "Inspector is for security scanning, not budgeting.",
      D: "Access Analyzer is for IAM/resource access analysis, not cost management.",
    },
    coaching:
      "Keyword rule: **cost threshold + alerts/forecast** → **AWS Budgets**. Trap: CloudTrail is security audit, not finance alerts.",
    memoryHook: "Budgets = limits + notifications.",
    testedConcepts: ["aws-budgets", "cost-forecast-alerts"],
    sources: [
      {
        title: "AWS Budgets — User Guide",
        url: "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html",
      },
    ],
    verified: true,
  },
  // --- NEW VERIFIED QUESTIONS (clf-091 .. clf-100) ---

  {
    id: "clf-091",
    domain: "Cloud Concepts",
    difficulty: "Hard",
    prompt:
      "Which AWS Cloud benefit MOST directly enables faster innovation by reducing time to market?",
    choices: [
      { id: "A", text: "High availability" },
      { id: "B", text: "Pay-as-you-go pricing" },
      { id: "C", text: "Managed services that remove infrastructure management" },
      { id: "D", text: "Global infrastructure" },
    ],
    answerId: "C",
    explanation:
      "Managed services offload operational tasks so teams can ship features faster.",
    coaching:
      "If the stem says **faster innovation / reduce time to market**, look for **managed services** (RDS, Lambda, SQS, etc.).\nTrap check: 'global' and 'high availability' are real benefits, but they’re not the *most direct* lever for shipping faster.",
    whyCorrect:
      "Managed services reduce undifferentiated heavy lifting (provisioning, patching, scaling) so engineering time shifts to product delivery and iteration.",
    whyWrong: {
      A: "Availability improves resilience, not development speed.",
      B: "Pay-as-you-go reduces upfront cost; it doesn’t directly accelerate shipping.",
      D: "Global infrastructure improves latency and reach, not the development cycle itself.",
    },
    memoryHook: "No servers → more shipping.",
    testedConcepts: ["Cloud value proposition", "Managed services"],
    sources: [
      {
        title: "AWS Cloud Value Proposition (What is Cloud Computing?)",
        url: "https://aws.amazon.com/what-is-cloud-computing/",
      },
    ],
    verified: true,
  },

  {
    id: "clf-092",
    domain: "Security",
    difficulty: "Medium",
    prompt:
      "Under the AWS Shared Responsibility Model, which task is the customer responsible for?",
    choices: [
      { id: "A", text: "Physical security of AWS data centers" },
      { id: "B", text: "Maintaining the hypervisor layer" },
      { id: "C", text: "Configuring security groups and network ACLs" },
      { id: "D", text: "Replacing failed hard drives in AWS hardware" },
    ],
    answerId: "C",
    explanation:
      "Customers configure security in the cloud, including network controls like security groups/NACLs.",
    coaching:
      "Quick rule: AWS handles **security OF the cloud** (facilities, hardware, core networking). You handle **security IN the cloud** (configs, IAM, OS/app for many services).\nIf you see security groups/NACLs/IAM policies → that’s almost always the customer side.",
    whyCorrect:
      "Network access controls (security groups, NACLs) are customer-configured controls that determine traffic allowed to and from resources.",
    whyWrong: {
      A: "AWS handles physical security and facilities.",
      B: "AWS operates the hypervisor layer in AWS-managed infrastructure.",
      D: "AWS manages hardware replacement and repairs.",
    },
    memoryHook: "IN the cloud = your configs.",
    testedConcepts: ["Shared Responsibility Model", "Network security controls"],
    sources: [
      {
        title: "AWS Shared Responsibility Model",
        url: "https://aws.amazon.com/compliance/shared-responsibility-model/",
      },
    ],
    verified: true,
  },

  {
    id: "clf-093",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A workload needs a fully managed relational database that automates backups, patching, and scaling where possible. Which AWS service best fits?",
    choices: [
      { id: "A", text: "Amazon EC2 with MySQL installed" },
      { id: "B", text: "Amazon RDS" },
      { id: "C", text: "Amazon S3" },
      { id: "D", text: "Amazon DynamoDB" },
    ],
    answerId: "B",
    explanation:
      "Amazon RDS is a managed relational database service with automated maintenance features.",
    coaching:
      "If it says **relational** + **managed** + **backups/patching**, pick **RDS**.\nTrap check: DynamoDB is managed but **non-relational**. EC2 gives you control but not managed ops.",
    whyCorrect:
      "RDS provides managed relational engines and automates operational tasks like backups and patching with built-in features and options for scaling.",
    whyWrong: {
      A: "EC2 requires you to manage backups, patching, scaling, and operations yourself.",
      C: "S3 is object storage, not a relational database.",
      D: "DynamoDB is NoSQL (non-relational).",
    },
    memoryHook: "RDS = Relational Done for you.",
    testedConcepts: ["Managed databases", "RDS vs EC2 vs DynamoDB"],
    sources: [
      { title: "Amazon RDS", url: "https://aws.amazon.com/rds/" },
    ],
    verified: true,
  },

  {
    id: "clf-094",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company wants the lowest compute cost for fault-tolerant workloads that can be interrupted. Which pricing model should they use?",
    choices: [
      { id: "A", text: "On-Demand Instances" },
      { id: "B", text: "Reserved Instances" },
      { id: "C", text: "Spot Instances" },
      { id: "D", text: "Dedicated Instances" },
    ],
    answerId: "C",
    explanation:
      "Spot Instances provide steep discounts for interruptible, flexible workloads.",
    coaching:
      "Keyword pattern: **interruptible / fault-tolerant / cheapest** → **Spot**.\nTrap check: if it says 'must not be interrupted' or 'steady baseline', Spot is wrong (use RI/Savings Plans/On-Demand).",
    whyCorrect:
      "Spot Instances use spare EC2 capacity and offer the deepest discounts, with the tradeoff that AWS can reclaim capacity (interruption).",
    whyWrong: {
      A: "On-Demand is flexible but typically costs more than Spot for the same compute.",
      B: "Reserved is for steady usage commitments; not the *lowest* and not about interruptions.",
      D: "Dedicated is for isolation/compliance and is typically more expensive.",
    },
    memoryHook: "Spot = spare capacity bargains.",
    testedConcepts: ["EC2 purchasing options", "Spot tradeoffs"],
    sources: [
      { title: "Amazon EC2 Spot Instances", url: "https://aws.amazon.com/ec2/spot/" },
    ],
    verified: true,
  },

  {
    id: "clf-095",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "Which AWS service is primarily used to help meet compliance requirements by providing evidence of controls and audit reports for AWS services?",
    choices: [
      { id: "A", text: "AWS Artifact" },
      { id: "B", text: "AWS CloudTrail" },
      { id: "C", text: "Amazon GuardDuty" },
      { id: "D", text: "AWS WAF" },
    ],
    answerId: "A",
    explanation:
      "AWS Artifact provides on-demand access to AWS compliance reports and agreements.",
    coaching:
      "If you see **audit reports / compliance documents / SOC reports**, that’s **AWS Artifact**.\nCloudTrail is logging, GuardDuty is threat detection, WAF is web firewall — all useful, but not the compliance report portal.",
    whyCorrect:
      "AWS Artifact is the central resource for compliance-related information, including audit artifacts and certain agreements.",
    whyWrong: {
      B: "CloudTrail records API activity; it’s evidence, but not where AWS provides official audit reports.",
      C: "GuardDuty detects threats; not a compliance report repository.",
      D: "WAF protects web apps; not compliance documentation.",
    },
    memoryHook: "Artifact = audit artifacts.",
    testedConcepts: ["Compliance on AWS", "Security services overview"],
    sources: [
      { title: "AWS Artifact", url: "https://aws.amazon.com/artifact/" },
    ],
    verified: true,
  },

  {
    id: "clf-096",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "Which service is best for decoupling application components using a fully managed message queue?",
    choices: [
      { id: "A", text: "Amazon SQS" },
      { id: "B", text: "Amazon EC2" },
      { id: "C", text: "Amazon Route 53" },
      { id: "D", text: "Amazon CloudFront" },
    ],
    answerId: "A",
    explanation:
      "Amazon SQS is a fully managed message queue used to decouple components.",
    coaching:
      "Decouple + queue + asynchronous messaging → **SQS**.\nTrap check: Route 53 = DNS, CloudFront = CDN, EC2 = compute.",
    whyCorrect:
      "SQS provides reliable, scalable queuing so producers and consumers can operate independently.",
    whyWrong: {
      B: "EC2 is compute; it’s not a managed queue.",
      C: "Route 53 is DNS and routing, not messaging.",
      D: "CloudFront is a CDN, not a queue.",
    },
    memoryHook: "SQS = Simple Queue Service (decouple).",
    testedConcepts: ["Decoupling", "Messaging basics"],
    sources: [
      { title: "Amazon SQS", url: "https://aws.amazon.com/sqs/" },
    ],
    verified: true,
  },

  {
    id: "clf-097",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company has multiple AWS accounts in AWS Organizations and wants to reduce overall costs while still tracking each team’s spend. Which feature best meets this requirement?",
    choices: [
      { id: "A", text: "Separate invoices for each AWS account" },
      { id: "B", text: "Consolidated billing with cost allocation tags" },
      { id: "C", text: "AWS Budgets with account-level alerts only" },
      { id: "D", text: "AWS Cost Explorer forecasts only" },
    ],
    answerId: "B",
    explanation:
      "Consolidated billing enables shared discounts; tags help allocate costs to teams.",
    coaching:
      "Organizations question that mentions **reduce costs + see team usage** → **consolidated billing** plus **tags/Cost Categories**.\nTrap check: Budgets alerts you, but doesn’t inherently consolidate or allocate across multiple accounts.",
    whyCorrect:
      "Consolidated billing can aggregate usage for tiered pricing/discounts, and tags enable cost allocation reporting by project/team.",
    whyWrong: {
      A: "Separate invoices reduce visibility into aggregate usage and don’t optimize shared discounts.",
      C: "Budgets helps monitor spend; it doesn’t provide consolidated billing savings by itself.",
      D: "Forecasting provides estimates, not allocation + consolidated savings.",
    },
    memoryHook: "Org + tags = savings + visibility.",
    testedConcepts: ["AWS Organizations", "Billing & cost allocation"],
    sources: [
      {
        title: "AWS Organizations - Consolidated billing",
        url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_accounts.html",
      },
      {
        title: "AWS Cost Allocation Tags",
        url: "https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/cost-alloc-tags.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-098",
    domain: "Cloud Concepts",
    difficulty: "Medium",
    prompt:
      "Which design principle helps achieve high availability in AWS architectures?",
    choices: [
      {
        id: "A",
        text: "Deploying resources in a single Availability Zone to reduce latency",
      },
      { id: "B", text: "Using multiple Availability Zones for redundancy" },
      { id: "C", text: "Purchasing Reserved Instances" },
      { id: "D", text: "Storing data only on instance storage for performance" },
    ],
    answerId: "B",
    explanation:
      "Using multiple Availability Zones increases fault tolerance and availability.",
    coaching:
      "High availability = **multi-AZ**.\nIf it says 'single AZ' it’s usually a trap unless the question is about latency/cost and explicitly accepts risk.",
    whyCorrect:
      "Multi-AZ designs tolerate the loss of an AZ by keeping workloads running in another AZ within the Region.",
    whyWrong: {
      A: "Single AZ is a single point of failure.",
      C: "Reserved Instances are a pricing model, not an HA design pattern.",
      D: "Instance storage is ephemeral and not an HA storage strategy.",
    },
    memoryHook: "HA = AZs, not discounts.",
    testedConcepts: ["High availability", "AZs vs Regions"],
    sources: [
      {
        title: "AWS Global Infrastructure (Regions & AZs)",
        url: "https://aws.amazon.com/about-aws/global-infrastructure/",
      },
    ],
    verified: true,
  },

  {
    id: "clf-099",
    domain: "Security",
    difficulty: "Medium",
    prompt:
      "Which AWS service provides centralized management of firewall rules (security group policies) across multiple accounts within AWS Organizations?",
    choices: [
      { id: "A", text: "AWS Firewall Manager" },
      { id: "B", text: "Amazon Inspector" },
      { id: "C", text: "AWS Shield Standard" },
      { id: "D", text: "AWS Secrets Manager" },
    ],
    answerId: "A",
    explanation:
      "AWS Firewall Manager centrally manages firewall policies across accounts.",
    coaching:
      "Keyword combo: **centralized policies + multiple accounts + Organizations** → **Firewall Manager**.\nTrap check: Inspector = vuln scanning, Shield = DDoS, Secrets Manager = secrets rotation.",
    whyCorrect:
      "Firewall Manager lets you define and enforce firewall policies (including security group policies and WAF rules) across multiple AWS accounts and resources.",
    whyWrong: {
      B: "Inspector assesses vulnerabilities; it doesn't centrally enforce network firewall policies.",
      C: "Shield protects against DDoS; not centralized firewall policy management.",
      D: "Secrets Manager manages secrets; unrelated to firewall policies.",
    },
    memoryHook: "Manager = manage policies everywhere.",
    testedConcepts: ["Central security management", "Organizations security tooling"],
    sources: [
      { title: "AWS Firewall Manager", url: "https://aws.amazon.com/firewall-manager/" },
    ],
    verified: true,
  },

  {
    id: "clf-100",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "Which AWS support plan includes guidance from a Technical Account Manager (TAM)?",
    choices: [
      { id: "A", text: "Basic" },
      { id: "B", text: "Developer" },
      { id: "C", text: "Business" },
      { id: "D", text: "Enterprise" },
    ],
    answerId: "D",
    explanation:
      "Enterprise Support includes a TAM (or designated technical support advisor) and proactive guidance.",
    coaching:
      "Support plan ladder:\nBasic (free) → Developer → Business → **Enterprise**.\nIf the question says **TAM / proactive guidance / concierge** → pick **Enterprise**.",
    whyCorrect:
      "Enterprise Support provides a TAM and proactive engagement to optimize operations and architecture at scale.",
    whyWrong: {
      A: "Basic has limited support and no TAM.",
      B: "Developer is for dev use cases; no TAM.",
      C: "Business has faster response times and broader support, but TAM is an Enterprise feature.",
    },
    memoryHook: "TAM = Top-tier (Enterprise).",
    testedConcepts: ["AWS Support plans"],
    sources: [
      { title: "AWS Support Plans", url: "https://aws.amazon.com/premiumsupport/plans/" },
    ],
    verified: true,
  },

  // --- NEW VERIFIED QUESTIONS (clf-111 .. clf-120) ---

  {
    id: "clf-111",
    domain: "Technology",
    difficulty: "Easy",
    prompt: "Which AWS service allows you to run code without provisioning or managing servers?",
    choices: [
      { id: "A", text: "Amazon EC2" },
      { id: "B", text: "AWS Lambda" },
      { id: "C", text: "Amazon ECS on EC2" },
      { id: "D", text: "Elastic Beanstalk on EC2" },
    ],
    answerId: "B",
    explanation: "Lambda is a serverless compute service that runs code without server management.",
    coaching: "Serverless code execution → **Lambda**.",
    whyCorrect:
      "AWS Lambda runs code in response to events and automatically manages the underlying infrastructure.",
    whyWrong: {
      A: "EC2 requires you to provision and manage servers.",
      C: "ECS on EC2 still runs on EC2 instances you manage.",
      D: "Elastic Beanstalk on EC2 still requires underlying EC2 capacity.",
    },
    memoryHook: "No servers → Lambda.",
    testedConcepts: ["serverless-compute", "lambda-basics"],
    sources: [
      { title: "AWS Lambda", url: "https://aws.amazon.com/lambda/" },
    ],
    verified: true,
  },

  {
    id: "clf-112",
    domain: "Security",
    difficulty: "Easy",
    prompt:
      "Under the AWS Shared Responsibility Model, which task is always the customer’s responsibility?",
    choices: [
      { id: "A", text: "Physical security of data centers" },
      { id: "B", text: "Patching hypervisors" },
      { id: "C", text: "Configuring security groups" },
      { id: "D", text: "Replacing hardware" },
    ],
    answerId: "C",
    explanation:
      "Customers are responsible for security IN the cloud, including network access controls.",
    coaching: "You secure what’s **in** the cloud; AWS secures the cloud itself.",
    whyCorrect:
      "Security groups are customer-managed network controls that define allowed traffic to resources.",
    whyWrong: {
      A: "AWS handles physical security of its data centers.",
      B: "AWS manages the hypervisor layer in its infrastructure.",
      D: "AWS replaces and maintains hardware.",
    },
    memoryHook: "IN the cloud = your configs.",
    testedConcepts: ["shared-responsibility-model", "security-groups"],
    sources: [
      {
        title: "AWS Shared Responsibility Model",
        url: "https://aws.amazon.com/compliance/shared-responsibility-model/",
      },
    ],
    verified: true,
  },

  {
    id: "clf-113",
    domain: "Billing & Pricing",
    difficulty: "Easy",
    prompt:
      "A company runs workloads 24/7 with predictable usage. Which pricing option provides the biggest long-term savings?",
    choices: [
      { id: "A", text: "On-Demand" },
      { id: "B", text: "Reserved Instances / Savings Plans" },
      { id: "C", text: "Spot Instances" },
      { id: "D", text: "Dedicated Hosts" },
    ],
    answerId: "B",
    explanation:
      "Reserved Instances and Savings Plans provide discounts for committed, steady usage.",
    coaching: "Predictable usage → **Reserved/Savings Plans**.",
    whyCorrect:
      "Committed pricing models (Reserved Instances or Savings Plans) deliver the best long-term discounts for steady workloads.",
    whyWrong: {
      A: "On-Demand offers flexibility but no long-term discount.",
      C: "Spot is cheapest but interruptible and not ideal for steady 24/7 workloads.",
      D: "Dedicated Hosts are for compliance/isolation and typically cost more.",
    },
    memoryHook: "Steady baseline = commit and save.",
    testedConcepts: ["pricing-models", "reserved-instances", "savings-plans"],
    sources: [
      { title: "Amazon EC2 Pricing", url: "https://aws.amazon.com/ec2/pricing/" },
      { title: "AWS Savings Plans", url: "https://aws.amazon.com/savingsplans/" },
    ],
    verified: true,
  },

  {
    id: "clf-114",
    domain: "Technology",
    difficulty: "Medium",
    prompt:
      "Which S3 storage class is best for compliance data that is rarely accessed but retrievable within hours?",
    choices: [
      { id: "A", text: "S3 Standard" },
      { id: "B", text: "S3 Intelligent-Tiering" },
      { id: "C", text: "S3 Glacier Flexible Retrieval" },
      { id: "D", text: "S3 Deep Archive" },
    ],
    answerId: "C",
    explanation:
      "Glacier Flexible Retrieval is designed for low-cost archival with retrieval times in minutes to hours.",
    coaching: "Hours to retrieve + archive = **Glacier Flexible Retrieval**.",
    whyCorrect:
      "Glacier Flexible Retrieval is optimized for infrequent access with retrieval in minutes to hours.",
    whyWrong: {
      A: "S3 Standard is higher cost and intended for frequent access.",
      B: "Intelligent-Tiering is for unknown access patterns, not explicit archival needs.",
      D: "Deep Archive is lower cost but has longer retrieval times (hours to days).",
    },
    memoryHook: "Hours = Glacier Flexible.",
    testedConcepts: ["s3-storage-classes", "archive-retrieval"],
    sources: [
      { title: "Amazon S3 Storage Classes", url: "https://aws.amazon.com/s3/storage-classes/" },
    ],
    verified: true,
  },

  {
    id: "clf-115",
    domain: "Cloud Concepts",
    difficulty: "Easy",
    prompt: "Which design improves availability if one data center fails?",
    choices: [
      { id: "A", text: "Single AZ with Auto Scaling" },
      { id: "B", text: "Multi-AZ deployment" },
      { id: "C", text: "Larger EC2 instances" },
      { id: "D", text: "Snowball backups" },
    ],
    answerId: "B",
    explanation:
      "Multi-AZ deployments provide redundancy across Availability Zones.",
    coaching: "AZ failure → **Multi-AZ**.",
    whyCorrect:
      "Using multiple Availability Zones provides fault isolation and redundancy if a single AZ fails.",
    whyWrong: {
      A: "Single AZ is a single point of failure, even with Auto Scaling.",
      C: "Bigger instances don’t remove the single-AZ risk.",
      D: "Snowball is for data transfer, not high availability.",
    },
    memoryHook: "HA = multi-AZ.",
    testedConcepts: ["high-availability", "availability-zones"],
    sources: [
      {
        title: "AWS Global Infrastructure (Regions & AZs)",
        url: "https://aws.amazon.com/about-aws/global-infrastructure/",
      },
    ],
    verified: true,
  },

  {
    id: "clf-116",
    domain: "Billing & Pricing",
    difficulty: "Medium",
    prompt:
      "Which AWS Support plan provides 24/7 phone access to engineers for production systems?",
    choices: [
      { id: "A", text: "Basic" },
      { id: "B", text: "Developer" },
      { id: "C", text: "Business" },
      { id: "D", text: "Enterprise" },
    ],
    answerId: "C",
    explanation:
      "Business Support includes 24/7 phone access to Cloud Support Engineers.",
    coaching: "Production + phone = **Business Support**.",
    whyCorrect:
      "Business Support offers 24/7 phone and chat access to Cloud Support Engineers.",
    whyWrong: {
      A: "Basic has no technical support.",
      B: "Developer offers limited support and not full 24/7 phone access.",
      D: "Enterprise includes TAM, but the question specifically targets 24/7 phone access for production.",
    },
    memoryHook: "Business = 24/7 phone.",
    testedConcepts: ["support-plans"],
    sources: [
      { title: "AWS Support Plans", url: "https://aws.amazon.com/premiumsupport/plans/" },
    ],
    verified: true,
  },

  {
    id: "clf-117",
    domain: "Billing & Pricing",
    difficulty: "Easy",
    prompt: "Which service alerts when spending is forecasted to exceed a budget?",
    choices: [
      { id: "A", text: "CloudTrail" },
      { id: "B", text: "AWS Budgets" },
      { id: "C", text: "CloudWatch Logs" },
      { id: "D", text: "Trusted Advisor" },
    ],
    answerId: "B",
    explanation:
      "AWS Budgets supports alerts based on actual or forecasted spend.",
    coaching: "Forecast + alerts = **Budgets**.",
    whyCorrect:
      "AWS Budgets can trigger notifications when actual or forecasted costs exceed thresholds.",
    whyWrong: {
      A: "CloudTrail records API calls; it doesn’t alert on spend.",
      C: "CloudWatch Logs stores log data, not budgets.",
      D: "Trusted Advisor provides recommendations, not budget alerts.",
    },
    memoryHook: "Budgets = spend alerts.",
    testedConcepts: ["aws-budgets", "cost-forecast-alerts"],
    sources: [
      {
        title: "AWS Budgets — User Guide",
        url: "https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-118",
    domain: "Technology",
    difficulty: "Easy",
    prompt:
      "Which service improves global website performance by caching content at edge locations?",
    choices: [
      { id: "A", text: "S3 Transfer Acceleration" },
      { id: "B", text: "CloudFront" },
      { id: "C", text: "Direct Connect" },
      { id: "D", text: "Elastic Load Balancer" },
    ],
    answerId: "B",
    explanation:
      "CloudFront is AWS’s CDN that caches content at edge locations worldwide.",
    coaching: "Global cache → **CloudFront**.",
    whyCorrect:
      "CloudFront distributes and caches content at edge locations to reduce latency for end users.",
    whyWrong: {
      A: "Transfer Acceleration speeds uploads to S3, not general site caching.",
      C: "Direct Connect is a private network connection, not a CDN.",
      D: "ELB distributes traffic but doesn’t provide edge caching.",
    },
    memoryHook: "CDN = CloudFront.",
    testedConcepts: ["cdn", "edge-locations"],
    sources: [
      { title: "Amazon CloudFront", url: "https://aws.amazon.com/cloudfront/" },
    ],
    verified: true,
  },

  {
    id: "clf-119",
    domain: "Technology",
    difficulty: "Easy",
    prompt: "Which service lets you run event-driven code and pay only for execution time?",
    choices: [
      { id: "A", text: "Amazon EC2" },
      { id: "B", text: "Amazon ECS on EC2" },
      { id: "C", text: "AWS Lambda" },
      { id: "D", text: "Amazon RDS" },
    ],
    answerId: "C",
    explanation:
      "Lambda runs event-driven functions and charges per request and duration.",
    coaching: "Event + pay per run = **Lambda**.",
    whyCorrect:
      "Lambda charges based on requests and duration, and it scales automatically for events.",
    whyWrong: {
      A: "EC2 requires managed instances and is billed by uptime.",
      B: "ECS on EC2 still depends on EC2 instances you manage and pay for.",
      D: "RDS is a database service, not event-driven compute.",
    },
    memoryHook: "Lambda = pay per execution.",
    testedConcepts: ["lambda-pricing", "event-driven-compute"],
    sources: [
      { title: "AWS Lambda Pricing", url: "https://aws.amazon.com/lambda/pricing/" },
    ],
    verified: true,
  },

  {
    id: "clf-120",
    domain: "Security",
    difficulty: "Easy",
    prompt: "Which technology encrypts data between a browser and an AWS application?",
    choices: [
      { id: "A", text: "SSE-S3" },
      { id: "B", text: "TLS / HTTPS" },
      { id: "C", text: "EBS Encryption" },
      { id: "D", text: "AWS Shield" },
    ],
    answerId: "B",
    explanation: "TLS/HTTPS encrypts data in transit between client and server.",
    coaching: "In transit = **TLS/HTTPS**.",
    whyCorrect:
      "TLS (HTTPS) provides encryption for data in transit between browsers and applications.",
    whyWrong: {
      A: "SSE-S3 encrypts data at rest in S3, not in transit.",
      C: "EBS encryption protects data at rest on volumes.",
      D: "AWS Shield provides DDoS protection, not transport encryption.",
    },
    memoryHook: "Transit = TLS.",
    testedConcepts: ["encryption-in-transit", "tls-https"],
    sources: [
      {
        title: "Security Pillar: Encrypt Data in Transit",
        url: "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/encryption-in-transit.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-146",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A company runs a customer-facing application on Amazon EC2 in a single Region. Management requires the application to remain available even if the entire Region becomes unavailable. Which solution BEST meets this requirement with minimal operational overhead?",
    choices: [
      { id: "A", text: "Deploy instances in multiple Availability Zones and use Auto Scaling" },
      { id: "B", text: "Use Amazon CloudFront with an S3 origin in one Region" },
      {
        id: "C",
        text: "Deploy the application in multiple Regions and use Amazon Route 53 health checks with DNS failover",
      },
      { id: "D", text: "Use AWS Backup to replicate data to another Region" },
    ],
    answerId: "C",
    explanation:
      "Regional resilience requires multi-Region deployment plus failover routing.",
    coaching:
      "Exam tip: AZs protect from data center failures. Regions protect from regional failures.",
    whyCorrect:
      "Multi-Region deployment with Route 53 health-check-based DNS failover provides automatic redirection to a healthy Region during a full regional outage.",
    whyWrong: {
      A: "Multi-AZ improves availability inside one Region but does not survive full regional outages.",
      B: "CloudFront with a single-region origin still depends on that Region.",
      D: "Backups help recovery but do not provide active application failover.",
    },
    memoryHook: "Region outage protection = multi-Region + Route 53 failover.",
    testedConcepts: ["route53-dns-failover", "multi-region-architecture", "regional-resilience"],
    sources: [
      {
        title: "Amazon Route 53 DNS Failover",
        url: "https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-failover.html",
      },
      {
        title: "AWS Global Infrastructure",
        url: "https://aws.amazon.com/about-aws/global-infrastructure/",
      },
    ],
    verified: true,
  },

  {
    id: "clf-147",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A company allows developers to assume IAM roles across multiple AWS accounts. Security requires that only requests coming from approved corporate IP ranges can assume these roles. Which solution BEST meets this requirement?",
    choices: [
      { id: "A", text: "Attach an IAM policy using aws:SourceIp condition to the role" },
      { id: "B", text: "Enable AWS Shield Advanced" },
      { id: "C", text: "Use security groups to restrict role access" },
      { id: "D", text: "Encrypt role credentials using AWS KMS" },
    ],
    answerId: "A",
    explanation:
      "IAM policy conditions can enforce source-IP-based restrictions for role assumption.",
    coaching:
      "Conditional access in IAM questions usually maps to policy condition keys.",
    whyCorrect:
      "Using the aws:SourceIp condition key in the role trust/policy evaluation path restricts role assumption requests to approved corporate CIDR ranges.",
    whyWrong: {
      B: "Shield Advanced provides DDoS protection, not IAM source-IP authorization controls.",
      C: "Security groups control network traffic to resources, not IAM role assumption.",
      D: "KMS encrypts data/keys but does not enforce source-IP conditions for AssumeRole.",
    },
    memoryHook: "Source IP restriction for IAM = aws:SourceIp condition.",
    testedConcepts: ["iam-condition-keys", "cross-account-assume-role", "least-privilege-access"],
    sources: [
      {
        title: "IAM Policy Condition Keys",
        url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html",
      },
      {
        title: "IAM Global Condition Context Keys",
        url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html#condition-keys-sourceip",
      },
    ],
    verified: true,
  },

  {
    id: "clf-148",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company purchases Reserved Instances for EC2 in one Availability Zone. Later, they move workloads to another AZ in the same Region. What happens to the Reserved Instance discount?",
    choices: [
      { id: "A", text: "The discount automatically applies in the new AZ" },
      { id: "B", text: "The discount is lost" },
      { id: "C", text: "The discount applies only to On-Demand usage in the original AZ" },
      { id: "D", text: "The discount is converted into Spot credits" },
    ],
    answerId: "C",
    explanation:
      "Zonal RI discounts are scoped to the purchased Availability Zone unless converted/exchanged by RI type and rules.",
    coaching:
      "Exam tip: Standard zonal RIs are AZ-scoped; moving AZs can break matching discount application.",
    whyCorrect:
      "A zonal Reserved Instance discount applies only to matching usage in its specified AZ; moving usage to another AZ means the original AZ scope is what still matches RI discounting.",
    whyWrong: {
      A: "Zonal RI discounts do not automatically transfer to a different AZ.",
      B: "The reservation still exists; it is not deleted, but it may no longer match moved usage.",
      D: "RI discounts are not converted into Spot credits.",
    },
    memoryHook: "Zonal RI = AZ-bound discount.",
    testedConcepts: ["ec2-reserved-instances", "zonal-vs-regional-ri", "cost-optimization"],
    sources: [
      {
        title: "Amazon EC2 Reserved Instances",
        url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html",
      },
      {
        title: "Reserved Instance Scope (Regional vs Zonal)",
        url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/reserved-instances-scope.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-149",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A workload requires sub-millisecond latency and predictable performance for millions of key-value requests per second. Which AWS service BEST meets this requirement?",
    choices: [
      { id: "A", text: "Amazon RDS MySQL" },
      { id: "B", text: "Amazon DynamoDB with DAX" },
      { id: "C", text: "Amazon Aurora Serverless" },
      { id: "D", text: "Amazon S3 Select" },
    ],
    answerId: "B",
    explanation:
      "DynamoDB with DAX is purpose-built for very high-throughput key-value access with very low read latency.",
    coaching:
      "Ultra-low-latency key-value at scale points to DynamoDB, and DAX is the latency accelerator.",
    whyCorrect:
      "DynamoDB scales for massive key-value throughput, and DAX adds in-memory caching for microsecond-level response times on read-heavy workloads.",
    whyWrong: {
      A: "RDS MySQL is relational and generally not optimized for this key-value scale/latency profile.",
      C: "Aurora Serverless is relational and not the best fit for this extreme key-value request pattern.",
      D: "S3 Select is for object query patterns, not ultra-low-latency key-value serving.",
    },
    memoryHook: "Massive key-value + ultra-low latency = DynamoDB + DAX.",
    testedConcepts: ["dynamodb", "dax", "high-throughput-nosql"],
    sources: [
      {
        title: "Amazon DynamoDB Accelerator (DAX)",
        url: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DAX.html",
      },
      {
        title: "Amazon DynamoDB",
        url: "https://aws.amazon.com/dynamodb/",
      },
    ],
    verified: true,
  },

  {
    id: "clf-150",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A regulated organization must ensure that AWS administrators cannot access customer encryption keys. Which service BEST satisfies this requirement?",
    choices: [
      { id: "A", text: "AWS KMS" },
      { id: "B", text: "AWS Secrets Manager" },
      { id: "C", text: "AWS CloudHSM" },
      { id: "D", text: "AWS Certificate Manager" },
    ],
    answerId: "C",
    explanation:
      "CloudHSM provides customer-controlled hardware security modules for exclusive key control.",
    coaching:
      "If the question says strict customer-exclusive key custody, CloudHSM is the exam-favorite answer.",
    whyCorrect:
      "AWS CloudHSM provides dedicated HSMs where the customer controls key material and crypto operations, supporting stronger separation from AWS-managed administration.",
    whyWrong: {
      A: "AWS KMS is a managed key service and does not provide the same level of customer-exclusive HSM custody model.",
      B: "Secrets Manager stores and rotates secrets, not HSM key custody.",
      D: "ACM manages certificates, not customer-owned encryption key control for this requirement.",
    },
    memoryHook: "Maximum key custody control = CloudHSM.",
    testedConcepts: ["cloudhsm", "kms-vs-cloudhsm", "regulatory-key-control"],
    sources: [
      {
        title: "AWS CloudHSM",
        url: "https://docs.aws.amazon.com/cloudhsm/latest/userguide/introduction.html",
      },
      {
        title: "AWS KMS Overview",
        url: "https://docs.aws.amazon.com/kms/latest/developerguide/overview.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-151",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company runs batch jobs that can be interrupted and restarted. Management wants the lowest possible compute cost. Which solution is MOST cost-effective?",
    choices: [
      { id: "A", text: "On-Demand Instances" },
      { id: "B", text: "Reserved Instances" },
      { id: "C", text: "Spot Instances" },
      { id: "D", text: "Savings Plans" },
    ],
    answerId: "C",
    explanation:
      "Spot Instances are typically the lowest-cost EC2 option for interruption-tolerant workloads.",
    coaching:
      "Interruptible + restartable batch workloads map to Spot almost every time.",
    whyCorrect:
      "Spot Instances use spare EC2 capacity at deep discounts, making them the most cost-effective choice for fault-tolerant, interruptible jobs.",
    whyWrong: {
      A: "On-Demand is flexible but usually more expensive than Spot.",
      B: "Reserved Instances lower cost with commitment but are typically not as cheap as Spot.",
      D: "Savings Plans reduce cost via commitment, but Spot usually yields lower cost for interruptible jobs.",
    },
    memoryHook: "Interruptible batch = Spot savings.",
    testedConcepts: ["spot-instances", "ec2-pricing-models", "cost-optimization"],
    sources: [
      {
        title: "Amazon EC2 Spot Instances",
        url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-152",
    domain: "Cloud Concepts",
    difficulty: "Hard",
    prompt:
      "A company adopts Infrastructure as Code (IaC) to improve governance. Which AWS service enables consistent, repeatable infrastructure provisioning?",
    choices: [
      { id: "A", text: "AWS CloudFormation" },
      { id: "B", text: "AWS Config" },
      { id: "C", text: "AWS CloudTrail" },
      { id: "D", text: "AWS OpsWorks" },
    ],
    answerId: "A",
    explanation:
      "CloudFormation provisions infrastructure from templates for repeatable, governed deployments.",
    coaching:
      "IaC in AWS exam context defaults to CloudFormation unless another templating tool is explicitly named.",
    whyCorrect:
      "AWS CloudFormation uses declarative templates to provision and manage infrastructure consistently across environments.",
    whyWrong: {
      B: "AWS Config evaluates and records configuration state; it does not provision infrastructure.",
      C: "CloudTrail logs API activity for auditing, not IaC provisioning.",
      D: "OpsWorks is configuration-management-oriented and not the primary IaC provisioning answer for this scenario.",
    },
    memoryHook: "IaC templates = CloudFormation.",
    testedConcepts: ["infrastructure-as-code", "cloudformation", "governance"],
    sources: [
      {
        title: "AWS CloudFormation User Guide",
        url: "https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-153",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A security team wants to detect unusual API activity and compromised credentials automatically. Which AWS service BEST supports this?",
    choices: [
      { id: "A", text: "AWS Inspector" },
      { id: "B", text: "Amazon GuardDuty" },
      { id: "C", text: "AWS WAF" },
      { id: "D", text: "AWS Config" },
    ],
    answerId: "B",
    explanation:
      "GuardDuty performs continuous threat detection using multiple AWS telemetry sources.",
    coaching:
      "Threat detection and anomaly findings in AWS accounts is GuardDuty territory.",
    whyCorrect:
      "Amazon GuardDuty analyzes CloudTrail management events, VPC Flow Logs, and DNS logs to identify suspicious activity and potential credential compromise.",
    whyWrong: {
      A: "Inspector focuses on vulnerability and exposure assessment, not account-level threat detection.",
      C: "WAF filters web requests to applications; it does not analyze account/API behavior for credential compromise.",
      D: "Config tracks resource configuration/compliance state rather than active threat detection.",
    },
    memoryHook: "Unusual activity detection = GuardDuty.",
    testedConcepts: ["guardduty", "threat-detection", "credential-compromise-signals"],
    sources: [
      {
        title: "Amazon GuardDuty User Guide",
        url: "https://docs.aws.amazon.com/guardduty/latest/ug/what-is-guardduty.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-154",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A hybrid environment requires private connectivity between on-premises infrastructure and AWS with consistent bandwidth and low latency. Which service BEST meets this need?",
    choices: [
      { id: "A", text: "VPN over Internet Gateway" },
      { id: "B", text: "AWS Direct Connect" },
      { id: "C", text: "Amazon CloudFront" },
      { id: "D", text: "AWS Transit Gateway" },
    ],
    answerId: "B",
    explanation:
      "Direct Connect provides a dedicated private connection with predictable performance characteristics.",
    coaching:
      "Private line, stable bandwidth, low latency between on-prem and AWS points to Direct Connect.",
    whyCorrect:
      "AWS Direct Connect establishes dedicated private network links to AWS, reducing internet variability and improving consistency.",
    whyWrong: {
      A: "VPN traverses the public internet and typically has less predictable latency/bandwidth.",
      C: "CloudFront is a CDN, not hybrid private connectivity.",
      D: "Transit Gateway centralizes routing but does not itself provide dedicated on-prem private circuits.",
    },
    memoryHook: "Private circuit to AWS = Direct Connect.",
    testedConcepts: ["direct-connect", "hybrid-networking", "on-prem-to-aws-connectivity"],
    sources: [
      {
        title: "AWS Direct Connect User Guide",
        url: "https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-155",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company wants to share volume-based discounts across multiple AWS accounts. Which service enables this?",
    choices: [
      { id: "A", text: "AWS Budgets" },
      { id: "B", text: "AWS Cost Explorer" },
      { id: "C", text: "AWS Organizations with consolidated billing" },
      { id: "D", text: "AWS Marketplace" },
    ],
    answerId: "C",
    explanation:
      "Consolidated billing in AWS Organizations aggregates usage across accounts for shared pricing benefits.",
    coaching:
      "Shared discounts and centralized billing across accounts = Organizations + consolidated billing.",
    whyCorrect:
      "AWS Organizations consolidated billing combines usage across linked accounts so eligible volume discounts and pricing tiers apply at the organization level.",
    whyWrong: {
      A: "Budgets tracks and alerts on spend; it does not aggregate discounts across accounts.",
      B: "Cost Explorer analyzes costs but does not provide consolidated discount sharing.",
      D: "Marketplace is for third-party software procurement, not account billing consolidation.",
    },
    memoryHook: "Multi-account discount sharing = Organizations billing.",
    testedConcepts: ["aws-organizations", "consolidated-billing", "multi-account-cost-management"],
    sources: [
      {
        title: "AWS Organizations",
        url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html",
      },
      {
        title: "Consolidated Billing for Organizations",
        url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_accounts_consolidated-billing.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-156",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A company hosts a critical application on EC2 behind an Application Load Balancer. They need to ensure traffic is routed only to healthy instances and automatically removed when failures occur. Which feature BEST supports this?",
    choices: [
      { id: "A", text: "Security group rules" },
      { id: "B", text: "Target group health checks" },
      { id: "C", text: "Auto Scaling scheduled actions" },
      { id: "D", text: "Route 53 latency routing" },
    ],
    answerId: "B",
    explanation:
      "ALB target group health checks continuously evaluate target health and stop routing traffic to unhealthy instances.",
    coaching: "Load balancer health behavior is controlled by target group health checks.",
    whyCorrect:
      "Target group health checks are purpose-built to monitor backend instance health and automatically include/exclude targets from traffic routing.",
    whyWrong: {
      A: "Security groups control network access, not ALB health-based routing decisions.",
      C: "Scheduled scaling changes capacity by time, not by live instance health status.",
      D: "Route 53 latency routing is DNS-level routing, not per-instance health routing behind an ALB.",
    },
    memoryHook: "ALB traffic decisions = target group health checks.",
    testedConcepts: ["alb", "target-groups", "health-checks", "high-availability"],
    sources: [
      {
        title: "Health checks for Application Load Balancer target groups",
        url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-157",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A company requires all S3 data to be encrypted using customer-managed keys. Which configuration BEST meets this requirement?",
    choices: [
      { id: "A", text: "Enable SSE-S3" },
      { id: "B", text: "Enable SSE-KMS with customer-managed CMK" },
      { id: "C", text: "Enable client-side encryption only" },
      { id: "D", text: "Enable S3 Transfer Acceleration" },
    ],
    answerId: "B",
    explanation:
      "SSE-KMS with customer-managed KMS keys provides S3 server-side encryption using keys you control in KMS.",
    coaching: "Customer-managed key requirement points directly to SSE-KMS with your own KMS key.",
    whyCorrect:
      "SSE-KMS supports encryption at rest in S3 while allowing use of customer-managed KMS keys with policy and audit control.",
    whyWrong: {
      A: "SSE-S3 uses Amazon-managed keys, not customer-managed KMS keys.",
      C: "Client-side encryption can work but is operationally heavier and not the best direct managed configuration here.",
      D: "Transfer Acceleration improves transfer performance and is unrelated to encryption key management.",
    },
    memoryHook: "Customer-managed encryption in S3 = SSE-KMS.",
    testedConcepts: ["s3-encryption", "sse-kms", "kms-customer-managed-keys"],
    sources: [
      {
        title: "Protecting data using server-side encryption with AWS KMS keys (SSE-KMS)",
        url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html",
      },
      {
        title: "AWS KMS keys",
        url: "https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-158",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company uses multiple AWS accounts under AWS Organizations. They want to prevent development accounts from exceeding monthly budgets. Which solution BEST enforces this?",
    choices: [
      { id: "A", text: "AWS Budgets alerts only" },
      { id: "B", text: "Service Control Policies (SCPs)" },
      { id: "C", text: "IAM permission boundaries" },
      { id: "D", text: "Cost Explorer reports" },
    ],
    answerId: "B",
    explanation:
      "SCPs provide organization-level guardrails to enforce account-wide service/action limits across member accounts.",
    coaching: "For account-wide preventive controls in Organizations, think SCP first.",
    whyCorrect:
      "SCPs can enforce preventive, account-level restrictions across development accounts under AWS Organizations, unlike advisory-only cost reports/alerts.",
    whyWrong: {
      A: "Budgets alerts notify but do not enforce hard preventive account-level restrictions by themselves.",
      C: "Permission boundaries scope IAM permissions, not full account-level organizational guardrails.",
      D: "Cost Explorer is analytic/reporting only and cannot enforce behavior.",
    },
    memoryHook: "Org-level prevention = SCP guardrails.",
    testedConcepts: ["aws-organizations", "scp", "multi-account-governance"],
    sources: [
      {
        title: "Service control policies (SCPs)",
        url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-159",
    domain: "Cloud Concepts",
    difficulty: "Hard",
    prompt:
      "A company wants to improve governance by ensuring all resources have cost-allocation tags. Which service BEST supports continuous compliance monitoring?",
    choices: [
      { id: "A", text: "AWS Config" },
      { id: "B", text: "AWS CloudTrail" },
      { id: "C", text: "AWS Trusted Advisor" },
      { id: "D", text: "Amazon Inspector" },
    ],
    answerId: "A",
    explanation:
      "AWS Config continuously evaluates resource configurations against rules, including required-tag compliance.",
    coaching: "Configuration compliance and required tags are classic AWS Config rule use cases.",
    whyCorrect:
      "AWS Config can continuously assess resources against required-tags rules and report/track noncompliance.",
    whyWrong: {
      B: "CloudTrail captures API activity history, not ongoing configuration-rule compliance.",
      C: "Trusted Advisor provides recommendations, not full rule-based continuous configuration compliance across all resources.",
      D: "Inspector focuses on vulnerability management, not tag policy compliance.",
    },
    memoryHook: "Continuous config/tag compliance = AWS Config.",
    testedConcepts: ["aws-config", "tag-governance", "continuous-compliance"],
    sources: [
      {
        title: "AWS Config managed rules (required-tags)",
        url: "https://docs.aws.amazon.com/config/latest/developerguide/required-tags.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-160",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "An application requires automatic failover for a relational database with minimal downtime. Which solution BEST meets this requirement?",
    choices: [
      { id: "A", text: "RDS Single-AZ" },
      { id: "B", text: "RDS Multi-AZ" },
      { id: "C", text: "Aurora Read Replica" },
      { id: "D", text: "DynamoDB Global Tables" },
    ],
    answerId: "B",
    explanation:
      "RDS Multi-AZ provides synchronous standby replication and automatic failover for relational databases.",
    coaching: "Relational high availability with automatic failover in RDS is Multi-AZ.",
    whyCorrect:
      "RDS Multi-AZ deployments maintain a synchronous standby and trigger automatic failover to minimize downtime during instance/AZ failures.",
    whyWrong: {
      A: "Single-AZ has no standby failover target.",
      C: "Read replicas improve read scale and can be promoted manually, but are not the primary automatic failover mechanism for this requirement.",
      D: "DynamoDB Global Tables are for NoSQL workloads, not relational RDS engines.",
    },
    memoryHook: "Relational HA failover = RDS Multi-AZ.",
    testedConcepts: ["rds-multi-az", "database-high-availability", "automatic-failover"],
    sources: [
      {
        title: "Amazon RDS Multi-AZ deployments",
        url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-161",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A company wants to ensure API calls are traceable for auditing and forensic analysis. Which service BEST provides this?",
    choices: [
      { id: "A", text: "AWS Config" },
      { id: "B", text: "Amazon GuardDuty" },
      { id: "C", text: "AWS CloudTrail" },
      { id: "D", text: "AWS WAF" },
    ],
    answerId: "C",
    explanation:
      "CloudTrail records API activity across AWS accounts and services for audit and forensic use.",
    coaching: "For API call history and who-did-what trails, use CloudTrail.",
    whyCorrect:
      "AWS CloudTrail captures API events, identities, timestamps, and request details needed for auditing and investigations.",
    whyWrong: {
      A: "Config tracks resource configuration state/compliance, not complete API call trails.",
      B: "GuardDuty detects suspicious behavior but is not the primary API activity record.",
      D: "WAF filters web requests to applications and does not provide full AWS API audit logging.",
    },
    memoryHook: "API audit trail = CloudTrail.",
    testedConcepts: ["cloudtrail", "audit-logging", "forensics"],
    sources: [
      {
        title: "AWS CloudTrail User Guide",
        url: "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-162",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company commits to a 3-year Compute Savings Plan. Which benefit does this provide?",
    choices: [
      { id: "A", text: "Instance-specific reservations" },
      { id: "B", text: "Automatic Spot pricing" },
      { id: "C", text: "Flexible compute discounts across services" },
      { id: "D", text: "Free data transfer" },
    ],
    answerId: "C",
    explanation:
      "Compute Savings Plans provide flexible discounted rates across eligible compute services and usage dimensions.",
    coaching: "Savings Plans trade commitment for flexible compute discounts.",
    whyCorrect:
      "Compute Savings Plans apply discounts broadly across EC2 instance families/sizes/Regions as well as Lambda and Fargate, unlike rigid instance-scoped reservation constructs.",
    whyWrong: {
      A: "Instance-specific reservation behavior aligns more with Standard RIs than Compute Savings Plans.",
      B: "Savings Plans do not automatically convert On-Demand to Spot pricing behavior.",
      D: "Savings Plans do not grant free data transfer.",
    },
    memoryHook: "Compute Savings Plan = flexible compute discount.",
    testedConcepts: ["savings-plans", "cost-optimization", "pricing-models"],
    sources: [
      {
        title: "AWS Savings Plans",
        url: "https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-163",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A company wants to connect multiple VPCs and on-premises networks using a central hub. Which service BEST supports this?",
    choices: [
      { id: "A", text: "VPC Peering" },
      { id: "B", text: "AWS Transit Gateway" },
      { id: "C", text: "AWS Direct Connect" },
      { id: "D", text: "Elastic Load Balancer" },
    ],
    answerId: "B",
    explanation:
      "Transit Gateway provides hub-and-spoke routing to interconnect many VPCs and on-prem networks centrally.",
    coaching: "Centralized multi-network routing in AWS points to Transit Gateway.",
    whyCorrect:
      "AWS Transit Gateway is designed as a scalable central routing hub for multiple VPC and hybrid network attachments.",
    whyWrong: {
      A: "VPC peering is point-to-point and becomes complex at scale.",
      C: "Direct Connect provides private connectivity but is not the central routing hub service itself.",
      D: "ELB distributes application traffic and is unrelated to network topology hub routing.",
    },
    memoryHook: "Hub-and-spoke AWS networking = Transit Gateway.",
    testedConcepts: ["transit-gateway", "hybrid-networking", "vpc-connectivity"],
    sources: [
      {
        title: "AWS Transit Gateway",
        url: "https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-164",
    domain: "Cloud Concepts",
    difficulty: "Hard",
    prompt:
      "A company wants to migrate applications incrementally while maintaining on-premises systems. Which cloud adoption strategy BEST fits?",
    choices: [
      { id: "A", text: "Rehost" },
      { id: "B", text: "Replatform" },
      { id: "C", text: "Hybrid deployment" },
      { id: "D", text: "Refactor" },
    ],
    answerId: "C",
    explanation:
      "Hybrid deployment supports running workloads across both on-premises and cloud environments during phased adoption.",
    coaching: "When cloud and on-prem are intentionally operated together, it is a hybrid model.",
    whyCorrect:
      "Hybrid deployment enables incremental migration and coexistence by integrating on-prem and AWS environments.",
    whyWrong: {
      A: "Rehost is a migration technique, not the long-running dual-environment operating model.",
      B: "Replatform modifies architecture partly, but does not itself describe operating cloud+on-prem together.",
      D: "Refactor is a deep redesign approach and not the operating-model term here.",
    },
    memoryHook: "Cloud + on-prem coexistence = hybrid.",
    testedConcepts: ["hybrid-cloud", "migration-strategies", "operating-models"],
    sources: [
      {
        title: "AWS Cloud Adoption Framework",
        url: "https://docs.aws.amazon.com/whitepapers/latest/aws-caf-introduction/aws-caf-introduction.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-165",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A company needs to rotate database credentials automatically without modifying application code. Which service BEST meets this requirement?",
    choices: [
      { id: "A", text: "AWS KMS" },
      { id: "B", text: "AWS Secrets Manager" },
      { id: "C", text: "AWS Systems Manager" },
      { id: "D", text: "AWS Certificate Manager" },
    ],
    answerId: "B",
    explanation:
      "Secrets Manager provides secure secret storage and built-in automatic rotation workflows for supported databases.",
    coaching: "Automatic secret rotation for DB credentials is a core Secrets Manager capability.",
    whyCorrect:
      "AWS Secrets Manager manages and rotates secrets with native integrations/Lambda rotation workflows, minimizing application changes when retrieving updated credentials.",
    whyWrong: {
      A: "KMS manages encryption keys, not end-to-end credential rotation workflows.",
      C: "Systems Manager Parameter Store can store secrets but does not provide the same native automatic rotation model as Secrets Manager.",
      D: "ACM manages TLS certificates, not database credential rotation.",
    },
    memoryHook: "DB credential rotation = Secrets Manager.",
    testedConcepts: ["secrets-manager", "credential-rotation", "database-security"],
    sources: [
      {
        title: "AWS Secrets Manager User Guide",
        url: "https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-166",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A company wants to ensure that no resources are created without encryption enabled. Which AWS feature BEST enforces this across accounts?",
    choices: [
      { id: "A", text: "AWS Budgets" },
      { id: "B", text: "Service Control Policies (SCPs)" },
      { id: "C", text: "AWS CloudTrail" },
      { id: "D", text: "Security Groups" },
    ],
    answerId: "B",
    explanation:
      "SCPs provide organization-wide preventive guardrails and can deny actions that violate encryption requirements.",
    coaching: "Need preventive control across accounts? Use Organizations SCPs.",
    whyCorrect:
      "SCPs apply at the AWS Organizations level and can explicitly deny noncompliant resource-creation actions across member accounts.",
    whyWrong: {
      A: "Budgets monitors and alerts on spend; it does not enforce encryption controls.",
      C: "CloudTrail logs API activity but does not block unencrypted resource creation.",
      D: "Security groups govern network traffic, not encryption enforcement for resource creation APIs.",
    },
    memoryHook: "Global preventive policy across accounts = SCP.",
    testedConcepts: ["aws-organizations", "scp", "encryption-governance"],
    sources: [
      {
        title: "Service control policies (SCPs)",
        url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-167",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A company requires near real-time replication of S3 objects to another Region for disaster recovery. Which solution BEST meets this need?",
    choices: [
      { id: "A", text: "S3 Batch Replication" },
      { id: "B", text: "S3 Cross-Region Replication (CRR)" },
      { id: "C", text: "AWS Backup" },
      { id: "D", text: "AWS DataSync" },
    ],
    answerId: "B",
    explanation:
      "S3 CRR continuously and automatically replicates eligible new objects to a destination bucket in another Region.",
    coaching: "For ongoing cross-Region S3 DR replication, CRR is the standard answer.",
    whyCorrect:
      "Cross-Region Replication is built for automatic asynchronous replication of S3 objects between Regions for resilience and DR.",
    whyWrong: {
      A: "Batch Replication is intended for backfill/one-time existing-object replication workflows.",
      C: "AWS Backup runs backup schedules and restore workflows, not near real-time object replication.",
      D: "DataSync is transfer/migration oriented and not the native continuous S3 object replication mechanism.",
    },
    memoryHook: "S3 DR across Regions = CRR.",
    testedConcepts: ["s3-crr", "disaster-recovery", "cross-region-replication"],
    sources: [
      {
        title: "Replicating objects with S3 Cross-Region Replication",
        url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-168",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company wants to identify unused EC2 instances and idle load balancers to reduce costs. Which AWS tool BEST helps?",
    choices: [
      { id: "A", text: "AWS Cost Explorer" },
      { id: "B", text: "AWS Budgets" },
      { id: "C", text: "AWS Trusted Advisor" },
      { id: "D", text: "AWS Marketplace" },
    ],
    answerId: "C",
    explanation:
      "Trusted Advisor includes cost optimization checks that surface idle and underutilized resources.",
    coaching: "Idle/underutilized resource recommendations usually point to Trusted Advisor.",
    whyCorrect:
      "Trusted Advisor evaluates usage patterns and flags opportunities such as idle load balancers and underutilized compute resources.",
    whyWrong: {
      A: "Cost Explorer provides spend analytics/trends but not the same actionable idle-resource checks.",
      B: "Budgets defines thresholds and alerts but does not identify specific idle infrastructure.",
      D: "Marketplace is for software procurement, not infrastructure utilization analysis.",
    },
    memoryHook: "Idle resource detection = Trusted Advisor checks.",
    testedConcepts: ["trusted-advisor", "cost-optimization", "unused-resources"],
    sources: [
      {
        title: "AWS Trusted Advisor cost optimization checks",
        url: "https://docs.aws.amazon.com/awssupport/latest/user/cost-optimization-checks.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-169",
    domain: "Cloud Concepts",
    difficulty: "Hard",
    prompt:
      "A company wants to reduce operational overhead by using fully managed services whenever possible. Which principle of cloud computing does this reflect?",
    choices: [
      { id: "A", text: "Elasticity" },
      { id: "B", text: "Agility" },
      { id: "C", text: "Managed Services" },
      { id: "D", text: "Operational Excellence" },
    ],
    answerId: "C",
    explanation:
      "Using managed services shifts undifferentiated infrastructure operations from customer teams to AWS.",
    coaching: "Less platform management burden directly maps to managed services.",
    whyCorrect:
      "Managed services reduce customer responsibility for routine infrastructure operations, which lowers operational overhead.",
    whyWrong: {
      A: "Elasticity is about scaling resources with demand, not specifically minimizing management effort.",
      B: "Agility is faster experimentation/delivery, not the direct service model principle asked.",
      D: "Operational Excellence is a Well-Architected pillar, not the specific service-consumption principle in the prompt.",
    },
    memoryHook: "Less ops work = managed services model.",
    testedConcepts: ["managed-services", "cloud-value-proposition", "shared-responsibility"],
    sources: [
      {
        title: "AWS Shared Responsibility Model",
        url: "https://aws.amazon.com/compliance/shared-responsibility-model/",
      },
    ],
    verified: true,
  },

  {
    id: "clf-170",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "An application requires persistent shared file storage accessible by multiple EC2 instances. Which service BEST fits?",
    choices: [
      { id: "A", text: "Amazon S3" },
      { id: "B", text: "Amazon EBS" },
      { id: "C", text: "Amazon EFS" },
      { id: "D", text: "Amazon Glacier" },
    ],
    answerId: "C",
    explanation:
      "Amazon EFS provides a managed, scalable shared file system for multiple EC2 instances.",
    coaching: "Shared POSIX file storage across instances in AWS = EFS.",
    whyCorrect:
      "EFS is designed for concurrent, persistent shared file access from multiple EC2 instances.",
    whyWrong: {
      A: "S3 is object storage, not a mounted shared file system.",
      B: "EBS volumes are block storage typically attached to a single instance in a single AZ.",
      D: "Glacier is archival object storage and not suitable for active shared file access.",
    },
    memoryHook: "Shared file system = EFS.",
    testedConcepts: ["efs", "shared-storage", "storage-services"],
    sources: [
      {
        title: "Amazon EFS User Guide",
        url: "https://docs.aws.amazon.com/efs/latest/ug/whatisefs.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-171",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A company wants to block SQL injection attacks at the edge before traffic reaches its application. Which service BEST supports this?",
    choices: [
      { id: "A", text: "AWS Shield" },
      { id: "B", text: "AWS WAF" },
      { id: "C", text: "Amazon Inspector" },
      { id: "D", text: "AWS Config" },
    ],
    answerId: "B",
    explanation:
      "AWS WAF inspects and filters HTTP(S) requests and includes protections against common web exploits like SQL injection.",
    coaching: "For web-layer attack filtering (SQLi/XSS), pick WAF.",
    whyCorrect:
      "AWS WAF can apply rules/signatures at edge integrations (for example with CloudFront) to block malicious SQL injection request patterns before they reach the app.",
    whyWrong: {
      A: "Shield focuses on DDoS mitigation, not SQL injection rule filtering.",
      C: "Inspector assesses vulnerabilities; it does not inline-filter web requests.",
      D: "Config monitors resource configurations, not active request filtering.",
    },
    memoryHook: "SQLi/XSS filtering = WAF.",
    testedConcepts: ["aws-waf", "sql-injection", "edge-security"],
    sources: [
      {
        title: "AWS WAF Developer Guide",
        url: "https://docs.aws.amazon.com/waf/latest/developerguide/waf-chapter.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-172",
    domain: "Billing & Pricing",
    difficulty: "Hard",
    prompt:
      "A company wants to visualize cost trends and forecast future AWS spending. Which service BEST supports this?",
    choices: [
      { id: "A", text: "AWS Budgets" },
      { id: "B", text: "AWS Cost Explorer" },
      { id: "C", text: "AWS Trusted Advisor" },
      { id: "D", text: "AWS Organizations" },
    ],
    answerId: "B",
    explanation:
      "Cost Explorer is designed for spend analysis, trend visualization, and forecasting.",
    coaching: "Historical cost analysis plus forecasting points to Cost Explorer.",
    whyCorrect:
      "AWS Cost Explorer provides interactive spend trend views and forecast capabilities for future cost estimation.",
    whyWrong: {
      A: "Budgets focuses on threshold alerts and budget tracking, not full exploratory analysis.",
      C: "Trusted Advisor provides optimization recommendations, not comprehensive forecasting analytics.",
      D: "Organizations structures accounts and billing relationships, but not detailed trend/forecast tooling.",
    },
    memoryHook: "Cost trends + forecast = Cost Explorer.",
    testedConcepts: ["cost-explorer", "cost-forecasting", "billing-analytics"],
    sources: [
      {
        title: "AWS Cost Explorer",
        url: "https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-173",
    domain: "Technology",
    difficulty: "Hard",
    prompt:
      "A company needs to automate patching for EC2 instances without manual intervention. Which service BEST meets this requirement?",
    choices: [
      { id: "A", text: "AWS CloudFormation" },
      { id: "B", text: "AWS Systems Manager Patch Manager" },
      { id: "C", text: "AWS Config" },
      { id: "D", text: "AWS Inspector" },
    ],
    answerId: "B",
    explanation:
      "Systems Manager Patch Manager automates patch baselines, patch scheduling, and patch deployment for managed instances.",
    coaching: "OS patch automation on EC2 is Systems Manager Patch Manager territory.",
    whyCorrect:
      "Patch Manager provides centralized automated patching workflows for EC2 and other managed nodes.",
    whyWrong: {
      A: "CloudFormation provisions infrastructure; it does not continuously manage patch operations.",
      C: "Config audits resource compliance but does not execute patching.",
      D: "Inspector identifies vulnerabilities, but patch deployment automation is Patch Manager.",
    },
    memoryHook: "Automated EC2 patching = Patch Manager.",
    testedConcepts: ["systems-manager", "patch-manager", "operations-automation"],
    sources: [
      {
        title: "AWS Systems Manager Patch Manager",
        url: "https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-patch.html",
      },
    ],
    verified: true,
  },

  {
    id: "clf-174",
    domain: "Cloud Concepts",
    difficulty: "Hard",
    prompt:
      "A company wants to experiment with new architectures without long-term commitments. Which cloud benefit BEST enables this?",
    choices: [
      { id: "A", text: "High Availability" },
      { id: "B", text: "Fault Tolerance" },
      { id: "C", text: "Pay-as-you-go pricing" },
      { id: "D", text: "Geographic redundancy" },
    ],
    answerId: "C",
    explanation:
      "Pay-as-you-go reduces upfront commitment, making experimentation lower-risk and easier to start/stop.",
    coaching: "Low-commitment experimentation in cloud exams usually maps to pay-as-you-go economics.",
    whyCorrect:
      "Usage-based pricing allows teams to test ideas without large capital investment or long-term fixed commitments.",
    whyWrong: {
      A: "High availability addresses uptime/resilience, not financial commitment for experimentation.",
      B: "Fault tolerance is a reliability design property, not a pricing/commitment benefit.",
      D: "Geographic redundancy concerns resiliency and latency, not test-cost flexibility.",
    },
    memoryHook: "Experiment cheaply = pay-as-you-go.",
    testedConcepts: ["cloud-economics", "pay-as-you-go", "innovation-agility"],
    sources: [
      {
        title: "AWS Cloud Economics",
        url: "https://aws.amazon.com/economics/",
      },
    ],
    verified: true,
  },

  {
    id: "clf-175",
    domain: "Security",
    difficulty: "Hard",
    prompt:
      "A company must ensure that only encrypted AMIs can be used to launch EC2 instances. Which solution BEST enforces this?",
    choices: [
      { id: "A", text: "IAM user policies" },
      { id: "B", text: "Service Control Policies" },
      { id: "C", text: "Security Groups" },
      { id: "D", text: "AWS WAF" },
    ],
    answerId: "B",
    explanation:
      "SCPs can enforce organization-level preventive controls that deny launching noncompliant AMIs.",
    coaching: "Org-wide preventive controls for EC2 launch constraints belong in SCP guardrails.",
    whyCorrect:
      "Service Control Policies can deny RunInstances (or related actions) unless encryption conditions are met, applying consistently across member accounts.",
    whyWrong: {
      A: "IAM user policies can be bypassed by role variations and are not organization-wide governance boundaries.",
      C: "Security groups govern network traffic, not AMI launch encryption compliance.",
      D: "WAF protects web applications and does not control EC2 launch policy.",
    },
    memoryHook: "Organization-wide launch guardrail = SCP.",
    testedConcepts: ["scp", "ec2-ami-encryption", "preventive-governance"],
    sources: [
      {
        title: "Service control policies (SCPs)",
        url: "https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html",
      },
      {
        title: "Amazon EC2 encryption and AMIs",
        url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AMIEncryption.html",
      },
    ],
    verified: true,
  },
];
export const QUESTION_COUNT = QUESTION_BANK.length;

export function isVerifiedQuestion(q: Question) {
  const hasSources = Boolean(q.sources && q.sources.length > 0);
  const whyCorrect = q.whyCorrect?.trim() ?? "";
  const hasWhyCorrect = whyCorrect.length > 0;
  const hasPlaceholder = whyCorrect.includes("Not verified yet");
  return hasSources && hasWhyCorrect && !hasPlaceholder;
}

export function getVerificationIssues(q: Question): string[] {
  const issues: string[] = [];
  if (!q.sources || q.sources.length === 0) issues.push("Missing sources");
  const whyCorrect = q.whyCorrect?.trim() ?? "";
  if (!whyCorrect) issues.push("Missing whyCorrect");
  if (whyCorrect.includes("Not verified yet")) issues.push("Placeholder whyCorrect");
  return issues;
}
