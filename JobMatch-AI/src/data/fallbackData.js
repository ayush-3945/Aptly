
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
      'Design modern, component-driven user interfaces using React 19 and Tailwind CSS.',
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
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Next.js'],
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
      'Strong aesthetic sense and mastery of CSS, Tailwind CSS, and animation frameworks.',
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
  {
    _id: 'job_fallback_7',
    title: 'Senior Frontend Engineer - Design Systems & Web Performance',
    company: 'Prism Labs',
    location: 'Austin, TX (Hybrid)',
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'GraphQL', 'Web Performance'],
    description:
      'Prism Labs develops high-performance visualization platforms and design tooling for modern product teams. We are seeking a Senior Frontend Engineer to champion our component libraries, design token systems, and web performance standards.',
    responsibilities: [
      'Build accessible, themeable UI component systems using React, TypeScript, and Tailwind CSS.',
      'Optimize application render cycles, bundle splitting, and Core Web Vitals across complex views.',
      'Collaborate with UI/UX product designers to translate Figma design specs into modular component primitives.',
      'Implement state management, client caching, and resilient GraphQL data fetching.',
    ],
    requirements: [
      '4+ years of professional frontend engineering experience with modern React and TypeScript.',
      'Deep understanding of semantic HTML, accessibility (WCAG AA), and modern CSS architecture.',
      'Experience profiling and optimizing Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS).',
      'Strong communication and collaborative engineering practices.',
    ],
    aboutCompany:
      'Prism Labs develops next-generation visual design workflows and canvas performance frameworks for software engineers.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_8',
    title: 'Backend Systems Engineer - Distributed Services',
    company: 'Vortex Data',
    location: 'Seattle, WA (Remote)',
    requiredSkills: ['Go', 'PostgreSQL', 'gRPC', 'Docker', 'Kafka', 'Redis', 'Microservices'],
    description:
      'Vortex Data powers real-time event streaming and data synchronization for distributed enterprise infrastructure. We are hiring a Backend Systems Engineer to build high-throughput data processing pipelines and resilient microservices.',
    responsibilities: [
      'Architect, implement, and maintain low-latency Go microservices handling high-concurrency event streams.',
      'Design transactional PostgreSQL database schemas, indexes, and connection pools.',
      'Build distributed pub/sub event pipelines using Apache Kafka and Redis.',
      'Establish observability, structured logging, and distributed tracing across microservices.',
    ],
    requirements: [
      '3+ years backend engineering experience in Go or distributed systems.',
      'Proven track record working with relational databases (PostgreSQL) and message queues (Kafka).',
      'Solid understanding of concurrency, memory management, and network protocols (gRPC/HTTP2).',
      'Proficiency with containerized deployments using Docker and Kubernetes.',
    ],
    aboutCompany:
      'Vortex Data provides distributed stream processing and transactional ledger infrastructure for data-intensive enterprises.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_9',
    title: 'Senior Data Analyst - Growth & Business Intelligence',
    company: 'Aura Metrics',
    location: 'New York, NY (Hybrid)',
    requiredSkills: ['SQL', 'Python', 'Tableau', 'Power BI', 'dbt', 'Snowflake', 'Statistics'],
    description:
      'Aura Metrics builds analytics software that empowers marketing and growth teams to make data-driven decisions. We are looking for a Senior Data Analyst to lead our product performance analytics and growth experiments.',
    responsibilities: [
      'Write advanced SQL queries and build automated data transformation models in dbt and Snowflake.',
      'Create executive dashboards, cohort analysis, and funnel tracking visualizations in Tableau and Power BI.',
      'Analyze user acquisition, retention curves, and monetization funnels to identify product growth opportunities.',
      'Partner with product managers and engineers to instrument event tracking and evaluate A/B test experiments.',
    ],
    requirements: [
      '3+ years experience in product analytics, growth data science, or business intelligence.',
      'Expert proficiency with complex SQL, window functions, and relational data modeling.',
      'Strong working knowledge of statistical analysis and exploratory data analysis with Python (Pandas/NumPy).',
      'Exceptional data storytelling and stakeholder presentation skills.',
    ],
    aboutCompany:
      'Aura Metrics builds automated intelligence pipelines and retention analytics for SaaS and commerce businesses.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_10',
    title: 'Machine Learning Engineer - NLP & Applied AI',
    company: 'Cortex AI',
    location: 'San Francisco, CA (Hybrid)',
    requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'Docker', 'MLOps', 'FastAPI'],
    description:
      'Cortex AI delivers specialized machine learning models and semantic search solutions for knowledge discovery. We are seeking an Applied Machine Learning Engineer to design, evaluate, and deploy fine-tuned transformer architectures and LLM pipelines.',
    responsibilities: [
      'Fine-tune and evaluate open-source language models (LLMs) and embeddings for semantic classification.',
      'Build scalable inference microservices using FastAPI, PyTorch, and Docker.',
      'Implement robust MLOps evaluation harnesses, prompt benchmarking, and model latency profiling.',
      'Collaborate with backend engineers to integrate real-time vector search and retrieval-augmented generation (RAG).',
    ],
    requirements: [
      '3+ years hands-on experience building, testing, and deploying machine learning models in production.',
      'Strong software engineering foundation in Python with deep understanding of PyTorch or TensorFlow.',
      'Practical experience with modern NLP techniques, embeddings, vector databases, and LLM evaluation.',
      'Experience containerizing models with Docker for low-latency GPU/CPU inference.',
    ],
    aboutCompany:
      'Cortex AI develops enterprise retrieval systems and specialized foundation model adaptations for domain reasoning.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_11',
    title: 'DevOps & Site Reliability Engineer',
    company: 'Kite Infrastructure',
    location: 'Denver, CO (Remote)',
    requiredSkills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD', 'Prometheus', 'Linux'],
    description:
      'Kite Infrastructure provides continuous reliability and automated developer platforms. We are seeking a DevOps & Site Reliability Engineer to manage our multi-region Kubernetes clusters and streamline automated cloud deployments.',
    responsibilities: [
      'Manage and automate production Kubernetes clusters on AWS using Terraform (Infrastructure-as-Code).',
      'Implement robust CI/CD deployment pipelines using GitHub Actions, Helm, and ArgoCD.',
      'Monitor service health, configure alerting policies, and optimize Prometheus/Grafana dashboards.',
      'Conduct blameless post-mortems and engineer automated self-healing infrastructure.',
    ],
    requirements: [
      '3+ years experience as a DevOps Engineer, SRE, or Cloud Infrastructure Engineer.',
      'Hands-on expertise with Kubernetes container orchestration and production AWS environments.',
      'Strong scripting skills in Bash or Python, with extensive Linux system administration knowledge.',
      'Passion for automation, security best practices, and high system availability (99.99%).',
    ],
    aboutCompany:
      'Kite Infrastructure provides cloud orchestration and self-service deployment systems for high-growth engineering teams.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_12',
    title: 'Senior QA Automation Engineer',
    company: 'QualiPulse Technologies',
    location: 'Chicago, IL (Hybrid)',
    requiredSkills: ['Playwright', 'Cypress', 'JavaScript', 'Jest', 'CI/CD', 'Selenium', 'Postman'],
    description:
      'QualiPulse Technologies builds quality assurance testing platforms that accelerate software delivery. We are looking for a Senior QA Automation Engineer to lead our end-to-end testing strategy across web and API applications.',
    responsibilities: [
      'Design, code, and maintain robust automated end-to-end test suites using Playwright and Cypress.',
      'Integrate automated test runners into GitHub Actions CI/CD pipelines to prevent regressions.',
      'Write integration and contract tests for REST APIs using Postman and Jest.',
      'Establish test coverage standards, report defect metrics, and collaborate with developers on bug resolutions.',
    ],
    requirements: [
      '4+ years of dedicated experience in QA automation for modern web applications.',
      'Strong JavaScript or TypeScript programming fundamentals.',
      'Proven expertise with modern headless test frameworks (Playwright, Cypress) and API test tools.',
      'Strong analytical mindset with rigorous attention to detail and edge cases.',
    ],
    aboutCompany:
      'QualiPulse Technologies engineers automated testing grids and continuous quality gate systems for web applications.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_13',
    title: 'Senior Mobile Engineer - React Native',
    company: 'PocketWave Apps',
    location: 'San Francisco, CA (Remote)',
    requiredSkills: ['React Native', 'TypeScript', 'Redux', 'iOS', 'Android', 'GraphQL', 'Jest'],
    description:
      'PocketWave Apps creates fluid, cross-platform mobile experiences for millions of consumers. We are looking for an experienced Senior Mobile Engineer to build performant iOS and Android apps using React Native.',
    responsibilities: [
      'Architect, build, and deploy high-performance cross-platform mobile applications in React Native and TypeScript.',
      'Bridge native iOS (Swift/Objective-C) and Android (Kotlin/Java) modules when required.',
      'Optimize 60 FPS animations, offline caching, and memory usage across varying mobile devices.',
      'Coordinate app release cycles through Apple TestFlight and Google Play Console.',
    ],
    requirements: [
      '3+ years of commercial mobile development experience shipping production React Native applications.',
      'Deep understanding of React Native architecture, bridge mechanics, and state management (Redux/Zustand).',
      'Familiarity with mobile build tooling (Xcode, Android Studio, Fastlane, EAS).',
      'Commitment to pixel-perfect UI execution, smooth interactions, and automated unit testing.',
    ],
    aboutCompany:
      'PocketWave Apps designs intuitive, high-velocity consumer mobile utilities and collaborative workspace tools.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_14',
    title: 'Lead UI/UX Product Designer',
    company: 'PixelCraft Studios',
    location: 'Austin, TX (Onsite)',
    requiredSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'Design Systems', 'User Research', 'Prototyping'],
    description:
      'PixelCraft Studios is a digital product agency designing intuitive web and mobile platforms for tech innovators. We are seeking a Lead UI/UX Product Designer to guide product design from discovery research through high-fidelity prototypes.',
    responsibilities: [
      'Conduct user research, customer interviews, and usability tests to uncover core product needs.',
      'Create journey maps, wireframes, user flows, and interactive clickable prototypes in Figma.',
      'Build, document, and evolve scalable design systems with comprehensive design tokens.',
      'Partner closely with frontend engineers to ensure design fidelity and responsive execution.',
    ],
    requirements: [
      '5+ years of experience designing complex web and mobile SaaS applications.',
      'Expert-level mastery of Figma, auto-layout, components, variants, and design systems.',
      'Proven track record conducting qualitative and quantitative user research sessions.',
      'A strong portfolio demonstrating clean typography, information architecture, and user empathy.',
    ],
    aboutCompany:
      'PixelCraft Studios designs high-converting product experiences and design systems for technology leaders.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_15',
    title: 'Product Analyst - User Behavior & Retention',
    company: 'Stratum Analytics',
    location: 'Boston, MA (Hybrid)',
    requiredSkills: ['SQL', 'Mixpanel', 'Amplitude', 'Python', 'A/B Testing', 'Product Analytics', 'Tableau'],
    description:
      'Stratum Analytics builds enterprise intelligence platforms. We are seeking a Product Analyst to dig into product usage telemetry, analyze user conversion funnels, and define key product engagement metrics.',
    responsibilities: [
      'Define product KPIs and track user onboarding, feature adoption, and retention curves in Amplitude and Mixpanel.',
      'Perform statistical analysis and significance testing on feature rollouts and A/B test experiments.',
      'Model and query complex event data using SQL and Python to extract actionable product insights.',
      'Deliver weekly data briefs and strategic recommendations to product and executive leadership.',
    ],
    requirements: [
      '3+ years experience as a Product Analyst, Growth Analyst, or Quantitative Data Specialist.',
      'Advanced proficiency in SQL and product event telemetry tools (Amplitude, Mixpanel, Heap).',
      'Solid grounding in experimental design, hypothesis formulation, and statistical testing.',
      'Strong visualization abilities using Tableau or similar BI platforms.',
    ],
    aboutCompany:
      'Stratum Analytics delivers predictive growth modeling and telemetry analysis for customer-obsessed teams.',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_16',
    title: 'Principal Cloud Solutions Architect',
    company: 'SkyGrid Cloud Solutions',
    location: 'Dallas, TX (Remote)',
    requiredSkills: ['AWS', 'Azure', 'Terraform', 'Kubernetes', 'Cloud Security', 'Architecture', 'Python'],
    description:
      'SkyGrid Cloud Solutions guides enterprise digital transformation through modern cloud-native architectures. We are hiring a Principal Cloud Solutions Architect to design secure, highly resilient multi-cloud infrastructures.',
    responsibilities: [
      'Architect enterprise cloud landing zones, VPC networks, and multi-region failover setups across AWS and Azure.',
      'Codify infrastructure governance, security guardrails, and compliance policies using Terraform.',
      'Guide development teams on cloud-native modernization, serverless patterns, and container adoption.',
      'Audit cloud spend, define cost optimization strategies, and establish architectural best practices.',
    ],
    requirements: [
      '6+ years designing and implementing large-scale cloud architectures on AWS or Azure.',
      'Professional Cloud Architecture certifications (AWS Certified Solutions Architect Professional or Azure Solutions Architect).',
      'Deep expertise in Terraform, Kubernetes, networking, and zero-trust security architectures.',
      'Exceptional leadership and technical communication abilities with executive stakeholders.',
    ],
    aboutCompany:
      'SkyGrid Cloud Solutions accelerates multi-cloud adoption, security conformance, and enterprise migration strategies.',
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_17',
    title: 'Cybersecurity Analyst & Threat Specialist',
    company: 'Sentinel Gate Security',
    location: 'Washington, DC (Onsite)',
    requiredSkills: ['Network Security', 'SIEM', 'Penetration Testing', 'Incident Response', 'Python', 'Linux', 'SOC'],
    description:
      'Sentinel Gate Security provides mission-critical threat detection and cyber defense operations. We are seeking a Cybersecurity Analyst to monitor security events, conduct vulnerability assessments, and respond to incidents.',
    responsibilities: [
      'Monitor real-time security alerts and analyze telemetry across SIEM platforms (Splunk/Elastic).',
      'Perform regular vulnerability scans, penetration tests, and security configuration reviews.',
      'Investigate potential security incidents, perform forensic analysis, and execute containment procedures.',
      'Develop Python security automation scripts to streamline threat detection and triage workflows.',
    ],
    requirements: [
      '3+ years experience in cybersecurity operations, incident response, or SOC environments.',
      'Strong knowledge of network protocols, firewalls, Linux operating systems, and common attack vectors (OWASP Top 10).',
      'Hands-on experience with SIEM tools, IDS/IPS, and endpoint detection and response (EDR) solutions.',
      'Industry certifications (Security+, CEH, CySA+, or CISSP) are strongly preferred.',
    ],
    aboutCompany:
      'Sentinel Gate Security provides managed threat intelligence, zero-trust defenses, and incident containment.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'job_fallback_18',
    title: 'Senior Enterprise Java Developer - Spring Boot',
    company: 'Novus Financial Systems',
    location: 'Charlotte, NC (Hybrid)',
    requiredSkills: ['Java', 'Spring Boot', 'Microservices', 'PostgreSQL', 'Docker', 'Kafka', 'REST APIs', 'JUnit'],
    description:
      'Novus Financial Systems engineers high-volume core banking and ledger transaction platforms. We are seeking a Senior Enterprise Java Developer to build distributed, fault-tolerant microservices using Spring Boot.',
    responsibilities: [
      'Architect, develop, and deploy enterprise Java microservices using Spring Boot and Spring Cloud.',
      'Design transactional data persistence layers using JPA, Hibernate, and PostgreSQL.',
      'Integrate asynchronous event messaging systems with Apache Kafka for real-time transaction processing.',
      'Write comprehensive unit, integration, and performance tests using JUnit and Mockito.',
    ],
    requirements: [
      '4+ years of solid enterprise Java development experience (Java 17/21 and Spring Boot).',
      'Proven track record building high-throughput REST APIs and microservice architectures.',
      'In-depth understanding of database transaction management (ACID), indexing, and query tuning.',
      'Experience with containerized development using Docker and CI/CD pipelines.',
    ],
    aboutCompany:
      'Novus Financial Systems engineers core ledger transaction engines and secure payment routing platforms.',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
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
    matchedSkills: ['React', 'TypeScript', 'Tailwind CSS'],
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
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Next.js'],
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
  skills: ['React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Gemini AI'],
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
