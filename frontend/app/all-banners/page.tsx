"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";
import { authApi } from "../services/authApi";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit, X, Image, Tag } from "lucide-react";
import { toast } from "sonner";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

interface OfferCard {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
}

export default function AllBannersPage() {
  return <AllBannersPageWrapper />;
}

function AllBannersPageWrapper() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect effect - must be called unconditionally before any conditional returns
  useEffect(() => {
    // Wait for hydration to complete before redirecting
    if (!isHydrated || !isClient) return;
    
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push("/login");
    }
  }, [isAuthenticated, user, router, isHydrated, isClient]);

  if (!isHydrated || !isClient) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  return <BannersContent />;
}

function BannersContent() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [offerCards, setOfferCards] = useState<OfferCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'banners' | 'offerCards'>('banners');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'banner' | 'offerCard'; id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bannerVersion, setBannerVersion] = useState(0);
  const [offerCardVersion, setOfferCardVersion] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bannersResponse, offerCardsResponse] = await Promise.all([
        authApi.getBanners(),
        authApi.getOfferCards()
      ]);

      if (bannersResponse.success && bannersResponse.data) {
        setBannerVersion(v => v + 1);
        setBanners(bannersResponse.data);
      }
      if (offerCardsResponse.success && offerCardsResponse.data) {
        setOfferCardVersion(v => v + 1);
        setOfferCards(offerCardsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (type: 'banner' | 'offerCard', id: string, title: string) => {
    setSelectedItem({ type, id, title });
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setDeleteLoading(true);
    try {
      let response;
      if (selectedItem.type === 'banner') {
        response = await authApi.deleteBanner(selectedItem.id);
      } else {
        response = await authApi.deleteOfferCard(selectedItem.id);
      }

      if (response.success) {
        if (selectedItem.type === 'banner') {
          setBanners(banners.filter(b => b._id !== selectedItem.id));
        } else {
          setOfferCards(offerCards.filter(o => o._id !== selectedItem.id));
        }
        setDeleteModalOpen(false);
        setSelectedItem(null);
      } else {
        toast.error(response.error || 'Failed to delete');
      }
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Banners & Offer Cards</h1>
          <p className="text-gray-300 mt-1">Manage home banners and offer cards</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'banners'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Home Banners ({banners.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('offerCards')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'offerCards'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Offer Cards ({offerCards.length})
            </div>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'banners' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Image className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400 text-lg">No banners found</p>
                    <p className="text-gray-500 text-sm">Add banners from the admin dashboard</p>
                  </div>
                ) : (
                  banners.map((banner, index) => (
                    <motion.div
                      key={banner._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden"
                    >
                      <div className="relative h-48">
                        <img
                          src={banner.image + '?v=' + bannerVersion}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-semibold text-lg">{banner.title}</h3>
                          {banner.subtitle && (
                            <p className="text-gray-300 text-sm">{banner.subtitle}</p>
                          )}
                        </div>
                        {!banner.isActive && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Inactive
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Sort: {banner.sortOrder}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteClick('banner', banner._id, banner.title)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'offerCards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {offerCards.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Tag className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                    <p className="text-gray-400 text-lg">No offer cards found</p>
                    <p className="text-gray-500 text-sm">Add offer cards from the admin dashboard</p>
                  </div>
                ) : (
                  offerCards.map((card, index) => (
                    <motion.div
                      key={card._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden"
                    >
                      <div className="relative h-24">
                        <img
                          src={card.image + '?v=' + offerCardVersion}
                          alt={card.title}
                          className="w-full h-full object-contain bg-white/5"
                        />
                        {!card.isActive && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                            Inactive
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-white font-semibold text-sm truncate">{card.title}</h3>
                        {card.subtitle && (
                          <p className="text-gray-400 text-xs truncate">{card.subtitle}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-500 text-xs">Sort: {card.sortOrder}</span>
                          <button
                            onClick={() => handleDeleteClick('offerCard', card._id, card.title)}
                            className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setDeleteModalOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 z-50 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Confirm Delete</h2>
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-gray-300 mb-6">
                  Are you sure you want to delete <span className="text-white font-semibold">"{selectedItem?.title}"</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
