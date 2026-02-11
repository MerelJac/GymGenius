/*
  Warnings:

  - A unique constraint covering the columns `[workoutLogId,exerciseId]` on the table `ExerciseLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExerciseLog_workoutLogId_exerciseId_key" ON "ExerciseLog"("workoutLogId", "exerciseId");
