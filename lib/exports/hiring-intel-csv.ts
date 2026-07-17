export const HIRING_INTEL_CSV_HEADERS = [
  "company_name",
  "job_id",
  "role",
  "tech_stack",
  "optional_skills",
  "ctc_min",
  "ctc_max",
  "openings",
  "location",
  "job_type",
  "product",
  "hubspot_url",
  "source_category",
  "entered_by",
  "entered_at",
  "interview_process",
] as const;

export type HiringIntelCsvRow = {
  companyName: string;
  externalJobId: string;
  role: string;
  techStack: string | null;
  optionalSkills: string | null;
  ctcMin: number | null;
  ctcMax: number | null;
  openings: number | null;
  location: string | null;
  jobType: string | null;
  product: string | null;
  hubspotUrl: string | null;
  sourceCategory: string | null;
  enteredBy: string | null;
  enteredAt: Date | null;
  interviewProcess: string | null;
  /** Used only for newest-job tiebreak during dedupe; not exported. */
  updatedAt?: Date | null;
};

function escapeCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  return escapeCell(String(value));
}

function normalizeKey(companyName: string, role: string): string {
  return `${companyName.trim().toLowerCase()}::${role.trim().toLowerCase()}`;
}

function splitTokens(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[;,]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function unionTokens(...values: (string | null)[]): string | null {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const value of values) {
    for (const token of splitTokens(value)) {
      const key = token.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      ordered.push(token);
    }
  }
  return ordered.length > 0 ? ordered.join("; ") : null;
}

function newerJob(a: HiringIntelCsvRow, b: HiringIntelCsvRow): HiringIntelCsvRow {
  const aEntered = a.enteredAt?.getTime() ?? 0;
  const bEntered = b.enteredAt?.getTime() ?? 0;
  if (bEntered !== aEntered) return bEntered > aEntered ? b : a;

  const aUpdated = a.updatedAt?.getTime() ?? 0;
  const bUpdated = b.updatedAt?.getTime() ?? 0;
  if (bUpdated !== aUpdated) return bUpdated > aUpdated ? b : a;

  return a;
}

function preferNonNull(
  newest: string | null,
  other: string | null,
): string | null {
  return newest || other || null;
}

function mergeRows(
  a: HiringIntelCsvRow,
  b: HiringIntelCsvRow,
): HiringIntelCsvRow {
  const newest = newerJob(a, b);
  const older = newest === a ? b : a;

  const openingsSum =
    (a.openings ?? 0) + (b.openings ?? 0) || null;

  let ctcMin: number | null = null;
  let ctcMax: number | null = null;
  for (const row of [a, b]) {
    if (row.ctcMin != null) {
      ctcMin = ctcMin == null ? row.ctcMin : Math.min(ctcMin, row.ctcMin);
    }
    if (row.ctcMax != null) {
      ctcMax = ctcMax == null ? row.ctcMax : Math.max(ctcMax, row.ctcMax);
    }
  }

  return {
    companyName: newest.companyName,
    externalJobId: newest.externalJobId,
    role: newest.role,
    techStack: unionTokens(a.techStack, b.techStack),
    optionalSkills: unionTokens(a.optionalSkills, b.optionalSkills),
    ctcMin,
    ctcMax,
    openings: openingsSum === 0 ? null : openingsSum,
    location: unionTokens(a.location, b.location),
    jobType: preferNonNull(newest.jobType, older.jobType),
    product: preferNonNull(newest.product, older.product),
    hubspotUrl: preferNonNull(newest.hubspotUrl, older.hubspotUrl),
    sourceCategory: preferNonNull(newest.sourceCategory, older.sourceCategory),
    enteredBy: preferNonNull(newest.enteredBy, older.enteredBy),
    enteredAt: newest.enteredAt ?? older.enteredAt,
    interviewProcess: preferNonNull(
      newest.interviewProcess,
      older.interviewProcess,
    ),
    updatedAt: newest.updatedAt ?? older.updatedAt,
  };
}

/** One row per company + role (case-insensitive), merging duplicate jobs. */
export function dedupeHiringIntelRows(
  rows: HiringIntelCsvRow[],
): HiringIntelCsvRow[] {
  const byKey = new Map<string, HiringIntelCsvRow>();

  for (const row of rows) {
    const key = normalizeKey(row.companyName, row.role);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, row);
      continue;
    }
    byKey.set(key, mergeRows(existing, row));
  }

  return Array.from(byKey.values()).sort((a, b) => {
    const companyCmp = a.companyName.localeCompare(b.companyName);
    if (companyCmp !== 0) return companyCmp;
    return a.role.localeCompare(b.role);
  });
}

export function jobsToHiringIntelCsv(rows: HiringIntelCsvRow[]): string {
  const deduped = dedupeHiringIntelRows(rows);
  const headerRow = HIRING_INTEL_CSV_HEADERS.map((h) => escapeCell(h)).join(",");

  const dataRows = deduped.map((row) =>
    [
      cell(row.companyName),
      cell(row.externalJobId),
      cell(row.role),
      cell(row.techStack),
      cell(row.optionalSkills),
      cell(row.ctcMin),
      cell(row.ctcMax),
      cell(row.openings),
      cell(row.location),
      cell(row.jobType),
      cell(row.product),
      cell(row.hubspotUrl),
      cell(row.sourceCategory),
      cell(row.enteredBy),
      cell(row.enteredAt?.toISOString() ?? null),
      cell(row.interviewProcess),
    ].join(","),
  );

  return [headerRow, ...dataRows].join("\n");
}
