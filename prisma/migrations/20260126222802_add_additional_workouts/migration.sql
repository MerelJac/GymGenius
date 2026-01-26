-- CreateTable
CREATE TABLE "AdditionalWorkoutType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdditionalWorkoutType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdditionalWorkout" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "duration" INTEGER,
    "distance" DOUBLE PRECISION,
    "notes" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdditionalWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdditionalWorkoutType_name_key" ON "AdditionalWorkoutType"("name");

-- CreateIndex
CREATE INDEX "AdditionalWorkout_clientId_performedAt_idx" ON "AdditionalWorkout"("clientId", "performedAt");

-- AddForeignKey
ALTER TABLE "AdditionalWorkout" ADD CONSTRAINT "AdditionalWorkout_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdditionalWorkout" ADD CONSTRAINT "AdditionalWorkout_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "AdditionalWorkoutType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
