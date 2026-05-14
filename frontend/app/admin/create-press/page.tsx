"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../../components/AdminNavbar";
import { authApi } from "../../services/authApi";

interface PressFormData {
  title: string;
  type: "press_release" | "media_coverage";
  description: string;
  date: string;
  publication: string;
  isActive: boolean;
  sortOrder: number;
}

export default function CreatePressPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState<PressFormData>({
    title: "",
    type: "press_release",
    description: "",
    date: "",
    publication: "",
    isActive: true,
    sortOrder: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user || user.role !== "admin") {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "sortOrder"
          ? parseInt(value) || 0
          : name === "type"
          ? value
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.title || !formData.description) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (formData.type === "media_coverage" && !formData.publication) {
      setError("Publication is required for media coverage");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.addPress(formData);

      if (response.success) {
        setSuccess(
          formData.type === "press_release"
            ? "Press Release created successfully!"
            : "Media Coverage created successfully!"
        );
        setTimeout(() => {
          router.push("/admin-dashboard");
        }, 2000);
        setFormData({
          title: "",
          type: "press_release",
          description: "",
          date: "",
          publication: "",
          isActive: true,
          sortOrder: 0,
        });
      } else {
        setError(response.error || "Failed to create press");
      }
    } catch {
      setError("An error occurred while creating press");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h1 className="text-2xl font-bold text-white mb-2">Create Press</h1>
            <p className="text-gray-300 mb-6">
              Add a new press release or media coverage
            </p>

            {success && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="press_release">Press Release</option>
                  <option value="media_coverage">Media Coverage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    placeholder="e.g. April 2026"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {formData.type === "media_coverage" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Publication <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="publication"
                    value={formData.publication}
                    onChange={handleInputChange}
                    placeholder="e.g. Fitness First Magazine"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
                <span className="text-gray-300">Active (visible on press page)</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/admin-dashboard")}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {isLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
