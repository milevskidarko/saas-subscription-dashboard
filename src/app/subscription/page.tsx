'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import {
  getSubscriptionStatus,
  getDaysUntilTrialEnds,
  getPlanById,
  formatCurrency
} from '../../lib/subscription';
import { useQuery } from '@tanstack/react-query';
import { fetchUsageData } from '../../lib/api';

interface BillingHistoryItem {
  id: string;
  date: Date;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'failed';
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const { data: usageData, isLoading: usageLoading, error: usageError } = useQuery({
    queryKey: ['usage-data', user?.id],
    queryFn: () => fetchUsageData(user!.id),
    enabled: !!user,
  });

  if (!user) {
    return <div>Redirecting...</div>;
  }

  const subscription = user.subscription;
  const currentPlan = subscription ? getPlanById(subscription.plan) : null;
  const status = subscription ? getSubscriptionStatus(subscription) : null;


  const billingHistory: BillingHistoryItem[] = subscription ? [
    {
      id: '1',
      date: new Date(subscription.startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      amount: subscription.price,
      description: `${currentPlan?.name} Plan - Monthly`,
      status: 'paid',
    },
    {
      id: '2',
      date: subscription.startDate,
      amount: 0,
      description: 'Trial Period Started',
      status: 'paid',
    },
  ] : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'trial': return '⏰';
      case 'active': return '✅';
      case 'expired': return '❌';
      default: return '📋';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
              <p className="text-gray-600 mt-2">Manage your subscription and billing</p>
            </div>

            {!subscription ? (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">No Active Subscription</h2>
                <p className="text-gray-600 mb-6">Choose a plan to get started with our services.</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  View Plans
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status!)}`}>
                      {getStatusIcon(status!)} {status!.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Plan</p>
                      <p className="text-lg font-semibold text-gray-900">{currentPlan?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(subscription.price, subscription.currency)}/month
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {status === 'trial' ? 'Trial Ends' : 'Next Billing'}
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {status === 'trial'
                          ? `${getDaysUntilTrialEnds(subscription)} days left`
                          : subscription.endDate?.toLocaleDateString() || 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  {status === 'trial' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800">
                        Your trial ends on {subscription.trialEndDate.toLocaleDateString()}.
                        Upgrade now to continue using all features.
                      </p>
                    </div>
                  )}
                </div>
                {currentPlan && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
                  <div className="space-y-4">
                    {billingHistory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{item.description}</p>
                          <p className="text-sm text-gray-600">{item.date.toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {item.amount === 0 ? 'Free' : formatCurrency(item.amount, subscription.currency)}
                          </p>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'paid' ? 'bg-green-100 text-green-800' :
                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Subscription</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-center">
                        <span className="text-2xl mb-2 block">⬆️</span>
                        <p className="font-medium text-gray-900">Upgrade Plan</p>
                        <p className="text-sm text-gray-600">Get more features</p>
                      </div>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-center">
                        <span className="text-2xl mb-2 block">💳</span>
                        <p className="font-medium text-gray-900">Update Payment</p>
                        <p className="text-sm text-gray-600">Change card details</p>
                      </div>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-center">
                        <span className="text-2xl mb-2 block">📄</span>
                        <p className="font-medium text-gray-900">Download Invoice</p>
                        <p className="text-sm text-gray-600">Get billing receipts</p>
                      </div>
                    </button>
                    <button className="p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      <div className="text-center">
                        <span className="text-2xl mb-2 block text-red-500">🚫</span>
                        <p className="font-medium text-red-700">Cancel Subscription</p>
                        <p className="text-sm text-red-600">End your plan</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage This Month</h3>
                  {usageLoading ? (
                    <div className="animate-pulse space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="text-center">
                            <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                            <div className="h-2 bg-gray-200 rounded mt-2"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : usageError ? (
                    <div className="text-red-600 text-center">Error loading usage data</div>
                  ) : usageData ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{usageData.apiCalls.toLocaleString()}</div>
                        <p className="text-gray-600">API Calls</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{usageData.activeProjects}</div>
                        <p className="text-gray-600">Active Projects</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">{usageData.storageUsed} GB</div>
                        <p className="text-gray-600">Storage Used</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: `${(usageData.storageUsed / usageData.storageLimit) * 100}%`}}></div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}