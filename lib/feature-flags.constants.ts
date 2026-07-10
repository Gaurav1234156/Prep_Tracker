export const FEATURE_FLAG_KEYS = {
  SHOW_CANDIDATE_PROFILE_FILTER: "show_candidate_profile_filter",
  AI_NARRATIVE_INSIGHTS: "ai_narrative_insights",
  STUDENT_BOOKMARKS: "student_bookmarks",
} as const;

export type FeatureFlagKey =
  (typeof FEATURE_FLAG_KEYS)[keyof typeof FEATURE_FLAG_KEYS];

/** Flags that are read by application code at runtime. */
export const WIRED_FLAGS = new Set<FeatureFlagKey>([
  FEATURE_FLAG_KEYS.SHOW_CANDIDATE_PROFILE_FILTER,
  FEATURE_FLAG_KEYS.STUDENT_BOOKMARKS,
]);

export function isFlagWired(key: string): boolean {
  return WIRED_FLAGS.has(key as FeatureFlagKey);
}
