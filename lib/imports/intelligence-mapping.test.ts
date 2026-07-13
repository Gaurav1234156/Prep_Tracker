/**
 * Run: npx tsx lib/imports/intelligence-mapping.test.ts
 */
import { ROLE_LEVEL_NAMES } from "../constants/role-levels";
import { inferRoleLevel } from "./intelligence-mapping";

type Case = { input: string; expected: string };

const cases: Case[] = [
  // Backend / Frontend intern (specific before generic)
  { input: "Backend Intern", expected: "Backend Intern" },
  { input: "backend intern", expected: "Backend Intern" },
  { input: "Frontend Intern", expected: "Frontend Intern" },
  { input: "Frontend Engineering Intern", expected: "Frontend Intern" },

  // Ambiguous intern stays generic
  { input: "Intern", expected: "Intern" },
  { input: "Software Engineer Intern", expected: "Intern" },
  { input: "SDE Intern", expected: "Intern" },

  // Backend / Frontend SDE
  { input: "Backend SDE", expected: "Backend SDE" },
  { input: "Backend Engineer", expected: "Backend SDE" },
  { input: "Frontend SDE", expected: "Frontend SDE" },
  { input: "Frontend Developer", expected: "Frontend SDE" },

  // SDE levels
  { input: "SDE-1", expected: "SDE-1" },
  { input: "SDE 1", expected: "SDE-1" },
  { input: "Junior SDE", expected: "SDE-1" },
  { input: "SDE", expected: "SDE-1" },
  { input: "SDE-2", expected: "SDE-2" },
  { input: "SDE 2", expected: "SDE-2" },
  { input: "SDE-3", expected: "SDE-3" },
  { input: "SDE 3", expected: "SDE-3" },
  { input: "Senior Software Engineer", expected: "SDE-3" },

  // Other specialized roles
  { input: "Data Engineer", expected: "Data Engineer" },
  { input: "ML Engineer", expected: "ML Engineer" },
  { input: "Machine Learning Engineer", expected: "ML Engineer" },
  { input: "AI/ML Engineer", expected: "ML Engineer" },
  { input: "Fullstack Developer", expected: "Fullstack" },
  { input: "Full Stack Engineer", expected: "Fullstack" },

  // Fallback
  { input: "Product Manager", expected: "Other" },
  { input: "", expected: "Other" },
];

// At least one positive case per canonical role level
const coveredByCanonical = new Map<string, string>();
for (const name of ROLE_LEVEL_NAMES) {
  coveredByCanonical.set(name, cases.find((c) => c.expected === name)?.input ?? name);
}

let failed = 0;

for (const { input, expected } of cases) {
  const actual = inferRoleLevel(input);
  if (actual !== expected) {
    failed++;
    console.error(`FAIL: inferRoleLevel("${input}") => "${actual}", expected "${expected}"`);
  }
}

for (const name of ROLE_LEVEL_NAMES) {
  const sample = coveredByCanonical.get(name)!;
  const actual = inferRoleLevel(sample);
  if (actual !== name) {
    failed++;
    console.error(
      `FAIL: canonical "${name}" not covered — inferRoleLevel("${sample}") => "${actual}"`,
    );
  }
}

if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
}

console.log(`All ${cases.length + ROLE_LEVEL_NAMES.length} assertions passed.`);
