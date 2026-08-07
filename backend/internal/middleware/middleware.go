package middleware

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/golang-jwt/jwt/v5"
)

// contextKey is an unexported type for context keys in this package,
// preventing collisions with keys from other packages.
type contextKey string

const ContextKeyUserID contextKey = "user_id"

// HandleCors adds CORS headers and handles preflight OPTIONS requests.
// Only needed for the local dev server (Vite runs on :5173, API on :8080).
// In production, nginx sits in front and same-origin rules apply.
func HandleCors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// RequireAuth validates the JWT cookie and injects the user_id into the request
// context. Handlers downstream can read it via middleware.ContextKeyUserID.
func RequireAuth(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie("token")
			if err != nil {
				log.Printf("RequireAuth: no token cookie: %v", err)
				http.Error(w, "unauthorized 1", http.StatusUnauthorized)
				return
			}

			token, err := jwt.Parse(cookie.Value, func(t *jwt.Token) (any, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					log.Printf("RequireAuth: unexpected signing method: %v", err)
					return nil, fmt.Errorf("unexpected signing method")
				}
				return []byte(jwtSecret), nil
			})
			if err != nil || !token.Valid {
				log.Printf("RequireAuth: invalid token: %v", err)
				http.Error(w, "unauthorized 2", http.StatusUnauthorized)
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				log.Printf("RequireAuth: claims assertion failed")
				http.Error(w, "unauthorized 3", http.StatusUnauthorized)
				return
			}

			userID, ok := claims["user_id"].(float64)
			if !ok {
				log.Printf("RequireAuth: user_id claim missing or wrong type: %v", claims)
				http.Error(w, "unauthorized 4", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), ContextKeyUserID, int(userID))
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}