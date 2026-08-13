"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  FaBars,
  FaClock,
  FaCompass,
  FaHeart,
  FaHome,
  FaRobot,
  FaSearch,
  FaTimes,
  FaUser,
} from "react-icons/fa";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: FaHome,
  },
  {
    label: "Browse",
    href: "/browse",
    icon: FaCompass,
  },
  {
    label: "Favorites",
    href: "/favorites",
    icon: FaHeart,
  },
  {
    label: "Watch History",
    href: "/watch-history",
    icon: FaClock,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: FaUser,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);

  /* -------------------------------------------------------
     FAVORITES COUNT
  ------------------------------------------------------- */

  const updateFavoritesCount = () => {
    try {
      const saved = window.localStorage.getItem("favorites");

      if (!saved) {
        setFavoritesCount(0);
        return;
      }

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setFavoritesCount(parsed.length);
      } else {
        setFavoritesCount(0);
      }
    } catch {
      setFavoritesCount(0);
    }
  };

  useEffect(() => {
    updateFavoritesCount();

    const handleFavoritesUpdate = () => {
      updateFavoritesCount();
    };

    window.addEventListener(
      "favoritesUpdated",
      handleFavoritesUpdate
    );

    window.addEventListener(
      "storage",
      handleFavoritesUpdate
    );

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        handleFavoritesUpdate
      );

      window.removeEventListener(
        "storage",
        handleFavoritesUpdate
      );
    };
  }, []);

  /* -------------------------------------------------------
     CLOSE MOBILE MENU ON ROUTE CHANGE
  ------------------------------------------------------- */

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* -------------------------------------------------------
     ACTIVE ROUTE
  ------------------------------------------------------- */

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  /* -------------------------------------------------------
     AI CHAT
  ------------------------------------------------------- */

  const openAIChat = () => {
    window.dispatchEvent(
      new CustomEvent("openAnimeHubAI")
    );
  };

  return (
    <header className="sticky top-0 z-[90] w-full border-b border-white/10 bg-black/90 backdrop-blur-xl">

      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3"
          aria-label="AnimeHub Home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-xl font-black text-black shadow-lg shadow-orange-500/10 transition duration-200 group-hover:scale-105">
            A
          </div>

          <div className="hidden sm:block">
            <div className="text-xl font-black tracking-tight text-white">
              Anime
              <span className="text-orange-500">
                Hub
              </span>
            </div>

            <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-white/35">
              Anime Universe
            </div>
          </div>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  active ? "page" : undefined
                }
                className={`group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-orange-500/10 text-orange-400"
                    : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <Icon
                  size={14}
                  className="shrink-0"
                />

                <span>{item.label}</span>

                {item.href === "/favorites" &&
                  favoritesCount > 0 && (
                    <span className="flex min-w-[19px] items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-black leading-none text-black">
                      {favoritesCount > 99
                        ? "99+"
                        : favoritesCount}
                    </span>
                  )}

                {active && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-orange-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* =================================================
            RIGHT ACTIONS
        ================================================= */}

        <div className="flex items-center gap-2">

          {/* SEARCH */}

          <Link
            href="/search"
            aria-label="Search Anime"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/[0.06] hover:text-white"
          >
            <FaSearch size={15} />
          </Link>

          {/* AI */}

          <button
            type="button"
            onClick={openAIChat}
            aria-label="Open AnimeHub AI"
            className="hidden h-10 items-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 text-orange-400 transition hover:border-orange-500/40 hover:bg-orange-500/20 sm:flex"
          >
            <FaRobot size={14} />

            <span className="text-xs font-bold">
              AI
            </span>
          </button>

          {/* USER */}

          {isLoaded && user && (
            <Link
              href="/profile"
              aria-label="Profile"
              className={`hidden h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition sm:flex ${
                isActive("/profile")
                  ? "border-orange-500/40 bg-orange-500/10"
                  : "border-white/10 bg-white/[0.04] hover:border-white/20"
              }`}
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaUser
                  size={14}
                  className="text-white/60"
                />
              )}
            </Link>
          )}

          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={() =>
              setMenuOpen((open) => !open)
            }
            aria-label={
              menuOpen
                ? "Close menu"
                : "Open menu"
            }
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            {menuOpen ? (
              <FaTimes size={18} />
            ) : (
              <FaBars size={18} />
            )}
          </button>
        </div>
      </div>

      {/* =================================================
          MOBILE NAVIGATION
      ================================================= */}

      {menuOpen && (
        <div className="border-t border-white/10 bg-black/95 lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

            <nav
              className="space-y-1"
              aria-label="Mobile navigation"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={
                      active ? "page" : undefined
                    }
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                      active
                        ? "bg-orange-500/10 text-orange-400"
                        : "text-white/65 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <Icon size={16} />

                    <span>{item.label}</span>

                    {item.href === "/favorites" &&
                      favoritesCount > 0 && (
                        <span className="ml-auto rounded-full bg-orange-500 px-2 py-1 text-[9px] font-black text-black">
                          {favoritesCount > 99
                            ? "99+"
                            : favoritesCount}
                        </span>
                      )}
                  </Link>
                );
              })}

              {/* MOBILE SEARCH */}

              <Link
                href="/search"
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-white/65 transition hover:bg-white/[0.05] hover:text-white"
              >
                <FaSearch size={16} />

                <span>Search Anime</span>
              </Link>

              {/* MOBILE AI */}

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openAIChat();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/10"
              >
                <FaRobot size={16} />

                <span>AnimeHub AI</span>
              </button>

              {/* MOBILE PROFILE */}

              {isLoaded && user && (
                <Link
                  href="/profile"
                  className="mt-2 flex items-center gap-3 border-t border-white/10 px-4 pt-4 text-sm font-semibold text-white/65"
                >
                  {user.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <FaUser size={13} />
                    </div>
                  )}

                  <span>
                    {user.fullName ||
                      user.username ||
                      "My Profile"}
                  </span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}