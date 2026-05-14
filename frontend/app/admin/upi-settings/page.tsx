"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { useRouter } from "next/navigation";
import AdminNavbar from "../../components/AdminNavbar";
import { authApi } from "../../services/authApi";

export default function UpiSettingsPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [upiId, setUpiId] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [existingSettings, setExistingSettings] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated || !user || user.role !== 'admin') {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchUpiSettings = async () => {
      setIsLoading(true);
      try {
        const response = await authApi.getUpiSettings();
        console.log('UPI Settings response:', response);
        console.log('response.data:', response.data);
        console.log('response.data.upiId:', response.data?.data?.upiId);
        
        const settingsData = response.data?.data || response.data;
        console.log('settingsData:', settingsData);
        
        if (settingsData && settingsData.upiId) {
          setUpiId(settingsData.upiId || "");
          setMerchantName(settingsData.merchantName || "");
          setQrCodeUrl(settingsData.qrCodeUrl || "");
          setImagePreview(settingsData.qrCodeUrl || null);
          setExistingSettings(true);
          console.log('Existing settings: true');
        }
      } catch (err) {
        console.error("Error fetching UPI settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUpiSettings();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setQrCodeImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setQrCodeImage(null);
    setQrCodeUrl("");
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authApi.setUpiSettings(
        {
          upiId,
          merchantName,
          qrCodeUrl: qrCodeUrl || undefined,
        },
        qrCodeImage || undefined
      );

      if (response.success) {
        setSuccess("UPI settings saved successfully!");
        setTimeout(() => setSuccess(null), 3000);
        setQrCodeImage(null);
      } else {
        setError(response.error || "Failed to save UPI settings");
      }
    } catch {
      setError("An error occurred while saving UPI settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <h1 className="text-2xl font-bold text-white mb-2">
                {existingSettings ? "Edit UPI Payment Settings" : "UPI Payment Settings"}
              </h1>
              <p className="text-gray-300 mb-6">
                {existingSettings 
                  ? "Update your UPI payment details for customer orders" 
                  : "Configure UPI payment details for customer orders"}
              </p>

            {success && (
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  UPI ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="example@upi"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Merchant Name
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="Your Company Name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  QR Code Image
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="QR Code Preview" 
                        className="w-48 h-48 object-contain mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="qr-code-upload"
                      />
                      <label
                        htmlFor="qr-code-upload"
                        className="cursor-pointer"
                      >
                        <div className="text-gray-400">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">Click to upload QR Code image</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Or enter QR Code URL
                </label>
                <input
                  type="url"
                  value={qrCodeUrl}
                  onChange={(e) => setQrCodeUrl(e.target.value)}
                  placeholder="https://example.com/qr-code.png"
                  disabled={!!imagePreview}
                  className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${imagePreview ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || !upiId}
                className="w-full mt-6 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                {isSaving ? "Saving..." : existingSettings ? "Update UPI Settings" : "Save UPI Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}