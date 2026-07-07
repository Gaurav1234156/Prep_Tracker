-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

-- CreateTable
CREATE TABLE "ExperienceSubmission" (
    "id" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedInterviewId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExperienceSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExperienceSubmission_status_createdAt_idx" ON "ExperienceSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ExperienceSubmission_submittedById_idx" ON "ExperienceSubmission"("submittedById");

-- AddForeignKey
ALTER TABLE "ExperienceSubmission" ADD CONSTRAINT "ExperienceSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
