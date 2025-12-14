import { Subscription, Plan } from './types';

export const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    currency: 'USD',
    features: ['Up to 5 projects', 'Basic analytics', 'Email support'],
    trialDays: 7,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    currency: 'USD',
    features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'API access'],
    trialDays: 7,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    currency: 'USD',
    features: ['Everything in Premium', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
    trialDays: 14,
  },
];

export function calculateTrialEndDate(startDate: Date, planId: string): Date {
  const plan = PLANS.find(p => p.id === planId);
  if (!plan) throw new Error(`Plan ${planId} not found`);

  const trialEndDate = new Date(startDate);
  trialEndDate.setDate(startDate.getDate() + plan.trialDays);
  return trialEndDate;
}

export function getSubscriptionStatus(subscription: Subscription): 'trial' | 'active' | 'expired' {
  const now = new Date();

  if (subscription.status === 'cancelled') {
    return 'expired';
  }

  if (now <= subscription.trialEndDate) {
    return 'trial';
  }

  if (subscription.endDate && now > subscription.endDate) {
    return 'expired';
  }

  return 'active';
}

export function isTrialActive(subscription: Subscription): boolean {
  return getSubscriptionStatus(subscription) === 'trial';
}

export function isSubscriptionActive(subscription: Subscription): boolean {
  const status = getSubscriptionStatus(subscription);
  return status === 'trial' || status === 'active';
}

export function getDaysUntilTrialEnds(subscription: Subscription): number {
  const now = new Date();
  const timeDiff = subscription.trialEndDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function getDaysUntilExpiry(subscription: Subscription): number | null {
  if (!subscription.endDate) return null;
  const now = new Date();
  const timeDiff = subscription.endDate.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find(plan => plan.id === planId);
}

export function createSubscription(
  userId: string,
  planId: string,
  startDate: Date = new Date()
): Subscription {
  const plan = getPlanById(planId);
  if (!plan) throw new Error(`Plan ${planId} not found`);

  const trialEndDate = calculateTrialEndDate(startDate, planId);

  return {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    plan: planId as any,
    status: 'trial',
    startDate,
    trialEndDate,
    autoRenew: true,
    price: plan.price,
    currency: plan.currency,
  };
}

export function extendSubscription(subscription: Subscription, months: number): Subscription {
  const newEndDate = new Date(subscription.endDate || subscription.trialEndDate);
  newEndDate.setMonth(newEndDate.getMonth() + months);

  return {
    ...subscription,
    endDate: newEndDate,
    status: 'active',
  };
}

export function cancelSubscription(subscription: Subscription): Subscription {
  return {
    ...subscription,
    status: 'cancelled',
    autoRenew: false,
  };
}