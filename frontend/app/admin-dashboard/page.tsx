"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../components/AdminNavbar";
import { useState, useEffect } from "react";
import { authApi } from "../services/authApi";
import { productApi } from "../services/productApi";
import { StatsData } from "../services/types";

interface AddUserFormData {
  fullName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

interface AddCategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

interface AddProductFormData {
  name: string;
  description: string;
  price: number;
  offerPrice: string;
  trainerPrice: string;
  weight: string;
  serve: string;
  isImported: boolean;
  inStock: boolean;
  flavour: string;
  company: string;
  manufacturer: string;
  howToUse: string;
  whenToUse: string;
  category: string;
  isTrending: boolean;
  isPopular: boolean;
  isRecommended: boolean;
  images: File[] | null;
}

interface AddBannerFormData {
  title: string;
  subtitle: string;
  image: File | null;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  sortOrder: number;
}

interface AddOfferCardFormData {
  title: string;
  subtitle: string;
  image: File | null;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  sortOrder: number;
}



export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddBannerModalOpen, setIsAddBannerModalOpen] = useState(false);
  const [isAddOfferCardModalOpen, setIsAddOfferCardModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState<AddUserFormData>({
    fullName: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [categoryFormData, setCategoryFormData] = useState<AddCategoryFormData>({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });
  const [productFormData, setProductFormData] = useState<AddProductFormData>({
    name: '',
    description: '',
    price: 0,
    offerPrice: '',
    trainerPrice: '',
    weight: '',
    serve: '',
    isImported: false,
    inStock: true,
    flavour: '',
    company: '',
    manufacturer: '',
    howToUse: '',
    whenToUse: '',
    category: '',
    isTrending: false,
    isPopular: false,
    isRecommended: false,
    images: null,
  });
  const [bannerFormData, setBannerFormData] = useState<AddBannerFormData>({
    title: '',
    subtitle: '',
    image: null,
    buttonText: '',
    buttonLink: '',
    isActive: true,
    sortOrder: 0,
  });
  const [offerCardFormData, setOfferCardFormData] = useState<AddOfferCardFormData>({
    title: '',
    subtitle: '',
    image: null,
    buttonText: '',
    buttonLink: '',
    isActive: true,
    sortOrder: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authApi.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          console.error('Failed to fetch stats:', response.error);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchStats();
    }
  }, [isAuthenticated, user]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authApi.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Handle redirects in useEffect to avoid render cycle issues
  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push("/login");
      return;
    }
  }, [isHydrated, isAuthenticated, user, router]);

  // Don't render dashboard if redirecting
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  // Show loading skeleton for stats while loading
  if (isLoadingStats) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black">
        <AdminNavbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-white/20 rounded mb-4"></div>
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleAddUser = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authApi.addUser(
        userFormData.fullName,
        userFormData.email,
        userFormData.password,
        userFormData.role
      );

      if (response.success) {
        setSuccess('User added successfully!');
        // Reset form
        setUserFormData({
          fullName: '',
          email: '',
          password: '',
          role: 'user',
        });
        // Refresh stats
        const statsResponse = await authApi.getStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
        // Close modal after 2 seconds
        setTimeout(() => {
          setIsAddUserModalOpen(false);
          setSuccess(null);
        }, 2000);
      } else {
        setError(response.error || 'Failed to add user');
      }
    } catch {
      setError('An error occurred while adding user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authApi.addCategory(
        categoryFormData.name,
        categoryFormData.description,
        categoryFormData.isActive,
        categoryFormData.sortOrder
      );

      if (response.success) {
        setSuccess('Category added successfully!');
        // Reset form
        setCategoryFormData({
          name: '',
          description: '',
          isActive: true,
          sortOrder: 0,
        });
        // Refresh categories
        const categoriesResponse = await authApi.getCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
        // Close modal after 2 seconds
        setTimeout(() => {
          setIsAddCategoryModalOpen(false);
          setSuccess(null);
        }, 2000);
      } else {
        setError(response.error || 'Failed to add category');
      }
    } catch {
      setError('An error occurred while adding category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare product data
      const productData = {
        name: productFormData.name,
        description: productFormData.description,
        price: parseFloat(productFormData.price.toString()),
        offerPrice: productFormData.offerPrice ? parseFloat(productFormData.offerPrice) : undefined,
        trainerPrice: productFormData.trainerPrice ? parseFloat(productFormData.trainerPrice) : undefined,
        weight: productFormData.weight || undefined,
        serve: productFormData.serve || undefined,
        isImported: productFormData.isImported,
        inStock: productFormData.inStock,
        flavour: productFormData.flavour || undefined,
        company: productFormData.company || undefined,
        manufacturer: productFormData.manufacturer || undefined,
        howToUse: productFormData.howToUse || undefined,
        whenToUse: productFormData.whenToUse || undefined,
        category: productFormData.category || undefined,
        isTrending: productFormData.isTrending,
        isPopular: productFormData.isPopular,
        isRecommended: productFormData.isRecommended,
        isActive: true,
        sortOrder: 0,
      };

      const images = productFormData.images || [];

      const response = await productApi.addProduct(productData, images.length > 0 ? images : undefined);

      if (response.success) {
        setSuccess('Product added successfully!');
        // Reset form
        setProductFormData({
          name: '',
          description: '',
          price: 0,
          offerPrice: '',
          trainerPrice: '',
          weight: '',
          serve: '',
          isImported: false,
          inStock: true,
          flavour: '',
          company: '',
          manufacturer: '',
          howToUse: '',
          whenToUse: '',
          category: '',
          isTrending: false,
          isPopular: false,
          isRecommended: false,
          images: null,
        });
        // Close modal after 2 seconds
        setTimeout(() => {
          setIsAddProductModalOpen(false);
          setSuccess(null);
        }, 2000);
      } else {
        setError(response.error || 'Failed to add product');
      }
    } catch {
      setError('An error occurred while adding product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBanner = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const bannerData = {
        title: bannerFormData.title,
        subtitle: bannerFormData.subtitle || undefined,
        buttonText: bannerFormData.buttonText || undefined,
        buttonLink: bannerFormData.buttonLink || undefined,
        isActive: bannerFormData.isActive,
        sortOrder: bannerFormData.sortOrder,
      };

      const image = bannerFormData.image;

      const response = await authApi.addBanner(bannerData, image || undefined);

      if (response.success) {
        setSuccess('Banner added successfully!');
        // Reset form
        setBannerFormData({
          title: '',
          subtitle: '',
          image: null,
          buttonText: '',
          buttonLink: '',
          isActive: true,
          sortOrder: 0,
        });
        // Close modal after 2 seconds
        setTimeout(() => {
          setIsAddBannerModalOpen(false);
          setSuccess(null);
        }, 2000);
      } else {
        setError(response.error || 'Failed to add banner');
      }
    } catch {
      setError('An error occurred while adding banner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOfferCard = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const offerCardData = {
        title: offerCardFormData.title,
        subtitle: offerCardFormData.subtitle || undefined,
        buttonText: offerCardFormData.buttonText || undefined,
        buttonLink: offerCardFormData.buttonLink || undefined,
        isActive: offerCardFormData.isActive,
        sortOrder: offerCardFormData.sortOrder,
      };

      const image = offerCardFormData.image;

      const response = await authApi.addOfferCard(offerCardData, image || undefined);

      if (response.success) {
        setSuccess('Offer card added successfully!');
        // Reset form
        setOfferCardFormData({
          title: '',
          subtitle: '',
          image: null,
          buttonText: '',
          buttonLink: '',
          isActive: true,
          sortOrder: 0,
        });
        // Close modal after 2 seconds
        setTimeout(() => {
          setIsAddOfferCardModalOpen(false);
          setSuccess(null);
        }, 2000);
      } else {
        setError(response.error || 'Failed to add offer card');
      }
    } catch {
      setError('An error occurred while adding offer card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-300 mt-1">Welcome back, {user.fullName}!</p>
        </motion.div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">
                   {stats?.totalUsers?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <span>↑</span> 12% from last month
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Users</p>
                <p className="text-3xl font-bold text-white mt-1">
                   {stats?.activeUsers?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <span>↑</span> 8% from last month
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Pending Verifications</p>
                <p className="text-3xl font-bold text-white mt-1">
                   {stats?.pendingVerifications?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
            </div>
            <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
              <span>↑</span> 3% from last month
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-1">
                   ₹{stats?.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <span>↑</span> 15% from last month
            </p>
          </motion.div>
        </div>

        {/* New 3 Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Categories</p>
                <p className="text-3xl font-bold text-white mt-1">
                   {stats?.totalCategories?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📂</span>
              </div>
            </div>
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <span>↑</span> Categories
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-white mt-1">
                   {stats?.totalProducts?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <span>↑</span> Products available
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-white mt-1">
                   {stats?.totalOrders?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛒</span>
              </div>
            </div>
            <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
              <span>↑</span> Orders placed
            </p>
          </motion.div>
        </div>

         {/* Manage Section */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.5 }}
           className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
         >
           <h2 className="text-xl font-semibold text-white mb-4">Manage</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <button 
               onClick={() => setIsAddUserModalOpen(true)}
               className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-left flex items-center gap-2"
             >
               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
               </svg>
               <span>Add User</span>
             </button>

             <button 
               onClick={() => setIsAddProductModalOpen(true)}
               className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-left flex items-center gap-2"
             >
               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
               </svg>
               <span>Add Product</span>
             </button>

             <button 
               onClick={() => setIsAddBannerModalOpen(true)}
               className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors text-left flex items-center gap-2"
             >
               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               <span>Add Home Banner</span>
             </button>

             <button 
               onClick={() => setIsAddOfferCardModalOpen(true)}
               className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors text-left flex items-center gap-2"
             >
               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
               </svg>
               <span>Add Offer Cards</span>
             </button>

             <button 
               onClick={() => setIsAddCategoryModalOpen(true)}
               className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-left flex items-center gap-2"
             >
               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
               </svg>
               <span>Add Category</span>
             </button>
           </div>
         </motion.div>

         {/* GoTo Section */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.6 }}
           className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
         >
           <h2 className="text-xl font-semibold text-white mb-4">GoTo</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <button 
               onClick={() => router.push("/all-users")}
               className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors text-left flex items-center gap-2"
             >
               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
               </svg>
               <span>All Users</span>
             </button>

             <button 
               onClick={() => router.push("/all-products")}
               className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-left flex items-center gap-2"
             >
               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
               </svg>
               <span>All Products</span>
             </button>

             <button 
               onClick={() => router.push("/all-categories")}
               className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-left flex items-center gap-2"
             >
               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
               </svg>
               <span>All Categories</span>
             </button>

             <button 
               onClick={() => router.push("/admin/all-orders")}
               className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-left flex items-center gap-2"
             >
               <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
               </svg>
               <span>All Orders</span>
             </button>
           </div>
         </motion.div>

        {/* Add User Modal */}
        <AnimatePresence>
          {isAddUserModalOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => setIsAddUserModalOpen(false)}
              >
                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Add New User</h2>
                    <button
                      onClick={() => setIsAddUserModalOpen(false)}
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
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={userFormData.fullName}
                        onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter password"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Role
                      </label>
                      <select
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as 'user' | 'admin' })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setIsAddUserModalOpen(false)}
                      className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddUser}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Adding...
                        </div>
                      ) : (
                        'Add User'
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Add Category Modal */}
        <AnimatePresence>
          {isAddCategoryModalOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={() => setIsAddCategoryModalOpen(false)}
              >
                {/* Modal */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Add New Category</h2>
                    <button
                      onClick={() => setIsAddCategoryModalOpen(false)}
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
                        Category Name
                      </label>
                      <input
                        type="text"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter category name"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={categoryFormData.description}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter category description"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Is Active
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={categoryFormData.isActive}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={categoryFormData.sortOrder}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, sortOrder: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter sort order"
                        min="0"
                      />
                    </div>
                   </div>

                   <div className="flex gap-3 mt-6">
                     <button
                       onClick={() => setIsAddCategoryModalOpen(false)}
                       className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                     >
                       Cancel
                     </button>
                     <button
                       onClick={handleAddCategory}
                       disabled={isLoading}
                       className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isLoading ? (
                         <div className="flex items-center justify-center gap-2">
                           <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           Adding...
                         </div>
                       ) : (
                         'Add Category'
                       )}
                     </button>
                   </div>
                 </motion.div>
               </motion.div>
             </>
           )}
         </AnimatePresence>

         {/* Add Product Modal */}
         <AnimatePresence>
           {isAddProductModalOpen && (
             <>
               {/* Overlay */}
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 transition={{ duration: 0.2 }}
                 className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                 onClick={() => setIsAddProductModalOpen(false)}
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
                       onClick={() => setIsAddProductModalOpen(false)}
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
                     {/* Basic Info */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Product Name *
                         </label>
                         <input
                           type="text"
                           value={productFormData.name}
                           onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="Enter product name"
                           required
                         />
                       </div>

                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Price *
                         </label>
                         <input
                           type="number"
                           step="0.01"
                           min="0"
                           value={productFormData.price}
                           onChange={(e) => setProductFormData({ ...productFormData, price: parseFloat(e.target.value) || 0 })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="0.00"
                         />
                       </div>

                       <div className="md:col-span-2">
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Description
                         </label>
                         <textarea
                           value={productFormData.description}
                           onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="Enter product description"
                           rows={3}
                         />
                       </div>

                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Offer Price
                         </label>
                         <input
                           type="number"
                           step="0.01"
                           min="0"
                           value={productFormData.offerPrice}
                           onChange={(e) => setProductFormData({ ...productFormData, offerPrice: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="Optional"
                         />
                       </div>

                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Trainer Price
                         </label>
                         <input
                           type="number"
                           step="0.01"
                           min="0"
                           value={productFormData.trainerPrice}
                           onChange={(e) => setProductFormData({ ...productFormData, trainerPrice: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="Optional"
                         />
                       </div>

                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Weight
                         </label>
                         <input
                           type="text"
                           value={productFormData.weight}
                           onChange={(e) => setProductFormData({ ...productFormData, weight: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="e.g., 1kg, 500g"
                         />
                       </div>

                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Serve
                         </label>
                         <input
                           type="text"
                           value={productFormData.serve}
                           onChange={(e) => setProductFormData({ ...productFormData, serve: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="e.g., 30 servings"
                         />
                       </div>

                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Category
                         </label>
                         <select
                           value={productFormData.category}
                           onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                         >
                           <option value="">Select Category</option>
                           {categories.map((cat) => (
                             <option key={cat._id} value={cat._id} className="bg-gray-900">
                               {cat.name}
                             </option>
                           ))}
                         </select>
                       </div>

                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Flavour
                         </label>
                         <input
                           type="text"
                           value={productFormData.flavour}
                           onChange={(e) => setProductFormData({ ...productFormData, flavour: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="e.g., Chocolate, Vanilla"
                         />
                       </div>

                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Company
                         </label>
                         <input
                           type="text"
                           value={productFormData.company}
                           onChange={(e) => setProductFormData({ ...productFormData, company: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="Company name"
                         />
                       </div>

                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Manufacturer
                         </label>
                         <input
                           type="text"
                           value={productFormData.manufacturer}
                           onChange={(e) => setProductFormData({ ...productFormData, manufacturer: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="Manufacturer name"
                         />
                       </div>

                       <div className="md:col-span-2">
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           How To Use
                         </label>
                         <textarea
                           value={productFormData.howToUse}
                           onChange={(e) => setProductFormData({ ...productFormData, howToUse: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="Instructions for use"
                           rows={2}
                         />
                       </div>

                       <div className="md:col-span-2">
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           When To Use
                         </label>
                         <textarea
                           value={productFormData.whenToUse}
                           onChange={(e) => setProductFormData({ ...productFormData, whenToUse: e.target.value })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                           placeholder="When to consume"
                           rows={2}
                         />
                       </div>

                       <div>
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Product Images
                         </label>
                         <input
                           type="file"
                           multiple
                           accept="image/jpeg,image/png,image/gif,image/webp"
                           onChange={(e) => setProductFormData({ 
                             ...productFormData, 
                             images: e.target.files ? Array.from(e.target.files) : null 
                           })}
                           className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                         />
                         <p className="text-gray-400 text-xs mt-1">Up to 8 images, max 5MB each</p>
                       </div>

                       {/* Checkboxes */}
                       <div className="flex items-center justify-between">
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Imported
                         </label>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={productFormData.isImported}
                             onChange={(e) => setProductFormData({ ...productFormData, isImported: e.target.checked })}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                         </label>
                       </div>

                       <div className="flex items-center justify-between">
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           In Stock
                         </label>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={productFormData.inStock}
                             onChange={(e) => setProductFormData({ ...productFormData, inStock: e.target.checked })}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                         </label>
                       </div>

                       <div className="flex items-center justify-between">
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Trending
                         </label>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={productFormData.isTrending}
                             onChange={(e) => setProductFormData({ ...productFormData, isTrending: e.target.checked })}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                         </label>
                       </div>

                       <div className="flex items-center justify-between">
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Popular
                         </label>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={productFormData.isPopular}
                             onChange={(e) => setProductFormData({ ...productFormData, isPopular: e.target.checked })}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                         </label>
                       </div>

                       <div className="flex items-center justify-between">
                         <label className="block text-gray-300 text-sm font-medium mb-2">
                           Recommended
                         </label>
                         <label className="relative inline-flex items-center cursor-pointer">
                           <input
                             type="checkbox"
                             checked={productFormData.isRecommended}
                             onChange={(e) => setProductFormData({ ...productFormData, isRecommended: e.target.checked })}
                             className="sr-only peer"
                           />
                           <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                         </label>
                       </div>
                     </div>
                   </div>

                   <div className="flex gap-3 mt-6">
                     <button
                       onClick={() => setIsAddProductModalOpen(false)}
                       className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                     >
                       Cancel
                     </button>
                     <button
                       onClick={handleAddProduct}
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
           )}
          </AnimatePresence>

          {/* Add Banner Modal */}
          <AnimatePresence>
            {isAddBannerModalOpen && (
              <>
                {/* Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                  onClick={() => setIsAddBannerModalOpen(false)}
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
                      <h2 className="text-xl font-semibold text-white">Add New Banner</h2>
                      <button
                        onClick={() => setIsAddBannerModalOpen(false)}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Banner Title *
                          </label>
                          <input
                            type="text"
                            value={bannerFormData.title}
                            onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Enter banner title"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={bannerFormData.subtitle}
                            onChange={(e) => setBannerFormData({ ...bannerFormData, subtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Optional subtitle"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Banner Image *
                          </label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={(e) => setBannerFormData({ 
                              ...bannerFormData, 
                              image: e.target.files ? e.target.files[0] : null 
                            })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                          />
                          <p className="text-gray-400 text-xs mt-1">Recommended size: 1200x400px, max 5MB</p>
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={bannerFormData.buttonText}
                            onChange={(e) => setBannerFormData({ ...bannerFormData, buttonText: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="e.g., Shop Now"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Button Link
                          </label>
                          <input
                            type="text"
                            value={bannerFormData.buttonLink}
                            onChange={(e) => setBannerFormData({ ...bannerFormData, buttonLink: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="e.g., /products"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Active
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bannerFormData.isActive}
                              onChange={(e) => setBannerFormData({ ...bannerFormData, isActive: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Sort Order
                          </label>
                          <input
                            type="number"
                            value={bannerFormData.sortOrder}
                            onChange={(e) => setBannerFormData({ ...bannerFormData, sortOrder: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setIsAddBannerModalOpen(false)}
                        className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddBanner}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Adding...
                          </div>
                        ) : (
                          'Add Banner'
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Add Offer Card Modal */}
          <AnimatePresence>
            {isAddOfferCardModalOpen && (
              <>
                {/* Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                  onClick={() => setIsAddOfferCardModalOpen(false)}
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
                      <h2 className="text-xl font-semibold text-white">Add New Offer Card</h2>
                      <button
                        onClick={() => setIsAddOfferCardModalOpen(false)}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Card Title *
                          </label>
                          <input
                            type="text"
                            value={offerCardFormData.title}
                            onChange={(e) => setOfferCardFormData({ ...offerCardFormData, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Enter offer card title"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={offerCardFormData.subtitle}
                            onChange={(e) => setOfferCardFormData({ ...offerCardFormData, subtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="Optional subtitle"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Card Image *
                          </label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={(e) => setOfferCardFormData({ 
                              ...offerCardFormData, 
                              image: e.target.files ? e.target.files[0] : null 
                            })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                          />
                          <p className="text-gray-400 text-xs mt-1">Recommended size: 250x100px, max 2MB</p>
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Button Text
                          </label>
                          <input
                            type="text"
                            value={offerCardFormData.buttonText}
                            onChange={(e) => setOfferCardFormData({ ...offerCardFormData, buttonText: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="e.g., View Deal"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Button Link
                          </label>
                          <input
                            type="text"
                            value={offerCardFormData.buttonLink}
                            onChange={(e) => setOfferCardFormData({ ...offerCardFormData, buttonLink: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="e.g., /products"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Active
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={offerCardFormData.isActive}
                              onChange={(e) => setOfferCardFormData({ ...offerCardFormData, isActive: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">
                            Sort Order
                          </label>
                          <input
                            type="number"
                            value={offerCardFormData.sortOrder}
                            onChange={(e) => setOfferCardFormData({ ...offerCardFormData, sortOrder: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setIsAddOfferCardModalOpen(false)}
                        className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddOfferCard}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Adding...
                          </div>
                        ) : (
                          'Add Offer Card'
                        )}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
               </>
             )}
           </AnimatePresence>
          </div>
        </div>
      );
    }
