"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authApi } from "../services/authApi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
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

export default function OrdersPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authApi.getOrders();
        if (response.success && response.data) {
          const ordersData = response.data.orders || response.data;
          if (Array.isArray(ordersData)) {
            setOrders(ordersData);
          }
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      
      <div className="flex-1 w-full px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 mt-1">
              {orders.length === 0 
                ? "No orders yet" 
                : `${orders.length} order${orders.length === 1 ? '' : 's'}`}
            </p>
          </motion.div>

          {orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
              <button
                onClick={() => router.push("/user-dashboard")}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Products
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusColors[order.orderStatus] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}`}>
                            {order.orderStatus}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${paymentStatusColors[order.paymentStatus] || 'bg-gray-500/20 text-gray-700 border-gray-500/30'}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{formatPrice(order.total)}</p>
                        <p className="text-gray-500 text-sm capitalize">{order.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Items ({order.items?.length})</p>
                      <div className="flex flex-wrap gap-3">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                            {item.images && item.images[0] && (
                              <img src={item.images[0]} alt={item.name} className="w-12 h-12 object-cover rounded" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[150px]">{item.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg text-sm text-gray-500">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Info for UPI */}
                    {order.paymentMethod === 'upi' && order.upiPaymentDetails && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        order.paymentStatus === 'pending' 
                          ? 'bg-yellow-50 border border-yellow-200' 
                          : order.paymentStatus === 'verified'
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        {order.paymentStatus === 'pending' ? (
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">Payment Pending Verification:</span> Our team is verifying your payment. 
                            Transaction ID: {order.upiPaymentDetails.transactionId}
                          </p>
                        ) : order.paymentStatus === 'verified' ? (
                          <p className="text-sm text-green-800">
                            <span className="font-medium">Payment Verified!</span> Your payment has been confirmed.
                          </p>
                        ) : (
                          <p className="text-sm text-red-800">
                            <span className="font-medium">Payment Failed:</span> Please contact support.
                          </p>
                        )}
                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => router.push(`/orders/${order._id}`)}
                      className="mt-4 w-full py-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      View Order Details
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