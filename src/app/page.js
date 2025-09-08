import Navbar from '@/components/Navbar'
import SearchForm from '@/components/SearchForm'
import PopularRoutes from '@/components/PopularRoutes'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Local Bus Timings in Kerala
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              Real-time bus schedule information for your daily commute
            </p>
            
            {/* Search Form */}
            <div className="max-w-2xl mx-auto">
              <SearchForm />
            </div>
          </div>
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Popular Routes
          </h2>
          <p className="text-lg text-gray-600">
            Quick access to frequently searched bus routes
          </p>
        </div>
        
        <PopularRoutes />
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚌</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Get the latest bus timings and route information</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Mobile Friendly</h3>
              <p className="text-gray-600">Access bus timings on any device, anywhere</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">➕</div>
              <h3 className="text-xl font-semibold mb-2">Easy to Add</h3>
              <p className="text-gray-600">Bus drivers can easily add their timings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
