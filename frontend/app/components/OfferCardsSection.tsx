"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { authApi } from "../services/authApi";
import { useRouter } from "next/navigation";

// OfferCard interface matching the backend schema
export interface OfferCard {
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

interface OfferCardsSectionProps {
  className?: string;
}

export default function OfferCardsSection({ className = "" }: OfferCardsSectionProps) {
  const router = useRouter();
  const [offerCards, setOfferCards] = useState<OfferCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch offer cards from API
  const fetchOfferCards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.getOfferCards();
      if (response.success && response.data) {
        // Filter active offer cards and sort by sortOrder
        const activeCards = response.data
          .filter((card: OfferCard) => card.isActive)
          .sort((a: OfferCard, b: OfferCard) => a.sortOrder - b.sortOrder);
        setOfferCards(activeCards);
      } else {
        setError(response.error || "Failed to fetch offer cards");
      }
    } catch (err) {
      setError("An error occurred while fetching offer cards");
      console.error("Error fetching offer cards:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchOfferCards();
  }, [fetchOfferCards]);

  // Handle card click
  const handleCardClick = (card: OfferCard) => {
    if (card.buttonLink) {
      router.push(card.buttonLink);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-8 w-36 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 md:h-36 bg-gray-100 animate-pulse rounded-xl"
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
          <p className="text-gray-500 mb-2">Unable to load offers</p>
          <button
            onClick={fetchOfferCards}
            className="text-blue-600 hover:text-blue-700 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // No offer cards
  if (offerCards.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-500">No offers available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Section Header */}
      <div className="mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
         <h2 className="text-sm font-bold text-black">Special Offers</h2>
         <p className="text-gray-600 text-xs">Grab the best deals</p>
        </motion.div>
      </div>

      {/* Offer Cards Grid - 1 col mobile, 2 cols desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {offerCards.map((card, index) => (
          <motion.div
            key={card._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => handleCardClick(card)}
            className="h-32 md:h-36 bg-white hover:bg-gray-50 border border-gray-200 hover:border-red-400 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg group"
          >
            <div className="flex h-full">
              {/* Image - 70% */}
              <div className="w-[70%] h-full relative overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Content - 30% */}
              <div className="w-[30%] p-2 md:p-3 flex flex-col justify-center">
               <h3 className="text-gray-900 font-semibold text-[11px] md:text-[12px] line-clamp-2 group-hover:text-red-600 transition-colors">
               {card.title}
               </h3>
               {card.subtitle && (
                 <p className="text-gray-500 text-[10px] md:text-[10px] mt-1 line-clamp-1">
                   {card.subtitle}
                 </p>
               )}
               {card.buttonText && (
                 <span className="text-red-600 text-[10px] md:text-[10px] font-medium mt-1 md:mt-2 inline-block">
                    {card.buttonText} →
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
