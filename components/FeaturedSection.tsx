"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaFire, FaStar, FaHeart } from "react-icons/fa";

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.2,
      duration: 0.6,
    },
  }),
};

export default function FeaturedSection() {
  return (
    <section className="bg-gradient-to-b from-black via-gray-950 to-black px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <p className="mb-3 font-semibold uppercase tracking-widest text-purple-500">
          Discover
        </p>

        <h2 className="text-5xl font-extrabold md:text-6xl">
          Explore Anime
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
          Browse the best Trending, Top Rated and Favorite anime with a modern
          experience.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        {/* Trending */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, y: -10 }}
        >
          <Link href="#trending">
            <div className="group cursor-pointer rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 via-gray-900 to-black p-10 transition-all duration-500 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/30">
              <div className="mb-6 inline-flex rounded-full bg-purple-600/20 p-5">
                <FaFire className="text-5xl text-orange-500" />
              </div>

              <h3 className="text-3xl font-bold">Trending Anime</h3>

              <p className="mt-4 text-gray-400">
                Discover today&apos;s hottest anime loved by millions.
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Top Rated */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, y: -10 }}
        >
          <Link href="#top-rated">
            <div className="group cursor-pointer rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/30 via-gray-900 to-black p-10 transition-all duration-500 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/30">
              <div className="mb-6 inline-flex rounded-full bg-yellow-500/20 p-5">
                <FaStar className="text-5xl text-yellow-400" />
              </div>

              <h3 className="text-3xl font-bold">Top Rated</h3>

              <p className="mt-4 text-gray-400">
                Explore the highest rated anime of all time.
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Favorites */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          whileHover={{ scale: 1.05, y: -10 }}
        >
          <Link href="/favorites">
            <div className="group cursor-pointer rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-900/30 via-gray-900 to-black p-10 transition-all duration-500 hover:border-pink-500 hover:shadow-2xl hover:shadow-pink-500/30">
              <div className="mb-6 inline-flex rounded-full bg-pink-500/20 p-5">
                <FaHeart className="text-5xl text-pink-500" />
              </div>

              <h3 className="text-3xl font-bold">Favorites</h3>

              <p className="mt-4 text-gray-400">
                Save your favourite anime collection.
              </p>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}