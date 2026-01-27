-- CreateTable
CREATE TABLE "ExerciseOneRepMax" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "oneRepMax" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseOneRepMax_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseOneRepMax_clientId_exerciseId_recordedAt_idx" ON "ExerciseOneRepMax"("clientId", "exerciseId", "recordedAt");

-- AddForeignKey
ALTER TABLE "ExerciseOneRepMax" ADD CONSTRAINT "ExerciseOneRepMax_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseOneRepMax" ADD CONSTRAINT "ExerciseOneRepMax_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
