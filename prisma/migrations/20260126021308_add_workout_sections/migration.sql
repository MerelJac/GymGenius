/*
  Warnings:

  - You are about to drop the column `workoutId` on the `WorkoutExercise` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkoutExercise" DROP CONSTRAINT "WorkoutExercise_workoutId_fkey";

-- AlterTable
ALTER TABLE "WorkoutExercise" DROP COLUMN "workoutId",
ADD COLUMN     "sectionId" TEXT,
ADD COLUMN     "workoutTemplateId" TEXT;

-- CreateTable
CREATE TABLE "WorkoutSection" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "WorkoutSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSection_workoutId_order_key" ON "WorkoutSection"("workoutId", "order");

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "WorkoutSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutTemplateId_fkey" FOREIGN KEY ("workoutTemplateId") REFERENCES "WorkoutTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSection" ADD CONSTRAINT "WorkoutSection_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "WorkoutTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
