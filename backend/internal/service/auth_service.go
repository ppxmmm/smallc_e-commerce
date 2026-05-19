package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"smallc-ecommerce/internal/auth"
	"smallc-ecommerce/internal/model"
	"smallc-ecommerce/internal/repository"
)

var ErrInvalidCredentials = errors.New("invalid credentials")
var ErrInvalidRole = errors.New("invalid role")
var ErrValidation = errors.New("validation error")
var ErrProductValidation = errors.New("product validation error")
var ErrProductForbidden = errors.New("product forbidden")
var ErrOrderValidation = errors.New("order validation error")
var ErrOrderForbidden = errors.New("order forbidden")
var ErrOrderAlreadyFinalized = errors.New("order already finalized")
var ErrPaymentValidation = errors.New("payment validation error")

type AuthService struct {
	userRepository *repository.UserRepository
	tokenManager   *auth.TokenManager
}

func NewAuthService(userRepository *repository.UserRepository, jwtSecret string, jwtTTL time.Duration) *AuthService {
	return &AuthService{
		userRepository: userRepository,
		tokenManager:   auth.NewTokenManager(jwtSecret, jwtTTL),
	}
}

func (s *AuthService) Register(ctx context.Context, name, email, password, role string) (*model.User, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	role = strings.TrimSpace(strings.ToLower(role))

	if name == "" || email == "" || password == "" || role == "" {
		return nil, ErrValidation
	}

	if !isValidRole(role) {
		return nil, ErrInvalidRole
	}

	passwordHash, err := auth.HashPassword(password)
	if err != nil {
		return nil, err
	}

	return s.userRepository.Create(ctx, name, email, passwordHash, role)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" || password == "" {
		return "", ErrValidation
	}

	user, err := s.userRepository.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return "", ErrInvalidCredentials
		}

		return "", err
	}

	if err := auth.ComparePassword(user.PasswordHash, password); err != nil {
		return "", ErrInvalidCredentials
	}

	return s.tokenManager.GenerateToken(user.ID, user.Role)
}

func isValidRole(role string) bool {
	switch role {
	case model.RoleCustomer, model.RoleSeller, model.RoleAdmin:
		return true
	default:
		return false
	}
}

type ProductService struct {
	productRepository *repository.ProductRepository
}

func NewProductService(productRepository *repository.ProductRepository) *ProductService {
	return &ProductService{productRepository: productRepository}
}

func (s *ProductService) ListProducts(ctx context.Context, search string, sellerID *int64) ([]model.Product, error) {
	search = strings.TrimSpace(search)
	return s.productRepository.List(ctx, repository.ProductFilters{
		Search:   search,
		SellerID: sellerID,
	})
}

func (s *ProductService) GetProduct(ctx context.Context, productID int64) (*model.Product, error) {
	if productID <= 0 {
		return nil, ErrProductValidation
	}

	return s.productRepository.GetByID(ctx, productID)
}

func (s *ProductService) CreateProduct(ctx context.Context, sellerID int64, input model.ProductInput) (*model.Product, error) {
	normalizedInput, err := normalizeProductInput(input)
	if err != nil || sellerID <= 0 {
		return nil, ErrProductValidation
	}

	return s.productRepository.Create(ctx, sellerID, normalizedInput)
}

func (s *ProductService) UpdateProduct(ctx context.Context, sellerID, productID int64, input model.ProductInput) (*model.Product, error) {
	normalizedInput, err := normalizeProductInput(input)
	if err != nil || sellerID <= 0 || productID <= 0 {
		return nil, ErrProductValidation
	}

	product, err := s.productRepository.GetByID(ctx, productID)
	if err != nil {
		return nil, err
	}

	if product.SellerID != sellerID {
		return nil, ErrProductForbidden
	}

	return s.productRepository.Update(ctx, productID, normalizedInput)
}

func (s *ProductService) DeleteProduct(ctx context.Context, sellerID, productID int64) error {
	if sellerID <= 0 || productID <= 0 {
		return ErrProductValidation
	}

	product, err := s.productRepository.GetByID(ctx, productID)
	if err != nil {
		return err
	}

	if product.SellerID != sellerID {
		return ErrProductForbidden
	}

	return s.productRepository.Delete(ctx, productID)
}

