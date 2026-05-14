"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AddBannerFormData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  sortOrder: number;
}

interface AddBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: AddBannerFormData;
  bannerImage: File | null;
  bannerImagePreview: string | null;
  onFormChange: (data: Partial<AddBannerFormData>) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export function AddBannerModal({
  isOpen,
  onClose,
  formData,
  bannerImage,
  bannerImagePreview,
  onFormChange,
  onImageChange,
  onSubmit,
  isLoading,
  error,
  success,
}: AddBannerModalProps) {
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
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Add Home Banner</h2>
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
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => onFormChange({ title: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter banner title"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Subtitle
                  </label>
                  <textarea
                    value={formData.subtitle}
                    onChange={(e) => onFormChange({ subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter banner subtitle"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Banner Image
                  </label>
                  <div className="mt-2">
                    {bannerImagePreview ? (
                      <div className="relative">
                        <img
                          src={bannerImagePreview}
                          alt="Banner preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            onImageChange({
                              target: { files: null },
                            } as React.ChangeEvent<HTMLInputElement>);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-32 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onImageChange}
                          className="hidden"
                        />
                        <div className="text-center">
                          <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-400 text-sm">Click to upload</p>
                        </div>
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP.
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => onFormChange({ buttonText: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter button text"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => onFormChange({ buttonLink: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter button link"
                  />
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
                    "Add Banner"
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
