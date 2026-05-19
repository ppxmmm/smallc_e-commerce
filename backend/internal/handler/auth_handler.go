package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"smallc-ecommerce/internal/repository"
	"smallc-ecommerce/internal/service"
	"smallc-ecommerce/internal/util"
)

type AuthHandler struct {
	authService *service.AuthService
}

type registerRequest struct {
	Name 	string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type userResponse struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var request registerRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	user, err := h.authService.Register(r.Context(), request.Name, request.Email, request.Password, request.Role)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrValidation):
			util.WriteError(w, http.StatusBadRequest, "name, email, password, and role are required")
		case errors.Is(err, service.ErrInvalidRole):
			util.WriteError(w, http.StatusBadRequest, "role must be customer, seller, or admin")
		case errors.Is(err, repository.ErrDuplicateEmail):
			util.WriteError(w, http.StatusConflict, "email already exists")
		default:
			util.WriteError(w, http.StatusInternalServerError, "failed to create user")
		}
		return
	}

	util.WriteJSON(w, http.StatusCreated, userResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Role:  user.Role,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var request loginRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	token, err := h.authService.Login(r.Context(), request.Email, request.Password)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrValidation):
			util.WriteError(w, http.StatusBadRequest, "email and password are required")
		case errors.Is(err, service.ErrInvalidCredentials):
			util.WriteError(w, http.StatusUnauthorized, "invalid email or password")
		default:
			util.WriteError(w, http.StatusInternalServerError, "failed to authenticate user")
		}
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"token": token})
}
