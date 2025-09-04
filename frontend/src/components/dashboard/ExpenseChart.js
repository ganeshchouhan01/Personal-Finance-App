// src/components/dashboard/ExpenseChart.js
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, PieChart as PieChartIcon, Calendar } from 'lucide-react'
import api from '../../lib/api'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4']

const mockBarData = [
  { name: 'Jan', income: 2500, expense: 1200 },
  { name: 'Feb', income: 2200, expense: 980 },
  { name: 'Mar', income: 2800, expense: 1450 }
]

const mockPieData = [
  { name: 'Groceries', value: 1200 },
  { name: 'Rent', value: 800 },
  { name: 'Entertainment', value: 450 }
]
const ExpenseChart = () => {
  const [chartData, setChartData] = useState([])
  const [pieData, setPieData] = useState([])
  const [timeRange, setTimeRange] = useState('month')
  const [chartType, setChartType] = useState('bar')
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()


  useEffect(() => {
    fetchChartData()
  }, [timeRange])

  const getStartDate = (range) => {
  const today = new Date()
  const date = new Date(today)

  switch (range) {
    case 'week':
      date.setDate(today.getDate() - 7)
      break
    case 'month':
      date.setMonth(today.getMonth() - 1)
      break
    case 'quarter':
      date.setMonth(today.getMonth() - 3)
      break
    case 'year':
      date.setFullYear(today.getFullYear() - 1)
      break
    default:
      date.setMonth(today.getMonth() - 1)
  }

  return date.toISOString().split('T')[0]
}

  
  const fetchChartData = async () => {
  try {
    setLoading(true)

    // 🟦 1. Fetch bar chart data (income vs expense)
    const barRes = await api.get('/analytics/income-vs-expense', {
      params: {
        period: timeRange === 'week' ? 'weekly' : timeRange === 'quarter' ? 'quarterly' : 'monthly',
        months: 12,
      },
    })

    const barData = barRes.data?.data || []

    // 🟨 2. Fetch pie chart data (category spending)
    const pieRes = await api.get('/analytics/category-spending', {
      params: {
        startDate: getStartDate(timeRange),
        endDate: new Date().toISOString().split('T')[0], // today
        type: 'expense',
      },
    })

    const pieData = pieRes.data?.data || []

    setChartData(barData)
      setPieData(formattedPieData.length > 0 ? formattedPieData : mockPieData)
  } catch (error) {
    console.error('Error fetching chart data:', error)
    toast.error('Failed to load chart data')
  } finally {
    setLoading(false)
  }
}

  const formatCurrency = (value) => {
    const currency = user?.currency || 'USD'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Financial Overview
        </h2>
        
        <div className="flex items-center space-x-4">
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BarChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-md text-sm font-medium transition-colors ${
                chartType === 'pie'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="h-64">
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280" 
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value).replace(/[^\d.]/g, '')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#10B981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">
            {formatCurrency(chartData.reduce((sum, item) => sum + (item.income || 0), 0))}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-2">
            {formatCurrency(chartData.reduce((sum, item) => sum + (item.expense || 0), 0))}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">Net Balance</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-2">
            {formatCurrency(
              chartData.reduce((sum, item) => sum + (item.income || 0), 0) -
              chartData.reduce((sum, item) => sum + (item.expense || 0), 0)
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ExpenseChart