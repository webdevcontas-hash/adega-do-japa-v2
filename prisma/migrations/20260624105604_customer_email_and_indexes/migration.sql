-- AlterTable
ALTER TABLE "Order" ADD COLUMN "email" TEXT;

-- CreateIndex
CREATE INDEX "Order_phone_idx" ON "Order"("phone");

-- CreateIndex
CREATE INDEX "Order_email_idx" ON "Order"("email");
