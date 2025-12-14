'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/lib/api'

interface Plan {
  id: number
  name: string
  price: number
  currency: string
  quota: number
  features: any
}

interface Subscription {
  id: number
  plan_id: number
  status: string
  plan_name?: string
  price?: number
  quota?: number
  features?: any
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'razorpay'>('stripe')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    Promise.all([
      api.get('/subscriptions/plans'),
      api.get('/subscriptions/current')
    ])
      .then(([plansRes, subRes]) => {
        setPlans(plansRes.data.plans)
        setSubscription(subRes.data.subscription)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleSubscribe = async (planId: number) => {
    try {
      setSelectedPlan(planId)
      const res = await api.post('/subscriptions/payment-intent', {
        plan_id: planId,
        provider: paymentProvider
      })

      if (paymentProvider === 'stripe') {
        // In production, integrate Stripe Checkout or Elements
        alert('Stripe integration: Use Stripe.js to complete payment')
      } else {
        // In production, integrate Razorpay checkout
        alert('Razorpay integration: Use Razorpay checkout to complete payment')
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initiate payment')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Subscription Plans</h1>

        {subscription && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <h2 className="font-semibold text-primary-900 mb-2">Current Plan: {subscription.plan_name}</h2>
            <p className="text-sm text-primary-700">
              Status: <span className="capitalize">{subscription.status}</span>
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Provider</label>
          <select
            value={paymentProvider}
            onChange={(e) => setPaymentProvider(e.target.value as 'stripe' | 'razorpay')}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="stripe">Stripe</option>
            <option value="razorpay">Razorpay</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = subscription?.plan_id === plan.id
            const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg p-6 ${isCurrentPlan ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600">/month</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    {plan.quota.toLocaleString()} messages/month
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    {features?.templates === -1 ? 'Unlimited' : features?.templates || 5} templates
                  </li>
                  <li className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    {features?.webhooks ? 'Webhooks enabled' : 'No webhooks'}
                  </li>
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                    isCurrentPlan
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

