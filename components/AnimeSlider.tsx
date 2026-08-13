"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar, FaPlay } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

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

  return (
    <div className="anime-slider-wrapper">
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        loop={validAnime.length > 6}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          480: {
            slidesPerView: 2,
            spaceBetween: 12,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 14,
          },
          900: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
          1200: {
            slidesPerView: 5,
            spaceBetween: 18,
          },
          1500: {
            slidesPerView: 6,
            spaceBetween: 20,
          },
        }}
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

          return (
            <SwiperSlide key={item.id}>
              <Link
                href={`/anime/${item.id}`}
                className="anime-card group block"
              >
                <div className="anime-card-image-wrap">
                  <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="
                      (max-width: 480px) 45vw,
                      (max-width: 640px) 30vw,
                      (max-width: 900px) 23vw,
                      (max-width: 1200px) 19vw,
                      16vw
                    "
                    className="anime-card-image"
                  />

                  <div className="anime-card-gradient" />

                  {item.averageScore &&
                    item.averageScore > 0 && (
                      <div className="anime-rating">
                        <FaStar size={11} />
                        <span>
                          {(item.averageScore / 10).toFixed(1)}
                        </span>
                      </div>
                    )}

                  <div className="anime-play">
                    <FaPlay size={12} />
                  </div>
                </div>

                <div className="anime-card-content">
                  <h3
                    className="anime-card-title"
                    title={title}
                  >
                    {title}
                  </h3>

                  <div className="anime-card-meta">
                    {item.seasonYear && (
                      <span>{item.seasonYear}</span>
                    )}

                    {item.episodes && (
                      <>
                        <span>•</span>
                        <span>{item.episodes} EP</span>
                      </>
                    )}

                    <span>•</span>

                    <span className="hd-badge">
                      HD
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}