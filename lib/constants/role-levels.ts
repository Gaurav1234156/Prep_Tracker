export const ROLE_LEVEL_NAMES = [
  "Intern",
  "SDE-1",
  "SDE-2",
  "SDE-3",
  "Frontend Intern",
  "Frontend SDE",
  "Backend Intern",
  "Backend SDE",
  "Fullstack",
  "Data Engineer",
  "ML Engineer",
  "Other",
] as const;

export type RoleLevelName = (typeof ROLE_LEVEL_NAMES)[number];

const ROLE_LEVEL_NAME_SET = new Set<string>(ROLE_LEVEL_NAMES);

export function isRoleLevelName(name: string): name is RoleLevelName {
  return ROLE_LEVEL_NAME_SET.has(name);
}
