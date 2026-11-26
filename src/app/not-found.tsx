import { ButtonLink, Container } from "@/components/site/ui";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center py-24">
      <Container className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-electric-soft">404</p>
        <h1 className="font-display mt-4 text-4xl font-extrabold tracking-[-0.015em] text-paper">Page not found</h1>
        <p className="mt-4 text-lg leading-relaxed text-mist">
          The page you are looking for has moved or does not exist.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Get a Quote
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
