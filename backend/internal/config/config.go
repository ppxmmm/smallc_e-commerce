package config

import (
	"errors"
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort                string
	AppEnv                 string
	DBPath                 string
	SchemaPath             string
	JWTSecret              string
	JWTExpiry              time.Duration
	MockPaymentAutoApprove bool
}

func Load() (Config, error) {
	godotenv.Load()
	cfg := Config{
		AppPort:                getEnv("APP_PORT", "8080"),
		AppEnv:                 getEnv("APP_ENV", "development"),
		DBPath:                 getEnv("DB_PATH", "./marketplace.db"),
		SchemaPath:             getEnv("SCHEMA_PATH", "./schema.sql"),
		JWTSecret:              os.Getenv("JWT_SECRET"),
		JWTExpiry:              24 * time.Hour,
		MockPaymentAutoApprove: getEnv("MOCK_PAYMENT_AUTO_APPROVE", "false") == "true",
	}

	if cfg.JWTSecret == "" {
		return Config{}, errors.New("JWT_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	return value
}
