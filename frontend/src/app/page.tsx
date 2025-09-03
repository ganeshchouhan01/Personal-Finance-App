// src/app/page.js
import Link from 'next/link'
import { ArrowRight, TrendingUp, Shield, PieChart } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Track Expenses',
      description: 'Easily log and categorize your daily expenses with intuitive interface',
      color: 'text-blue-600'
    },
    {
      icon: PieChart,
      title: 'Visual Analytics',
      description: 'Get beautiful charts and insights about your spending patterns',
      color: 'text-green-600'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and never shared with third parties',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">FinanceTracker</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/auth/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Take Control of Your
          <span className="text-primary-600"> Financial Life</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Beautifully track your income and expenses, set budgets, and achieve your financial goals 
          with our intuitive personal finance tracker.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <Link href="/register" className="btn-primary text-lg px-8 py-4 group">
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/demo" className="btn-secondary text-lg px-8 py-4">
            View Demo
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="card group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">10K+</div>
            <div className="text-gray-600 dark:text-gray-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">$50M+</div>
            <div className="text-gray-600 dark:text-gray-400">Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">99.9%</div>
            <div className="text-gray-600 dark:text-gray-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">24/7</div>
            <div className="text-gray-600 dark:text-gray-400">Support</div>
          </div>
        </div>
      </div>
    </div>
  )
}