export const FALLBACK_JOBS = [
  {
    _id: 'job_fallback_1',
    title: 'Senior Full-Stack MERN & AI Engineer',
    company: 'TechPulse Solutions',
    location: 'Remote',
    requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'Gemini AI', 'Docker'],
    description:
      'We are looking for a Senior Full-Stack MERN & AI Engineer to build scalable web applications. You will architect Node.js microservices, build responsive React 19 frontends, and integrate Google Gemini AI for automated candidate matching.',
    responsibilities: [
      'Architect, develop, and maintain high-throughput Node.js microservices handling millions of API requests.',
      'Design modern, component-driven user interfaces using React 19 and TailwindCSS.',
      'Construct complex MongoDB aggregation pipelines and optimize database query indexing.',
      'Integrate Gemini AI models for real-time document parsing, semantic search, and ATS resume scoring.',
      'Containerize application components with Docker and manage automated CI/CD deployment pipelines.',
    ],
    requirements: [
      '4+ years of professional full-stack software development experience using the MERN stack.',
      'Demonstrated expertise in Node.js, Express, and asynchronous JavaScript/TypeScript workflows.',
      'Strong proficiency in React 19, modern state management, and responsive CSS architectures.',
      'Solid experience with MongoDB schema design, indexing, and transactional operations.',
      'Familiarity with containerization (Docker) and RESTful API security (JWT, rate limiting, sanitization).',
      'Hands-on experience with LLM APIs (Gemini AI, OpenAI) and prompt engineering is a major plus.',
    ],
    aboutCompany:
      'TechPulse Solutions is an AI-first HRTech innovator engineering modern talent intelligence and automated applicant tracking systems for high-growth tech teams worldwide.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_2',
    title: 'Frontend AI Interface Architect',
    company: 'HyperScale AI',
    location: 'San Francisco, CA',
    requiredSkills: ['React', 'TypeScript', 'TailwindCSS', 'Gemini AI', 'Next.js'],
    description:
      'Lead our frontend engineering initiatives building generative AI copilots and real-time streaming interfaces. Strong mastery of React component trees, responsive CSS, and AI streaming APIs required.',
    responsibilities: [
      'Build ultra-responsive web interfaces with React, TypeScript, and modern design systems.',
      'Implement real-time token streaming and interactive AI chat copilots using Google Gemini SDK.',
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
      'HyperScale AI designs intuitive copilot interfaces and productivity tools that bridge complex foundation models with everyday knowledge workers.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_3',
    title: 'Backend Systems & API Engineer',
    company: 'CloudCore Labs',
    location: 'Remote',
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
      'CloudCore Labs provides mission-critical cloud infrastructure and data processing pipelines for enterprise logistics and fintech networks.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_4',
    title: 'Full-Stack Software Engineer',
    company: 'DataSphere Analytics',
    location: 'Austin, TX',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'Python', 'REST API'],
    description:
      'Join our product engineering team delivering modern data analytics dashboards. Build full-stack features from MERN interfaces to data pipelines and secure customer access controls.',
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
      'DataSphere Analytics delivers real-time market intelligence and predictive analytics engines to Fortune 500 decision makers.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_5',
    title: 'Cloud Infrastructure & DevOps Engineer',
    company: 'InfraNexus',
    location: 'New York, NY',
    requiredSkills: ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Node.js'],
    description:
      'Manage cloud infrastructure, automated deployment pipelines, and Docker container clusters for our AI microservices platform. Experience with continuous delivery and zero-downtime rollouts is essential.',
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
      'InfraNexus provides automated cloud reliability and DevOps orchestration platforms for global software engineering teams.',
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_6',
    title: 'Junior Full-Stack Web Developer',
    company: 'Apex Code Ventures',
    location: 'Remote',
    requiredSkills: ['React', 'JavaScript', 'Express', 'MongoDB', 'Git'],
    description:
      'Great opportunity for a rising full-stack developer to contribute to our MERN platform. You will build user-facing components, write API endpoints, and learn automated ATS workflows.',
    responsibilities: [
      'Build reusable React components adhering to Figma mockups and accessibility standards.',
      'Create CRUD endpoints in Node.js/Express and write database migrations.',
      'Collaborate with senior engineers to diagnose bugs and improve application responsiveness.',
    ],
    requirements: [
      '1+ years of experience with JavaScript, React, and Node.js (including personal or academic projects).',
      'Familiarity with Git branching, pull requests, and code review etiquette.',
      'Eager curiosity to learn generative AI integrations and production DevOps tools.',
    ],
    aboutCompany:
      'Apex Code Ventures incubates early-stage digital products and open-source developer tooling for the global engineering community.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
