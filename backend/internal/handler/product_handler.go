package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"smallc-ecommerce/internal/repository"
	"smallc-ecommerce/internal/service"
	"smallc-ecommerce/internal/util"
)

type ProductHandler struct {
	productService *service.ProductService
}

func NewProductHandler(productService *service.ProductService) *ProductHandler {
	return &ProductHandler{productService: productService}
}

func (h *ProductHandler) List(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")

	var sellerID *int64
	if rawSellerID := r.URL.Query().Get("seller_id"); rawSellerID != "" {
		parsedSellerID, err := strconv.ParseInt(rawSellerID, 10, 64)
		if err != nil || parsedSellerID <= 0 {
			util.WriteError(w, http.StatusBadRequest, "seller_id must be a positive integer")
			return
		}

		sellerID = &parsedSellerID
	}

	products, err := h.productService.ListProducts(r.Context(), search, sellerID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "failed to list products")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]any{"products": products})
}

func (h *ProductHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	productID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || productID <= 0 {
		util.WriteError(w, http.StatusBadRequest, "product id must be a positive integer")
		return
	}

	product, err := h.productService.GetProduct(r.Context(), productID)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrProductValidation):
			util.WriteError(w, http.StatusBadRequest, "product id must be a positive integer")
		case errors.Is(err, repository.ErrProductNotFound):
			util.WriteError(w, http.StatusNotFound, "product not found")
		default:
			util.WriteError(w, http.StatusInternalServerError, "failed to fetch product")
		}
		return
	}

	util.WriteJSON(w, http.StatusOK, product)
}
