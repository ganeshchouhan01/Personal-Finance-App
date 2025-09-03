// src/components/dashboard/StatsCards.js
import { formatCurrency } from '@/lib/utils'

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Income',
      value: stats?.income || 0,
      change: '+12%',
      trend: 'up',
      color: 'success',
      icon: '💰',
    },
    {
      title: 'Total Expenses',
      value: stats?.expense || 0,
      change: '+8%',
      trend: 'up',
      color: 'danger',
      icon: '💸',
    },
    {
      title: 'Net Balance',
      value: stats?.netBalance || 0,
      change: stats?.netBalance >= 0 ? '+4%' : '-4%',
      trend: stats?.netBalance >= 0 ? 'up' : 'down',
      color: stats?.netBalance >= 0 ? 'success' : 'danger',
      icon: '📊',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(card.value)}
              </p>
              <p className={`text-sm ${card.trend === 'up' ? 'text-success-600' : 'text-danger-600'}`}>
                {card.change} from last month
              </p>
            </div>
            <div className={`p-3 rounded-lg bg-${card.color}-50 text-2xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards