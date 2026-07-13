import { TrendingUp } from "lucide-react";

interface RoleFilterSummaryProps {
  lines: string[];
}

export function RoleFilterSummary({ lines }: RoleFilterSummaryProps) {
  if (lines.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-2">
      <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        What to expect
      </h2>
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
    </section>
  );
}
