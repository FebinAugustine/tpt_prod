"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useRouter } from "next/navigation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function Home() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && isAuthenticated && user) {
      // Redirect to dashboard for authenticated users
      router.push('/user-dashboard');
    }
  }, [isHydrated, isAuthenticated, user, router]);

  // Always show home page immediately - don't block UI rendering
  return (
    <>
      <Navbar />
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        {/* Animated Background Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        />

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-4xl px-6"
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-center mb-10"
            >
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
                PROTEIN APP
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
                Your ultimate companion for protein tracking, nutrition analysis, and fitness goals management
              </p>
            </motion.div>

            {/* Buttons Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black/20"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
              </Link>

              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-300 bg-white/15 hover:bg-white/25 rounded-2xl backdrop-blur-sm hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-black/20"
              >
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 rounded-2xl bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
              </Link>
            </motion.div>

            {/* Features Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-4xl mb-3">🥦</div>
                <h3 className="text-lg font-semibold text-white mb-2">Nutrition Analysis</h3>
                <p className="text-sm text-gray-300">Track your protein intake and get detailed nutrition breakdowns</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold text-white mb-2">Progress Tracking</h3>
                <p className="text-sm text-gray-300">Monitor your fitness goals and track your progress over time</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-4xl mb-3">💪</div>
                <h3 className="text-lg font-semibold text-white mb-2">Personalized Plans</h3>
                <p className="text-sm text-gray-300">Get customized nutrition and workout plans based on your goals</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
