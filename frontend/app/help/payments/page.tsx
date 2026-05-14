import { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Payment Methods - The Power Trainer",
  description: "Learn about payment options available at The Power Trainer - UPI and Razorpay",
};

export default function PaymentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Payment Methods
          </h1>
          <p className="text-gray-500 mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Accepted Payment Methods
              </h2>
              <p className="mb-4">
                The Power Trainer offers secure and convenient payment options to make your shopping experience smooth. We accept the following payment methods:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">UPI QR Code</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Pay instantly using any UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.) by scanning our QR code
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Razorpay</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Pay securely with debit cards, credit cards, net banking, and wallets
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                How to Pay with UPI
              </h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Add items to your cart and proceed to checkout</li>
                <li>Select &quot;UPI QR Code&quot; as your payment method</li>
                <li>A QR code will be displayed on the payment screen</li>
                <li>Open your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                <li>Scan the QR code and enter the amount</li>
                <li>Complete the payment in your UPI app</li>
                <li>Enter the transaction ID / UPI reference number on our checkout page</li>
                <li>Complete your order</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                How to Pay with Razorpay
              </h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Add items to your cart and proceed to checkout</li>
                <li>Select &quot;Razorpay&quot; as your payment method</li>
                <li>You will be redirected to Razorpay&apos;s secure payment page</li>
                <li>Choose your preferred payment option (card, net banking, wallet)</li>
                <li>Enter your payment details securely</li>
                <li>Complete the transaction</li>
                <li>You will be redirected back to our website with order confirmation</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Payment Security
              </h2>
              <p>
                Your payment security is our priority. All transactions are processed through secure, encrypted channels:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>SSL Encryption:</strong> All payment data is encrypted using industry-standard SSL/TLS protocols</li>
                <li><strong>PCI DSS Compliant:</strong> Razorpay is PCI DSS compliant, ensuring your card details are secure</li>
                <li><strong>Verified Payments:</strong> UPI payments are verified before order processing</li>
                <li><strong>No Data Storage:</strong> We do not store your payment credentials on our servers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Payment Verification
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>UPI Payments:</strong> Orders with UPI payments require manual verification. Our team verifies transaction IDs within 1-2 business hours</li>
                <li><strong>Razorpay Payments:</strong> Payments are verified instantly through automatic confirmation</li>
                <li>You will receive email/SMS notifications at each verification step</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Payment Issues
              </h2>
              <p>
                If you encounter any payment issues:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Ensure your UPI app is linked to a valid bank account</li>
                <li>Check your internet connection is stable</li>
                <li>Verify you have sufficient balance in your account</li>
                <li>For Razorpay, ensure your card is enabled for online transactions</li>
                <li>Contact our support team if issues persist</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Contact Us
              </h2>
              <p>
                For payment-related queries, contact us:
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
