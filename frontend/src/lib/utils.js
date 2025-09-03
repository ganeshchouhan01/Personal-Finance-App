// src/lib/utils.js
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateForInput = (date) => {
  return new Date(date).toISOString().split('T')[0]
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}