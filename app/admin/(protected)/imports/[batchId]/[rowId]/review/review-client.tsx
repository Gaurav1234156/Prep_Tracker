"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { InterviewWizard } from "@/components/forms/wizard/WizardShell";
import type {
  CompanyOption,
  RoleLevelOption,
  SubTopicOption,
  TopicAreaOption,
  WizardValues,
} from "@/components/forms/wizard/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { approveAndPublishRow } from "@/app/_actions/csv-import";

type Props = {
  rowId: string;
  batchId: string;
  companyName: string;
  initialValues: WizardValues;
  companies: CompanyOption[];
  topicAreas: TopicAreaOption[];
  subTopics: SubTopicOption[];
  roleLevels: RoleLevelOption[];
  unresolvedTopicAreas: string[];
  newSubTopicNames: { topicAreaName: string; subTopicName: string }[];
  tokens: number | null;
  costUsd: number | null;
  alreadyPublishedId: string | null;
};

export function ReviewClient({
  rowId,
  batchId,
  companyName,
  initialValues,
  companies,
  topicAreas,
  subTopics,
  roleLevels,
  unresolvedTopicAreas,
  newSubTopicNames,
  tokens,
  costUsd,
  alreadyPublishedId,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingResolver, setPendingResolver] = useState<{
    resolve: (proceed: boolean) => void;
  } | null>(null);

  function maybeConfirmNewSubTopics(): Promise<boolean> {
    if (newSubTopicNames.length === 0) return Promise.resolve(true);
    return new Promise((resolve) => {
      setPendingResolver({ resolve });
      setConfirmOpen(true);
    });
  }

  async function handleSubmit(values: WizardValues) {
    const ok = await maybeConfirmNewSubTopics();
    if (!ok) {
      throw new Error("Confirmation cancelled.");
    }
    return approveAndPublishRow(rowId, values);
  }

  const description = [
    tokens != null ? `${tokens.toLocaleString()} tokens` : null,
    costUsd != null ? `~$${costUsd.toFixed(3)}` : null,
    newSubTopicNames.length > 0
      ? `${newSubTopicNames.length} new sub-topic${newSubTopicNames.length === 1 ? "" : "s"} will be created`
      : null,
    unresolvedTopicAreas.length > 0
      ? `${unresolvedTopicAreas.length} unknown topic area${unresolvedTopicAreas.length === 1 ? "" : "s"} — fix before publishing`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {unresolvedTopicAreas.length > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">
              Unknown topic area{unresolvedTopicAreas.length === 1 ? "" : "s"}{" "}
              from the LLM
            </p>
            <p className="text-destructive/85">
              The LLM mentioned: {unresolvedTopicAreas.map((t) => `"${t}"`).join(", ")}.
              Open Step 3 and pick the right topic area from the dropdown.
            </p>
          </div>
        </div>
      )}

      {newSubTopicNames.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/15 dark:text-amber-200">
          <p className="font-medium mb-1">
            New sub-topics will be created on approve ({newSubTopicNames.length}):
          </p>
          <ul className="text-xs space-y-0.5 list-disc list-inside">
            {newSubTopicNames.slice(0, 12).map((n, i) => (
              <li key={i}>
                <span className="font-mono">{n.subTopicName}</span>{" "}
                <span className="text-amber-800/70 dark:text-amber-300/70">
                  in {n.topicAreaName}
                </span>
              </li>
            ))}
            {newSubTopicNames.length > 12 && (
              <li className="opacity-70">
                + {newSubTopicNames.length - 12} more…
              </li>
            )}
          </ul>
        </div>
      )}

      <InterviewWizard
        mode="import-review"
        initialValues={initialValues}
        initialStep={4}
        companies={companies}
        topicAreas={topicAreas}
        subTopics={subTopics}
        roleLevels={roleLevels}
        onSubmit={handleSubmit}
        cancelHref={`/admin/imports/${batchId}`}
        banner={{
          title: `Reviewing LLM-extracted data for ${companyName}`,
          description: alreadyPublishedId
            ? "This row has already been published. Re-approving will create another interview."
            : description ||
              "Edit anything that needs fixing, then click Approve & Publish.",
        }}
        successHrefBuilder={(id) => `/admin/interviews/${id}`}
        successToast="Approved & published."
      />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(o) => {
          if (!o && pendingResolver) {
            pendingResolver.resolve(false);
            setPendingResolver(null);
          }
          setConfirmOpen(o);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Create {newSubTopicNames.length} new sub-topic
              {newSubTopicNames.length === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The LLM suggested {newSubTopicNames.length} sub-topic
              {newSubTopicNames.length === 1 ? "" : "s"} that don&apos;t exist
              yet in their topic areas. Approving will create them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                pendingResolver?.resolve(false);
                setPendingResolver(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                pendingResolver?.resolve(true);
                setPendingResolver(null);
              }}
            >
              Yes, create &amp; publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
