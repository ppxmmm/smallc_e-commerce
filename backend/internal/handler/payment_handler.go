package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	appMiddleware "smallc-ecommerce/internal/middleware"
	"smallc-ecommerce/internal/repository"
	"smallc-ecommerce/internal/service"
	"smallc-ecommerce/internal/util"
)

type PaymentHandler struct {
	orderService *service.OrderService
}

type paymentCompletionRequest struct {
	OrderID    *int64 `json:"order_id,omitempty"`
	PaymentRef string `json:"payment_ref,omitempty"`
	Status     string `json:"status,omitempty"`
	Outcome    string `json:"outcome"`
}

func NewPaymentHandler(orderService *service.OrderService) *PaymentHandler {
	return &PaymentHandler{orderService: orderService}
}

func (h *PaymentHandler) CompleteMockPayment(w http.ResponseWriter, r *http.Request) {
	var request paymentCompletionRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid json payload")
		return
	}

	userID, ok := appMiddleware.CurrentUserID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "authentication required")
		return
	}

	outcome := request.Outcome
	if outcome == "" {
		outcome = request.Status
	}

	order, err := h.orderService.CompleteMockPayment(r.Context(), userID, request.OrderID, request.PaymentRef, outcome)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrPaymentValidation):
			util.WriteError(w, http.StatusBadRequest, "provide a valid order_id or payment_ref, and status paid or failed")
		case errors.Is(err, repository.ErrOrderNotFound):
			util.WriteError(w, http.StatusNotFound, "order not found")
		case errors.Is(err, service.ErrOrderForbidden):
			util.WriteError(w, http.StatusForbidden, "forbidden")
		case errors.Is(err, service.ErrOrderAlreadyFinalized):
			util.WriteError(w, http.StatusConflict, "order is already finalized")
		default:
			util.WriteError(w, http.StatusInternalServerError, "failed to complete mock payment")
		}
		return
	}

	util.WriteJSON(w, http.StatusOK, order)
}
