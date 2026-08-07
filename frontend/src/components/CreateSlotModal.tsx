import { useState } from "react";
import { createSlot } from "../api";
import type { Slot } from "../types";
import styles from "./BookingModal.module.css";

interface Props {
  onClose: () => void;
  onCreated: (slot: Slot) => void;
}

export default function CreateSlotModal({ onClose, onCreated }: Props) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      // datetime-local gives local time without timezone — toISOString() converts to UTC RFC3339
      const slot = await createSlot(
        new Date(startTime).toISOString(),
        new Date(endTime).toISOString()
      );
      onCreated(slot);
    } catch {
      setError("Failed to create slot. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>Add Slot</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Start time
            <input
              className={styles.input}
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </label>
          <label className={styles.label}>
            End time
            <input
              className={styles.input}
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submit} disabled={submitting}>
              {submitting ? "Creating..." : "Create Slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
