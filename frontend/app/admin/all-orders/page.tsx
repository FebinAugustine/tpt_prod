"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../../components/AdminNavbar";
import { authApi } from "../../services/authApi";
import { motion } from "framer-motion";

interface Order {
  _id: string;
  user: { fullName: string; email: string };
  items: { name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  upiPaymentDetails?: {
    transactionId: string;
    referenceNo: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  verified: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
};

function AllOrdersPageContent() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !isClient) return;
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push("/login");
    }
  }, [isHydrated, isClient, isAuthenticated, user, router]);

  if (!isHydrated || !isClient) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  return <OrdersContent />;
}

function OrdersContent() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: ordersResponse, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['orders', page, limit, searchQuery, statusFilter],
    queryFn: async () => {
      const response = await authApi.getOrders(page, limit, searchQuery, statusFilter);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch orders');
      }
      return response.data;
    },
    staleTime: 1000 * 30,
  });

  const orders = ordersResponse?.orders || [];
  const total = ordersResponse?.total || 0;
  const totalPages = ordersResponse?.totalPages || 1;

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await authApi.updateOrderStatus(orderId, status);
      if (!response.success) throw new Error(response.error || 'Failed to update');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrder(null);
      setUpdating(null);
    },
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await authApi.updatePaymentStatus(orderId, status);
      if (!response.success) throw new Error(response.error || 'Failed to update');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrder(null);
      setUpdating(null);
    },
  });

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    setUpdating(orderId);
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const handleUpdatePaymentStatus = (orderId: string, status: string) => {
    setUpdating(orderId);
    updatePaymentStatusMutation.mutate({ orderId, status });
  };

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">All Orders</h1>

        {/* Search and Status Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-3 w-full">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <input
                type="text"
                placeholder="Search by order ID or user email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="" className="bg-gray-900">All Status</option>
              <option value="pending" className="bg-gray-900">Pending</option>
              <option value="confirmed" className="bg-gray-900">Confirmed</option>
              <option value="shipped" className="bg-gray-900">Shipped</option>
              <option value="delivered" className="bg-gray-900">Delivered</option>
              <option value="cancelled" className="bg-gray-900">Cancelled</option>
            </select>
          </div>
          <div className="text-gray-400 text-sm">
            Showing {orders.length} of {total} orders
          </div>
        </div>

        {/* Loading indicator */}
        {isFetching && !isLoading && (
          <div className="flex justify-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-400"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8">
            <h3 className="text-red-400 font-semibold mb-2">Error Loading Orders</h3>
            <p className="text-red-300 text-sm">{error.message}</p>
          </div>
        )}

        {orders.length === 0 && !isLoading ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
            <p className="text-gray-400 text-lg">
              {search || statusFilter ? 'No orders match your search criteria' : 'No orders yet'}
            </p>
            {(search || statusFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                }}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Order, index: number) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">Order #{order._id.slice(-8)}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusColors[order.orderStatus] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${paymentStatusColors[order.paymentStatus] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    {order.paymentMethod === 'upi' && order.upiPaymentDetails?.transactionId && (
                      <p className="text-gray-400 text-sm">TXN: {order.upiPaymentDetails.transactionId}</p>
                    )}
                    <p className="text-gray-400 text-sm">{order.user?.fullName} ({order.user?.email})</p>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{formatPrice(order.total)}</p>
                    <p className="text-gray-400 text-sm capitalize">{order.paymentMethod}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-400 text-sm mb-2">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items?.map((item, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Manage Order
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 py-2 rounded-lg font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-red-600 text-white'
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Order Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-lg font-semibold text-white">
                Order #{selectedOrder._id.slice(-8)}
              </h3>
              <p className="text-gray-400 text-sm">{selectedOrder.user?.fullName} - {selectedOrder.user?.email}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Order Status</label>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                  disabled={updating === selectedOrder._id}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Status</label>
                <select
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleUpdatePaymentStatus(selectedOrder._id, e.target.value)}
                  disabled={updating === selectedOrder._id}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Order Items</label>
                <div className="bg-white/5 rounded-lg p-3 space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.name} x {item.quantity}</span>
                      <span className="text-white">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-white">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.paymentMethod === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">UPI Payment Details</label>
                  <div className="bg-white/5 rounded-lg p-3 text-sm space-y-1">
                    <p className="text-gray-300">Transaction ID: {selectedOrder.upiPaymentDetails?.transactionId || 'N/A'}</p>
                    <p className="text-gray-300">Reference No: {selectedOrder.upiPaymentDetails?.referenceNo || 'N/A'}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Shipping Address</label>
                <div className="bg-white/5 rounded-lg p-3 text-sm">
                  <p className="text-gray-300">{selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-gray-300">{selectedOrder.shippingAddress?.address}</p>
                  <p className="text-gray-300">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  <p className="text-gray-300">Phone: {selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/20">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AllOrdersPage() {
  return <AllOrdersPageContent />;
}