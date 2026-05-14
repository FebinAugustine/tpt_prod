"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";
import { authApi } from "../services/authApi";
import { Edit, Trash2, X } from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

function AllUsersPageContent() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show a loading state while the store is being hydrated
  if (!isHydrated || !isClient) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    router.push("/login");
    return null;
  }

  return <UsersContent />;
}

function UsersContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    role: 'user' as 'user' | 'admin',
    isVerified: false,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Fetch all users with TanStack Query
    const { data: usersResponse, isLoading, error } = useQuery({
      queryKey: ['users'],
      queryFn: async () => {
        const response = await authApi.getUsers();
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch users');
        }
        // Handle both array and object with data property
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return response.data?.users || response.data?.data || [];
      },
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      retry: 3, // Retry 3 times before failing
    });

  const users = usersResponse || [];

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await authApi.deleteUser(userId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete user');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteModalOpen(false);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: string; updateData: any }) => {
      const response = await authApi.updateUser(data.id, data.updateData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update user');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditModalOpen(false);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    });
    setEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setEditLoading(true);
    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser._id,
        updateData: editFormData,
      });
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setDeleteLoading(true);
    try {
      await deleteUserMutation.mutateAsync(selectedUser._id);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">All Users</h1>
          <p className="text-gray-300">Manage and view all registered users in the system</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p>Loading users...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8">
            <h3 className="text-red-400 font-semibold mb-2">Error Loading Users</h3>
            <p className="text-red-300 text-sm">{error.message}</p>
          </div>
        )}

        {/* Users Grid */}
        {!isLoading && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user: User) => (
              <div
                key={user._id}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{user.fullName}</h3>
                    <p className="text-gray-400 text-sm mb-2">{user.email}</p>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                      ${user.role === 'admin' 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}
                    `}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-medium
                      ${user.isVerified ? 'text-green-400' : 'text-yellow-400'}
                    `}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-gray-300">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-gray-300">{formatDate(user.updatedAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && users.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
              <p className="text-gray-400 mb-6">There are no registered users in the system yet.</p>
              <button
                onClick={() => router.push("/admin-dashboard")}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Add First User
              </button>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-lg">
              <div className="flex justify-between items-center p-6 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white">Edit User</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                      Role
                    </label>
                    <select
                      id="role"
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as 'user' | 'admin' })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    >
                      <option value="user" className="text-gray-900">User</option>
                      <option value="admin" className="text-gray-900">Admin</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={editFormData.isVerified}
                      onChange={(e) => setEditFormData({ ...editFormData, isVerified: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-300">
                      Verified User
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setEditModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {editLoading ? 'Updating...' : 'Update User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white">Delete User</h3>
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-300 mb-4">
                  Are you sure you want to delete the user{" "}
                  <span className="font-medium text-white">{selectedUser?.fullName}</span>?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={deleteLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AllUsersPage() {
  return <AllUsersPageContent />;
}
