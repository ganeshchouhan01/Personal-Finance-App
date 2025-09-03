// src/app/transactions/edit/[id]/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Layout from '@/components/layout/Layout'
import TransactionForm from '@/components/transactions/TransactionForm'
import { toast } from 'sonner'
import api from '@/lib/api'

const EditTransaction = () => {
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    fetchTransaction()
  }, [])

  const fetchTransaction = async () => {
    try {
      const response = await api.get(`/transactions/${params.id}`)
      setTransaction(response.data.data)
    } catch (error) {
      console.error('Error fetching transaction:', error)
      toast.error('Failed to load transaction')
      router.push('/transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      await api.put(`/transactions/${params.id}`, formData)
      toast.success('Transaction updated successfully')
      router.push('/transactions')
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast.error('Failed to update transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/transactions')
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
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Transaction</h1>
          <p className="text-gray-600 dark:text-gray-400">Update your transaction details</p>
        </div>

        <TransactionForm
          transaction={transaction}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={submitting}
        />
      </div>
    </Layout>
  )
}

export default EditTransaction