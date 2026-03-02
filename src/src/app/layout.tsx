import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { getAllPosts } from "@/lib/posts";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Blake Thomson",
    template: "%s — Blake Thomson",
  },
  description:
    "Healthcare strategist. Data architect. Building the tools I wish existed.",
  metadataBase: new URL("https://blakethomson.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const featuredIdeasPosts = getAllPosts()
    .filter((p) => p.category !== "podcast-notes")
    .slice(0, 2)
    .map((p) => ({ slug: p.slug, title: p.title }));

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
      >
        <ThemeProvider>
          <div className="relative min-h-screen flex flex-col">
            <Nav featuredIdeasPosts={featuredIdeasPosts} />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
