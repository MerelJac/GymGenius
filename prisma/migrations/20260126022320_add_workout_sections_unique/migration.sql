/*
  Warnings:

  - Made the column `sectionId` on table `WorkoutExercise` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "WorkoutExercise" DROP CONSTRAINT "WorkoutExercise_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutExercise" DROP CONSTRAINT "WorkoutExercise_sectionId_fkey";

-- AlterTable
ALTER TABLE "WorkoutExercise" ALTER COLUMN "exerciseId" DROP NOT NULL,
ALTER COLUMN "sectionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "WorkoutSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
