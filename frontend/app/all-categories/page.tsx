"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";
import { authApi } from "../services/authApi";
import { toast } from "sonner";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function AllCategoriesPage() {
  return <AllCategoriesPageWrapper />;
}

function AllCategoriesPageWrapper() {
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
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    router.push("/login");
    return null;
  }

  return <CategoriesContent />;
}

function CategoriesContent() {
  // Fetch all categories with TanStack Query
  const { data: categoriesResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await authApi.getCategories();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch categories');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 3, // Retry 3 times before failing
  });

  const categories = categoriesResponse || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Edit category state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete category state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Handle edit button click
  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setEditModalOpen(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setEditLoading(true);
    try {
      const response = await authApi.updateCategory(selectedCategory._id, editFormData);
      if (response.success) {
        await refetch();
        setEditModalOpen(false);
      } else {
        console.error('Error updating category:', response.error);
        toast.error(response.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    setDeleteCategoryId(id);
    setDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteCategoryId) return;

    setDeleteLoading(true);
    try {
      const response = await authApi.deleteCategory(deleteCategoryId);
      if (response.success) {
        await refetch();
        setDeleteModalOpen(false);
      } else {
        console.error('Error deleting category:', response.error);
        toast.error(response.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
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
          <h1 className="text-3xl font-bold text-white mb-2">All Categories</h1>
          <p className="text-gray-300">Manage and view all product categories in the system</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p>Loading categories...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8">
            <h3 className="text-red-400 font-semibold mb-2">Error Loading Categories</h3>
            <p className="text-red-300 text-sm">{error.message}</p>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && categories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category: Category) => (
              <div
                key={category._id}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{category.description}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
                      ${category.isActive 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'}
                    `}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Sort Order:</span>
                    <span className="text-gray-300">{category.sortOrder}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-gray-300">{formatDate(category.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-gray-300">{formatDate(category.updatedAt)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(category)}
                    className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(category._id)}
                    className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && categories.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Categories Found</h3>
              <p className="text-gray-400 mb-6">There are no categories in the system yet.</p>
              <button
                onClick={() => console.log('Add category')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Add First Category
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/20 sticky top-0 bg-white/10 backdrop-blur-lg z-10">
              <h3 className="text-lg font-semibold text-white">Edit Category</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-300">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      id="sortOrder"
                      value={editFormData.sortOrder}
                      onChange={(e) => setEditFormData({ ...editFormData, sortOrder: parseInt(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
                    Active
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
                    {editLoading ? 'Updating...' : 'Update Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Delete Category</h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-300 mb-4">
                Are you sure you want to delete this category? This action cannot be undone and will affect all products in this category.
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
                  {deleteLoading ? 'Deleting...' : 'Delete Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
