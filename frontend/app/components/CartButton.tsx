"use client";

import { useState } from "react";
import { useCartStore, CartItem } from "../store/cartStore";

interface CartButtonProps {
  product: Omit<CartItem, 'quantity'>;
  quantity?: number;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  showLabel?: boolean;
  className?: string;
}

export default function CartButton({ 
  product, 
  quantity = 1,
  size = "md", 
  fullWidth = false,
  showLabel = false,
  className = "" 
}: CartButtonProps) {
  const { addToCart, items } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const existingItem = items.find(item => item._id === product._id);
  const isInCart = !!existingItem;

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    addToCart(product, quantity);
    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={!product.inStock || isAdding}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${sizeClasses[size]}
        rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
        ${product.inStock 
          ? 'bg-red-600 hover:bg-red-700 text-white active:bg-red-800' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }
        ${className}
      `}
    >
      {isAdding ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {showLabel && <span>Adding...</span>}
        </>
      ) : isInCart ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {showLabel && <span>Added ({existingItem.quantity})</span>}
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {showLabel && <span>Add to Cart</span>}
        </>
      )}
    </button>
  );
}