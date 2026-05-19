package handler

import (
	"net/http"

	"smallc-ecommerce/internal/service"
	"smallc-ecommerce/internal/util"
)

type AdminHandler struct {
	adminService *service.AdminService
}

func NewAdminHandler(adminService *service.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

func (h *AdminHandler) Ping(w http.ResponseWriter, r *http.Request) {
	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "admin access granted"})
}

func (h *AdminHandler) Stats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.adminService.GetStats(r.Context())
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "failed to load admin stats")
		return
	}

	util.WriteJSON(w, http.StatusOK, stats)
}
