export function ProcessSteps({ steps }: { steps: ReadonlyArray<{ title: string; body: string }> }) {
  return (
    <ol className="grid gap-5 md:grid-cols-3">
      {steps.map((step, index) => (
        <li key={step.title} className="glass rounded-3xl p-7">
          <p className="font-display text-4xl font-extrabold text-electric/80">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="font-display mt-4 text-xl font-bold tracking-tight text-paper">{step.title}</h3>
          <p className="mt-3 leading-relaxed text-mist">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
