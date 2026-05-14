"use client";

import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";

export default function SettingsPage() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <p className="text-gray-300">Settings page content will be implemented soon.</p>
        </div>
      </div>
    </div>
  );
}