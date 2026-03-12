import { signWaiver } from "./actions";

export default function WaiverPage() {
  return (
    // TODO: consult a lawyer before
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-6">
      <h1 className="text-2xl font-bold">Client Waiver & Agreement</h1>

      <div className="border rounded-lg p-4 h-80 overflow-y-auto text-sm text-gray-700 space-y-4">
        <p className="font-semibold text-gray-900">Beta Software Notice</p>
        <p className="text-muted">
          Dialed Fitness is currently in <strong>beta</strong>. As a beta user, you
          understand that the platform is still under active development and may
          contain bugs, incomplete features, or unexpected behavior. By
          continuing, you agree to use this software as-is and acknowledge that
          features may change, be removed, or behave differently than expected.
        </p>

        <p className="font-semibold text-gray-900">Assumption of Risk</p>
        <p className="text-muted">
          Physical exercise carries inherent risks, including but not limited to
          muscle strain, injury, or aggravation of pre-existing conditions. You
          voluntarily assume all risks associated with participating in any
          exercise program, whether prescribed through this platform or
          otherwise. You confirm that you are in suitable physical condition to
          exercise and have consulted, or will consult, a qualified medical
          professional before beginning any training program.
        </p>

        <p className="font-semibold text-gray-900">Release of Liability</p>
        <p className="text-muted">
          You agree to release, discharge, and hold harmless Dialed Fitness, its
          developers, your personal trainer, and any affiliated parties from any
          and all claims, damages, losses, or liability arising from your use of
          this platform or participation in any exercise program. This includes
          claims related to software errors, inaccurate workout data, or any
          decisions you make based on content provided through the app. This
          release does not apply in cases of gross negligence or willful
          misconduct.
        </p>

        <p className="font-semibold text-gray-900">Your Responsibility</p>
        <p className="text-muted">
          You are solely responsible for your own health and safety during
          exercise. You agree to stop any activity and seek medical attention if
          you experience pain, dizziness, shortness of breath, or any concerning
          symptoms. Your trainer provides guidance, but you are the final
          decision-maker regarding your own body and limits.
        </p>

        <p className="font-semibold text-gray-900">Acknowledgement</p>
        <p className="text-muted">
          By clicking &ldquo;I Agree &amp; Sign Waiver&rdquo; below, you confirm that you have
          read and understood this agreement, that you are 18 years of age or
          older, and that you voluntarily accept these terms.
        </p>
      </div>

      <form action={signWaiver}>
        <button
          type="submit"
          className="btn-primary"
        >
          I Agree & Sign Waiver
        </button>
      </form>
    </div>
  );
}
