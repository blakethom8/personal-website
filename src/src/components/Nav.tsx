"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

interface NavChild {
  href: string;
  label: string;
  divider?: boolean;
}

interface NavLink {
  href: string;
  label: string;
  children?: NavChild[];
}

export interface FeaturedNavPost {
  slug: string;
  title: string;
}

function buildPathSegments(pathname: string): { label: string; href: string }[] {
  if (pathname === "/") return [];
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, i) => ({
    label: part,
    href: "/" + parts.slice(0, i + 1).join("/"),
  }));
}

const baseLinks: NavLink[] = [
  {
    href: "/learn",
    label: "learn",
    children: [
      { href: "/learn", label: "overview" },
      { href: "/learn/agents-explained", label: "agents: 5-step guide" },
      { href: "/learn/simulator", label: "interactive labs" },
      { href: "/learn/webmcp-lab", label: "WebMCP lab" },
    ],
  },
  {
    href: "/ideas",
    label: "ideas",
    children: [
      { href: "/ideas", label: "all topics" },
      { href: "/ideas/catalogue", label: "full catalogue" },
    ],
  },
  {
    href: "/work",
    label: "work",
    children: [
      { href: "/work", label: "overview" },
      { href: "/work/projects", label: "project spotlight" },
      { href: "/work/framework", label: "consulting as a product" },
    ],
  },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
];

function DesktopDropdown({
  link,
  pathname,
  featuredIdeasPosts,
}: {
  link: NavLink;
  pathname: string;
  featuredIdeasPosts?: FeaturedNavPost[];
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

  const showFeatured = link.href === "/ideas" && featuredIdeasPosts && featuredIdeasPosts.length > 0;

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
          <div className="panel w-[220px] overflow-hidden rounded border border-border-light py-1 shadow-lg">
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

            {showFeatured && (
              <>
                <div className="mx-3 my-1 border-t border-border-light" />
                <p className="px-4 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-wider text-fg-light">
                  featured
                </p>
                {featuredIdeasPosts!.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/ideas/${post.slug}`}
                    onClick={() => setOpen(false)}
                    className={`block truncate px-4 py-2 font-mono text-[12px] no-underline transition-colors hover:bg-bg-panel-hover hover:text-accent ${
                      pathname === `/ideas/${post.slug}` ? "text-accent" : "text-fg-muted"
                    }`}
                    title={post.title}
                  >
                    {post.title}
                  </Link>
                ))}
              </>
            )}
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
  featuredIdeasPosts,
}: {
  link: NavLink;
  pathname: string;
  onClose: () => void;
  featuredIdeasPosts?: FeaturedNavPost[];
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

  const showFeatured = link.href === "/ideas" && featuredIdeasPosts && featuredIdeasPosts.length > 0;

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

          {showFeatured && (
            <>
              <p className="pt-1 font-mono text-[10px] uppercase tracking-wider text-fg-light">
                featured
              </p>
              {featuredIdeasPosts!.map((post) => (
                <Link
                  key={post.slug}
                  href={`/ideas/${post.slug}`}
                  onClick={onClose}
                  className={`truncate font-mono text-[13px] no-underline transition-colors ${
                    pathname === `/ideas/${post.slug}`
                      ? "text-accent"
                      : "text-fg-light hover:text-accent"
                  }`}
                  title={post.title}
                >
                  {post.title}
                </Link>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Nav({ featuredIdeasPosts }: { featuredIdeasPosts?: FeaturedNavPost[] }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const segments = buildPathSegments(pathname);
  const links = baseLinks;

  useEffect(() => {
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    const previous = {
      bodyOverflow: bodyStyle.overflow,
      bodyPosition: bodyStyle.position,
      bodyTop: bodyStyle.top,
      bodyLeft: bodyStyle.left,
      bodyRight: bodyStyle.right,
      bodyWidth: bodyStyle.width,
      htmlOverflow: htmlStyle.overflow,
    };

    bodyStyle.overflow = "hidden";
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.left = "0";
    bodyStyle.right = "0";
    bodyStyle.width = "100%";
    htmlStyle.overflow = "hidden";

    return () => {
      bodyStyle.overflow = previous.bodyOverflow;
      bodyStyle.position = previous.bodyPosition;
      bodyStyle.top = previous.bodyTop;
      bodyStyle.left = previous.bodyLeft;
      bodyStyle.right = previous.bodyRight;
      bodyStyle.width = previous.bodyWidth;
      htmlStyle.overflow = previous.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <nav className="panel sticky top-3 z-50 mx-auto mt-3 w-[calc(100%-2*16px)] max-w-[1200px] px-4 py-2.5 md:w-[calc(100%-2*40px)] md:px-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center overflow-hidden font-mono text-[13px]">
            <Link
              href="/"
              className="text-fg no-underline hover:no-underline hover:text-accent shrink-0"
            >
              <span className="text-fg-light">~/</span>blake.thomson
            </Link>
            {segments.map((seg, i) => {
              const isLast = i === segments.length - 1;
              return (
                <span key={seg.href} className="inline-flex min-w-0 items-center">
                  <span className="text-fg-light">/</span>
                  {isLast ? (
                    <span className="truncate text-fg-light">{seg.label}</span>
                  ) : (
                    <Link
                      href={seg.href}
                      className="min-w-0 truncate text-fg-light no-underline transition-colors hover:no-underline hover:text-accent"
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
                  featuredIdeasPosts={featuredIdeasPosts}
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
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-overlay"
            className="flex h-8 w-8 items-center justify-center font-mono text-fg-muted md:hidden"
          >
            ≡
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          id="mobile-nav-overlay"
          className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-bg/98 backdrop-blur-sm"
        >
          <div className="flex min-h-[100dvh] flex-col">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex min-w-0 items-center overflow-hidden font-mono text-[13px]">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="shrink-0 text-fg no-underline"
                >
                  <span className="text-fg-light">~/</span>blake.thomson
                </Link>
                {segments.map((seg, i) => {
                  const isLast = i === segments.length - 1;
                  return (
                    <span key={seg.href} className="inline-flex min-w-0 items-center">
                      <span className="text-fg-light">/</span>
                      {isLast ? (
                        <span className="truncate text-fg-light">{seg.label}</span>
                      ) : (
                        <Link
                          href={seg.href}
                          onClick={() => setMobileOpen(false)}
                          className="min-w-0 truncate text-fg-light no-underline transition-colors hover:text-accent"
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
            <div className="flex flex-1 flex-col items-start justify-center gap-3 px-8 py-10 sm:px-10">
              {links.map((link) => (
                <MobileNavItem
                  key={link.href}
                  link={link}
                  pathname={pathname}
                  onClose={() => setMobileOpen(false)}
                  featuredIdeasPosts={featuredIdeasPosts}
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
        </div>
      )}
    </>
  );
}
