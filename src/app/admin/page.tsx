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

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!user || user.role !== 'admin') {
    return <div>Redirecting...</div>;
  }

  const stats = [
    {
      title: 'Total Users',
      value: '10,000',
      change: '+18.2% from last month',
      changeType: 'positive' as const,
      icon: '👥',
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'Stable',
      changeType: 'neutral' as const,
      icon: '🟢',
    },
    {
      title: 'Pending Issues',
      value: '5',
      change: '-2 from yesterday',
      changeType: 'positive' as const,
      icon: '⚠️',
    },
    {
      title: 'Server Uptime',
      value: '99.95%',
      change: '+0.05% from last month',
      changeType: 'positive' as const,
      icon: '🖥️',
    },
    {
      title: 'API Requests',
      value: '2.4M',
      change: '+15.7% from last month',
      changeType: 'positive' as const,
      icon: '📡',
    },
    {
      title: 'Database Size',
      value: '45.2 GB',
      change: '+2.1 GB from last month',
      changeType: 'neutral' as const,
      icon: '💾',
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                System overview and management controls.
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
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
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">High CPU usage on server-2</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Backup completed successfully</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">New user registration spike</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-medium transition-colors">
                    Ban User
                  </button>
                  <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium transition-colors">
                    System Logs
                  </button>
                  <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium transition-colors">
                    Backup Now
                  </button>
                  <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-orange-700 font-medium transition-colors">
                    Maintenance
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