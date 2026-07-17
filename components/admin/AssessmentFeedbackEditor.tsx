"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

import {
  generateAssessmentAnalysis,
  sendAssessmentFeedback,
  updateAssessmentFeedback,
} from "@/app/_actions/assessment-feedback";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AssessmentFeedbackEditorProps {
  id: string;
  reportUrl: string;
  initialNotes: string | null;
  initialStrengths: string | null;
  initialWeaknesses: string | null;
  initialSummary: string | null;
  status: "DRAFT" | "SENT";
}

export function AssessmentFeedbackEditor({
  id,
  reportUrl,
  initialNotes,
  initialStrengths,
  initialWeaknesses,
  initialSummary,
  status,
}: AssessmentFeedbackEditorProps) {
  const router = useRouter();
  const sent = status === "SENT";
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [strengths, setStrengths] = useState(initialStrengths ?? "");
  const [weaknesses, setWeaknesses] = useState(initialWeaknesses ?? "");
  const [summary, setSummary] = useState(initialSummary ?? "");
  const [pending, startTransition] = useTransition();

  function saveDraft() {
    startTransition(async () => {
      try {
        await updateAssessmentFeedback({
          id,
          reportNotes: notes,
          strengths,
          weaknesses,
          summary,
        });
        toast.success("Saved.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Save failed.");
      }
    });
  }

  function runAi() {
    startTransition(async () => {
      try {
        if (notes !== (initialNotes ?? "")) {
          await updateAssessmentFeedback({ id, reportNotes: notes });
        }
        const result = await generateAssessmentAnalysis(id);
        setStrengths(result.strengths ?? "");
        setWeaknesses(result.weaknesses ?? "");
        setSummary(result.summary ?? "");
        toast.success("AI analysis generated.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "AI failed.");
      }
    });
  }

  function send() {
    startTransition(async () => {
      try {
        await updateAssessmentFeedback({
          id,
          reportNotes: notes,
          strengths,
          weaknesses,
          summary,
        });
        await sendAssessmentFeedback(id);
        toast.success("Sent to student profile.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Send failed.");
      }
    });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <a
          href={reportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Open Topin report
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Report notes / scores</Label>
        <Textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={sent || pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          disabled={sent || pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="strengths">Strengths</Label>
        <Textarea
          id="strengths"
          rows={5}
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          disabled={sent || pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="weaknesses">Weaknesses</Label>
        <Textarea
          id="weaknesses"
          rows={5}
          value={weaknesses}
          onChange={(e) => setWeaknesses(e.target.value)}
          disabled={sent || pending}
        />
      </div>

      {!sent ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled={pending} onClick={runAi}>
            {pending ? "Working…" : "Generate AI analysis"}
          </Button>
          <Button type="button" variant="outline" disabled={pending} onClick={saveDraft}>
            Save draft
          </Button>
          <Button type="button" disabled={pending} onClick={send}>
            Send to student
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          This feedback has been sent to the student&apos;s profile.
        </p>
      )}
    </div>
  );
}
