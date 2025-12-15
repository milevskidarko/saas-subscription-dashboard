import { Subscription } from './types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface DashboardStats {
  totalSubscriptions: number;
  activeUsers: number;
  monthlyRevenue: number;
  churnRate: number;
  newSignups: number;
  avgSessionTime: string;
}

export interface ActivityItem {
  id: string;
  type: 'subscription' | 'payment' | 'upgrade';
  message: string;
  timestamp: Date;
}

export interface UsageData {
  apiCalls: number;
  activeProjects: number;
  storageUsed: number;
  storageLimit: number;
}

const mockDashboardStats: DashboardStats = {
  totalSubscriptions: 1234,
  activeUsers: 567,
  monthlyRevenue: 12345,
  churnRate: 2.4,
  newSignups: 89,
  avgSessionTime: '24m 32s',
};

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'subscription',
    message: 'New subscription from john@example.com',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'payment',
    message: 'Payment received: $29.99',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '3',
    type: 'upgrade',
    message: 'User upgraded to premium plan',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
];

const mockUsageData: UsageData = {
  apiCalls: 1234,
  activeProjects: 89,
  storageUsed: 45.2,
  storageLimit: 100,
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay(1000);
  return mockDashboardStats;
}

export async function fetchRecentActivities(): Promise<ActivityItem[]> {
  await delay(800);
  return mockActivities;
}

export async function fetchUsageData(userId: string): Promise<UsageData> {
  await delay(600);
  return mockUsageData;
}

export async function fetchUserSubscription(
  userId: string
): Promise<Subscription | null> {
  await delay(500);
  return null;
}

export async function updateUserSettings(
  userId: string,
  settings: Record<string, unknown>
): Promise<void> {
  await delay(300);
  console.log('Updated settings for user', userId, settings);
}

export async function fetchUserSettings(userId: string): Promise<UserSettings> {
  await delay(400);
  return {
    notifications: true,
    theme: 'light',
    language: 'en',
    emailUpdates: true,
    marketingEmails: false,
  };
}

export async function fetchUsers(): Promise<User[]> {
  await delay(800);

  if (typeof window !== 'undefined') {
    const storedUsers = localStorage.getItem('saas_users');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      return parsedUsers.map((user: User) => ({
        ...user,
        joinedDate: new Date(user.joinedDate),
        lastActive: new Date(user.lastActive),
      }));
    }
  }

  const mockUsers = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      plan: 'Premium',
      isActive: true,
      joinedDate: new Date('2024-01-15'),
      lastActive: new Date(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      plan: 'Basic',
      isActive: true,
      joinedDate: new Date('2024-02-20'),
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      plan: 'Enterprise',
      isActive: false,
      joinedDate: new Date('2024-03-10'),
      lastActive: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      plan: 'Premium',
      isActive: true,
      joinedDate: new Date('2024-04-05'),
      lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  if (typeof window !== 'undefined') {
    localStorage.setItem('saas_users', JSON.stringify(mockUsers));
  }

  return mockUsers;
}

export async function createUser(
  userData: Omit<User, 'id' | 'joinedDate' | 'lastActive'>
): Promise<User> {
  await delay(500);

  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    joinedDate: new Date(),
    lastActive: new Date(),
  };

  const existingUsers = await fetchUsers();
  const updatedUsers = [...existingUsers, newUser];

  if (typeof window !== 'undefined') {
    localStorage.setItem('saas_users', JSON.stringify(updatedUsers));
  }

  return newUser;
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<User> {
  await delay(500);

  const existingUsers = await fetchUsers();
  const userIndex = existingUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  const updatedUser = { ...existingUsers[userIndex], ...updates };
  existingUsers[userIndex] = updatedUser;

  if (typeof window !== 'undefined') {
    localStorage.setItem('saas_users', JSON.stringify(existingUsers));
  }

  return updatedUser;
}

export async function deleteUser(userId: string): Promise<void> {
  await delay(500);

  const existingUsers = await fetchUsers();
  const filteredUsers = existingUsers.filter((u) => u.id !== userId);

  if (typeof window !== 'undefined') {
    localStorage.setItem('saas_users', JSON.stringify(filteredUsers));
  }
}

export async function fetchUserStats(): Promise<UserStats> {
  await delay(600);

  const users = await fetchUsers();

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const newUsersThisMonth = users.filter((u) => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return u.joinedDate >= oneMonthAgo;
  }).length;

  const churnRate =
    totalUsers > 0 ? Math.round((Math.random() * 5 + 2) * 10) / 10 : 0;

  return {
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    churnRate,
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  isActive: boolean;
  joinedDate: Date;
  lastActive: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  churnRate: number;
}

export interface UserSettings {
  notifications: boolean;
  theme: 'light' | 'dark';
  language: string;
  emailUpdates: boolean;
  marketingEmails: boolean;
}
