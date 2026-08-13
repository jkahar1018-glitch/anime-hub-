import Image from "next/image";
import Link from "next/link";
import {
  FaStar,
  FaPlay,
  FaSearch,
} from "react-icons/fa";

import SearchBar from "@/components/SearchBar";
import { searchAnime } from "@/lib/api";

type Anime = {
  id: number;

  title?: {
    romaji?: string | null;
    english?: string | null;
  };

  coverImage?: {
    large?: string | null;
    extraLarge?: string | null;
  };

  averageScore?: number | null;
  episodes?: number | null;
  seasonYear?: number | null;
  genres?: string[];
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params =
    await searchParams;

  const query =
    typeof params.q === "string"
      ? params.q.trim()
      : "";

  let results: Anime[] = [];

  if (query) {
    try {
      const data =
        await searchAnime(query);

      results = Array.isArray(data)
        ? data
        : [];
    } catch (error) {
      console.error(
        "Search page error:",
        error
      );
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}

      <section className="border-b border-white/10 bg-gradient-to-b from-purple-950/30 via-black to-black">
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-28 md:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
              <FaSearch />
              Anime Search
            </div>

            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              Find your next
              <span className="block bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                favorite anime
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50 md:text-base">
              Search thousands of anime
              titles and discover your next
              series to watch.
            </p>

            <SearchBar />
          </div>
        </div>
      </section>

      {/* RESULTS */}

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        {query ? (
          <>
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/30">
                  Search results
                </p>

                <h2 className="mt-2 text-2xl font-bold md:text-3xl">
                  Results for{" "}
                  <span className="text-purple-400">
                    &quot;{query}&quot;
                  </span>
                </h2>
              </div>

              <span className="text-sm text-white/40">
                {results.length} anime found
              </span>
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {results.map((anime) => {
                  const title =
                    anime.title?.english ||
                    anime.title?.romaji ||
                    "Unknown Anime";

                  const image =
                    anime.coverImage
                      ?.extraLarge ||
                    anime.coverImage?.large;

                  return (
                    <Link
                      key={anime.id}
                      href={`/anime/${anime.id}`}
                      className="group"
                    >
                      <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-purple-950/30">
                        {/* IMAGE */}

                        <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
                          {image ? (
                            <Image
                              src={image}
                              alt={title}
                              fill
                              sizes="
                                (max-width: 640px) 45vw,
                                (max-width: 768px) 30vw,
                                (max-width: 1024px) 23vw,
                                18vw
                              "
                              className="object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-white/20">
                              No Image
                            </div>
                          )}

                          {/* GRADIENT */}

                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80" />

                          {/* PLAY */}

                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white shadow-xl shadow-purple-900/50">
                              <FaPlay size={14} />
                            </div>
                          </div>

                          {/* RATING */}

                          {anime.averageScore &&
                            anime.averageScore >
                              0 && (
                              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-[11px] font-bold text-yellow-400 backdrop-blur-md">
                                <FaStar size={9} />

                                {(
                                  anime.averageScore /
                                  10
                                ).toFixed(1)}
                              </div>
                            )}

                          {/* HD */}

                          <div className="absolute right-2 top-2 rounded-md bg-purple-600/90 px-1.5 py-1 text-[9px] font-black tracking-wide text-white">
                            HD
                          </div>
                        </div>

                        {/* INFO */}

                        <div className="p-3">
                          <h3
                            className="truncate text-sm font-bold text-white transition group-hover:text-purple-400"
                            title={title}
                          >
                            {title}
                          </h3>

                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40">
                            {anime.seasonYear && (
                              <span>
                                {
                                  anime.seasonYear
                                }
                              </span>
                            )}

                            {anime.seasonYear &&
                              anime.episodes && (
                                <span>
                                  •
                                </span>
                              )}

                            {anime.episodes && (
                              <span>
                                {
                                  anime.episodes
                                }{" "}
                                EP
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* EMPTY */

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                  <FaSearch size={22} />
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  No anime found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                  We couldn&apos;t find any
                  anime matching your
                  search. Try a different
                  title or keyword.
                </p>

                <Link
                  href="/browse"
                  className="mt-6 inline-flex rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold transition hover:bg-purple-500"
                >
                  Browse Anime
                </Link>
              </div>
            )}
          </>
        ) : (
          /* INITIAL STATE */

          <div className="py-20 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] text-purple-400">
              <FaSearch size={28} />
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              What do you want to watch?
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/40">
              Search for anime by title and
              discover detailed information,
              ratings, episodes and more.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}