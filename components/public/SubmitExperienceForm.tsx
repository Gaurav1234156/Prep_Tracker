"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, useFieldArray, type Control, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2Icon, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { submitExperience } from "@/app/_actions/experience-submission";
import {
  experienceSubmissionSchema,
  type ExperienceSubmissionInput,
} from "@/lib/validations/experience-submission";

type Meta = {
  roleLevels: { id: string; name: string }[];
  topicAreas: { id: string; name: string }[];
};

const ROUND_TYPES = [
  "ONLINE_ASSESSMENT", "TECHNICAL_1", "TECHNICAL_2", "TECHNICAL_3",
  "SYSTEM_DESIGN", "MANAGERIAL", "HR", "DIRECTOR", "BEHAVIORAL",
  "CODING_ROUND", "OTHER",
] as const;
const MODES = ["ONLINE", "OFFLINE", "ON_PAPER", "GOOGLE_DOCS", "CODING_PLATFORM", "HYBRID"] as const;
const OUTCOMES = ["CLEARED", "REJECTED", "PENDING", "NO_SHOW"] as const;
const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "CHEM", "AI_ML", "OTHER"] as const;

const label = (s: string) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const selectCls =
  "w-full text-sm px-3 h-9 rounded-md bg-background border border-input text-foreground focus:border-primary focus:ring-2 focus:ring-primary/25 outline-none transition-colors";

export function SubmitExperienceForm({ meta }: { meta: Meta }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<any>({
    resolver: zodResolver(experienceSubmissionSchema) as any,
    defaultValues: {
      companyName: "",
      role: "",
      roleLevelId: "",
      roleLevelName: "",
      year: new Date().getFullYear(),
      candidateBranch: undefined,
      candidateCgpa: undefined,
      candidateGradYear: undefined,
      candidateBackground: "",
      biggestTip: "",
      rounds: [emptyRound()],
    },
  });

  const { register, control, handleSubmit, watch } = form;
  const errors: any = form.formState.errors;
  const rounds = useFieldArray({ control, name: "rounds" });
  const roleLevelId = watch("roleLevelId");

  const onSubmit = (values: ExperienceSubmissionInput) => {
    startTransition(async () => {
      try {
        await submitExperience(values);
        toast.success("Experience submitted! An admin will review it before it goes live.");
        router.push("/dashboard");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Submission failed. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basics */}
      <Section title="About the interview" description="Which company, role, and year.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Company" error={errors.companyName?.message}>
            <Input placeholder="e.g. Google" {...register("companyName")} />
          </Field>
          <Field label="Role" error={errors.role?.message}>
            <Input placeholder="e.g. Software Development Engineer" {...register("role")} />
          </Field>
          <Field label="Role level" error={errors.roleLevelId?.message}>
            <select className={selectCls} {...register("roleLevelId")}>
              <option value="">Select a level…</option>
              {meta.roleLevels.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
              <option value="__new__">+ Add a new level…</option>
            </select>
          </Field>
          {roleLevelId === "__new__" ? (
            <Field label="New role level name" error={errors.roleLevelName?.message}>
              <Input placeholder="e.g. SDE-2" {...register("roleLevelName")} />
            </Field>
          ) : (
            <Field label="Interview year" error={errors.year?.message}>
              <Input type="number" min={2000} {...register("year")} />
            </Field>
          )}
          {roleLevelId === "__new__" && (
            <Field label="Interview year" error={errors.year?.message}>
              <Input type="number" min={2000} {...register("year")} />
            </Field>
          )}
        </div>
      </Section>

      {/* Candidate profile (optional) */}
      <Section title="Your profile" description="Optional — helps others filter by background.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="Branch">
            <select className={selectCls} {...register("candidateBranch")}>
              <option value="">— Prefer not to say —</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>{label(b)}</option>
              ))}
            </select>
          </Field>
          <Field label="CGPA">
            <Input type="number" step="0.01" min={0} max={10} placeholder="e.g. 8.4" {...register("candidateCgpa")} />
          </Field>
          <Field label="Graduation year">
            <Input type="number" min={2000} placeholder="e.g. 2026" {...register("candidateGradYear")} />
          </Field>
        </div>
        <Field label="Background (optional)">
          <Textarea rows={2} placeholder="A line about your prep or background." {...register("candidateBackground")} />
        </Field>
      </Section>

      {/* Rounds */}
      <Section
        title="Interview rounds"
        description="Add each round and the questions you were asked."
      >
        <div className="space-y-5">
          {rounds.fields.map((field, index) => (
            <RoundCard
              key={field.id}
              index={index}
              control={control}
              register={register}
              errors={errors}
              meta={meta}
              onRemove={rounds.fields.length > 1 ? () => rounds.remove(index) : undefined}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => rounds.append(emptyRound())}
          className="mt-4"
        >
          <Plus className="size-4" /> Add another round
        </Button>
      </Section>

      {/* Tip */}
      <Section title="Biggest tip" description="One thing you'd tell the next candidate.">
        <Textarea rows={3} placeholder="e.g. Practice system design out loud." {...register("biggestTip")} />
      </Section>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <p className="text-xs text-muted-foreground">
          Your submission is reviewed by an admin before it appears publicly.
        </p>
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <><Loader2Icon className="size-4 animate-spin" /> Submitting…</>
          ) : (
            <><Send className="size-4" /> Submit for review</>
          )}
        </Button>
      </div>
    </form>
  );
}

