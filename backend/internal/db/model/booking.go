package model

import "time"

type Booking struct {
	ID        int       `json:"id"`
	SlotID    int       `json:"slot_id"`
	UserName  string    `json:"user_name"`
	UserEmail string    `json:"user_email"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
