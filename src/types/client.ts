import { Profile } from "./profile";
import { BodyMetric } from "./bodyMetric";
import { ScheduledWorkout, ScheduledWorkoutWithProgram } from "./workout";
import { Prisma } from "@prisma/client";

export type Client = {
  id: string;
  email: string;

  profile: Profile | null;
  bodyMetrics: BodyMetric[];

  trainerId?: string | null;
  createdAt: Date;
  scheduledWorkouts: ScheduledWorkoutWithProgram[];
};


export type ClientWithWorkouts = {
  id: string;
  email: string;
  profile?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  scheduledWorkouts: ScheduledWorkout[];
};

export type ClientProfilePageUser =
  Prisma.UserGetPayload<{
    include: {
      profile: true;
      bodyMetrics: true;
      scheduledWorkouts: {
        include: {
          workout: true;
        };
      };
      workoutLogs: true;
    };
  }>;