"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import { authApi } from "../services/authApi";

// Not verified page
export default function NotVerified() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log('NotVerified page - Auth state:', { user, isAuthenticated, isHydrated });
    
    const checkVerificationStatus = async () => {
      if (user && isAuthenticated) {
        // First check local user data
        if (user.isVerified) {
          console.log('User is verified (local), redirecting...');
          setIsChecking(false);
          if (user.role === 'admin') {
            router.push("/admin-dashboard");
          } else {
            router.push("/user-dashboard");
          }
          return;
        }

        // If local data says not verified, fetch latest data from server
        console.log('Checking verification status from server...');
        try {
          const response = await authApi.getProfile();
          
          if (response.success && response.data) {
            console.log('Server returned user data:', response.data);
            
            // Update store with latest data
            useAuthStore.setState({ user: response.data });
            
            // Check if verified now
            if (response.data.isVerified) {
              console.log('User is verified (server), redirecting...');
              setIsChecking(false);
              if (response.data.role === 'admin') {
                router.push("/admin-dashboard");
              } else {
                router.push("/user-dashboard");
              }
            } else {
              console.log('User still not verified');
              setIsChecking(false);
            }
          } else {
            console.error('Failed to fetch user profile:', response.error);
            setIsChecking(false);
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
          setIsChecking(false);
        }
      } else {
        // If not authenticated, redirect to login
        if (isHydrated) {
          router.push("/login");
        }
      }
    };

    // Wait for hydration before checking
    if (isHydrated) {
      checkVerificationStatus();
    }
  }, [user, isAuthenticated, isHydrated, router]);

  // Show loading while checking auth state
  if (!isHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-700">Checking verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white p-8 rounded shadow-md text-center dark:bg-gray-800 dark:text-white">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Account Not Verified</h1> 
        <p className="text-gray-700 mb-6 dark:text-white">Please wait for the admin to approve your account.</p>
        <p className="text-gray-700 dark:text-white">If your account is not approved within a few days, please contact support .</p>
      </div>
    </div>
  );
}