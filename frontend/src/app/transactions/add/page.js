// src/app/transactions/add/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import TransactionForm from '@/components/transactions/TransactionForm'
import { toast } from 'sonner'
import api from '@/lib/api'

const AddTransaction = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData) => {
    setLoading(true)
    try {
      await api.post('/transactions', formData)
      toast.success('Transaction added successfully')
      router.push('/transactions')
    } catch (error) {
      console.error('Error adding transaction:', error)
      toast.error('Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/transactions')
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Transaction</h1>
          <p className="text-gray-600 dark:text-gray-400">Record your income or expense</p>
        </div>

        <TransactionForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </Layout>
  )
}

export default AddTransaction