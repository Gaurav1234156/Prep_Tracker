import type {
  Difficulty,
  InterviewMode,
  RoundType,
} from "@prisma/client";

const SKILL_TO_TOPIC_AREA: Record<string, string> = {
  APTITUDE: "Core CS",
  LOGICAL_REASONING: "Core CS",
  QUANTITATIVE_APTITUDE: "Core CS",
  ENGLISH: "Communication Skills",
  DSA: "DSA Medium-Hard",
  CS_BASICS: "Core CS",
  PYTHON: "Backend Concepts",
  JAVA: "Backend Concepts",
  JAVASCRIPT: "Frontend Concepts",
  GENERAL: "Scenario / Situational",
  BEHAVIORAL: "Communication Skills",
  ANY_LANGUAGE: "Backend Concepts",
  TESTING: "Frontend Concepts",
  SELENIUM: "Frontend Concepts",
  SQL: "DBMS",
  AI_ML: "AI / ML / GenAI / Agents",
  SYSTEM_DESIGN: "System Design",
  OOPS: "OOPs",
  OS: "Operating Systems",
  NETWORKING: "Core CS",
  FRONTEND: "Frontend Concepts",
  BACKEND: "Backend Concepts",
  DBMS: "DBMS",
  PROJECT: "Scenario / Situational",
};

const TOPIC_TO_TOPIC_AREA: Record<string, string> = {
  APTITUDE: "Core CS",
  DSA: "DSA Medium-Hard",
  CS_BASICS: "Core CS",
  LOGICAL_REASONING: "Core CS",
  QUANTITATIVE_APTITUDE: "Core CS",
  ENGLISH: "Communication Skills",
  BEHAVIORAL: "Communication Skills",
  PYTHON: "Backend Concepts",
  JAVA: "Backend Concepts",
  JAVASCRIPT: "Frontend Concepts",
  SQL: "DBMS",
  SYSTEM_DESIGN: "System Design",
  OOPS: "OOPs",
  OS: "Operating Systems",
  AI_ML: "AI / ML / GenAI / Agents",
};

const ROUND_CATEGORY_MAP: Record<string, RoundType> = {
  ASSESSMENT: "ONLINE_ASSESSMENT",
  "ASSESSMENT/WRITTEN TEST": "ONLINE_ASSESSMENT",
  "Assessment/Written Test": "ONLINE_ASSESSMENT",
  TECHNICAL_ROUND_1: "TECHNICAL_1",
  TR1: "TECHNICAL_1",
  TECHNICAL_ROUND_2: "TECHNICAL_2",
  TR2: "TECHNICAL_2",
  TECHNICAL_ROUND_3: "TECHNICAL_3",
  TR3: "TECHNICAL_3",
  HR_ROUND: "HR",
  MANAGERIAL_ROUND: "MANAGERIAL",
  SCREENING_ROUND: "OTHER",
  "PROJECT ASSIGNMENT": "OTHER",
  "Project Assignment": "OTHER",
  CODING_ROUND: "CODING_ROUND",
  SYSTEM_DESIGN: "SYSTEM_DESIGN",
  BEHAVIORAL: "BEHAVIORAL",
  DIRECTOR: "DIRECTOR",
};

export function mapRoundCategory(raw: string): RoundType {
  const trimmed = raw.trim();
  if (!trimmed) return "OTHER";
  const direct = ROUND_CATEGORY_MAP[trimmed];
  if (direct) return direct;
  const upper = trimmed.toUpperCase();
  if (ROUND_CATEGORY_MAP[upper]) return ROUND_CATEGORY_MAP[upper];
  if (upper.includes("ASSESSMENT") || upper.includes("WRITTEN")) {
    return "ONLINE_ASSESSMENT";
  }
  if (upper.includes("TECHNICAL") || upper.startsWith("TR")) {
    if (upper.includes("2")) return "TECHNICAL_2";
    if (upper.includes("3")) return "TECHNICAL_3";
    return "TECHNICAL_1";
  }
  if (upper.includes("HR")) return "HR";
  if (upper.includes("MANAGERIAL")) return "MANAGERIAL";
  if (upper.includes("CODING")) return "CODING_ROUND";
  if (upper.includes("SYSTEM")) return "SYSTEM_DESIGN";
  return "OTHER";
}

