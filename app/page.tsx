"use client";

import MemeFeed from "@/components/MemeFeed";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e94560] via-[#ff6b6b] to-[#feca57] bg-clip-text text-transparent mb-2">
            Meme Feed
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            Discover and upvote the best memes from the community
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#e94560] to-[#ff6b6b] text-white font-semibold hover:shadow-[0_10px_30px_rgba(233,69,96,0.4)] hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Create Meme
          </Link>
        </header>
        <MemeFeed />
      </div>
    </main>
  );
}
