"use client";

export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { productApi } from "../services/productApi";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Product } from "../services/types";
import { useQuery } from "@tanstack/react-query";

function SearchResults({ query }: { query: string }) {
  const router = useRouter();

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["searchProducts", query],
    queryFn: async () => {
      if (!query || !query.trim()) {
        return [];
      }
      const response = await productApi.searchProducts(query.trim(), 20);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to search products");
    },
    enabled: !!query && !!query.trim(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash;
  };

  if (!query) {
    return null;
  }

  const errorMessage = error instanceof Error ? error.message : "An error occurred while searching";

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111]">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-500 mt-1">
          {products.length} products found
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-500">Searching...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No products found for "{query}". Try a different search.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: hashCode(product._id) * 0.01 }}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {product.images && product.images.length > 0 ? (
                  <div className="relative h-48">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {product.isTrending && (
                      <span className="absolute top-2 right-2 bg-red-500/20 text-red-500 px-2 py-1 text-xs rounded">
                        Trending
                      </span>
                    )}
                    {product.isPopular && (
                      <span className="absolute top-2 left-2 bg-green-500/20 text-green-500 px-2 py-1 text-xs rounded">
                        Popular
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <svg
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-[#111] mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-gray-500 text-sm mb-3 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    {product.price > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 text-sm">Price:</span>
                        <span className="font-medium text-[#111]">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {product.offerPrice !== undefined && product.offerPrice > 0 && product.offerPrice < product.price && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 text-sm line-through">Offer Price:</span>
                        <span className="font-medium text-red-500">
                          ₹{product.offerPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {product.trainerPrice !== undefined && product.trainerPrice > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 text-sm">Trainer Price:</span>
                        <span className="font-medium text-yellow-500">
                          ₹{product.trainerPrice.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => router.push(`/product/${product._id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Added to cart!");
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 border border-green-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated || !isAuthenticated) {
    router.push("/login");
    return null;
  }

  const query = searchParams?.get("query") || "";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push("/user-dashboard")}
              className="flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back</span>
            </button>

            <div className="flex-1 max-w-2xl mx-8 relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  defaultValue={query}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      router.push(`/search?query=${encodeURIComponent((e.currentTarget as HTMLInputElement).value)}`);
                    }
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Search products..."]') as HTMLInputElement | null;
                    if (input) {
                      router.push(`/search?query=${encodeURIComponent(input.value)}`);
                    }
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <SearchResults query={query} />
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div></div>}>
      <SearchPageContent />
    </Suspense>
  );
}