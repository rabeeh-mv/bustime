import Link from 'next/link'

const popularRoutes = [
  { from: 'Kozhikode', to: 'Kannur', id: 'kozhikode-kannur' },
  { from: 'Kozhikode', to: 'Malappuram', id: 'kozhikode-malappuram' },
  { from: 'Kochi', to: 'Thiruvananthapuram', id: 'kochi-thiruvananthapuram' },
  { from: 'Kochi', to: 'Kozhikode', id: 'kochi-kozhikode' },
  { from: 'Thrissur', to: 'Kochi', id: 'thrissur-kochi' },
  { from: 'Palakkad', to: 'Kozhikode', id: 'palakkad-kozhikode' },
]

export default function PopularRoutes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {popularRoutes.map((route) => (
        <Link
          key={route.id}
          href={`/routes/${route.id}`}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 hover:border-green-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {route.from} → {route.to}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                View bus timings and schedules
              </p>
            </div>
            <div className="text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
