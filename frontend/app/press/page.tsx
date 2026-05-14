import { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authApi } from "../services/authApi";

export const metadata: Metadata = {
  title: "Press - The Power Trainer",
  description: "Press releases and media coverage for The Power Trainer",
};

interface PressItem {
  id?: number;
  title: string;
  description: string;
  date: string;
  type: string;
  publication?: string;
}

const brandAssets = [
  { name: "Logo (PNG)", size: "200KB" },
  { name: "Logo (SVG)", size: "50KB" },
  { name: "Brand Guidelines", size: "2MB" },
  { name: "Product Images", size: "15MB" },
];

async function getPress(): Promise<PressItem[]> {
  try {
    const response = await authApi.getPress(true);
    if (response.success && response.data) {
      return response.data as PressItem[];
    }
  } catch (error) {
    console.error('Error fetching press:', error);
  }
  return [];
}

export default async function PressPage() {
  const pressItems = await getPress();
  
  const pressReleases = pressItems.filter((p: any) => p.type === 'press_release');
  const mediaCoverage = pressItems.filter((p: any) => p.type === 'media_coverage');
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Press Room
          </h1>
          <p className="text-gray-500 mb-8">
            Latest news, media coverage, and brand resources
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                About The Power Trainer
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600">
                <p>
                  The Power Trainer is India&apos;s trusted destination for premium fitness supplements. Founded in 2024, we are committed to making quality supplements accessible to fitness enthusiasts across the nation.
                </p>
                <p className="mt-3">
                  Our product range includes whey protein, creatine, pre-workout supplements, mass gainers, and more - all sourced from trusted manufacturers and delivered with exceptional customer service.
                </p>
                <p className="mt-3">
                  <strong>Key Facts:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Founded: 2024</li>
                  <li>Headquarters: Kerala, India</li>
                  <li>Products: 100+ supplements</li>
                  <li>Customers: 50,000+ satisfied users</li>
                  <li>Delivery: 500+ cities across India</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Press Releases
              </h2>
              <div className="space-y-4">
                {pressReleases.map((release) => (
                  <div key={release.title} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-xs text-blue-600 font-medium">{release.date}</span>
                    <h3 className="font-semibold text-gray-900 mt-1">{release.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{release.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Media Coverage
              </h2>
              <div className="space-y-4">
                {mediaCoverage.map((coverage) => (
                  <div key={coverage.title} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-500">{coverage.publication}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">{coverage.date}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{coverage.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{coverage.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Brand Assets
              </h2>
              <p className="text-gray-600 mb-4">
                Media professionals can download official brand assets below. Please read our brand guidelines before using our logo or imagery.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {brandAssets.map((asset) => (
                  <div key={asset.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{asset.name}</p>
                      <p className="text-xs text-gray-500">{asset.size}</p>
                    </div>
                    <button className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Media Inquiries
              </h2>
              <p className="text-gray-600 mb-4">
                For press inquiries, interview requests, or additional information, please contact:
              </p>
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Press Office</h3>
                <ul className="list-none space-y-2 text-gray-600">
                  <li><strong>Email:</strong> press@thepowertrainer.com</li>
                  <li><strong>Phone:</strong> +91 98765 43210</li>
                  <li><strong>Hours:</strong> Mon-Fri, 10AM-5PM</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
