"use client";

import { db } from "@/lib/instant";
import MemeCard from "./MemeCard";

export default function MemeFeed() {
  const { isLoading, error, data } = db.useQuery({
    memes: {
      creator: {},
      upvotes: {
        user: {},
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e94560]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg">Failed to load memes</p>
        <p className="text-gray-500 text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  const memes = data?.memes || [];

  // Sort memes by upvote count (most popular first), then by creation date
  const sortedMemes = [...memes].sort((a, b) => {
    const aUpvotes = a.upvotes?.length || 0;
    const bUpvotes = b.upvotes?.length || 0;
    if (bUpvotes !== aUpvotes) {
      return bUpvotes - aUpvotes;
    }
    return b.createdAt - a.createdAt;
  });

  if (sortedMemes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">:(</div>
        <h3 className="text-xl text-gray-400 mb-2">No memes yet</h3>
        <p className="text-gray-500">Be the first to create and share a meme!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedMemes.map((meme) => (
        <MemeCard key={meme.id} meme={meme} />
      ))}
    </div>
  );
}
