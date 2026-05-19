package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	appMiddleware "smallc-ecommerce/internal/middleware"
	"smallc-ecommerce/internal/repository"
	"smallc-ecommerce/internal/service"
	"smallc-ecommerce/internal/util"
)

type SellerHandler struct {
	productService *service.ProductService
	sellerService  *service.SellerService
}

type productUpsertRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Price       int64  `json:"price"`
	Stock       int64  `json:"stock"`
}

func NewSellerHandler(productService *service.ProductService, sellerService *service.SellerService) *SellerHandler {
	return &SellerHandler{
		productService: productService,
		sellerService:  sellerService,
	}
}

func (h *SellerHandler) Ping(w http.ResponseWriter, r *http.Request) {
	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "seller access granted"})
}

func (h *SellerHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	sellerID, ok := appMiddleware.CurrentUserID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "invalid user context")
		return
	}

	request, ok := h.decodeProductRequest(w, r)
	if !ok {
		return
	}

	product, err := h.productService.CreateProduct(r.Context(), sellerID, request.Name, request.Description, request.Price, request.Stock)
	if err != nil {
		h.writeProductError(w, err, "failed to create product")
		return
	}

	util.WriteJSON(w, http.StatusCreated, product)
}

func (h *SellerHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	sellerID, ok := appMiddleware.CurrentUserID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "invalid user context")
		return
	}

	productID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || productID <= 0 {
		util.WriteError(w, http.StatusBadRequest, "product id must be a positive integer")
		return
	}

	request, ok := h.decodeProductRequest(w, r)
	if !ok {
		return
	}

	product, err := h.productService.UpdateProduct(r.Context(), sellerID, productID, request.Name, request.Description, request.Price, request.Stock)
	if err != nil {
		h.writeProductError(w, err, "failed to update product")
		return
	}

	util.WriteJSON(w, http.StatusOK, product)
}

func (h *SellerHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	sellerID, ok := appMiddleware.CurrentUserID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "invalid user context")
		return
	}

	productID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || productID <= 0 {
		util.WriteError(w, http.StatusBadRequest, "product id must be a positive integer")
		return
	}

	if err := h.productService.DeleteProduct(r.Context(), sellerID, productID); err != nil {
		h.writeProductError(w, err, "failed to delete product")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "product deleted"})
}

func (h *SellerHandler) ListPaidOrderItems(w http.ResponseWriter, r *http.Request) {
	sellerID, ok := appMiddleware.CurrentUserID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "invalid user context")
		return
	}

	items, err := h.sellerService.ListPaidOrderItems(r.Context(), sellerID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "failed to list paid order items")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (h *SellerHandler) ShipOrderItem(w http.ResponseWriter, r *http.Request) {
	sellerID, ok := appMiddleware.CurrentUserID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "invalid user context")
		return
	}

	itemID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || itemID <= 0 {
		util.WriteError(w, http.StatusBadRequest, "order item id must be a positive integer")
		return
	}

	item, err := h.sellerService.ShipOrderItem(r.Context(), sellerID, itemID)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrOrderValidation):
			util.WriteError(w, http.StatusConflict, "order item must belong to a paid order and be pending or processing")
		case errors.Is(err, repository.ErrOrderItemNotFound):
			util.WriteError(w, http.StatusNotFound, "order item not found")
		case errors.Is(err, service.ErrOrderForbidden):
			util.WriteError(w, http.StatusForbidden, "forbidden")
		default:
			util.WriteError(w, http.StatusInternalServerError, "failed to ship order item")
		}
		return
	}

	util.WriteJSON(w, http.StatusOK, item)
}

func (h *SellerHandler) decodeProductRequest(w http.ResponseWriter, r *http.Request) (productUpsertRequest, bool) {
	var request productUpsertRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		util.WriteError(w, http.StatusBadRequest, "invalid json payload")
		return productUpsertRequest{}, false
	}

	return request, true
}

func (h *SellerHandler) writeProductError(w http.ResponseWriter, err error, fallbackMessage string) {
	switch {
	case errors.Is(err, service.ErrProductValidation):
		util.WriteError(w, http.StatusBadRequest, "name is required and price and stock must be zero or greater")
	case errors.Is(err, repository.ErrProductNotFound):
		util.WriteError(w, http.StatusNotFound, "product not found")
	case errors.Is(err, service.ErrProductForbidden):
		util.WriteError(w, http.StatusForbidden, "forbidden")
	default:
		util.WriteError(w, http.StatusInternalServerError, fallbackMessage)
	}
}
