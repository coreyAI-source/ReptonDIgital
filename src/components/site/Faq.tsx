export function Faq({ items }: { items: ReadonlyArray<{ question: string; answer: string }> }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details key={item.question} className="group glass rounded-2xl px-6 py-5 open:bg-white/[0.07]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-paper [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="text-2xl leading-none text-electric-soft transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-4 leading-relaxed text-mist">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
