import type { Slot } from "../types";
import styles from "./SlotList.module.css";

interface Props {
  groupedSlots: Record<string, Slot[]>;
  onSelectSlot: (slot: Slot) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SlotList({ groupedSlots, onSelectSlot }: Props) {
  const days = Object.keys(groupedSlots).sort();

  if (days.length === 0) {
    return <p className={styles.empty}>No available slots at this time.</p>;
  }

  return (
    <div className={styles.list}>
      {days.map((day) => (
        <div key={day} className={styles.day}>
          <h2 className={styles.dayHeading}>{formatDate(groupedSlots[day][0].start_time)}</h2>
          <div className={styles.slots}>
            {groupedSlots[day].map((slot) => (
              <button
                key={slot.id}
                className={styles.slot}
                onClick={() => onSelectSlot(slot)}
              >
                {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
