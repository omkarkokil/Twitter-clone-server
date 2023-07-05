/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Tweet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tweet" DROP COLUMN "imageUrl",
ADD COLUMN     "imageURL" TEXT;
