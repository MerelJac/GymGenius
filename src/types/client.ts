import { Profile } from "./profile";
import { BodyMetric } from "./bodyMetric";

export type Client = {
  id: string;
  email: string;

  profile: Profile | null;
  bodyMetrics: BodyMetric[];

  trainerId?: string | null;
  createdAt: Date;
};
