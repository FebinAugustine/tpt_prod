import { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Shipping Information - The Power Trainer",
  description: "Learn about shipping options, delivery times, and policies at The Power Trainer",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shipping Information
          </h1>
          <p className="text-gray-500 mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Delivery Partners
              </h2>
              <p className="mb-4">
                We partner with trusted delivery service providers to ensure your fitness supplements reach you safely and on time. Our shipping partners include:
              </p>
              <div className="flex flex-wrap gap-3">
                {["Ekart Logistics", "Delhivery", "Blue Dart", "India Post", "Professional Couriers"].map((partner) => (
                  <span key={partner} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {partner}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Delivery Timelines
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Delivery Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Delivery Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Shipping Cost</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Standard Delivery</td>
                      <td className="py-3 px-4">5-7 business days</td>
                      <td className="py-3 px-4">₹49</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Express Delivery</td>
                      <td className="py-3 px-4">2-3 business days</td>
                      <td className="py-3 px-4">₹99</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Same Day Delivery</td>
                      <td className="py-3 px-4">Same day (orders before 12 PM)</td>
                      <td className="py-3 px-4">₹149</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Free Shipping</td>
                      <td className="py-3 px-4">5-7 business days</td>
                      <td className="py-3 px-4 text-green-600 font-medium">FREE on orders above ₹999</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Delivery Areas
              </h2>
              <p>
                We deliver across India. Delivery times may vary based on your location:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Metro Cities:</strong> 3-5 business days</li>
                <li><strong>Tier 1 Cities:</strong> 4-6 business days</li>
                <li><strong>Tier 2 & 3 Cities:</strong> 5-8 business days</li>
                <li><strong>Remote Areas:</strong> 7-12 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Shipping Process
              </h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li><strong>Order Confirmation:</strong> You receive an email/SMS confirming your order</li>
                <li><strong>Payment Verification:</strong> Once payment is verified, your order is processed</li>
                <li><strong>Packing:</strong> Products are carefully packed in secure, damage-resistant packaging</li>
                <li><strong>Shipment:</strong> Tracking number is shared via email/SMS</li>
                <li><strong>In Transit:</strong> Track your order using the tracking link</li>
                <li><strong>Delivery:</strong> Package is delivered to your specified address</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Order Tracking
              </h2>
              <p>
                Track your order easily:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Use the tracking link sent to your email/SMS</li>
                <li>Track directly from your account under &quot;My Orders&quot;</li>
                <li>Contact our support for assistance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Packaging Quality
              </h2>
              <p>
                We ensure your supplements reach you in perfect condition:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Secure Packaging:</strong> Products are sealed in tamper-proof packaging</li>
                <li><strong>Temperature Control:</strong> Insulated packaging for temperature-sensitive products</li>
                <li><strong>Shock Protection:</strong> Cushioning materials to prevent damage during transit</li>
                <li><strong>Discreet Delivery:</strong> Plain packaging for privacy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Delivery Instructions
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Please provide a complete delivery address with landmark</li>
                <li>Ensure someone is available to receive the package</li>
                <li>Keep your phone number accessible for delivery coordination</li>
                <li>Verify the package before accepting delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Failed Delivery
              </h2>
              <p>
                If delivery fails due to reasons like wrong address or unavailability, our delivery partner will:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Attempt delivery 2 more times</li>
                <li>Leave a notification with re-delivery instructions</li>
                <li>Contact you to reschedule</li>
              </ul>
              <p className="mt-3">
                Unclaimed packages will be returned to us. Contact support to reschedule or cancel your order.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Contact Us
              </h2>
              <p>
                For shipping-related queries, contact us:
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
