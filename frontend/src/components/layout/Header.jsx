// src/components/layout/Header.js
'use client'

import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../../components/ui/ThemeToggle'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            type="button"
            className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={onMenuClick}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">Finance Tracker</h1>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</span>
          </div>
          
          <div className="relative">
            <button
              onClick={logout}
              className="flex items-center p-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header