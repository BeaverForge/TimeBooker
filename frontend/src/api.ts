import type { Slot, Booking, User } from "./types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "/api";

export async function fetchSlots(): Promise<Slot[]> {
  const res = await fetch(`${BACKEND_URL}/slots`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch slots");
  return res.json();
}

export async function signup(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Signup failed");
  }
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Login failed");
  }
}

export async function logout(): Promise<void> {
  await fetch(`${BACKEND_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${BACKEND_URL}/users/me`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

export async function createSlot(startTime: string, endTime: string): Promise<Slot> {
  const res = await fetch(`${BACKEND_URL}/slots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ start_time: startTime, end_time: endTime }),
  });
  if (!res.ok) throw new Error("Failed to create slot");
  return res.json();
}

export async function createBooking(slotId: number): Promise<Booking> {
  const res = await fetch(`${BACKEND_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ slot_id: slotId }),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}
