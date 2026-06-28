-- Product inventory & pricing fields for admin analytics
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "dateBought" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "dateSold" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "soldPrice" DOUBLE PRECISION;

-- Migrate priceObtained -> acquiredPrice when present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Product' AND column_name = 'priceObtained'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Product' AND column_name = 'acquiredPrice'
  ) THEN
    ALTER TABLE "Product" RENAME COLUMN "priceObtained" TO "acquiredPrice";
  END IF;
END $$;

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "acquiredPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE "Product" SET "dateBought" = "createdAt" WHERE "dateBought" IS NULL;
UPDATE "Product" SET "acquiredPrice" = COALESCE("acquiredPrice", 0);
