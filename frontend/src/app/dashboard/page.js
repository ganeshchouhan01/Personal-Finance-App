// src/app/dashboard/page.js
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Layout from '../../components/layout//Layout'
import StatsCards from '../../components/dashboard/StatsCards'
import ExpenseChart from '../../components/dashboard/ExpenseChart'
import RecentTransactions from '../../components/dashboard/RecentTransactions'
import api from '../../lib/api'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, transactionsResponse] = await Promise.all([
          api.get('/analytics/monthly-summary'),
          api.get('/transactions?limit=5')
        ])

        setStats(statsResponse.data.data)
        setTransactions(transactionsResponse.data.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name}! Here's your financial overview.</p>
      </div>

      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ExpenseChart data={stats?.categoryBreakdown} />
        <RecentTransactions transactions={transactions} />
      </div>
    </Layout>
  )
}

export default Dashboard