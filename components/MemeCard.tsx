"use client";

import { db } from "@/lib/instant";
import { id } from "@instantdb/react";

interface Meme {
  id: string;
  imageData: string;
  topText: string;
  bottomText: string;
  createdAt: number;
  creator?: {
    id: string;
    email: string;
  };
  upvotes?: Array<{
    id: string;
    user?: {
      id: string;
    };
  }>;
}

interface MemeCardProps {
  meme: Meme;
}

export default function MemeCard({ meme }: MemeCardProps) {
  const { user } = db.useAuth();

  const upvoteCount = meme.upvotes?.length || 0;
  const hasUpvoted = user
    ? meme.upvotes?.some((upvote) => upvote.user?.id === user.id)
    : false;

  const toggleUpvote = async () => {
    if (!user) {
      alert("Please sign in to upvote memes!");
      return;
    }

    try {
      if (hasUpvoted) {
        // Find and remove the upvote
        const existingUpvote = meme.upvotes?.find(
          (upvote) => upvote.user?.id === user.id
        );
        if (existingUpvote) {
          await db.transact(db.tx.upvotes[existingUpvote.id].delete());
        }
      } else {
        // Create new upvote
        const upvoteId = id();
        await db.transact(
          db.tx.upvotes[upvoteId]
            .update({ createdAt: Date.now() })
            .link({ meme: meme.id, user: user.id })
        );
      }
    } catch (error) {
      console.error("Failed to toggle upvote:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all">
      {/* Meme Image */}
      <div className="relative">
        <img
          src={meme.imageData}
          alt={`${meme.topText} ${meme.bottomText}`}
          className="w-full h-auto"
        />
      </div>

      {/* Card Footer */}
      <div className="p-4">
        {/* Creator Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#e94560] to-[#ff6b6b] flex items-center justify-center text-white text-sm font-bold">
              {meme.creator?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm text-white truncate max-w-[150px]">
                {meme.creator?.email?.split("@")[0] || "Anonymous"}
              </p>
              <p className="text-xs text-gray-500">{formatDate(meme.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Upvote Button */}
        <button
          onClick={toggleUpvote}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-semibold ${
            hasUpvoted
              ? "bg-[#e94560] text-white"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          <svg
            className={`w-5 h-5 transition-transform ${hasUpvoted ? "scale-110" : ""}`}
            viewBox="0 0 24 24"
            fill={hasUpvoted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 4l-8 8h5v8h6v-8h5z" />
          </svg>
          <span>{upvoteCount}</span>
          <span>{upvoteCount === 1 ? "Upvote" : "Upvotes"}</span>
        </button>
      </div>
    </div>
  );
}
