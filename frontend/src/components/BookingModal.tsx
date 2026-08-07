import { useState } from "react";
import type { Slot } from "../types";
import { createBooking } from "../api";
import { useAuth } from "../contexts/AuthContext";
import styles from "./BookingModal.module.css";

interface Props {
  slot: Slot;
  onClose: () => void;
  onBooked: (slotId: number) => void;
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

export default function BookingModal({ slot, onClose, onBooked }: Props) {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    try {
      await createBooking(slot.id);
      onBooked(slot.id);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Confirm Booking</h2>
        <p className={styles.slotTime}>{formatDateTime(slot.start_time)}</p>
        <p className={styles.userName}>Booking as: {user?.first_name} {user?.last_name}</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.submit} onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Booking..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
