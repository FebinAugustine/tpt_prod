"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { authApi } from "../../services/authApi";
import { useAuthStore } from "../../store/authStore";

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  offerPrice?: number;
  trainerPrice?: number;
  weight?: string;
  serve?: string;
  isImported: boolean;
  inStock: boolean;
  flavour?: string;
  company?: string;
  manufacturer?: string;
  howToUse?: string;
  whenToUse?: string;
  images: string[];
  isActive: boolean;
  sortOrder: number;
  category?: { _id: string; name: string };
  isTrending: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type SortOption = "popular" | "price-low" | "price-high" | "newest";

export default function CategoryProductsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const categoryId = params.id as string;

  const fetchData = useCallback(async () => {
    if (!categoryId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First get all categories to understand the structure
      const categoriesResponse = await authApi.getCategories();
      const categoriesList = categoriesResponse.data || [];
      
      // Find the category we're looking for
      const foundCategory = categoriesList.find(
        (cat: Category) => cat._id?.toString() === categoryId
      );
      setCategory(foundCategory || null);
      
      console.log('=== DEBUG INFO ===');
      console.log('Category ID from URL:', categoryId);
      console.log('Found category:', foundCategory);
      console.log('Category name:', foundCategory?.name);
      console.log('All categories:', categoriesList.map((c: Category) => ({ id: c._id, name: c.name })));
      
      // Fetch products
      const productsResponse = await authApi.getProducts();
      
      if (productsResponse.success && productsResponse.data) {
        const productsList = productsResponse.data;
        
        // Log sample product to see how category is stored
        if (productsList.length > 0) {
          const sampleProduct = productsList[0];
          console.log('Sample product category field:', {
            value: sampleProduct.category,
            type: typeof sampleProduct.category
          });
        }
        
        // Filter products by category - product.category is a FULL OBJECT with _id, name, etc.
        const filteredProducts = productsList.filter((product: Product) => {
          if (!product.isActive) return false;
          
          const productCategory = product.category;
          
          // product.category is an object with _id property
          // Compare product.category._id with the categoryId from URL
          if (productCategory && typeof productCategory === 'object') {
            return productCategory._id === categoryId;
          }
          
          return false;
        });
        
        console.log('Filtered products count:', filteredProducts.length);
        setProducts(filteredProducts);
      } else {
        setError(productsResponse.error || "Failed to load products");
      }
    } catch (err) {
      setError("An error occurred while loading data");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return (a.offerPrice || a.price) - (b.offerPrice || b.price);
      case "price-high":
        return (b.offerPrice || b.price) - (a.offerPrice || a.price);
      case "newest":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "popular":
      default:
        return b.sortOrder - a.sortOrder;
    }
  });

  // Format price
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate discount
  const getDiscount = (price: number, offerPrice: number): number => {
    return Math.round(((price - offerPrice) / price) * 100);
  };

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    setAddingToCart(product._id);
    setTimeout(() => {
      setAddingToCart(null);
    }, 1000);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 w-full">
        <div className="w-full px-4 md:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="mb-4 text-sm text-gray-500">
            <button 
              onClick={() => router.push("/user-dashboard")}
              className="hover:text-blue-600"
            >
              Home
            </button>
            <span className="mx-2">/</span>
            <button 
              onClick={() => router.push("/all-categories")}
              className="hover:text-blue-600"
            >
              Categories
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{category?.name || "Products"}</span>
          </div>

          {/* Category Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {category?.name || "All Products"}
            </h1>
            {category?.description && (
              <p className="text-gray-600 mt-2">{category.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {/* Sort Options */}
          {sortedProducts.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "popular", label: "Popular" },
                  { key: "newest", label: "Newest" },
                  { key: "price-low", label: "Price: Low to High" },
                  { key: "price-high", label: "Price: High to Low" },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSortBy(option.key as SortOption)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sortBy === option.key
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-600 text-lg">No products found in this category</p>
              <button
                onClick={() => router.push("/all-categories")}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse other categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {sortedProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div 
                    className="relative aspect-square bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/product/${product._id}`)}
                  >
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm px-3 py-1 bg-red-600 rounded">Out of Stock</span>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {product.offerPrice && product.price > product.offerPrice && user?.isVerified && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        {getDiscount(product.price, product.offerPrice)}% OFF
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    {/* Product Name */}
                    <h3 
                      className="text-gray-900 text-sm font-medium mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => router.push(`/product/${product._id}`)}
                    >
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-2">
                      {user?.isVerified ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          {product.offerPrice ? (
                            <>
                              <span className="text-gray-900 font-bold">
                                {formatPrice(product.offerPrice)}
                              </span>
                              <span className="text-gray-500 line-through text-sm">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-900 font-bold">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-900 font-bold">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product._id || !product.inStock}
                      className={`w-full py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        product.inStock
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {addingToCart === product._id ? (
                        <span className="flex items-center justify-center gap-1">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : product.inStock ? (
                        'Add to Cart'
                      ) : (
                        'Out of Stock'
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
