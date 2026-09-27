"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, X, UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SimilarItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  image: string;
  similarity?: number;
}

export default function VisualSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SimilarItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedImage(null);
    setSelectedFile(null);
    setResults([]);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setResults([]);
  };

  const handleSearch = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await fetch("/api/visual-search", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to perform visual search.");
      }

      setResults(data.products || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to connect to visual search service.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button in Search Bar */}
      <button
        type="button"
        onClick={handleOpen}
        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
        title="Search by image (AI Visual Search)"
      >
        <Camera className="w-4 h-4" />
      </button>

      {/* Modal Backdrop & Dialog Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 relative max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">AI Visual Search</h3>
                  <p className="text-xs text-gray-400">Search products using MobileNetV3 visual embeddings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 py-4 space-y-4">
              {/* Drop / Upload Box */}
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-indigo-50/20"
                >
                  <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">Click to upload an image</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or WEBP up to 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-gray-200 bg-slate-50 shadow-xs">
                    <Image
                      src={selectedImage}
                      alt="Uploaded preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200"
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={handleSearch}
                      disabled={isLoading}
                      className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Find Similar Products</span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* Error Notice */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    <p className="text-[11px] text-red-500 mt-0.5">
                      Ensure your FastAPI ML service is running on port 8000.
                    </p>
                  </div>
                </div>
              )}

              {/* Results Grid */}
              {results.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Top Visually Matching Items
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {results.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        onClick={handleClose}
                        className="group bg-white border border-gray-100 rounded-xl p-2.5 hover:shadow-md transition block"
                      >
                        <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 mb-2">
                          <Image
                            src={item.image || "/placeholder-product.png"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <h5 className="text-xs font-semibold text-gray-800 truncate group-hover:text-indigo-600">
                          {item.name}
                        </h5>
                        <p className="text-xs font-bold text-gray-900 mt-0.5">
                          {formatCurrency(item.discountPrice ?? item.price)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}