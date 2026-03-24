export type PaymentStatus = "paid" | "overdue" | "pending" | "failed";

export interface UserProfile {
  id: string;
  email: string;
  business_name: string;
  api_key: string | null;
  secret_key: string | null;
  created_at: string;
}

export interface Member {
  id: string;
  tid: string;
  name: string;
  phone: string | null;
  monthly_fee: number;
  status: PaymentStatus;
  status_label: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  tid: string;
  member_id: string;
  month: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
}
