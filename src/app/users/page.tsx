'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUsers, fetchUserStats, User,  createUser, updateUser, deleteUser } from '../../lib/api';
import { hasFeatureAccess } from '../../lib/subscription';
import { LockedFeature } from '../components/LockedFeature';
import { UserModal } from '../components/UserModal';

export default function UsersPage() {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();

  useEffect(() => {
    if (!authUser) {
      router.push('/login');
    }
  }, [authUser, router]);

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: !!authUser,
  });

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => fetchUserStats(),
    enabled: !!authUser,
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<User> }) =>
      updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesStatus;
  }) || [];

  const handleAddUser = () => {
    setEditingUser(undefined);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleSaveUser = (userData: Omit<User, 'id' | 'joinedDate' | 'lastActive'>) => {
    if (editingUser) {
      updateUserMutation.mutate({ userId: editingUser.id, updates: userData });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  if (!authUser) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-600 mt-2">Manage your platform users</p>
              </div>
              <LockedFeature isLocked={!hasFeatureAccess(authUser.subscription, 'manage_users')}>
                <button 
                  onClick={handleAddUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add User
                </button>
              </LockedFeature>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : userStats ? (
                <>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900">{userStats.totalUsers}</p>
                      </div>
                      <div className="text-2xl">👥</div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-3xl font-bold text-gray-900">{userStats.activeUsers}</p>
                      </div>
                      <div className="text-2xl">✅</div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">New This Month</p>
                        <p className="text-3xl font-bold text-gray-900">{userStats.newUsersThisMonth}</p>
                      </div>
                      <div className="text-2xl">📈</div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Churn Rate</p>
                        <p className="text-3xl font-bold text-gray-900">{userStats.churnRate}%</p>
                      </div>
                      <div className="text-2xl">📉</div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {usersLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : usersError ? (
                <div className="p-6 text-center text-red-600">
                  Error loading users
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Active
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.plan}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.joinedDate.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastActive.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <LockedFeature isLocked={!hasFeatureAccess(authUser.subscription, 'manage_users')}>
                              <button 
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                Edit
                              </button>
                            </LockedFeature>
                            <LockedFeature isLocked={!hasFeatureAccess(authUser.subscription, 'manage_users')}>
                              <button 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </LockedFeature>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      No users found matching your criteria.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
      />
    </div>
  );
}