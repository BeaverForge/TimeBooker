import type { Slot } from "../types";
import styles from "./BookingModal.module.css";

interface Props {
  slot: Slot;
  onClose: () => void;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SlotDetailModal({ slot, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Slot Details</h2>
        <p className={styles.slotTime}>{formatDateTime(slot.start_time)}</p>
        <p className={styles.userName}>This slot has already been booked.</p>

        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}