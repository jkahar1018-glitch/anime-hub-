"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaPlay, FaTrash, FaClock } from "react-icons/fa";

type WatchlistItem = {
  id: number;
  title: string;
  image?: string;
};

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const loadWatchlist = () => {
    try {
      const saved = localStorage.getItem("watchlist");

      if (!saved) {
        setWatchlist([]);
        setLoaded(true);
        return;
      }

      const parsed: unknown = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        setWatchlist([]);
        setLoaded(true);
        return;
      }

      const valid = parsed.filter(
        (item): item is WatchlistItem =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "title" in item &&
          typeof item.id === "number" &&
          typeof item.title === "string"
      );

      setWatchlist(valid);
    } catch (error) {
      console.error("Failed to load watchlist:", error);
      setWatchlist([]);
    }

    setLoaded(true);
  };

  useEffect(() => {
    loadWatchlist();

    const handleUpdate = () => {
      loadWatchlist();
    };

    window.addEventListener("watchlistUpdated", handleUpdate);

    return () => {
      window.removeEventListener("watchlistUpdated", handleUpdate);
    };
  }, []);

  const removeItem = (id: number) => {
    const updated = watchlist.filter((item) => item.id !== id);

    setWatchlist(updated);

    localStorage.setItem("watchlist", JSON.stringify(updated));

    window.dispatchEvent(new Event("watchlistUpdated"));
  };

  const clearWatchlist = () => {
    setWatchlist([]);

    localStorage.removeItem("watchlist");

    window.dispatchEvent(new Event("watchlistUpdated"));
  };

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />
          <p className="mt-4 text-sm text-white/40">
            Loading watchlist...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold transition hover:border-purple-500/30 hover:bg-purple-500/10"
          >
            <FaChevronLeft size={11} />
            Home
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-black sm:text-2xl">
              Watchlist
            </h1>
            <p className="mt-1 text-xs text-white/40">
              Your saved anime
            </p>
          </div>

          {watchlist.length > 0 ? (
            <button
              type="button"
              onClick={clearWatchlist}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
            >
              <FaTrash size={12} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          ) : (
            <div className="w-[80px]" />
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {watchlist.length === 0 ? (
          <section className="flex min-h-[55vh] items-center justify-center">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <FaClock
                  size={28}
                  className="text-purple-400"
                />
              </div>

              <h2 className="mt-6 text-2xl font-black">
                Your Watchlist Is Empty
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/40">
                Add anime to your watchlist and they will
                appear here.
              </p>

              <Link
                href="/browse"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-black transition hover:bg-purple-500"
              >
                <FaPlay size={11} />
                Browse Anime
              </Link>
            </div>
          </section>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                AnimeHub
              </div>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                My Watchlist
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Anime you saved for later.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {watchlist.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-purple-500/30"
                >
                  <Link href={`/anime/${item.id}`}>
                    <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/20">
                          No Image
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 shadow-2xl shadow-purple-600/30">
                          <FaPlay size={18} />
                        </div>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <h3 className="truncate text-base font-black">
                      {item.title}
                    </h3>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/anime/${item.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-3 py-2.5 text-xs font-black transition hover:bg-purple-500"
                      >
                        <FaPlay size={9} />
                        Open
                      </Link>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Remove ${item.title}`}
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
