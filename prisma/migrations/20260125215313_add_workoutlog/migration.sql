/*
  Warnings:

  - Made the column `scheduledId` on table `WorkoutLog` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "WorkoutLog" DROP CONSTRAINT "WorkoutLog_scheduledId_fkey";

-- AlterTable
ALTER TABLE "WorkoutLog" ALTER COLUMN "scheduledId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_scheduledId_fkey" FOREIGN KEY ("scheduledId") REFERENCES "ScheduledWorkout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
