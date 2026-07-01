"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../../components/AdminNavbar";
import { authApi } from "../../services/authApi";
import { motion } from "framer-motion";
import { Edit, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export default function AllBannersPage() {
  return (
    <AllBannersPageWrapper />
  );
}

function AllBannersPageWrapper() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
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
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    isActive: true,
    sortOrder: 0,
  });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [bannerVersion, setBannerVersion] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

   const fetchBanners = async () => {
     try {
       const response = await authApi.getBanners();
       if (response.success && response.data) {
         setBanners(response.data);
       } else {
         toast.error(response.error || "Failed to fetch banners");
       }
     } catch (error) {
       console.error("Error fetching banners:", error);
       toast.error("Failed to fetch banners");
     } finally {
       setIsLoading(false);
     }
   };

   const handleDelete = async () => {
     if (!selectedBanner) return;

     try {
       setDeleteLoading(true);
       const response = await authApi.deleteBanner(selectedBanner._id);
       if (response.success) {
         setBanners(banners.filter(b => b._id !== selectedBanner._id));
         toast.success("Banner deleted successfully");
       } else {
         toast.error(response.error || "Failed to delete banner");
       }
     } catch (error) {
       console.error("Error deleting banner:", error);
       toast.error("Failed to delete banner");
     } finally {
       setDeleteLoading(false);
       setDeleteModalOpen(false);
     }
   };

  const handleEditClick = (banner: any) => {
    setSelectedBanner(banner);
    setEditFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || '',
      buttonLink: banner.buttonLink || '',
      isActive: banner.isActive ?? true,
      sortOrder: banner.sortOrder || 0,
    });
    setEditImagePreview(banner.image || '');
    setEditModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImage(file);
      const reader = new FileReader();
      reader.onload = () => setEditImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

   const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBanner) return;

    setEditLoading(true);
    try {
      const response = await authApi.updateBanner(selectedBanner._id, editFormData, editImage || undefined);
      if (response.success) {
        await fetchBanners();
        setBannerVersion(v => v + 1);
        toast.success("Banner updated successfully");
        setEditModalOpen(false);
        setEditImage(null);
        setEditImagePreview('');
        setEditFormData({
          title: '',
          subtitle: '',
          buttonText: '',
          buttonLink: '',
          isActive: true,
          sortOrder: 0,
        });
      } else {
        toast.error(response.error || "Failed to update banner");
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("Failed to update banner");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">All Banners</h1>
          <button
            onClick={() => router.push("/admin-dashboard")}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-lg">No banners available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner, index) => (
              <motion.div
                key={banner._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
              >
                {banner.image && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={banner.image + '?v=' + bannerVersion}
                      alt={banner.title}
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-gray-300 text-sm mb-2">{banner.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${banner.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(banner)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedBanner(banner);
                      setDeleteModalOpen(true);
                    }}
                    disabled={deleteLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModalOpen && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/20 sticky top-0 bg-white/10 backdrop-blur-lg z-10">
              <h3 className="text-lg font-semibold text-white">Edit Banner</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={editFormData.subtitle}
                    onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={editFormData.buttonText}
                    onChange={(e) => setEditFormData({ ...editFormData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Button Link</label>
                  <input
                    type="text"
                    value={editFormData.buttonLink}
                    onChange={(e) => setEditFormData({ ...editFormData, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                
                {editImagePreview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Current Image</label>
                    <img src={editImagePreview + '?v=' + bannerVersion} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-2" />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Change Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label className="ml-2 text-gray-300">Active</label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 text-gray-300 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editLoading ? 'Updating...' : 'Update Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Banner</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{selectedBanner.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 text-gray-300 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}