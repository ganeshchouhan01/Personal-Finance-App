// src/components/dashboard/RecentTransactions.js
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import { Eye, EyeOff, Calendar, DollarSign, Tag, Receipt } from 'lucide-react'

const RecentTransactions = ({ limit = 5, showViewAll = true }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    fetchRecentTransactions()
  }, [])

  const fetchRecentTransactions = async () => {
    try {
      // In a real app, you would fetch from your API
      // const response = await fetch('/api/transactions?limit=' + limit)
      // const data = await response.json()
      
      // Mock data for demonstration
      const mockTransactions = [
        {
          _id: '1',
          type: 'expense',
          amount: -125.50,
          category: 'Groceries',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          note: 'Weekly grocery shopping',
          paymentMethod: 'credit_card'
        },
        {
          _id: '2',
          type: 'income',
          amount: 2500.00,
          category: 'Salary',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          note: 'Monthly salary',
          paymentMethod: 'bank_transfer'
        },
        {
          _id: '3',
          type: 'expense',
          amount: -45.00,
          category: 'Entertainment',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          note: 'Movie tickets',
          paymentMethod: 'debit_card'
        },
        {
          _id: '4',
          type: 'expense',
          amount: -89.99,
          category: 'Utilities',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          note: 'Electricity bill',
          paymentMethod: 'bank_transfer'
        },
        {
          _id: '5',
          type: 'income',
          amount: 150.00,
          category: 'Freelance',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          note: 'Website project',
          paymentMethod: 'paypal'
        }
      ]

      setTransactions(mockTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    const currency = user?.currency || 'USD'
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    })
    return formatter.format(Math.abs(amount))
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTransactionIcon = (category) => {
    const icons = {
      Groceries: '🛒',
      Salary: '💰',
      Entertainment: '🎬',
      Utilities: '💡',
      Freelance: '💼',
      default: '💳'
    }
    return icons[category] || icons.default
  }

  const displayedTransactions = showAll ? transactions : transactions.slice(0, limit)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Transactions
        </h2>
        <div className="space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h2>
        {showViewAll && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Start adding transactions to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-lg">{getTransactionIcon(transaction.category)}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {transaction.category}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(transaction.date)}
                    {transaction.note && (
                      <>
                        <span className="mx-2">•</span>
                        {transaction.note}
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    transaction.amount > 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {transaction.paymentMethod?.replace('_', ' ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {transactions.length > limit && !showAll && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            +{transactions.length - limit} more transactions
          </button>
        </div>
      )}
    </div>
  )
}

export default RecentTransactions