'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

export default function AddBusTripPage() {
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    busName: '',
    busNumber: '',
    operatorName: '',
    contact: '',
    totalDuration: '',
    category: 'local'
  })
  
  const [stations, setStations] = useState([])
  const [availableStations, setAvailableStations] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const createEmptyStation = (sequence) => ({
    id: Date.now() + Math.random(),
    stationId: '',
    arrivalTime: '',
    departureTime: '',
    stopDuration: '5',
    sequenceOrder: sequence
  })

  // Fetch available stations
  useEffect(() => {
    fetchStations()
  }, [])

  // Ensure at least two station rows are available by default
  useEffect(() => {
    setStations((prev) => {
      if (prev.length === 0) {
        return [createEmptyStation(1), createEmptyStation(2)]
      }
      return prev
    })
  }, [])

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('bus_stations')
        .select('*')
        .order('station_name')

      if (error) throw error
      setAvailableStations(data || [])
    } catch (error) {
      console.error('Error fetching stations:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addStation = () => {
    setStations((prev) => [...prev, createEmptyStation(prev.length + 1)])
  }

  const removeStation = (id) => {
    setStations((prev) => {
      const filtered = prev.filter((station) => station.id !== id)
      return filtered.map((station, index) => ({
        ...station,
        sequenceOrder: index + 1
      }))
    })
  }

  const updateStation = (id, field, value) => {
    setStations(stations.map(station => 
      station.id === id ? { ...station, [field]: value } : station
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // Validate form
      if (!formData.fromLocation.trim() || !formData.toLocation.trim()) {
        throw new Error('From and To locations are required')
      }
      
      if (!formData.busName.trim()) {
        throw new Error('Bus name is required')
      }

      if (stations.length < 2) {
        throw new Error('At least 2 stations are required')
      }

      // Check if all stations have required data
      for (let station of stations) {
        if (!station.stationId) {
          throw new Error('All stations must be selected')
        }
        if (!station.departureTime) {
          throw new Error('All stations must have departure time')
        }
      }

      // First, check if route exists or create it
      let { data: route, error: routeError } = await supabase
        .from('routes')
        .select('id')
        .eq('from_location', formData.fromLocation.trim())
        .eq('to_location', formData.toLocation.trim())
        .single()

      if (routeError && routeError.code !== 'PGRST116') {
        throw routeError
      }

      let routeId = route?.id

      // If route doesn't exist, create it
      if (!routeId) {
        const { data: newRoute, error: newRouteError } = await supabase
          .from('routes')
          .insert([
            {
              from_location: formData.fromLocation.trim(),
              to_location: formData.toLocation.trim()
            }
          ])
          .select()
          .single()

        if (newRouteError) {
          throw newRouteError
        }

        routeId = newRoute.id
      }

      // Add the bus
      const { data: bus, error: busError } = await supabase
        .from('buses')
        .insert([
          {
            route_id: routeId,
            bus_name: formData.busName.trim(),
            bus_number: formData.busNumber.trim() || null,
            operator_name: formData.operatorName.trim() || null,
            contact: formData.contact.trim() || null,
            category: formData.category,
            total_duration: formData.totalDuration.trim() || null
          }
        ])
        .select()
        .single()

      if (busError) {
        throw busError
      }

      // Add trip timings
      const tripTimings = stations.map(station => ({
        bus_id: bus.id,
        station_id: station.stationId,
        arrival_time: station.arrivalTime || null,
        departure_time: station.departureTime,
        stop_duration: `${station.stopDuration} minutes`,
        sequence_order: station.sequenceOrder
      }))

      const { error: timingsError } = await supabase
        .from('trip_timings')
        .insert(tripTimings)

      if (timingsError) {
        throw timingsError
      }

      setMessage('Bus trip added successfully!')
      
      // Reset form
      setFormData({
        fromLocation: '',
        toLocation: '',
        busName: '',
        busNumber: '',
        operatorName: '',
        contact: '',
        totalDuration: '',
        category: 'local'
      })
      setStations([])

      // Redirect to the route page after a short delay
      setTimeout(() => {
        router.push(`/routes/${routeId}`)
      }, 2000)

    } catch (error) {
      console.error('Error adding bus trip:', error)
      setMessage(error.message || 'Error adding bus trip. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Add Detailed Bus Trip
            </h1>
            <p className="text-lg text-gray-600">
              Create a comprehensive bus schedule with station-wise timings
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Bus Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bus Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fromLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    From Location *
                  </label>
                  <input
                    type="text"
                    id="fromLocation"
                    name="fromLocation"
                    value={formData.fromLocation}
                    onChange={handleChange}
                    placeholder="e.g., Kannur"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="toLocation" className="block text-sm font-medium text-gray-700 mb-2">
                    To Location *
                  </label>
                  <input
                    type="text"
                    id="toLocation"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    placeholder="e.g., Malappuram"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="busName" className="block text-sm font-medium text-gray-700 mb-2">
                    Bus Name *
                  </label>
                  <input
                    type="text"
                    id="busName"
                    name="busName"
                    value={formData.busName}
                    onChange={handleChange}
                    placeholder="e.g., KSRTC Express"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="busNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Bus Number
                  </label>
                  <input
                    type="text"
                    id="busNumber"
                    name="busNumber"
                    value={formData.busNumber}
                    onChange={handleChange}
                    placeholder="e.g., KL-13-1234"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Bus Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="local">Local</option>
                    <option value="limited_stop">Limited Stop</option>
                    <option value="ksrtc">KSRTC</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700 mb-2">
                    Operator Name
                  </label>
                  <input
                    type="text"
                    id="operatorName"
                    name="operatorName"
                    value={formData.operatorName}
                    onChange={handleChange}
                    placeholder="e.g., KSRTC"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="e.g., +91 9876543210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="totalDuration" className="block text-sm font-medium text-gray-700 mb-2">
                    Total Trip Duration
                  </label>
                  <input
                    type="text"
                    id="totalDuration"
                    name="totalDuration"
                    value={formData.totalDuration}
                    onChange={handleChange}
                    placeholder="e.g., 3 hours"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Station Timings */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Station Timings</h3>
                <button
                  type="button"
                  onClick={addStation}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  + Add Station
                </button>
              </div>

              {stations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No stations added yet. Click "Add Station" to start.</p>
                </div>
              )}

              <div className="space-y-4">
                {stations.map((station, index) => (
                  <div key={station.id} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Station {station.sequenceOrder}</h4>
                      <button
                        type="button"
                        onClick={() => removeStation(station.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Station *
                        </label>
                        <select
                          value={station.stationId}
                          onChange={(e) => updateStation(station.id, 'stationId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Station</option>
                          {availableStations.map(st => (
                            <option key={st.id} value={st.id}>
                              {st.station_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arrival Time
                        </label>
                        <input
                          type="time"
                          value={station.arrivalTime}
                          onChange={(e) => updateStation(station.id, 'arrivalTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Departure Time *
                        </label>
                        <input
                          type="time"
                          value={station.departureTime}
                          onChange={(e) => updateStation(station.id, 'departureTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stop Duration (min)
                        </label>
                        <input
                          type="number"
                          value={station.stopDuration}
                          onChange={(e) => updateStation(station.id, 'stopDuration', e.target.value)}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || stations.length < 2}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? 'Adding Bus Trip...' : (stations.length < 2 ? 'Add at least 2 stations to submit' : 'Add Bus Trip')}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              💡 Example Trip Schedule:
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Kannur → Malappuram</strong></p>
              <p>• Kannur Bus Station: Departure 10:00 PM</p>
              <p>• Kozhikode Bus Station: Arrival 11:00 PM, Departure 11:05 PM</p>
              <p>• Manjeri Bus Station: Arrival 12:00 AM, Departure 12:05 AM</p>
              <p>• Malappuram Bus Station: Arrival 1:00 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
