"use client";

import { useWishlistStore, WishlistItem } from "../store/wishlistStore";

interface WishlistButtonProps {
  product: WishlistItem;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function WishlistButton({ product, size = "md", className = "" }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product._id);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-10 h-10",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleWishlist(product);
      }}
      className={`
        ${sizeClasses[size]}
        rounded-full 
        flex items-center justify-center 
        transition-all duration-200 
        ${inWishlist 
          ? "bg-red-500 text-white hover:bg-red-600" 
          : "bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white"
        }
        ${className}
      `}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg 
        className={iconSizes[size]} 
        fill={inWishlist ? "currentColor" : "none"} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    </button>
  );
}