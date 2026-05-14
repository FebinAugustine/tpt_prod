import { Metadata } from "next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "FAQ - The Power Trainer",
  description: "Frequently Asked Questions about The Power Trainer fitness supplements",
};

const faqCategories = [
  {
    category: "Orders & Tracking",
    questions: [
      {
        q: "How do I place an order?",
        a: "Simply browse our products, add items to your cart, and proceed to checkout. Follow the prompts to enter your shipping details and choose a payment method to complete your order."
      },
      {
        q: "How can I track my order?",
        a: "Once your order is shipped, you will receive an email/SMS with a tracking number. You can also track your order by logging into your account and visiting the 'My Orders' section."
      },
      {
        q: "Can I modify my order after placing it?",
        a: "You can modify your order within 1 hour of placing it, before it enters processing. Contact our support team immediately to request any changes."
      },
      {
        q: "How long does it take to process an order?",
        a: "Orders are typically processed within 1-2 business days. Once processed, shipping takes 3-7 business days depending on your location."
      },
    ],
  },
  {
    category: "Products & Supplements",
    questions: [
      {
        q: "Are your supplements safe to use?",
        a: "Yes, all our products are manufactured in GMP-certified facilities and undergo strict quality control. However, we recommend consulting a healthcare professional before starting any supplement regimen."
      },
      {
        q: "What is the shelf life of your products?",
        a: "Most of our supplements have a shelf life of 2 years from the date of manufacture. The exact expiry date is printed on each product packaging."
      },
      {
        q: "Do you offer sample packs or trial sizes?",
        a: "We occasionally offer sample packs during promotions. Subscribe to our newsletter to stay updated on special offers."
      },
      {
        q: "Are your products vegetarian/vegan-friendly?",
        a: "Product eligibility varies. Please check the product description for specific dietary information. We clearly label vegetarian and non-vegetarian products."
      },
      {
        q: "How do I choose the right supplement for my goals?",
        a: "Each product page includes detailed information about benefits, dosage, and suitability. You can also contact our support team for personalized recommendations."
      },
    ],
  },
  {
    category: "Payments",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI payments (Google Pay, PhonePe, Paytm, etc.) and Razorpay (debit cards, credit cards, net banking, wallets)."
      },
      {
        q: "Is it safe to pay on your website?",
        a: "Yes, we use SSL encryption and secure payment gateways (Razorpay) for all transactions. Your payment information is never stored on our servers."
      },
      {
        q: "Why is my payment pending verification?",
        a: "For UPI payments, our team manually verifies each transaction. This typically takes 1-2 business hours during working days."
      },
      {
        q: "Do you offer Cash on Delivery (COD)?",
        a: "Currently, we only accept prepaid orders through UPI and Razorpay. This helps us maintain competitive pricing and quality service."
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "Do you ship across India?",
        a: "Yes, we ship to all major cities and towns across India. Delivery times may vary based on your location."
      },
      {
        q: "How much does shipping cost?",
        a: "Standard shipping is ₹49. Free shipping is available on orders above ₹999. Express delivery (2-3 days) is available for ₹99."
      },
      {
        q: "Can I cancel my order?",
        a: "You can cancel your order within 1 hour of placing it, before it enters processing. See our Cancellation Policy for more details."
      },
      {
        q: "What if my package is lost or damaged?",
        a: "If your package is lost or arrives damaged, please contact our support team immediately with photos. We will arrange for replacement or full refund."
      },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer 15-day returns for unopened products in original packaging. Defective products can be returned within 7 days. Please check our Returns Policy for full details."
      },
      {
        q: "How do I initiate a return?",
        a: "Log into your account, go to 'My Orders', select the order, and click 'Return Item'. Select the reason and submit your request. Our team will review and guide you through the process."
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are processed within 5-7 business days after the returned item is approved. The amount will be credited to your original payment method."
      },
      {
        q: "Can I exchange a product?",
        a: "Yes, we offer exchanges for different sizes or flavors of the same product. Contact our support team to request an exchange."
      },
    ],
  },
  {
    category: "Account & Support",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click on 'Register' at the top of the page, enter your details, and verify your email. You can also register using Google authentication."
      },
      {
        q: "I forgot my password. What should I do?",
        a: "Click on 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your inbox to reset your password."
      },
      {
        q: "How can I contact customer support?",
        a: "You can reach us via email at support@thepowertrainer.com, call us at +91 98765 43210 (Mon-Sat, 9AM-6PM), or use the live chat on our website."
      },
      {
        q: "Do you offer bulk or wholesale orders?",
        a: "Yes, we offer special pricing for bulk orders. Please contact our business team at bulk@thepowertrainer.com for inquiries."
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500 mb-8">
            Find answers to common questions about The Power Trainer
          </p>

          <div className="space-y-8">
            {faqCategories.map((cat) => (
              <div key={cat.category}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {cat.category}
                </h2>
                <div className="space-y-4">
                  {cat.questions.map((item, idx) => (
                    <details
                      key={idx}
                      className="group bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <summary className="flex items-center justify-between cursor-pointer p-4 text-gray-900 font-medium hover:bg-gray-100 transition-colors">
                        <span>{item.q}</span>
                        <span className="ml-2 flex-shrink-0 transition-transform group-open:rotate-180">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
            <h3 className="text-lg font-semibold mb-2">
              Still have questions?
            </h3>
            <p className="text-blue-100 mb-4">
              Couldn&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:support@thepowertrainer.com"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Email Support
              </a>
              <a
                href="tel:+919876543210"
                className="px-4 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
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
