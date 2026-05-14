"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AddOfferCardFormData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  sortOrder: number;
}

interface AddOfferCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: AddOfferCardFormData;
  offerCardImage: File | null;
  offerCardImagePreview: string | null;
  onFormChange: (data: Partial<AddOfferCardFormData>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export function AddOfferCardModal({
  isOpen,
  onClose,
  formData,
  offerCardImage,
  offerCardImagePreview,
  onFormChange,
  onImageChange,
  onSubmit,
  isLoading,
  error,
  success,
}: AddOfferCardModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
                <h2 className="text-xl font-semibold text-white">Add Offer Card</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="offerTitle" className="block text-sm font-medium text-gray-300">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="offerTitle"
                    value={formData.title}
                    onChange={(e) => onFormChange({ title: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Summer Sale"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="offerSubtitle" className="block text-sm font-medium text-gray-300">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    id="offerSubtitle"
                    value={formData.subtitle}
                    onChange={(e) => onFormChange({ subtitle: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Up to 50% off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image <span className="text-red-400">*</span> (Recommended size: 250x100)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors">
                      <span>Choose Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={onImageChange}
                        className="hidden"
                      />
                    </label>
                    {offerCardImagePreview && (
                      <div className="relative w-32 h-12">
                        <img
                          src={offerCardImagePreview}
                          alt="Offer Card Preview"
                          className="w-full h-full object-contain rounded-lg border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            onImageChange({
                              target: { files: null },
                            } as React.ChangeEvent<HTMLInputElement>);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Image will be auto-cropped to 250x100 dimensions. Max file size: 2MB
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="offerButtonText" className="block text-sm font-medium text-gray-300">
                      Button Text
                    </label>
                    <input
                      type="text"
                      id="offerButtonText"
                      value={formData.buttonText}
                      onChange={(e) => onFormChange({ buttonText: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label htmlFor="offerButtonLink" className="block text-sm font-medium text-gray-300">
                      Button Link
                    </label>
                    <input
                      type="text"
                      id="offerButtonLink"
                      value={formData.buttonLink}
                      onChange={(e) => onFormChange({ buttonLink: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="/products"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="offerIsActive" className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <input
                        type="checkbox"
                        id="offerIsActive"
                        checked={formData.isActive}
                        onChange={(e) => onFormChange({ isActive: e.target.checked })}
                        className="w-4 h-4 rounded bg-white/10 border-white/20 text-red-600 focus:ring-red-500"
                      />
                      Active
                    </label>
                  </div>
                  <div>
                    <label htmlFor="offerSortOrder" className="block text-sm font-medium text-gray-300">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      id="offerSortOrder"
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
                    "Add Offer Card"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
