import { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "About Us - The Power Trainer",
  description: "Learn about The Power Trainer - Your trusted destination for premium fitness supplements in India",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            About The Power Trainer
          </h1>
          <p className="text-gray-500 mb-8">Empowering Your Fitness Journey Since 2024</p>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Our Story
              </h2>
              <p>
                The Power Trainer was founded with a clear mission: to make premium fitness supplements accessible to every Indian who aspires to achieve their health and fitness goals. What started as a small initiative has grown into a trusted destination for fitness enthusiasts across the nation.
              </p>
              <p className="mt-3">
                We believe that everyone deserves access to quality supplements that support their fitness journey, whether you&apos;re a beginner just starting out or an elite athlete pushing your limits.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Our Mission
              </h2>
              <p>
                To empower individuals to achieve their fitness potential by providing authentic, high-quality supplements at affordable prices, backed by exceptional customer service and expert guidance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Why Choose Us
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">100% Authentic</h3>
                  <p className="text-sm">Genuine products sourced directly from manufacturers</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quality Assured</h3>
                  <p className="text-sm">GMP certified manufacturing standards</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Affordable Pricing</h3>
                  <p className="text-sm">Best prices guaranteed on all products</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Expert Support</h3>
                  <p className="text-sm">Dedicated customer service team</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Our Product Range
              </h2>
              <p>
                We offer a comprehensive selection of fitness supplements to support various fitness goals:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Whey Protein:</strong> Premium protein powders for muscle recovery and growth</li>
                <li><strong>Creatine:</strong> High-purity creatine monohydrate for strength and power</li>
                <li><strong>Pre-Workout:</strong> Energy and focus formulas for intense workouts</li>
                <li><strong>Mass Gainers:</strong> High-calorie formulas for muscle building</li>
                <li><strong>BCAAs & EAAs:</strong> Essential amino acids for recovery</li>
                <li><strong>Vitamins & Minerals:</strong> Essential nutrients for overall health</li>
                <li><strong>Protein Bars:</strong> Convenient snack options for on-the-go nutrition</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Our Values
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Integrity:</strong> We are transparent about our products, pricing, and policies</li>
                <li><strong>Quality:</strong> We never compromise on the quality of our products</li>
                <li><strong>Customer Focus:</strong> Your satisfaction is our top priority</li>
                <li><strong>Continual Improvement:</strong> We constantly evolve based on your feedback</li>
                <li><strong>Community:</strong> We support and nurture the fitness community</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Join Our Community
              </h2>
              <p>
                Follow us on social media for fitness tips, product updates, and exclusive offers. Stay motivated and connected with fellow fitness enthusiasts.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Facebook
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm">
                  Instagram
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                  YouTube
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Contact Us
              </h2>
              <p>
                We&apos;d love to hear from you:
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
