"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaTimes,
  FaStar,
  FaPlay,
} from "react-icons/fa";

type AnimeResult = {
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
};

export default function SearchBar() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const searchRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * ==========================================
   * LIVE SEARCH
   * ==========================================
   */

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data = await response.json();

        const anime =
          Array.isArray(data?.anime)
            ? data.anime
            : Array.isArray(data?.results)
              ? data.results
              : [];

        setResults(anime.slice(0, 6));
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Search error:",
          error
        );

        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  /*
   * ==========================================
   * CLOSE DROPDOWN OUTSIDE
   * ==========================================
   */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
      ) {
        setFocused(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * ==========================================
   * FULL SEARCH
   * ==========================================
   */

  const handleSearch = () => {
    const query = search.trim();

    if (!query) return;

    setFocused(false);

    router.push(
      `/search?q=${encodeURIComponent(query)}`
    );
  };

  /*
   * ==========================================
   * CLEAR
   * ==========================================
   */

  const clearSearch = () => {
    setSearch("");
    setResults([]);
  };

  /*
   * ==========================================
   * OPEN ANIME
   * ==========================================
   */

  const openAnime = (id: number) => {
    setFocused(false);
    setSearch("");

    router.push(`/anime/${id}`);
  };

  /*
   * ==========================================
   * TITLE
   * ==========================================
   */

  const getTitle = (
    anime: AnimeResult
  ) =>
    anime.title?.english ||
    anime.title?.romaji ||
    "Unknown Anime";

  /*
   * ==========================================
   * UI
   * ==========================================
   */

  return (
    <div
      ref={searchRef}
      className="relative mt-10 w-full max-w-2xl"
    >
      {/* SEARCH BOX */}

      <div
        className={`
          group relative flex h-[62px] w-full
          items-center overflow-hidden rounded-2xl
          border bg-white/[0.055]
          backdrop-blur-xl
          transition-all duration-300
          ${
            focused
              ? "border-purple-500/70 bg-white/[0.08] shadow-[0_0_35px_rgba(168,85,247,0.18)]"
              : "border-white/10 hover:border-white/20"
          }
        `}
      >
        {/* SEARCH ICON */}

        <button
          type="button"
          onClick={handleSearch}
          className="ml-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/45 transition hover:bg-purple-500/10 hover:text-purple-400"
          aria-label="Search"
        >
          <FaSearch size={17} />
        </button>

        {/* INPUT */}

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onFocus={() =>
            setFocused(true)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSearch();
            }

            if (
              event.key === "Escape"
            ) {
              setFocused(false);
            }
          }}
          placeholder="Search anime, characters, genres..."
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] text-white outline-none placeholder:text-white/35"
          aria-label="Search anime"
        />

        {/* LOADING */}

        {loading && (
          <div className="mr-3 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />
        )}

        {/* CLEAR */}

        {!loading && search && (
          <button
            type="button"
            onClick={clearSearch}
            className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
            aria-label="Clear search"
          >
            <FaTimes size={13} />
          </button>
        )}

        {/* SEARCH BUTTON */}

        <button
          type="button"
          onClick={handleSearch}
          disabled={!search.trim()}
          className="mr-2 hidden h-11 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition hover:scale-[1.02] hover:from-purple-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40 sm:block"
        >
          Search
        </button>
      </div>

      {/* LIVE RESULTS */}

      {focused && search.trim() && (
        <div
          className="
            absolute left-0 right-0 top-[72px]
            z-50 overflow-hidden rounded-2xl
            border border-white/10
            bg-[#09090d]/95
            shadow-[0_25px_80px_rgba(0,0,0,0.65)]
            backdrop-blur-2xl
          "
        >
          {/* LOADING */}

          {loading && (
            <div className="flex items-center gap-3 px-5 py-5 text-sm text-white/50">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />
              Searching anime...
            </div>
          )}

          {/* RESULTS */}

          {!loading &&
            results.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/30">
                  Anime Results
                </div>

                {results.map((anime) => {
                  const title =
                    getTitle(anime);

                  const image =
                    anime.coverImage
                      ?.extraLarge ||
                    anime.coverImage?.large;

                  return (
                    <button
                      type="button"
                      key={anime.id}
                      onClick={() =>
                        openAnime(
                          anime.id
                        )
                      }
                      className="
                        flex w-full items-center
                        gap-3 rounded-xl p-2
                        text-left transition
                        hover:bg-white/[0.07]
                      "
                    >
                      {/* POSTER */}

                      <div className="relative h-[62px] w-[45px] shrink-0 overflow-hidden rounded-lg bg-white/5">
                        {image ? (
                          <Image
                            src={image}
                            alt={title}
                            fill
                            sizes="45px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-white/20">
                            NO IMG
                          </div>
                        )}
                      </div>

                      {/* INFO */}

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {title}
                        </h3>

                        <div className="mt-1 flex items-center gap-2 text-[11px] text-white/40">
                          {anime.averageScore &&
                            anime.averageScore >
                              0 && (
                              <span className="flex items-center gap-1 text-yellow-400">
                                <FaStar size={9} />
                                {(
                                  anime.averageScore /
                                  10
                                ).toFixed(
                                  1
                                )}
                              </span>
                            )}

                          {anime.seasonYear && (
                            <span>
                              {
                                anime.seasonYear
                              }
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

                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold text-white/60">
                            HD
                          </span>
                        </div>
                      </div>

                      {/* PLAY */}

                      <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 opacity-0 transition group-hover:opacity-100">
                        <FaPlay size={10} />
                      </div>
                    </button>
                  );
                })}

                {/* SEE ALL */}

                <button
                  type="button"
                  onClick={handleSearch}
                  className="mt-1 flex w-full items-center justify-center border-t border-white/5 px-4 py-3 text-xs font-semibold text-purple-400 transition hover:bg-white/[0.04] hover:text-purple-300"
                >
                  See all results for &quot;
                  {search.trim()}&quot;
                  <span className="ml-1">
                    →
                  </span>
                </button>
              </div>
            )}

          {/* NO RESULTS */}

          {!loading &&
            results.length === 0 && (
              <div className="px-5 py-7 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/25">
                  <FaSearch />
                </div>

                <p className="text-sm font-semibold text-white/70">
                  No anime found
                </p>

                <p className="mt-1 text-xs text-white/35">
                  Try another anime title
                  or keyword.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}