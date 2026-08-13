"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaPlay,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

type Anime = {
  id: number;

  title: {
    romaji: string;
    english?: string | null;
  };

  description?: string | null;
  averageScore?: number | null;
  episodes?: number | null;
  seasonYear?: number | null;
  genres?: string[];
  bannerImage?: string | null;

  coverImage: {
    large: string;
    extraLarge?: string | null;
  };
};

export default function Hero({
  slides,
}: {
  slides: Anime[];
}) {
  const safeSlides = slides?.filter(Boolean).slice(0, 8) || [];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (safeSlides.length < 2) return;

    const timer = setInterval(() => {
      setCurrent(
        (value) => (value + 1) % safeSlides.length
      );
    }, 6500);

    return () => clearInterval(timer);
  }, [safeSlides.length]);

  if (!safeSlides.length) {
    return (
      <section className="hero-empty">
        <div>
          <span>ANIMEHUB</span>
          <h1>Discover Your Next Anime</h1>
        </div>
      </section>
    );
  }

  const anime = safeSlides[current];

  const title =
    anime.title?.english ||
    anime.title?.romaji ||
    "Anime";

  const description = (
    anime.description ||
    "Discover amazing anime, new releases and popular series on AnimeHub."
  )
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();

  const shortDescription =
    description.length > 240
      ? description.slice(0, 240) + "…"
      : description;

  const go = (direction: number) => {
    setCurrent(
      (value) =>
        (value + direction + safeSlides.length) %
        safeSlides.length
    );
  };

  const image =
    anime.bannerImage ||
    anime.coverImage?.extraLarge ||
    anime.coverImage?.large;

  return (
    <section className="hero">
      <AnimatePresence mode="wait">
        <motion.div
          key={anime.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="hero-slide"
        >
          <Image
            src={image}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="hero-bg"
          />

          <div className="hero-overlay" />
          <div className="hero-vignette" />

          <div className="hero-content">
            <div className="hero-label">
              <span>ANIMEHUB</span>
              <b>ORIGINAL DISCOVERY</b>
            </div>

            <h1>{title}</h1>

            <div className="hero-meta">
              {anime.averageScore &&
                anime.averageScore > 0 && (
                  <span className="hero-score">
                    ★ {(anime.averageScore / 10).toFixed(1)}
                  </span>
                )}

              {anime.seasonYear && (
                <span>{anime.seasonYear}</span>
              )}

              {anime.episodes && (
                <span>{anime.episodes} Episodes</span>
              )}

              <span className="hero-hd">HD</span>
            </div>

            {anime.genres?.length ? (
              <div className="hero-genres">
                {anime.genres.slice(0, 4).map((genre) => (
                  <span key={genre}>{genre}</span>
                ))}
              </div>
            ) : null}

            <p>{shortDescription}</p>

            <div className="hero-actions">
              <Link
                href={`/anime/${anime.id}`}
                className="btn-primary"
              >
                <FaPlay />
                Watch Now
              </Link>

              <Link
                href={`/favorites`}
                className="btn-secondary"
              >
                <FaPlus />
                My List
              </Link>

              <Link
                href="/search"
                className="hero-search-button"
                aria-label="Search anime"
              >
                <FaSearch />
              </Link>
            </div>
          </div>

          <div className="hero-controls">
            <button
              onClick={() => go(-1)}
              aria-label="Previous slide"
            >
              <FaChevronLeft />
            </button>

            <div className="hero-dots">
              {safeSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrent(index)}
                  className={
                    index === current ? "active" : ""
                  }
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              aria-label="Next slide"
            >
              <FaChevronRight />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
