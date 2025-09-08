// src/app/providers.js
'use client'

import { AuthProvider } from '@/components/AuthProvider'

export default function Providers({ children }) {
	return <AuthProvider>{children}</AuthProvider>
}
