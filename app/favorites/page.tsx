"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FaHeart,
  FaPlay,
  FaTrash,
} from "react-icons/fa";

type FavoriteAnime = {
  id: number;
  title: string;
  image: string;
  score?: number | null;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<
    FavoriteAnime[]
  >([]);

  const [mounted, setMounted] = useState(false);

  /*
   * Load favorites after browser mount.
   *
   * requestAnimationFrame avoids the React
   * set-state-in-effect lint error while keeping
   * localStorage browser-only.
   */
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  /*
   * Load favorites from localStorage.
   */
  useEffect(() => {
    if (!mounted) return;

    const loadFavorites = () => {
      try {
        const saved =
          window.localStorage.getItem(
            "favorites"
          );

        if (!saved) {
          setFavorites([]);
          return;
        }

        const parsed: unknown =
          JSON.parse(saved);

        if (!Array.isArray(parsed)) {
          setFavorites([]);
          return;
        }

        const validFavorites =
          parsed.filter(
            (item): item is FavoriteAnime =>
              typeof item === "object" &&
              item !== null &&
              "id" in item &&
              typeof item.id === "number"
          );

        setFavorites(validFavorites);
      } catch (error) {
        console.error(
          "Failed to load favorites:",
          error
        );

        setFavorites([]);
      }
    };

    const frame = window.requestAnimationFrame(
      loadFavorites
    );

    const handleUpdate = () => {
      loadFavorites();
    };

    window.addEventListener(
      "favoritesUpdated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.cancelAnimationFrame(frame);

      window.removeEventListener(
        "favoritesUpdated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, [mounted]);

  /*
   * Remove single favorite.
   */
  const removeFavorite = (id: number) => {
    try {
      const updated = favorites.filter(
        (item) => item.id !== id
      );

      setFavorites(updated);

      window.localStorage.setItem(
        "favorites",
        JSON.stringify(updated)
      );

      window.dispatchEvent(
        new Event("favoritesUpdated")
      );
    } catch (error) {
      console.error(
        "Failed to remove favorite:",
        error
      );
    }
  };

  /*
   * Clear all favorites.
   */
  const clearFavorites = () => {
    try {
      setFavorites([]);

      window.localStorage.removeItem(
        "favorites"
      );

      window.dispatchEvent(
        new Event("favoritesUpdated")
      );
    } catch (error) {
      console.error(
        "Failed to clear favorites:",
        error
      );
    }
  };

  /*
   * Loading screen.
   */
  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-orange-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-24 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3 text-orange-400">
              <FaHeart />

              <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                Your collection
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              My Favorites
            </h1>

            <p className="mt-3 text-white/50">
              Your favorite anime collection.
            </p>
          </div>

          {favorites.length > 0 && (
            <button
              type="button"
              onClick={clearFavorites}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <FaTrash size={13} />
              Clear Favorites
            </button>
          )}
        </div>

        {/* EMPTY */}

        {favorites.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
              <FaHeart size={25} />
            </div>

            <h2 className="text-2xl font-bold">
              No favorites yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-white/50">
              Add anime to your favorites and
              they will appear here.
            </p>

            <Link
              href="/browse"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-black text-black transition hover:bg-orange-400"
            >
              <FaPlay size={12} />
              Browse Anime
            </Link>
          </div>
        ) : (
          /* FAVORITES GRID */

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {favorites.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-orange-500/40"
              >
                <Link href={`/anime/${item.id}`}>
                  <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={
                          item.title ||
                          "Anime"
                        }
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/20">
                        No Image
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 pt-16">
                      <span className="inline-flex rounded-md bg-orange-500 px-2 py-1 text-xs font-bold text-black">
                        FAVORITE
                      </span>
                    </div>

                    {typeof item.score ===
                      "number" && (
                      <span className="absolute right-2 top-2 rounded-md bg-black/80 px-2 py-1 text-xs font-bold text-white backdrop-blur">
                        ★{" "}
                        {(
                          item.score / 10
                        ).toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-3">
                  <Link
                    href={`/anime/${item.id}`}
                    className="block truncate font-semibold transition hover:text-orange-400"
                  >
                    {item.title ||
                      "Anime"}
                  </Link>

                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      href={`/anime/${item.id}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400"
                    >
                      <FaPlay size={9} />
                      Open
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        removeFavorite(
                          item.id
                        )
                      }
                      className="rounded-lg p-2 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Remove ${item.title} from favorites`}
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}