"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { authApi } from "../services/authApi";
import { useRouter } from "next/navigation";
import WishlistButton from "./WishlistButton";
import CartButton from "./CartButton";

// Product interface matching the backend schema
export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  offerPrice?: number;
  trainerPrice?: number;
  weight?: string;
  serve?: string;
  isImported: boolean;
  inStock: boolean;
  flavour?: string;
  company?: string;
  manufacturer?: string;
  howToUse?: string;
  whenToUse?: string;
  images: string[];
  isActive: boolean;
  sortOrder: number;
  category?: string;
  isTrending: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PopularProductsSectionProps {
  isVerified: boolean;
  className?: string;
}

export default function PopularProductsSection({ isVerified, className = "" }: PopularProductsSectionProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.getProducts();
      if (response.success && response.data) {
        // Filter popular and active products
        const popularProducts = response.data
          .filter((product: Product) => product.isPopular && product.isActive)
          .sort((a: Product, b: Product) => a.sortOrder - b.sortOrder);
        setProducts(popularProducts);
      } else {
        setError(response.error || "Failed to fetch products");
      }
    } catch (err) {
      setError("An error occurred while fetching products");
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Check scroll position
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  // Scroll handlers
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate discount percentage
  const getDiscount = (price: number, offerPrice: number): number => {
    return Math.round(((price - offerPrice) / price) * 100);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="h-40 bg-gray-100"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                <div className="h-6 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-500 mb-2">Unable to load products</p>
          <button
            onClick={fetchProducts}
            className="text-blue-600 hover:text-blue-700 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // No products
  if (products.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-500">No popular products available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold text-black">Popular Products</h2>
          <p className="text-gray-600 text-sm">Top picks for you</p>
        </motion.div>

        {/* Navigation Arrows */}
        {products.length > 3 && (
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Products Grid - Horizontal Scroll */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
        onScroll={checkScrollPosition}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex-shrink-0 w-[140px] xs:w-[150px] sm:w-[170px] md:w-[200px] lg:w-[230px] xl:w-[260px] 2xl:w-[280px] bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-400 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg group"
          >
            {/* Product Image */}
            <div 
              className="relative h-40 bg-gray-100 cursor-pointer overflow-hidden"
              onClick={() => router.push(`/product/${product._id}`)}
            >
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Out of Stock Overlay */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm px-3 py-1 bg-red-600 rounded">Out of Stock</span>
                </div>
              )}
              
              {/* Discount Badge */}
              {product.offerPrice && product.price > product.offerPrice && isVerified && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {getDiscount(product.price, product.offerPrice)}% OFF
                </div>
              )}

              {/* Wishlist Button */}
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton 
                  product={{
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    offerPrice: product.offerPrice,
                    images: product.images,
                    inStock: product.inStock,
                  }}
                  size="sm"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="p-3">
              {/* Product Name */}
              <h3 
                className="text-gray-900 text-sm font-semibold mb-1 line-clamp-1 cursor-pointer hover:text-red-600 transition-colors"
                onClick={() => router.push(`/product/${product._id}`)}
              >
                {product.name}
              </h3>

              {/* Description */}
              {product.description && (
                <p className="text-gray-500 text-xs line-clamp-1 mb-2">
                  {product.description}
                </p>
              )}

              {/* Price Section */}
              <div className="mb-3">
                {isVerified ? (
                  <div className="space-y-1">
                    {/* Regular Price */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.offerPrice ? (
                        <>
                          <span className="text-gray-900 font-bold text-lg">
                            {formatPrice(product.offerPrice)}
                          </span>
                          <span className="text-gray-500 line-through text-sm">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-900 font-bold text-lg">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    {/* Trainer Price */}
                    {product.trainerPrice && product.trainerPrice > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-600 text-xs font-medium">Trainer:</span>
                        <span className="text-emerald-600 font-semibold text-sm">
                          {formatPrice(product.trainerPrice)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">Not Verified</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <CartButton 
                product={{
                  _id: product._id,
                  name: product.name,
                  price: product.price,
                  offerPrice: product.offerPrice,
                  images: product.images,
                  inStock: product.inStock,
                  weight: product.weight,
                  flavour: product.flavour,
                }}
                size="sm"
                fullWidth
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll hint for mobile */}
      {products.length > 3 && (
        <div className="flex justify-center mt-2 md:hidden">
          <p className="text-gray-500 text-xs">Swipe to see more →</p>
        </div>
      )}
    </div>
  );
}
