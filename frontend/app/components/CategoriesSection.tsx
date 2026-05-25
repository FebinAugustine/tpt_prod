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

  for (const key of Object.keys(iconMap)) {
    if (nameLower.includes(key)) {
      return iconMap[key]!;
    }
  }

  return iconMap['default']!;
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
  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Handle category click
  const handleCategoryClick = (category: Category) => {
    router.push(`/category/${category._id}`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-7 w-28 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="flex gap-1.5 md:gap-2 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-[72px] h-16 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-gray-500 mb-2 text-sm">Unable to load categories</p>
          <button
            onClick={fetchCategories}
            className="text-blue-600 hover:text-blue-700 text-xs underline"
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
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-gray-500 text-sm">No categories available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xs md:text-sm font-bold text-[#111]">Shop by Category</h2>
          <p className="text-gray-500 text-[11px] md:text-xs mt-0.5">Browse our selection</p>
        </motion.div>

        {/* Navigation Arrows */}
        {categories.length > 4 && (
          <div className="flex gap-1.5">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
                canScrollLeft
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  : "bg-gray-50 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Scroll left"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
                canScrollRight
                  ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  : "bg-gray-50 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Scroll right"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Categories Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pb-2 px-0.5"
        onScroll={checkScrollPosition}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category, index) => (
          <motion.button
            key={category._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            onClick={() => handleCategoryClick(category)}
            className="shrink-0 group"
          >
            {/* ---------- Compact tile ---------- */}
            {/* w-[72px] mobile → md:w-[84px] → lg:w-[96px] */}
            <div
              className="
                w-[96px] md:w-[110px] lg:w-[130px]
                min-h-[68px] md:min-h-[72px]
                bg-white border border-gray-200 rounded-lg
                p-[6px] md:p-[8px]
                flex flex-col items-center justify-around gap-[2px]
                cursor-pointer text-center
                transition-all duration-150
                group-hover:border-red-400 group-hover:shadow-md
              "
            >
              {/* Icon  — scales with breakpoint */}
               <span
                 className="
                   text-base md:text-lg leading-none
                   group-hover:scale-110
                   transition-transform duration-150
                 "
               >
                 {getCategoryIcon(category.name)}
               </span>

              {/* Name  — explicit color, increases with breakpoint */}
               <h4
                 className="
                   text-[#111]
                    text-[12px] md:text-[14px] lg:text-[16px]
                    whitespace-normal wrap-break-word
                   group-hover:text-red-600
                   transition-colors duration-150
                   
                 "
               >
                 {category.name}
               </h4>

              {/* Description  — only shown when present */}
               {category.description && (
                 <p className="text-gray-400 text-[7px] md:text-[8px] leading-tight line-clamp-2 w-full">
                   {category.description}
                 </p>
               )}
            </div>
            {/* ---------- End tile ---------- */}
          </motion.button>
        ))}
      </div>

      {/* Scroll hint for mobile */}
      {categories.length > 4 && (
        <div className="flex justify-center mt-1.5 md:hidden">
          <p className="text-gray-400 text-[10px]">Swipe to see more →</p>
        </div>
      )}
    </div>
  );
}
