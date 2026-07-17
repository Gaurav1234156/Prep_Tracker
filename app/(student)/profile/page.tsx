import { AssessmentFeedbackStatus } from "@prisma/client";

import { requireUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db";
import { ProfileAssessmentFeedbackList } from "@/components/student/ProfileAssessmentFeedbackList";

import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();

  const assessmentFeedback = await prisma.assessmentFeedback.findMany({
    where: {
      studentUserId: user.id,
      status: AssessmentFeedbackStatus.SENT,
    },
    orderBy: { sentAt: "desc" },
    select: {
      id: true,
      companyName: true,
      role: true,
      summary: true,
      strengths: true,
      weaknesses: true,
      sentAt: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-base text-muted-foreground">
          Manage your account, personal details, and security.
        </p>
      </header>

      <ProfileForm
        email={user.email}
        name={user.name}
        branch={user.branch}
        gradYear={user.gradYear}
        avatarUrl={user.avatarUrl}
      />

      <ProfileAssessmentFeedbackList items={assessmentFeedback} />
    </div>
  );
}
