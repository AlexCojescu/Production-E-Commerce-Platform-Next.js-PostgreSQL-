-- Admin order management: cancellation, refunds, Stripe payment intent tracking
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "isRefunded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT;
