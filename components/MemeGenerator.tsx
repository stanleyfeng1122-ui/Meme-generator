"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { db } from "@/lib/instant";
import { id } from "@instantdb/react";

const TEMPLATES = [
  { url: "https://i.imgflip.com/1bij.jpg", name: "One Does Not Simply" },
  { url: "https://i.imgflip.com/9vct.jpg", name: "Success Kid" },
  { url: "https://i.imgflip.com/1ur9b0.jpg", name: "Distracted Boyfriend" },
  { url: "https://i.imgflip.com/30b1gx.jpg", name: "Drake" },
  { url: "https://i.imgflip.com/26am.jpg", name: "Bad Luck Brian" },
  { url: "https://i.imgflip.com/1g8my4.jpg", name: "Expanding Brain" },
  { url: "https://i.imgflip.com/4t0m5.jpg", name: "Change My Mind" },
  { url: "https://i.imgflip.com/1otk96.jpg", name: "Is This a Pigeon" },
];

interface MemeGeneratorProps {
  onMemePosted?: () => void;
}

export default function MemeGenerator({ onMemePosted }: MemeGeneratorProps) {
  const { user } = db.useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Meme settings
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState("Impact");
  const [textColor, setTextColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [textPadding, setTextPadding] = useState(20);
  const [allCaps, setAllCaps] = useState(true);

  const wrapText = useCallback(
    (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    },
    []
  );

  const updateMeme = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    // Set text style
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Process text
    const top = allCaps ? topText.toUpperCase() : topText;
    const bottom = allCaps ? bottomText.toUpperCase() : bottomText;

    // Draw top text
    if (top) {
      const lines = wrapText(ctx, top, canvas.width - 20);
      let yPos = textPadding;
      lines.forEach((line) => {
        ctx.strokeText(line, canvas.width / 2, yPos);
        ctx.fillText(line, canvas.width / 2, yPos);
        yPos += fontSize + 5;
      });
    }

    // Draw bottom text
    if (bottom) {
      ctx.textBaseline = "bottom";
      const lines = wrapText(ctx, bottom, canvas.width - 20);
      let yPos = canvas.height - textPadding;
      for (let i = lines.length - 1; i >= 0; i--) {
        ctx.strokeText(lines[i], canvas.width / 2, yPos);
        ctx.fillText(lines[i], canvas.width / 2, yPos);
        yPos -= fontSize + 5;
      }
    }
  }, [
    currentImage,
    topText,
    bottomText,
    fontSize,
    fontFamily,
    textColor,
    strokeColor,
    strokeWidth,
    textPadding,
    allCaps,
    wrapText,
  ]);

  useEffect(() => {
    updateMeme();
  }, [updateMeme]);

  const loadImage = (src: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas size (max 600px width while maintaining aspect ratio)
      const maxWidth = 600;
      const scale = maxWidth / img.width;
      canvas.width = img.width > maxWidth ? maxWidth : img.width;
      canvas.height = img.width > maxWidth ? img.height * scale : img.height;

      setCurrentImage(img);
    };
    img.onerror = () => {
      alert("Failed to load image. Please try another one.");
    };
    img.src = src;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedTemplate(null);
          loadImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedTemplate(null);
          loadImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSelect = (url: string) => {
    setSelectedTemplate(url);
    loadImage(url);
  };

  const resetMeme = () => {
    setTopText("");
    setBottomText("");
    setFontSize(40);
    setFontFamily("Impact");
    setTextColor("#ffffff");
    setStrokeColor("#000000");
    setStrokeWidth(3);
    setTextPadding(20);
    setAllCaps(true);
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) {
      alert("Please load an image first!");
      return;
    }

    const link = document.createElement("a");
    link.download = `meme-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const postMeme = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) {
      alert("Please load an image first!");
      return;
    }

    if (!user) {
      alert("Please sign in to post memes!");
      return;
    }

    setIsPosting(true);
    try {
      const imageData = canvas.toDataURL("image/png");
      const memeId = id();

      await db.transact(
        db.tx.memes[memeId]
          .update({
            imageData,
            topText,
            bottomText,
            createdAt: Date.now(),
          })
          .link({ creator: user.id })
      );

      // Reset after posting
      resetMeme();
      setCurrentImage(null);
      setSelectedTemplate(null);
      onMemePosted?.();
      alert("Meme posted successfully!");
    } catch (error) {
      console.error("Failed to post meme:", error);
      alert("Failed to post meme. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Settings Panel */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-[#e94560] mb-6">Settings</h2>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-[#e94560]/50 rounded-xl p-8 text-center cursor-pointer transition-all hover:border-[#e94560] hover:bg-[#e94560]/10 mb-6"
        >
          <svg
            className="w-12 h-12 mx-auto mb-4 fill-[#e94560]"
            viewBox="0 0 24 24"
          >
            <path d="M19 7V5c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v2c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM7 5h10v2H7V5zm12 13H5V9h14v9zm-7-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          <p className="text-gray-400">Click to upload an image or drag & drop</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Templates */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 mb-3">Or choose a template:</h3>
          <div className="grid grid-cols-4 gap-2">
            {TEMPLATES.map((template) => (
              <div
                key={template.url}
                onClick={() => handleTemplateSelect(template.url)}
                className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${
                  selectedTemplate === template.url
                    ? "border-[#e94560] shadow-[0_0_15px_rgba(233,69,96,0.5)]"
                    : "border-transparent"
                }`}
              >
                <img
                  src={template.url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <hr className="border-white/10 my-6" />

        {/* Text Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Top Text</label>
            <input
              type="text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="Enter top text..."
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e94560]/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Bottom Text</label>
            <input
              type="text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
              placeholder="Enter bottom text..."
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e94560]/50"
            />
          </div>

          {/* Controls Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Font Size <span className="text-[#e94560] font-semibold">{fontSize}px</span>
              </label>
              <input
                type="range"
                min="20"
                max="80"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full h-2 rounded bg-white/20 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#e94560]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Font Style</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e94560]/50"
              >
                <option value="Impact" className="bg-[#1a1a2e]">Impact (Classic)</option>
                <option value="Arial Black" className="bg-[#1a1a2e]">Arial Black</option>
                <option value="Comic Sans MS" className="bg-[#1a1a2e]">Comic Sans MS</option>
                <option value="Courier New" className="bg-[#1a1a2e]">Courier New</option>
              </select>
            </div>
          </div>

          {/* Controls Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-12 rounded-lg cursor-pointer bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Outline Color</label>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-full h-12 rounded-lg cursor-pointer bg-transparent"
              />
            </div>
          </div>

          {/* Controls Row 3 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Outline Width <span className="text-[#e94560] font-semibold">{strokeWidth}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="w-full h-2 rounded bg-white/20 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#e94560]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Text Padding <span className="text-[#e94560] font-semibold">{textPadding}px</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={textPadding}
                onChange={(e) => setTextPadding(parseInt(e.target.value))}
                className="w-full h-2 rounded bg-white/20 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#e94560]"
              />
            </div>
          </div>

          {/* All Caps Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allCaps"
              checked={allCaps}
              onChange={(e) => setAllCaps(e.target.checked)}
              className="w-5 h-5 accent-[#e94560] cursor-pointer"
            />
            <label htmlFor="allCaps" className="text-gray-400 cursor-pointer">
              ALL CAPS TEXT
            </label>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-[#e94560] mb-6">Preview</h2>

        {/* Canvas Container */}
        <div className="flex justify-center items-center min-h-[400px] bg-black/30 rounded-xl mb-6 overflow-hidden">
          {currentImage ? (
            <canvas ref={canvasRef} className="max-w-full max-h-[500px] rounded-lg" />
          ) : (
            <>
              <canvas ref={canvasRef} className="hidden" />
              <p className="text-gray-500 text-lg">
                Upload an image or select a template to get started
              </p>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={resetMeme}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors font-semibold"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
            </svg>
            Reset
          </button>
          <button
            onClick={downloadMeme}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors font-semibold"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Download
          </button>
          <button
            onClick={postMeme}
            disabled={isPosting || !user || !currentImage}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#e94560] to-[#ff6b6b] text-white font-semibold hover:shadow-[0_10px_30px_rgba(233,69,96,0.4)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
          >
            {isPosting ? (
              "Posting..."
            ) : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Post Meme
              </>
            )}
          </button>
        </div>
        {!user && (
          <p className="text-center text-gray-400 mt-4 text-sm">
            Sign in to post memes to the feed
          </p>
        )}
      </div>
    </div>
  );
}
