"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WishlistButton from "../components/WishlistButton";

export default function WishlistPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { items: wishlistItems, removeFromWishlist } = useWishlistStore();
  const router = useRouter();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || !user)) {
      router.push("/login");
    }
  }, [isAuthenticated, user, router, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      
      <div className="flex-1 w-full px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 mt-1">
              {wishlistItems.length === 0 
                ? "Your wishlist is empty" 
                : `${wishlistItems.length} item${wishlistItems.length === 1 ? '' : 's'} in your wishlist`}
            </p>
          </motion.div>

          {wishlistItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Save items you love by clicking the heart icon on any product</p>
              <button
                onClick={() => router.push("/user-dashboard")}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Products
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {wishlistItems.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div 
                    className="relative h-48 bg-gray-100 cursor-pointer overflow-hidden"
                    onClick={() => router.push(`/product/${product._id}`)}
                  >
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm px-3 py-1 bg-red-600 rounded">Out of Stock</span>
                      </div>
                    )}

                    <div className="absolute top-2 right-2 z-10">
                      <WishlistButton 
                        product={product}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 
                      className="text-gray-900 font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-red-600 transition-colors"
                      onClick={() => router.push(`/product/${product._id}`)}
                    >
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2">
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

                    <button
                      onClick={() => router.push(`/product/${product._id}`)}
                      className="w-full mt-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}