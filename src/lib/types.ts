export interface Subscription {
  id: string;
  userId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  startDate: Date;
  trialEndDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  price: number;
  currency: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  trialDays: number;
}