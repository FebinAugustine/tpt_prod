"use client";

import { motion } from "framer-motion";

interface AddProductFormData {
  name: string;
  description: string;
  price: number;
  offerPrice: number;
  trainerPrice: number;
  weight: string;
  serve: string;
  isImported: boolean;
  inStock: boolean;
  flavour: string;
  company: string;
  manufacturer: string;
  howToUse: string;
  whenToUse: string;
  isActive: boolean;
  sortOrder: number;
  category: string;
  isTrending: boolean;
  isPopular: boolean;
  isRecommended: boolean;
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: AddProductFormData;
  images: File[];
  imagePreviews: string[];
  onFormChange: (data: Partial<AddProductFormData>) => void;
  onImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  categories: Array<{ _id: string; name: string }>;
}

export function AddProductModal({
  isOpen,
  onClose,
  formData,
  images,
  imagePreviews,
  onFormChange,
  onImagesChange,
  onRemoveImage,
  onSubmit,
  isLoading,
  error,
  success,
  categories,
}: AddProductModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Add New Product</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 text-green-300 text-sm"
            >
              {success}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => onFormChange({ name: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => onFormChange({ description: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => onFormChange({ price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Offer Price
                </label>
                <input
                  type="number"
                  value={formData.offerPrice}
                  onChange={(e) => onFormChange({ offerPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Trainer Price
                </label>
                <input
                  type="number"
                  value={formData.trainerPrice}
                  onChange={(e) => onFormChange({ trainerPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Weight
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => onFormChange({ weight: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g. 500g"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Serve
                </label>
                <input
                  type="text"
                  value={formData.serve}
                  onChange={(e) => onFormChange({ serve: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g. 30 servings"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Flavour
                </label>
                <input
                  type="text"
                  value={formData.flavour}
                  onChange={(e) => onFormChange({ flavour: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g. Chocolate"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => onFormChange({ company: e.target.value })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => onFormChange({ manufacturer: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter manufacturer name"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                How to Use
              </label>
              <textarea
                value={formData.howToUse}
                onChange={(e) => onFormChange({ howToUse: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter how to use instructions"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                When to Use
              </label>
              <textarea
                value={formData.whenToUse}
                onChange={(e) => onFormChange({ whenToUse: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter when to use instructions"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => onFormChange({ category: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => onFormChange({ isTrending: e.target.checked })}
                    className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  Trending
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => onFormChange({ isPopular: e.target.checked })}
                    className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  Popular
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isRecommended}
                    onChange={(e) => onFormChange({ isRecommended: e.target.checked })}
                    className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  Recommended
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isImported}
                    onChange={(e) => onFormChange({ isImported: e.target.checked })}
                    className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  Imported
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => onFormChange({ inStock: e.target.checked })}
                    className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  In Stock
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Images (Max 8, 5MB each)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => onRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 8 && (
                  <label className="w-full h-20 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onImagesChange}
                      className="hidden"
                      multiple
                      disabled={imagePreviews.length >= 8}
                    />
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {imagePreviews.length}/8 images selected
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => onFormChange({ isActive: e.target.checked })}
                    className="w-4 h-4 bg-white/5 border border-white/20 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  Active
                </label>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => onFormChange({ sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
