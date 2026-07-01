"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";
import { authApi } from "../services/authApi";

const PAGE_DELAY = 10000;
const FOREGROUND_MAX_RETRIES = 3;
const INITIAL_DELAY = 3000;
const MAX_DELAY = 60000;

export default function NotVerified() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const isBackgroundRef = useRef(false);
  const retriesRef = useRef(0);
  const cancelledRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getDelay = (attempt: number) => Math.min(INITIAL_DELAY * Math.pow(1.5, attempt), MAX_DELAY);

  const scheduleNext = (delay: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(checkVerification, delay);
  };

  const checkVerification = async () => {
    if (cancelledRef.current) return;

    try {
      const response = await authApi.getProfile();

      if (response.success && response.data) {
        useAuthStore.setState({ user: response.data });

        if (response.data.isVerified) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setIsChecking(false);
          if (response.data.role === "admin") {
            router.push("/admin-dashboard");
          } else {
            router.push("/user-dashboard");
          }
          return;
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    }

    if (isBackgroundRef.current) {
      scheduleNext(30000);
    } else if (retriesRef.current < FOREGROUND_MAX_RETRIES) {
      retriesRef.current += 1;
      scheduleNext(getDelay(retriesRef.current));
    } else {
      isBackgroundRef.current = true;
      scheduleNext(30000);
    }
  };

  useEffect(() => {
    cancelledRef.current = false;

    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const user = useAuthStore.getState().user;
    if (user?.isVerified) {
      if (user.role === "admin") {
        router.push("/admin-dashboard");
      } else {
        router.push("/user-dashboard");
      }
      return;
    }

    setIsChecking(true);
    isBackgroundRef.current = false;
    retriesRef.current = 0;

    scheduleNext(100);

    const pageTimeout = setTimeout(() => {
      if (!cancelledRef.current) {
        setIsChecking(false);
      }
    }, PAGE_DELAY);

    return () => {
      cancelledRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pageTimeout) clearTimeout(pageTimeout);
    };
  }, [isHydrated, isAuthenticated, router]);

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
        <p className="text-gray-700 dark:text-white">If your account is not approved within a few days, please contact support.</p>
      </div>
    </div>
  );
}
