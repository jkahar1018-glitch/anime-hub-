import Link from "next/link";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedSection from "@/components/FeaturedSection";
import AnimeSlider from "@/components/AnimeSlider";
import ScrollToTop from "@/components/ScrollToTop";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import CommunityChat from "@/components/CommunityChat";

import {
  FaClock,
  FaCompass,
  FaHeart,
  FaUser,
} from "react-icons/fa";

import {
  getTrendingAnime,
  getTopRatedAnime,
  getLatestAnime,
  getPopularAnime,
} from "@/lib/api";

type Anime = {
  id: number;

  title: {
    romaji: string;
    english?: string | null;
  };

  coverImage: {
    large: string;
    extraLarge?: string | null;
  };

  averageScore?: number | null;
  episodes?: number | null;
  seasonYear?: number | null;

  description?: string | null;
  bannerImage?: string | null;
  genres?: string[];
};

export default async function Home() {
  let trending: Anime[] = [];
  let top: Anime[] = [];
  let latest: Anime[] = [];
  let popular: Anime[] = [];

  try {
    const [
      trendingResult,
      topResult,
      latestResult,
      popularResult,
    ] = await Promise.all([
      getTrendingAnime(14),
      getTopRatedAnime(14),
      getLatestAnime(14),
      getPopularAnime(14),
    ]);

    trending = Array.isArray(trendingResult)
      ? trendingResult
      : [];

    top = Array.isArray(topResult)
      ? topResult
      : [];

    latest = Array.isArray(latestResult)
      ? latestResult
      : [];

    popular = Array.isArray(popularResult)
      ? popularResult
      : [];
  } catch (error) {
    console.error(
      "AnimeHub Anime API Error:",
      error
    );
  }

  /*
   * India / Hindi Picks
   *
   * This uses the popular list as the current
   * India/Hindi discovery row. Later we can connect
   * this to a dedicated Hindi-language data source.
   */
  const hindi = popular.slice(0, 14);

  return (
    <main className="site min-h-screen overflow-x-hidden bg-black text-white">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <Navbar />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="hero-wrapper">
        <Hero slides={trending} />
      </section>

      {/* =================================================
          FEATURED
      ================================================= */}

      <section className="home-content featured-home">
        <FeaturedSection />
      </section>

      {/* =================================================
          TRENDING
      ================================================= */}

      <AnimeSection
        id="trending"
        icon="🔥"
        title="Trending Now"
        anime={trending}
      />

      {/* =================================================
          INDIA / HINDI PICKS
      ================================================= */}

      <AnimeSection
        id="hindi"
        icon="🇮🇳"
        title="India Anime Picks"
        anime={hindi}
      />

      {/* =================================================
          NEW & AIRING
      ================================================= */}

      <AnimeSection
        id="latest"
        icon="🆕"
        title="New & Airing"
        anime={latest}
      />

      {/* =================================================
          TOP RATED
      ================================================= */}

      <AnimeSection
        id="top-rated"
        icon="⭐"
        title="Top Rated"
        anime={top}
      />

      {/* =================================================
          MOST POPULAR
      ================================================= */}

      <AnimeSection
        id="popular"
        icon="👑"
        title="Most Popular"
        anime={popular}
      />

      {/* =================================================
          QUICK ACCESS
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-6">
          <div className="mb-2 inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
            AnimeHub
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Quick Access
          </h2>

          <p className="mt-1 text-sm text-white/45">
            Your AnimeHub shortcuts
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* BROWSE */}

          <QuickAccessCard
            href="/browse"
            icon={<FaCompass size={20} />}
            title="Browse Anime"
            description="Explore anime by genres, popularity and more."
          />

          {/* FAVORITES */}

          <QuickAccessCard
            href="/favorites"
            icon={<FaHeart size={20} />}
            title="My Favorites"
            description="Open your saved anime collection."
          />

          {/* WATCH HISTORY */}

          <QuickAccessCard
            href="/watch-history"
            icon={<FaClock size={20} />}
            title="Watch History"
            description="Continue watching from where you stopped."
          />

          {/* PROFILE */}

          <QuickAccessCard
            href="/profile"
            icon={<FaUser size={20} />}
            title="My Profile"
            description="Manage your AnimeHub account."
          />

          {/* SEARCH */}

          <QuickAccessCard
            href="/search"
            icon={<span className="text-lg">🔎</span>}
            title="Search Anime"
            description="Find your favorite anime quickly."
          />

          {/* TRENDING */}

          <QuickAccessCard
            href="#trending"
            icon={<span className="text-lg">🔥</span>}
            title="Trending Now"
            description="See what's popular on AnimeHub."
          />
        </div>
      </section>

      {/* =================================================
          AI CHAT
      ================================================= */}

      <section className="home-content ai-section">
        <AIChatWidget />
      </section>

      {/* =================================================
          COMMUNITY CHAT
      ================================================= */}

      <CommunityChat />

      {/* =================================================
          BACK TO TOP
      ================================================= */}

      <ScrollToTop />

      {/* =================================================
          FOOTER
      ================================================= */}

      <Footer />

    </main>
  );
}

/* =========================================================
   ANIME SECTION
========================================================= */

interface AnimeSectionProps {
  id: string;
  icon: string;
  title: string;
  anime: Anime[];
}

function AnimeSection({
  id,
  icon,
  title,
  anime,
}: AnimeSectionProps) {
  return (
    <section
      id={id}
      className="home-content anime-section scroll-mt-24"
    >
      <div className="section-heading">

        <div className="section-title">
          <span aria-hidden="true">
            {icon}
          </span>

          <h2>{title}</h2>
        </div>

        <Link
          href="/browse"
          className="section-see-all"
        >
          See all →
        </Link>
      </div>

      {anime.length > 0 ? (
        <AnimeSlider anime={anime} />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center">
          <p className="text-sm text-white/40">
            Anime data is temporarily unavailable.
          </p>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   QUICK ACCESS CARD
========================================================= */

interface QuickAccessCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function QuickAccessCard({
  href,
  icon,
  title,
  description,
}: QuickAccessCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-orange-500/[0.08]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-black">
        {icon}
      </div>

      <div className="min-w-0">
        <h3 className="font-bold text-white">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-white/40">
          {description}
        </p>
      </div>

      <span className="ml-auto text-white/20 transition group-hover:translate-x-1 group-hover:text-orange-400">
        →
      </span>
    </Link>
  );
}