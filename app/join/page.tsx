import type { Metadata } from "next";
import JoinForm from "@/components/JoinForm";

export const metadata: Metadata = {
  title: "Join | Dom Panteron Universe",
  description:
    "Become a member of Dom Panteron Universe — early access, raffles, and the next wave."
};

export default function JoinPage() {
  return (
    <main className="text-white">
      <section className="relative isolate overflow-hidden bg-panteron-black">
        <div aria-hidden className="absolute inset-0 bg-panteron-gradient" />
        <div
          aria-hidden
          className="home-haze absolute -left-1/4 top-0 h-[55%] w-[55%] rounded-full bg-panteron-purple/20 blur-3xl"
        />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:pb-28 lg:pt-28">
          <div>
            <p className="home-rise mb-4 text-xs uppercase tracking-[0.35em] text-panteron-violet">
              Join
            </p>
            <h1 className="home-rise home-rise-delay-1 font-display max-w-xl text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-6xl">
              Enter the universe
            </h1>
            <p className="home-rise home-rise-delay-2 mt-6 max-w-lg text-lg text-zinc-300 sm:text-xl">
              Create your membership for early access, raffles, and the next
              chapters of style and sound.
            </p>
          </div>

          <div className="home-rise home-rise-delay-3 rounded-none border border-white/10 bg-panteron-black/50 p-6 sm:p-8">
            <JoinForm />
          </div>
        </div>
      </section>
    </main>
  );
}
