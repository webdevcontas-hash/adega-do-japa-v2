-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "neighborhood" TEXT,
    "cep" TEXT,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "couponCode" TEXT,
    "couponDiscount" REAL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'pix',
    "changeFor" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "deliveryStatus" TEXT NOT NULL DEFAULT 'WAITING',
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "pixId" TEXT,
    "qrCode" TEXT,
    "qrCodeBase64" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("accepted", "address", "cep", "couponCode", "couponDiscount", "createdAt", "customerName", "deliveryFee", "deliveryStatus", "email", "id", "neighborhood", "phone", "pixId", "qrCode", "qrCodeBase64", "status", "total", "updatedAt") SELECT "accepted", "address", "cep", "couponCode", "couponDiscount", "createdAt", "customerName", "deliveryFee", "deliveryStatus", "email", "id", "neighborhood", "phone", "pixId", "qrCode", "qrCodeBase64", "status", "total", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE INDEX "Order_phone_idx" ON "Order"("phone");
CREATE INDEX "Order_email_idx" ON "Order"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
