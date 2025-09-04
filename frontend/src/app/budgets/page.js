// src/app/budgets/page.js
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import { Plus, TrendingUp, TrendingDown, Edit3, Trash2, PieChart, Target, DollarSign } from 'lucide-react'
import Layout from '../../components/layout/Layout'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  })

  const categories = [
    'Groceries', 'Dining', 'Entertainment', 'Transportation', 
    'Utilities', 'Rent/Mortgage', 'Shopping', 'Healthcare',
    'Education', 'Travel', 'Personal Care', 'Gifts', 'Other'
  ]

  useEffect(() => {
    fetchBudgets()
    fetchTransactions()
  }, [])

  const fetchBudgets = async () => {
    try {
      // Mock data for demonstration
      const mockBudgets = [
        {
          _id: '1',
          category: 'Groceries',
          amount: 500,
          spent: 420,
          period: 'monthly',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          createdAt: new Date()
        },
        {
          _id: '2',
          category: 'Entertainment',
          amount: 200,
          spent: 180,
          period: 'monthly',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          createdAt: new Date()
        },
        {
          _id: '3',
          category: 'Transportation',
          amount: 300,
          spent: 250,
          period: 'monthly',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          createdAt: new Date()
        }
      ]
      setBudgets(mockBudgets)
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('Failed to load budgets')
    }
  }

  const fetchTransactions = async () => {
    try {
      // Mock data for demonstration
      const mockTransactions = [
        { _id: '1', category: 'Groceries', amount: -85.50, date: new Date(), type: 'expense' },
        { _id: '2', category: 'Groceries', amount: -120.00, date: new Date(), type: 'expense' },
        { _id: '3', category: 'Entertainment', amount: -45.00, date: new Date(), type: 'expense' },
        { _id: '4', category: 'Transportation', amount: -60.00, date: new Date(), type: 'expense' }
      ]
      setTransactions(mockTransactions)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.category || !formData.amount) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingBudget) {
        // Update existing budget
        const updatedBudgets = budgets.map(budget => 
          budget._id === editingBudget._id 
            ? { ...budget, ...formData, amount: parseFloat(formData.amount) }
            : budget
        )
        setBudgets(updatedBudgets)
        toast.success('Budget updated successfully')
      } else {
        // Add new budget
        const newBudget = {
          _id: Date.now().toString(),
          ...formData,
          amount: parseFloat(formData.amount),
          spent: 0,
          createdAt: new Date()
        }
        setBudgets([...budgets, newBudget])
        toast.success('Budget created successfully')
      }
      
      setFormData({
        category: '',
        amount: '',
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      })
      setShowForm(false)
      setEditingBudget(null)
    } catch (error) {
      console.error('Error saving budget:', error)
      toast.error('Failed to save budget')
    }
  }

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate || ''
    })
    setShowForm(true)
  }

  const handleDelete = (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setBudgets(budgets.filter(budget => budget._id !== budgetId))
      toast.success('Budget deleted successfully')
    }
  }

  const calculateProgress = (budget) => {
    const percentage = (budget.spent / budget.amount) * 100
    return Math.min(percentage, 100) // Cap at 100%
  }

  const getProgressColor = (percentage) => {
    if (percentage < 70) return 'bg-green-500'
    if (percentage < 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }


  const formatCurrency = (amount) => {
    const currency = user?.currency || 'USD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </Layout>
    )
  }

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track and manage your spending across categories
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            {showForm ? 'Cancel' : 'Add Budget'}
          </button>
        </div>

        {/* Budget Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingBudget ? 'Edit Budget' : 'Create New Budget'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Period *
                  </label>
                  <select
                    required
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingBudget(null)
                    setFormData({
                      category: '',
                      amount: '',
                      period: 'monthly',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: ''
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Budgets Grid */}
        {budgets.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No budgets yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first budget to start tracking your expenses
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const progress = calculateProgress(budget)
              const progressColor = getProgressColor(progress)
              
              return (
                <div key={budget._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {budget.category}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget._id)}
                        className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Budget: {formatCurrency(budget.amount)}</span>
                      <span>Spent: {formatCurrency(budget.spent)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${progressColor} transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {progress.toFixed(1)}%
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      {budget.spent <= budget.amount ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <TrendingDown className="w-4 h-4 mr-1" />
                          {formatCurrency(budget.amount - budget.spent)} left
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {formatCurrency(budget.spent - budget.amount)} over budget
                        </span>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {budget.period}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Budget Summary */}
        {budgets.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <PieChart className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(budgets.reduce((sum, budget) => sum + budget.amount, 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <TrendingDown className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(budgets.reduce((sum, budget) => sum + budget.spent, 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(
                      budgets.reduce((sum, budget) => sum + budget.amount, 0) - 
                      budgets.reduce((sum, budget) => sum + budget.spent, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </Layout>
  )
}