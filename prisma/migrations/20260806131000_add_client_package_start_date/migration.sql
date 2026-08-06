ALTER TABLE "Client"
  ADD COLUMN "packageStartDate" TIMESTAMP(3);

CREATE INDEX "Client_companyId_packageStartDate_idx"
  ON "Client"("companyId", "packageStartDate");
