"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  publishSubmission,
  rejectSubmission,
} from "@/app/_actions/experience-submission";

export function SubmissionReviewActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [notes, setNotes] = useState("");

  const publish = () =>
    startTransition(async () => {
      try {
        const { interviewId } = await publishSubmission(id);
        toast.success("Published to the live catalog.");
        router.push(`/experiences/${interviewId}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Publish failed.");
      }
    });

  const reject = () =>
    startTransition(async () => {
      try {
        await rejectSubmission(id, notes);
        toast.success("Submission rejected.");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Reject failed.");
      }
    });

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">Review decision</h2>
        <p className="text-xs text-muted-foreground">
          Approving creates the public interview experience immediately.
        </p>
      </div>

      {!rejecting ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={publish} disabled={pending}>
            {pending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Approve &amp; publish
          </Button>
          <Button
            variant="outline"
            onClick={() => setRejecting(true)}
            disabled={pending}
          >
            <XCircle className="size-4" /> Reject
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Feedback for the candidate (optional)."
          />
          <div className="flex gap-3">
            <Button variant="destructive" onClick={reject} disabled={pending}>
              {pending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : null}
              Confirm reject
            </Button>
            <Button
              variant="ghost"
              onClick={() => setRejecting(false)}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
