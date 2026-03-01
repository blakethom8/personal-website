"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

interface NavChild {
  href: string;
  label: string;
}

interface NavLink {
  href: string;
  label: string;
  children?: NavChild[];
}

function buildPathSegments(pathname: string): { label: string; href: string }[] {
  if (pathname === "/") return [];
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, i) => ({
    label: part,
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));
}

const links: NavLink[] = [
  { href: "/about", label: "about" },
  {
    href: "/work",
    label: "work",
    children: [
      { href: "/work", label: "overview" },
      { href: "/work/framework", label: "business framework" },
    ],
  },
  {
    href: "/ideas",
    label: "ideas",
    children: [
      { href: "/ideas", label: "all topics" },
      { href: "/ideas/catalogue", label: "full catalogue" },
      { href: "/ideas/agent-interoperability", label: "agent interoperability" },
      { href: "/ideas/rethinking-saas", label: "rethinking SaaS" },
      { href: "/ideas/building", label: "things i'm building" },
      { href: "/ideas/llms-healthcare", label: "LLMs & healthcare" },
      { href: "/ideas/shower-ideas", label: "shower ideas" },
      { href: "/ideas/in-my-feed", label: "in my feed" },
    ],
  },
  {
    href: "/learn",
    label: "learn",
    children: [
      { href: "/learn", label: "all modules" },
      { href: "/learn/agents-explained", label: "agents: 5-step guide" },
      { href: "/learn/simulator", label: "conversation simulator" },
      { href: "/learn/webmcp-lab", label: "WebMCP lab" },
    ],
  },
  { href: "/contact", label: "contact" },
];

function DesktopDropdown({
  link,
  pathname,
}: {
  link: NavLink;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(null);
  const ref = useRef<HTMLDivElement>(null);

  const isActive =
    pathname === link.href || pathname.startsWith(link.href + "/");

  const handleEnter = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeout.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        href={link.href}
        className={`rounded px-2.5 py-1 font-mono text-[13px] no-underline transition-colors hover:bg-bg-panel-hover hover:text-accent ${
          isActive ? "text-accent" : "text-fg-muted"
        }`}
      >
        /{link.label}
      </Link>

      {open && link.children && (
        <div className="absolute left-0 top-full z-50 pt-1.5">
          <div className="panel min-w-[200px] overflow-hidden rounded border border-border-light py-1 shadow-lg">
            {link.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 font-mono text-[12px] no-underline transition-colors hover:bg-bg-panel-hover hover:text-accent ${
                  pathname === child.href ? "text-accent" : "text-fg-muted"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileNavItem({
  link,
  pathname,
  onClose,
}: {
  link: NavLink;
  pathname: string;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isActive =
    pathname === link.href || pathname.startsWith(link.href + "/");

  if (!link.children) {
    return (
      <Link
        href={link.href}
        onClick={onClose}
        className={`font-mono text-xl no-underline transition-colors ${
          isActive ? "text-accent" : "text-fg-muted"
        }`}
      >
        /{link.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 font-mono text-xl transition-colors ${
          isActive ? "text-accent" : "text-fg-muted"
        }`}
      >
        /{link.label}
        <span className="text-[14px] text-fg-light">
          {expanded ? "▾" : "▸"}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 ml-4 flex flex-col gap-2 border-l border-border-light pl-4">
          {link.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onClose}
              className={`font-mono text-[14px] no-underline transition-colors ${
                pathname === child.href
                  ? "text-accent"
                  : "text-fg-light hover:text-accent"
              }`}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Nav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const segments = buildPathSegments(pathname);

  return (
    <>
      <nav className="panel sticky top-3 z-50 mx-auto mt-3 w-[calc(100%-2*16px)] max-w-[1200px] px-4 py-2.5 md:w-[calc(100%-2*40px)] md:px-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center min-w-0 font-mono text-[13px]">
            <Link
              href="/"
              className="text-fg no-underline hover:no-underline hover:text-accent shrink-0"
            >
              <span className="text-fg-light">~/</span>blake.thomson
            </Link>
            {segments.map((seg, i) => {
              const isLast = i === segments.length - 1;
              return (
                <span key={seg.href} className="inline-flex items-center shrink-0">
                  <span className="text-fg-light">/</span>
                  {isLast ? (
                    <span className="text-fg-light">{seg.label}</span>
                  ) : (
                    <Link
                      href={seg.href}
                      className="text-fg-light no-underline hover:no-underline hover:text-accent transition-colors"
                    >
                      {seg.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </div>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex shrink-0">
            {links.map((link) =>
              link.children ? (
                <DesktopDropdown
                  key={link.href}
                  link={link}
                  pathname={pathname}
                />
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded px-2.5 py-1 font-mono text-[13px] no-underline transition-colors hover:bg-bg-panel-hover hover:text-accent ${
                    pathname === link.href ? "text-accent" : "text-fg-muted"
                  }`}
                >
                  /{link.label}
                </Link>
              )
            )}
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
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex items-center min-w-0 font-mono text-[13px]">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="text-fg no-underline shrink-0"
              >
                <span className="text-fg-light">~/</span>blake.thomson
              </Link>
              {segments.map((seg, i) => {
                const isLast = i === segments.length - 1;
                return (
                  <span key={seg.href} className="inline-flex items-center shrink-0">
                    <span className="text-fg-light">/</span>
                    {isLast ? (
                      <span className="text-fg-light">{seg.label}</span>
                    ) : (
                      <Link
                        href={seg.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-fg-light no-underline hover:text-accent transition-colors"
                      >
                        {seg.label}
                      </Link>
                    )}
                  </span>
                );
              })}
            </div>
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
              <MobileNavItem
                key={link.href}
                link={link}
                pathname={pathname}
                onClose={() => setMobileOpen(false)}
              />
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
