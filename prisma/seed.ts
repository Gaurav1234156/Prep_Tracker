import { PrismaClient } from "@prisma/client";
import { ROLE_LEVEL_NAMES } from "../lib/constants/role-levels";
import { slugify } from "../lib/slug";

const prisma = new PrismaClient();

const TOPIC_AREAS = [
  { name: "DSA Easy",                     sortOrder: 10 },
  { name: "DSA Medium-Hard",              sortOrder: 20 },
  { name: "Frontend Concepts",            sortOrder: 30 },
  { name: "Frontend Coding",              sortOrder: 40 },
  { name: "Backend Concepts",             sortOrder: 50 },
  { name: "Backend Coding",               sortOrder: 60 },
  { name: "DBMS",                         sortOrder: 70 },
  { name: "AI / ML / GenAI / Agents",     sortOrder: 80 },
  { name: "System Design",                sortOrder: 90 },
  { name: "OOPs",                         sortOrder: 100 },
  { name: "Core CS",                      sortOrder: 110 },
  { name: "Operating Systems",            sortOrder: 120 },
  { name: "Linux",                        sortOrder: 130 },
  { name: "Communication Skills",         sortOrder: 140 },
  { name: "Scenario / Situational",       sortOrder: 150 },
];

const SUB_TOPICS: Array<{ name: string; area: string }> = [
  // DSA (mapped to DSA Medium-Hard)
  { name: "Arrays", area: "DSA Medium-Hard" },
  { name: "Strings", area: "DSA Medium-Hard" },
  { name: "Linked List", area: "DSA Medium-Hard" },
  { name: "Stack", area: "DSA Medium-Hard" },
  { name: "Queue", area: "DSA Medium-Hard" },
  { name: "Hashing", area: "DSA Medium-Hard" },
  { name: "Trees", area: "DSA Medium-Hard" },
  { name: "Binary Search Trees", area: "DSA Medium-Hard" },
  { name: "Tries", area: "DSA Medium-Hard" },
  { name: "Graphs", area: "DSA Medium-Hard" },
  { name: "Dynamic Programming", area: "DSA Medium-Hard" },
  { name: "Greedy", area: "DSA Medium-Hard" },
  { name: "Backtracking", area: "DSA Medium-Hard" },
  { name: "Recursion", area: "DSA Medium-Hard" },
  { name: "Sliding Window", area: "DSA Medium-Hard" },
  { name: "Two Pointers", area: "DSA Medium-Hard" },
  { name: "Binary Search", area: "DSA Medium-Hard" },
  { name: "Sorting", area: "DSA Medium-Hard" },
  { name: "Heap / Priority Queue", area: "DSA Medium-Hard" },
  { name: "Bit Manipulation", area: "DSA Medium-Hard" },
  { name: "Math", area: "DSA Medium-Hard" },
  { name: "Matrix", area: "DSA Medium-Hard" },
  { name: "Intervals", area: "DSA Medium-Hard" },

  // FRONTEND (React, etc. to Frontend Concepts)
  { name: "React", area: "Frontend Concepts" },
  { name: "Next.js", area: "Frontend Concepts" },
  { name: "Vue", area: "Frontend Concepts" },
  { name: "Angular", area: "Frontend Concepts" },
  { name: "JavaScript Core", area: "Frontend Concepts" },
  { name: "TypeScript", area: "Frontend Concepts" },
  { name: "HTML", area: "Frontend Concepts" },
  { name: "CSS", area: "Frontend Concepts" },
  { name: "Tailwind", area: "Frontend Concepts" },
  { name: "Browser Rendering", area: "Frontend Concepts" },
  { name: "Performance", area: "Frontend Concepts" },
  { name: "Accessibility", area: "Frontend Concepts" },
  { name: "State Management", area: "Frontend Concepts" },
  { name: "Testing", area: "Frontend Concepts" },
  { name: "Web APIs", area: "Frontend Concepts" },
  { name: "Build Tools", area: "Frontend Concepts" },
  { name: "Cross-Browser Compatibility", area: "Frontend Concepts" },
  { name: "Responsive Design", area: "Frontend Concepts" },

  // BACKEND (to Backend Concepts)
  { name: "Node.js", area: "Backend Concepts" },
  { name: "Express", area: "Backend Concepts" },
  { name: "Spring", area: "Backend Concepts" },
  { name: "Django", area: "Backend Concepts" },
  { name: "Flask", area: "Backend Concepts" },
  { name: "REST APIs", area: "Backend Concepts" },
  { name: "GraphQL", area: "Backend Concepts" },
  { name: "Authentication", area: "Backend Concepts" },
  { name: "Authorization", area: "Backend Concepts" },
  { name: "Caching", area: "Backend Concepts" },
  { name: "Message Queues", area: "Backend Concepts" },
  { name: "Microservices", area: "Backend Concepts" },
  { name: "Monolith", area: "Backend Concepts" },
  { name: "API Design", area: "Backend Concepts" },
  { name: "Rate Limiting", area: "Backend Concepts" },

  // DBMS (to DBMS)
  { name: "SQL", area: "DBMS" },
  { name: "NoSQL", area: "DBMS" },
  { name: "Indexing", area: "DBMS" },
  { name: "Normalization", area: "DBMS" },
  { name: "Transactions", area: "DBMS" },
  { name: "ACID", area: "DBMS" },
  { name: "Joins", area: "DBMS" },
  { name: "Query Optimization", area: "DBMS" },
  { name: "Sharding", area: "DBMS" },
  { name: "Replication", area: "DBMS" },
  { name: "MongoDB", area: "DBMS" },
  { name: "Redis", area: "DBMS" },
  { name: "PostgreSQL", area: "DBMS" },
  { name: "MySQL", area: "DBMS" },

  // OPERATING_SYSTEMS (to Operating Systems)
  { name: "Processes", area: "Operating Systems" },
  { name: "Threads", area: "Operating Systems" },
  { name: "Concurrency", area: "Operating Systems" },
  { name: "Deadlocks", area: "Operating Systems" },
  { name: "Scheduling", area: "Operating Systems" },
  { name: "Memory Management", area: "Operating Systems" },
  { name: "Virtual Memory", area: "Operating Systems" },
  { name: "Paging", area: "Operating Systems" },
  { name: "File Systems", area: "Operating Systems" },
  { name: "IPC", area: "Operating Systems" },

  // NETWORKING (to Core CS)
  { name: "TCP/IP", area: "Core CS" },
  { name: "HTTP", area: "Core CS" },
  { name: "HTTPS", area: "Core CS" },
  { name: "DNS", area: "Core CS" },
  { name: "Load Balancing", area: "Core CS" },
  { name: "CDN", area: "Core CS" },
  { name: "WebSockets", area: "Core CS" },
  { name: "OSI Model", area: "Core CS" },

  // SYSTEM_DESIGN (to System Design)
  { name: "Scalability", area: "System Design" },
  { name: "Load Balancing", area: "System Design" },
  { name: "Caching Strategy", area: "System Design" },
  { name: "Database Design", area: "System Design" },
  { name: "Microservices Architecture", area: "System Design" },
  { name: "Event-Driven Architecture", area: "System Design" },
  { name: "CAP Theorem", area: "System Design" },
  { name: "Consistency Models", area: "System Design" },
  { name: "Sharding Strategies", area: "System Design" },
  { name: "Rate Limiting Design", area: "System Design" },
  { name: "URL Shortener", area: "System Design" },
  { name: "Chat Application", area: "System Design" },
  { name: "News Feed", area: "System Design" },
  { name: "Time Machine / Versioning", area: "System Design" },

  // OOPS (to OOPs)
  { name: "Inheritance", area: "OOPs" },
  { name: "Polymorphism", area: "OOPs" },
  { name: "Encapsulation", area: "OOPs" },
  { name: "Abstraction", area: "OOPs" },
  { name: "SOLID Principles", area: "OOPs" },
  { name: "Design Patterns", area: "OOPs" },
  { name: "Composition", area: "OOPs" },
  { name: "Interfaces", area: "OOPs" },

  // CORE_CS (to Core CS)
  { name: "Compilers", area: "Core CS" },
  { name: "Computer Architecture", area: "Core CS" },
  { name: "Number Systems", area: "Core CS" },
  { name: "Boolean Logic", area: "Core CS" },

  // AI_ML (to AI / ML / GenAI / Agents)
  { name: "Supervised Learning", area: "AI / ML / GenAI / Agents" },
  { name: "Unsupervised Learning", area: "AI / ML / GenAI / Agents" },
  { name: "Neural Networks", area: "AI / ML / GenAI / Agents" },
  { name: "NLP", area: "AI / ML / GenAI / Agents" },
  { name: "Computer Vision", area: "AI / ML / GenAI / Agents" },
  { name: "LLMs", area: "AI / ML / GenAI / Agents" },
  { name: "Prompt Engineering", area: "AI / ML / GenAI / Agents" },
  { name: "Agents", area: "AI / ML / GenAI / Agents" },
  { name: "RAG", area: "AI / ML / GenAI / Agents" },
  { name: "Fine-tuning", area: "AI / ML / GenAI / Agents" },
  { name: "Vector Databases", area: "AI / ML / GenAI / Agents" },

  // APTITUDE (to Core CS)
  { name: "Quantitative", area: "Core CS" },
  { name: "Logical Reasoning", area: "Core CS" },
  { name: "Verbal", area: "Core CS" },
  { name: "Data Interpretation", area: "Core CS" },

  // BEHAVIORAL (to Communication Skills)
  { name: "Conflict Resolution", area: "Communication Skills" },
  { name: "Leadership", area: "Communication Skills" },
  { name: "Teamwork", area: "Communication Skills" },
  { name: "Failure Story", area: "Communication Skills" },
  { name: "Strengths and Weaknesses", area: "Communication Skills" },

  // LINUX (to Linux)
  { name: "Shell Commands", area: "Linux" },
  { name: "Bash Scripting", area: "Linux" },
  { name: "Permissions", area: "Linux" },
  { name: "Process Management", area: "Linux" },

  // SCENARIO (to Scenario / Situational)
  { name: "Debugging Scenario", area: "Scenario / Situational" },
  { name: "System Failure Scenario", area: "Scenario / Situational" },
  { name: "User Problem Scenario", area: "Scenario / Situational" },

  // COMMUNICATION (to Communication Skills)
  { name: "Verbal Clarity", area: "Communication Skills" },
  { name: "Written Communication", area: "Communication Skills" },
  { name: "Thinking Aloud", area: "Communication Skills" },
];

