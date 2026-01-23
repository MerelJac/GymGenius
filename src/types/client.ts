import { Profile } from "./profile";
import { BodyMetric } from "./bodyMetric";
import { ScheduledWorkoutWithProgram } from "./workout";

export type Client = {
  id: string;
  email: string;

  profile: Profile | null;
  bodyMetrics: BodyMetric[];

  trainerId?: string | null;
  createdAt: Date;
  scheduledWorkouts: ScheduledWorkoutWithProgram[];
};
