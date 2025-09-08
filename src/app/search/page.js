import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

async function searchBusTrips(fromStation, toStation) {
  try {
    // First, find stations that match the search terms
    const { data: fromStations, error: fromError } = await supabase
      .from('bus_stations')
      .select('id, station_name, location')
      .ilike('station_name', `%${fromStation}%`)

    if (fromError) throw fromError

    const { data: toStations, error: toError } = await supabase
      .from('bus_stations')
      .select('id, station_name, location')
      .ilike('station_name', `%${toStation}%`)

    if (toError) throw toError

    if (!fromStations.length || !toStations.length) {
      return []
    }

    // Find buses that have both from and to stations in their trip timings
    const { data: trips, error: tripsError } = await supabase
      .from('trip_timings')
      .select(`
        bus_id,
        sequence_order,
        arrival_time,
        departure_time,
        stop_duration,
        buses!inner (
          id,
          bus_name,
          bus_number,
          operator_name,
          contact,
          category,
          total_duration,
          routes!inner (
            id,
            from_location,
            to_location
          )
        ),
        bus_stations!inner (
          id,
          station_name,
          location
        )
      `)
      .in('station_id', [...fromStations.map(s => s.id), ...toStations.map(s => s.id)])
      .order('bus_id, sequence_order')

    if (tripsError) throw tripsError

    // Group trips by bus and filter for buses that have both from and to stations
    const busTrips = {}
    const validBuses = new Set()

    trips.forEach(trip => {
      const busId = trip.bus_id
      if (!busTrips[busId]) {
        busTrips[busId] = {
          bus: trip.buses,
          stations: []
        }
      }
      busTrips[busId].stations.push({
        station: trip.bus_stations,
        sequence_order: trip.sequence_order,
        arrival_time: trip.arrival_time,
        departure_time: trip.departure_time,
        stop_duration: trip.stop_duration
      })
    })

    // Filter buses that have both from and to stations
    Object.keys(busTrips).forEach(busId => {
      const trip = busTrips[busId]
      const stationIds = trip.stations.map(s => s.station.id)
      
      const hasFromStation = fromStations.some(fs => stationIds.includes(fs.id))
      const hasToStation = toStations.some(ts => stationIds.includes(ts.id))
      
      if (hasFromStation && hasToStation) {
        validBuses.add(busId)
      }
    })

    // Return filtered results with station details
    return Object.keys(busTrips)
      .filter(busId => validBuses.has(busId))
      .map(busId => {
        const trip = busTrips[busId]
        trip.stations.sort((a, b) => a.sequence_order - b.sequence_order)
        
        // Find the relevant stations for this trip
        const fromStationData = trip.stations.find(s => 
          fromStations.some(fs => fs.id === s.station.id)
        )
        const toStationData = trip.stations.find(s => 
          toStations.some(ts => ts.id === s.station.id)
        )

        return {
          ...trip,
          fromStation: fromStationData,
          toStation: toStationData,
          fromStations: fromStations,
          toStations: toStations
        }
      })

  } catch (error) {
    console.error('Error searching bus trips:', error)
    return []
  }
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams
  const fromStation = params?.from || ''
  const toStation = params?.to || ''
  
  const trips = (fromStation && toStation) ? await searchBusTrips(fromStation, toStation) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Bus Trips
          </h1>
          {fromStation && toStation && (
            <p className="text-lg text-gray-600">
              Results for trips from <span className="font-semibold">"{fromStation}"</span> to <span className="font-semibold">"{toStation}"</span>
            </p>
          )}
        </div>

        {!fromStation || !toStation ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Search for Bus Trips
            </h3>
            <p className="text-gray-600 mb-6">
              Use the search form on the homepage to find bus trips between stations
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              Go to Homepage
            </a>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🚌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No trips found
            </h3>
            <p className="text-gray-600 mb-6">
              No bus trips found between "{fromStation}" and "{toStation}". Try different station names.
            </p>
            <div className="space-x-4">
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Search Again
              </a>
              <a
                href="/add-bus-trip"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Add Trip
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Found {trips.length} trip{trips.length !== 1 ? 's' : ''}
              </h2>
            </div>
            
            {trips.map((trip, index) => (
              <div key={trip.bus.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Bus Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">🚌</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {trip.bus.bus_name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          {trip.bus.bus_number && (
                            <span className="text-sm text-gray-600 font-medium">
                              {trip.bus.bus_number}
                            </span>
                          )}
                          {trip.bus.category && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 uppercase tracking-wide">
                              {trip.bus.category.replace('_', ' ')}
                            </span>
                          )}
                          {trip.bus.operator_name && (
                            <span className="text-sm text-gray-600">
                              {trip.bus.operator_name}
                            </span>
                          )}
                          {trip.bus.total_duration && (
                            <span className="text-sm text-gray-600">
                              Duration: {trip.bus.total_duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {trip.bus.contact && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-sm">{trip.bus.contact}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trip Details */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* From Station */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">From Station</h4>
                      <div className="text-sm text-green-800">
                        <div className="font-medium">{trip.fromStation.station.station_name}</div>
                        <div className="text-green-600">{trip.fromStation.station.location}</div>
                        {trip.fromStation.departure_time && (
                          <div className="mt-2 font-medium">
                            Departure: {new Date(`2000-01-01T${trip.fromStation.departure_time}`).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* To Station */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">To Station</h4>
                      <div className="text-sm text-blue-800">
                        <div className="font-medium">{trip.toStation.station.station_name}</div>
                        <div className="text-blue-600">{trip.toStation.station.location}</div>
                        {trip.toStation.arrival_time && (
                          <div className="mt-2 font-medium">
                            Arrival: {new Date(`2000-01-01T${trip.toStation.arrival_time}`).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Full Route */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Complete Route</h4>
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
                          {trip.stations.map((timing, idx) => (
                            <tr key={timing.station.id} className={`border-b border-gray-100 ${
                              timing.station.id === trip.fromStation.station.id ? 'bg-green-50' : 
                              timing.station.id === trip.toStation.station.id ? 'bg-blue-50' : ''
                            }`}>
                              <td className="py-3">
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {timing.station.station_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {timing.station.location}
                                  </div>
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

                  {/* Route Link */}
                  <div className="mt-6 text-center">
                    <a
                      href={`/routes/${trip.bus.routes.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      View Full Route Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
