-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN "ctcMin" DOUBLE PRECISION,
ADD COLUMN "ctcMax" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "externalJobId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "techStack" TEXT,
    "optionalSkills" TEXT,
    "ctcMin" DOUBLE PRECISION,
    "ctcMax" DOUBLE PRECISION,
    "openings" INTEGER,
    "location" TEXT,
    "jobType" TEXT,
    "product" TEXT,
    "hubspotUrl" TEXT,
    "sourceCategory" TEXT,
    "enteredBy" TEXT,
    "enteredAt" TIMESTAMP(3),
    "interviewProcess" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN "jobId" TEXT,
ADD COLUMN "sourceCategory" TEXT,
ADD COLUMN "externalSource" TEXT,
ADD COLUMN "interviewProcess" TEXT;

-- AlterTable
ALTER TABLE "Round" ADD COLUMN "assessmentPattern" TEXT,
ADD COLUMN "pocRemarks" TEXT,
ADD COLUMN "recordingUrl" TEXT,
ADD COLUMN "transcriptUrl" TEXT;

-- AlterTable
ALTER TABLE "SubTopicEntry" ADD COLUMN "externalQuestionId" TEXT,
ADD COLUMN "questionType" TEXT,
ADD COLUMN "difficulty" "Difficulty",
ADD COLUMN "skillsAssessed" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Job_externalJobId_key" ON "Job"("externalJobId");

-- CreateIndex
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");

-- CreateIndex
CREATE INDEX "Job_role_idx" ON "Job"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_jobId_key" ON "Interview"("jobId");

-- CreateIndex
CREATE INDEX "Interview_jobId_idx" ON "Interview"("jobId");

-- CreateIndex
CREATE UNIQUE INDEX "SubTopicEntry_externalQuestionId_key" ON "SubTopicEntry"("externalQuestionId");

-- CreateIndex
CREATE INDEX "SubTopicEntry_difficulty_idx" ON "SubTopicEntry"("difficulty");

-- CreateIndex
CREATE INDEX "Company_ctcMin_idx" ON "Company"("ctcMin");

-- CreateIndex
CREATE INDEX "Company_ctcMax_idx" ON "Company"("ctcMax");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
