// src/components/transactions/TransactionForm.js
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, X } from 'lucide-react'

const TransactionForm = ({ transaction, onSubmit, onCancel, loading }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: transaction || {
      type: 'expense',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
      paymentMethod: 'cash'
    }
  })

  const [categories, setCategories] = useState([
    'Food & Dining', 'Transportation', 'Entertainment', 'Shopping',
    'Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
  ])

  const type = watch('type')

  useEffect(() => {
    if (transaction) {
      Object.keys(transaction).forEach(key => {
        if (transaction[key] !== undefined) {
          setValue(key, transaction[key])
        }
      })
    }
  }, [transaction, setValue])

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      amount: parseFloat(data.amount),
      date: new Date(data.date).toISOString()
    }
    onSubmit(formattedData)
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="income"
                {...register('type', { required: 'Type is required' })}
                className="mr-2"
              />
              <span className="text-green-600 font-medium">Income</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="expense"
                {...register('type', { required: 'Type is required' })}
                className="mr-2"
              />
              <span className="text-red-600 font-medium">Expense</span>
            </label>
          </div>
          {errors.type && (
            <p className="text-danger-600 text-sm mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' }
            })}
            className="input-field"
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="text-danger-600 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            id="category"
            {...register('category', { required: 'Category is required' })}
            className="input-field"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-danger-600 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date
          </label>
          <input
            id="date"
            type="date"
            {...register('date', { required: 'Date is required' })}
            className="input-field"
          />
          {errors.date && (
            <p className="text-danger-600 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            {...register('paymentMethod')}
            className="input-field"
          >
            <option value="cash">Cash</option>
            <option value="credit card">Credit Card</option>
            <option value="debit card">Debit Card</option>
            <option value="bank transfer">Bank Transfer</option>
            <option value="digital wallet">Digital Wallet</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Note */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Note (Optional)
          </label>
          <textarea
            id="note"
            rows={3}
            {...register('note')}
            className="input-field"
            placeholder="Add a note about this transaction..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex items-center"
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {transaction ? 'Update' : 'Create'} Transaction
          </button>
        </div>
      </form>
    </div>
  )
}

export default TransactionForm