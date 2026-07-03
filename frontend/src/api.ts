import type { Slot, Booking } from "./types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "/api";

export async function fetchSlots(): Promise<Slot[]> {
  const res = await fetch(`${BACKEND_URL}/slots`);
  if (!res.ok) throw new Error("Failed to fetch slots");
  return res.json();
}

export async function createBooking(
  slotId: number,
  userName: string,
  userEmail: string
): Promise<Booking> {
  const res = await fetch(`${BACKEND_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slot_id: slotId,
      user_name: userName,
      user_email: userEmail,
    }),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}
