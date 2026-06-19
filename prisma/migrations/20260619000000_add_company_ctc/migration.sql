-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "ctc" DOUBLE PRECISION,
ADD COLUMN     "ctcJson" JSONB;

-- CreateIndex
CREATE INDEX "Company_ctc_idx" ON "Company"("ctc");
