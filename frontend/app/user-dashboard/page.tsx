"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BannerSlider from "../components/BannerSlider";
import CategoriesSection from "../components/CategoriesSection";
import PopularProductsSection from "../components/PopularProductsSection";
import OfferCardsSection from "../components/OfferCardsSection";
import TrendingProductsSection from "../components/TrendingProductsSection";

export default function UserDashboard() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  // Handle redirects in useEffect to avoid render cycle issues
  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    if (!user.isVerified) {
      router.push("/not-verified");
      return;
    }
  }, [isHydrated, isAuthenticated, user, router]);

  // Don't render dashboard if redirecting
  if (!isAuthenticated || !user || !user.isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section - Banner Slider */}
        <section className="container mx-auto px-4 py-6">
          <BannerSlider />
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4 py-6">
          <CategoriesSection />
        </section>

        {/* Popular Products Section */}
        <section className="container mx-auto px-4 py-6">
          <PopularProductsSection isVerified={user.isVerified} />
        </section>

        {/* Offer Cards Section */}
        <section className="container mx-auto px-4 py-6">
          <OfferCardsSection />
        </section>

        {/* Trending Products Section */}
        <section className="container mx-auto px-4 py-6">
          <TrendingProductsSection isVerified={user.isVerified} />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