const COMPANIES: Array<{ name: string; slug: string; ctc?: number }> = [
  { name: "Google", slug: "google", ctc: 35.0 },
  { name: "Adobe", slug: "adobe", ctc: 25.0 },
  { name: "Samsung", slug: "samsung", ctc: 18.0 },
  { name: "Microsoft", slug: "microsoft", ctc: 30.0 },
  { name: "Amazon", slug: "amazon", ctc: 28.0 },
  { name: "Meta", slug: "meta", ctc: 45.0 },
  { name: "Apple", slug: "apple", ctc: 40.0 },
  { name: "Netflix", slug: "netflix", ctc: 50.0 },
  { name: "Atlassian", slug: "atlassian", ctc: 32.0 },
  { name: "Salesforce", slug: "salesforce", ctc: 26.0 },
];

const FLAGS: Array<{ key: string; enabled: boolean; description: string }> = [
  {
    key: "show_candidate_profile_filter",
    enabled: false,
    description: "Expose CGPA/branch/year filter on the student catalog.",
  },
  {
    key: "ai_narrative_insights",
    enabled: false,
    description: "Generate LLM summaries per company.",
  },
  {
    key: "student_bookmarks",
    enabled: true,
    description: "Allow students to bookmark interviews.",
  },
];

async function seedRoleLevels() {
  for (const name of ROLE_LEVEL_NAMES) {
    const slug = slugify(name);
    await prisma.roleLevel.upsert({
      where: { name },
      update: {},
      create: { name, slug },
    });
  }
  return ROLE_LEVEL_NAMES.length;
}

