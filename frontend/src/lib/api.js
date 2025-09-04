// lib/api.js
import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    // Skip token for login or register requests
    if (config.url?.includes('/login') || config.url?.includes('/register')||config.url?.includes('/auth/login')|| config.url?.includes('/auth/register')) {
      console.log('Skipping token for:', config.url)
      return config
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Attached token to request:', token)
    } else {
      console.warn('No token found in localStorage')
    }

    return config
  },
   (error) => Promise.reject(error)
)


// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// lib/api.js
// Set token
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
  }
}

// Get token
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// Remove token
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}

export default api