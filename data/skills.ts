export interface Skill {
  name: string;
  level: number; // 1-5 scale
  category:
    | "programming"
    | "framework"
    | "tool"
    | "language"
    | "platform"
    | "methodology";
  yearsOfExperience?: number;
  description?: string;
}

export const SKILLS: Skill[] = [
  // Information Security & Governance
  {
    name: "Information Security",
    level: 5,
    category: "methodology",
    yearsOfExperience: 5,
    description:
      "Core expertise in information security management and governance",
  },
  {
    name: "ISO 27001",
    level: 5,
    category: "methodology",
    yearsOfExperience: 3,
    description:
      "Information Security Management System implementation and maintenance",
  },
  {
    name: "Risk Management",
    level: 5,
    category: "methodology",
    yearsOfExperience: 4,
    description: "Enterprise risk assessment and management frameworks",
  },
  {
    name: "Security Compliance",
    level: 5,
    category: "methodology",
    yearsOfExperience: 3,
    description: "SOC 2, regulatory compliance, and security governance",
  },
  {
    name: "DevSecOps",
    level: 4,
    category: "methodology",
    yearsOfExperience: 3,
    description: "Security integration in development and operations",
  },

  // Programming Languages
  {
    name: "Python",
    level: 5,
    category: "programming",
    yearsOfExperience: 6,
    description:
      "Primary language for automation, data analysis, and backend development",
  },
  {
    name: "TypeScript",
    level: 4,
    category: "programming",
    yearsOfExperience: 3,
    description: "Web development and API development with type safety",
  },
  {
    name: "Rust",
    level: 4,
    category: "programming",
    yearsOfExperience: 2,
    description: "High-performance systems programming and API development",
  },
  {
    name: "C++",
    level: 3,
    category: "programming",
    yearsOfExperience: 2,
    description: "System-level programming and cybersecurity applications",
  },
  {
    name: "JavaScript",
    level: 4,
    category: "programming",
    yearsOfExperience: 5,
    description: "Web development and frontend applications",
  },

  // Frameworks & Technologies
  {
    name: "Angular",
    level: 4,
    category: "framework",
    yearsOfExperience: 3,
    description: "Frontend development for enterprise applications",
  },
  {
    name: ".NET",
    level: 4,
    category: "framework",
    yearsOfExperience: 3,
    description: "Backend development and enterprise solutions",
  },
  {
    name: "GraphQL",
    level: 4,
    category: "framework",
    yearsOfExperience: 3,
    description: "API development and data querying",
  },
  {
    name: "Qwik",
    level: 3,
    category: "framework",
    yearsOfExperience: 1,
    description: "Modern web framework for performance-focused applications",
  },

  // Cloud & Infrastructure
  {
    name: "Cloud Security",
    level: 5,
    category: "platform",
    yearsOfExperience: 4,
    description: "Cloud infrastructure security and compliance",
  },
  {
    name: "DevOps",
    level: 4,
    category: "methodology",
    yearsOfExperience: 3,
    description: "CI/CD, infrastructure automation, and monitoring",
  },
  {
    name: "Infrastructure as Code",
    level: 4,
    category: "methodology",
    yearsOfExperience: 3,
    description: "IaC practices and tools for infrastructure management",
  },
  {
    name: "Cloudflare",
    level: 4,
    category: "platform",
    yearsOfExperience: 2,
    description: "Edge computing and CDN services",
  },

  // Data & AI
  {
    name: "Machine Learning",
    level: 4,
    category: "methodology",
    yearsOfExperience: 3,
    description: "ML model development and data analysis",
  },
  {
    name: "RAG",
    level: 4,
    category: "methodology",
    yearsOfExperience: 2,
    description: "Retrieval-Augmented Generation for AI applications",
  },
  {
    name: "Data Scraping",
    level: 4,
    category: "methodology",
    yearsOfExperience: 3,
    description: "Web scraping and data extraction techniques",
  },

  // Tools & Platforms
  {
    name: "Git",
    level: 5,
    category: "tool",
    yearsOfExperience: 6,
    description: "Version control and collaboration",
  },
  {
    name: "Linux",
    level: 4,
    category: "platform",
    yearsOfExperience: 6,
    description: "System administration and development environment",
  },
  {
    name: "SQL Server",
    level: 4,
    category: "tool",
    yearsOfExperience: 3,
    description: "Database management and optimization",
  },
  {
    name: "Logging & Monitoring",
    level: 4,
    category: "tool",
    yearsOfExperience: 3,
    description: "System monitoring and log analysis",
  },
];

// Helper functions
export const getSkillsByCategory = (category: Skill["category"]): Skill[] => {
  return SKILLS.filter((skill) => skill.category === category);
};

export const getTopSkills = (limit: number = 10): Skill[] => {
  return SKILLS.sort((a, b) => b.level - a.level).slice(0, limit);
};

export const getSkillsByLevel = (minLevel: number): Skill[] => {
  return SKILLS.filter((skill) => skill.level >= minLevel);
};
