/*
  Warnings:

  - You are about to drop the column `rawContent` on the `lista` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `Produto` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `lista` DROP COLUMN `rawContent`;

-- CreateTable
CREATE TABLE `ListaProduto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `listaId` INTEGER NOT NULL,
    `produtoId` INTEGER NOT NULL,

    UNIQUE INDEX `ListaProduto_listaId_produtoId_key`(`listaId`, `produtoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Produto_codigo_key` ON `Produto`(`codigo`);

-- AddForeignKey
ALTER TABLE `ListaProduto` ADD CONSTRAINT `ListaProduto_listaId_fkey` FOREIGN KEY (`listaId`) REFERENCES `Lista`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ListaProduto` ADD CONSTRAINT `ListaProduto_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
