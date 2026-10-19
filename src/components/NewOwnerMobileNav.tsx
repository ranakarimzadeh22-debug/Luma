"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/neu", label: "Home" },
  { href: "/neu/einstellungen", label: "Einstellungen" },
] as const;

/**
 * WP-021: fixed mobile-only bottom navigation, exactly two tabs, used only
 * on the owner's own authenticated pages (/neu, /neu/einstellungen). Never
 * rendered on the partner user path (/neu/partner) or any auth/onboarding
 * gate — callers decide where to mount it, this component itself holds no
 * routing or session logic. No new route, no new dependency.
 */
export default function NewOwnerMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Owner-Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#efd5dc] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <div className="mx-auto flex w-full max-w-[27rem]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-12 flex-1 items-center justify-center text-sm font-semibold ${
                isActive ? "text-[#6d153f]" : "text-neutral-500"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
