// src/app/page.tsx
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          The Web3 Print-on-Demand Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect brands, designers, and customers on the blockchain. 
          Automatic royalty distribution through smart contracts.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/register"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Get Started
          </a>
          <a
            href="/discover"
            className="px-8 py-3 border border-gray-300 text-gray-900 rounded-lg hover:border-gray-400"
          >
            Explore Designs
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-xl font-bold mb-2">🏷️ For Brands</h3>
          <p className="text-gray-600">
            Upload your product templates and let designers create custom variations. 
            Track sales and analytics in real-time.
          </p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-xl font-bold mb-2">🎨 For Designers</h3>
          <p className="text-gray-600">
            Design on any brand's products without upfront costs. 
            Receive automatic payouts to your wallet.
          </p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-xl font-bold mb-2">🛒 For Customers</h3>
          <p className="text-gray-600">
            Discover unique designs from talented artists. 
            Support designers directly with every purchase.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to revolutionize print-on-demand?</h2>
        <a
          href="/register"
          className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium"
        >
          Join Now
        </a>
      </section>
    </div>
    </>
  )
}
