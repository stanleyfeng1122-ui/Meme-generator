"use client";

import MemeGenerator from "@/components/MemeGenerator";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#e94560] via-[#ff6b6b] to-[#feca57] bg-clip-text text-transparent mb-2">
            Create a Meme
          </h1>
          <p className="text-gray-400 text-lg">
            Design your masterpiece and share it with the world
          </p>
        </header>
        <MemeGenerator onMemePosted={() => router.push("/")} />
      </div>
    </main>
  );
}
