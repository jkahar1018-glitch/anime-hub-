"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { FaHeart, FaPlay } from "react-icons/fa";

type Props = {
  id: number;
  title: string;
  image: string;
  score?: number | null;
};

type FavoriteItem = {
  id: number;
  title: string;
  image: string;
  score?: number | null;
};

function isFavoriteItem(item: unknown): item is FavoriteItem {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  if (!("id" in item)) {
    return false;
  }

  return typeof item.id === "number";
}

export default function AnimeCard({
  id,
  title,
  image,
  score,
}: Props) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const loadFavorite = () => {
      try {
        const saved = window.localStorage.getItem("favorites");

        if (!saved) {
          setFavorite(false);
          return;
        }

        const parsed: unknown = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
          setFavorite(false);
          return;
        }

        const exists = parsed.some(
          (item: unknown) =>
            isFavoriteItem(item) && item.id === id
        );

        setFavorite(exists);
      } catch (error) {
        console.error("Failed to read favorites:", error);
        setFavorite(false);
      }
    };

    loadFavorite();

    window.addEventListener("storage", loadFavorite);
    window.addEventListener("favoritesUpdated", loadFavorite);

    return () => {
      window.removeEventListener("storage", loadFavorite);
      window.removeEventListener(
        "favoritesUpdated",
        loadFavorite
      );
    };
  }, [id]);

  const toggleFavorite = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const saved =
        window.localStorage.getItem("favorites");

      let favorites: FavoriteItem[] = [];

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          favorites = parsed.filter(isFavoriteItem);
        }
      }

      const exists = favorites.some(
        (item) => item.id === id
      );

      let updatedFavorites: FavoriteItem[];

      if (exists) {
        updatedFavorites = favorites.filter(
          (item) => item.id !== id
        );
      } else {
        updatedFavorites = [
          ...favorites,
          {
            id,
            title,
            image,
            score: score ?? null,
          },
        ];
      }

      window.localStorage.setItem(
        "favorites",
        JSON.stringify(updatedFavorites)
      );

      setFavorite(!exists);

      window.dispatchEvent(
        new Event("favoritesUpdated")
      );
    } catch (error) {
      console.error(
        "Failed to update favorites:",
        error
      );
    }
  };

  return (
    <article className="anime-card">
      <div className="poster-wrap relative">
        <Link
          href={`/anime/${id}`}
          className="block h-full w-full"
          aria-label={`Open ${title}`}
        >
          <Image
            src={image}
            alt={title}
            fill
            unoptimized
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
            className="poster object-cover"
          />

          <div className="poster-shade" />

          <div className="card-play pointer-events-none">
            <FaPlay size={16} />
          </div>

          {typeof score === "number" && (
            <span className="card-score">
              ★ {(score / 10).toFixed(1)}
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={toggleFavorite}
          className={`card-heart ${
            favorite ? "liked" : ""
          }`}
          aria-label={
            favorite
              ? `Remove ${title} from favorites`
              : `Add ${title} to favorites`
          }
        >
          <FaHeart size={16} />
        </button>
      </div>

      <Link href={`/anime/${id}`}>
        <h3>{title}</h3>
        <p>Anime • HD UI</p>
      </Link>
    </article>
  );
}