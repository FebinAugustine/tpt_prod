"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "../services/authApi";

// Banner interface matching the backend schema
export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface BannerSliderProps {
  className?: string;
}

export default function BannerSlider({ className = "" }: BannerSliderProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch banners from API
  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.getBanners();
      if (response.success && response.data) {
        // Filter only active banners and sort by sortOrder
        const activeBanners = response.data
          .filter((banner: Banner) => banner.isActive)
          .sort((a: Banner, b: Banner) => a.sortOrder - b.sortOrder);
        setBanners(activeBanners);
      } else {
        setError(response.error || "Failed to fetch banners");
      }
    } catch (err) {
      setError("An error occurred while fetching banners");
      console.error("Error fetching banners:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-rotate banner every 5 seconds
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Auto-rotation timer
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Handle dot navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Handle previous/next navigation
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className={`w-full h-40 md:h-56 lg:h-72 bg-gray-100 animate-pulse rounded-2xl ${className}`}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`w-full h-40 md:h-56 lg:h-72 bg-linear-to-br from-blue-900 via-purple-900 to-black rounded-2xl flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <p className="text-gray-400 mb-2">Unable to load banners</p>
          <button
            onClick={fetchBanners}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // No banners - show placeholder gradient
  if (banners.length === 0) {
    return (
      <div
        className={`w-full h-40 md:h-56 lg:h-72 bg-linear-to-br from-blue-900 via-purple-900 to-black rounded-2xl flex items-center justify-center ${className}`}
      >
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-300 font-medium">No banners available</p>
          <p className="text-gray-500 text-sm mt-1">
            Check back soon for exciting offers!
          </p>
        </div>
      </div>
    );
  }

  // Single banner - no slider needed
  if (banners.length === 1) {
    const banner = banners[0];
    return (
      <div className={`w-full ${className}`}>
        <div className="relative w-full h-40 md:h-56 lg:h-72 rounded-2xl overflow-hidden">
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-lg md:text-2xl font-bold text-white mb-1">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="text-gray-200 text-xs md:text-sm mb-2 max-w-xl">
                  {banner.subtitle}
                </p>
              )}
              {banner.buttonText && banner.buttonLink && (
                <a
                  href={banner.buttonLink}
                  className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                >
                  {banner.buttonText}
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple banners - show carousel
  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full h-40 md:h-56 lg:h-72 rounded-2xl overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={banners[currentIndex].image}
              alt={banners[currentIndex].title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h2 className="text-lg md:text-2xl font-bold text-white mb-1">
                  {banners[currentIndex].title}
                </h2>
                {banners[currentIndex].subtitle && (
                  <p className="text-gray-200 text-xs md:text-sm mb-2 max-w-xl">
                    {banners[currentIndex].subtitle}
                  </p>
                )}
                {banners[currentIndex].buttonText &&
                  banners[currentIndex].buttonLink && (
                    <a
                      href={banners[currentIndex].buttonLink}
                      className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                    >
                      {banners[currentIndex].buttonText}
                    </a>
                  )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Previous banner"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
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
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label="Next banner"
        >
          <svg
            className="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white w-6 md:w-8"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
