/*
  Warnings:

  - A unique constraint covering the columns `[scheduledId]` on the table `WorkoutLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorkoutLog_scheduledId_key" ON "WorkoutLog"("scheduledId");
