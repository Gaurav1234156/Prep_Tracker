export const CTC_RANGE_OPTIONS = [
  { id: "lt3", label: "<3", min: null, max: 3 },
  { id: "3-6", label: "3–6", min: 3, max: 6 },
  { id: "6-9", label: "6–9", min: 6, max: 9 },
  { id: "9-12", label: "9–12", min: 9, max: 12 },
  { id: "12-15", label: "12–15", min: 12, max: 15 },
  { id: "15plus", label: "15+", min: 15, max: null },
] as const;

export type CtcRangeId = (typeof CTC_RANGE_OPTIONS)[number]["id"];

export function ctcRangeToParams(
  id: CtcRangeId | null,
): { ctcMin: string | null; ctcMax: string | null } {
  if (!id) return { ctcMin: null, ctcMax: null };

  const option = CTC_RANGE_OPTIONS.find((o) => o.id === id);
  if (!option) return { ctcMin: null, ctcMax: null };

  return {
    ctcMin: option.min != null ? String(option.min) : null,
    ctcMax: option.max != null ? String(option.max) : null,
  };
}

export function paramsToCtcRangeId(
  ctcMin: string | null,
  ctcMax: string | null,
): CtcRangeId | null {
  const min = ctcMin?.trim() || null;
  const max = ctcMax?.trim() || null;

  for (const option of CTC_RANGE_OPTIONS) {
    const optionMin = option.min != null ? String(option.min) : null;
    const optionMax = option.max != null ? String(option.max) : null;
    if (optionMin === min && optionMax === max) {
      return option.id;
    }
  }

  return null;
}
