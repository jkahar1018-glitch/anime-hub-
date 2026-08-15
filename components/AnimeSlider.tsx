"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar, FaPlay, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";

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
};

type Props = {
  anime?: Anime[];
};

export default function AnimeSlider({ anime = [] }: Props) {
  const validAnime = anime.filter(
    (item) =>
      item &&
      item.id &&
      (item.coverImage?.extraLarge || item.coverImage?.large)
  );

  if (validAnime.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center text-sm text-white/50">
        No anime available right now.
      </div>
    );
  }

  const canLoop = validAnime.length >= 7;

  return (
    <div className="relative w-full min-w-0 overflow-hidden">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{
          prevEl: ".anime-slider-prev",
          nextEl: ".anime-slider-next",
        }}
        loop={canLoop}
        watchOverflow={!canLoop}
        grabCursor
        speed={600}
        slidesPerView={1.35}
        spaceBetween={12}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          // Small phones
          0: {
            slidesPerView: 1.35,
            spaceBetween: 12,
          },

          // Large phones
          480: {
            slidesPerView: 2,
            spaceBetween: 12,
          },

          // Tablets
          640: {
            slidesPerView: 3,
            spaceBetween: 14,
          },

          // Small laptops
          900: {
            slidesPerView: 4,
            spaceBetween: 16,
          },

          // Desktop
          1200: {
            slidesPerView: 5,
            spaceBetween: 18,
          },

          // Large desktop
          1500: {
            slidesPerView: 6,
            spaceBetween: 20,
          },
        }}
        className="!overflow-visible"
      >
        {validAnime.map((item) => {
          const title =
            item.title?.english ||
            item.title?.romaji ||
            "Unknown Anime";

          const image =
            item.coverImage?.extraLarge ||
            item.coverImage?.large ||
            "";

          const score =
            typeof item.averageScore === "number" &&
            item.averageScore > 0
              ? (item.averageScore / 10).toFixed(1)
              : null;

          return (
            <SwiperSlide key={item.id} className="!h-auto">
              <Link
                href={`/anime/${item.id}`}
                className="group block w-full min-w-0"
              >
                {/* CARD */}
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-orange-500/10">
                  {/* IMAGE */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      sizes="
                        (max-width: 479px) 72vw,
                        (max-width: 639px) 46vw,
                        (max-width: 899px) 31vw,
                        (max-width: 1199px) 24vw,
                        (max-width: 1499px) 19vw,
                        16vw
                      "
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* IMAGE GRADIENT */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                    {/* RATING */}
                    {score && (
                      <div className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-lg bg-black/80 px-2 py-1 text-xs font-bold text-white backdrop-blur-md">
                        <FaStar
                          size={10}
                          className="text-yellow-400"
                        />
                        {score}
                      </div>
                    )}

                    {/* HD BADGE */}
                    <div className="absolute right-2 top-2 z-10 rounded-md bg-orange-500 px-1.5 py-1 text-[10px] font-black text-black">
                      HD
                    </div>

                    {/* PLAY */}
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-black opacity-0 shadow-lg shadow-orange-500/30 transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
                        <FaPlay size={12} />
                      </div>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="min-w-0 px-2.5 py-3">
                    <h3
                      className="truncate text-sm font-bold text-white sm:text-base"
                      title={title}
                    >
                      {title}
                    </h3>

                    <div className="mt-1.5 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-white/50 sm:text-xs">
                      {item.seasonYear && (
                        <span className="shrink-0">
                          {item.seasonYear}
                        </span>
                      )}

                      {item.seasonYear && item.episodes && (
                        <span className="shrink-0">•</span>
                      )}

                      {item.episodes && (
                        <span className="shrink-0">
                          {item.episodes} EP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* DESKTOP / TABLET ARROWS */}
      {validAnime.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous anime"
            className="anime-slider-prev absolute left-2 top-[42%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/80 text-white shadow-lg backdrop-blur-md transition hover:scale-110 hover:bg-orange-500 hover:text-black sm:flex"
          >
            <FaChevronLeft size={13} />
          </button>

          <button
            type="button"
            aria-label="Next anime"
            className="anime-slider-next absolute right-2 top-[42%] z-30 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/80 text-white shadow-lg backdrop-blur-md transition hover:scale-110 hover:bg-orange-500 hover:text-black sm:flex"
          >
            <FaChevronRight size={13} />
          </button>
        </>
      )}
    </div>
  );
}