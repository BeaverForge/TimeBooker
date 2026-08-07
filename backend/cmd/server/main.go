package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"time-booker/internal/api"
	"time-booker/internal/db"
	"time-booker/internal/middleware"
)

func main() {
	connString := os.Getenv("DATABASE_URL")
	if connString == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	ctx := context.Background()
	pool, err := db.Connect(ctx, connString)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	mux := http.NewServeMux()
	handler := api.NewHandler(pool)
	handler.RegisterRoutes(mux)

	log.Println("Server starting on :8080")
	if err := http.ListenAndServe(":8080", middleware.HandleCors(mux)); err != nil {
		log.Fatal(err)
	}
}
