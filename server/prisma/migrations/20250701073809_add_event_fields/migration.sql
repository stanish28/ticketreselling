/*
  Warnings:

  - You are about to drop the column `image` on the `events` table. All the data in the column will be lost.
  - Added the required column `city` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceRange` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "bids" ADD COLUMN     "status" "BidStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "events" DROP COLUMN "image",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "priceRange" TEXT NOT NULL;
