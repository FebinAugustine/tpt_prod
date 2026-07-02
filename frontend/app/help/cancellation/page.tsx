import { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Cancellation Policy - The Power Trainer",
  description: "Learn about order cancellation policy at The Power Trainer",
};

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Cancellation Policy
          </h1>
          <p className="text-gray-500 mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Overview
              </h2>
              <p>
                At The Power Trainer, we understand that sometimes plans change. This policy outlines how you can cancel your order and the conditions applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Cancellation Timeframe
              </h2>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-800 font-medium">
                  Orders can be cancelled within 1 hour of placing the order, before it enters the processing stage.
                </p>
              </div>
              <p className="mt-4">
                Once an order enters the processing or shipped stage, cancellation may not be possible. However, you may opt for a return after delivery.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                How to Cancel an Order
              </h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your account</li>
                <li>Go to &quot;My Orders&quot; section</li>
                <li>Find the order you wish to cancel</li>
                <li>Click on &quot;Cancel Order&quot; button</li>
                <li>Select a reason for cancellation</li>
                <li>Confirm the cancellation</li>
                <li>You will receive a confirmation email/SMS</li>
              </ol>
              <p className="mt-4">
                Alternatively, you can contact our support team within the cancellation window to request cancellation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Cancellation Conditions
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Before Processing:</strong> Full refund will be initiated</li>
                <li><strong>During Processing:</strong> Cancellation may not be possible; if successful, full refund will be issued</li>
                <li><strong>Already Shipped:</strong> Order cannot be cancelled; you may return after delivery</li>
                <li><strong>Prepaid Orders:</strong> Refund processed to original payment method</li>
                <li><strong>COD Orders:</strong> No cancellation fee</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Non-Cancellable Situations
              </h2>
              <p>
                Orders cannot be cancelled in the following scenarios:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Order has been shipped or out for delivery</li>
                <li>More than 1 hour has passed since order placement</li>
                <li>Custom or personalized products have been prepared</li>
                <li>Order contains restricted or regulated items</li>
                <li>Cancellation requested during sale period may take longer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Refund Timeline
              </h2>
              <p>
                Once your cancellation is approved, refund will be processed:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>UPI Payments:</strong> 3-5 business days</li>
                <li><strong>Razorpay/Card Payments:</strong> 5-7 business days</li>
                <li><strong>Original Payment Method:</strong> Refund credited to the same source</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Cancellation by The Power Trainer
              </h2>
              <p>
                We reserve the right to cancel orders in the following cases:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Product unavailable due to stock issues</li>
                <li>Payment verification failed</li>
                <li>Suspicious or fraudulent activity detected</li>
                <li>Shipping to restricted locations</li>
                <li>Pricing or product information errors</li>
              </ul>
              <p className="mt-3">
                In such cases, you will be notified immediately and full refund will be processed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Need Help?
              </h2>
              <p>
                If you need assistance with cancellation, contact us:
              </p>
              <ul className="list-none pl-6 space-y-2 mt-2">
                <li><strong>Email:</strong> supporttpt@gmail.com</li>
                <li><strong>Phone:</strong> +91 9447540035</li>
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
