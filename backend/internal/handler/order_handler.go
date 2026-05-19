package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	appMiddleware "smallc-ecommerce/internal/middleware"
	"smallc-ecommerce/internal/model"
	"smallc-ecommerce/internal/repository"
	"smallc-ecommerce/internal/service"
	"smallc-ecommerce/internal/util"
)

type OrderHandler struct {
	orderService *service.OrderService
}

type checkoutRequest struct {
	Items []model.CheckoutItem `json:"items"`
}

func NewOrderHandler(orderService *service.OrderService) *OrderHandler {
	return &OrderHandler{orderService: orderService}
}

func (h *OrderHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := appMiddleware.CurrentUserID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	orders, err := h.orderService.ListCustomerOrders(r.Context(), userID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "failed to list orders")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]any{"orders": orders})
}

func (h *OrderHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	userID, ok := appMiddleware.CurrentUserID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	orderID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || orderID <= 0 {
		util.WriteError(w, http.StatusBadRequest, "order id must be a positive integer")
		return
	}

	order, err := h.orderService.GetCustomerOrder(r.Context(), userID, orderID)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrOrderValidation):
			util.WriteError(w, http.StatusBadRequest, "order id must be a positive integer")
		case errors.Is(err, repository.ErrOrderNotFound):
			util.WriteError(w, http.StatusNotFound, "order not found")
		case errors.Is(err, service.ErrOrderForbidden):
			util.WriteError(w, http.StatusForbidden, "forbidden")
		default:
			util.WriteError(w, http.StatusInternalServerError, "failed to fetch order")
		}
		return
	}

	util.WriteJSON(w, http.StatusOK, order)
}

func (h *OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	var request checkoutRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	userID, ok := appMiddleware.CurrentUserID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	response, err := h.orderService.CreateOrder(r.Context(), userID, request.Items)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrOrderValidation):
			util.WriteError(w, http.StatusBadRequest, "items must contain positive product_id and quantity values")
		case errors.Is(err, repository.ErrProductNotFound):
			util.WriteError(w, http.StatusNotFound, "one or more products were not found")
		case errors.Is(err, repository.ErrInsufficientStock):
			util.WriteError(w, http.StatusConflict, "insufficient stock for one or more items")
		default:
			util.WriteError(w, http.StatusInternalServerError, "failed to create order")
		}
		return
	}

	util.WriteJSON(w, http.StatusCreated, response)
}
