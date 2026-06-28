-- Track acquisition cost per product for profit analytics
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "priceObtained" DOUBLE PRECISION;
