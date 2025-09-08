import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'

async function getRoute(routeId) {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', routeId)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching route:', error)
    return null
  }
}

async function getBusesForRoute(routeId) {
  try {
    const { data, error } = await supabase
      .from('buses')
      .select(`
        *,
        trip_timings (
          *,
          bus_stations (
            station_name,
            location
          )
        )
      `)
      .eq('route_id', routeId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching buses:', error)
      return []
    }

    // Sort trip timings by sequence order for each bus
    const busesWithSortedTimings = data?.map(bus => ({
      ...bus,
      trip_timings: bus.trip_timings?.sort((a, b) => a.sequence_order - b.sequence_order) || []
    })) || []

    return busesWithSortedTimings
  } catch (error) {
    console.error('Error fetching buses:', error)
    return []
  }
}

export default async function RoutePage({ params }) {
  const { routeId } = await params
  const route = await getRoute(routeId)
  
  if (!route) {
    notFound()
  }

  const buses = await getBusesForRoute(routeId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Route Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {route.from_location} → {route.to_location}
              </h1>
              <p className="text-lg text-gray-600">
                Bus timings and schedules
              </p>
            </div>
            <div className="text-4xl">🚌</div>
          </div>
        </div>

        {/* Bus Timings */}
        {buses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No bus timings available yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to add a bus timing for this route!
            </p>
            <div className="space-x-4">
              <a
                href="/add-bus"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Add Simple Timing
              </a>
              <a
                href="/add-bus-trip"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Add Detailed Trip
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Available Bus Trips ({buses.length})
            </h2>
            
            {buses.map((bus) => (
              <div key={bus.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Bus Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">🚌</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {bus.bus_name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          {bus.bus_number && (
                            <span className="text-sm text-gray-600 font-medium">
                              {bus.bus_number}
                            </span>
                          )}
                          {bus.category && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 uppercase tracking-wide">
                              {bus.category.replace('_', ' ')}
                            </span>
                          )}
                          {bus.operator_name && (
                            <span className="text-sm text-gray-600">
                              {bus.operator_name}
                            </span>
                          )}
                          {bus.total_duration && (
                            <span className="text-sm text-gray-600">
                              Duration: {bus.total_duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {bus.contact && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-sm">{bus.contact}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trip Schedule */}
                {bus.trip_timings && bus.trip_timings.length > 0 ? (
                  <div className="p-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Trip Schedule</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-sm font-medium text-gray-700">Station</th>
                            <th className="text-left py-2 text-sm font-medium text-gray-700">Arrival</th>
                            <th className="text-left py-2 text-sm font-medium text-gray-700">Departure</th>
                            <th className="text-left py-2 text-sm font-medium text-gray-700">Stop Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bus.trip_timings.map((timing, index) => (
                            <tr key={timing.id} className="border-b border-gray-100">
                              <td className="py-3">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {timing.bus_stations?.station_name || 'Unknown Station'}
                                  </div>
                                  {timing.bus_stations?.location && (
                                    <div className="text-sm text-gray-500">
                                      {timing.bus_stations.location}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3">
                                {timing.arrival_time ? (
                                  <span className="text-sm font-medium text-gray-900">
                                    {new Date(`2000-01-01T${timing.arrival_time}`).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-3">
                                {timing.departure_time ? (
                                  <span className="text-sm font-medium text-gray-900">
                                    {new Date(`2000-01-01T${timing.departure_time}`).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                              <td className="py-3">
                                <span className="text-sm text-gray-600">
                                  {timing.stop_duration || '0 minutes'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No detailed schedule available</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Bus Timing CTA */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Know a bus timing for this route?
            </h3>
            <p className="text-green-700 mb-4">
              Help others by adding accurate bus timings
            </p>
            <div className="space-x-4">
              <a
                href="/add-bus"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Add Simple Timing
              </a>
              <a
                href="/add-bus-trip"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Add Detailed Trip
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
