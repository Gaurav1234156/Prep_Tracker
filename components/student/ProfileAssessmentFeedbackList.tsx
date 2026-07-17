import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type ProfileAssessmentFeedback = {
  id: string;
  companyName: string;
  role: string;
  summary: string | null;
  strengths: string | null;
  weaknesses: string | null;
  sentAt: Date | null;
};

export function ProfileAssessmentFeedbackList({
  items,
}: {
  items: ProfileAssessmentFeedback[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">
          Assessment feedback
        </h2>
        <p className="text-sm text-muted-foreground">
          Strengths and weaknesses from your company online assessments.
        </p>
      </header>

      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="border border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">
                {item.companyName} · {item.role}
              </CardTitle>
              <CardDescription>
                {item.sentAt
                  ? `Shared ${item.sentAt.toLocaleDateString()}`
                  : "Shared with you"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {item.summary ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Summary
                  </p>
                  <p className="whitespace-pre-wrap text-foreground">
                    {item.summary}
                  </p>
                </div>
              ) : null}
              {item.strengths ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Strengths
                  </p>
                  <p className="whitespace-pre-wrap text-foreground">
                    {item.strengths}
                  </p>
                </div>
              ) : null}
              {item.weaknesses ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Weaknesses
                  </p>
                  <p className="whitespace-pre-wrap text-foreground">
                    {item.weaknesses}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