function RoundCard({
  index,
  control,
  register,
  errors,
  meta,
  onRemove,
}: {
  index: number;
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: any;
  meta: Meta;
  onRemove?: () => void;
}) {
  const questions = useFieldArray({ control, name: `rounds.${index}.questions` as const });
  const roundErr = errors.rounds?.[index];

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Round {index + 1}</h4>
        {onRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
            <Trash2 className="size-3.5" /> Remove
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Round name" error={roundErr?.roundName?.message}>
          <Input placeholder="e.g. Technical Round 1" {...register(`rounds.${index}.roundName`)} />
        </Field>
        <Field label="Round type">
          <select className={selectCls} {...register(`rounds.${index}.roundType`)}>
            {ROUND_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
          </select>
        </Field>
        <Field label="Mode">
          <select className={selectCls} {...register(`rounds.${index}.mode`)}>
            {MODES.map((m) => <option key={m} value={m}>{label(m)}</option>)}
          </select>
        </Field>
        <Field label="Outcome">
          <select className={selectCls} {...register(`rounds.${index}.outcome`)}>
            {OUTCOMES.map((o) => <option key={o} value={o}>{label(o)}</option>)}
          </select>
        </Field>
        <Field label="Main topic area" error={roundErr?.topicAreaId?.message}>
          <select className={selectCls} {...register(`rounds.${index}.topicAreaId`)}>
            <option value="">Select a topic area…</option>
            {meta.topicAreas.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Duration (minutes)">
          <Input type="number" min={0} placeholder="e.g. 60" {...register(`rounds.${index}.durationMinutes`)} />
        </Field>
      </div>

      <Field label="Key learnings (optional)">
        <Textarea rows={2} placeholder="What worked, what to watch out for." {...register(`rounds.${index}.keyLearnings`)} />
      </Field>

      {/* Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Questions asked</Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => questions.append({ subTopicName: "", questionText: "" })}>
            <Plus className="size-3.5" /> Add question
          </Button>
        </div>
        {typeof roundErr?.questions?.message === "string" && (
          <p className="text-xs text-destructive">{roundErr.questions.message}</p>
        )}
        <div className="space-y-3">
          {questions.fields.map((q, qi) => {
            const qErr = roundErr?.questions?.[qi];
            return (
              <div key={q.id} className="rounded-md border border-border bg-background p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    className="max-w-xs"
                    placeholder="Concept, e.g. Dynamic Programming"
                    {...register(`rounds.${index}.questions.${qi}.subTopicName`)}
                  />
                  {questions.fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => questions.remove(qi)} className="text-destructive hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
                {qErr?.subTopicName?.message && (
                  <p className="text-xs text-destructive">{qErr.subTopicName.message}</p>
                )}
                <Textarea
                  rows={2}
                  placeholder="The question that was asked (markdown supported)."
                  {...register(`rounds.${index}.questions.${qi}.questionText`)}
                />
                {qErr?.questionText?.message && (
                  <p className="text-xs text-destructive">{qErr.questionText.message}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function emptyRound() {
  return {
    roundName: "",
    roundType: "TECHNICAL_1",
    mode: "ONLINE",
    outcome: "CLEARED",
    durationMinutes: undefined,
    topicAreaId: "",
    keyLearnings: "",
    questions: [{ subTopicName: "", questionText: "" }],
  };
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="space-y-0.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5")}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
