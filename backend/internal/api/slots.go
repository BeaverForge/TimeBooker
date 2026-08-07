package api

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"time-booker/internal/db/model"
)

func (handler *Handler) listSlots(w http.ResponseWriter, r *http.Request) {
	rows, err := handler.db.Query(context.Background(),
		`SELECT id, start_time, end_time, is_available, created_at
		 FROM slots ORDER BY start_time`)
	if err != nil {
		http.Error(w, "failed to query slots", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	slots := make([]model.Slot, 0)
	for rows.Next() {
		var s model.Slot
		if err := rows.Scan(&s.ID, &s.StartTime, &s.EndTime, &s.IsAvailable, &s.CreatedAt); err != nil {
			http.Error(w, "failed to scan slot", http.StatusInternalServerError)
			return
		}
		slots = append(slots, s)
	}

	json.NewEncoder(w).Encode(slots)
}

func (handler *Handler) createSlot(w http.ResponseWriter, r *http.Request) {
	var input struct {
		StartTime string `json:"start_time"`
		EndTime   string `json:"end_time"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	start, err := time.Parse(time.RFC3339, input.StartTime)
	if err != nil {
		http.Error(w, "invalid start_time format, use RFC3339", http.StatusBadRequest)
		return
	}
	end, err := time.Parse(time.RFC3339, input.EndTime)
	if err != nil {
		http.Error(w, "invalid end_time format, use RFC3339", http.StatusBadRequest)
		return
	}

	var s model.Slot
	err = handler.db.QueryRow(context.Background(),
		`INSERT INTO slots (start_time, end_time) VALUES ($1, $2)
		 RETURNING id, start_time, end_time, is_available, created_at`,
		start, end,
	).Scan(&s.ID, &s.StartTime, &s.EndTime, &s.IsAvailable, &s.CreatedAt)
	if err != nil {
		http.Error(w, "failed to create slot", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(s)
}
