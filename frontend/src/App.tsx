import { useEffect, useState } from "react";
import type { Slot } from "./types";
import { fetchSlots } from "./api";
import SlotList from "./components/SlotList";
import BookingModal from "./components/BookingModal";
import styles from "./App.module.css";

function groupByDay(slots: Slot[]): Record<string, Slot[]> {
  return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const day = new Date(slot.start_time).toISOString().slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});
}

export default function App() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSlots()
      .then(setSlots)
      .catch(() => setError("Failed to load available slots."))
      .finally(() => setLoading(false));
  }, []);

  function handleBooked(slotId: number) {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    setSelectedSlot(null);
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>Book a Lesson</h1>

      {loading && <p className={styles.status}>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <SlotList
          groupedSlots={groupByDay(slots)}
          onSelectSlot={setSelectedSlot}
        />
      )}

      {selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onBooked={handleBooked}
        />
      )}
    </main>
  );
}
