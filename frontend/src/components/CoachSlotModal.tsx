import type { Slot } from "../types";
import styles from "./BookingModal.module.css";
import coachStyles from "./CoachSlotModal.module.css";

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

export default function CoachSlotModal({ slot, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{slot.is_available ? "Manage Slot" : "Booked Slot"}</h2>
        <p className={styles.slotTime}>{formatDateTime(slot.start_time)}</p>
        <p className={styles.userName}>
          {slot.is_available ? "This slot is open." : "This slot has been booked by a student."}
        </p>

        <div className={coachStyles.actions}>
          {slot.is_available ? (
            <>
              <button className={coachStyles.editButton} disabled>Edit</button>
              <button className={coachStyles.deleteButton} disabled>Delete</button>
            </>
          ) : (
            <>
              <button className={coachStyles.editButton} disabled>Reschedule</button>
              <button className={coachStyles.deleteButton} disabled>Cancel Booking</button>
            </>
          )}
          <button className={styles.cancel} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}