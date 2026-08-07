package model

import "time"

type Booking struct {
	ID        int       `json:"id"`
	SlotID    int       `json:"slot_id"`
	UserID    int       `json:"user_id"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
