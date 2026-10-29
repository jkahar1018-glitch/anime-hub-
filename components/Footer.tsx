"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaGithub,
  FaInstagram,
  FaTwitter,
  FaDiscord,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Anime", href: "/browse" },
  { label: "Search", href: "/search" },
  { label: "Trending", href: "/#trending" },
  { label: "India Anime Picks", href: "/#hindi" },
  { label: "New & Airing", href: "/#latest" },
  { label: "Top Rated", href: "/#top-rated" },
];

const animeLinks = [
  { label: "My List", href: "/watchlist" },
  { label: "Favorites", href: "/favorites" },
  { label: "Watch History", href: "/watch-history" },
  { label: "Profile", href: "/profile" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/jkahar1018-glitch", icon: FaGithub },
  { label: "Instagram", href: "https://www.instagram.com/shivay_kahar_/", icon: FaInstagram },
  { label: "Twitter", href: "https://x.com/shivayxkahar", icon: FaTwitter },
  { label: "Discord", href: "https://discord.com", icon: FaDiscord },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-purple-500/20 bg-[#07060d] text-white">
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-purple-700/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-violet-600/10 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
                        <Link href="/" className="group inline-flex max-w-full items-center">
              <Image
                src="/animehub-logo.png"
                alt="AnimeHub - Your Anime Universe"
                width={334}
                height={85}
                className="h-auto w-[240px] max-w-full object-contain mix-blend-screen transition-transform duration-300 group-hover:scale-[1.02] sm:w-[300px]"
              />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/55">
              Discover your next favorite anime. Explore trending shows,
              find hidden gems, and build your own anime universe with AnimeHub.
            </p>

            <div className="mt-7 flex items-center gap-3">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition duration-300 hover:-translate-y-1 hover:border-purple-400/60 hover:bg-purple-500/15 hover:text-purple-300"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-purple-300">
              Explore
            </h3>
            <div className="flex flex-col gap-3">
              {exploreLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="w-fit text-sm text-white/55 transition hover:translate-x-1 hover:text-purple-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-purple-300">
              My Anime
            </h3>
            <div className="flex flex-col gap-3">
              {animeLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="w-fit text-sm text-white/55 transition hover:translate-x-1 hover:text-purple-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="my-10 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="grid gap-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-300">
              Get in Touch
            </h3>
            <p className="mt-2 text-sm text-white/50">
              Have a question or feedback? Contact AnimeHub.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:items-end sm:justify-center">
            <a
              href="mailto:jkahar.1018@gmail.com"
              className="flex items-center gap-3 text-sm text-white/70 transition hover:text-purple-300"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300">
                <FaEnvelope />
              </span>
              <span className="break-all">jkahar.1018@gmail.com</span>
            </a>

            <a
              href="tel:834720071018"
              className="flex items-center gap-3 text-sm text-white/70 transition hover:text-purple-300"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15 text-purple-300">
                <FaPhone />
              </span>
              <span>834720071018</span>
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {"©"} {new Date().getFullYear()} AnimeHub. All rights reserved.
          </p>

          <p>
            Anime metadata powered by{" "}
            <span className="font-semibold text-purple-300/80">AniList</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}






