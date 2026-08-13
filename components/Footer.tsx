"use client";

import Link from "next/link";
import {
  FaGithub,
  FaInstagram,
  FaTwitter,
  FaDiscord,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#050505] text-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-14 sm:px-8 lg:px-10">
        {/* TOP */}
        <div className="grid gap-12 md:grid-cols-4">
          {/* BRAND */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <div className="leading-none">
                <div className="text-[11px] font-black tracking-[0.45em] text-white/50">
                  ANIME
                </div>

                <div className="text-4xl font-black tracking-tight">
                  HUB<span className="text-orange-500">.</span>
                </div>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/50">
              Discover anime, build your list, and find your next
              favorite series. Explore trending shows, top-rated
              anime and more.
            </p>

            {/* SOCIAL */}
            <div className="mt-7 flex items-center gap-3">
              <a
                href="#"
                aria-label="GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-orange-500/50 hover:bg-orange-500 hover:text-black"
              >
                <FaGithub />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-orange-500/50 hover:bg-orange-500 hover:text-black"
              >
                <FaInstagram />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-orange-500/50 hover:bg-orange-500 hover:text-black"
              >
                <FaTwitter />
              </a>

              <a
                href="#"
                aria-label="Discord"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-orange-500/50 hover:bg-orange-500 hover:text-black"
              >
                <FaDiscord />
              </a>
            </div>
          </div>

          {/* EXPLORE */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Explore
            </h3>

            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-sm text-white/50 transition hover:text-orange-500"
              >
                Home
              </Link>

              <Link
                href="/anime"
                className="text-sm text-white/50 transition hover:text-orange-500"
              >
                Browse Anime
              </Link>

              <Link
                href="/search"
                className="text-sm text-white/50 transition hover:text-orange-500"
              >
                Search
              </Link>

              <Link
                href="/trending"
                className="text-sm text-white/50 transition hover:text-orange-500"
              >
                Trending
              </Link>

              <Link
                href="/top-rated"
                className="text-sm text-white/50 transition hover:text-orange-500"
              >
                Top Rated
              </Link>
            </div>
          </div>

          {/* MY ANIME */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              My Anime
            </h3>

            <div className="flex flex-col gap-3">
              <Link
                href="/my-list"
                className="text-sm text-white/50 transition hover:text-orange-500"
              >
                My List
              </Link>

              <Link
                href="/favorites"
                className="text-sm text-white/50 transition hover:text-orange-500"
              >
                Favorites
              </Link>

              <Link
                href="/history"
                className="text-sm text-white/50 transition hover:text-orange-500"
              >
                Watch History
              </Link>

              <Link
                href="/profile"
                className="text-sm text-white/50 transition hover:text-orange-500"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-10 h-px bg-white/10" />

        {/* BOTTOM */}
        <div className="flex flex-col gap-4 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} AnimeHub. All rights reserved.
          </p>

          <p>
            Anime metadata powered by{" "}
            <span className="font-semibold text-white/60">
              AniList
            </span>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
