"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Search, RotateCcw, Filter, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  roleLevels: { id: string; name: string; slug: string }[];
  years: number[];
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
  years,
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
  const [selectedYears, setSelectedYears] = useState<number[]>(
    searchParams.get("year")?.split(",").map(Number).filter(Boolean) || [],
  );
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    searchParams.get("branch")?.split(",").filter(Boolean) || [],
  );
  const initialCgpa = Number(searchParams.get("cgpaMin"));
  const [cgpaMin, setCgpaMin] = useState<number>(
    Number.isFinite(initialCgpa) && initialCgpa >= 6 ? initialCgpa : 6,
  );
  const [ctcMin, setCtcMin] = useState<string>(searchParams.get("ctcMin") || "");
  const [ctcMax, setCtcMax] = useState<string>(searchParams.get("ctcMax") || "");

  const sync = (next: {
    q?: string;
    levels?: string[];
    years?: number[];
    branches?: string[];
    cgpaMin?: number | null;
    ctcMin?: string | null;
    ctcMax?: string | null;
  }) => {
    const params = new URLSearchParams();
    const q = next.q ?? search;
    const levels = next.levels ?? selectedLevels;
    const yrs = next.years ?? selectedYears;
    const brs = next.branches ?? selectedBranches;
    const cMin = next.cgpaMin === undefined ? cgpaMin : next.cgpaMin;
    const ctMin = next.ctcMin === undefined ? ctcMin : next.ctcMin;
    const ctMax = next.ctcMax === undefined ? ctcMax : next.ctcMax;

    if (q.trim()) params.set("q", q.trim());
    if (levels.length > 0) params.set("roleLevel", levels.join(","));
    if (yrs.length > 0) params.set("year", yrs.map(String).join(","));
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

  // Debounced CTC sync
  useEffect(() => {
    const t = setTimeout(() => {
      const currentMin = searchParams.get("ctcMin") || "";
      const currentMax = searchParams.get("ctcMax") || "";
      if (ctcMin !== currentMin || ctcMax !== currentMax) {
        sync({ ctcMin, ctcMax });
      }
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctcMin, ctcMax]);

  const toggleLevel = (id: string) => {
    const next = selectedLevels.includes(id)
      ? selectedLevels.filter((x) => x !== id)
      : [...selectedLevels, id];
    setSelectedLevels(next);
    sync({ levels: next });
  };
  const toggleYear = (yr: number) => {
    const next = selectedYears.includes(yr)
      ? selectedYears.filter((x) => x !== yr)
      : [...selectedYears, yr];
    setSelectedYears(next);
    sync({ years: next });
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
    setSelectedYears([]);
    setSelectedBranches([]);
    setCgpaMin(6);
    setCtcMin("");
    setCtcMax("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedLevels.length > 0 ||
    selectedYears.length > 0 ||
    selectedBranches.length > 0 ||
    (showProfileFilter && cgpaMin > 6) ||
    ctcMin !== "" ||
    ctcMax !== "";

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

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_0.8fr_1fr] gap-6">
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

        <FilterColumn label="Interview years">
          <ChipRow>
            {years.map((year) => (
              <Chip
                key={year}
                active={selectedYears.includes(year)}
                onClick={() => toggleYear(year)}
              >
                {year}
              </Chip>
            ))}
          </ChipRow>
        </FilterColumn>

        <FilterColumn label="CTC Range (LPA)">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={ctcMin}
              onChange={(e) => setCtcMin(e.target.value)}
              className="w-full text-sm px-2.5 h-9 rounded-md bg-background border border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-colors"
            />
            <span className="text-muted-foreground text-xs font-medium">to</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={ctcMax}
              onChange={(e) => setCtcMax(e.target.value)}
              className="w-full text-sm px-2.5 h-9 rounded-md bg-background border border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-colors"
            />
          </div>
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
