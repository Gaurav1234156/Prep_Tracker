"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createAssessmentFeedback } from "@/app/_actions/assessment-feedback";
import {
  StudentPicker,
  type StudentOption,
} from "@/components/admin/StudentPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/slug";

export function AssessmentFeedbackCreateForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [student, setStudent] = useState<StudentOption | null>(null);
  const [companyName, setCompanyName] = useState("2care.ai");
  const [companySlug, setCompanySlug] = useState("2care-ai");
  const [role, setRole] = useState("Full Stack Developer");
  const [reportUrl, setReportUrl] = useState("");
  const [reportNotes, setReportNotes] = useState("");

  function onCompanyNameChange(name: string) {
    setCompanyName(name);
    setCompanySlug(slugify(name));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!student) {
      toast.error("Select a student.");
      return;
    }

    startTransition(async () => {
      try {
        const created = await createAssessmentFeedback({
          studentUserId: student.id,
          companyName: companyName.trim(),
          companySlug: companySlug.trim() || slugify(companyName),
          role: role.trim(),
          reportUrl: reportUrl.trim(),
          reportNotes: reportNotes.trim() || null,
        });
        toast.success("Draft created. Generate AI analysis next.");
        router.push(`/admin/assessment-reports/${created.id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <Label>Student</Label>
        <StudentPicker value={student} onChange={setStudent} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companySlug">Company slug</Label>
          <Input
            id="companySlug"
            value={companySlug}
            onChange={(e) => setCompanySlug(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reportUrl">Topin report URL</Label>
        <Input
          id="reportUrl"
          type="url"
          placeholder="https://config.topin.tech/candidate-statistics/..."
          value={reportUrl}
          onChange={(e) => setReportUrl(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reportNotes">
          Report notes / scores (optional — paste if Topin page is auth-walled)
        </Label>
        <Textarea
          id="reportNotes"
          rows={5}
          value={reportNotes}
          onChange={(e) => setReportNotes(e.target.value)}
          placeholder="Scores, sections, observations…"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create draft"}
      </Button>
    </form>
  );
}
