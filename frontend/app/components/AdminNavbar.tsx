"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminNavbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Company Name */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => router.push("/admin-dashboard")}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-red-300 transition-colors">
                Admin Panel
              </span>
            </div>
          </div>



          {/* Desktop Right Section: User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-linear-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white font-medium group-hover:scale-105 transition-transform">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
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
                    className="absolute right-0 mt-2 w-64 bg-white/50 dark:bg-gray-800 border border-white/20 rounded-xl shadow-2xl overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-linear-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-gray-800 dark:text-white font-medium">
                          {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className=" font-semibold text-gray-800 dark:text-white">{user?.fullName}</p>
                          <p className=" text-sm text-gray-800 dark:text-white">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push("/all-users");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
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
                        <span>All Users</span>
                      </button>

                      <button
                        onClick={() => {
                          router.push("/all-products");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
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
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                          />
                        </svg>
                        <span>All Products</span>
                      </button>

                      <button
                        onClick={() => {
                          router.push("/all-categories");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
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
                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" 
                          />
                        </svg>
                        <span>All Categories</span>
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
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
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

                {/* Mobile Menu Items */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      router.push("/all-users");
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
                    <span>All Users</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/all-products");
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
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                      />
                    </svg>
                    <span>All Products</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/all-categories");
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
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" 
                      />
                    </svg>
                    <span>All Categories</span>
                  </button>

                  <button
                    onClick={handleLogout}
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
