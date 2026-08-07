export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  email_verified: boolean;
}

export interface Slot {
  id: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface Booking {
  id: number;
  slot_id: number;
  user_id: number;
  status: string;
  created_at: string;
}