export function mapInterviewMode(raw: string): InterviewMode {
  const upper = raw.trim().toUpperCase();
  if (upper.includes("OFFLINE") || upper.includes("ON-SITE")) return "OFFLINE";
  if (upper.includes("PAPER")) return "ON_PAPER";
  if (upper.includes("GOOGLE")) return "GOOGLE_DOCS";
  if (upper.includes("CODING") || upper.includes("HACKERRANK")) {
    return "CODING_PLATFORM";
  }
  if (upper.includes("HYBRID")) return "HYBRID";
  return "ONLINE";
}

export function mapDifficulty(raw: string): Difficulty | null {
  const upper = raw.trim().toUpperCase();
  if (upper === "EASY") return "EASY";
  if (upper === "MEDIUM") return "MEDIUM";
  if (upper === "HARD") return "HARD";
  return null;
}

export function mapTopicAreaName(
  skillsAssessed: string,
  topic: string,
): string {
  const skill = skillsAssessed.trim().toUpperCase().split(/[,\s]+/)[0];
  if (skill && SKILL_TO_TOPIC_AREA[skill]) {
    return SKILL_TO_TOPIC_AREA[skill];
  }
  const topicKey = topic.trim().toUpperCase();
  if (topicKey && TOPIC_TO_TOPIC_AREA[topicKey]) {
    return TOPIC_TO_TOPIC_AREA[topicKey];
  }
  if (skill) return "Core CS";
  return "Scenario / Situational";
}

export function mapSubTopicName(
  subTopic: string,
  skillsAssessed: string,
  questionType: string,
): string {
  const sub = subTopic.trim();
  if (sub) return sub.replace(/_/g, " ");
  const skill = skillsAssessed.trim();
  if (skill) return skill.split(",")[0].trim().replace(/_/g, " ");
  const qt = questionType.trim();
  if (qt) return qt.replace(/_/g, " ");
  return "General";
}

export function inferRoleLevel(role: string): string {
  const upper = role.toUpperCase();
  if (upper.includes("INTERN")) return "Intern";
  if (upper.includes("SDE-3") || upper.includes("SENIOR")) return "SDE-3";
  if (upper.includes("SDE-2")) return "SDE-2";
  if (upper.includes("SDE-1") || upper.includes("JUNIOR")) return "SDE-1";
  if (upper.includes("DATA ENGINEER")) return "Data Engineer";
  if (upper.includes("ML") || upper.includes("AI")) return "ML Engineer";
  if (upper.includes("FULL STACK") || upper.includes("FULLSTACK")) {
    return "Fullstack";
  }
  if (upper.includes("FRONTEND")) return "Frontend SDE";
  if (upper.includes("BACKEND")) return "Backend SDE";
  return "Other";
}

export function parseExcelDate(raw: string): Date | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const serial = Number(trimmed);
  if (Number.isFinite(serial) && serial > 30000 && serial < 60000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + Math.floor(serial));
    return epoch;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const dt = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    if (!Number.isNaN(dt.getTime())) return dt;
  }

  return null;
}

export function parseYear(raw: string): number {
  const dt = parseExcelDate(raw);
  if (dt) return dt.getUTCFullYear();
  const year = Number(raw);
  if (Number.isFinite(year) && year >= 2000 && year <= 2035) return year;
  return new Date().getUTCFullYear();
}

export function parseFloatOrNull(raw: string): number | null {
  const n = Number(raw.trim());
  return Number.isFinite(n) ? n : null;
}

export function parseIntOrNull(raw: string): number | null {
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(n) ? n : null;
}
