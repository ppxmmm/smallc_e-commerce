package handler

import (
	"net/http"

	appMiddleware "smallc-ecommerce/internal/middleware"
	"smallc-ecommerce/internal/util"
)

type CustomerHandler struct{}

func NewCustomerHandler() *CustomerHandler {
	return &CustomerHandler{}
}

func (h *CustomerHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, _ := appMiddleware.CurrentUserID(r.Context())
	role, _ := appMiddleware.CurrentUserRole(r.Context())

	util.WriteJSON(w, http.StatusOK, map[string]any{
		"user_id": userID,
		"role":    role,
	})
}

func (h *CustomerHandler) Ping(w http.ResponseWriter, r *http.Request) {
	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "customer access granted"})
}
