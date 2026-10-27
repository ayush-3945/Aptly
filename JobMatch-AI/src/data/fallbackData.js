
const FALLBACK_JOBS = [
  {
    _id: 'job_fallback_1',
    title: 'Senior Full-Stack MERN Systems Engineer',
    company: 'Acme Payments',
    location: 'Bengaluru, India (Remote)',
    requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker'],
    description:
      'We are looking for a Senior Full-Stack MERN Systems Engineer to build scalable payment infrastructure and web applications. You will architect Node.js microservices, build responsive React 19 frontends, and integrate semantic evaluation services for automated workflows.',
    responsibilities: [
      'Architect, develop, and maintain high-throughput Node.js microservices handling millions of API transactions.',
      'Design modern, component-driven user interfaces using React 19 and TailwindCSS.',
      'Construct complex MongoDB aggregation pipelines and optimize database query indexing.',
      'Integrate semantic evaluation models for real-time document parsing, semantic search, and resume scoring.',
      'Containerize application components with Docker and manage automated CI/CD deployment pipelines.',
    ],
    requirements: [
      '4+ years of professional full-stack software development experience using the MERN stack.',
      'Demonstrated expertise in Node.js, Express, and asynchronous JavaScript/TypeScript workflows.',
      'Strong proficiency in React 19, modern state management, and responsive CSS architectures.',
      'Solid experience with MongoDB schema design, indexing, and transactional operations.',
      'Familiarity with containerization (Docker) and RESTful API security (JWT, rate limiting, sanitization).',
      'Hands-on experience with LLM APIs and prompt engineering is a major plus.',
    ],
    aboutCompany:
      'Acme Payments is a full-stack financial services and payment gateway platform powering innovative global transactions.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_2',
    title: 'Frontend Interface Architect',
    company: 'Nova Logistics',
    location: 'Mumbai, India (Hybrid)',
    requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'PostgreSQL', 'Next.js'],
    description:
      'Lead our frontend engineering initiatives building high-frequency logistics and consumer interfaces. Strong mastery of React component trees, responsive CSS, and high-performance streaming APIs required.',
    responsibilities: [
      'Build ultra-responsive web interfaces with React, TypeScript, and modern design systems.',
      'Implement real-time token streaming and interactive data dashboards.',
      'Optimize web vitals, bundle sizes, and clientside rendering performance.',
      'Collaborate with product designers to establish accessible, enterprise-grade design patterns.',
    ],
    requirements: [
      '3+ years of experience with modern frontend frameworks (React, Next.js, Vite).',
      'Deep fluency in TypeScript and modern JavaScript (ES6+).',
      'Strong aesthetic sense and mastery of CSS, TailwindCSS, and animation frameworks.',
      'Experience consuming streaming REST and WebSocket APIs.',
    ],
    aboutCompany:
      'Nova Logistics is a quick-commerce delivery network engineering low-latency fulfillment and consumer experiences.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_3',
    title: 'Backend Systems & API Engineer',
    company: 'Helix Core',
    location: 'Bengaluru, India (Remote)',
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'Redis', 'Microservices'],
    description:
      'Architect robust backend services, secure authentication, and high-performance MongoDB aggregation pipelines. You will optimize database throughput and scale services handling millions of daily events.',
    responsibilities: [
      'Design and deploy resilient backend microservices with Node.js and Express.',
      'Implement distributed caching strategies using Redis to reduce database strain.',
      'Ensure strict data validation, authentication middleware, and role-based access control.',
      'Write comprehensive unit and integration test suites.',
    ],
    requirements: [
      '3+ years of backend engineering experience with Node.js and NoSQL databases.',
      'Strong understanding of API design principles, authentication protocols, and database normalization.',
      'Experience deploying services inside Docker containers and running automated CI checks.',
    ],
    aboutCompany:
      'Helix Core is a financial technology infrastructure company engineering modern transaction routing and ledger systems.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_4',
    title: 'Full-Stack Software Engineer',
    company: 'Apex Analytics',
    location: 'Bengaluru, India',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Python', 'REST API'],
    description:
      'Join our product engineering team delivering modern investment and analytics dashboards. Build full-stack features from MERN interfaces to data pipelines and secure customer access controls.',
    responsibilities: [
      'Develop end-to-end features spanning React dashboards and Express backend endpoints.',
      'Integrate Python analytics scripts and export pipelines into customer portals.',
      'Participate in agile sprints, code reviews, and architectural refinement sessions.',
    ],
    requirements: [
      '2+ years of full-stack development experience.',
      'Proficiency in JavaScript (React/Node) and familiarity with Python data utilities.',
      'Comfortable writing clean MongoDB queries and managing state across SPAs.',
    ],
    aboutCompany:
      'Apex Analytics builds high-speed data analytics and portfolio management platforms for enterprise organizations.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_5',
    title: 'Cloud Infrastructure & DevOps Engineer',
    company: 'CloudScale Systems',
    location: 'Mumbai, India (Remote)',
    requiredSkills: ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Node.js'],
    description:
      'Manage cloud infrastructure, automated deployment pipelines, and Docker container clusters for our distributed testing cloud. Experience with continuous delivery and zero-downtime rollouts is essential.',
    responsibilities: [
      'Configure and maintain AWS cloud infrastructure, VPC networks, and Kubernetes clusters.',
      'Automate deployment pipelines and environment provisioning using Docker and Terraform.',
      'Monitor application metrics, uptime, and automated alert response workflows.',
    ],
    requirements: [
      '3+ years managing production cloud workloads on AWS or GCP.',
      'Extensive experience containerizing Node.js and full-stack services with Docker.',
      'Firm grasp of security standards, network topologies, and secrets management.',
    ],
    aboutCompany:
      'CloudScale Systems provides cloud testing infrastructure enabling engineering teams to test web and mobile apps at scale.',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_6',
    title: 'Junior Full-Stack Web Developer',
    company: 'QuickServe Technologies',
    location: 'Bengaluru, India (Hybrid)',
    requiredSkills: ['React', 'JavaScript', 'Express', 'MongoDB', 'Git'],
    description:
      'Great opportunity for a rising full-stack developer to contribute to our consumer engineering platform. You will build user-facing components, write API endpoints, and learn automated production workflows.',
    responsibilities: [
      'Build reusable React components adhering to design systems and accessibility standards.',
      'Create CRUD endpoints in Node.js/Express and write database migrations.',
      'Collaborate with senior engineers to diagnose bugs and improve application responsiveness.',
    ],
    requirements: [
      '1+ years of experience with JavaScript, React, and Node.js (including personal or academic projects).',
      'Familiarity with Git branching, pull requests, and code review etiquette.',
      'Eager curiosity to learn modern API integrations and production DevOps tools.',
    ],
    aboutCompany:
      'QuickServe Technologies is an on-demand convenience platform connecting consumers with local partner stores.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SAMPLE_APPLICATIONS = [
  {
    _id: 'app_sample_1',
    status: 'shortlisted',
    appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiMatchScore: 88,
    recommendation: 'Strong Match',
    matchedSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL'],
    missingSkills: ['Docker'],
    experienceFit: 'Candidate exhibits 4+ years of relevant MERN production engineering.',
    fitSummary: 'Strong candidate profile with proven Full-Stack engineering depth and scalable API architectures.',
    scoreBreakdown: { skillsScore: 90, experienceScore: 85, domainScore: 90, educationScore: 80, relevanceScore: 88 },
    skillGapRoadmap: [
      {
        skill: 'Docker',
        priority: 'High',
        impact: '+15% Match Score',
        timeToBridge: '2-3 Days',
        actionPlan: 'Build a containerized microservice module using Docker Compose and Dockerfile.',
        resource: 'Official Docker documentation and crash courses.',
      }
    ],
    resumeImprovements: [
      'Quantify project outcomes: Replace generic phrases with measurable metrics.',
      'Lead bullet points with active engineering verbs: Architected, Deployed, Engineered.'
    ],
    job: {
      _id: 'job_fallback_1',
      title: 'Senior Full-Stack MERN Systems Engineer',
      company: 'Acme Payments',
      location: 'Bengaluru, India (Remote)',
      requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker'],
    },
  },
  {
    _id: 'app_sample_2',
    status: 'applied',
    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    aiMatchScore: 72,
    recommendation: 'Moderate Match',
    matchedSkills: ['React', 'TypeScript', 'TailwindCSS'],
    missingSkills: ['PostgreSQL', 'Next.js'],
    experienceFit: 'Solid frontend capabilities with minor gap in relational database architectures.',
    fitSummary: 'Moderate candidate alignment. Capable frontend specialist who could quickly ramp up on full-stack technologies.',
    scoreBreakdown: { skillsScore: 72, experienceScore: 75, domainScore: 70, educationScore: 70, relevanceScore: 72 },
    skillGapRoadmap: [
      {
        skill: 'PostgreSQL',
        priority: 'High',
        impact: '+15% Match Score',
        timeToBridge: '3-4 Days',
        actionPlan: 'Practice schema design, foreign keys, and indexing in PostgreSQL.',
        resource: 'PostgreSQL Tutorial and Prisma ORM docs.',
      },
      {
        skill: 'Next.js',
        priority: 'Medium',
        impact: '+10% Match Score',
        timeToBridge: '2-3 Days',
        actionPlan: 'Explore App Router, Server Actions, and SSR paradigms in Next.js.',
        resource: 'Next.js official Learn course.',
      }
    ],
    resumeImprovements: [
      'Highlight full-stack side projects using SQL databases.',
      'Demonstrate Server-Side Rendering (SSR) experience in your work history.'
    ],
    job: {
      _id: 'job_fallback_2',
      title: 'Frontend Interface Architect',
      company: 'Nova Logistics',
      location: 'Mumbai, India (Hybrid)',
      requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'PostgreSQL', 'Next.js'],
    },
  },
];

const DEMO_PROFILE = {
  fullName: 'Alex Morgan',
  name: 'Alex Morgan',
  email: 'candidate@aptly.ai',
  currentRole: 'Senior Full-Stack MERN & AI Engineer',
  targetRole: 'Lead Full-Stack Architect',
  totalExperience: '4+ years',
  location: 'San Francisco, CA (Open to Remote)',
  phone: '+1 (555) 019-2834',
  skills: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'TypeScript', 'TailwindCSS', 'REST APIs', 'Gemini AI'],
  education: [
    { degree: 'B.S. in Computer Science', institution: 'University of California, Berkeley', year: '2022' }
  ],
  workHistory: [
    {
      role: 'Senior Full-Stack Engineer',
      company: 'TechFlow Systems',
      duration: '2022 - Present',
      description: 'Architected high-throughput REST APIs and microservices handling 50k daily active users.',
    }
  ]
};

module.exports = {
  FALLBACK_JOBS,
  SAMPLE_APPLICATIONS,
  DEMO_PROFILE,
};
