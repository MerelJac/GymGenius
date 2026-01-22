-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TRAINER', 'CLIENT');

-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('STRENGTH', 'TIMED', 'HYBRID', 'BODYWEIGHT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trainerId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "dob" TIMESTAMP(3),
    "experience" TEXT,
    "injuryNotes" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "equipment" TEXT,
    "muscleGroup" TEXT,
    "videoUrl" TEXT,
    "notes" TEXT,
    "trainerId" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutTemplate" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "prescribed" JSONB NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledWorkout" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "WorkoutStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "ScheduledWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "scheduledId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "notes" TEXT,
    "status" "WorkoutStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseLog" (
    "id" TEXT NOT NULL,
    "workoutLogId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "prescribed" JSONB NOT NULL,
    "performed" JSONB NOT NULL,
    "substitutedFrom" TEXT,
    "substitutionReason" TEXT,

    CONSTRAINT "ExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditHistory" (
    "id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "editedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "before" JSONB NOT NULL,
    "after" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "workoutLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutTemplate" ADD CONSTRAINT "WorkoutTemplate_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "WorkoutTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "WorkoutTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_scheduledId_fkey" FOREIGN KEY ("scheduledId") REFERENCES "ScheduledWorkout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
