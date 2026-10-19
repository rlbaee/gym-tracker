export const metadata = {
  title: "Terms of Service — Lifted",
  description: "Terms of service for Lifted gym tracker.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#f7f8f3] px-5 py-12 text-[#17211b] sm:px-8">
      <article className="mx-auto max-w-2xl rounded-3xl border border-[#e5eae5] bg-white p-7 shadow-soft sm:p-10">
        <a href="/" className="text-sm font-semibold text-[#56856a]">← Back to Lifted</a>
        <h1 className="mt-8 text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-3 text-sm text-[#738078]">Last updated: October 19, 2026</p>

        <div className="mt-8 space-y-7 text-sm leading-7 text-[#435047]">
          <section>
            <h2 className="text-base font-bold text-[#17211b]">Using Lifted</h2>
            <p className="mt-2">
              Lifted is a workout tracking tool for recording exercise sessions, routines, sets, reps, and
              weights. You must provide accurate account information and keep your password secure.
            </p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#17211b]">Your data</h2>
            <p className="mt-2">
              You retain ownership of the workout data you submit. You give Lifted permission to store and
              process that data only as needed to provide, secure, and improve the service.
            </p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#17211b]">Health and safety</h2>
            <p className="mt-2">
              Lifted is not medical advice, personal training, or a substitute for professional guidance.
              You are responsible for choosing exercises and weights appropriate for your health and experience.
              Stop exercising and seek professional help if you experience pain, injury, or concerning symptoms.
            </p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#17211b]">Acceptable use</h2>
            <p className="mt-2">
              Do not misuse the service, attempt to access another person&apos;s account or data, interfere with
              the service, or use it for unlawful activity.
            </p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#17211b]">Availability and changes</h2>
            <p className="mt-2">
              Lifted is provided as available and may change, be interrupted, or be discontinued. We may update
              these terms when the service changes. Continued use after an update means you accept the revised terms.
            </p>
          </section>
          <section>
            <h2 className="text-base font-bold text-[#17211b]">Contact</h2>
            <p className="mt-2">
              Questions about these terms should be sent to the support email listed for this Lifted deployment.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
