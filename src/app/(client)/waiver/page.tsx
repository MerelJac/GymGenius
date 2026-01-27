import { signWaiver } from "./actions";

export default function WaiverPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-6">
      <h1 className="text-2xl font-bold">Client Waiver & Agreement</h1>

      <div className="border rounded-lg p-4 h-80 overflow-y-auto text-sm text-gray-700 space-y-4">
        <p>
          By participating in training provided through this platform, you
          acknowledge and accept the inherent risks associated with physical
          exercise.
        </p>

        <p>
          You confirm that you are physically capable of participating and
          agree to consult a medical professional before beginning any program.
        </p>

        <p>
          You release and hold harmless your trainer and the platform from any
          claims arising from participation, except in cases of gross
          negligence.
        </p>

        {/* Replace with your finalized waiver copy */}
      </div>

      <form action={signWaiver}>
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          I Agree & Sign Waiver
        </button>
      </form>
    </div>
  );
}
