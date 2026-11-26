import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { MobileMenu } from "@/components/site/MobileMenu";
import { navItems } from "@/config/navigation";
import { buttonClasses } from "@/lib/classes";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6">
        <Logo priority />

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-mist transition-colors hover:text-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/contact" className={buttonClasses("primary", "md") + " px-3.5 text-xs sm:px-5 sm:text-sm"}>
            Get a Quote
          </Link>
          <MobileMenu items={navItems} />
        </div>
      </div>
    </header>
  );
}
