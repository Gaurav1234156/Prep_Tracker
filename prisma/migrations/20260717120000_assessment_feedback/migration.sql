-- CreateEnum
CREATE TYPE "AssessmentFeedbackStatus" AS ENUM ('DRAFT', 'SENT');

-- CreateTable
CREATE TABLE "AssessmentFeedback" (
    "id" TEXT NOT NULL,
    "studentUserId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "companySlug" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "reportUrl" TEXT NOT NULL,
    "reportNotes" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "summary" TEXT,
    "status" "AssessmentFeedbackStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssessmentFeedback_studentUserId_status_idx" ON "AssessmentFeedback"("studentUserId", "status");

-- CreateIndex
CREATE INDEX "AssessmentFeedback_status_createdAt_idx" ON "AssessmentFeedback"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AssessmentFeedback_createdById_idx" ON "AssessmentFeedback"("createdById");

-- AddForeignKey
ALTER TABLE "AssessmentFeedback" ADD CONSTRAINT "AssessmentFeedback_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentFeedback" ADD CONSTRAINT "AssessmentFeedback_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
