/*
  Warnings:

  - You are about to drop the `response_cards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `test_applications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_test_applications` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NOT_STARTED');

-- DropForeignKey
ALTER TABLE "response_cards" DROP CONSTRAINT "response_cards_cardId_fkey";

-- DropForeignKey
ALTER TABLE "response_cards" DROP CONSTRAINT "response_cards_userTestApplicationUserId_userTestApplicati_fkey";

-- DropForeignKey
ALTER TABLE "test_applications" DROP CONSTRAINT "test_applications_groupId_fkey";

-- DropForeignKey
ALTER TABLE "test_applications" DROP CONSTRAINT "test_applications_testId_fkey";

-- DropForeignKey
ALTER TABLE "user_test_applications" DROP CONSTRAINT "user_test_applications_testApplicationId_fkey";

-- DropForeignKey
ALTER TABLE "user_test_applications" DROP CONSTRAINT "user_test_applications_userId_fkey";

-- DropTable
DROP TABLE "response_cards";

-- DropTable
DROP TABLE "test_applications";

-- DropTable
DROP TABLE "user_test_applications";

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "location" TEXT,
    "scheduled_date_time" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "testId" TEXT NOT NULL,
    "groupId" TEXT,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "competenceResponse" TEXT,
    "affinityResponse" TEXT,
    "cardId" TEXT NOT NULL,
    "userApplicationUserId" TEXT NOT NULL,
    "userApplicationApplicationId" TEXT NOT NULL,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_applications" (
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "test_started_at" TIMESTAMP(3),
    "test_finished_at" TIMESTAMP(3),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'NOT_STARTED',

    CONSTRAINT "user_applications_pkey" PRIMARY KEY ("userId","applicationId")
);

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_userApplicationUserId_userApplicationApplicationId_fkey" FOREIGN KEY ("userApplicationUserId", "userApplicationApplicationId") REFERENCES "user_applications"("userId", "applicationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_applications" ADD CONSTRAINT "user_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_applications" ADD CONSTRAINT "user_applications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
