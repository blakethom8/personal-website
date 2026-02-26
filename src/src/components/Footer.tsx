import Link from "next/link";

export function Footer() {
  return (
    <footer className="panel mx-auto mb-3 w-[calc(100%-2*16px)] max-w-[1200px] px-5 py-4 md:w-[calc(100%-2*40px)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-[12px] text-fg-light">
          &copy; {new Date().getFullYear()} blake thomson &middot; santa monica, ca
        </span>
        <div className="flex items-center gap-4 font-mono text-[12px] text-fg-light">
          <a
            href="https://github.com/blakethom8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-light hover:text-accent"
          >
            github
          </a>
          <a
            href="https://linkedin.com/in/blakethomson"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg-light hover:text-accent"
          >
            linkedin
          </a>
          <Link href="/contact" className="text-fg-light hover:text-accent">
            email
          </Link>
        </div>
      </div>
    </footer>
  );
}
