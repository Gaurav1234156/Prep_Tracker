-- CreateTable
CREATE TABLE "IntelligenceView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "viewDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntelligenceView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntelligenceView_userId_viewDate_idx" ON "IntelligenceView"("userId", "viewDate");

-- CreateIndex
CREATE UNIQUE INDEX "IntelligenceView_userId_companyId_viewDate_key" ON "IntelligenceView"("userId", "companyId", "viewDate");

-- AddForeignKey
ALTER TABLE "IntelligenceView" ADD CONSTRAINT "IntelligenceView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceView" ADD CONSTRAINT "IntelligenceView_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
