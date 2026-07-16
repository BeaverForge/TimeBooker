package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"regexp"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"time-booker/internal/db/model"
)

var emailRegex = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

func validateEmail(email string) string {
	if len(email) > 255 {
		return "email must be less than 255 characters"
	}
	if !emailRegex.MatchString(email) {
		return "email must be a valid email address"
	}
	return ""
}

func validatePassword(password string) string {
	if len(password) < 8 {
		return "password must be at least 8 characters"
	}
	if len(password) > 32 {
		return "password must be less than 32 characters"
	}
	return ""
}

func validateName(field, value string) string {
	if len(value) == 0 {
		return field + " is required"
	}
	if len(value) > 255 {
		return field + " must be less than 255 characters"
	}
	return ""
}

func validateUserInput(email, password, firstName, lastName string) string {
	if msg := validateEmail(email); msg != "" {
		return msg
	}
	if msg := validatePassword(password); msg != "" {
		return msg
	}
	if msg := validateName("first name", firstName); msg != "" {
		return msg
	}
	if msg := validateName("last name", lastName); msg != "" {
		return msg
	}
	return ""
}

func (handler *Handler) createUser(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email     string `json:"email"`
		Password  string `json:"password"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if msg := validateUserInput(input.Email, input.Password, input.FirstName, input.LastName); msg != "" {
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "failed to hash password", http.StatusInternalServerError)
		return
	}

	var u model.User
	err = handler.db.QueryRow(context.Background(),
		`INSERT INTO users (email, password_hash, first_name, last_name)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, email, first_name, last_name, role, email_verified, created_at`,
		input.Email, hash, input.FirstName, input.LastName,
	).Scan(&u.ID, &u.Email, &u.FirstName, &u.LastName, &u.Role, &u.EmailVerified, &u.CreatedAt)
	if err != nil {
		log.Printf("createUser: db error: %v", err)
		http.Error(w, "failed to create user", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(u)
}

func (handler *Handler) getMe(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("token")
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	token, err := jwt.Parse(cookie.Value, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(handler.jwtSecret), nil
	})
	if err != nil || !token.Valid {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	userID, ok := claims["user_id"].(float64)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var u model.User
	err = handler.db.QueryRow(context.Background(),
		`SELECT id, email, first_name, last_name, role, email_verified, created_at
		 FROM users WHERE id = $1`,
		int(userID),
	).Scan(&u.ID, &u.Email, &u.FirstName, &u.LastName, &u.Role, &u.EmailVerified, &u.CreatedAt)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}
