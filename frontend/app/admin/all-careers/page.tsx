"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../../components/AdminNavbar";
import { authApi } from "../../services/authApi";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";

interface Career {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export default function AllCareersPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Career>>({});
  const [requirementInput, setRequirementInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user || user.role !== "admin") {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  const fetchCareers = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getCareers(false);
      if (response.success && response.data) {
        setCareers(response.data);
      }
    } catch (err) {
      console.error("Error fetching careers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated && isAuthenticated && user?.role === "admin") {
      fetchCareers();
    }
  }, [isHydrated, isAuthenticated, user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this career?")) return;

    try {
      const response = await authApi.deleteCareer(id);
      if (response.success) {
        setSuccess("Career deleted successfully!");
        setTimeout(() => setSuccess(null), 3000);
        fetchCareers();
      } else {
        setError(response.error || "Failed to delete career");
      }
    } catch (err) {
      setError("An error occurred while deleting career");
    }
  };

  const handleToggleActive = async (career: Career) => {
    try {
      const response = await authApi.updateCareer(career._id, {
        ...career,
        isActive: !career.isActive,
      });
      if (response.success) {
        setSuccess(`Career ${career.isActive ? "deactivated" : "activated"} successfully!`);
        setTimeout(() => setSuccess(null), 3000);
        fetchCareers();
      } else {
        setError(response.error || "Failed to update career");
      }
    } catch (err) {
      setError("An error occurred while updating career");
    }
  };

  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setEditFormData({ ...career });
    setIsEditModalOpen(true);
  };

  const handleUpdateCareer = async () => {
    if (!editingCareer) return;
    setIsSaving(true);
    setError(null);

    try {
      const response = await authApi.updateCareer(editingCareer._id, editFormData);
      if (response.success) {
        setSuccess("Career updated successfully!");
        setTimeout(() => setSuccess(null), 3000);
        setIsEditModalOpen(false);
        setEditingCareer(null);
        fetchCareers();
      } else {
        setError(response.error || "Failed to update career");
      }
    } catch (err) {
      setError("An error occurred while updating career");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim()) {
      setEditFormData((prev: any) => ({
        ...prev,
        requirements: [...(prev.requirements || []), requirementInput.trim()],
      }));
      setRequirementInput("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setEditFormData((prev: any) => ({
      ...prev,
      requirements: (prev.requirements || []).filter((_: any, i: number) => i !== index),
    }));
  };

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
            <h1 className="text-2xl font-bold text-white">All Careers</h1>
            <p className="text-gray-300 mt-1">Manage job openings</p>
          </div>
          <button
            onClick={() => router.push("/admin/create-career")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Add New Career
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

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden">
          {careers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No careers found. Create your first career!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Title</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Department</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Location</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Type</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Status</th>
                    <th className="px-4 py-3 text-left text-gray-300 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {careers.map((career) => (
                    <tr key={career._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white">{career.title}</td>
                      <td className="px-4 py-3 text-gray-300">{career.department}</td>
                      <td className="px-4 py-3 text-gray-300">{career.location}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                          {career.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(career)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            career.isActive
                              ? "bg-green-500/20 text-green-300"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {career.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(career)}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(career._id)}
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

      {/* Edit Modal */}
      {isEditModalOpen && editingCareer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Edit Career</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Job Title</label>
                <input
                  type="text"
                  value={editFormData.title || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={editFormData.department || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editFormData.location || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select
                    value={editFormData.type || "Full-time"}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editFormData.sortOrder || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={editFormData.description || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    placeholder="Add a requirement"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editFormData.requirements || []).map((req: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white text-sm"
                    >
                      {req}
                      <button type="button" onClick={() => handleRemoveRequirement(index)} className="text-gray-400 hover:text-red-400">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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
                  onClick={handleUpdateCareer}
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