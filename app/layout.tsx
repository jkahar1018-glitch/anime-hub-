import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://anime-hub-xnor-kzuvbd93k-jkahar1018-glitchs-projects.vercel.app"
  ),

  title: {
    default: "AnimeHub - Watch Anime Online",
    template: "%s | AnimeHub",
  },

  description:
    "AnimeHub is an anime streaming website where you can discover anime, browse popular shows, search anime, and explore episodes.",

  keywords: [
    "AnimeHub",
    "anime",
    "watch anime",
    "anime streaming",
    "anime online",
    "latest anime",
    "popular anime",
    "anime episodes",
  ],

  authors: [{ name: "AnimeHub" }],

  creator: "AnimeHub",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    title: "AnimeHub - Watch Anime Online",
    description:
      "Discover popular anime, latest releases, anime episodes and more on AnimeHub.",
    url: "https://anime-hub-xnor-kzuvbd93k-jkahar1018-glitchs-projects.vercel.app",
    siteName: "AnimeHub",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AnimeHub - Watch Anime Online",
    description:
      "Discover popular anime, latest releases, anime episodes and more on AnimeHub.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClerkProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}