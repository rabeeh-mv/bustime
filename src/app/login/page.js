// src/app/login/page.js
'use client'

import Navbar from '@/components/Navbar'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
	const { user, loading, login } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!loading && user) {
			router.push('/')
		}
	}, [user, loading, router])

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="bg-white rounded-lg shadow-md p-8 text-center">
					<h1 className="text-2xl font-bold mb-4">Sign in</h1>
					<p className="text-gray-600 mb-6">Sign in to add and manage bus trips.</p>
					<button
						onClick={login}
						className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg"
					>
						Continue with Google
					</button>
				</div>
			</div>
		</div>
	)
}