async function seedCompanies() {
  for (const c of COMPANIES) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: { name: c.name, ctc: c.ctc },
      create: { name: c.name, slug: c.slug, ctc: c.ctc },
    });
  }
  return COMPANIES.length;
}

async function seedFlags() {
  for (const f of FLAGS) {
    await prisma.featureFlag.upsert({
      where: { key: f.key },
      update: { description: f.description },
      create: { key: f.key, enabled: f.enabled, description: f.description },
    });
  }
  return FLAGS.length;
}

async function seedTopicAreasAndSubTopics() {
  const nameToIdMap = new Map<string, string>();

  // 1. Seed Topic Areas
  for (const ta of TOPIC_AREAS) {
    const slug = slugify(ta.name);
    const row = await prisma.topicArea.upsert({
      where: { name: ta.name },
      update: { sortOrder: ta.sortOrder },
      create: { name: ta.name, slug, sortOrder: ta.sortOrder },
    });
    nameToIdMap.set(ta.name, row.id);
  }

  // 2. Seed Sub Topics
  for (const st of SUB_TOPICS) {
    const topicAreaId = nameToIdMap.get(st.area);
    if (!topicAreaId) {
      throw new Error(`TopicArea name not found in map: ${st.area}`);
    }
    const slug = slugify(st.name);
    await prisma.subTopic.upsert({
      where: {
        name_topicAreaId: {
          name: st.name,
          topicAreaId,
        },
      },
      update: { slug },
      create: {
        name: st.name,
        slug,
        topicAreaId,
      },
    });
  }

  return { areasCount: TOPIC_AREAS.length, subTopicsCount: SUB_TOPICS.length };
}

async function main() {
  const [companies, flags, roleLevels, taxonomy] = await Promise.all([
    seedCompanies(),
    seedFlags(),
    seedRoleLevels(),
    seedTopicAreasAndSubTopics(),
  ]);

  process.stdout.write(
    `Seeded ${taxonomy.areasCount} topic areas, ${taxonomy.subTopicsCount} sub-topics, ${companies} companies, ${flags} feature flags, ${roleLevels} role levels.\n`,
  );
}

main()
  .catch((err) => {
    process.stderr.write(`Seed failed: ${String(err)}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