func normalizeProductInput(input model.ProductInput) (model.ProductInput, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Description = strings.TrimSpace(input.Description)
	input.Category = strings.TrimSpace(input.Category)
	input.Brand = strings.TrimSpace(input.Brand)
	input.Tone = strings.TrimSpace(input.Tone)
	input.Subtitle = strings.TrimSpace(input.Subtitle)
	input.Image = strings.TrimSpace(input.Image)
	input.Delivery = strings.TrimSpace(input.Delivery)

	if input.Name == "" || input.Price < 0 || input.Stock < 0 || input.Rating < 0 || input.Rating > 5 {
		return model.ProductInput{}, ErrProductValidation
	}

	if input.Original != nil {
		original := *input.Original
		if original < 0 {
			return model.ProductInput{}, ErrProductValidation
		}

		input.Original = &original
	}

	input.Features = normalizeStringList(input.Features)
	input.Highlights = normalizeStringList(input.Highlights)

	specifications, err := normalizeSpecifications(input.Specifications)
	if err != nil {
		return model.ProductInput{}, ErrProductValidation
	}
	input.Specifications = specifications

	return input, nil
}

func normalizeStringList(values []string) []string {
	if len(values) == 0 {
		return []string{}
	}

	normalized := make([]string, 0, len(values))
	for _, value := range values {
		trimmed := strings.TrimSpace(value)
		if trimmed == "" {
			continue
		}

		normalized = append(normalized, trimmed)
	}

	return normalized
}

func normalizeSpecifications(values [][]string) ([][]string, error) {
	if len(values) == 0 {
		return [][]string{}, nil
	}

	normalized := make([][]string, 0, len(values))
	for _, pair := range values {
		if len(pair) != 2 {
			return nil, ErrProductValidation
		}

		label := strings.TrimSpace(pair[0])
		value := strings.TrimSpace(pair[1])
		if label == "" || value == "" {
			return nil, ErrProductValidation
		}

		normalized = append(normalized, []string{label, value})
	}

	return normalized, nil
}

type PaymentService struct {
	autoApprove bool
}

func NewPaymentService(autoApprove bool) *PaymentService {
	return &PaymentService{autoApprove: autoApprove}
}

func (s *PaymentService) NewReference() string {
	return fmt.Sprintf("mock_%d", time.Now().UnixNano())
}

func (s *PaymentService) AutoApprove() bool {
	return s.autoApprove
}

func (s *PaymentService) Instructions(paymentRef string) model.PaymentInstructions {
	return model.PaymentInstructions{
		PaymentRef:       paymentRef,
		AutoApprove:      s.autoApprove,
		CompleteEndpoint: "/api/payments/mock/complete",
	}
}

type CheckoutItemInput struct {
	ProductID int64 `json:"product_id"`
	Quantity  int64 `json:"quantity"`
}

type OrderService struct {
	orderRepository *repository.OrderRepository
	paymentService  *PaymentService
}

func NewOrderService(orderRepository *repository.OrderRepository, paymentService *PaymentService) *OrderService {
	return &OrderService{
		orderRepository: orderRepository,
		paymentService:  paymentService,
	}
}

func (s *OrderService) CreateOrder(ctx context.Context, userID int64, items []model.CheckoutItem) (*model.CheckoutResponse, error) {
	if userID <= 0 {
		return nil, ErrOrderValidation
	}

	normalizedItems, err := normalizeCheckoutItems(items)
	if err != nil {
		return nil, err
	}

	paymentRef := s.paymentService.NewReference()
	order, err := s.orderRepository.CreatePendingOrder(ctx, userID, normalizedItems, paymentRef)
	if err != nil {
		return nil, err
	}

	if s.paymentService.AutoApprove() {
		if _, err := s.completePayment(ctx, userID, order.ID, paymentRef, model.OrderStatusPaid); err != nil {
			return nil, err
		}

		order, err = s.orderRepository.GetOrderDetail(ctx, order.ID)
		if err != nil {
			return nil, err
		}
	}

	return &model.CheckoutResponse{
		Order:   *order,
		Payment: s.paymentService.Instructions(paymentRef),
	}, nil
}

func (s *OrderService) ListCustomerOrders(ctx context.Context, userID int64) ([]model.OrderDetail, error) {
	if userID <= 0 {
		return nil, ErrOrderValidation
	}

	return s.orderRepository.ListCustomerOrders(ctx, userID)
}

func (s *OrderService) GetCustomerOrder(ctx context.Context, userID, orderID int64) (*model.OrderDetail, error) {
	if userID <= 0 || orderID <= 0 {
		return nil, ErrOrderValidation
	}

	order, err := s.orderRepository.GetOrderDetail(ctx, orderID)
	if err != nil {
		return nil, err
	}

	if order.UserID != userID {
		return nil, ErrOrderForbidden
	}

	return order, nil
}

