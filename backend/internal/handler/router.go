package handler

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"

	appMiddleware "smallc-ecommerce/internal/middleware"
	"smallc-ecommerce/internal/model"
	"smallc-ecommerce/internal/service"
)

type Dependencies struct {
	AuthService    *service.AuthService
	ProductService *service.ProductService
	OrderService   *service.OrderService
	SellerService  *service.SellerService
	AdminService   *service.AdminService
	TokenSecret    string
	TokenTTL       time.Duration
}

func NewRouter(deps Dependencies) http.Handler {
	authHandler := NewAuthHandler(deps.AuthService)
	productHandler := NewProductHandler(deps.ProductService)
	customerHandler := NewCustomerHandler()
	orderHandler := NewOrderHandler(deps.OrderService)
	paymentHandler := NewPaymentHandler(deps.OrderService)
	sellerHandler := NewSellerHandler(deps.ProductService, deps.SellerService)
	adminHandler := NewAdminHandler(deps.AdminService)
	systemHandler := NewSystemHandler()

	router := chi.NewRouter()
	router.Use(chiMiddleware.Recoverer)
	router.Use(appMiddleware.Logger)
	router.Use(appMiddleware.JSON)

	router.Get("/api/health", systemHandler.Health)

	router.Route("/api/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
	})

	router.Get("/api/products", productHandler.List)
	router.Get("/api/products/{id}", productHandler.GetByID)

	router.Group(func(r chi.Router) {
		r.Use(appMiddleware.Authenticate(deps.TokenSecret, deps.TokenTTL))
		r.Get("/api/me", customerHandler.Me)

		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.RequireRoles(model.RoleCustomer))
			r.Get("/api/customer/ping", customerHandler.Ping)
			r.Get("/api/orders", orderHandler.List)
			r.Get("/api/orders/{id}", orderHandler.GetByID)
			r.Post("/api/orders", orderHandler.Create)
			r.Post("/api/payments/mock/complete", paymentHandler.CompleteMockPayment)
		})

		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.RequireRoles(model.RoleSeller))
			r.Get("/api/seller/ping", sellerHandler.Ping)
			r.Post("/api/seller/products", sellerHandler.CreateProduct)
			r.Put("/api/seller/products/{id}", sellerHandler.UpdateProduct)
			r.Delete("/api/seller/products/{id}", sellerHandler.DeleteProduct)
			r.Get("/api/seller/order-items", sellerHandler.ListPaidOrderItems)
			r.Get("/api/seller/orders", sellerHandler.ListPaidOrderItems)
			r.Post("/api/seller/order-items/{id}/ship", sellerHandler.ShipOrderItem)
			r.Patch("/api/seller/orders/items/{id}/ship", sellerHandler.ShipOrderItem)
		})

		r.Group(func(r chi.Router) {
			r.Use(appMiddleware.RequireRoles(model.RoleAdmin))
			r.Get("/api/admin/ping", adminHandler.Ping)
			r.Get("/api/admin/stats", adminHandler.Stats)
			r.Get("/api/admin/dashboard/stats", adminHandler.Stats)
		})
	})

	return router
}
