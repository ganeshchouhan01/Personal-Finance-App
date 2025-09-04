'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts'
import { 
  TrendingUp, PieChart as PieChartIcon,  
  Download, Filter, ArrowUp, ArrowDown,  Wallet 
} from 'lucide-react'
import Layout from '../../components/layout/Layout'

const AnalyticsPage = () => {
  const [transactions, setTransactions] = useState([])
  const [timeRange, setTimeRange] = useState('month')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { user } = useAuth()

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4']

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      // Mock data for demonstration
      const mockData = {
        monthlyData: [
          { name: 'Jan', income: 2500, expense: 1200, savings: 1300 },
          { name: 'Feb', income: 2200, expense: 980, savings: 1220 },
          { name: 'Mar', income: 2800, expense: 1450, savings: 1350 },
          { name: 'Apr', income: 2600, expense: 1100, savings: 1500 },
          { name: 'May', income: 3000, expense: 1350, savings: 1650 },
          { name: 'Jun', income: 3200, expense: 1600, savings: 1600 },
          { name: 'Jul', income: 2800, expense: 1250, savings: 1550 },
          { name: 'Aug', income: 2900, expense: 1400, savings: 1500 },
          { name: 'Sep', income: 2700, expense: 1150, savings: 1550 },
          { name: 'Oct', income: 3100, expense: 1300, savings: 1800 },
          { name: 'Nov', income: 3300, expense: 1550, savings: 1750 },
          { name: 'Dec', income: 3500, expense: 1700, savings: 1800 }
        ],
        categoryData: [
          { name: 'Groceries', value: 1200 },
          { name: 'Rent', value: 800 },
          { name: 'Entertainment', value: 450 },
          { name: 'Utilities', value: 300 },
          { name: 'Transportation', value: 250 },
          { name: 'Dining', value: 600 }
        ],
        weeklyData: [
          { name: 'Mon', income: 0, expense: 120, savings: -120 },
          { name: 'Tue', income: 0, expense: 85, savings: -85 },
          { name: 'Wed', income: 0, expense: 150, savings: -150 },
          { name: 'Thu', income: 0, expense: 95, savings: -95 },
          { name: 'Fri', income: 0, expense: 180, savings: -180 },
          { name: 'Sat', income: 0, expense: 220, savings: -220 },
          { name: 'Sun', income: 0, expense: 160, savings: -160 }
        ],
        incomeSources: [
          { name: 'Salary', value: 2800 },
          { name: 'Freelance', value: 450 },
          { name: 'Investments', value: 250 },
          { name: 'Other', value: 100 }
        ]
      }

      let data = mockData.monthlyData
      if (timeRange === 'week') data = mockData.weeklyData
      if (timeRange === 'quarter') data = mockData.monthlyData.slice(-3)

      setTransactions(data)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast.error('Failed to load analytics data')
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
          <p className="text-xs text-gray-500">
            {((payload[0].value / totalExpenses) * 100).toFixed(1)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate totals
  const totalIncome = transactions.reduce((sum, item) => sum + (item.income || 0), 0)
  const totalExpenses = transactions.reduce((sum, item) => sum + (item.expense || 0), 0)
  const totalSavings = transactions.reduce((sum, item) => sum + (item.savings || 0), 0)
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0

  const categoryData = [
    { name: 'Groceries', value: 1200 },
    { name: 'Rent', value: 800 },
    { name: 'Entertainment', value: 450 },
    { name: 'Utilities', value: 300 },
    { name: 'Transportation', value: 250 },
    { name: 'Dining', value: 600 }
  ]

  const incomeSources = [
    { name: 'Salary', value: 2800 },
    { name: 'Freelance', value: 450 },
    { name: 'Investments', value: 250 },
    { name: 'Other', value: 100 }
  ]

  if (loading) {
    return (
      <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
      </Layout>
    )
  }

  return (
    <Layout>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gain insights into your spending patterns and financial health
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          {['overview', 'expenses', 'income', 'trends'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Income</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">+12% from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">-5% from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Wallet className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalSavings)}
                </p>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">+18% from last period</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <PieChartIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 dark:text-green-400">+3% from last period</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Income vs Expenses Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Income vs Expenses
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
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
            </div>
          </div>

          {/* Expense Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Expense Categories
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Savings Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Savings Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={transactions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis 
                    stroke="#6B7280" 
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value).replace(/[^\d.]/g, '')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="savings" fill="#10B981" stroke="#10B981" name="Savings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Income Sources */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Income Sources
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Financial Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Positive Trends</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Savings rate increased by 3% this month</li>
                <li>• Dining expenses decreased by 15%</li>
                <li>• Income from investments grew by 8%</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Areas to Watch</h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                <li>• Entertainment spending is 20% above budget</li>
                <li>• Transportation costs increased by 12%</li>
                <li>• Consider diversifying income sources</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  )
}

export default AnalyticsPage