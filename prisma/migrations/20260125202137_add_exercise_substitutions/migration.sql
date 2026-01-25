-- CreateTable
CREATE TABLE "ExerciseSubstitution" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "substituteId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "ExerciseSubstitution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseSubstitution_exerciseId_substituteId_key" ON "ExerciseSubstitution"("exerciseId", "substituteId");

-- AddForeignKey
ALTER TABLE "ExerciseSubstitution" ADD CONSTRAINT "ExerciseSubstitution_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSubstitution" ADD CONSTRAINT "ExerciseSubstitution_substituteId_fkey" FOREIGN KEY ("substituteId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
