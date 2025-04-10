/*
  Warnings:

  - You are about to drop the `listproduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `products` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `listproduct` DROP FOREIGN KEY `ListProduct_listId_fkey`;

-- DropForeignKey
ALTER TABLE `listproduct` DROP FOREIGN KEY `ListProduct_productId_fkey`;

-- AlterTable
ALTER TABLE `list` ADD COLUMN `products` JSON NOT NULL;

-- DropTable
DROP TABLE `listproduct`;

-- DropTable
DROP TABLE `product`;
