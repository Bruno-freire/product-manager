/*
  Warnings:

  - You are about to drop the column `productName` on the `product` table. All the data in the column will be lost.
  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `productName`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    MODIFY `entryDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
