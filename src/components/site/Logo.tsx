import Image from "next/image";
import Link from "next/link";
import { cx } from "@/lib/classes";

/**
 * Repton Digital mark and name. The mark is the existing brand "R" on a black
 * background, so it blends into the dark navy page with `mix-blend-screen`.
 */
export function Logo({ priority = false, className }: { priority?: boolean; className?: string }) {
  return (
    <Link href="/" className={cx("inline-flex items-center gap-2.5 rounded-lg", className)}>
      <Image
        src="/brand/repton-mark.png"
        alt=""
        width={380}
        height={380}
        priority={priority}
        sizes="36px"
        className="h-7 w-7 mix-blend-screen sm:h-9 sm:w-9"
      />
      <span className="font-wordmark whitespace-nowrap text-sm font-extrabold tracking-[-0.015em] text-paper max-[389px]:sr-only sm:text-lg">
        Repton Digital
      </span>
    </Link>
  );
}
