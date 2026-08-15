import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAnimeCatalog } from "@/lib/api";

type SearchParams = {
  page?: string;
  genre?: string;
};

const genres = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Sports",
];

function getTitle(anime: {
  title: {
    english?: string | null;
    romaji: string;
  };
}) {
  return (
    anime.title.english ||
    anime.title.romaji ||
    "Unknown Anime"
  );
}

function getImage(anime: {
  coverImage: {
    large: string;
    extraLarge?: string | null;
  };
}) {
  return (
    anime.coverImage.extraLarge ||
    anime.coverImage.large ||
    "/placeholder-anime.jpg"
  );
}

function formatStatus(
  status?: string | null
) {
  if (!status) {
    return "";
  }

  switch (status) {
    case "RELEASING":
      return "Airing";

    case "FINISHED":
      return "Completed";

    case "NOT_YET_RELEASED":
      return "Upcoming";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const rawPage = Number(
    params?.page || "1"
  );

  const page =
    Number.isFinite(rawPage) && rawPage > 0
      ? Math.floor(rawPage)
      : 1;

  const genre =
    typeof params?.genre === "string"
      ? params.genre.trim()
      : "";

  let media: Awaited<
    ReturnType<typeof getAnimeCatalog>
  >["media"] = [];

  let pageInfo = {
    currentPage: page,
    hasNextPage: false,
    lastPage: page,
    total: 0,
  };

  try {
    const result = await getAnimeCatalog(
      page,
      24,
      genre || undefined
    );

    media = result.media;
    pageInfo = result.pageInfo;
  } catch (error) {
    console.error(
      "Browse Anime Error:",
      error
    );
  }

  const makeUrl = (
    nextPage: number,
    nextGenre = genre
  ) => {
    const query =
      new URLSearchParams();

    if (nextGenre) {
      query.set(
        "genre",
        nextGenre
      );
    }

    if (nextPage > 1) {
      query.set(
        "page",
        String(nextPage)
      );
    }

    const queryString =
      query.toString();

    return queryString
      ? `/browse?${queryString}`
      : "/browse";
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-orange-500/10 blur-[120px]" />

          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-red-500/10 blur-[120px]" />

          <div className="absolute bottom-0 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-orange-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-white/35">
            <Link
              href="/"
              className="transition hover:text-orange-400"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-white/60">
              Browse
            </span>
          </div>

          {/* Heading */}
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />

              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">
                Anime Library
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Browse{" "}
              <span className="text-orange-500">
                Anime
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
              Explore thousands of anime
              from the AnimeHub library.
              Find your next favorite series
              by genre, rating and popularity.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                Current Page
              </p>

              <p className="mt-1 text-lg font-black">
                {page}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                Anime Available
              </p>

              <p className="mt-1 text-lg font-black">
                {pageInfo.total.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                Showing
              </p>

              <p className="mt-1 text-lg font-black">
                {media.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GENRES */}
      <section className="sticky top-[68px] z-40 border-b border-white/10 bg-[#050505]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <span className="mr-1 hidden shrink-0 text-xs font-bold uppercase tracking-wider text-white/30 sm:block">
              Genre
            </span>

            <Link
              href="/browse"
              className={`shrink-0 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                !genre
                  ? "border-orange-500 bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                  : "border-white/10 bg-white/[0.04] text-white/55 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
              }`}
            >
              All Anime
            </Link>

            {genres.map((item) => {
              const active =
                genre.toLowerCase() ===
                item.toLowerCase();

              return (
                <Link
                  key={item}
                  href={makeUrl(1, item)}
                  className={`shrink-0 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                    active
                      ? "border-orange-500 bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                      : "border-white/10 bg-white/[0.04] text-white/55 hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {genre ? "🎭" : "🔥"}
              </span>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                {genre
                  ? `${genre} Anime`
                  : "Explore Anime"}
              </h2>
            </div>

            <p className="mt-1 text-xs text-white/35 sm:text-sm">
              {genre
                ? `Showing anime from the ${genre} genre`
                : "Discover popular and trending anime"}
            </p>
          </div>

          <div className="text-xs font-semibold text-white/30">
            Page{" "}
            <span className="text-orange-400">
              {page}
            </span>
          </div>
        </div>

        {/* EMPTY */}
        {media.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-orange-500/10 blur-[90px]" />

            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05] text-4xl">
                🔍
              </div>

              <h2 className="mt-6 text-2xl font-black">
                No Anime Found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
                We couldn&apos;t find any anime
                for this selection. Try another
                genre or browse the complete
                library.
              </p>

              <Link
                href="/browse"
                className="mt-7 inline-flex items-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-black shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-400"
              >
                Browse All Anime
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* GRID */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {media.map((anime) => {
                const title =
                  getTitle(anime);

                const image =
                  getImage(anime);

                const status =
                  formatStatus(
                    anime.status
                  );

                return (
                  <Link
                    key={anime.id}
                    href={`/anime/${anime.id}`}
                    className="group min-w-0"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-orange-500/40 group-hover:shadow-orange-500/10">
                      <img
                        src={image}
                        alt={title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                      {anime.averageScore ? (
                        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg border border-black/20 bg-black/75 px-2 py-1 backdrop-blur-md">
                          <span className="text-[11px]">
                            ⭐
                          </span>

                          <span className="text-[10px] font-black">
                            {(
                              anime.averageScore /
                              10
                            ).toFixed(1)}
                          </span>
                        </div>
                      ) : null}

                      {anime.seasonYear ? (
                        <div className="absolute right-2 top-2 rounded-lg bg-orange-500 px-2 py-1 text-[9px] font-black text-black">
                          {anime.seasonYear}
                        </div>
                      ) : null}

                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="line-clamp-2 text-sm font-black leading-5">
                          {title}
                        </h3>

                        <div className="mt-1.5 flex items-center gap-2 text-[9px] font-semibold text-white/50">
                          {anime.episodes ? (
                            <span>
                              {anime.episodes} EPS
                            </span>
                          ) : null}

                          {anime.episodes &&
                          status ? (
                            <span className="text-white/20">
                              •
                            </span>
                          ) : null}

                          {status ? (
                            <span className="truncate">
                              {status}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition duration-300 group-hover:opacity-100">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-lg text-black shadow-xl shadow-orange-500/30">
                          ▶
                        </div>
                      </div>
                    </div>

                    <div className="px-1 pt-3">
                      <h3 className="line-clamp-1 text-xs font-bold text-white/75 transition group-hover:text-orange-400">
                        {title}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-[10px] text-white/30">
                        {anime.genres
                          ?.slice(0, 2)
                          .join(" • ") ||
                          "Anime"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* PAGINATION */}
            <div className="mt-12 flex items-center justify-center gap-3">
              {page > 1 ? (
                <Link
                  href={makeUrl(
                    page - 1
                  )}
                  className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-bold text-white/70 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  <span className="transition group-hover:-translate-x-0.5">
                    ←
                  </span>

                  Previous
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3 text-xs font-bold text-white/20">
                  ← Previous
                </span>
              )}

              <div className="flex h-11 min-w-[50px] items-center justify-center rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 text-sm font-black text-orange-400">
                {page}
              </div>

              {pageInfo.hasNextPage ? (
                <Link
                  href={makeUrl(
                    page + 1
                  )}
                  className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-bold text-white/70 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  Next

                  <span className="transition group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-xl border border-white/5 bg-white/[0.02] px-5 py-3 text-xs font-bold text-white/20">
                  Next →
                </span>
              )}
            </div>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}