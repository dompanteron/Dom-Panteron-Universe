type PageStubProps = {
  title: string;
  description: string;
};

export default function PageStub({ title, description }: PageStubProps) {
  return (
    <main className="bg-panteron-gradient text-white">
      <section className="mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center px-6 py-20">
        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-panteron-violet">
          Coming soon
        </p>
        <h1 className="font-display mb-4 text-4xl font-semibold sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-lg text-zinc-300">{description}</p>
      </section>
    </main>
  );
}
