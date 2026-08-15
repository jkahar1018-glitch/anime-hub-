"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaPlay,
  FaRegHeart,
  FaYoutube,
} from "react-icons/fa";
import { getAnimeById } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
    episode: string;
  }>;
};

type Anime = {
  id: number;

  title: {
    english?: string | null;
    romaji: string;
    native?: string | null;
  };

  coverImage?: {
    large?: string | null;
    extraLarge?: string | null;
    medium?: string | null;
  };

  trailer?: {
    id?: string | null;
    site?: string | null;
    thumbnail?: string | null;
  } | null;

  averageScore?: number | null;
  episodes?: number | null;
  status?: string | null;
  description?: string | null;
  duration?: number | null;
  seasonYear?: number | null;
  genres?: string[];
};

type WatchHistoryItem = {
  id: number;
  episode: number;
  title: string;
  image?: string;
  timestamp: number;
  progress: number;
};

export default function WatchPage({ params }: Props) {
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);

  const [resolvedParams, setResolvedParams] = useState<{
    id: string;
    episode: string;
  } | null>(null);

  /* =====================================================
     RESOLVE PARAMS
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    void params.then((value) => {
      if (!cancelled) {
        setResolvedParams(value);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [params]);

  /* =====================================================
     LOAD ANIME
  ===================================================== */

  useEffect(() => {
    if (!resolvedParams) {
      return;
    }

    const animeId = Number(resolvedParams.id);

    if (!Number.isFinite(animeId) || animeId <= 0) {
  return;
}

    let cancelled = false;

    const loadAnime = async () => {
      try {
        setLoading(true);

        const result = await getAnimeById(animeId);

        if (!cancelled) {
          setAnime(result ?? null);
        }
      } catch (error) {
        console.error("Failed to load anime:", error);

        if (!cancelled) {
          setAnime(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAnime();

    return () => {
      cancelled = true;
    };
  }, [resolvedParams]);

  /* =====================================================
     EPISODE DATA
  ===================================================== */

  const currentEpisode = Math.max(
    1,
    Number(resolvedParams?.episode ?? 1)
  );

  const totalEpisodes = Math.max(
    1,
    anime?.episodes ?? 12
  );

  const animeTitle =
    anime?.title?.english ||
    anime?.title?.romaji ||
    "Anime";

  const animeImage =
    anime?.coverImage?.extraLarge ||
    anime?.coverImage?.large ||
    anime?.coverImage?.medium ||
    "";

  /* =====================================================
     TRAILER
  ===================================================== */

  const trailerId =
    anime?.trailer?.site?.toLowerCase() === "youtube"
      ? anime.trailer.id
      : null;

  const trailerThumbnail =
    anime?.trailer?.thumbnail ||
    animeImage;

  /* =====================================================
     FAVORITE - LOAD
  ===================================================== */

  useEffect(() => {
    if (!anime) {
      return;
    }

    const animeId = anime.id;

    const loadFavorite = () => {
      try {
        const saved =
          window.localStorage.getItem("favorites");

        if (!saved) {
          setFavorite(false);
          return;
        }

        const parsed: unknown = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
          setFavorite(false);
          return;
        }

        const exists = parsed.some((item) => {
          if (typeof item === "number") {
            return item === animeId;
          }

          if (
            typeof item === "object" &&
            item !== null &&
            "id" in item
          ) {
            const favoriteItem =
              item as { id?: unknown };

            return favoriteItem.id === animeId;
          }

          return false;
        });

        setFavorite(exists);
      } catch (error) {
        console.error(
          "Favorite load failed:",
          error
        );

        setFavorite(false);
      }
    };

    loadFavorite();

    const handleFavoriteUpdate = () => {
      loadFavorite();
    };

    window.addEventListener(
      "favoritesUpdated",
      handleFavoriteUpdate
    );

    window.addEventListener(
      "storage",
      handleFavoriteUpdate
    );

    return () => {
      window.removeEventListener(
        "favoritesUpdated",
        handleFavoriteUpdate
      );

      window.removeEventListener(
        "storage",
        handleFavoriteUpdate
      );
    };
  }, [anime]);

  /* =====================================================
     TOGGLE FAVORITE
  ===================================================== */

  const toggleFavorite = () => {
    if (!anime) {
      return;
    }

    try {
      const saved =
        window.localStorage.getItem("favorites");

      let favorites: unknown[] = [];

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          favorites = parsed;
        }
      }

      if (favorite) {
        favorites = favorites.filter((item) => {
          if (typeof item === "number") {
            return item !== anime.id;
          }

          if (
            typeof item === "object" &&
            item !== null &&
            "id" in item
          ) {
            const favoriteItem =
              item as { id?: unknown };

            return favoriteItem.id !== anime.id;
          }

          return true;
        });
      } else {
        const alreadyExists = favorites.some(
          (item) => {
            if (typeof item === "number") {
              return item === anime.id;
            }

            if (
              typeof item === "object" &&
              item !== null &&
              "id" in item
            ) {
              const favoriteItem =
                item as { id?: unknown };

              return favoriteItem.id === anime.id;
            }

            return false;
          }
        );

        if (!alreadyExists) {
          favorites.push({
            id: anime.id,
            title: animeTitle,
            image: animeImage,
            score: anime.averageScore ?? null,
          });
        }
      }

      window.localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
      );

      const newFavorite = !favorite;

      setFavorite(newFavorite);

      window.dispatchEvent(
        new Event("favoritesUpdated")
      );
    } catch (error) {
      console.error(
        "Favorite update failed:",
        error
      );
    }
  };

  /* =====================================================
     LOAD WATCH PROGRESS
     
     IMPORTANT:
     State update is placed inside a timeout callback
     so React's set-state-in-effect rule does not complain.
  ===================================================== */

  useEffect(() => {
    if (!anime) {
      return;
    }

    const animeId = anime.id;
    const episode = currentEpisode;

    const timer = window.setTimeout(() => {
      try {
        const saved =
          window.localStorage.getItem(
            "watchHistory"
          );

        if (!saved) {
          setWatchProgress(0);
          return;
        }

        const parsed: unknown = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
          setWatchProgress(0);
          return;
        }

        const current = parsed.find(
          (item): item is WatchHistoryItem =>
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            "episode" in item &&
            "progress" in item &&
            typeof item.id === "number" &&
            typeof item.episode === "number" &&
            typeof item.progress === "number" &&
            item.id === animeId &&
            item.episode === episode
        );

        if (current) {
          setWatchProgress(
            Math.min(
              100,
              Math.max(0, current.progress)
            )
          );
        } else {
          setWatchProgress(0);
        }
      } catch (error) {
        console.error(
          "Watch history load failed:",
          error
        );

        setWatchProgress(0);
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [anime, currentEpisode]);

  /* =====================================================
     SAVE WATCH HISTORY
  ===================================================== */

  useEffect(() => {
    if (!anime) {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        const saved =
          window.localStorage.getItem(
            "watchHistory"
          );

        let history: WatchHistoryItem[] = [];

        if (saved) {
          const parsed: unknown = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            history = parsed.filter(
              (item): item is WatchHistoryItem =>
                typeof item === "object" &&
                item !== null &&
                "id" in item &&
                "episode" in item &&
                "title" in item &&
                "timestamp" in item &&
                "progress" in item &&
                typeof item.id === "number" &&
                typeof item.episode === "number" &&
                typeof item.title === "string" &&
                typeof item.timestamp === "number" &&
                typeof item.progress === "number"
            );
          }
        }

        const newItem: WatchHistoryItem = {
          id: anime.id,
          episode: currentEpisode,
          title: animeTitle,
          image: animeImage,
          timestamp: Date.now(),
          progress: watchProgress,
        };

        const updated = [
          newItem,
          ...history.filter(
            (item) =>
              !(
                item.id === anime.id &&
                item.episode === currentEpisode
              )
          ),
        ].slice(0, 50);

        window.localStorage.setItem(
          "watchHistory",
          JSON.stringify(updated)
        );

        window.dispatchEvent(
          new Event("watchHistoryUpdated")
        );
      } catch (error) {
        console.error(
          "Watch history save failed:",
          error
        );
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    anime,
    currentEpisode,
    animeTitle,
    animeImage,
    watchProgress,
  ]);

  /* =====================================================
     DEMO TRAILER PROGRESS
  ===================================================== */

  useEffect(() => {
    if (!anime || !trailerId) {
      return;
    }

    const timer = window.setInterval(() => {
      setWatchProgress((previous) => {
        if (previous >= 95) {
          return previous;
        }

        return Math.min(
          95,
          previous + 0.5
        );
      });
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [anime, trailerId]);

  /* =====================================================
     DESCRIPTION
  ===================================================== */

  const description = useMemo(() => {
    if (!anime?.description) {
      return "No description available.";
    }

    return anime.description
      .replace(/<[^>]*>/g, "")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, "&")
      .trim();
  }, [anime]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading || !resolvedParams) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />

          <p className="mt-4 text-sm text-white/40">
            Loading anime...
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     NOT FOUND
  ===================================================== */

  if (!anime) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="px-6 text-center">
          <h1 className="text-4xl font-black">
            Anime Not Found
          </h1>

          <p className="mt-3 text-white/40">
            We could not load this anime.
          </p>

          <Link
            href="/browse"
            className="mt-6 inline-flex rounded-xl bg-purple-600 px-6 py-3 font-bold transition hover:bg-purple-500"
          >
            Browse Anime
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link
            href={`/anime/${anime.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold transition hover:bg-purple-500/10"
          >
            <FaChevronLeft size={11} />

            <span className="hidden sm:inline">
              Back
            </span>
          </Link>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-sm font-black sm:text-lg">
              {animeTitle}
            </h1>

            <p className="text-xs text-white/40">
              Episode {currentEpisode}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleFavorite}
            aria-label={
              favorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
              favorite
                ? "border-pink-500/30 bg-pink-500/10 text-pink-400"
                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            {favorite ? (
              <FaHeart size={13} />
            ) : (
              <FaRegHeart size={13} />
            )}

            <span className="hidden sm:inline">
              {favorite
                ? "Favorited"
                : "Favorite"}
            </span>
          </button>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-4 lg:py-8">
        {/* =================================================
            MAIN
        ================================================= */}

        <div className="lg:col-span-3">
          {/* =================================================
              PLAYER
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#080808] shadow-2xl">
            <div className="relative aspect-video bg-black">
              {trailerId ? (
                <iframe
                  key={`${trailerId}-${currentEpisode}`}
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${trailerId}?rel=0&modestbranding=1&playsinline=1`}
                  title={`${animeTitle} Episode ${currentEpisode} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="relative h-full w-full">
                  {trailerThumbnail && (
                    <Image
                      src={trailerThumbnail}
                      alt={animeTitle}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 75vw"
                      className="object-cover opacity-50"
                    />
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="px-6 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-600">
                        <FaPlay size={20} />
                      </div>

                      <h3 className="mt-4 text-xl font-black">
                        Trailer Unavailable
                      </h3>

                      <p className="mt-2 text-sm text-white/40">
                        Official trailer is not available.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}

            <div className="h-1 bg-white/10">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{
                  width: `${watchProgress}%`,
                }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-white/[0.025] px-4 py-3 text-xs text-white/40">
              <span>
                Episode {currentEpisode}
              </span>

              <span className="text-red-400">
                <FaYoutube className="mr-1 inline" />
                Official Trailer
              </span>

              <span>
                {Math.round(watchProgress)}% watched
              </span>
            </div>
          </section>

          {/* =================================================
              MESSAGE
          ================================================= */}

          <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/5 px-5 py-4">
            <p className="text-sm text-white/60">
              🎬{" "}
              <strong className="text-white">
                Trailer Preview
              </strong>{" "}
              — Episode {currentEpisode} is currently
              showing the anime&apos;s official trailer.
            </p>
          </div>

          {/* =================================================
              EPISODE NAVIGATION
          ================================================= */}

          <div className="mt-5 flex items-center justify-between gap-3">
            {currentEpisode > 1 ? (
              <Link
                href={`/watch/${anime.id}/${currentEpisode - 1}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold transition hover:bg-purple-500/10"
              >
                <FaChevronLeft size={10} />
                Previous
              </Link>
            ) : (
              <div />
            )}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-bold text-white/50">
              EP {currentEpisode} / {totalEpisodes}
            </div>

            {currentEpisode < totalEpisodes ? (
              <Link
                href={`/watch/${anime.id}/${currentEpisode + 1}`}
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold transition hover:bg-purple-500"
              >
                Next
                <FaChevronRight size={10} />
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* =================================================
              ANIME INFORMATION
          ================================================= */}

          <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="flex flex-col gap-6 p-5 sm:p-7 md:flex-row">
              {animeImage && (
                <div className="relative hidden h-48 w-32 shrink-0 overflow-hidden rounded-xl md:block">
                  <Image
                    src={animeImage}
                    alt={animeTitle}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-black sm:text-3xl">
                  {animeTitle}
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-black text-black">
                    ★{" "}
                    {anime.averageScore
                      ? (
                          anime.averageScore / 10
                        ).toFixed(1)
                      : "N/A"}
                  </span>

                  <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold">
                    {anime.episodes ?? "?"} Episodes
                  </span>

                  {anime.status && (
                    <span className="rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-400">
                      {anime.status}
                    </span>
                  )}

                  {anime.seasonYear && (
                    <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white/60">
                      {anime.seasonYear}
                    </span>
                  )}
                </div>

                {anime.genres &&
                  anime.genres.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {anime.genres
                        .slice(0, 5)
                        .map((genre) => (
                          <span
                            key={genre}
                            className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/40"
                          >
                            {genre}
                          </span>
                        ))}
                    </div>
                  )}

                <p className="mt-5 text-sm leading-7 text-white/50">
                  {description}
                </p>
              </div>
            </div>
          </section>

          {/* =================================================
              AUDIO / SUBTITLE
          ================================================= */}

          <section className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <label
                htmlFor="audio"
                className="mb-3 block text-sm font-bold"
              >
                🎧 Audio
              </label>

              <select
                id="audio"
                defaultValue="English"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-purple-500"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Japanese</option>
              </select>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <label
                htmlFor="subtitle"
                className="mb-3 block text-sm font-bold"
              >
                💬 Subtitle
              </label>

              <select
                id="subtitle"
                defaultValue="English"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-purple-500"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>None</option>
              </select>
            </div>
          </section>
        </div>

        {/* =================================================
            EPISODES SIDEBAR
        ================================================= */}

        <aside>
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black">
                    Episodes
                  </h2>

                  <p className="mt-1 text-xs text-white/35">
                    {totalEpisodes} episodes
                  </p>
                </div>

                <div className="rounded-lg bg-purple-500/10 px-2.5 py-1.5 text-xs font-bold text-purple-400">
                  EP {currentEpisode}
                </div>
              </div>
            </div>

            <div className="max-h-[600px] space-y-1.5 overflow-y-auto p-3">
              {Array.from({
                length: totalEpisodes,
              }).map((_, index) => {
                const ep = index + 1;

                const active =
                  ep === currentEpisode;

                return (
                  <Link
                    key={ep}
                    href={`/watch/${anime.id}/${ep}`}
                    aria-current={
                      active ? "page" : undefined
                    }
                    className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? "bg-purple-600 text-white"
                        : "text-white/55 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span>
                      Episode {ep}
                    </span>

                    {active ? (
                      <FaPlay size={9} />
                    ) : (
                      <FaChevronRight
                        size={9}
                        className="opacity-0 transition group-hover:opacity-100"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}