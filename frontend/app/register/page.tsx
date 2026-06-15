"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  validateRegisterForm,
  checkPasswordStrength,
  ValidationError,
  PasswordStrength,
} from "../utils/validation";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Register() {
  const router = useRouter();
  const { register, isLoading, error, clearError, isAuthenticated, isHydrated, user } = useAuthStore();

  // All useState hooks MUST be called before any conditional returns
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle authenticated user redirect in useEffect to avoid render cycle issues
  useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push("/admin-dashboard");
      } else if (user.isVerified) {
        router.push("/user-dashboard");
      } else {
        router.push("/not-verified");
      }
    }
  }, [isHydrated, isAuthenticated, user, router]);

  // Don't render the form if authenticated (will be handled by useEffect redirect)
  if (isAuthenticated && user) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for the field being edited
    setErrors((prev) => prev.filter((err) => err.field !== name));

    // Check password strength when password field changes
    if (name === "password") {
      setPasswordStrength(value ? checkPasswordStrength(value) : null);
    }
    
    // Clear global error
    if (error) {
      clearError();
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateRegisterForm(
      formData.fullName,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.phone
    );

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Form is valid - handle registration logic here
    const success = await register(formData.fullName, formData.email, formData.password, formData.phone);

    if (success) {
      // Redirect to login or dashboard
      router.push("/login");
    }
  };

  const getFieldError = (fieldName: string): string | null => {
    const error = errors.find((err) => err.field === fieldName);
    return error ? error.message : null;
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {!imageError ? (
          <Image
            src="/homebg.png"
            alt="Protein App Hero"
            fill
            className="object-cover object-center"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-blue-900 via-purple-900 to-black" />
        )}
        <div className="absolute inset-0 bg-linear-to-br from-black/70 via-black/50 to-black/80" />
      </div>

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6 mt-10 mb-10"
      >
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Create Account
            </h1>
            <p className="text-gray-200">Join Protein App to start your fitness journey</p>
          </motion.div>

          {/* Registration Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Full Name Input */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-medium text-white">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  getFieldError("fullName")
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/20 focus:border-blue-500"
                }`}
              />
              {getFieldError("fullName") && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="text-lg">⚠️</span>
                  {getFieldError("fullName")}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  getFieldError("email")
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/20 focus:border-blue-500"
                }`}
              />
              {getFieldError("email") && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="text-lg">⚠️</span>
                  {getFieldError("email")}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 ${
                    getFieldError("password")
                      ? "border-red-500 focus:border-red-500"
                      : "border-white/20 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L19.656 19.656M9.878 9.878L19.656 3M3 19.656L9.878 12.778"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {getFieldError("password") && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="text-lg">⚠️</span>
                  {getFieldError("password")}
                </p>
              )}

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Password Strength</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-400' :
                      passwordStrength.score <= 4 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className={`h-full rounded-full ${passwordStrength.color}`}
                    />
                  </div>
                  {passwordStrength.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {passwordStrength.suggestions.map((suggestion, index) => (
                        <p key={index} className="text-xs text-gray-300 flex items-center gap-1">
                          <span className="text-yellow-400">•</span>
                          {suggestion}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12 ${
                    getFieldError("confirmPassword")
                      ? "border-red-500 focus:border-red-500"
                      : "border-white/20 focus:border-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L19.656 19.656M9.878 9.878L19.656 3M3 19.656L9.878 12.778"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
{getFieldError("confirmPassword") && (
                 <p className="text-sm text-red-400 flex items-center gap-1">
                   <span className="text-lg">⚠️</span>
                   {getFieldError("confirmPassword")}
                 </p>
               )}
              </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-white">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1234567890"
                className={`w-full px-4 py-3 rounded-xl bg-white/10 border backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  getFieldError("phone")
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/20 focus:border-blue-500"
                }`}
              />
              {getFieldError("phone") && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="text-lg">⚠️</span>
                  {getFieldError("phone")}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            {/* Register Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full px-6 py-4 font-semibold text-white transition-all duration-300 bg-linear-to-r from-blue-600 to-blue-700 rounded-2xl hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </motion.button>
          </motion.form>

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 text-center"
          >
            <p className="text-gray-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Animated Background Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
      />
      </div>
      <Footer />
    </>
  );
}
