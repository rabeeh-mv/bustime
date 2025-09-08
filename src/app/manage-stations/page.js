'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

export default function ManageStationsPage() {
  const [stations, setStations] = useState([])
  const [newStation, setNewStation] = useState({ stationName: '', location: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchStations()
  }, [])

  const fetchStations = async () => {
    try {
      const { data, error } = await supabase
        .from('bus_stations')
        .select('*')
        .order('station_name')

      if (error) throw error
      setStations(data || [])
    } catch (error) {
      console.error('Error fetching stations:', error)
      setMessage('Error fetching stations')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('bus_stations')
        .insert([
          {
            station_name: newStation.stationName.trim(),
            location: newStation.location.trim() || null
          }
        ])

      if (error) throw error

      setMessage('Station added successfully!')
      setNewStation({ stationName: '', location: '' })
      fetchStations()
    } catch (error) {
      console.error('Error adding station:', error)
      setMessage('Error adding station. Please try again.')
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
              Manage Bus Stations
            </h1>
            <p className="text-lg text-gray-600">
              Add and manage bus stations for detailed trip schedules
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

          {/* Add New Station Form */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Station</h3>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="stationName" className="block text-sm font-medium text-gray-700 mb-2">
                  Station Name *
                </label>
                <input
                  type="text"
                  id="stationName"
                  value={newStation.stationName}
                  onChange={(e) => setNewStation({ ...newStation, stationName: e.target.value })}
                  placeholder="e.g., Kannur Bus Station"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={newStation.location}
                  onChange={(e) => setNewStation({ ...newStation, location: e.target.value })}
                  placeholder="e.g., Kannur"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isSubmitting ? 'Adding...' : 'Add Station'}
                </button>
              </div>
            </form>
          </div>

          {/* Stations List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Available Stations ({stations.length})
            </h3>
            
            {stations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No stations added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stations.map((station) => (
                  <div key={station.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {station.station_name}
                    </h4>
                    {station.location && (
                      <p className="text-sm text-gray-600 mb-2">
                        {station.location}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Added {new Date(station.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              💡 Tips for adding stations:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use clear, descriptive station names (e.g., "Kannur Bus Station")</li>
              <li>• Include the city/town name in the location field</li>
              <li>• Stations will be available when creating detailed trip schedules</li>
              <li>• You can add stations as needed when creating trips</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
