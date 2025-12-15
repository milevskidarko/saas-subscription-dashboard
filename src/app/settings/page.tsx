'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import {
  getSubscriptionStatus,
  getDaysUntilTrialEnds,
  getPlanById,
  hasFeatureAccess
} from '../../lib/subscription';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserSettings, updateUserSettings, UserSettings } from '../../lib/api';
import { LockedFeature } from '../components/LockedFeature';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const { data: settings, isLoading: settingsLoading, error: settingsError } = useQuery<UserSettings>({
    queryKey: ['user-settings', user?.id],
    queryFn: () => fetchUserSettings(user!.id),
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<UserSettings>) =>
      updateUserSettings(user!.id, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', user?.id] });
    },
  });

  const defaultSettings: UserSettings = {
    notifications: true,
    theme: 'light',
    language: 'en',
    emailUpdates: true,
    marketingEmails: false,
  };

  const localSettings = settings || defaultSettings;

  const [tempSettings, setTempSettings] = useState<UserSettings | null>(null);

  const handleSettingChange = (key: keyof UserSettings, value: UserSettings[keyof UserSettings]) => {
    const current = tempSettings || localSettings;
    setTempSettings({ ...current, [key]: value });
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(tempSettings || localSettings);
    setTempSettings(null);
  };

  if (!user) {
    return <div>Redirecting...</div>;
  }

  const subscription = user.subscription;
  const currentPlan = subscription ? getPlanById(subscription.plan) : null;
  const status = subscription ? getSubscriptionStatus(subscription) : null;
  const trialDaysLeft = subscription && status === 'trial' ? getDaysUntilTrialEnds(subscription) : null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={user.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {subscription && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Current Plan</p>
                    <p className="text-lg font-semibold text-gray-900">{currentPlan?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                      status === 'trial' ? 'bg-blue-100 text-blue-800' :
                      status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {status?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {status === 'trial' ? 'Trial Ends' : 'Next Billing'}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {status === 'trial' && trialDaysLeft !== null
                        ? `${trialDaysLeft} days left`
                        : subscription.endDate?.toLocaleDateString() || 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {status === 'trial' && trialDaysLeft !== null && trialDaysLeft <= 7 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-800 font-medium">Your trial is ending soon!</p>
                        <p className="text-blue-600 text-sm">
                          {trialDaysLeft} days left. Upgrade now to continue using all features.
                        </p>
                      </div>
                      <LockedFeature isLocked={!hasFeatureAccess(subscription, 'manage_users')}>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Upgrade Now
                        </button>
                      </LockedFeature>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
              {settingsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-6 bg-gray-200 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              ) : settingsError ? (
                <div className="text-red-600">Error loading settings</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications about your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempSettings?.notifications ?? localSettings.notifications}
                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Product Updates</p>
                      <p className="text-sm text-gray-600">Get notified about new features and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempSettings?.emailUpdates ?? localSettings.emailUpdates}
                        onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Emails</p>
                      <p className="text-sm text-gray-600">Receive marketing and promotional emails</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempSettings?.marketingEmails ?? localSettings.marketingEmails}
                        onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Theme</p>
                      <p className="text-sm text-gray-600">Choose your preferred theme</p>
                    </div>
                    <select
                      value={tempSettings?.theme ?? localSettings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Language</p>
                      <p className="text-sm text-gray-600">Select your language</p>
                    </div>
                    <select
                      value={tempSettings?.language ?? localSettings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}