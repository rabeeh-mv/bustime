import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">🚌</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            The page you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
