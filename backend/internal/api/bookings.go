package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"time-booker/internal/db/model"
	"time-booker/internal/middleware"
)

func (handler *Handler) createBooking(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.ContextKeyUserID).(int)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var input struct {
		SlotID int `json:"slot_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if input.SlotID == 0 {
		http.Error(w, "slot_id is required", http.StatusBadRequest)
		return
	}

	ctx := context.Background()

	var available bool
	err := handler.db.QueryRow(ctx,
		`SELECT is_available FROM slots WHERE id = $1`, input.SlotID,
	).Scan(&available)
	if err != nil {
		http.Error(w, "slot not found", http.StatusNotFound)
		return
	}
	if !available {
		http.Error(w, "slot is not available", http.StatusConflict)
		return
	}

	tx, err := handler.db.Begin(ctx)
	if err != nil {
		http.Error(w, "failed to start transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback(ctx)

	var b model.Booking
	err = tx.QueryRow(ctx,
		`INSERT INTO bookings (slot_id, user_id)
		 VALUES ($1, $2)
		 RETURNING id, slot_id, user_id, status, created_at`,
		input.SlotID, userID,
	).Scan(&b.ID, &b.SlotID, &b.UserID, &b.Status, &b.CreatedAt)
	if err != nil {
		http.Error(w, "failed to create booking", http.StatusInternalServerError)
		return
	}

	_, err = tx.Exec(ctx,
		`UPDATE slots SET is_available = FALSE WHERE id = $1`, input.SlotID)
	if err != nil {
		http.Error(w, "failed to update slot", http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(ctx); err != nil {
		http.Error(w, "failed to commit transaction", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(b)
}

func (handler *Handler) confirmBooking(w http.ResponseWriter, r *http.Request) {
	handler.updateBookingStatus(w, r, "confirmed")
}

func (handler *Handler) declineBooking(w http.ResponseWriter, r *http.Request) {
	handler.updateBookingStatus(w, r, "declined")
}

func (handler *Handler) cancelBooking(w http.ResponseWriter, r *http.Request) {
	handler.updateBookingStatus(w, r, "cancelled")
}

func (handler *Handler) updateBookingStatus(w http.ResponseWriter, r *http.Request, status string) {
	id, err := bookingIDFromPath(r.URL.Path)
	if err != nil {
		http.Error(w, "invalid booking id", http.StatusBadRequest)
		return
	}

	var b model.Booking
	err = handler.db.QueryRow(context.Background(),
		`UPDATE bookings SET status = $1 WHERE id = $2
		 RETURNING id, slot_id, user_id, status, created_at`,
		status, id,
	).Scan(&b.ID, &b.SlotID, &b.UserID, &b.Status, &b.CreatedAt)
	if err != nil {
		http.Error(w, "booking not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(b)
}

func bookingIDFromPath(path string) (int, error) {
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) < 2 {
		return 0, strconv.ErrSyntax
	}
	return strconv.Atoi(parts[1])
}
