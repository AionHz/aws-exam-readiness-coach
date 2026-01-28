export type Topic =
  | "Cloud Concepts"
  | "Core Services"
  | "Security/Shared Responsibility"
  | "Pricing"
  | "Billing/Support";

export type AnswerLetter = "A" | "B" | "C" | "D";

export type PracticeQuestion = {
  id: string;
  topic: Topic;
  difficulty: 1 | 2 | 3;
  prompt: string;
  choices: Record<AnswerLetter, string>;
  correctAnswer: AnswerLetter;
  explanation: {
    correctWhy: string[];
    othersWhyWrong: Record<AnswerLetter, string>;
    tip: string;
  };
};

export const ALL_TOPICS: Topic[] = [
  "Cloud Concepts",
  "Core Services",
  "Security/Shared Responsibility",
  "Pricing",
  "Billing/Support"
];

export const QUESTIONS: PracticeQuestion[] = [
  {
    id: "cc-001",
    topic: "Cloud Concepts",
    difficulty: 1,
    prompt: "What is a primary benefit of cloud elasticity?",
    choices: {
      A: "Fixed capacity planning",
      B: "Automatic scaling based on demand",
      C: "Manual hardware upgrades",
      D: "Single data center operation"
    },
    correctAnswer: "B",
    explanation: {
      correctWhy: [
        "Elasticity allows systems to scale up and down automatically.",
        "This helps match capacity to real-time demand."
      ],
      othersWhyWrong: {
        A: "Fixed capacity does not adjust to changing demand.",
        B: "Correct.",
        C: "Manual upgrades are slower and not elastic.",
        D: "Single data center reduces flexibility and resilience."
      },
      tip: "Elasticity = automatic capacity adjustment."
    }
  },
  {
    id: "cs-001",
    topic: "Core Services",
    difficulty: 1,
    prompt: "Which AWS service is primarily used to run virtual servers in the cloud?",
    choices: {
      A: "Amazon EC2",
      B: "Amazon S3",
      C: "Amazon Route 53",
      D: "AWS Budgets"
    },
    correctAnswer: "A",
    explanation: {
      correctWhy: [
        "EC2 provides resizable compute capacity (virtual machines).",
        "You choose instance types, networking, and scaling options."
      ],
      othersWhyWrong: {
        A: "Correct.",
        B: "S3 is object storage, not virtual servers.",
        C: "Route 53 is DNS and traffic routing.",
        D: "Budgets is for tracking and alerting on spend."
      },
      tip: "EC2 = compute instances; S3 = object storage; Route 53 = DNS."
    }
  },
  {
    id: "sec-001",
    topic: "Security/Shared Responsibility",
    difficulty: 1,
    prompt: "Under the shared responsibility model, what is AWS responsible for?",
    choices: {
      A: "Configuring IAM users and policies",
      B: "Patching the guest OS inside your EC2 instance",
      C: "Physical security of data centers and underlying hardware",
      D: "Classifying your data and setting retention rules"
    },
    correctAnswer: "C",
    explanation: {
      correctWhy: [
        "AWS secures the infrastructure that runs AWS services.",
        "This includes facilities, hardware, and core infrastructure components."
      ],
      othersWhyWrong: {
        A: "IAM configuration is the customer’s responsibility.",
        B: "Guest OS patching on EC2 is typically customer responsibility.",
        C: "Correct.",
        D: "Data classification/retention are customer responsibilities."
      },
      tip: "AWS = security OF the cloud; you = security IN the cloud."
    }
  },
  {
    id: "pr-001",
    topic: "Pricing",
    difficulty: 1,
    prompt: "What does 'pay-as-you-go' mean in cloud pricing?",
    choices: {
      A: "You must pay annually in advance",
      B: "You pay only for what you use",
      C: "You must buy hardware upfront",
      D: "Pricing never changes between regions"
    },
    correctAnswer: "B",
    explanation: {
      correctWhy: [
        "Pay-as-you-go aligns cost with actual usage.",
        "It reduces upfront spending and supports scaling up/down."
      ],
      othersWhyWrong: {
        A: "Annual upfront payments are not required for pay-as-you-go.",
        B: "Correct.",
        C: "Buying hardware upfront is typical of on-premises (CapEx).",
        D: "Regional pricing can vary."
      },
      tip: "Cloud basics: pay-as-you-go + savings with commitments."
    }
  },
  {
    id: "bs-001",
    topic: "Billing/Support",
    difficulty: 1,
    prompt: "Which AWS tool helps you set alerts when spending exceeds a threshold?",
    choices: {
      A: "AWS Budgets",
      B: "Amazon CloudFront",
      C: "AWS IAM",
      D: "Amazon EBS"
    },
    correctAnswer: "A",
    explanation: {
      correctWhy: [
        "AWS Budgets creates budgets for cost/usage and notifies you.",
        "It helps monitor spend proactively."
      ],
      othersWhyWrong: {
        A: "Correct.",
        B: "CloudFront is a CDN, not a cost alerting tool.",
        C: "IAM is identity and access management.",
        D: "EBS is block storage."
      },
      tip: "Budgets = alerts; Cost Explorer = visual analysis."
    }
  }
];
