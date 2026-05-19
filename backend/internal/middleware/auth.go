package middleware

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"smallc-ecommerce/internal/auth"
	"smallc-ecommerce/internal/util"
)

type contextKey string

const (
	userIDKey   contextKey = "userID"
	userRoleKey contextKey = "userRole"
)

func Authenticate(secret string, ttl time.Duration) func(http.Handler) http.Handler {
	tokenManager := auth.NewTokenManager(secret, ttl)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := strings.TrimSpace(r.Header.Get("Authorization"))
			if !strings.HasPrefix(header, "Bearer ") {
				util.WriteError(w, http.StatusUnauthorized, "missing or invalid authorization header")
				return
			}

			tokenString := strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
			claims, err := tokenManager.ParseToken(tokenString)
			if err != nil {
				util.WriteError(w, http.StatusUnauthorized, "invalid token")
				return
			}

			userID, err := strconv.ParseInt(claims.Subject, 10, 64)
			if err != nil {
				util.WriteError(w, http.StatusUnauthorized, "invalid token subject")
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, userID)
			ctx = context.WithValue(ctx, userRoleKey, claims.Role)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func CurrentUserID(ctx context.Context) (int64, bool) {
	userID, ok := ctx.Value(userIDKey).(int64)
	return userID, ok
}

func CurrentUserRole(ctx context.Context) (string, bool) {
	role, ok := ctx.Value(userRoleKey).(string)
	return role, ok
}
