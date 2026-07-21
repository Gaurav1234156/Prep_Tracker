import {
  Building2,
  Cpu,
  FileText,
  GraduationCap,
  Layers,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  humanizeRoundType,
  type FilteredRoleIntelligence,
} from "@/lib/queries/filtered-role-intelligence";

interface RoleFilterSummaryProps {
  intelligence: FilteredRoleIntelligence;
  lines: string[];
}

function formatRoleSubtitle(names: string[]): string {
  if (names.length === 0) return "selected roles";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function RoleFilterSummary({
  intelligence,
  lines,
}: RoleFilterSummaryProps) {
  const {
    roleNames,
    ctcLabel,
    interviewCount,
    companyCount,
    avgCgpa,
    avgRoundCount,
    topicDistribution,
    roundTypeDistribution,
    topTechStacks,
    difficultyBreakdown,
  } = intelligence;

  const totalDifficulty =
    difficultyBreakdown.easy +
    difficultyBreakdown.medium +
    difficultyBreakdown.hard;

  const maxTopicCount =
    topicDistribution.length > 0
      ? Math.max(...topicDistribution.map((t) => t.count))
      : 0;

  const subtitleParts = [
    formatRoleSubtitle(roleNames),
    ctcLabel ? `${ctcLabel} band` : null,
  ].filter(Boolean);

  const hasStats =
    interviewCount > 0 ||
    companyCount > 0 ||
    avgCgpa != null ||
    avgRoundCount != null;

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6 shadow-sm space-y-5">
      <div className="space-y-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          What to expect
        </h2>
        <p className="text-xs text-muted-foreground">
          Aggregated from candidate experiences for {subtitleParts.join(" · ")}.
        </p>
      </div>

      {lines.length > 0 && (
        <div className="space-y-1">
          {lines.map((line) => (
            <p
              key={line}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {hasStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {interviewCount > 0 && (
            <div className="rounded-md border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <FileText className="h-3 w-3" />
                Experiences
              </div>
              <p className="text-sm font-bold text-foreground">
                {interviewCount}
              </p>
            </div>
          )}
          {companyCount > 0 && (
            <div className="rounded-md border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <Building2 className="h-3 w-3" />
                Companies
              </div>
              <p className="text-sm font-bold text-foreground">
                {companyCount}
              </p>
            </div>
          )}
          {avgCgpa != null && (
            <div className="rounded-md border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <GraduationCap className="h-3 w-3" />
                Avg CGPA
              </div>
              <p className="text-sm font-bold text-foreground">
                ~{avgCgpa.toFixed(1)}
              </p>
            </div>
          )}
          {avgRoundCount != null && (
            <div className="rounded-md border border-border bg-secondary/30 p-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                <Layers className="h-3 w-3" />
                Typical rounds
              </div>
              <p className="text-sm font-bold text-foreground">
                ~{avgRoundCount}
              </p>
            </div>
          )}
        </div>
      )}

      {topicDistribution.length > 0 && maxTopicCount > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Focus areas
          </h3>
          <div className="space-y-2">
            {topicDistribution.map((topic) => (
              <div key={topic.name} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-foreground truncate">
                    {topic.name}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {topic.count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/80"
                    style={{
                      width: `${(topic.count / maxTopicCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalDifficulty > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Question difficulty mix
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
            <span className="text-emerald-600">
              Easy {difficultyBreakdown.easy}
            </span>
            <span className="text-amber-600">
              Medium {difficultyBreakdown.medium}
            </span>
            <span className="text-rose-600">
              Hard {difficultyBreakdown.hard}
            </span>
          </div>
        </div>
      )}

      {roundTypeDistribution.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-3 w-3" />
            Common round types
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {roundTypeDistribution.map((round) => (
              <Badge key={round.type} variant="secondary">
                {humanizeRoundType(round.type)}
                <span className="ml-1 text-muted-foreground">
                  ({round.count})
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {topTechStacks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Cpu className="h-3 w-3" />
            Common tech stacks
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {topTechStacks.map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="text-primary border-primary/20"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
