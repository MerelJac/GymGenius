import { formatPhoneDisplay } from "@/app/utils/format/formatPhoneNumber";

type ContactTrainerProps = {
  trainer: {
    email: string;
    phone?: string | null;
    name?: string | null;
  };
};


export function ContactTrainer({ trainer }: ContactTrainerProps) {
  // console.log("ContactTrainerProps", trainer);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        Contact Your Trainer
      </h2>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">Email</span>

        <a
          href={`mailto:${trainer.email}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline"
        >
          {trainer.email}
        </a>
      </div>
      {/* Phone (optional) */}
      {trainer.phone && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Message</span>
          <a
            href={`sms:${trainer.phone}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            {formatPhoneDisplay(trainer.phone)}
          </a>
        </div>
      )}
    </div>
  );
}
