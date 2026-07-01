import { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Sitemap - The Power Trainer",
  description: "Complete sitemap of The Power Trainer - Browse all our pages and sections",
};

const sitemapItems = [
  {
    title: "Home & Account",
    links: [
      { label: "Home", href: "/" },
      { label: "Login", href: "/login" },
      { label: "Register", href: "/register" },
      { label: "Forgot Password", href: "/forgot-password" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/admin/all-products" },
      { label: "Categories", href: "/all-categories" },
      { label: "Cart", href: "/cart" },
      { label: "Checkout", href: "/checkout" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "User Dashboard",
    links: [
      { label: "My Dashboard", href: "/user-dashboard" },
      { label: "My Orders", href: "/orders" },
      { label: "My Addresses", href: "/addresses" },
      { label: "My Profile", href: "/profile" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Payments", href: "/help/payments" },
      { label: "Shipping", href: "/help/shipping" },
      { label: "Cancellation", href: "/help/cancellation" },
      { label: "Returns", href: "/help/returns" },
      { label: "FAQ", href: "/help/faq" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/#contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sitemap
          </h1>
          <p className="text-gray-500 mb-8">
            Browse all pages and sections of The Power Trainer
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {sitemapItems.map((category) => (
              <div key={category.title} className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  {category.title}
                </h2>
                <ul className="space-y-2">
                  {category.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-gray-600 hover:text-blue-600 hover:underline transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Need Help?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Can&apos;t find what you&apos;re looking for? Contact our support team.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <a
                href="mailto:supporttpt@gmail.com"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Email Support
              </a>
              <a
                href="tel:+919544946511"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Call Us
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
