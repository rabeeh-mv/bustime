import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

async function getRoutes(filters) {
  try {
    let query = supabase
      .from('routes')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.from) {
      query = query.ilike('from_location', `%${filters.from}%`)
    }
    if (filters?.to) {
      query = query.ilike('to_location', `%${filters.to}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching routes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching routes:', error)
    return []
  }
}

export default async function RoutesPage({ searchParams }) {
  const params = await searchParams
  const routes = await getRoutes({ from: params?.from, to: params?.to })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All Bus Routes
          </h1>
          <p className="text-lg text-gray-600">
            Find bus timings for routes across Kerala
          </p>
        </div>

        {routes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {params?.from || params?.to ? 'No routes found for your search' : 'No routes available yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {params?.from || params?.to 
                ? 'Try searching for specific bus stations or add a new route.'
                : 'Be the first to add a bus route timing!'
              }
            </p>
            <div className="space-x-4">
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Search Trips
              </a>
              <a
                href="/add-bus-trip"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Add Bus Trip
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <a
                key={route.id}
                href={`/routes/${route.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 hover:border-green-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {route.from_location} → {route.to_location}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      View bus timings and schedules
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Added {new Date(route.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
