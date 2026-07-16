package api

import (
	"net/http"
	"time-booker/internal/helper"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Handler struct {
	db        *pgxpool.Pool
	jwtSecret string
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{db: db, jwtSecret: helper.GetJWTSecret()}
}

func (handler *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /slots", handler.listSlots)
	mux.HandleFunc("POST /slots", handler.createSlot)
	mux.HandleFunc("POST /bookings", handler.createBooking)
	mux.HandleFunc("PUT /bookings/{id}/confirm", handler.confirmBooking)
	mux.HandleFunc("PUT /bookings/{id}/decline", handler.declineBooking)
	mux.HandleFunc("PUT /bookings/{id}/cancel", handler.cancelBooking)
	mux.HandleFunc("POST /users", handler.createUser)
	mux.HandleFunc("GET /users/me", handler.getMe)
	mux.HandleFunc("POST /login", handler.login)
	mux.HandleFunc("POST /logout", handler.logout)
}
