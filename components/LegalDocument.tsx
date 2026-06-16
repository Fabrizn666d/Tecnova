type LegalSection = {
  title: string;
  body: string[];
};

export default function LegalDocument({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <section className="mx-auto max-w-[1000px] px-4 py-12 sm:px-5 lg:px-14">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-tecnova-red">Legal</p>
      <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">{title}</h1>
      <p className="mt-6 text-base font-semibold leading-8 text-tecnova-steel">{intro}</p>
      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <article key={section.title} className="rounded-lg bg-neutral-100 p-6">
            <h2 className="text-2xl font-black">{section.title}</h2>
            <div className="mt-4 space-y-3 text-sm font-semibold leading-7 text-tecnova-steel">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
