export type SubscriptionStatus = 'pending' | 'active' | 'expired';
export type AppRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  status: SubscriptionStatus;
  subscription_expires_at: string | null;
  created_at: string;
  language: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  stream_url: string;
  category: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface Match {
  id: string;
  title: string;
  team_home: string;
  team_away: string;
  match_time: string;
  poster_url: string | null;
  channel_id: string | null;
  is_live: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface Slideshow {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_type: string | null;
  link_id: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  amount: number;
  phone_number: string;
  transaction_id: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}
