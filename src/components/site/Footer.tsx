import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { business } from "@/config/business";
import { navItems } from "@/config/navigation";
import { CONTACT_EMAIL } from "@/lib/env";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-line bg-ink-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-smoke">{business.description}</p>
        </div>

        <nav aria-label="Footer">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Explore</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-mist transition-colors hover:text-paper">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/privacy" className="text-mist transition-colors hover:text-paper">
                Privacy policy
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-smoke">Contact</p>
          <ul className="mt-4 space-y-2.5 text-sm text-mist">
            <li>{business.location}</li>
            <li>
              <a href={`tel:${business.phoneInternational}`} className="transition-colors hover:text-paper">
                {business.phoneDisplay}
              </a>
            </li>
            {CONTACT_EMAIL ? (
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="break-all transition-colors hover:text-paper">
                  {CONTACT_EMAIL}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-smoke sm:px-6">
          © {year} {business.name}. Perth, Western Australia.
        </p>
      </div>
    </footer>
  );
}
