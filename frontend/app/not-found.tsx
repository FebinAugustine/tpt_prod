import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "Page not found - Protein App",
};

export default function NotFoundPage() {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center`}
      >
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            404 - Page Not Found
          </h1>

          <p className="text-gray-400 mb-8">
            Oops! The page you are looking for doesn't exist or may have been moved.
          </p>

          <a
            href="/"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors inline-block"
          >
            Go Back Home
          </a>
        </div>
      </body>
    </html>
  );
}