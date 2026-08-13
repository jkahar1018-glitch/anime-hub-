"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaHeart,
  FaHistory,
  FaPlay,
  FaUser,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";

import {
  useUser,
  SignInButton,
  SignUpButton,
  SignOutButton,
} from "@clerk/nextjs";

type WatchHistoryItem = {
  id: number;
  episode: number;
  title: string;
  image?: string;
  timestamp?: number;
  progress?: number;
};

type FavoriteItem = {
  id: number;
  title: string;
  image: string;
  score?: number | null;
};

function isFavoriteItem(
  item: unknown
): item is FavoriteItem {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  if (!("id" in item)) {
    return false;
  }

  return typeof item.id === "number";
}

function isWatchHistoryItem(
  item: unknown
): item is WatchHistoryItem {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  if (!("id" in item) || !("episode" in item)) {
    return false;
  }

  return (
    typeof item.id === "number" &&
    typeof item.episode === "number"
  );
}

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();

  const [history, setHistory] = useState<
    WatchHistoryItem[]
  >([]);

  const [favoritesCount, setFavoritesCount] =
    useState(0);

  const [dataLoaded, setDataLoaded] =
    useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadProfileData = () => {
      try {
        const savedHistory =
          window.localStorage.getItem(
            "watchHistory"
          );

        if (savedHistory) {
          const parsed: unknown =
            JSON.parse(savedHistory);

          if (Array.isArray(parsed)) {
            setHistory(
              parsed.filter(isWatchHistoryItem)
            );
          } else {
            setHistory([]);
          }
        } else {
          setHistory([]);
        }

        const savedFavorites =
          window.localStorage.getItem("favorites");

        if (savedFavorites) {
          const parsed: unknown =
            JSON.parse(savedFavorites);

          if (Array.isArray(parsed)) {
            setFavoritesCount(
              parsed.filter(isFavoriteItem).length
            );
          } else {
            setFavoritesCount(0);
          }
        } else {
          setFavoritesCount(0);
        }
      } catch (error) {
        console.error(
          "Failed to load profile data:",
          error
        );

        setHistory([]);
        setFavoritesCount(0);
      } finally {
        setDataLoaded(true);
      }
    };

    loadProfileData();

    window.addEventListener(
      "watchHistoryUpdated",
      loadProfileData
    );

    window.addEventListener(
      "favoritesUpdated",
      loadProfileData
    );

    window.addEventListener(
      "storage",
      loadProfileData
    );

    return () => {
      window.removeEventListener(
        "watchHistoryUpdated",
        loadProfileData
      );

      window.removeEventListener(
        "favoritesUpdated",
        loadProfileData
      );

      window.removeEventListener(
        "storage",
        loadProfileData
      );
    };
  }, []);

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-orange-500" />

          <p className="text-sm text-white/50">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-black px-4 py-24 text-white">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl shadow-orange-500/5 sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <FaUser size={30} />
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
              AnimeHub Account
            </p>

            <h1 className="text-3xl font-black sm:text-4xl">
              Welcome to AnimeHub
            </h1>

            <p className="mx-auto mt-4 max-w-md leading-7 text-white/50">
              Sign in to access your profile,
              favorites, watch history and continue
              watching.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-bold text-white transition hover:border-orange-500/30 hover:bg-white/10"
                >
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="rounded-xl bg-orange-500 px-6 py-3 font-black text-black transition hover:bg-orange-400"
                >
                  Join Free
                </button>
              </SignUpButton>
            </div>

            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white/40 transition hover:text-white"
            >
              <FaHome size={12} />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.username ||
    "Anime Fan";

  const email =
    user?.primaryEmailAddress?.emailAddress || "";

  const imageUrl = user?.imageUrl || "";

  return (
    <main className="min-h-screen bg-black px-4 pb-20 pt-24 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
          >
            <FaHome size={13} />
            Home
          </Link>

          <p className="hidden text-xs font-bold uppercase tracking-[0.2em] text-white/30 sm:block">
            AnimeHub Profile
          </p>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/10 via-white/[0.03] to-purple-500/10">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
              <div className="shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={displayName}
                    className="h-24 w-24 rounded-full border-2 border-orange-500/40 object-cover shadow-lg shadow-orange-500/10"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-500 text-3xl font-black text-black">
                    {displayName
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                  Your Profile
                </p>

                <h1 className="truncate text-3xl font-black sm:text-4xl">
                  {displayName}
                </h1>

                {email && (
                  <p className="mt-2 truncate text-sm text-white/50">
                    {email}
                  </p>
                )}
              </div>

              <SignOutButton>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/20"
                >
                  <FaSignOutAlt size={13} />
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/favorites"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-orange-500/[0.04]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <FaHeart />
              </div>

              <div>
                <p className="text-sm text-white/50">
                  Favorites
                </p>

                <p className="mt-1 text-3xl font-black transition group-hover:text-orange-400">
                  {dataLoaded
                    ? favoritesCount
                    : 0}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/watch-history"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-purple-500/[0.04]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <FaHistory />
              </div>

              <div>
                <p className="text-sm text-white/50">
                  Watch History
                </p>

                <p className="mt-1 text-3xl font-black transition group-hover:text-purple-400">
                  {dataLoaded
                    ? history.length
                    : 0}
                </p>
              </div>
            </div>
          </Link>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
                Recent Activity
              </p>

              <h2 className="mt-1 text-2xl font-black sm:text-3xl">
                Continue Watching
              </h2>
            </div>

            {history.length > 0 && (
              <Link
                href="/watch-history"
                className="text-sm font-bold text-purple-400 transition hover:text-purple-300"
              >
                View All
              </Link>
            )}
          </div>

          {!dataLoaded ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <FaHistory
                className="mx-auto text-white/20"
                size={30}
              />

              <p className="mt-4 text-white/50">
                No watch history yet.
              </p>

              <Link
                href="/browse"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold transition hover:bg-purple-500"
              >
                <FaPlay size={11} />
                Browse Anime
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {history
                .slice(0, 5)
                .map((item, index) => (
                  <Link
                    key={`${item.id}-${item.episode}-${index}`}
                    href={`/watch/${item.id}/${item.episode}`}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-purple-500/40"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={
                            item.title || "Anime"
                          }
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-white/20">
                          No Image
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-3 pt-14">
                        <span className="rounded-md bg-purple-600 px-2 py-1 text-xs font-bold">
                          EP {item.episode}
                        </span>
                      </div>
                    </div>

                    <div className="p-3">
                      <p className="truncate text-sm font-bold">
                        {item.title || "Anime"}
                      </p>

                      <p className="mt-1 text-xs text-purple-400">
                        Continue watching
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}