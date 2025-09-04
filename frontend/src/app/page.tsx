// src/app/page.js
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaMoneyBillWave, FaChartPie, FaShieldAlt } from "react-icons/fa";

export default function Home() {
  const features = [
    {
      icon: FaMoneyBillWave,
      title: "Track Expenses",
      description:
        "Easily log and categorize your daily expenses with an intuitive interface",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: FaChartPie,
      title: "Visual Analytics",
      description:
        "Get beautiful charts and insights about your spending patterns",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: FaShieldAlt,
      title: "Secure & Private",
      description:
        "Your financial data is encrypted and never shared with third parties",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-4 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 shadow-sm z-50">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <FaMoneyBillWave size={18} className="text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
            FinanceTracker
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/auth/login"
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-32 pb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-gray-900 dark:text-white">
          Take Control of Your{" "}
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            Financial Life
          </span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Beautifully track your income and expenses, set budgets, and achieve
          your financial goals with our intuitive personal finance tracker.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <Link
            href="/auth/register"
            className="btn-primary text-lg px-8 py-4 rounded-xl flex items-center gap-2 bg-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/demo"
            className="btn-secondary text-lg px-8 py-4 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            View Demo
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-10 mt-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-md group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center"
              >
                <div
                  className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
