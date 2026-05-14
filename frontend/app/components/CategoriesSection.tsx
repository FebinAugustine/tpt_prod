"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { authApi } from "../services/authApi";
import { useRouter } from "next/navigation";

// Category interface matching the backend schema
export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoriesSectionProps {
  className?: string;
}

// Map category names to icons/emojis
const getCategoryIcon = (name: string): string => {
  const nameLower = name.toLowerCase();
  
  const iconMap: Record<string, string> = {
    'whey protein': '💪',
    'protein': '💪',
    'creatine': '⚡',
    'pre-workout': '🔥',
    'bcaa': '🏃',
    'mass gainer': '🏋️',
    'vitamins': '💊',
    'multivitamin': '💊',
    'fish oil': '🐟',
    'omega': '🐟',
    'casein': '🥛',
    'isoline': '🥤',
    'amino acids': '🔬',
    'glutamine': '💫',
    'zma': '🌙',
    'joint support': '🦴',
    'fitness accessories': '🎒',
    'shaker': '🥤',
    'bottles': '🧴',
    'gym bag': '👜',
    'belts': '🥋',
    'straps': '✋',
    'gloves': '🧤',
    'clothing': '👕',
    'shoes': '👟',
    'equipment': '🏋️',
    'barbell': '🏋️',
    'dumbbell': '🏋️',
    'plates': '⚖️',
    'cardio': '🚴',
    'treadmill': '🏃',
    'bike': '🚴',
    'elliptical': '🏃',
    'accessories': '🎯',
    'default': '📦',
  };

  // Find matching icon
  for (const key of Object.keys(iconMap)) {
    if (nameLower.includes(key)) {
      return iconMap[key];
    }
  }
  
  return iconMap['default'];
};

export default function CategoriesSection({ className = "" }: CategoriesSectionProps) {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.getCategories();
      if (response.success && response.data) {
        // Filter only active categories and sort by sortOrder
        const activeCategories = response.data
          .filter((category: Category) => category.isActive)
          .sort((a: Category, b: Category) => a.sortOrder - b.sortOrder);
        setCategories(activeCategories);
      } else {
        setError(response.error || "Failed to fetch categories");
      }
    } catch (err) {
      setError("An error occurred while fetching categories");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Check scroll position to show/hide navigation arrows
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

  // Handle category click
  const handleCategoryClick = (category: Category) => {
    // Navigate to products page with category filter
    router.push(`/category/${category._id}`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-32 md:w-40 h-28 bg-gray-100 animate-pulse rounded-xl"
            ></div>
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
          <p className="text-gray-500 mb-2">Unable to load categories</p>
          <button
            onClick={fetchCategories}
            className="text-blue-600 hover:text-blue-700 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // No categories
  if (categories.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-500">No categories available</p>
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
          <h2 className="text-xl font-bold text-black">Shop by Category</h2>
          <p className="text-gray-600 text-sm">Browse our selection</p>
        </motion.div>

        {/* Navigation Arrows */}
        {categories.length > 4 && (
          <div className="flex gap-2">
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

      {/* Categories Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1"
        onScroll={checkScrollPosition}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category, index) => (
          <motion.button
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => handleCategoryClick(category)}
            className="shrink-0 group"
          >
            <div className="w-28 md:w-36 lg:w-40 bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-500 rounded-xl p-4 transition-all duration-200 hover:shadow-lg cursor-pointer text-center">
              {/* Category Icon */}
              <div className="text-3xl md:text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-200">
                {getCategoryIcon(category.name)}
              </div>
              
              {/* Category Name */}
              <h3 className="text-gray-900 text-xs md:text-sm font-semibold truncate group-hover:text-red-600 transition-colors">
                {category.name}
              </h3>
              
              {/* Description (if available) */}
              {category.description && (
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Scroll hint for mobile */}
      {categories.length > 4 && (
        <div className="flex justify-center mt-2 md:hidden">
          <p className="text-gray-500 text-xs">Swipe to see more →</p>
        </div>
      )}
    </div>
  );
}
