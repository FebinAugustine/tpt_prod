"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { authApi } from "../../services/authApi";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

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
  category?: string;
  isTrending: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { addToCart, items, updateQuantity } = useCartStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "howToUse" | "whenToUse" | "additional">("description");
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const productId = params.id as string;

  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.getProductById(productId);
      if (response.success && response.data) {
        setProduct(response.data);
      } else {
        setError(response.error || "Failed to load product");
      }
    } catch (err) {
      setError("An error occurred while loading the product");
      console.error("Error fetching product:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

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
  const productInCart = items.find(item => item._id === product?._id);
  const isInCart = !!productInCart;
  
  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    addToCart({
      _id: product._id,
      name: product.name,
      price: user?.isVerified && product.trainerPrice ? product.trainerPrice : (product.offerPrice || product.price),
      images: product.images,
      inStock: product.inStock,
      weight: product.weight,
      flavour: product.flavour,
    }, quantity);
    
    setTimeout(() => {
      setAddingToCart(false);
    }, 600);
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!product || !product.inStock) return;
    
    const existingItem = items.find(item => item._id === product._id);
    
    if (!existingItem) {
      const productData = {
        _id: product._id,
        name: product.name,
        price: user?.isVerified && product.trainerPrice ? product.trainerPrice : (product.offerPrice || product.price),
        images: product.images,
        inStock: product.inStock,
        weight: product.weight,
        flavour: product.flavour,
      };
      addToCart(productData, quantity);
    }
    
    router.push("/checkout");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{error || "Product not found"}</p>
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
              onClick={() => router.push("/all-products")}
              className="hover:text-blue-600"
            >
              Products
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{product.name}</span>
          </div>

          {/* Product Main Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Out of Stock Badge */}
                  {!product.inStock && (
                    <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded">
                      Out of Stock
                    </div>
                  )}

                  {/* Discount Badge */}
                  {product.offerPrice && product.price > product.offerPrice && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded">
                      {getDiscount(product.price, product.offerPrice)}% OFF
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? "border-blue-600" : "border-gray-200"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-4">
                {/* Product Title */}
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{product.name}</h1>
                  {product.company && (
                    <p className="text-sm text-gray-500 mt-1">by {product.company}</p>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= 4 ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">4.3 (125 reviews)</span>
                </div>

                {/* Price Section */}
                <div className="border-t border-b border-gray-200 py-4">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    {user?.isVerified ? (
                      <>
                        {product.offerPrice ? (
                          <>
                            <span className="text-2xl md:text-3xl font-bold text-gray-900">
                              {formatPrice(product.offerPrice)}
                            </span>
                            <span className="text-lg text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl md:text-3xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-2xl md:text-3xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Trainer Price */}
                  {user?.isVerified && product.trainerPrice && product.trainerPrice > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-emerald-600 font-semibold">Trainer Price:</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {formatPrice(product.trainerPrice)}
                      </span>
                    </div>
                  )}

                  {/* Tax Info */}
                  <p className="text-xs text-gray-500 mt-2">Inclusive of all taxes</p>
                </div>

                {/* Product Details */}
                <div className="space-y-2 text-sm">
                  {product.flavour && (
                    <div className="flex gap-2">
                      <span className="text-gray-500">Flavour:</span>
                      <span className="text-gray-900 font-medium">{product.flavour}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex gap-2">
                      <span className="text-gray-500">Weight:</span>
                      <span className="text-gray-900 font-medium">{product.weight}</span>
                    </div>
                  )}
                  {product.serve && (
                    <div className="flex gap-2">
                      <span className="text-gray-500">Serves:</span>
                      <span className="text-gray-900 font-medium">{product.serve}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <span className="text-gray-500">Availability:</span>
                    <span className={product.inStock ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  {product.isImported && (
                    <div className="flex items-center gap-1">
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">Imported</span>
                    </div>
                  )}
                </div>

                {/* Quantity & Actions */}
                <div className="space-y-4 pt-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-100 rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-gray-100 rounded-r-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || !product.inStock}
                      className={`flex-1 md:flex-none py-3 px-8 rounded-lg font-semibold transition-all duration-200 ${
                        product.inStock
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {addingToCart ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : isInCart ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Added ({productInCart?.quantity})
                        </span>
                      ) : (
                        "ADD TO CART"
                      )}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={!product.inStock}
                      className={`flex-1 md:flex-none py-3 px-8 rounded-lg font-semibold transition-all duration-200 ${
                        product.inStock
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      BUY NOW
                    </button>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span>Free Delivery on orders above ₹500</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Authentic Products</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Tabs */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
              
              {/* Tab Buttons */}
              <div className="flex gap-2 mb-4 overflow-x-auto">
                {[
                  { key: "description", label: "Description" },
                  { key: "howToUse", label: "How to Use" },
                  { key: "whenToUse", label: "When to Use" },
                  { key: "additional", label: "Additional Info" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.key
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-gray-50 rounded-lg p-4 md:p-6">
                {activeTab === "description" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">
                      {product.description || "No description available."}
                    </p>
                  </div>
                )}
                
                {activeTab === "howToUse" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">
                      {product.howToUse || "No usage instructions available."}
                    </p>
                  </div>
                )}
                
                {activeTab === "whenToUse" && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-line">
                      {product.whenToUse || "No timing information available."}
                    </p>
                  </div>
                )}
                
                {activeTab === "additional" && (
                  <div className="space-y-3">
                    {product.manufacturer && (
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-medium">Manufacturer:</span>
                        <span className="text-gray-900">{product.manufacturer}</span>
                      </div>
                    )}
                    {product.company && (
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-medium">Brand:</span>
                        <span className="text-gray-900">{product.company}</span>
                      </div>
                    )}
                    {product.flavour && (
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-medium">Flavour:</span>
                        <span className="text-gray-900">{product.flavour}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-medium">Weight:</span>
                        <span className="text-gray-900">{product.weight}</span>
                      </div>
                    )}
                    {product.serve && (
                      <div className="flex gap-2">
                        <span className="text-gray-500 font-medium">Serves:</span>
                        <span className="text-gray-900">{product.serve}</span>
                      </div>
                    )}
                    {!product.manufacturer && !product.company && !product.flavour && !product.weight && !product.serve && (
                      <p className="text-gray-500">No additional information available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
