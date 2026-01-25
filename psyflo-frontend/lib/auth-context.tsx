"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in - get additional data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          const userData = userDoc.data()
          
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: userData?.name || firebaseUser.displayName || "User"
          })
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "User"
          })
        }
      } else {
        // User is signed out
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      let errorMessage = "Failed to login"
      
      switch (firebaseError.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email"
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password"
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please try again later"
          break
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password"
          break
        default:
          errorMessage = firebaseError.message || "Failed to login"
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update display name
      await updateProfile(firebaseUser, { displayName: name })
      
      // Store additional user data in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        name,
        createdAt: new Date().toISOString()
      })

      // Set user state immediately with the correct name
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email || email,
        name: name
      })

      return { success: true }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      let errorMessage = "Failed to create account"
      
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists"
          break
        case "auth/invalid-email":
          errorMessage = "Invalid email address"
          break
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters"
          break
        default:
          errorMessage = firebaseError.message || "Failed to create account"
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
