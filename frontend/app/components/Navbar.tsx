"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  // State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate cart total items count
  const cartTotalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistTotalItems = wishlistItems.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const performSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Company Name */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => router.push(isAuthenticated ? "/user-dashboard" : "/")}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-blue-300 transition-colors">
                The Power Trainer
              </span>
            </div>
          </div>

          {/* Desktop Search Input - Only show when authenticated */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 max-w-md mx-8 px-3 py-2">
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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
                  placeholder="Search products, recipes, or workouts..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(e.target.value);
                  }}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      performSearch(searchQuery);
                    }
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="block w-full pl-3 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Desktop Right Section: Icons and User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Cart Icon - Navigate to cart page */}
                <button 
                  onClick={() => router.push("/cart")}
                  className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                >
                  <svg 
                    className="h-6 w-6 group-hover:scale-110 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                    />
                  </svg>
                  {cartTotalItems > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      {cartTotalItems > 99 ? '99+' : cartTotalItems}
                    </span>
                  )}
                </button>

                {/* Wishlist Icon - Navigate to wishlist page */}
                <button 
                  onClick={() => router.push("/wishlist")}
                  className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                >
                  <svg 
                    className="h-6 w-6 group-hover:scale-110 transition-transform" 
                    fill="none" 
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
                  {wishlistTotalItems > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                      {wishlistTotalItems > 99 ? '99+' : wishlistTotalItems}
                    </span>
                  )}
                </button>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium group-hover:scale-105 transition-transform">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <svg 
                      className={`h-4 w-4 text-gray-300 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 9l-7 7-7-7" 
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="p-4 border-b border-white/20">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="text-white font-semibold">{user?.fullName}</p>
                              <p className="text-gray-400 text-sm">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={() => {
                              router.push("/profile");
                              setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                              />
                            </svg>
                            <span>Profile</span>
                          </button>

                          <button
                            onClick={() => {
                              router.push("/settings");
                              setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
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
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                              />
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                              />
                            </svg>
                            <span>Settings</span>
                          </button>

                          <div className="border-t border-white/20 my-1"></div>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
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
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                              />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                >
                  Login
                </Link>
                {/* Register Button */}
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-200 shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
              <svg 
                className="h-6 w-6" 
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
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16m-7 6h7" 
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
               <div className="px-2 pt-2 pb-3 space-y-1 bg-white/5 rounded-lg">
                 {/* Mobile Search Input - Only show when authenticated */}
                 {isAuthenticated && (
                   <div className="px-3 py-2">
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
                          placeholder="Search products, recipes, or workouts..."
                          value={searchQuery}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSearchQuery(e.target.value);
                          }}
                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                performSearch(searchQuery);
                              }
                            }}
                          className="block w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>
                   </div>
                 )}

                  {/* Mobile Menu Items */}
                  <div className="space-y-1">
                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={() => {
                            router.push("/cart");
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
                        >
                          <svg 
                            className="h-6 w-6" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
                            />
                          </svg>
                          <span>Cart {cartTotalItems > 0 && `(${cartTotalItems})`}</span>
                        </button>

                        <button
                          onClick={() => {
                            router.push("/wishlist");
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
                        >
                          <svg 
                            className="h-6 w-6" 
                            fill="none" 
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
                          <span>Wishlist {wishlistTotalItems > 0 && `(${wishlistTotalItems})`}</span>
                        </button>

                       <div className="border-t border-white/20 my-1"></div>

                       <button
                         onClick={() => {
                           router.push("/profile");
                           setIsMobileMenuOpen(false);
                         }}
                         className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
                       >
                         <svg 
                           className="h-6 w-6" 
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                         >
                           <path 
                             strokeLinecap="round" 
                             strokeLinejoin="round" 
                             strokeWidth={2} 
                             d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                           />
                         </svg>
                         <span>Profile</span>
                       </button>

                       <button
                         onClick={() => {
                           router.push("/settings");
                           setIsMobileMenuOpen(false);
                         }}
                         className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
                       >
                         <svg 
                           className="h-6 w-6" 
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                         >
                           <path 
                             strokeLinecap="round" 
                             strokeLinejoin="round" 
                             strokeWidth={2} 
                             d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                           />
                           <path 
                             strokeLinecap="round" 
                             strokeLinejoin="round" 
                             strokeWidth={2} 
                             d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                           />
                         </svg>
                         <span>Settings</span>
                       </button>

                       <button
                         onClick={() => {
                           handleLogout();
                           setIsMobileMenuOpen(false);
                         }}
                         className="flex items-center gap-3 px-3 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full"
                       >
                         <svg 
                           className="h-6 w-6" 
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                         >
                           <path 
                             strokeLinecap="round" 
                             strokeLinejoin="round" 
                             strokeWidth={2} 
                             d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                           />
                         </svg>
                         <span>Logout</span>
                       </button>
                     </>
                   ) : (
                     <>
                       <Link
                         href="/login"
                         className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
                         onClick={() => setIsMobileMenuOpen(false)}
                       >
                         <svg 
                           className="h-6 w-6" 
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                         >
                           <path 
                             strokeLinecap="round" 
                             strokeLinejoin="round" 
                             strokeWidth={2} 
                             d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                           />
                         </svg>
                         <span>Login</span>
                       </Link>
                       <Link
                         href="/register"
                         className="flex items-center gap-3 px-3 py-3 text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-all duration-200 w-full font-medium"
                         onClick={() => setIsMobileMenuOpen(false)}
                       >
                         <svg 
                           className="h-6 w-6" 
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                         >
                           <path 
                             strokeLinecap="round" 
                             strokeLinejoin="round" 
                             strokeWidth={2} 
                             d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
                           />
                         </svg>
                         <span>Register</span>
                       </Link>
                     </>
                   )}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
