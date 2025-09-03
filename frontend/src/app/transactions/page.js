// src/app/transactions/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import TransactionList from '@/components/transactions/TransactionList'
import TransactionFilters from '@/components/transactions/TransactionFilters'
import { toast } from 'sonner'
import api from '@/lib/api'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    search: ''
  })
  const router = useRouter()

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/transactions?${params}`)
      setTransactions(response.data.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`)
        toast.success('Transaction deleted successfully')
        fetchTransactions()
      } catch (error) {
        toast.error('Error deleting transaction')
      }
    }
  }

  const handleEdit = (id) => {
    router.push(`/transactions/edit/${id}`)
  }

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your income and expenses</p>
        </div>
        <button
          onClick={() => router.push('/transactions/add')}
          className="btn-primary"
        >
          Add Transaction
        </button>
      </div>

      <TransactionFilters filters={filters} onFilterChange={handleFilterChange} />
      
      <div className="mt-6">
        <TransactionList 
          transactions={transactions} 
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>
    </Layout>
  )
}

export default Transactions