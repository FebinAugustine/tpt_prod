"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../../components/AdminNavbar";
import { authApi } from "../../services/authApi";
import { Edit, Trash2 } from "lucide-react";

interface Press {
  _id: string;
  title: string;
  type: "press_release" | "media_coverage";
  description: string;
  date: string;
  publication: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AllPressPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  const [pressItems, setPressItems] = useState<Press[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPress, setEditingPress] = useState<Press | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Press>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user || user.role !== "admin") {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const fetchPress = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getPress(false);
      if (response.success && response.data) {
        setPressItems(response.data);
      }
    } catch (err) {
      console.error("Error fetching press:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated && isAuthenticated && user?.role === "admin") {
      fetchPress();
    }
  }, [isHydrated, isAuthenticated, user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      const response = await authApi.deletePress(id);
      if (response.success) {
        setSuccess("Deleted successfully!");
        setTimeout(() => setSuccess(null), 3000);
        fetchPress();
      } else {
        setError(response.error || "Failed to delete");
      }
    } catch (err) {
      setError("An error occurred while deleting");
    }
  };

  const handleToggleActive = async (press: Press) => {
    try {
      const response = await authApi.updatePress(press._id, {
        ...press,
        isActive: !press.isActive,
      });
      if (response.success) {
        setSuccess(`${press.isActive ? "Deactivated" : "Activated"} successfully!`);
        setTimeout(() => setSuccess(null), 3000);
        fetchPress();
      } else {
        setError(response.error || "Failed to update");
      }
    } catch (err) {
      setError("An error occurred while updating");
    }
  };

  const handleEdit = (press: Press) => {
    setEditingPress(press);
    setEditFormData({ ...press });
    setIsEditModalOpen(true);
  };

  const handleUpdatePress = async () => {
    if (!editingPress) return;
    setIsSaving(true);
    setError(null);

    try {
      const response = await authApi.updatePress(editingPress._id, editFormData);
      if (response.success) {
        setSuccess("Updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
        setIsEditModalOpen(false);
        setEditingPress(null);
        fetchPress();
      } else {
        setError(response.error || "Failed to update");
      }
    } catch (err) {
      setError("An error occurred while updating");
    } finally {
      setIsSaving(false);
    }
  };

  const pressReleases = pressItems.filter((p) => p.type === "press_release");
  const mediaCoverage = pressItems.filter((p) => p.type === "media_coverage");

  if (!isHydrated || isLoading) {
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">All Press</h1>
            <p className="text-gray-300 mt-1">Manage press releases and media coverage</p>
          </div>
          <button
            onClick={() => router.push("/admin/create-press")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Add New Press
          </button>
        </div>

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

        {/* Press Releases Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Press Releases</h2>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
            {pressReleases.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No press releases found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Title</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Date</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Status</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {pressReleases.map((press) => (
                      <tr key={press._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white">{press.title}</td>
                        <td className="px-4 py-3 text-gray-300">{press.date}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(press)}
                            className={`px-2 py-1 text-xs rounded-full ${
                              press.isActive
                                ? "bg-green-500/20 text-green-300"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {press.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(press)}
                              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(press._id)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Media Coverage Section */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Media Coverage</h2>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
            {mediaCoverage.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No media coverage found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Title</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Publication</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Date</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Status</th>
                      <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {mediaCoverage.map((press) => (
                      <tr key={press._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white">{press.title}</td>
                        <td className="px-4 py-3 text-gray-300">{press.publication}</td>
                        <td className="px-4 py-3 text-gray-300">{press.date}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleActive(press)}
                            className={`px-2 py-1 text-xs rounded-full ${
                              press.isActive
                                ? "bg-green-500/20 text-green-300"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {press.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(press)}
                              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(press._id)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingPress && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Edit Press</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select
                  value={editFormData.type || "press_release"}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      type: e.target.value as "press_release" | "media_coverage",
                    })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="press_release">Press Release</option>
                  <option value="media_coverage">Media Coverage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editFormData.title || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
                  <input
                    type="text"
                    value={editFormData.date || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    placeholder="e.g. April 2026"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editFormData.sortOrder || 0}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, sortOrder: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              {editFormData.type === "media_coverage" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Publication</label>
                  <input
                    type="text"
                    value={editFormData.publication || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, publication: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={editFormData.isActive || false}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Active</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePress}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
