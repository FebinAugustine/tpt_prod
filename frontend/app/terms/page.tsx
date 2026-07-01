import { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Terms of Use - The Power Trainer",
  description: "Terms and Conditions for The Power Trainer - Your trusted fitness supplement store",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Terms of Use
          </h1>
          <p className="text-gray-500 mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using The Power Trainer website and services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. Use License
              </h2>
              <p>
                Permission is granted to temporarily use The Power Trainer&apos;s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or public display</li>
                <li>Transfer the materials to another person or entity</li>
                <li>Attempt to reverse engineer any software on the website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. User Accounts & Eligibility
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be 18 years or older to create an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You agree to provide accurate and complete information during registration</li>
                <li>You are responsible for all activities under your account</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Product Information & Availability
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All product descriptions, images, and pricing are subject to change without notice</li>
                <li>We strive to ensure product availability but cannot guarantee instant stock</li>
                <li>Products are intended for healthy adults as a dietary supplement</li>
                <li>Consult a healthcare professional before using any supplement products</li>
                <li>Results may vary between individuals</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Orders & Payments
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All orders are subject to availability and confirmation of price</li>
                <li>We reserve the right to refuse or cancel any order for any reason</li>
                <li>Payment must be completed before order processing</li>
                <li>We accept major credit cards, UPI, and other payment methods as listed</li>
                <li>Prices are inclusive of applicable taxes unless stated otherwise</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Shipping & Delivery
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Shipping costs are calculated at checkout</li>
                <li>Risk of loss passes to you upon delivery to the carrier</li>
                <li>International orders may be subject to customs duties and taxes</li>
                <li>Free shipping may apply on orders above a specified threshold</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. Returns & Refunds
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unopened products can be returned within 15 days of delivery</li>
                <li>Defective or damaged products can be reported within 7 days</li>
                <li>Refunds are processed within 5-7 business days after approval</li>
                <li>Original shipping charges are non-refundable unless due to our error</li>
                <li>Return shipping costs may apply to change of mind returns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. Prohibited Uses
              </h2>
              <p>You may not use our service to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Submit false or misleading information</li>
                <li>Distribute malware, viruses, or other harmful code</li>
                <li>Engage in any activity that could damage, disable, or overload our systems</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. Intellectual Property
              </h2>
              <p>
                All content on this website, including logos, product images, descriptions, and design, are the intellectual property of The Power Trainer. Unauthorized reproduction, distribution, or use is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                10. Disclaimer of Warranties
              </h2>
              <p>
                Our services are provided &quot;as is&quot; without any representations or warranties, express or implied. We make no warranties regarding the accuracy, reliability, or completeness of any content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                11. Limitation of Liability
              </h2>
              <p>
                The Power Trainer shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                12. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless The Power Trainer and its affiliates from any claim, demand, or damage arising out of your violation of these terms or your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                13. Governing Law
              </h2>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Kerala, India.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                14. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of our services after any changes indicates your acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                15. Contact Information
              </h2>
              <p>
                For questions about these Terms of Use, please contact us:
              </p>
              <ul className="list-none pl-6 space-y-2 mt-2">
                <li><strong>Email:</strong> supporttpt@gmail.com</li>
                <li><strong>Phone:</strong> +91 9544946511</li>
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
