import { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Returns & Refunds - The Power Trainer",
  description: "Learn about returns and refunds policy at The Power Trainer",
};

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Returns & Refunds
          </h1>
          <p className="text-gray-500 mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Our Return Policy
              </h2>
              <p>
                We want you to be completely satisfied with your purchase from The Power Trainer. If for any reason you are not happy with your product, we offer a hassle-free return policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Return Eligibility
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <h3 className="font-semibold text-green-800 mb-2">Accepted Returns</h3>
                  <ul className="list-disc pl-4 text-sm text-green-700 space-y-1">
                    <li>Unopened products in original packaging</li>
                    <li>Defective or damaged products</li>
                    <li>Wrong item received</li>
                    <li>Expired products</li>
                    <li>Quality issues</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <h3 className="font-semibold text-red-800 mb-2">Non-Returnable Items</h3>
                  <ul className="list-disc pl-4 text-sm text-red-700 space-y-1">
                    <li>Opened or used products</li>
                    <li>Products with broken seals</li>
                    <li>Personal care items</li>
                    <li>Sale/clearance items</li>
                    <li>Free or promotional products</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Return Window
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Return Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Time Period</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Unopened Products</td>
                      <td className="py-3 px-4">15 days from delivery</td>
                      <td className="py-3 px-4">Original packaging intact</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Defective Products</td>
                      <td className="py-3 px-4">7 days from delivery</td>
                      <td className="py-3 px-4">With photos/videos of defect</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4">Wrong Item</td>
                      <td className="py-3 px-4">7 days from delivery</td>
                      <td className="py-3 px-4">Unopened, original packaging</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Expired Products</td>
                      <td className="py-3 px-4">Immediate</td>
                      <td className="py-3 px-4">With proof of expiry</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                How to Initiate a Return
              </h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Log in to your account and go to &quot;My Orders&quot;</li>
                <li>Find the order containing the item you wish to return</li>
                <li>Click on &quot;Return Item&quot; button</li>
                <li>Select the item(s) and reason for return</li>
                <li>Upload photos if the product is defective/damaged</li>
                <li>Submit the return request</li>
                <li>Our team will review and approve within 24-48 hours</li>
                <li>Once approved, you will receive return shipping instructions</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Return Shipping
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Defective/Wrong Item:</strong> We provide a prepaid return label or reimburse shipping costs</li>
                <li><strong>Change of Mind:</strong> Customer bears the return shipping cost</li>
                <li>Pack the product securely in original packaging</li>
                <li>Include the return packing slip inside the package</li>
                <li>Drop off at the designated pickup point or schedule a pickup</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Refund Process
              </h2>
              <p>
                Once we receive and inspect your returned item:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Inspection:</strong> 2-3 business days</li>
                <li><strong>Approval:</strong> You will receive confirmation via email/SMS</li>
                <li><strong>Refund Initiation:</strong> Within 1-2 business days after approval</li>
              </ul>
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Refund Timeline by Payment Method</h4>
                <ul className="list-disc pl-4 text-sm text-gray-600 space-y-1">
                  <li><strong>UPI:</strong> 3-5 business days</li>
                  <li><strong>Debit/Credit Cards:</strong> 5-7 business days</li>
                  <li><strong>Net Banking:</strong> 5-7 business days</li>
                  <li><strong>Wallet:</strong> 3-5 business days</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Refund Options
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Original Payment Method:</strong> Full refund to the same source</li>
                <li><strong>Store Credit:</strong> 10% bonus on refund amount (optional)</li>
                <li><strong>Bank Transfer:</strong> For cash on delivery orders (requires bank details)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Exchange Policy
              </h2>
              <p>
                We offer exchanges for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Different size/flavor of the same product</li>
                <li>Defective product replaced with a new one</li>
                <li>Contact support to request an exchange</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Damage During Transit
              </h2>
              <p>
                If your package arrives damaged:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Do not accept the delivery if visibly damaged</li>
                <li>Refuse the package and notify us immediately</li>
                <li>If damage noticed after opening, contact us within 24 hours</li>
                <li>Provide photos of the damaged package and product</li>
                <li>We will arrange for replacement or full refund</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Contact Us
              </h2>
              <p>
                For returns and refunds assistance, contact us:
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
