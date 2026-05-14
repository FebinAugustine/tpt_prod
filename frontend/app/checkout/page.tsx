"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authApi } from "../services/authApi";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface SavedAddress {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface UpiSettings {
  upiId: string;
  qrCodeUrl: string;
  merchantName: string;
}

export default function CheckoutPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'razorpay'>('upi');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.fullName || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [upiSettings, setUpiSettings] = useState<UpiSettings | null>(null);
  const [upiDetails, setUpiDetails] = useState({
    transactionId: '',
    referenceNo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpiLoading, setIsUpiLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const totalPrice = getTotalPrice();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    if (isHydrated && (!isAuthenticated || !user)) {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const upiResponse = await authApi.getUpiSettings();
        
        if (upiResponse.success && upiResponse.data) {
          const upiData = upiResponse.data.upiId ? upiResponse.data : upiResponse.data.data;
          setUpiSettings({
            upiId: upiData?.upiId || '',
            qrCodeUrl: upiData?.qrCodeUrl || '',
            merchantName: upiData?.merchantName || ''
          });
        }

        const addressesResponse = await authApi.getAddresses();

        if (addressesResponse.success && addressesResponse.data) {
          setAddresses(addressesResponse.data);
          const defaultAddr = addressesResponse.data.find((a: SavedAddress) => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id);
            setShippingAddress({
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              address: defaultAddr.address,
              city: defaultAddr.city,
              state: defaultAddr.state,
              pincode: defaultAddr.pincode,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsUpiLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address._id);
    setShippingAddress({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setShowAddressForm(false);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          offerPrice: item.offerPrice,
          images: item.images,
        })),
        shippingAddress,
        subtotal: totalPrice,
        shippingCost: 0,
        total: totalPrice,
        paymentMethod,
        ...(paymentMethod === 'upi' && {
          upiPaymentDetails: {
            transactionId: upiDetails.transactionId,
            referenceNo: upiDetails.referenceNo || '',
          },
        }),
      };

      const response = await authApi.createOrder(orderData);
      
      if (response.success && response.data) {
        clearCart();
        router.push(`/orders/${response.data._id}?success=true`);
      } else {
        toast.error(response.error || 'Failed to place order');
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [isHydrated, items.length, router]);

  if (!isHydrated || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const canProceedFromShipping = showAddressForm 
    ? (shippingAddress.fullName && shippingAddress.phone && shippingAddress.address && shippingAddress.city && shippingAddress.state && shippingAddress.pincode)
    : selectedAddressId;

  const canPlaceOrder = true;

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-500 mt-1">Complete your order</p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className={`ml-2 ${step >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>Shipping</span>
            </div>
            <div className="w-16 h-1 bg-gray-200 mx-4">
              <div className={`h-full bg-red-600 transition-all ${step === 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step === 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className={`ml-2 ${step === 2 ? 'text-gray-900' : 'text-gray-500'}`}>Payment</span>
            </div>
          </div>

          {step === 1 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                <button
                  onClick={() => {
                    setShowAddressForm(!showAddressForm);
                    setSelectedAddressId(null);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  {showAddressForm ? 'Select Saved Address' : 'Enter New Address'}
                </button>
              </div>

              {!showAddressForm && addresses.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === addr._id
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr._id}
                        checked={selectedAddressId === addr._id}
                        onChange={() => handleSelectAddress(addr)}
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{addr.fullName}</p>
                        <p className="text-sm text-gray-600">{addr.address}</p>
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-xs text-gray-500 mt-1">📞 {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : showAddressForm || addresses.length === 0 ? (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      required
                      rows={3}
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!canProceedFromShipping}
                  >
                    Continue to Payment
                  </button>
                </form>
              ) : null}

              {(!showAddressForm && addresses.length > 0) && (
                <button
                  onClick={handleAddressSubmit}
                  disabled={!selectedAddressId}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              )}

              {addresses.length === 0 && !showAddressForm && (
                <button
                  onClick={() => {
                    setShowAddressForm(true);
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Add Shipping Address
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Order Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 border-b border-gray-200 pb-4">
                  {items.map((item) => (
                    <div key={item._id} className="flex justify-between">
                      <span className="text-gray-600">{item.name} x {item.quantity}</span>
                      <span className="text-gray-900 font-medium">
                        {formatPrice((item.offerPrice || item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-gray-900 font-semibold">Total</span>
                  <span className="text-gray-900 font-bold text-xl">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                  <button onClick={() => setStep(1)} className="text-red-600 text-sm hover:underline">Edit</button>
                </div>
                <p className="text-gray-600">{shippingAddress.fullName}</p>
                <p className="text-gray-600">{shippingAddress.address}</p>
                <p className="text-gray-600">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                <p className="text-gray-600">{shippingAddress.phone}</p>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
                
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4">
                      {paymentMethod === 'upi' && <div className="w-3 h-3 rounded-full bg-red-600"></div>}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">UPI QR Code</p>
                      <p className="text-sm text-gray-500">Scan QR and pay via any UPI app</p>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 mr-4">
                      {paymentMethod === 'razorpay' && <div className="w-3 h-3 rounded-full bg-red-600"></div>}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Razorpay</p>
                      <p className="text-sm text-gray-500">Pay securely via Razorpay (Coming Soon)</p>
                    </div>
                  </label>
                </div>

                {/* UPI Payment Section */}
                {paymentMethod === 'upi' && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    {upiSettings?.upiId ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Scan QR Code to Pay</p>
                          <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                            {upiSettings.qrCodeUrl ? (
                              <img src={upiSettings.qrCodeUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                            ) : (
                              <div className="text-center p-4">
                                <p className="text-xs text-gray-500">UPI ID: {upiSettings.upiId}</p>
                              </div>
                            )}
                          </div>
                          {upiSettings.merchantName && (
                            <p className="text-sm font-medium text-gray-700 mt-2">{upiSettings.merchantName}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">Pay amount: {formatPrice(totalPrice)}</p>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-3">Enter Payment Details After Payment</p>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Transaction ID / UPI Ref No. <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                required
                                value={upiDetails.transactionId}
                                onChange={(e) => setUpiDetails({ ...upiDetails, transactionId: e.target.value })}
                                placeholder="Enter transaction ID from your UPI app"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Reference No. (Optional)</label>
                              <input
                                type="text"
                                value={upiDetails.referenceNo}
                                onChange={(e) => setUpiDetails({ ...upiDetails, referenceNo: e.target.value })}
                                placeholder="Any reference note"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-gray-900"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-2">
                          <p className="text-gray-500 text-sm">Please transfer {formatPrice(totalPrice)} to the merchant UPI ID and enter transaction details below.</p>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-3">Enter Payment Details</p>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Transaction ID / UPI Ref No. <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                required
                                value={upiDetails.transactionId}
                                onChange={(e) => setUpiDetails({ ...upiDetails, transactionId: e.target.value })}
                                placeholder="Enter transaction ID from your UPI app"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Reference No. (Optional)</label>
                              <input
                                type="text"
                                value={upiDetails.referenceNo}
                                onChange={(e) => setUpiDetails({ ...upiDetails, referenceNo: e.target.value })}
                                placeholder="Any reference note"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-gray-900"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading || !canPlaceOrder}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Order...
                  </span>
                ) : (
                  <span>Place Order ({formatPrice(totalPrice)})</span>
                )}
              </button>

              <button
                onClick={() => setStep(1)}
                className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                ← Back to Shipping
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}