ALTER TABLE "Client"
  ADD COLUMN "nhsNumber" TEXT,
  ADD COLUMN "pidNumber" TEXT;

CREATE INDEX "Client_companyId_nhsNumber_idx"
  ON "Client"("companyId", "nhsNumber");

CREATE INDEX "Client_companyId_pidNumber_idx"
  ON "Client"("companyId", "pidNumber");
