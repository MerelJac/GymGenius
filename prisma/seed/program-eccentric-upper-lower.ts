// prisma/seed/program-eccentric-upper-lower.ts
import { PrismaClient, WorkoutDay } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Prescribed } from "@/types/prescribed";

// RUN WITH: npx prisma db seed

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

/**
 * Helper: fetch existing exercise by name
 */
async function getExerciseByName(name: string) {
  let exercise = await prisma.exercise.findFirst({
    where: { name },
  });

  if (!exercise) {
    console.warn(`⚠️  Creating missing exercise: "${name}"`);
    exercise = await prisma.exercise.create({
      data: {
        name,
        type: "STRENGTH"
      },
    });
  }

  return exercise;
}

/**
 * Helper: create WorkoutExercise row
 */
async function createExercise(
  sectionId: string,
  exerciseName: string,
  order: number,
  prescribed: Prescribed,
  notes?: string,
) {
  const exercise = await getExerciseByName(exerciseName);

  return prisma.workoutExercise.create({
    data: {
      sectionId,
      exerciseId: exercise.id,
      order,
      prescribed,
      notes,
    },
  });
}

export async function seedProgramEccentric() {
  console.log("🌱 Seeding Eccentric Upper / Lower Split program…");
  const ECCENTRIC_NOTE = "Tempo: 3–4s eccentric, controlled concentric";
  const PAIN_NOTE =
    "Pain > 2/10 → reduce ROM or tempo, not load. Wrist neutral. Avoid >90° shoulder flexion.";

  async function getOrCreateTrainer() {
    const existingTrainer = await prisma.user.findFirst({
      where: { role: "TRAINER" },
    });

    if (existingTrainer) {
      return existingTrainer;
    }

    // fallback: create a trainer for seeding
    return prisma.user.create({
      data: {
        email: "trainer+seed@gymgenius.dev",
        password: "seed-only",
        role: "TRAINER",
        profile: {
          create: {
            firstName: "Seed",
            lastName: "Trainer",
          },
        },
      },
    });
  }

  /* ------------------------------------------------------------------ */
  /* PROGRAM                                                            */
  /* ------------------------------------------------------------------ */

  const trainer = await getOrCreateTrainer();
  const trainerId = trainer.id;

  const program = await prisma.program.create({
    data: {
      trainerId,
      name: "Eccentric Upper / Lower Split",
      version: 1,
    },
  });

  /* ------------------------------------------------------------------ */
  /* WORKOUT TEMPLATES                                                   */
  /* ------------------------------------------------------------------ */

  await prisma.workoutTemplate.createMany({
    data: [
      {
        programId: program.id,
        name: "Upper Body Strength",
        day: WorkoutDay.MONDAY,
        order: 1,
      },
      {
        programId: program.id,
        name: "Lower Body Strength",
        day: WorkoutDay.TUESDAY,
        order: 2,
      },
      {
        programId: program.id,
        name: "Jog with Friends",
        day: WorkoutDay.WEDNESDAY,
        order: 3,
      },
      {
        programId: program.id,
        name: "Upper Body Strength",
        day: WorkoutDay.THURSDAY,
        order: 4,
      },
      {
        programId: program.id,
        name: "Lower Body Strength",
        day: WorkoutDay.FRIDAY,
        order: 5,
      },
      {
        programId: program.id,
        name: "Bonus Full Body",
        day: WorkoutDay.SATURDAY,
        order: 6,
      },
    ],
  });

  const workoutTemplates = await prisma.workoutTemplate.findMany({
    where: { programId: program.id },
  });

  const getWorkout = (day: WorkoutDay) =>
    workoutTemplates.find((w) => w.day === day)!;

  /* ------------------------------------------------------------------ */
  /* MONDAY – UPPER BODY                                                 */
  /* ------------------------------------------------------------------ */

  const monday = getWorkout(WorkoutDay.MONDAY);

  const monWarmup = await prisma.workoutSection.create({
    data: { workoutId: monday.id, title: "Warm Up", order: 1 },
  });

  const monStrength = await prisma.workoutSection.create({
    data: { workoutId: monday.id, title: "Strength", order: 2 },
  });

  const monFinisher = await prisma.workoutSection.create({
    data: { workoutId: monday.id, title: "Finisher", order: 3 },
  });

  // Warm up
  await createExercise(monWarmup.id, "Band Pull-Aparts", 1, {
    kind: "bodyweight",
    sets: 2,
    reps: 15,
  });

  await createExercise(monWarmup.id, "Scapular Retractions", 2, {
    kind: "bodyweight",
    sets: 2,
    reps: 12,
  });

  await createExercise(monWarmup.id, "Wrist CARs", 3, {
    kind: "mobility",
    duration: 60,
    sets: null,
    reps: null,
    weight: null,
  });

  // Strength
  await createExercise(monStrength.id, "Lying Dumbbell Chest Press", 1, {
    kind: "strength",
    sets: 4,
    reps: 8,
    weight: null,
  });

  await createExercise(monStrength.id, "Standing Bent Over Rear Delt Fly", 2, {
    kind: "strength",
    sets: 4,
    reps: 8,
    weight: null,
  });

  await createExercise(monStrength.id, "Single Arm Cable Row", 3, {
    kind: "strength",
    sets: 3,
    reps: 10,
    weight: null,
  });

  await createExercise(monStrength.id, "Hollow Hold", 4, {
    kind: "timed",
    duration: 30,
  });

  // Finisher
  await createExercise(monFinisher.id, "Dumbbell Bicep Curls", 1, {
    kind: "hybrid",
    sets: 2,
    reps: 21,
    weight: null,
  });

  /* ------------------------------------------------------------------ */
  /* TUESDAY – LOWER BODY                                                */
  /* ------------------------------------------------------------------ */

  const tuesday = getWorkout(WorkoutDay.TUESDAY);

  const tueStrength = await prisma.workoutSection.create({
    data: { workoutId: tuesday.id, title: "Strength", order: 1 },
  });

  await createExercise(tueStrength.id, "Heels Elevated Goblet Squat", 1, {
    kind: "strength",
    sets: 4,
    reps: 8,
    weight: null,
  });

  await createExercise(tueStrength.id, "Dumbbell Side Lunges", 2, {
    kind: "strength",
    sets: 3,
    reps: 12,
    weight: null,
  });

  await createExercise(tueStrength.id, "Step Ups", 3, {
    kind: "strength",
    sets: 3,
    reps: 10,
    weight: null,
  });

  await createExercise(tueStrength.id, "Leg Press Machine", 4, {
    kind: "strength",
    sets: 3,
    reps: 8,
    weight: null,
  });

  /* ------------------------------------------------------------------ */
  /* WEDNESDAY – CARDIO                                                  */
  /* ------------------------------------------------------------------ */

  const wednesday = getWorkout(WorkoutDay.WEDNESDAY);

  const wedCardio = await prisma.workoutSection.create({
    data: { workoutId: wednesday.id, title: "Cardio", order: 1 },
  });

  await createExercise(wedCardio.id, "Jog / Run", 1, {
    kind: "timed",
    duration: 1800,
  });

  console.log("✅ Program seed complete");

  /* ------------------------------------------------------------------ */
  /* THURSDAY – UPPER BODY                                              */
  /* ------------------------------------------------------------------ */

  const thursday = getWorkout(WorkoutDay.THURSDAY);

  const thuWarmup = await prisma.workoutSection.create({
    data: { workoutId: thursday.id, title: "Warm Up", order: 1 },
  });

  const thuStrength = await prisma.workoutSection.create({
    data: { workoutId: thursday.id, title: "Strength", order: 2 },
  });

  const thuFinisher = await prisma.workoutSection.create({
    data: { workoutId: thursday.id, title: "Finisher", order: 3 },
  });

  await createExercise(thuWarmup.id, "Serratus Wall Slides", 1, {
    kind: "mobility",
    duration: 60,
    sets: null,
    reps: null,
    weight: null,
  });

  await createExercise(thuWarmup.id, "Band External Rotations", 2, {
    kind: "bodyweight",
    sets: 2,
    reps: 8,
  });

  await createExercise(
    thuStrength.id,
    "Machine Chest Press",
    1,
    {
      kind: "strength",
      sets: 4,
      reps: 8,
      weight: null,
    },
    ECCENTRIC_NOTE,
  );

  await createExercise(
    thuStrength.id,
    "Plate Halos",
    2,
    {
      kind: "strength",
      sets: 3,
      reps: 8,
      weight: null,
    },
    "Core focus. Stop if shoulder discomfort.",
  );

  await createExercise(
    thuStrength.id,
    "Straight Arm Lat Pulldown",
    3,
    {
      kind: "strength",
      sets: 3,
      reps: 10,
      weight: null,
    },
    ECCENTRIC_NOTE,
  );

  await createExercise(
    thuStrength.id,
    "Dumbbell Lateral Raises",
    4,
    {
      kind: "strength",
      sets: 3,
      reps: 10,
      weight: null,
    },
    "Raise slightly forward if shoulder pain.",
  );

  await createExercise(thuFinisher.id, "Elbow Plank", 1, {
    kind: "timed",
    duration: 60,
  });
  /* ------------------------------------------------------------------ */
  /* FRIDAY – LOWER BODY                                                */
  /* ------------------------------------------------------------------ */

  const friday = getWorkout(WorkoutDay.FRIDAY);

  const friWarmup = await prisma.workoutSection.create({
    data: { workoutId: friday.id, title: "Warm Up", order: 1 },
  });

  const friStrength = await prisma.workoutSection.create({
    data: { workoutId: friday.id, title: "Strength", order: 2 },
  });

  const friFinisher = await prisma.workoutSection.create({
    data: { workoutId: friday.id, title: "Finisher", order: 3 },
  });

  await createExercise(friWarmup.id, "Bodyweight Good Mornings", 1, {
    kind: "bodyweight",
    sets: 2,
    reps: 8,
  });

  await createExercise(friWarmup.id, "Banded Glute Bridges", 2, {
    kind: "bodyweight",
    sets: 2,
    reps: 12,
  });

  await createExercise(
    friStrength.id,
    "Dumbbell Romanian Deadlift",
    1,
    {
      kind: "strength",
      sets: 4,
      reps: 8,
      weight: null,
    },
    "3s eccentric, 2s glute squeeze at top.",
  );

  await createExercise(friStrength.id, "Dumbbell Reverse Lunges", 2, {
    kind: "strength",
    sets: 3,
    reps: 12,
    weight: null,
  });

  await createExercise(
    friStrength.id,
    "Bulgarian Split Squats",
    3,
    {
      kind: "strength",
      sets: 3,
      reps: 8,
      weight: null,
    },
    "Lean forward for glutes.",
  );

  await createExercise(
    friStrength.id,
    "Smith Machine Sumo Squat",
    4,
    {
      kind: "strength",
      sets: 3,
      reps: 8,
      weight: null,
    },
    ECCENTRIC_NOTE,
  );

  await createExercise(friFinisher.id, "Stability Ball Hamstring Curls", 1, {
    kind: "bodyweight",
    sets: 2,
    reps: 10,
  });

  /* ------------------------------------------------------------------ */
  /* BONUS – FULL BODY                                                  */
  /* ------------------------------------------------------------------ */

  const saturday = getWorkout(WorkoutDay.SATURDAY);

  const satStrength = await prisma.workoutSection.create({
    data: { workoutId: saturday.id, title: "Strength", order: 1 },
  });

  const satFinisher = await prisma.workoutSection.create({
    data: { workoutId: saturday.id, title: "Finisher", order: 2 },
  });

  await createExercise(
    satStrength.id,
    "Heels Elevated Goblet Squat",
    1,
    {
      kind: "strength",
      sets: 3,
      reps: 8,
      weight: null,
    },
    ECCENTRIC_NOTE,
  );

  await createExercise(
    satStrength.id,
    "Machine Chest Press",
    2,
    {
      kind: "strength",
      sets: 3,
      reps: 8,
      weight: null,
    },
    ECCENTRIC_NOTE,
  );

  await createExercise(satStrength.id, "Smith Machine Inverted Row", 3, {
    kind: "bodyweight",
    sets: 3,
    reps: 12,
  });

  await createExercise(
    satFinisher.id,
    "BOSU Push Ups",
    1,
    {
      kind: "bodyweight",
      sets: 3,
      reps: 10,
    },
    "Hold BOSU sides if wrist pain.",
  );

  async function addSub(primary: string, substitute: string, note: string) {
    const p = await getExerciseByName(primary);
    const s = await getExerciseByName(substitute);

    await prisma.exerciseSubstitution.create({
      data: {
        exerciseId: p.id,
        substituteId: s.id,
        note,
      },
    });
  }

  await addSub(
    "Dumbbell Bicep Curls",
    "Cable Hammer Curls",
    "Neutral grip for wrist comfort",
  );

  await addSub(
    "Dumbbell Lateral Raises",
    "Cable Front Raises",
    "Avoid lateral plane if shoulder pain",
  );
}
