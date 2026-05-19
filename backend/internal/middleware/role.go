package middleware

import (
	"net/http"

	"smallc-ecommerce/internal/util"
)

func RequireRoles(allowedRoles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(allowedRoles))
	for _, role := range allowedRoles {
		allowed[role] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := CurrentUserRole(r.Context())
			if !ok {
				util.WriteError(w, http.StatusUnauthorized, "authentication required")
				return
			}

			if _, exists := allowed[role]; !exists {
				util.WriteError(w, http.StatusForbidden, "forbidden")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
