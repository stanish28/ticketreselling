-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('SEATED', 'STANDING');

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "ticketType" "TicketType" DEFAULT 'SEATED';
