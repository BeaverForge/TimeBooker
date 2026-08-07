package api

import (
	"net/http"
	"time-booker/internal/helper"
	"time-booker/internal/middleware"

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
	auth := middleware.RequireAuth(handler.jwtSecret)

	mux.Handle("GET /slots", auth(http.HandlerFunc(handler.listSlots)))
	mux.Handle("POST /slots", auth(http.HandlerFunc(handler.createSlot)))
	mux.Handle("POST /bookings", auth(http.HandlerFunc(handler.createBooking)))
	mux.Handle("PUT /bookings/{id}/confirm", auth(http.HandlerFunc(handler.confirmBooking)))
	mux.Handle("PUT /bookings/{id}/decline", auth(http.HandlerFunc(handler.declineBooking)))
	mux.Handle("PUT /bookings/{id}/cancel", auth(http.HandlerFunc(handler.cancelBooking)))
	mux.Handle("GET /users/me", auth(http.HandlerFunc(handler.getMe)))
	mux.HandleFunc("POST /users", handler.createUser)
	mux.HandleFunc("POST /login", handler.login)
	mux.HandleFunc("POST /logout", handler.logout)
}
