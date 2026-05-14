"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { validateEmail, ValidationError } from "../utils/validation";
import { authApi } from "../services/authApi";
import { useAuthStore } from "../store/authStore";

export default function ForgotPassword() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  // Show a loading state while the store is being hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      router.push("/admin-dashboard");
    } else if (user.isVerified) {
      router.push("/user-dashboard");
    } else {
      router.push("/not-verified");
    }
    return null;
  }
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const validationErrors: ValidationError[] = [];
    const emailError = validateEmail(email);
    if (emailError) validationErrors.push(emailError);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authApi.forgotPassword(email);
      
      if (response.success) {
        setSuccess("Password reset email sent successfully! Please check your email inbox (including spam folder) for the reset link.");
        setEmail("");
      } else {
        setError(response.error || "Failed to send reset link");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.length > 0) {
      setErrors([]);
    }
    if (error) {
      setError(null);
    }
    if (success) {
      setSuccess(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-900 via-purple-900 to-black"> 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 w-full max-w-md"
        >
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                    Forgot Password
                </h1>
                <p className="text-gray-200">Enter your email to reset your password</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                        Email Address
                    </label>    
                    <input 
                      type="email" 
                      id="email" 
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full px-4 py-3 mt-1 bg-white/20 border ${errors.length > 0 ? 'border-red-500' : 'border-white/30'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="john@example.com"
                    />
                    {errors.map((err) => (
                      <p key={err.field} className="text-sm text-red-400 mt-1">
                        ⚠️ {err.message}
                      </p>
                    ))}
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      {error}
                    </p>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl">
                    <p className="text-sm text-green-400 flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      {success}
                    </p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full px-4 py-3 font-semibold text-white transition-all duration-300 bg-linear-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
            </form>
        </motion.div>
    </div>
  )
}