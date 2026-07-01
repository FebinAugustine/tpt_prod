import { Metadata } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { authApi } from "../services/authApi";

export const metadata: Metadata = {
  title: "Careers - The Power Trainer",
  description: "Join The Power Trainer team - Explore career opportunities in India's leading fitness supplement company",
};

interface Job {
  id?: number;
  title: string;
  department: string;
  type: string;
  location: string;
  description: string;
  requirements: string[];
}

const benefits = [
  { icon: "💰", title: "Competitive Salary", description: "Industry-leading pay with performance bonuses" },
  { icon: "🏥", title: "Health Insurance", description: "Comprehensive medical coverage for you and family" },
  { icon: "🎓", title: "Learning & Development", description: "Training programs and certification support" },
  { icon: "🏋️", title: "Fitness Perks", description: "Free supplements and gym membership" },
  { icon: "🏠", title: "Flexible Work", description: "Hybrid work options available" },
  { icon: "🎉", title: "Team Events", description: "Regular team building and celebration" },
];

async function getCareers(): Promise<Job[]> {
  try {
    const response = await authApi.getCareers(true);
    if (response.success && response.data) {
      return response.data as Job[];
    }
  } catch (error) {
    console.error('Error fetching careers:', error);
  }
  return [];
}

export default async function CareersPage() {
  const jobOpenings = await getCareers();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Join Our Team
          </h1>
          <p className="text-gray-500 mb-8">
            Build your career with India&apos;s fastest-growing fitness supplement company
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Why Work With Us
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-2xl mb-2">{benefit.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-sm">{benefit.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Current Openings
              </h2>
              {jobOpenings.length > 0 ? (
                <div className="space-y-4">
                  {jobOpenings.map((job) => (
                    <div key={job.title} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-500">{job.department}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {job.type}
                          </span>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                            {job.location}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req) => (
                          <span key={req} className="px-2 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded">
                            {req}
                          </span>
                        ))}
                      </div>
                      <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No current openings. Check back soon!</p>
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                How to Apply
              </h2>
              <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                <p className="mb-4">
                  Interested in joining The Power Trainer? Send us your resume and we&apos;ll get in touch!
                </p>
                <a
                  href="mailto:supporttpt@gmail.com"
                  className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Send Your Resume
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Contact HR
              </h2>
              <ul className="list-none pl-6 space-y-2 text-gray-600">
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
