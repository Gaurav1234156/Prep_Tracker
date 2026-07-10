"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, RotateCcw, Filter, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CTC_RANGE_OPTIONS,
  ctcRangeToParams,
  paramsToCtcRangeId,
  type CtcRangeId,
} from "@/lib/constants/ctc-ranges";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  roleLevels: { id: string; name: string; slug: string }[];
  showProfileFilter?: boolean;
}

const BRANCH_OPTIONS = [
  { value: "CSE", label: "CSE" },
  { value: "IT", label: "IT" },
  { value: "ECE", label: "ECE" },
  { value: "EEE", label: "EEE" },
  { value: "MECH", label: "MECH" },
  { value: "CIVIL", label: "CIVIL" },
  { value: "CHEM", label: "CHEM" },
  { value: "AI_ML", label: "AI/ML" },
  { value: "OTHER", label: "Other" },
] as const;

export function CompaniesFilterBar({
  roleLevels,
  showProfileFilter = false,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedLevels, setSelectedLevels] = useState<string[]>(
    searchParams.get("roleLevel")?.split(",").filter(Boolean) || [],
  );
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    searchParams.get("branch")?.split(",").filter(Boolean) || [],
  );
  const initialCgpa = Number(searchParams.get("cgpaMin"));
  const [cgpaMin, setCgpaMin] = useState<number>(
    Number.isFinite(initialCgpa) && initialCgpa >= 6 ? initialCgpa : 6,
  );
  const [selectedCtcRange, setSelectedCtcRange] = useState<CtcRangeId | null>(
    paramsToCtcRangeId(
      searchParams.get("ctcMin"),
      searchParams.get("ctcMax"),
    ),
  );

  const sync = (next: {
    q?: string;
    levels?: string[];
    branches?: string[];
    cgpaMin?: number | null;
    ctcRange?: CtcRangeId | null;
  }) => {
    const params = new URLSearchParams();
    const q = next.q ?? search;
    const levels = next.levels ?? selectedLevels;
    const brs = next.branches ?? selectedBranches;
    const cMin = next.cgpaMin === undefined ? cgpaMin : next.cgpaMin;
    const ctcRange = next.ctcRange === undefined ? selectedCtcRange : next.ctcRange;
    const { ctcMin: ctMin, ctcMax: ctMax } = ctcRangeToParams(ctcRange);

    if (q.trim()) params.set("q", q.trim());
    if (levels.length > 0) params.set("roleLevel", levels.join(","));
    if (showProfileFilter && brs.length > 0) params.set("branch", brs.join(","));
    if (showProfileFilter && cMin != null && cMin > 6) {
      params.set("cgpaMin", String(cMin));
    }
    if (ctMin && ctMin.trim()) params.set("ctcMin", ctMin.trim());
    if (ctMax && ctMax.trim()) params.set("ctcMax", ctMax.trim());

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Debounced search sync
  useEffect(() => {
    const t = setTimeout(() => {
      const current = searchParams.get("q") || "";
      if (search.trim() !== current.trim()) {
        sync({ q: search });
      }
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleCtcRange = (id: CtcRangeId) => {
    const next = selectedCtcRange === id ? null : id;
    setSelectedCtcRange(next);
    sync({ ctcRange: next });
  };

  const toggleLevel = (id: string) => {
    const next = selectedLevels.includes(id)
      ? selectedLevels.filter((x) => x !== id)
      : [...selectedLevels, id];
    setSelectedLevels(next);
    sync({ levels: next });
  };
  const toggleBranch = (b: string) => {
    const next = selectedBranches.includes(b)
      ? selectedBranches.filter((x) => x !== b)
      : [...selectedBranches, b];
    setSelectedBranches(next);
    sync({ branches: next });
  };
  const commitCgpa = (val: number) => {
    setCgpaMin(val);
    sync({ cgpaMin: val });
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedLevels([]);
    setSelectedBranches([]);
    setCgpaMin(6);
    setSelectedCtcRange(null);
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedLevels.length > 0 ||
    selectedBranches.length > 0 ||
    (showProfileFilter && cgpaMin > 6) ||
    selectedCtcRange != null;

  return (
    <div className="bg-card border border-border rounded-lg p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Filter className="size-4 text-primary" />
          Filter companies
        </h3>
        {hasActiveFilters && (
          <Button
            onClick={resetFilters}
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <RotateCcw className="size-3.5" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 items-start">
        <div className="space-y-4">
          <FilterColumn label="Company name">
            <div className="relative">
              <Search className="size-4 absolute inset-y-0 left-3 my-auto text-muted-foreground/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by name…"
                className="w-full text-sm pl-9 pr-3 h-9 rounded-md bg-background border border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-colors"
              />
            </div>
          </FilterColumn>

          <FilterColumn label="CTC Range (LPA)">
            <ChipRow>
              {CTC_RANGE_OPTIONS.map((range) => (
                <Chip
                  key={range.id}
                  active={selectedCtcRange === range.id}
                  onClick={() => toggleCtcRange(range.id)}
                >
                  {selectedCtcRange === range.id && <Check className="size-3" />}
                  {range.label}
                </Chip>
              ))}
            </ChipRow>
          </FilterColumn>
        </div>

        <FilterColumn label="Role levels">
          <ChipRow>
            {roleLevels.map((level) => (
              <Chip
                key={level.id}
                active={selectedLevels.includes(level.id)}
                onClick={() => toggleLevel(level.id)}
              >
                {selectedLevels.includes(level.id) && <Check className="size-3" />}
                {level.name}
              </Chip>
            ))}
          </ChipRow>
        </FilterColumn>
      </div>

      {showProfileFilter && (
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 pt-6 border-t border-border">
          <FilterColumn label="Candidate branch">
            <ChipRow>
              {BRANCH_OPTIONS.map((b) => (
                <Chip
                  key={b.value}
                  active={selectedBranches.includes(b.value)}
                  onClick={() => toggleBranch(b.value)}
                >
                  {selectedBranches.includes(b.value) && (
                    <Check className="size-3" />
                  )}
                  {b.label}
                </Chip>
              ))}
            </ChipRow>
          </FilterColumn>

          <FilterColumn label={`Min CGPA: ${cgpaMin.toFixed(1)}`}>
            <input
              type="range"
              min={6}
              max={10}
              step={0.1}
              value={cgpaMin}
              onChange={(e) => setCgpaMin(Number(e.target.value))}
              onMouseUp={(e) =>
                commitCgpa(Number((e.target as HTMLInputElement).value))
              }
              onTouchEnd={(e) =>
                commitCgpa(Number((e.target as HTMLInputElement).value))
              }
              className="w-full accent-primary"
              aria-label="Minimum CGPA"
            />
          </FilterColumn>
        </div>
      )}

      {isPending && (
        <div className="text-xs text-muted-foreground text-right">
          Refreshing results…
        </div>
      )}
    </div>
  );
}

function FilterColumn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted-foreground block">{label}</label>
      {children}
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 h-9 rounded-md text-xs font-medium border transition-colors duration-200 cursor-pointer select-none",
        active
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-background hover:bg-secondary border-border text-foreground",
      )}
    >
      {children}
    </button>
  );
}
