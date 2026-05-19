package main

import (
	"log"
	"net/http"

	"smallc-ecommerce/internal/config"
	"smallc-ecommerce/internal/db"
	"smallc-ecommerce/internal/handler"
	"smallc-ecommerce/internal/repository"
	"smallc-ecommerce/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	database, err := db.Open(cfg.DBPath)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer database.Close()

	if err := db.Migrate(database, cfg.SchemaPath); err != nil {
		log.Fatalf("migrate db: %v", err)
	}

	userRepository := repository.NewUserRepository(database)
	productRepository := repository.NewProductRepository(database)
	orderRepository := repository.NewOrderRepository(database)
	adminRepository := repository.NewAdminRepository(database)
	authService := service.NewAuthService(userRepository, cfg.JWTSecret, cfg.JWTExpiry)
	productService := service.NewProductService(productRepository)
	paymentService := service.NewPaymentService(cfg.MockPaymentAutoApprove)
	orderService := service.NewOrderService(orderRepository, paymentService)
	sellerService := service.NewSellerService(orderRepository)
	adminService := service.NewAdminService(adminRepository)

	router := handler.NewRouter(handler.Dependencies{
		AuthService:    authService,
		ProductService: productService,
		OrderService:   orderService,
		SellerService:  sellerService,
		AdminService:   adminService,
		TokenSecret:    cfg.JWTSecret,
		TokenTTL:       cfg.JWTExpiry,
	})

	addr := ":" + cfg.AppPort
	log.Printf("marketplace api listening on %s", addr)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("server exited: %v", err)
	}
}
