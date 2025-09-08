import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-green-600">🚌</span>
              <span className="ml-2 text-xl font-bold text-gray-900">Kerala Bus Timings</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/routes" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              All Routes
            </Link>
            <Link 
              href="/search" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Search Trips
            </Link>
            <Link 
              href="/manage-stations" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Stations
            </Link>
            <Link 
              href="/add-bus" 
              className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Add Simple
            </Link>
            <Link 
              href="/add-bus-trip" 
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Add Detailed Trip
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
