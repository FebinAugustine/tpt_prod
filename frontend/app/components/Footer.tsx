"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

export default function Footer() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    about: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
    help: [
      { label: "Payments", href: "/help/payments" },
      { label: "Shipping", href: "/help/shipping" },
      { label: "Cancellation", href: "/help/cancellation" },
      { label: "Returns", href: "/help/returns" },
      { label: "FAQ", href: "/help/faq" },
    ],
    social: [
      { label: "Facebook", href: "https://facebook.com" },
      { label: "Twitter", href: "https://twitter.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "YouTube", href: "https://youtube.com" },
    ],
    account: [
      { label: "My Account", href: "/profile" },
      { label: "My Orders", href: "/orders" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Shopping Cart", href: "/cart" },
    ],
  };

  return (
    <footer className="mt-auto bg-gray-900 text-gray-300 w-full">
      {/* Top Footer - Links Section */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {/* About Column */}
            <div className="col-span-1">
              <h3 className="text-white font-semibold mb-4 text-sm">About</h3>
              <ul className="space-y-2">
                {footerLinks.about.map((link, index) => (
                  <li key={index}>
                    <button
                      onClick={() => router.push(link.href)}
                      className="text-gray-400 hover:text-white text-xs transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Column */}
            <div className="col-span-1">
              <h3 className="text-white font-semibold mb-4 text-sm">Help</h3>
              <ul className="space-y-2">
                {footerLinks.help.map((link, index) => (
                  <li key={index}>
                    <button
                      onClick={() => router.push(link.href)}
                      className="text-gray-400 hover:text-white text-xs transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Column */}
            <div className="col-span-1">
              <h3 className="text-white font-semibold mb-4 text-sm">Social</h3>
              <ul className="space-y-2">
                {footerLinks.social.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white text-xs transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account Column */}
            <div className="col-span-1">
              <h3 className="text-white font-semibold mb-4 text-sm">
                {isAuthenticated ? "My Account" : "Account"}
              </h3>
              <ul className="space-y-2">
                {isAuthenticated ? (
                  <>
                    <li>
                      <button
                        onClick={() => router.push("/profile")}
                        className="text-gray-400 hover:text-white text-xs transition-colors"
                      >
                        My Profile
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => router.push("/orders")}
                        className="text-gray-400 hover:text-white text-xs transition-colors"
                      >
                        My Orders
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => router.push("/wishlist")}
                        className="text-gray-400 hover:text-white text-xs transition-colors"
                      >
                        Wishlist
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => router.push("/cart")}
                        className="text-gray-400 hover:text-white text-xs transition-colors"
                      >
                        Shopping Cart
                      </button>
                    </li>
                  </>
                ) : (
                  <li>
                    <button
                      onClick={() => router.push("/login")}
                      className="text-gray-400 hover:text-white text-xs transition-colors"
                    >
                      Sign In
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <h3 className="text-white font-semibold mb-4 text-sm">Contact Us</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p>Email: supporttpt@gmail.com</p>
                <p>Phone: +91 9447540035</p>
                <p>Hours: Mon-Sat, 9AM-6PM</p>
              </div>
              {/* Social Icons */}
              <div className="flex gap-3 mt-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77,7.46H14.5v-1.9c0-.9.6-1.1,1-1.1h3V.5h-4.33C10.24.5,9.5,3.44,9.5,5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4Z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.32,6.44a.5.5,0,0,0-.2-.35l-.79-.62a.51.51,0,0,0-.36-.08,8.43,8.43,0,0,0-4.88-1.83,8.28,8.28,0,0,0-4.27,1.47,8.42,8.42,0,0,0-2.9,3.83,8.27,8.27,0,0,0,.12,4.17.5.5,0,0,0,.31.44l.79.54a.5.5,0,0,0,.4,0,10.94,10.94,0,0,1,5.23-1.93A10.85,10.85,0,0,1,15.2,12.2a.5.5,0,0,0-.18.68l-.23.73a.5.5,0,0,0,.42.66,6.68,6.68,0,0,0,3.8-1.3A6.64,6.64,0,0,1,22.26,15a.5.5,0,0,0,.3.76l.8.47a.5.5,0,0,0,.36,0l1.95-1.88a.51.51,0,0,0-.16-.88Z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,2.16c3.2,0,3.58,0,4.85.07,3.25.15,4.77,1.69,4.92,4.92.06,1.27.07,1.65.07,4.85s0,3.58-.07,4.85c-.15,3.23-1.66,4.77-4.92,4.92-1.27.06-1.65.07-4.85.07s-3.58,0-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s0-3.58.07-4.85C2.38,3.92,3.9,2.38,7.15,2.23,8.42,2.18,8.8,2.16,12,2.16ZM12,0C8.74,0,8.33,0,7.05.07c-4.35.2-6.78,2.71-7,7C0,8.33,0,8.74,0,12s0,3.67.07,4.95c.2,4.36,2.71,6.78,7,7C8.33,24,8.74,24,12,24s3.67,0,4.95-.07c4.35-.2,6.78-2.71,7-7C24,15.67,24,15.26,24,12s0-3.67-.07-4.95c-.2-4.35-2.71-6.78-7-7C15.67,0,15.26,0,12,0Zm0,5.84A6.16,6.16,0,1,0,18.16,12,6.16,6.16,0,0,0,12,5.84ZM12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16ZM18.41,4.15a1.44,1.44,0,1,0,1.44,1.44A1.44,1.44,0,0,0,18.41,4.15Z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.69,6.19a2.85,2.85,0,0,0-2-2.06,10.66,10.66,0,0,0-4.9-1.15c-4.59-.33-9.15-.33-13.73,0A10.66,10.66,0,0,0,2.23,4.13,2.85,2.85,0,0,0,.21,6.19,29.87,29.87,0,0,0,0,12a29.87,29.87,0,0,0,.21,5.81,2.85,2.85,0,0,0,2,2.06,10.66,10.66,0,0,0,4.9,1.15c4.59.33,9.15.33,13.73,0a10.66,10.66,0,0,0,4.9-1.15,2.85,2.85,0,0,0,2-2.06A29.87,29.87,0,0,0,24,12,29.87,29.87,0,0,0,23.69,6.19ZM9.55,15.57V8.43L15.82,12Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Footer - Bottom Bar */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-white font-semibold text-lg">The Power Trainer</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <span className="text-gray-600">|</span>
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Use
              </a>
              <span className="text-gray-600">|</span>
              <a href="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                Sitemap
              </a>
            </div>

            {/* Copyright */}
            <div className="text-xs text-gray-500">
              © {currentYear} The Power Trainer. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav (visible only on mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => router.push("/user-dashboard")}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => router.push("/all-categories")}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-xs mt-1">Categories</span>
          </button>
          <button
            onClick={() => router.push("/cart")}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs mt-1">Cart</span>
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-red-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">Account</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
