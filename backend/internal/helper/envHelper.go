package helper

import (
	"os"
)

func GetJWTSecret() string {
	return os.Getenv("JWT_SECRET");
}