-- CreateEnum
CREATE TYPE "Branch" AS ENUM ('CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'CHEM', 'AI_ML', 'OTHER');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('QUEUED', 'EXTRACTING', 'READY_FOR_REVIEW', 'APPROVED', 'PUBLISHED', 'FAILED');

-- DropIndex
DROP INDEX "idx_company_name_trgm";

-- DropIndex
DROP INDEX "idx_interview_role_trgm";

-- DropIndex
DROP INDEX "idx_subtopic_name_trgm";

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "candidateBackground" TEXT,
ADD COLUMN     "candidateBranch" "Branch",
ADD COLUMN     "candidateCgpa" DOUBLE PRECISION,
ADD COLUMN     "candidateGradYear" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "branch" "Branch",
ADD COLUMN     "gradYear" INTEGER,
ADD COLUMN     "onboardedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportRow" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'QUEUED',
    "rawCsvJson" JSONB NOT NULL,
    "extractedJson" JSONB,
    "extractionTokens" INTEGER,
    "extractionCostUsd" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "publishedInterviewId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportBatch_uploadedById_createdAt_idx" ON "ImportBatch"("uploadedById", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImportRow_publishedInterviewId_key" ON "ImportRow"("publishedInterviewId");

-- CreateIndex
CREATE INDEX "ImportRow_batchId_status_idx" ON "ImportRow"("batchId", "status");

-- CreateIndex
CREATE INDEX "ImportRow_status_idx" ON "ImportRow"("status");

-- CreateIndex
CREATE INDEX "Interview_candidateBranch_idx" ON "Interview"("candidateBranch");

-- AddForeignKey
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportRow" ADD CONSTRAINT "ImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportRow" ADD CONSTRAINT "ImportRow_publishedInterviewId_fkey" FOREIGN KEY ("publishedInterviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
