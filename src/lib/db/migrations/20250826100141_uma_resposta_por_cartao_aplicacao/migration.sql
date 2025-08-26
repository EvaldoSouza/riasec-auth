/*
  Warnings:

  - A unique constraint covering the columns `[userApplicationUserId,userApplicationApplicationId,cardId]` on the table `answers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "answers_userApplicationUserId_userApplicationApplicationId__key" ON "answers"("userApplicationUserId", "userApplicationApplicationId", "cardId");
