"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";

const links = [
  { href: "/about", label: "about" },
  { href: "/work", label: "work" },
  { href: "/ideas", label: "ideas" },
  { href: "/learn", label: "learn" },
  { href: "/contact", label: "contact" },
];

export function Nav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="panel sticky top-3 z-50 mx-auto mt-3 w-[calc(100%-2*16px)] max-w-[1200px] px-4 py-2.5 md:w-[calc(100%-2*40px)] md:px-5">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-[13px] text-fg no-underline hover:no-underline hover:text-accent"
          >
            <span className="text-fg-light">~/</span>blake.thomson
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-2.5 py-1 font-mono text-[13px] no-underline transition-colors hover:bg-bg-panel-hover hover:text-accent ${
                  pathname === link.href
                    ? "text-accent"
                    : "text-fg-muted"
                }`}
              >
                /{link.label}
              </Link>
            ))}
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="ml-1 flex h-7 w-7 items-center justify-center rounded font-mono text-[12px] text-fg-light transition-colors hover:bg-bg-panel-hover hover:text-fg"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex h-8 w-8 items-center justify-center font-mono text-fg-muted md:hidden"
          >
            ≡
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-bg/98 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="font-mono text-[13px] text-fg no-underline"
            >
              <span className="text-fg-light">~/</span>blake.thomson
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="flex h-8 w-8 items-center justify-center font-mono text-fg-muted"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-1 flex-col items-start justify-center gap-3 px-10">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`font-mono text-xl no-underline transition-colors ${
                  pathname === link.href ? "text-accent" : "text-fg-muted"
                }`}
              >
                /{link.label}
              </Link>
            ))}
            <button
              onClick={toggle}
              className="mt-6 font-mono text-[13px] text-fg-light"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? "$ theme --light" : "$ theme --dark"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
