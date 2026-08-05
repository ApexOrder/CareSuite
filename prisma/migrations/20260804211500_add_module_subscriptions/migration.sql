DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionTier') THEN
    CREATE TYPE "SubscriptionTier" AS ENUM ('CORE', 'PROFESSIONAL', 'CLINICAL', 'ENTERPRISE');
  END IF;
END $$;

ALTER TABLE "Company"
  ADD COLUMN IF NOT EXISTS "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'CORE';

CREATE TABLE IF NOT EXISTS "CompanyModule" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "companyId" TEXT NOT NULL,
  "moduleKey" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL,
  "reason" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompanyModule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CompanyModule_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CompanyModule_companyId_moduleKey_key"
  ON "CompanyModule"("companyId", "moduleKey");

CREATE INDEX IF NOT EXISTS "CompanyModule_companyId_idx"
  ON "CompanyModule"("companyId");

UPDATE "Company"
SET "subscriptionTier" = 'CLINICAL'
WHERE "subscriptionStatus" = 'TRIAL';
