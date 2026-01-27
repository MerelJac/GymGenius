// prisma/seed/exercises.ts
import { PrismaClient, ExerciseType } from "@prisma/client"
import { PrismaPg } from '@prisma/adapter-pg';

// RUN: npx prisma db seed
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });


export async function seedProgramExercises() {
  const exercises = [
    // -----------------
    // WARM UPS / MOBILITY
    // -----------------
    {
      name: "Band Pull-Aparts",
      type: ExerciseType.MOBILITY,
      equipment: "Resistance Band",
      muscleGroup: "Upper Back / Shoulders",
      videoUrl: "https://www.youtube.com/shorts/SuvO4TBwSu4",
      notes: "Palms up",
    },
    {
      name: "Scapular Retractions",
      type: ExerciseType.MOBILITY,
      equipment: "Band or Cable",
      muscleGroup: "Upper Back",
      videoUrl: "https://www.youtube.com/shorts/PE_G9qoTAjwon",
    },
    {
      name: "Wrist CARs",
      type: ExerciseType.MOBILITY,
      equipment: "None",
      muscleGroup: "Wrists",
      videoUrl: "https://www.youtube.com/watch?v=DuolRCJ3wWs",
    },
    {
      name: "Serratus Wall Slides",
      type: ExerciseType.MOBILITY,
      equipment: "Wall",
      muscleGroup: "Shoulders",
      videoUrl: "https://www.youtube.com/watch?v=WIdjSjzNS2A",
    },
    {
      name: "Terminal Knee Extensions",
      type: ExerciseType.MOBILITY,
      equipment: "Band",
      muscleGroup: "Quads",
      videoUrl: "https://www.youtube.com/shorts/CU7Fn11YMTw",
    },

    // -----------------
    // LOWER BODY
    // -----------------
    {
      name: "Heels Elevated Goblet Squat",
      type: ExerciseType.STRENGTH,
      equipment: "Dumbbell",
      muscleGroup: "Quads / Glutes",
      videoUrl: "https://www.youtube.com/watch?v=3dLIa1YljLs",
    },
    {
      name: "Smith Machine Sumo Squat",
      type: ExerciseType.STRENGTH,
      equipment: "Smith Machine",
      muscleGroup: "Glutes / Inner Thighs",
      videoUrl: "https://www.youtube.com/shorts/3_JDEct1Uds",
    },
    {
      name: "Dumbbell Romanian Deadlift",
      type: ExerciseType.STRENGTH,
      equipment: "Dumbbells",
      muscleGroup: "Hamstrings / Glutes",
      videoUrl: "https://www.youtube.com/shorts/_TchJLlBO-4",
    },
    {
      name: "Bulgarian Split Squat",
      type: ExerciseType.STRENGTH,
      equipment: "Dumbbells",
      muscleGroup: "Glutes / Quads",
      videoUrl: "https://www.youtube.com/shorts/J1PEjNVe7po",
    },
    {
      name: "Step Ups",
      type: ExerciseType.STRENGTH,
      equipment: "Bench",
      muscleGroup: "Glutes / Quads",
      videoUrl: "https://www.youtube.com/shorts/S9uzCELLo_0",
    },
    {
      name: "Dumbbell Side Lunges",
      type: ExerciseType.STRENGTH,
      equipment: "Dumbbells",
      muscleGroup: "Inner Thighs / Glutes",
    },

    // -----------------
    // UPPER BODY
    // -----------------
    {
      name: "Machine Chest Press",
      type: ExerciseType.STRENGTH,
      equipment: "Machine",
      muscleGroup: "Chest",
      videoUrl: "https://www.youtube.com/shorts/UH6y0fhbw8w",
    },
    {
      name: "Lying Dumbbell Chest Press",
      type: ExerciseType.STRENGTH,
      equipment: "Dumbbells",
      muscleGroup: "Chest",
      videoUrl: "https://www.youtube.com/shorts/o7TvO377OqA",
    },
    {
      name: "Single Arm Cable Row",
      type: ExerciseType.STRENGTH,
      equipment: "Cable",
      muscleGroup: "Back",
      videoUrl: "https://www.youtube.com/shorts/KFD5ww73cdc",
    },
    {
      name: "Seated Cable Row",
      type: ExerciseType.STRENGTH,
      equipment: "Cable",
      muscleGroup: "Back",
      videoUrl: "https://www.youtube.com/shorts/DHA7QGDa2qg",
    },
    {
      name: "Cable Straight Arm Lat Pulldown",
      type: ExerciseType.STRENGTH,
      equipment: "Cable",
      muscleGroup: "Lats",
      videoUrl: "https://www.youtube.com/watch?v=r34PR1mxzmU",
    },

    // -----------------
    // CORE / FINISHERS
    // -----------------
    {
      name: "Hollow Hold",
      type: ExerciseType.CORE,
      equipment: "Bodyweight",
      muscleGroup: "Core",
      videoUrl: "https://www.youtube.com/shorts/FJyUyCJkr-k",
    },
    {
      name: "Elbow Plank",
      type: ExerciseType.CORE,
      equipment: "Bodyweight",
      muscleGroup: "Core",
    },
    {
      name: "Stability Ball Hamstring Curl",
      type: ExerciseType.STRENGTH,
      equipment: "Stability Ball",
      muscleGroup: "Hamstrings",
      videoUrl: "https://www.youtube.com/watch?v=XkESHgkTdFw",
    },
  ];

  for (const exercise of exercises) {
    const exists = await prisma.exercise.findFirst({
      where: {
        name: exercise.name,
        trainerId: null,
      },
    });

    if (!exists) {
      await prisma.exercise.create({
        data: exercise,
      });
    }
  }
}
