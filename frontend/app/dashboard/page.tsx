'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/lib/api'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Stats {
  total: number
  byStatus: Array<{ status: string; count: string }>
  daily: Array<{ date: string; count: string }>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/messages/analytics')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"
          ></motion.div>
        </div>
      </Layout>
    )
  }

  const statusCounts = stats?.byStatus.reduce((acc, item) => {
    acc[item.status] = parseInt(item.count)
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-gray-900 mb-8 gradient-text"
        >
          Dashboard
        </motion.h1>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-white to-primary-50 rounded-xl shadow-lg p-6 border border-primary-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Total Messages</div>
              <div className="p-2 bg-primary-100 rounded-lg">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-4xl font-bold text-gray-900"
            >
              {stats?.total || 0}
            </motion.div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Sent</div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="text-4xl font-bold text-green-600"
            >
              {statusCounts.sent || 0}
            </motion.div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gradient-to-br from-white to-red-50 rounded-xl shadow-lg p-6 border border-red-100 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Failed</div>
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-4xl font-bold text-red-600"
            >
              {statusCounts.failed || 0}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { href: '/templates', label: 'Create Template', icon: '📝' },
                { href: '/events', label: 'Setup Event Trigger', icon: '⚡' },
                { href: '/analytics', label: 'View Analytics', icon: '📊' }
              ].map((action, idx) => (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                >
                  <Link
                    href={action.href}
                    className="flex items-center space-x-3 w-full text-left px-4 py-3 bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 rounded-lg hover:from-primary-100 hover:to-blue-100 transition-all duration-200 group"
                  >
                    <span className="text-xl">{action.icon}</span>
                    <span className="font-medium group-hover:translate-x-1 transition-transform">{action.label}</span>
                    <svg className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-sm text-gray-500">
              {stats?.daily.length ? (
                <div className="space-y-3">
                  {stats.daily.slice(0, 5).map((day, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + idx * 0.1 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        <span>{new Date(day.date).toLocaleDateString()}</span>
                      </span>
                      <span className="font-medium text-gray-900">{day.count} messages</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400">No activity yet</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  )
}

