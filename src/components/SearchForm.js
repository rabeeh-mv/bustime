'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchForm() {
  const [fromLocation, setFromLocation] = useState('')
  const [toLocation, setToLocation] = useState('')
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (fromLocation.trim() && toLocation.trim()) {
      // Redirect to search page with station names
      router.push(`/search?from=${encodeURIComponent(fromLocation)}&to=${encodeURIComponent(toLocation)}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="from" className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <input
            type="text"
            id="from"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            placeholder="Enter departure location"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            required
          />
        </div>
        <div>
          <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <input
            type="text"
            id="to"
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            placeholder="Enter destination"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
      >
        Search Bus Timings
      </button>
    </form>
  )
}
