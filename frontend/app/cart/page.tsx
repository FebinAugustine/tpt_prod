"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WishlistButton from "../components/WishlistButton";

export default function CartPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCartStore();
  const router = useRouter();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const totalPrice = getTotalPrice();

  // Redirect to login if not authenticated after hydration
  useEffect(() => {
    if (isHydrated && (!isAuthenticated || !user)) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, user, router]);

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

  // After hydration, if not authenticated, redirect will happen via useEffect
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">
              {items.length === 0 
                ? "Your cart is empty" 
                : `${items.length} item${items.length === 1 ? '' : 's'} in your cart`}
            </p>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add items to your cart to see them here</p>
              <button
                onClick={() => router.push("/user-dashboard")}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Products
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-2 space-y-4"
              >
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    <div 
                      className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => router.push(`/product/${item._id}`)}
                    >
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <h3 
                          className="text-gray-900 font-semibold line-clamp-2 cursor-pointer hover:text-red-600 transition-colors"
                          onClick={() => router.push(`/product/${item._id}`)}
                        >
                          {item.name}
                        </h3>
                        <WishlistButton 
                          product={{
                            _id: item._id,
                            name: item.name,
                            price: item.price,
                            offerPrice: item.offerPrice,
                            images: item.images,
                            inStock: item.inStock,
                          }}
                          size="sm"
                        />
                      </div>

                      {item.weight && (
                        <p className="text-gray-500 text-sm mt-1">{item.weight}</p>
                      )}
                      {item.flavour && (
                        <p className="text-gray-500 text-sm">{item.flavour}</p>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="px-3 py-1.5 text-gray-900 font-medium min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          {item.offerPrice ? (
                            <div>
                              <span className="text-gray-900 font-bold">
                                {formatPrice(item.offerPrice * item.quantity)}
                              </span>
                              <span className="text-gray-500 line-through text-sm ml-2">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-900 font-bold">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium mt-3 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 border-b border-gray-200 pb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({items.length} items)</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-4">
                    <span className="text-gray-900 font-semibold">Total</span>
                    <span className="text-gray-900 font-bold text-xl">{formatPrice(totalPrice)}</span>
                  </div>

                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    onClick={() => router.push("/user-dashboard")}
                    className="w-full py-3 mt-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}