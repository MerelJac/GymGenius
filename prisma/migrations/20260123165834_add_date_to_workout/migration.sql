-- CreateEnum
CREATE TYPE "WorkoutDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "WorkoutTemplate" ADD COLUMN     "day" "WorkoutDay" NOT NULL DEFAULT 'MONDAY';
