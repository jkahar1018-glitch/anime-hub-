"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaPlay,
  FaTrash,
  FaClock,
} from "react-icons/fa";

type WatchHistoryItem = {
  id: number;
  episode: number;
  title: string;
  image?: string;
  timestamp: number;
  progress: number;
};

export default function WatchHistoryPage() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  /*
   * LOAD HISTORY
   */
  const loadHistory = () => {
    try {
      const saved =
        window.localStorage.getItem("watchHistory");

      if (!saved) {
        setHistory([]);
        setLoaded(true);
        return;
      }

      const parsed: unknown = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        setHistory([]);
        setLoaded(true);
        return;
      }

      const validHistory = parsed.filter(
        (item): item is WatchHistoryItem =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "episode" in item &&
          "title" in item &&
          typeof item.id === "number" &&
          typeof item.episode === "number" &&
          typeof item.title === "string"
      );

      setHistory(validHistory);
      setLoaded(true);
    } catch (error) {
      console.error(
        "Failed to load watch history:",
        error
      );

      setHistory([]);
      setLoaded(true);
    }
  };

  /*
   * INITIAL LOAD
   */
  useEffect(() => {
    loadHistory();

    const handleUpdate = () => {
      loadHistory();
    };

    window.addEventListener(
      "watchHistoryUpdated",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "watchHistoryUpdated",
        handleUpdate
      );
    };
  }, []);

  /*
   * REMOVE ONE ITEM
   */
  const removeHistory = (
    id: number,
    episode: number
  ) => {
    const updated = history.filter(
      (item) =>
        !(
          item.id === id &&
          item.episode === episode
        )
    );

    setHistory(updated);

    window.localStorage.setItem(
      "watchHistory",
      JSON.stringify(updated)
    );

    window.dispatchEvent(
      new Event("watchHistoryUpdated")
    );
  };

  /*
   * CLEAR ALL
   */
  const clearHistory = () => {
    setHistory([]);

    window.localStorage.removeItem(
      "watchHistory"
    );

    window.dispatchEvent(
      new Event("watchHistoryUpdated")
    );
  };

  /*
   * DATE FORMAT
   */
  const formatDate = (timestamp: number) => {
    if (!timestamp) {
      return "";
    }

    return new Date(timestamp).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /*
   * LOADING
   */
  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />

          <p className="text-sm text-white/40">
            Loading watch history...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold transition hover:border-purple-500/30 hover:bg-purple-500/10"
          >
            <FaChevronLeft size={11} />

            <span>
              Home
            </span>
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-black sm:text-2xl">
              Watch History
            </h1>

            <p className="mt-1 text-xs text-white/40">
              Continue watching your anime
            </p>
          </div>

          {history.length > 0 ? (
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
            >
              <FaTrash size={12} />

              <span className="hidden sm:inline">
                Clear
              </span>
            </button>
          ) : (
            <div className="w-[80px]" />
          )}

        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* EMPTY */}
        {history.length === 0 ? (
          <section className="flex min-h-[55vh] items-center justify-center">

            <div className="max-w-md text-center">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <FaClock
                  size={28}
                  className="text-purple-400"
                />
              </div>

              <h2 className="mt-6 text-2xl font-black">
                No Watch History
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/40">
                Start watching anime and your recently
                watched episodes will appear here.
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
            {/* TITLE */}
            <div className="mb-6">

              <div className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                AnimeHub
              </div>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Continue Watching
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Pick up where you left off.
              </p>

            </div>

            {/* HISTORY GRID */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {history.map((item) => (

                <article
                  key={`${item.id}-${item.episode}`}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:-translate-y-1 hover:border-purple-500/30"
                >

                  {/* IMAGE */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-white/5">

                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/20">
                        No Image
                      </div>
                    )}

                    {/* DARK OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                    {/* EPISODE */}
                    <div className="absolute left-3 top-3 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-black">
                      EP {item.episode}
                    </div>

                    {/* PLAY */}
                    <Link
                      href={`/watch/${item.id}/${item.episode}`}
                      className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 shadow-2xl shadow-purple-600/30">
                        <FaPlay size={18} />
                      </div>
                    </Link>

                    {/* PROGRESS */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div
                        className="h-full bg-purple-600"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              item.progress || 0
                            )
                          )}%`,
                        }}
                      />
                    </div>

                  </div>

                  {/* INFO */}
                  <div className="p-4">

                    <h3 className="truncate text-base font-black">
                      {item.title}
                    </h3>

                    <div className="mt-2 flex items-center justify-between text-xs text-white/40">

                      <span>
                        Episode {item.episode}
                      </span>

                      <span>
                        {Math.round(
                          item.progress || 0
                        )}
                        %
                      </span>

                    </div>

                    <p className="mt-2 truncate text-[11px] text-white/25">
                      {formatDate(item.timestamp)}
                    </p>

                    {/* BUTTONS */}
                    <div className="mt-4 flex gap-2">

                      <Link
                        href={`/watch/${item.id}/${item.episode}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-3 py-2.5 text-xs font-black transition hover:bg-purple-500"
                      >
                        <FaPlay size={9} />
                        Continue
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          removeHistory(
                            item.id,
                            item.episode
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`Remove ${item.title} episode ${item.episode}`}
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