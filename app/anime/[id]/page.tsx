import Image from "next/image";
import Link from "next/link";
import { getAnimeById } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AnimeDetailsPage({ params }: Props) {
  const { id } = await params;
  const animeId = Number(id);

  if (!Number.isInteger(animeId) || animeId <= 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-black">Anime Not Found</h1>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-bold text-black"
          >
            ← Back Home
          </Link>
        </div>
      </main>
    );
  }

  const anime = await getAnimeById(animeId);

  if (!anime) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-orange-400">
            AnimeHub
          </p>

          <h1 className="text-4xl font-black">Anime Not Found</h1>

          <p className="mt-4 text-white/60">
            We couldn&apos;t find this anime right now.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-xl bg-orange-500 px-7 py-3 font-bold text-black transition hover:scale-105"
          >
            ← Back Home
          </Link>
        </div>
      </main>
    );
  }

  const title =
    anime.title?.english ||
    anime.title?.romaji ||
    anime.title?.native ||
    "Unknown Anime";

  const poster =
    anime.coverImage?.extraLarge ||
    anime.coverImage?.large;

  const banner =
    anime.bannerImage ||
    poster;

  const description =
    anime.description
      ?.replace(/<[^>]*>/g, "")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim() ||
    "No description available for this anime.";

  const score =
    typeof anime.averageScore === "number" && anime.averageScore > 0
      ? (anime.averageScore / 10).toFixed(1)
      : "N/A";

  const episodeCount =
    typeof anime.episodes === "number" && anime.episodes > 0
      ? anime.episodes
      : 12;

  const trailerId =
    anime.trailer?.site?.toLowerCase() === "youtube"
      ? anime.trailer.id
      : null;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* =====================================================
          HERO / BANNER
      ====================================================== */}

      <section className="relative h-[420px] w-full overflow-hidden md:h-[500px]">
        {banner ? (
          <Image
            src={banner}
            alt={`${title} banner`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-orange-950" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section className="relative z-10 mx-auto -mt-32 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Back button */}

        <Link
          href="/"
          className="mb-8 inline-flex items-center rounded-xl border border-white/10 bg-black/70 px-5 py-3 font-semibold backdrop-blur-md transition hover:border-orange-400/50 hover:bg-white/10"
        >
          ← Back Home
        </Link>

        <div className="grid gap-10 lg:grid-cols-[320px_1fr]">
          {/* =================================================
              POSTER
          ================================================== */}

          <div className="mx-auto w-full max-w-[320px]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/60">
              {poster ? (
                <Image
                  src={poster}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 320px, 320px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/40">
                  No Image
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />

              <div className="absolute bottom-4 left-4 rounded-lg bg-black/75 px-3 py-2 text-sm font-bold backdrop-blur">
                ⭐ {score}
              </div>
            </div>
          </div>

          {/* =================================================
              INFORMATION
          ================================================== */}

          <div className="min-w-0">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-orange-400">
              AnimeHub Discovery
            </p>

            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>

            {anime.title?.romaji &&
              anime.title.english &&
              anime.title.romaji !== anime.title.english && (
                <p className="mt-3 text-lg text-white/50">
                  {anime.title.romaji}
                </p>
              )}

            {/* META */}

            <div className="mt-7 flex flex-wrap gap-3">
              <span className="rounded-full bg-yellow-500 px-4 py-2 text-sm font-black text-black">
                ⭐ {score}
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                📺 {anime.episodes ?? "?"} Episodes
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                ⏱ {anime.duration ?? "?"} min
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm">
                📅 {anime.seasonYear ?? "Unknown"}
              </span>

              {anime.status && (
                <span className="rounded-full bg-emerald-600/90 px-4 py-2 text-sm font-bold">
                  {anime.status}
                </span>
              )}

              {anime.format && (
                <span className="rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-300">
                  {anime.format}
                </span>
              )}
            </div>

            {/* GENRES */}

            {anime.genres?.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {anime.genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-orange-400/40 hover:text-white"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* DESCRIPTION */}

            <div className="mt-9 max-w-4xl">
              <h2 className="mb-3 text-2xl font-black">
                About this Anime
              </h2>

              <p className="text-base leading-8 text-white/65">
                {description}
              </p>
            </div>

            {/* ACTIONS */}

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={`/watch/${anime.id}/1`}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-8 py-4 font-black text-black shadow-lg shadow-orange-500/20 transition hover:scale-105"
              >
                ▶ Watch Episode 1
              </Link>

              <Link
                href="/favorites"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-bold transition hover:bg-white/10"
              >
                ♡ My List
              </Link>

              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-bold transition hover:bg-white/10"
              >
                🔍 Search
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================
            INFORMATION CARDS
        ====================================================== */}

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
            <h2 className="mb-6 text-2xl font-black">
              📊 Anime Information
            </h2>

            <div className="space-y-4 text-white/65">
              <p>
                <strong className="text-white">Status:</strong>{" "}
                {anime.status ?? "Unknown"}
              </p>

              <p>
                <strong className="text-white">Episodes:</strong>{" "}
                {anime.episodes ?? "Unknown"}
              </p>

              <p>
                <strong className="text-white">Duration:</strong>{" "}
                {anime.duration ? `${anime.duration} min` : "Unknown"}
              </p>

              <p>
                <strong className="text-white">Season:</strong>{" "}
                {anime.season ?? "Unknown"}
              </p>

              <p>
                <strong className="text-white">Year:</strong>{" "}
                {anime.seasonYear ?? "Unknown"}
              </p>

              <p>
                <strong className="text-white">Score:</strong>{" "}
                ⭐ {score}
              </p>

              <p>
                <strong className="text-white">Popularity:</strong>{" "}
                {anime.popularity
                  ? anime.popularity.toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
            <h2 className="mb-6 text-2xl font-black">
              🌐 Language & Subtitles
            </h2>

            <p className="mb-5 text-sm leading-6 text-white/50">
              AniList does not provide reliable episode-level dub
              availability, so actual Hindi/English audio availability
              should be verified from your licensed streaming source.
            </p>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                🇺🇸 English metadata
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                🇮🇳 Hindi metadata
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                💬 Subtitles
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            PREMIUM NOTICE
        ====================================================== */}

        <div className="mt-12 rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-red-950/30 to-black p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-orange-400">
                🔒 AnimeHub Access
              </h2>

              <p className="mt-2 max-w-2xl leading-7 text-white/60">
                Episode 1 can be opened directly. Your authentication and
                episode-access rules can be applied to later episodes.
              </p>
            </div>

            <Link
              href={`/watch/${anime.id}/1`}
              className="shrink-0 rounded-xl bg-orange-500 px-6 py-3 text-center font-black text-black transition hover:scale-105"
            >
              Start Watching
            </Link>
          </div>
        </div>

        {/* =====================================================
            EPISODES
        ====================================================== */}

        <section className="mt-16">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-400">
                Watch
              </p>

              <h2 className="mt-2 text-4xl font-black">
                📺 Episodes
              </h2>
            </div>

            <p className="text-sm text-white/40">
              {anime.episodes
                ? `${anime.episodes} episodes`
                : "Episode count unavailable"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: episodeCount }).map((_, index) => {
              const episode = index + 1;

              return (
                <Link
                  key={episode}
                  href={`/watch/${anime.id}/${episode}`}
                  className={`group rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 ${
                    episode === 1
                      ? "border-orange-400/40 bg-gradient-to-br from-orange-500 to-red-500 text-black"
                      : "border-white/10 bg-white/[0.035] hover:border-orange-400/40 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-60">
                        Episode
                      </p>

                      <h3 className="mt-1 text-xl font-black">
                        {episode}
                      </h3>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        episode === 1
                          ? "bg-black/15"
                          : "bg-orange-500 text-black"
                      }`}
                    >
                      ▶
                    </div>
                  </div>

                  <p
                    className={`mt-4 text-sm ${
                      episode === 1
                        ? "text-black/70"
                        : "text-white/40"
                    }`}
                  >
                    {episode === 1
                      ? "Available to watch"
                      : "Login / access required"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            TRAILER
        ====================================================== */}

        {trailerId && (
          <section className="mt-16">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-400">
                Preview
              </p>

              <h2 className="mt-2 text-4xl font-black">
                🎬 Official Trailer
              </h2>
            </div>

            <div className="aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${trailerId}?rel=0`}
                title={`${title} official trailer`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
