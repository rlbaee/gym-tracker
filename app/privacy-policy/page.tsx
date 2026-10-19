export const metadata = {
  title: "Privacy Policy — Lifted",
  description: "Privacy policy for Lifted gym tracker.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f7f8f3] px-5 py-12 text-[#17211b] sm:px-8">
      <article className="mx-auto max-w-2xl rounded-3xl border border-[#e5eae5] bg-white p-7 shadow-soft sm:p-10">
        <a href="/" className="text-sm font-semibold text-[#56856a]">← Back to Lifted</a>
        <h1 className="mt-8 text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-3 text-sm text-[#738078]">Last updated: October 19, 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-[#435047]">
          <section>
            <h2 className="text-base font-bold text-[#17211b]">What we collect</h2>
            <p className="mt-2">
              Lifted collects your email address and authentication information when you create an account.
              It also stores the workouts, exercises, sets, weights, reps, dates, and routines that you choose to save.
            </p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#17211b]">How we use your information</h2>
            <p className="mt-2">
              We use this information to sign you in, sync your gym data across devices, and provide your workout
              history and progress charts. We do not sell your personal information.
            </p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#17211b]">Service providers</h2>
            <p className="mt-2">
              Lifted uses Supabase for authentication and database hosting. If you choose Google sign-in, Google
              processes authentication according to its own privacy policy.
            </p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#17211b]">Your choices</h2>
            <p className="mt-2">
              You can stop using Lifted at any time. To request account or data deletion, contact the person or
              organization operating this deployment.
            </p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#17211b]">Contact</h2>
            <p className="mt-2">
              Questions about this policy should be sent to the support email listed for this Lifted deployment.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
