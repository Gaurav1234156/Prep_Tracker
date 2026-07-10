import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Cpu,
  MapPin,
  TrendingUp,
  IndianRupee,
  Layers,
} from "lucide-react";
import type { CompanyIntelligence } from "@/lib/queries/company-intelligence";

interface CompanyIntelligencePanelProps {
  intelligence: CompanyIntelligence;
  companyName: string;
}

export function CompanyIntelligencePanel({
  intelligence,
  companyName,
}: CompanyIntelligencePanelProps) {
  const {
    jobCount,
    roles,
    techStacks,
    locations,
    ctcMin,
    ctcMax,
    totalOpenings,
    jobTypes,
    difficultyBreakdown,
    roundTypes,
  } = intelligence;

  const totalDifficulty =
    difficultyBreakdown.easy +
    difficultyBreakdown.medium +
    difficultyBreakdown.hard;

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6 shadow-sm space-y-6">
      <div className="space-y-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Hiring Intelligence
        </h2>
        <p className="text-xs text-muted-foreground">
          Aggregated interview data for {companyName} from verified hiring
          intelligence records ({jobCount} active role{jobCount === 1 ? "" : "s"}).
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(ctcMin != null || ctcMax != null) && (
          <div className="rounded-md border border-border bg-secondary/30 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              <IndianRupee className="h-3 w-3" />
              CTC Range
            </div>
            <p className="text-sm font-bold text-foreground">
              {ctcMin != null && ctcMax != null && ctcMin !== ctcMax
                ? `${ctcMin}–${ctcMax} LPA`
                : `${ctcMin ?? ctcMax} LPA`}
            </p>
          </div>
        )}
        {totalOpenings > 0 && (
          <div className="rounded-md border border-border bg-secondary/30 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              <Briefcase className="h-3 w-3" />
              Openings
            </div>
            <p className="text-sm font-bold text-foreground">{totalOpenings}</p>
          </div>
        )}
        {locations.length > 0 && (
          <div className="rounded-md border border-border bg-secondary/30 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              Locations
            </div>
            <p className="text-sm font-bold text-foreground line-clamp-2">
              {locations.slice(0, 3).join(", ")}
              {locations.length > 3 ? ` +${locations.length - 3}` : ""}
            </p>
          </div>
        )}
        {roundTypes.length > 0 && (
          <div className="rounded-md border border-border bg-secondary/30 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              <Layers className="h-3 w-3" />
              Round Types
            </div>
            <p className="text-sm font-bold text-foreground">
              {roundTypes.length} types
            </p>
          </div>
        )}
      </div>

      {roles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Roles Hiring
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {roles.slice(0, 8).map((role) => (
              <Badge key={role} variant="secondary">
                {role}
              </Badge>
            ))}
            {roles.length > 8 ? (
              <Badge variant="outline">+{roles.length - 8} more</Badge>
            ) : null}
          </div>
        </div>
      )}

      {techStacks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Cpu className="h-3 w-3" />
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {techStacks.slice(0, 12).map((tech) => (
              <Badge key={tech} variant="outline" className="text-primary border-primary/20">
                {tech}
              </Badge>
            ))}
            {techStacks.length > 12 ? (
              <Badge variant="outline">+{techStacks.length - 12}</Badge>
            ) : null}
          </div>
        </div>
      )}

      {jobTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {jobTypes.map((jt) => (
            <Badge key={jt} variant="secondary" className="text-[10px]">
              {jt}
            </Badge>
          ))}
        </div>
      )}

      {totalDifficulty > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Question Difficulty Mix
          </h3>
          <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
            {difficultyBreakdown.easy > 0 && (
              <div
                className="bg-emerald-500"
                style={{
                  width: `${(difficultyBreakdown.easy / totalDifficulty) * 100}%`,
                }}
                title={`Easy: ${difficultyBreakdown.easy}`}
              />
            )}
            {difficultyBreakdown.medium > 0 && (
              <div
                className="bg-amber-500"
                style={{
                  width: `${(difficultyBreakdown.medium / totalDifficulty) * 100}%`,
                }}
                title={`Medium: ${difficultyBreakdown.medium}`}
              />
            )}
            {difficultyBreakdown.hard > 0 && (
              <div
                className="bg-rose-500"
                style={{
                  width: `${(difficultyBreakdown.hard / totalDifficulty) * 100}%`,
                }}
                title={`Hard: ${difficultyBreakdown.hard}`}
              />
            )}
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-muted-foreground">
            <span className="text-emerald-600">Easy {difficultyBreakdown.easy}</span>
            <span className="text-amber-600">Medium {difficultyBreakdown.medium}</span>
            <span className="text-rose-600">Hard {difficultyBreakdown.hard}</span>
          </div>
        </div>
      )}
    </section>
  );
}
