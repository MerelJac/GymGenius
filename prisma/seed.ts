import { PrismaClient, ExerciseType } from "@prisma/client"
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Optional: seed users (uncomment when needed)
  /*
  const passwordHash = await bcrypt.hash("password123", 10)

  const trainer = await prisma.user.upsert({
    where: { email: "trainer@gymgenius.dev" },
    update: {},
    create: {
      email: "trainer@gymgenius.dev",
      password: passwordHash,
      role: "TRAINER",
    },
  })

  await prisma.user.upsert({
    where: { email: "client@gymgenius.dev" },
    update: {},
    create: {
      email: "client@gymgenius.dev",
      password: passwordHash,
      role: "CLIENT",
      trainerId: trainer.id,
    },
  })
  */

  const exercises = [
    {
      name: "Barbell Back Squat",
      type: ExerciseType.STRENGTH,
      equipment: "Barbell",
      muscleGroup: "Legs",
    },
    {
      name: "Barbell Bench Press",
      type: ExerciseType.STRENGTH,
      equipment: "Barbell",
      muscleGroup: "Chest",
    },
    {
      name: "Deadlift",
      type: ExerciseType.STRENGTH,
      equipment: "Barbell",
      muscleGroup: "Posterior Chain",
    },
    {
      name: "Overhead Press",
      type: ExerciseType.STRENGTH,
      equipment: "Barbell",
      muscleGroup: "Shoulders",
    },
    {
      name: "Barbell Row",
      type: ExerciseType.STRENGTH,
      equipment: "Barbell",
      muscleGroup: "Back",
    },
    {
      name: "Dumbbell Bench Press",
      type: ExerciseType.STRENGTH,
      equipment: "Dumbbells",
      muscleGroup: "Chest",
    },
    {
      name: "Dumbbell Row",
      type: ExerciseType.STRENGTH,
      equipment: "Dumbbells",
      muscleGroup: "Back",
    },
    {
      name: "Leg Press",
      type: ExerciseType.STRENGTH,
      equipment: "Machine",
      muscleGroup: "Legs",
    },
    {
      name: "Lat Pulldown",
      type: ExerciseType.STRENGTH,
      equipment: "Cable Machine",
      muscleGroup: "Back",
    },
    {
      name: "Seated Cable Row",
      type: ExerciseType.STRENGTH,
      equipment: "Cable Machine",
      muscleGroup: "Back",
    },

    { name: "Push-Up", type: ExerciseType.BODYWEIGHT, muscleGroup: "Chest" },
    { name: "Pull-Up", type: ExerciseType.BODYWEIGHT, muscleGroup: "Back" },
    {
      name: "Bodyweight Squat",
      type: ExerciseType.BODYWEIGHT,
      muscleGroup: "Legs",
    },
    {
      name: "Walking Lunge",
      type: ExerciseType.BODYWEIGHT,
      muscleGroup: "Legs",
    },
    { name: "Plank", type: ExerciseType.BODYWEIGHT, muscleGroup: "Core" },
    {
      name: "Hanging Knee Raise",
      type: ExerciseType.BODYWEIGHT,
      muscleGroup: "Core",
    },

    {
      name: "Treadmill Run",
      type: ExerciseType.TIMED,
      equipment: "Treadmill",
      muscleGroup: "Cardio",
    },
    {
      name: "Stationary Bike",
      type: ExerciseType.TIMED,
      equipment: "Bike",
      muscleGroup: "Cardio",
    },
    {
      name: "Rowing Machine",
      type: ExerciseType.TIMED,
      equipment: "Rower",
      muscleGroup: "Full Body",
    },

    {
      name: "Kettlebell Swing",
      type: ExerciseType.HYBRID,
      equipment: "Kettlebell",
      muscleGroup: "Posterior Chain",
    },
  ];

for (const exercise of exercises) {
  const existing = await prisma.exercise.findFirst({
    where: {
      name: exercise.name,
      trainerId: null,
    },
  });

  if (!existing) {
    await prisma.exercise.create({
      data: {
        ...exercise,
        trainerId: null,
      },
    });
  }
}

  console.log("✅ Seeded default exercises");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
