/*
  Warnings:

  - Added the required column `address` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `amount` VARCHAR(191) NOT NULL;
