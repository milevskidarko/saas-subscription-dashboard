'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  }[changeType];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className={`text-sm mt-4 ${changeColor}`}>
        {change}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return <div>Redirecting...</div>;
  }

  const stats = [
    {
      title: 'Total Subscriptions',
      value: '1,234',
      change: '+12.5% from last month',
      changeType: 'positive' as const,
      icon: '📊',
    },
    {
      title: 'Active Users',
      value: '567',
      change: '+8.2% from last month',
      changeType: 'positive' as const,
      icon: '👥',
    },
    {
      title: 'Monthly Revenue',
      value: '$12,345',
      change: '+15.3% from last month',
      changeType: 'positive' as const,
      icon: '💰',
    },
    {
      title: 'Churn Rate',
      value: '2.4%',
      change: '-0.5% from last month',
      changeType: 'positive' as const,
      icon: '📉',
    },
    {
      title: 'New Signups',
      value: '89',
      change: '+22.1% from last month',
      changeType: 'positive' as const,
      icon: '📈',
    },
    {
      title: 'Avg. Session Time',
      value: '24m 32s',
      change: '+5.7% from last month',
      changeType: 'positive' as const,
      icon: '⏱️',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user.name}! Here's what's happening with your subscriptions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <StatCardSkeleton key={index} />
                  ))
                : stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                  ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {isLoading ? (
                    <>
                      <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2"></div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">New subscription from john@example.com</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Payment received: $29.99</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">User upgraded to premium plan</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors">
                    Add User
                  </button>
                  <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors">
                    Create Plan
                  </button>
                  <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium transition-colors">
                    View Reports
                  </button>
                  <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-700 font-medium transition-colors">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}