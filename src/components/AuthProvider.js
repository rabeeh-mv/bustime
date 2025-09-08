// src/components/AuthProvider.js
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext({ user: null, loading: true, login: async () => {}, logout: async () => {} })

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (fbUser) => {
			setLoading(true)
			if (fbUser) {
				const profile = {
					firebase_uid: fbUser.uid,
					email: fbUser.email || null,
					display_name: fbUser.displayName || null,
					photo_url: fbUser.photoURL || null
				}
				await supabase.from('app_users').upsert(profile, { onConflict: 'firebase_uid' })
				setUser({
					uid: fbUser.uid,
					email: fbUser.email,
					name: fbUser.displayName,
					photoURL: fbUser.photoURL
				})
			} else {
				setUser(null)
			}
			setLoading(false)
		})
		return () => unsub()
	}, [])

	const login = async () => {
		await signInWithPopup(auth, googleProvider)
	}

	const logout = async () => {
		await signOut(auth)
	}

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
