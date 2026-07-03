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
  user_name: string;
  user_email: string;
  status: string;
  created_at: string;
}
