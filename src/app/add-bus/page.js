'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { useEffect } from 'react'

export default function AddBusPage() {
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState({
    fromLocation: '',
    toLocation: '',
    busName: '',
    category: 'local',
    departureTime: '',
    stops: '',
    contact: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
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

      // Add the bus timing
      const { error: busError } = await supabase
        .from('buses')
        .insert([
          {
            route_id: routeId,
            bus_name: formData.busName.trim() || null,
            category: formData.category,
            departure_time: formData.departureTime,
            stops: formData.stops.trim() || null,
            contact: formData.contact.trim() || null
          }
        ])

      if (busError) {
        throw busError
      }

      setMessage('Bus timing added successfully!')
      
      // Reset form
      setFormData({
        fromLocation: '',
        toLocation: '',
        busName: '',
        category: 'local',
        departureTime: '',
        stops: '',
        contact: ''
      })

      // Redirect to the route page after a short delay
      setTimeout(() => {
        router.push(`/routes/${routeId}`)
      }, 2000)

    } catch (error) {
      console.error('Error adding bus timing:', error)
      setMessage('Error adding bus timing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(!user || loading) && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login required</h3>
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Add Bus Timing
            </h1>
            <p className="text-lg text-gray-600">
              Help others by sharing accurate bus timings
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

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="e.g., Kozhikode"
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
                  placeholder="e.g., Kannur"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
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
              <label htmlFor="busName" className="block text-sm font-medium text-gray-700 mb-2">
                Bus Name (Optional)
              </label>
              <input
                type="text"
                id="busName"
                name="busName"
                value={formData.busName}
                onChange={handleChange}
                placeholder="e.g., KSRTC Express"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700 mb-2">
                Departure Time *
              </label>
              <input
                type="time"
                id="departureTime"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="stops" className="block text-sm font-medium text-gray-700 mb-2">
                Stops (Optional)
              </label>
              <textarea
                id="stops"
                name="stops"
                value={formData.stops}
                onChange={handleChange}
                placeholder="e.g., Koyilandy, Vadakara, Thalassery"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number (Optional)
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isSubmitting ? 'Adding Bus Timing...' : 'Add Bus Timing'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              💡 Tips for accurate information:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use exact location names (e.g., "Kozhikode" not "Calicut")</li>
              <li>• Provide departure time in 24-hour format</li>
              <li>• Include major stops along the route</li>
              <li>• Contact number helps passengers for real-time updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
