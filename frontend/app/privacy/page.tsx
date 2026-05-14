import { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - The Power Trainer",
  description: "Privacy Policy for The Power Trainer - Your trusted fitness supplement store",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-500 mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. Introduction
              </h2>
              <p>
                At The Power Trainer, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our fitness supplement store and services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. Information We Collect
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping/billing address</li>
                <li><strong>Account Information:</strong> Username, password, profile details</li>
                <li><strong>Payment Information:</strong> Transaction details, payment method preferences (processed securely)</li>
                <li><strong>Usage Data:</strong> Browsing history, product preferences, device information</li>
                <li><strong>Health Information:</strong> Fitness goals, dietary preferences (optional, user-provided)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send order updates, shipping notifications, and promotional offers</li>
                <li>Improve our products, services, and user experience</li>
                <li>Comply with legal obligations and prevent fraud</li>
                <li>Personalize product recommendations based on your preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Information Sharing & Disclosure
              </h2>
              <p>
                We do not sell your personal information. We may share your data with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Service Providers:</strong> Payment processors, shipping partners, cloud hosting providers</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Data Security
              </h2>
              <p>
                We implement industry-standard security measures including SSL encryption, secure payment gateways, and regular security audits. While we strive to protect your information, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Access and review your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. Cookies & Tracking Technologies
              </h2>
              <p>
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. Third-Party Links
              </h2>
              <p>
                Our website may contain links to third-party sites. We are not responsible for the privacy practices or content of those sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. Children&apos;s Privacy
              </h2>
              <p>
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                10. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy periodically. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                11. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul className="list-none pl-6 space-y-2 mt-2">
                <li><strong>Email:</strong> support@thepowertrainer.com</li>
                <li><strong>Phone:</strong> +91 98765 43210</li>
                <li><strong>Hours:</strong> Mon-Sat, 9AM-6PM</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
