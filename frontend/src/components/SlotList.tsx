import type { Slot } from "../types";
import styles from "./SlotList.module.css";

interface Props {
  days: string[];
  groupedSlots: Record<string, Slot[]>;
  onSelectSlot: (slot: Slot) => void;
}

function formatDayOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
}

function formatMonthDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SlotList({ days, groupedSlots, onSelectSlot }: Props) {
  return (
    <div className={styles.grid}>
      {days.map((day) => {
        const slots = groupedSlots[day] ?? [];
        return (
          <div key={day} className={styles.column}>
            <div className={styles.dayHeader}>
              <span className={styles.weekday}>{formatDayOfWeek(day)}</span>
              <span className={styles.monthDay}>{formatMonthDay(day)}</span>
            </div>
            <div className={styles.slots}>
              {slots.length === 0 ? (
                <p className={styles.empty}>No slots</p>
              ) : (
                slots.map((slot) => (
                  <button
                    key={slot.id}
                    className={styles.slot}
                    onClick={() => onSelectSlot(slot)}
                  >
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
