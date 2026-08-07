import { useEffect, useState } from "react";
import type { Slot } from "../types";
import { fetchSlots } from "../api";
import { useAuth } from "../contexts/AuthContext";
import SlotList from "../components/SlotList";
import BookingModal from "../components/BookingModal";
import SlotDetailModal from "../components/SlotDetailModal";
import CoachSlotModal from "../components/CoachSlotModal";
import CreateSlotModal from "../components/CreateSlotModal";
import styles from "../App.module.css";

function groupByDay(slots: Slot[]): Record<string, Slot[]> {
  if (slots == null || slots.length === 0) return {};
  return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const day = new Date(slot.start_time).toISOString().slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});
}

function getNextFiveDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 5; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function Home() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showCreateSlot, setShowCreateSlot] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSlots()
      .then(setSlots)
      .catch(() => setError("Failed to load available slots."))
      .finally(() => setLoading(false));
  }, []);

  function handleBooked(slotId: number) {
    setSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, is_available: false } : s));
    setSelectedSlot(null);
  }

  function handleSlotCreated(slot: Slot) {
    setSlots((prev) => [...prev, slot]);
    setShowCreateSlot(false);
  }

  const isCoach = user?.role === "coach";

  function renderModal() {
    if (!selectedSlot) return null;

    if (isCoach) {
      return <CoachSlotModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />;
    }

    if (!selectedSlot.is_available) {
      return <SlotDetailModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />;
    }

    return (
      <BookingModal
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onBooked={handleBooked}
      />
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <h1 className={styles.heading}>Book a Lesson</h1>
        {isCoach && (
          <button className={styles.addSlotButton} onClick={() => setShowCreateSlot(true)}>
            + Add Slot
          </button>
        )}
      </div>

      {loading && <p className={styles.status}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <SlotList
          days={getNextFiveDays()}
          groupedSlots={groupByDay(slots)}
          userRole={user?.role ?? "student"}
          onSelectSlot={setSelectedSlot}
        />
      )}

      {renderModal()}

      {showCreateSlot && (
        <CreateSlotModal
          onClose={() => setShowCreateSlot(false)}
          onCreated={handleSlotCreated}
        />
      )}
    </main>
  );
}