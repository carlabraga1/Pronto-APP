-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_subcategoryId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "subcategoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "ServiceSubcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
