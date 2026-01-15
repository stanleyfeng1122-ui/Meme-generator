"use client";

import { useState } from "react";
import { db } from "@/lib/instant";

export default function AuthButton() {
  const { isLoading, user, error } = db.useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-gray-600 text-white opacity-50 cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (error) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-lg bg-red-600 text-white"
      >
        Auth Error
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300 hidden sm:inline">
          {user.email}
        </span>
        <button
          onClick={() => db.auth.signOut()}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      await db.auth.sendMagicCode({ email });
      setSentTo(email);
    } catch (err: unknown) {
      const error = err as { body?: { message?: string }; message?: string };
      alert("Failed to send code: " + (error.body?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setIsSubmitting(true);
    try {
      await db.auth.signInWithMagicCode({ email: sentTo, code });
    } catch (err: unknown) {
      const error = err as { body?: { message?: string }; message?: string };
      alert("Failed to verify code: " + (error.body?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show code input if we've sent a code
  if (sentTo) {
    return (
      <form onSubmit={handleVerifyCode} className="flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          className="px-3 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-[#e94560]/50"
        />
        <button
          type="submit"
          disabled={isSubmitting || !code}
          className="px-4 py-2 rounded-lg bg-[#e94560] hover:bg-[#ff6b6b] text-white transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "..." : "Verify"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSentTo("");
            setCode("");
          }}
          className="px-2 py-2 text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="px-3 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-[#e94560]/50"
      />
      <button
        type="submit"
        disabled={isSubmitting || !email}
        className="px-4 py-2 rounded-lg bg-[#e94560] hover:bg-[#ff6b6b] text-white transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "..." : "Sign In"}
      </button>
    </form>
  );
}
