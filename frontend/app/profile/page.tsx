"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { authApi } from '../services/authApi';
import { Order, Address, User } from '../services/types';
import { checkPasswordStrength, ValidationError } from '../utils/validation';
import { toast } from "sonner";

type TabType = 'overview' | 'orders' | 'wishlist' | 'addresses' | 'settings';

const UserProfile = () => {
    const { user, isAuthenticated, isHydrated, updateUser } = useAuthStore();
  const router = useRouter();
  const cartStore = useCartStore();
  const cartItems = cartStore.items;
  const clearCart = cartStore.clearCart;
  const wishlistStore = useWishlistStore();
  const wishlistItems = wishlistStore.items;
  const clearWishlist = wishlistStore.clearWishlist;
  const removeFromWishlist = wishlistStore.removeFromWishlist;
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
   const [formData, setFormData] = useState({
     fullName: '',
     email: '',
     phone: '',
   });
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    label: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string; color: string; suggestions: string[] } | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState<string | null>(null);

  // Ref to ensure one-time initialization of form + secondary data
  const hasInitializedRef = useRef(false);

  // Fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const response = await authApi.getOrders();
      if (response.success && response.data) {
        const ordersData = response.data as { orders?: Order[]; total?: number; page?: number; totalPages?: number };
        const fetchedOrders = Array.isArray(ordersData.orders) ? ordersData.orders : [];
        setOrders(fetchedOrders);
      } else {
        setOrdersError(response.error || 'Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrdersError(error instanceof Error ? error.message : 'Unknown error');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    setAddressesLoading(true);
    setAddressesError(null);
    try {
      const response = await authApi.getAddresses();
      if (response.success && response.data) {
        // Response data is the array directly: ShippingAddress[]
        setAddresses(Array.isArray(response.data) ? response.data : []);
      } else {
        setAddressesError(response.error || 'Failed to fetch addresses');
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddressesError(error instanceof Error ? error.message : 'Unknown error');
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

// Auth protection - redirect if not logged in or not verified
  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    if (!user.isVerified) {
      router.push('/not-verified');
      return;
    }
  }, [isHydrated, isAuthenticated, user?.isVerified, router]);

  // Seed initial form data and fetch secondary data ONLY ONCE when user first becomes available
  useEffect(() => {
    if (!user || hasInitializedRef.current) return;

    hasInitializedRef.current = true;

    // Initial seed of the edit form from the loaded user
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
    });

    // One-time fetch of orders and addresses for the profile
    fetchOrders();
    fetchAddresses();
  }, [user]); // Only depends on user becoming truthy the first time

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !user.isVerified) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await authApi.updateProfile(formData);
      if (response.success && response.data) {
        // The backend uses @WrapResponse() on this endpoint, so the actual user
        // is nested under response.data.data. Fall back gracefully for safety.
        const updatedUser = (response.data as any)?.data ?? response.data;
        updateUser(updatedUser as User);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(response.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setIsEditing(false);
  };

  // Stats calculation
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const ordersCount = orders.length;
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
    { id: 'addresses', label: 'Addresses', icon: '📍' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ] as const;

  // Address handlers
  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressFormData({
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressFormData({
        label: '',
        fullName: user?.fullName || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
    }
    setError(null);
    setIsAddressModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddress(null);
    setAddressFormData({
      label: '',
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
    setError(null);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (addresses.length >= 3 && !editingAddress) {
      setError("Maximum 3 addresses allowed. Please edit an existing address.");
      return;
    }

    setIsSavingAddress(true);
    setError(null);

    try {
      let response;
      if (editingAddress) {
        response = await authApi.updateAddress(editingAddress._id, addressFormData);
      } else {
        response = await authApi.createAddress(addressFormData);
      }

      if (response.success) {
        fetchAddresses();
        handleCloseModal();
      } else {
        setError(response.error || "Failed to save address");
      }
    } catch (err: any) {
      console.error("Error saving address:", err);
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("An error occurred while saving address");
      }
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const response = await authApi.deleteAddress(id);
      if (response.success) {
        fetchAddresses();
      } else {
        setAddressesError(response.error || 'Failed to delete address');
      }
    } catch (err: any) {
      setAddressesError(err?.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await authApi.setDefaultAddress(id);
      if (response.success) {
        fetchAddresses();
      }
    } catch (err: any) {
      setAddressesError(err?.message || 'Failed to set default address');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Client-side validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password cannot be same as current password');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Only send currentPassword and newPassword (no confirmPassword)
      const response = await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordStrength(null);
      } else {
        setPasswordError(response.error || 'Failed to update password');
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      setPasswordError(err?.response?.data?.message || err?.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    // Calculate password strength for new password field
    if (field === 'newPassword' && value) {
      const strength = checkPasswordStrength(value);
      setPasswordStrength(strength);
    } else if (field === 'newPassword' && !value) {
      setPasswordStrength(null);
    }
    
    // Clear errors when user starts typing
    if (passwordError) {
      setPasswordError(null);
    }
    if (passwordSuccess) {
      setPasswordSuccess(null);
    }
  };

   // Delete account handler
   const handleDeleteAccount = async () => {
     if (!deletePassword) {
       setPasswordError('Please enter your password to confirm deletion');
       return;
     }

     if (!confirm('Are you ABSOLUTELY sure you want to delete your account? This action cannot be undone. All your data including addresses, orders, cart, and wishlist will be permanently deleted.')) {
       return;
     }

     setIsDeletingAccount(true);
     setPasswordError(null);

     try {
       const response = await authApi.deleteAccount();
       if (response.success) {
          // Clear frontend stores
          useCartStore.getState().clearCart();
          useWishlistStore.getState().clearWishlist();

          // Show success toast and then redirect
          toast.success('Your account has been deleted successfully.');
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
       } else {
         setPasswordError(response.error || 'Failed to delete account');
       }
     } catch (err: any) {
       console.error('Error deleting account:', err);
       setPasswordError(err?.response?.data?.message || err?.message || 'Failed to delete account');
     } finally {
       setIsDeletingAccount(false);
     }
   };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center mb-6">
              {/* Avatar */}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-1">{user.fullName}</h2>
              <p className="text-gray-500 text-sm mb-4">{user.email}</p>
              
              <div className="flex items-center justify-center gap-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  user.isVerified 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {user.isVerified ? '✓ Verified' : '⏳ Pending Verification'}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Cart Items</span>
                <span className="font-semibold text-gray-900">{cartCount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Wishlist</span>
                <span className="font-semibold text-gray-900">{wishlistCount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm">Orders</span>
                <span className="font-semibold text-gray-900">{ordersCount}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600 text-sm">Member Since</span>
                <span className="font-semibold text-gray-900 text-xs">{memberSince}</span>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-fit px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {activeTab === 'overview' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                     {!isEditing && (
                       <button
                         onClick={() => {
                           // Always sync form with the latest user data when entering edit mode
                           setFormData({
                             fullName: user.fullName || '',
                             email: user.email || '',
                             phone: user.phone || '',
                           });
                           setIsEditing(true);
                         }}
                         className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                       >
                         Edit Profile
                       </button>
                     )}
                  </div>

                   {isEditing ? (
                     <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            />
                          </div>
                       </div>
<div className="flex gap-3">
                          <button
                            onClick={handleSaveProfile}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                     </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-gray-800">Email Address</span>
                          <span className="font-medium text-gray-900">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-gray-800">Phone Number</span>
                          <span className="font-medium text-gray-900">{user.phone}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-gray-800">Role</span>
                          <span className="font-medium text-gray-900 capitalize">{user.role}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-gray-800">Verified Status</span>
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-800">Member Since</span>
                          <span className="font-medium text-gray-900">{memberSince}</span>
                        </div>
                      </div>
                    )}
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Order History</h3>
                  
                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                          <div className="flex items-center justify-between mb-4">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : ordersError ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load orders</h3>
                      <p className="text-gray-500 mb-4">Please try again</p>
                      <button
                        onClick={fetchOrders}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
                      <button
                        onClick={() => router.push('/user-dashboard')}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          {/* Order Header */}
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                            <div>
                              <p className="text-sm text-gray-500">Order #{order._id?.slice(-8).toUpperCase()}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                order.orderStatus === 'confirmed' ? 'bg-yellow-100 text-yellow-700' :
                                order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                              </span>
                              <span className="font-bold text-gray-900">
                                ₹{(order.total || 0).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                              {(order.items || []).slice(0, 3).map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden"
                                >
                                  {item.images?.[0] ? (
                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">
                                {(order.items || []).map((item: any) => item.name).join(', ')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                              </p>
                            </div>
                            <button
                              onClick={() => router.push(`/orders/${order._id}`)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View Details
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">My Wishlist ({wishlistItems.length})</h3>
                  
                  {wishlistLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : wishlistItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Wishlist Empty</h3>
                      <p className="text-gray-500 mb-4">Save items you love to your wishlist</p>
                      <button
                        onClick={() => router.push('/user-dashboard')}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Explore Products
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {wishlistItems.map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group"
                        >
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div
                              className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                              onClick={() => router.push(`/product/${item._id}`)}
                            >
                              {item.images && item.images.length > 0 ? (
                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="text-sm font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors mb-1"
                                onClick={() => router.push(`/product/${item._id}`)}
                              >
                                {item.name}
                              </h4>
                              
                              {/* Price */}
                              <div className="flex items-center gap-2 mb-2">
                                {item.offerPrice && item.price > item.offerPrice ? (
                                  <>
                                    <span className="text-sm font-bold text-gray-900">
                                      ₹{item.offerPrice.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-gray-500 line-through">
                                      ₹{item.price.toLocaleString('en-IN')}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm font-bold text-gray-900">
                                    ₹{item.price.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => removeFromWishlist(item._id)}
                                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Saved Addresses</h3>
                  <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Address
                  </button>
                  </div>

                  {addressesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                          <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : addressesError ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load addresses</h3>
                      <p className="text-gray-500 mb-4">Please try again</p>
                      <button
                        onClick={fetchAddresses}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Addresses Saved</h3>
                      <p className="text-gray-500 mb-4">Add a delivery address to speed up checkout</p>
                      <button
                        onClick={() => handleOpenModal()}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address, index) => (
                        <motion.div
                          key={address._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`bg-white border rounded-xl p-6 transition-all hover:shadow-md ${
                            address.isDefault ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                          }`}
                        >
                          {/* Default Badge */}
                          {address.isDefault && (
                            <div className="flex items-center justify-end mb-2">
                              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                                Default
                              </span>
                            </div>
                          )}

                          {/* Address Details */}
                          <div className="text-gray-900">
                            <h4 className="font-semibold text-base mb-2">{address.fullName}</h4>
                            <p className="text-gray-600 mb-1">{address.address}</p>
                            <p className="text-gray-600">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-gray-600 mt-2">Phone: {address.phone}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                              <button
                                onClick={() => handleOpenModal(address)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                             {!address.isDefault && (
                               <button
                                 onClick={() => handleSetDefault(address._id)}
                                 className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                               >
                                 Set as Default
                               </button>
                             )}
                             <button
                               onClick={() => handleDelete(address._id)}
                               className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 ml-auto"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                               </svg>
                               Delete
                             </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Account Settings</h3>
                  
                  <div className="space-y-6">
                     {/* Change Password */}
                     <div className="border-b border-gray-200 pb-6">
                       <h4 className="text-md font-semibold text-gray-900 mb-4">Change Password</h4>
                       
                       {passwordSuccess && (
                         <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                           {passwordSuccess}
                         </div>
                       )}
                       
                       {passwordError && (
                         <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                           {passwordError}
                         </div>
                       )}

                       <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                           <label className="block text-sm font-medium text-gray-900 mb-2">
                             Current Password <span className="text-red-500">*</span>
                           </label>
                           <input
                             type="password"
                             value={passwordData.currentPassword}
                             onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                             placeholder="••••••••"
                             required
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                           />
                         </div>
                         <div></div>
                         
                         <div>
                           <label className="block text-sm font-medium text-gray-900 mb-2">
                             New Password <span className="text-red-500">*</span>
                           </label>
                           <input
                             type="password"
                             value={passwordData.newPassword}
                             onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                             placeholder="••••••••"
                             required
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                           />
                           {/* Password Strength Indicator */}
                           {passwordStrength && passwordData.newPassword && (
                             <div className="mt-2">
                               <div className="flex items-center justify-between mb-1">
                                 <span className="text-xs text-gray-500">Password Strength</span>
                                 <span className={`text-xs font-medium ${
                                   passwordStrength.score <= 2 ? 'text-red-500' :
                                   passwordStrength.score <= 4 ? 'text-yellow-500' : 'text-green-500'
                                 }`}>
                                   {passwordStrength.label}
                                 </span>
                               </div>
                               <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                 <motion.div
                                   initial={{ width: 0 }}
                                   animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                   transition={{ duration: 0.3 }}
                                   className={`h-full rounded-full ${passwordStrength.color}`}
                                 />
                               </div>
                               {passwordStrength.suggestions.length > 0 && (
                                 <div className="mt-2 space-y-1">
                                   {passwordStrength.suggestions.map((suggestion, idx) => (
                                     <p key={idx} className="text-xs text-gray-500 flex items-start gap-1.5">
                                       <span className="text-yellow-500 mt-0.5">•</span>
                                       <span>{suggestion}</span>
                                     </p>
                                   ))}
                                 </div>
                               )}
                             </div>
                           )}
                         </div>
                         
                         <div>
                           <label className="block text-sm font-medium text-gray-900 mb-2">
                             Confirm New Password <span className="text-red-500">*</span>
                           </label>
                           <input
                             type="password"
                             value={passwordData.confirmPassword}
                             onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                             placeholder="••••••••"
                             required
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                           />
                           {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                             <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                           )}
                         </div>
                       </form>
                       
                       <div className="mt-4">
                         <button
                           onClick={handlePasswordChange}
                           disabled={isChangingPassword}
                           className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                         >
                           {isChangingPassword ? (
                             <>
                               <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               Updating...
                             </>
                           ) : (
                             'Update Password'
                           )}
                         </button>
                       </div>
                      </div>

                      {/* Notifications - Disabled for Stage 1 */}
                      {/* <div className="border-b border-gray-200 pb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Notifications</h4>
                        <div className="space-y-4">
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Email notifications</span>
                            <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Order updates</span>
                            <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                          </label>
                          <label className="flex items-center justify-between">
                            <span className="text-gray-700">Promotions & offers</span>
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                          </label>
                        </div>
                      </div> */}

                      {/* Danger Zone */}
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h4 className="text-md font-semibold text-red-700 mb-2">Danger Zone</h4>
                        <p className="text-sm text-red-600 mb-3">Once you delete your account, all your data (addresses, orders, cart, wishlist) will be permanently removed. This action cannot be undone.</p>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 border border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete Account
                        </button>
                       </div>
                   </div>

                   {/* Delete Account Confirmation Modal */}
                   {showDeleteConfirm && (
                     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                       <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                         <div className="flex items-center justify-between mb-4">
                           <h2 className="text-xl font-semibold text-gray-900">Delete Account</h2>
                           <button
                             onClick={() => {
                               setShowDeleteConfirm(false);
                               setDeletePassword('');
                               setPasswordError(null);
                             }}
                             className="text-gray-400 hover:text-gray-600"
                           >
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                           </button>
                         </div>

                         <div className="mb-4">
                           <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                             <p className="text-sm text-red-700">
                               ⚠️ <strong>Warning:</strong> This will permanently delete your account, all your addresses, orders, cart items, and wishlist. This action cannot be undone.
                             </p>
                           </div>

                           <label className="block text-sm font-medium text-gray-900 mb-2">
                             Enter your current password to confirm
                           </label>
                           <input
                             type="password"
                             value={deletePassword}
                             onChange={(e) => {
                               setDeletePassword(e.target.value);
                               if (passwordError) setPasswordError(null);
                             }}
                             placeholder="••••••••"
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                           />
                         </div>

                         {passwordError && (
                           <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                             {passwordError}
                           </div>
                         )}

                         <div className="flex gap-3">
                           <button
                             type="button"
                             onClick={() => {
                               setShowDeleteConfirm(false);
                               setDeletePassword('');
                               setPasswordError(null);
                             }}
                             className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                           >
                             Cancel
                           </button>
                           <button
                             onClick={handleDeleteAccount}
                             disabled={isDeletingAccount}
                             className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                           >
                             {isDeletingAccount ? (
                               <>
                                 <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 Deleting...
                               </>
                             ) : (
                               'Delete Permanently'
                             )}
                           </button>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               )}
             </div>
          </motion.div>
        </div>
      </main>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressFormData.label}
                  onChange={(e) => setAddressFormData({ ...addressFormData, label: e.target.value })}
                  placeholder="Home, Office, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressFormData.fullName}
                  onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={addressFormData.phone}
                  onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                  placeholder="1234567890"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={addressFormData.address}
                  onChange={(e) => setAddressFormData({ ...addressFormData, address: e.target.value })}
                  placeholder="Street address, apartment, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressFormData.state}
                    onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                    placeholder="State"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addressFormData.pincode}
                  onChange={(e) => setAddressFormData({ ...addressFormData, pincode: e.target.value })}
                  placeholder="123456"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressFormData.isDefault}
                  onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-900">
                  Set as default address
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSavingAddress ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

       <Footer />
     </div>
   );
 }

export default UserProfile;
