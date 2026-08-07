import type { Slot } from "../types";
import styles from "./SlotList.module.css";

interface Props {
  days: string[];
  slots: Slot[];
  userRole: string;
  onSelectSlot: (slot: Slot) => void;
}

interface SlotBlock {
  slot: Slot;
  top: number;
  height: number;
  isContinuation: boolean;
}

const HOUR_END = 25;
const COLUMN_HEIGHT = 1152;
const PX_PER_MINUTE = COLUMN_HEIGHT / (24 * 60); // always based on real minutes in a day

const HOUR_LABELS = Array.from({ length: HOUR_END }, (_, i) => i);

// Split each slot into per-day blocks, clipping at midnight boundaries.
// A slot spanning midnight appears as two blocks: one clipped at the bottom
// of its start day, one starting at the top of the next.
function buildDayBlocks(slots: Slot[], days: string[]): Record<string, SlotBlock[]> {
  const daySet = new Set(days);
  const result: Record<string, SlotBlock[]> = {};

  for (const slot of slots) {
    const slotStart = new Date(slot.start_time);
    const slotEnd = new Date(slot.end_time);

    let dayMidnight = new Date(slotStart.getFullYear(), slotStart.getMonth(), slotStart.getDate());
    let isContinuation = false;

    while (dayMidnight.getTime() < slotEnd.getTime()) {
      const nextMidnight = new Date(dayMidnight.getFullYear(), dayMidnight.getMonth(), dayMidnight.getDate() + 1);
      const dayStr = dayMidnight.toISOString().slice(0, 10);

      if (daySet.has(dayStr)) {
        const blockStart = slotStart > dayMidnight ? slotStart : dayMidnight;
        const blockEnd = slotEnd < nextMidnight ? slotEnd : nextMidnight;

        const startMinutes = (blockStart.getTime() - dayMidnight.getTime()) / 60000;
        const durationMinutes = (blockEnd.getTime() - blockStart.getTime()) / 60000;

        if (!result[dayStr]) result[dayStr] = [];
        result[dayStr].push({
          slot,
          top: startMinutes * PX_PER_MINUTE,
          height: Math.max(durationMinutes * PX_PER_MINUTE, 24),
          isContinuation,
        });
      }

      dayMidnight = nextMidnight;
      isContinuation = true;
    }
  }

  return result;
}

function formatDayOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
}

function formatMonthDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatHour(hour: number): string {
  if (hour === 0) return "";
  if (hour === 12) return "12pm";
  return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SlotList({ days, slots, userRole, onSelectSlot }: Props) {
  const dayBlocks = buildDayBlocks(slots, days);

  return (
    <div className={styles.wrapper}>
      {/* Time gutter */}
      <div className={styles.gutter}>
        <div className={styles.gutterHeader} />
        <div className={styles.gutterBody} style={{ height: COLUMN_HEIGHT, flexShrink: 0 }}>
          {HOUR_LABELS.map((hour) => (
            <span
              key={hour}
              className={styles.timeLabel}
              style={{ top: 48 + (hour / HOUR_END) * COLUMN_HEIGHT }}
            >
              {formatHour(hour)}
            </span>
          ))}
        </div>
      </div>

      {/* Day columns */}
      <div className={styles.grid}>
        {days.map((day) => {
          const blocks = dayBlocks[day] ?? [];
          return (
            <div key={day} className={styles.column}>
              <div className={styles.dayHeader}>
                <span className={styles.weekday}>{formatDayOfWeek(day)}</span>
                <span className={styles.monthDay}>{formatMonthDay(day)}</span>
              </div>

              <div className={styles.columnBody} style={{ height: COLUMN_HEIGHT }}>
                {HOUR_LABELS.map((hour) => (
                  <div
                    key={hour}
                    className={styles.gridLine}
                    style={{ top: (hour / HOUR_END) * COLUMN_HEIGHT }}
                  />
                ))}

                {blocks.map((block) => (
                  <button
                    key={block.slot.id}
                    className={[
                      styles.slot,
                      !block.slot.is_available ? styles.slotBooked : "",
                      userRole === "coach" ? styles.slotCoach : "",
                      block.isContinuation ? styles.slotContinuation : "",
                    ].join(" ")}
                    style={{ top: block.top, height: block.height }}
                    onClick={() => onSelectSlot(block.slot)}
                  >
                    <span className={styles.slotTime}>{formatTime(block.slot.start_time)}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}