func (s *OrderService) CompleteMockPayment(ctx context.Context, userID int64, orderID *int64, paymentRef, outcome string) (*model.Order, error) {
	if userID <= 0 {
		return nil, ErrPaymentValidation
	}

	outcome = strings.TrimSpace(strings.ToLower(outcome))
	if outcome != model.OrderStatusPaid && outcome != model.OrderStatusFailed {
		return nil, ErrPaymentValidation
	}

	if orderID == nil && strings.TrimSpace(paymentRef) == "" {
		return nil, ErrPaymentValidation
	}

	resolvedOrderID := int64(0)
	if orderID != nil {
		resolvedOrderID = *orderID
		if resolvedOrderID <= 0 {
			return nil, ErrPaymentValidation
		}
	}

	return s.completePayment(ctx, userID, resolvedOrderID, strings.TrimSpace(paymentRef), outcome)
}

func (s *OrderService) completePayment(ctx context.Context, userID, orderID int64, paymentRef, outcome string) (*model.Order, error) {
	var (
		order *model.Order
		err   error
	)

	if orderID > 0 {
		order, err = s.orderRepository.GetOrderByID(ctx, orderID)
	} else {
		order, err = s.orderRepository.GetOrderByPaymentRef(ctx, paymentRef)
	}
	if err != nil {
		return nil, err
	}

	if order.UserID != userID {
		return nil, ErrOrderForbidden
	}

	if order.Status != model.OrderStatusPending {
		return nil, ErrOrderAlreadyFinalized
	}

	updatedOrder, err := s.orderRepository.UpdateOrderStatus(ctx, order.ID, outcome)
	if err != nil {
		return nil, err
	}

	if outcome == model.OrderStatusPaid {
		if err := s.orderRepository.UpdateOrderItemsStatus(ctx, order.ID, []string{model.FulfillmentStatusPending}, model.FulfillmentStatusProcessing); err != nil {
			return nil, err
		}
	}

	return updatedOrder, nil
}

func normalizeCheckoutItems(items []model.CheckoutItem) ([]model.CheckoutItem, error) {
	if len(items) == 0 {
		return nil, ErrOrderValidation
	}

	normalized := make([]model.CheckoutItem, 0, len(items))
	indexByProductID := make(map[int64]int, len(items))

	for _, item := range items {
		if item.ProductID <= 0 || item.Quantity <= 0 {
			return nil, ErrOrderValidation
		}

		if index, exists := indexByProductID[item.ProductID]; exists {
			normalized[index].Quantity += item.Quantity
			continue
		}

		indexByProductID[item.ProductID] = len(normalized)
		normalized = append(normalized, model.CheckoutItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
		})
	}

	return normalized, nil
}

type SellerService struct {
	orderRepository *repository.OrderRepository
}

func NewSellerService(orderRepository *repository.OrderRepository) *SellerService {
	return &SellerService{orderRepository: orderRepository}
}

func (s *SellerService) ListPaidOrderItems(ctx context.Context, sellerID int64) ([]model.SellerOrderItem, error) {
	if sellerID <= 0 {
		return nil, ErrOrderValidation
	}

	return s.orderRepository.ListSellerPaidItems(ctx, sellerID)
}

func (s *SellerService) ShipOrderItem(ctx context.Context, sellerID, itemID int64) (*model.SellerOrderItem, error) {
	if sellerID <= 0 || itemID <= 0 {
		return nil, ErrOrderValidation
	}

	item, err := s.orderRepository.GetSellerOrderItem(ctx, itemID)
	if err != nil {
		return nil, err
	}

	if item.SellerID != sellerID {
		return nil, ErrOrderForbidden
	}

	if item.OrderStatus != model.OrderStatusPaid {
		return nil, ErrOrderValidation
	}

	if item.FulfillmentStatus != model.FulfillmentStatusPending && item.FulfillmentStatus != model.FulfillmentStatusProcessing {
		return nil, ErrOrderValidation
	}

	return s.orderRepository.UpdateOrderItemStatus(ctx, itemID, model.FulfillmentStatusShipped)
}

type AdminService struct {
	adminRepository *repository.AdminRepository
}

func NewAdminService(adminRepository *repository.AdminRepository) *AdminService {
	return &AdminService{adminRepository: adminRepository}
}

func (s *AdminService) GetStats(ctx context.Context) (*model.AdminStats, error) {
	return s.adminRepository.GetStats(ctx)
}
