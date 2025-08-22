/*
  Warnings:

  - You are about to drop the column `end_time` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_date_time` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `applications` table. All the data in the column will be lost.
  - Added the required column `available_from` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "end_time",
DROP COLUMN "scheduled_date_time",
DROP COLUMN "start_time",
ADD COLUMN     "available_from" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "available_until" TIMESTAMP(3),
ADD COLUMN     "duration_in_minutes" INTEGER,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "cards" ALTER COLUMN "inUse" SET DEFAULT false;
