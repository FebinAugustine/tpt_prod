"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";
import { authApi } from "../services/authApi";
import { motion } from "framer-motion";
import { Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";

export default function AllProductsPage() {
  return (
    <AllProductsPageWrapper />
  );
}

function AllProductsPageWrapper() {
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
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    router.push("/login");
    return null;
  }

  return <ProductsContent />;
}

function ProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [editProductImages, setEditProductImages] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: 0,
    offerPrice: 0,
    trainerPrice: 0,
    weight: '',
    serve: '',
    isImported: false,
    inStock: true,
    flavour: '',
    company: '',
    manufacturer: '',
    howToUse: '',
    whenToUse: '',
    isActive: true,
    sortOrder: 0,
    category: '',
    isTrending: false,
    isPopular: false,
    isRecommended: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        authApi.getProducts(),
        authApi.getCategories()
      ]);
      
      if (productsResponse.success && productsResponse.data) {
        setProducts(productsResponse.data);
      }
      
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file size (5MB limit) and count (max 8 images)
      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      files.forEach((file) => {
        if (editImagePreviews.length + validFiles.length < 8) {
          if (file.size <= 5 * 1024 * 1024) {
            validFiles.push(file);
            const reader = new FileReader();
            reader.onload = (event) => {
              setEditImagePreviews((prev) => [...prev, event.target?.result as string]);
            };
            reader.readAsDataURL(file);
           } else {
             toast.error(`File ${file.name} is too large (max 5MB)`);
           }
         } else {
           toast.error('Maximum 8 images allowed');
         }
      });

      setEditProductImages((prev) => [...prev, ...validFiles]);
    }
  };

  const removeEditImage = (index: number) => {
    // Check if this is a new image (not from the existing product)
    if (index >= selectedProduct.images.length) {
      // Remove from new files
      setEditProductImages((prev) => prev.filter((_, i) => i !== index - selectedProduct.images.length));
    }
    
    // Remove from previews
    setEditImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteProductId) return;

    try {
      setDeleteLoading(deleteProductId);
      const response = await authApi.deleteProduct(deleteProductId);
      if (response.success) {
        setProducts(products.filter(product => product._id !== deleteProductId));
      } else {
        console.error("Error deleting product:", response.error);
        toast.error(response.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      offerPrice: product.offerPrice || 0,
      trainerPrice: product.trainerPrice || 0,
      weight: product.weight || '',
      serve: product.serve || '',
      isImported: product.isImported || false,
      inStock: product.inStock || true,
      flavour: product.flavour || '',
      company: product.company || '',
      manufacturer: product.manufacturer || '',
      howToUse: product.howToUse || '',
      whenToUse: product.whenToUse || '',
      isActive: product.isActive || true,
      sortOrder: product.sortOrder || 0,
      category: product.category?._id || '',
      isTrending: product.isTrending || false,
      isPopular: product.isPopular || false,
      isRecommended: product.isRecommended || false,
    });
    
    // Initialize edit product images with existing images
    setEditImagePreviews(product.images || []);
    setEditProductImages([]);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setEditLoading(true);
    try {
      const response = await authApi.updateProduct(selectedProduct._id, editFormData, editProductImages);
      if (response.success) {
        // Update products with new data
        setProducts(products.map(product => 
          product._id === selectedProduct._id ? { 
            ...product, 
            ...editFormData,
            // Update images - existing images plus new ones
            images: [...(selectedProduct.images || []), ...editProductImages.map(file => URL.createObjectURL(file))]
          } : product
        ));
        setEditModalOpen(false);
        setEditProductImages([]);
        setEditImagePreviews([]);
      } else {
        console.error("Error updating product:", response.error);
        toast.error(response.error || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setEditLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getStatusBadgeClass = (inStock: boolean) => {
    return inStock 
      ? "bg-green-500/20 text-green-400 border-green-500/30" 
      : "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getImportedBadgeClass = (isImported: boolean) => {
    return isImported 
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30" 
      : "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">All Products</h1>
        
        {isLoading ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
            <div className="text-gray-400 text-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p>Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
            <div className="text-gray-400 text-lg">
              <p>No products available</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:shadow-lg hover:border-white/30 transition-all"
              >
                {product.images && product.images.length > 0 && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                    <div className="flex flex-col gap-1">
                      {product.inStock && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(product.inStock)}`}>
                          In Stock
                        </span>
                      )}
                      {!product.inStock && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(product.inStock)}`}>
                          Out of Stock
                        </span>
                      )}
                      {product.isImported && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getImportedBadgeClass(product.isImported)}`}>
                          Imported
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    {product.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Price</span>
                        <span className="text-white font-semibold">{formatPrice(product.price)}</span>
                      </div>
                    )}
                    {product.offerPrice && product.offerPrice < product.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Offer Price</span>
                        <span className="text-green-400 font-semibold">{formatPrice(product.offerPrice)}</span>
                      </div>
                    )}
                    {product.trainerPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Trainer Price</span>
                        <span className="text-yellow-400 font-semibold">{formatPrice(product.trainerPrice)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setDeleteModalOpen(true);
                    }}
                    disabled={deleteLoading === product._id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading === product._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete
                  </button>
                
                  <button
                    onClick={() => handleEditClick(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/20 sticky top-0 bg-white/10 backdrop-blur-lg z-10">
              <h3 className="text-lg font-semibold text-white">Edit Product</h3>
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
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Product Name
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
                    <label htmlFor="price" className="block text-sm font-medium text-gray-300">
                      Price
                    </label>
                    <input
                      type="number"
                      id="price"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="offerPrice" className="block text-sm font-medium text-gray-300">
                      Offer Price
                    </label>
                    <input
                      type="number"
                      id="offerPrice"
                      value={editFormData.offerPrice}
                      onChange={(e) => setEditFormData({ ...editFormData, offerPrice: parseFloat(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="trainerPrice" className="block text-sm font-medium text-gray-300">
                      Trainer Price
                    </label>
                    <input
                      type="number"
                      id="trainerPrice"
                      value={editFormData.trainerPrice}
                      onChange={(e) => setEditFormData({ ...editFormData, trainerPrice: parseFloat(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-300">
                      Weight
                    </label>
                    <input
                      type="text"
                      id="weight"
                      value={editFormData.weight}
                      onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="serve" className="block text-sm font-medium text-gray-300">
                      Serve
                    </label>
                    <input
                      type="text"
                      id="serve"
                      value={editFormData.serve}
                      onChange={(e) => setEditFormData({ ...editFormData, serve: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="flavour" className="block text-sm font-medium text-gray-300">
                      Flavour
                    </label>
                    <input
                      type="text"
                      id="flavour"
                      value={editFormData.flavour}
                      onChange={(e) => setEditFormData({ ...editFormData, flavour: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={editFormData.company}
                      onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-300">
                      Manufacturer
                    </label>
                    <input
                      type="text"
                      id="manufacturer"
                      value={editFormData.manufacturer}
                      onChange={(e) => setEditFormData({ ...editFormData, manufacturer: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="howToUse" className="block text-sm font-medium text-gray-300">
                      How to Use
                    </label>
                    <input
                      type="text"
                      id="howToUse"
                      value={editFormData.howToUse}
                      onChange={(e) => setEditFormData({ ...editFormData, howToUse: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="whenToUse" className="block text-sm font-medium text-gray-300">
                      When to Use
                    </label>
                    <input
                      type="text"
                      id="whenToUse"
                      value={editFormData.whenToUse}
                      onChange={(e) => setEditFormData({ ...editFormData, whenToUse: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                    Category
                  </label>
                  <select
                    id="category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-white"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
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
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isTrending"
                      checked={editFormData.isTrending}
                      onChange={(e) => setEditFormData({ ...editFormData, isTrending: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isTrending" className="ml-2 block text-sm text-gray-300">
                      Trending
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={editFormData.isPopular}
                      onChange={(e) => setEditFormData({ ...editFormData, isPopular: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPopular" className="ml-2 block text-sm text-gray-300">
                      Popular
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRecommended"
                      checked={editFormData.isRecommended}
                      onChange={(e) => setEditFormData({ ...editFormData, isRecommended: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRecommended" className="ml-2 block text-sm text-gray-300">
                      Recommended
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isImported"
                      checked={editFormData.isImported}
                      onChange={(e) => setEditFormData({ ...editFormData, isImported: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isImported" className="ml-2 block text-sm text-gray-300">
                      Imported
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={editFormData.inStock}
                      onChange={(e) => setEditFormData({ ...editFormData, inStock: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="inStock" className="ml-2 block text-sm text-gray-300">
                      In Stock
                    </label>
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
                </div>

                {/* Product Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Images (Max 8, 5MB each)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {editImagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            removeEditImage(index);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {editImagePreviews.length < 8 && (
                      <label className="w-full h-20 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="hidden"
                          multiple
                          disabled={editImagePreviews.length >= 8}
                        />
                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {editImagePreviews.length}/8 images selected
                  </p>
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
                    {editLoading ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {deleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">Delete Product</h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-300 mb-4">
                Are you sure you want to delete the product{" "}
                <span className="font-medium text-white">{selectedProduct?.name}</span>?
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
                  onClick={() => handleDelete()}
                  disabled={deleteLoading === selectedProduct._id}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleteLoading === selectedProduct._id ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
