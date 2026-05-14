"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { authApi } from "../../services/authApi";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  offerPrice?: number;
  images: string[];
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shippingCost: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  upiPaymentDetails?: {
    transactionId: string;
    referenceNo: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  delivered: "bg-green-500/20 text-green-700 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-700 border-red-500/30",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  verified: "bg-green-500/20 text-green-700 border-green-500/30",
  failed: "bg-red-500/20 text-red-700 border-red-500/30",
};

export default function OrderDetailPage() {
  return <OrderDetailContent />;
}

function OrderDetailContent() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const orderId = typeof params?.id === 'string' ? params.id : '';
  const isNewOrder = searchParams?.get('success') === 'true';

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user) {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          console.log('Fetching order:', orderId);
          const response = await authApi.getOrderById(orderId);
          console.log('Order response:', response);
          
          if (response.success && response.data && response.data.success !== false) {
            const orderData = response.data.data || response.data;
            console.log('Order data:', orderData);
            setOrder(orderData);
          } else {
            console.log('Failed to fetch order:', response.data?.error || 'Unknown error');
          }
        } catch (err) {
          console.error("Error fetching order:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrder();
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (order?.paymentStatus === 'pending' || order?.orderStatus === 'pending') {
      const interval = setInterval(() => {
        refreshOrder();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [order?.paymentStatus, order?.orderStatus]);

  const refreshOrder = async () => {
    if (!orderId) return;
    setIsRefreshing(true);
    try {
      console.log('Refreshing order:', orderId);
      const response = await authApi.getOrderById(orderId);
      console.log('Refresh response:', response);
      if (response.success && response.data) {
        const orderData = response.data.data || response.data;
        console.log('Refreshed order data:', orderData);
        setOrder(orderData);
      }
    } catch (err) {
      console.error("Error refreshing order:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isNewOrder && orderId) {
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 5000);
    }
  }, [isNewOrder, orderId]);

  const formatPrice = (price?: number): string => {
    if (price === undefined || price === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentStatusMessage = () => {
    if (!order) return '';
    if (order.paymentStatus === 'pending') {
      return 'Your payment is being verified. Please wait while our team verifies your payment.';
    }
    if (order.paymentStatus === 'verified') {
      return 'Your payment has been verified. Your order will be processed shortly.';
    }
    if (order.paymentStatus === 'failed') {
      return 'Payment verification failed. Please contact support.';
    }
    return '';
  };

  const getOrderStatusMessage = () => {
    if (!order) return '';
    switch (order.orderStatus) {
      case 'pending':
        return 'Your order is awaiting confirmation from our team.';
      case 'confirmed':
        return 'Your order has been confirmed and will be shipped soon.';
      case 'shipped':
        return 'Your order has been shipped and is on its way.';
      case 'delivered':
        return 'Your order has been delivered.';
      case 'cancelled':
        return 'This order has been cancelled.';
      default:
        return '';
    }
  };

  if (!isHydrated || isLoading || !orderId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-6">The order you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push("/orders")}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              View All Orders
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      
      <div className="flex-1 w-full px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {orderSuccess && order && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-800">Order Placed Successfully!</h3>
                  <p className="text-sm text-green-700">Order #{order?._id?.slice(-8).toUpperCase() || 'PENDING'}</p>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <button
              onClick={() => router.push("/orders")}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Orders
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500 mt-1">Order #{order?._id?.slice(-8).toUpperCase() || 'PENDING'} - {order?.createdAt ? formatDate(order.createdAt) : ''}</p>
          </motion.div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Payment Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h2>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${paymentStatusColors[order?.paymentStatus] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}`}>
                  {order?.paymentStatus?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{getPaymentStatusMessage()}</p>
              {order?.paymentMethod === 'upi' && order?.upiPaymentDetails && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Payment Details</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      <span className="font-medium">Transaction ID:</span> {order?.upiPaymentDetails?.transactionId}
                    </p>
                    {order?.upiPaymentDetails?.referenceNo && (
                      <p className="text-gray-600">
                        <span className="font-medium">Reference No:</span> {order.upiPaymentDetails.referenceNo}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
                <button
                  onClick={refreshOrder}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[order?.orderStatus] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}`}>
                  {order?.orderStatus?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{getOrderStatusMessage()}</p>
            </motion.div>
          </div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order?.items?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  {item.images && item.images[0] && (
                    <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice((item.offerPrice || item.price) * item.quantity)}
                    </p>
                    {item.offerPrice && item.price > item.offerPrice && (
                      <p className="text-xs text-gray-500 line-through">{formatPrice(item.price * item.quantity)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatPrice(order?.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {order?.shippingCost! > 0 ? formatPrice(order?.shippingCost) : 'Free'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900 text-xl">{formatPrice(order?.total)}</span>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">{order?.shippingAddress?.fullName}</p>
              <p>{order?.shippingAddress?.address}</p>
              <p>{order?.shippingAddress?.city}, {order?.shippingAddress?.state} - {order?.shippingAddress?.pincode}</p>
              <p className="mt-1">Phone: {order?.shippingAddress?.phone}</p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
