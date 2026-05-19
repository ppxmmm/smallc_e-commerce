package handler_test

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strconv"
	"testing"
	"time"

	"smallc-ecommerce/internal/auth"
	"smallc-ecommerce/internal/db"
	"smallc-ecommerce/internal/handler"
	"smallc-ecommerce/internal/model"
	"smallc-ecommerce/internal/repository"
	"smallc-ecommerce/internal/service"
)

type testServer struct {
	db       *sql.DB
	router   http.Handler
	userRepo *repository.UserRepository
}

type authSession struct {
	Token  string
	UserID int64
}

func newTestServer(t *testing.T) *testServer {
	t.Helper()

	dbPath := filepath.Join(t.TempDir(), "test.db")
	database, err := db.Open(dbPath)
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}

	if err := db.Migrate(database, ""); err != nil {
		t.Fatalf("migrate test db: %v", err)
	}

	userRepo := repository.NewUserRepository(database)
	productRepo := repository.NewProductRepository(database)
	orderRepo := repository.NewOrderRepository(database)
	adminRepo := repository.NewAdminRepository(database)

	authService := service.NewAuthService(userRepo, "test-secret", time.Hour)
	productService := service.NewProductService(productRepo)
	paymentService := service.NewPaymentService(false)
	orderService := service.NewOrderService(orderRepo, paymentService)
	sellerService := service.NewSellerService(orderRepo)
	adminService := service.NewAdminService(adminRepo)

	router := handler.NewRouter(handler.Dependencies{
		AuthService:    authService,
		ProductService: productService,
		OrderService:   orderService,
		SellerService:  sellerService,
		AdminService:   adminService,
		TokenSecret:    "test-secret",
		TokenTTL:       time.Hour,
	})

	t.Cleanup(func() {
		_ = database.Close()
	})

	return &testServer{
		db:       database,
		router:   router,
		userRepo: userRepo,
	}
}

func TestRegisterSuccessStoresHashedPassword(t *testing.T) {
	ts := newTestServer(t)

	status, body := doJSONRequest(t, ts.router, http.MethodPost, "/api/auth/register", map[string]string{
		"email":    "customer@example.com",
		"password": "secret123",
		"role":     "customer",
	}, "")

	if status != http.StatusCreated {
		t.Fatalf("expected status %d, got %d with body %s", http.StatusCreated, status, string(body))
	}

	user, err := ts.userRepo.GetByEmail(t.Context(), "customer@example.com")
	if err != nil {
		t.Fatalf("get user by email: %v", err)
	}

	if user.PasswordHash == "secret123" {
		t.Fatalf("expected stored password to be hashed")
	}

	if err := auth.ComparePassword(user.PasswordHash, "secret123"); err != nil {
		t.Fatalf("expected stored hash to match original password: %v", err)
	}
}

func TestProtectedRouteWithWrongRoleFails(t *testing.T) {
	ts := newTestServer(t)

	seller := registerAndLogin(t, ts, "seller@example.com", model.RoleSeller)

	status, responseBody := doJSONRequest(t, ts.router, http.MethodGet, "/api/admin/ping", nil, seller.Token)
	if status != http.StatusForbidden {
		t.Fatalf("expected status %d, got %d with body %s", http.StatusForbidden, status, string(responseBody))
	}
}

func TestPhase3CheckoutCreatesOrderAndDeductsStock(t *testing.T) {
	ts := newTestServer(t)

	sellerOne := registerAndLogin(t, ts, "seller1@example.com", model.RoleSeller)
	sellerTwo := registerAndLogin(t, ts, "seller2@example.com", model.RoleSeller)
	customer := registerAndLogin(t, ts, "customer@example.com", model.RoleCustomer)

	productOne := createProduct(t, ts, sellerOne.Token, "Keyboard", 1500, 10)
	productTwo := createProduct(t, ts, sellerTwo.Token, "Mouse", 900, 8)

	response := createOrder(t, ts, customer.Token, []map[string]any{
		{"product_id": productOne.ID, "quantity": 2},
		{"product_id": productTwo.ID, "quantity": 1},
	})

	if response.Order.Status != model.OrderStatusPending {
		t.Fatalf("expected order status %s, got %s", model.OrderStatusPending, response.Order.Status)
	}

	if response.Order.TotalAmount != 3900 {
		t.Fatalf("expected total amount 3900, got %d", response.Order.TotalAmount)
	}

	if len(response.Order.Items) != 2 {
		t.Fatalf("expected 2 order items, got %d", len(response.Order.Items))
	}

	if response.Payment.PaymentRef == "" {
		t.Fatalf("expected payment ref to be set")
	}

	if got := countRows(t, ts.db, "orders"); got != 1 {
		t.Fatalf("expected 1 order row, got %d", got)
	}

	if got := countRows(t, ts.db, "order_items"); got != 2 {
		t.Fatalf("expected 2 order item rows, got %d", got)
	}

	if got := productStock(t, ts.db, productOne.ID); got != 8 {
		t.Fatalf("expected product one stock 8, got %d", got)
	}

	if got := productStock(t, ts.db, productTwo.ID); got != 7 {
		t.Fatalf("expected product two stock 7, got %d", got)
	}
}

func TestPhase3CheckoutRollsBackOnInsufficientStock(t *testing.T) {
	ts := newTestServer(t)

	sellerOne := registerAndLogin(t, ts, "rollback-seller-1@example.com", model.RoleSeller)
	sellerTwo := registerAndLogin(t, ts, "rollback-seller-2@example.com", model.RoleSeller)
	customer := registerAndLogin(t, ts, "rollback-customer@example.com", model.RoleCustomer)

	productOne := createProduct(t, ts, sellerOne.Token, "Low Stock Item", 500, 1)
	productTwo := createProduct(t, ts, sellerTwo.Token, "Healthy Stock Item", 900, 4)

	status, body := doJSONRequest(t, ts.router, http.MethodPost, "/api/orders", map[string]any{
		"items": []map[string]any{
			{"product_id": productOne.ID, "quantity": 2},
			{"product_id": productTwo.ID, "quantity": 1},
		},
	}, customer.Token)
	if status != http.StatusConflict {
		t.Fatalf("expected status %d, got %d body=%s", http.StatusConflict, status, string(body))
	}

	if got := countRows(t, ts.db, "orders"); got != 0 {
		t.Fatalf("expected no orders to be persisted, got %d", got)
	}

	if got := countRows(t, ts.db, "order_items"); got != 0 {
		t.Fatalf("expected no order items to be persisted, got %d", got)
	}

	if got := productStock(t, ts.db, productOne.ID); got != 1 {
		t.Fatalf("expected product one stock to remain 1, got %d", got)
	}

	if got := productStock(t, ts.db, productTwo.ID); got != 4 {
		t.Fatalf("expected product two stock to remain 4, got %d", got)
	}
}

func TestPhase5SellerFulfillmentAndAdminDashboard(t *testing.T) {
	ts := newTestServer(t)

	sellerOne := registerAndLogin(t, ts, "phase5-seller-1@example.com", model.RoleSeller)
	sellerTwo := registerAndLogin(t, ts, "phase5-seller-2@example.com", model.RoleSeller)
	customer := registerAndLogin(t, ts, "phase5-customer@example.com", model.RoleCustomer)
	admin := registerAndLogin(t, ts, "phase5-admin@example.com", model.RoleAdmin)

	productOne := createProduct(t, ts, sellerOne.Token, "Laptop Stand", 1500, 5)
	productTwo := createProduct(t, ts, sellerTwo.Token, "Desk Lamp", 2200, 4)

	status, body := doJSONRequest(t, ts.router, http.MethodGet, "/api/seller/orders", nil, sellerOne.Token)
	if status != http.StatusOK {
		t.Fatalf("pre-payment seller orders failed with status %d body=%s", status, string(body))
	}

	var emptySellerOrders struct {
		Items []model.SellerOrderItem `json:"items"`
	}
	decodeJSON(t, body, &emptySellerOrders)
	if len(emptySellerOrders.Items) != 0 {
		t.Fatalf("expected no visible seller items before payment, got %d", len(emptySellerOrders.Items))
	}

	checkout := createOrder(t, ts, customer.Token, []map[string]any{
		{"product_id": productOne.ID, "quantity": 2},
		{"product_id": productTwo.ID, "quantity": 1},
	})

	if checkout.Order.TotalAmount != 5200 {
		t.Fatalf("expected total amount 5200, got %d", checkout.Order.TotalAmount)
	}

	status, body = doJSONRequest(t, ts.router, http.MethodPost, "/api/payments/mock/complete", map[string]any{
		"order_id": checkout.Order.ID,
		"status":   model.OrderStatusPaid,
	}, customer.Token)
	if status != http.StatusOK {
		t.Fatalf("complete payment failed with status %d body=%s", status, string(body))
	}

	var paidOrder model.Order
	decodeJSON(t, body, &paidOrder)
	if paidOrder.Status != model.OrderStatusPaid {
		t.Fatalf("expected paid order status, got %s", paidOrder.Status)
	}

	status, body = doJSONRequest(t, ts.router, http.MethodPost, "/api/payments/mock/complete", map[string]any{
		"order_id": checkout.Order.ID,
		"status":   model.OrderStatusPaid,
	}, customer.Token)
	if status != http.StatusConflict {
		t.Fatalf("expected duplicate payment completion to fail with %d, got %d body=%s", http.StatusConflict, status, string(body))
	}

	status, body = doJSONRequest(t, ts.router, http.MethodGet, "/api/seller/orders", nil, sellerOne.Token)
	if status != http.StatusOK {
		t.Fatalf("seller one orders failed with status %d body=%s", status, string(body))
	}

	var sellerOneOrders struct {
		Items []model.SellerOrderItem `json:"items"`
	}
	decodeJSON(t, body, &sellerOneOrders)
	if len(sellerOneOrders.Items) != 1 {
		t.Fatalf("expected seller one to see 1 item, got %d", len(sellerOneOrders.Items))
	}

	if sellerOneOrders.Items[0].ProductID != productOne.ID || sellerOneOrders.Items[0].OrderStatus != model.OrderStatusPaid || sellerOneOrders.Items[0].FulfillmentStatus != model.FulfillmentStatusProcessing {
		t.Fatalf("unexpected seller one item: %+v", sellerOneOrders.Items[0])
	}

	status, body = doJSONRequest(t, ts.router, http.MethodGet, "/api/seller/orders", nil, sellerTwo.Token)
	if status != http.StatusOK {
		t.Fatalf("seller two orders failed with status %d body=%s", status, string(body))
	}

	var sellerTwoOrders struct {
		Items []model.SellerOrderItem `json:"items"`
	}
	decodeJSON(t, body, &sellerTwoOrders)
	if len(sellerTwoOrders.Items) != 1 || sellerTwoOrders.Items[0].ProductID != productTwo.ID {
		t.Fatalf("unexpected seller two items: %+v", sellerTwoOrders.Items)
	}

	status, body = doJSONRequest(t, ts.router, http.MethodPatch, "/api/seller/orders/items/"+strconv.FormatInt(sellerOneOrders.Items[0].ID, 10)+"/ship", nil, sellerTwo.Token)
	if status != http.StatusForbidden {
		t.Fatalf("expected other seller shipping attempt to be forbidden, got %d body=%s", status, string(body))
	}

	status, body = doJSONRequest(t, ts.router, http.MethodPatch, "/api/seller/orders/items/"+strconv.FormatInt(sellerOneOrders.Items[0].ID, 10)+"/ship", nil, sellerOne.Token)
	if status != http.StatusOK {
		t.Fatalf("ship order item failed with status %d body=%s", status, string(body))
	}

	var shippedItem model.SellerOrderItem
	decodeJSON(t, body, &shippedItem)
	if shippedItem.FulfillmentStatus != model.FulfillmentStatusShipped {
		t.Fatalf("expected shipped item status, got %s", shippedItem.FulfillmentStatus)
	}

	status, body = doJSONRequest(t, ts.router, http.MethodGet, "/api/orders/"+strconv.FormatInt(checkout.Order.ID, 10), nil, customer.Token)
	if status != http.StatusOK {
		t.Fatalf("customer order detail failed with status %d body=%s", status, string(body))
	}

	var orderDetail model.OrderDetail
	decodeJSON(t, body, &orderDetail)
	statusByProduct := map[int64]string{}
	for _, item := range orderDetail.Items {
		statusByProduct[item.ProductID] = item.FulfillmentStatus
	}

	if orderDetail.Status != model.OrderStatusPaid || statusByProduct[productOne.ID] != model.FulfillmentStatusShipped || statusByProduct[productTwo.ID] != model.FulfillmentStatusProcessing {
		t.Fatalf("unexpected order detail: %+v", orderDetail)
	}

	status, body = doJSONRequest(t, ts.router, http.MethodGet, "/api/admin/dashboard/stats", nil, admin.Token)
	if status != http.StatusOK {
		t.Fatalf("admin stats failed with status %d body=%s", status, string(body))
	}

	var stats model.AdminStats
	decodeJSON(t, body, &stats)
	if stats.UserCount != 4 || stats.CustomerCount != 1 || stats.SellerCount != 2 || stats.ProductCount != 2 || stats.OrderCount != 1 || stats.PaidOrderCount != 1 || stats.GrossRevenue != 5200 {
		t.Fatalf("unexpected admin stats: %+v", stats)
	}
}

func registerAndLogin(t *testing.T, ts *testServer, email, role string) authSession {
	t.Helper()

	status, body := doJSONRequest(t, ts.router, http.MethodPost, "/api/auth/register", map[string]string{
		"email":    email,
		"password": "secret123",
		"role":     role,
	}, "")
	if status != http.StatusCreated {
		t.Fatalf("register failed for %s with status %d body=%s", email, status, string(body))
	}

	status, body = doJSONRequest(t, ts.router, http.MethodPost, "/api/auth/login", map[string]string{
		"email":    email,
		"password": "secret123",
	}, "")
	if status != http.StatusOK {
		t.Fatalf("login failed for %s with status %d body=%s", email, status, string(body))
	}

	var loginResponse struct {
		Token string `json:"token"`
	}
	decodeJSON(t, body, &loginResponse)

	status, body = doJSONRequest(t, ts.router, http.MethodGet, "/api/me", nil, loginResponse.Token)
	if status != http.StatusOK {
		t.Fatalf("me failed for %s with status %d body=%s", email, status, string(body))
	}

	var meResponse struct {
		UserID int64 `json:"user_id"`
	}
	decodeJSON(t, body, &meResponse)

	return authSession{
		Token:  loginResponse.Token,
		UserID: meResponse.UserID,
	}
}

func createProduct(t *testing.T, ts *testServer, token, name string, price, stock int64) model.Product {
	t.Helper()

	status, body := doJSONRequest(t, ts.router, http.MethodPost, "/api/seller/products", map[string]any{
		"name":        name,
		"description": name + " description",
		"price":       price,
		"stock":       stock,
	}, token)
	if status != http.StatusCreated {
		t.Fatalf("create product failed with status %d body=%s", status, string(body))
	}

	var product model.Product
	decodeJSON(t, body, &product)
	return product
}

func createOrder(t *testing.T, ts *testServer, token string, items []map[string]any) model.CheckoutResponse {
	t.Helper()

	status, body := doJSONRequest(t, ts.router, http.MethodPost, "/api/orders", map[string]any{
		"items": items,
	}, token)
	if status != http.StatusCreated {
		t.Fatalf("create order failed with status %d body=%s", status, string(body))
	}

	var response model.CheckoutResponse
	decodeJSON(t, body, &response)
	return response
}

func countRows(t *testing.T, database *sql.DB, table string) int64 {
	t.Helper()

	var count int64
	if err := database.QueryRow("SELECT COUNT(*) FROM " + table).Scan(&count); err != nil {
		t.Fatalf("count rows in %s: %v", table, err)
	}

	return count
}

func productStock(t *testing.T, database *sql.DB, productID int64) int64 {
	t.Helper()

	var stock int64
	if err := database.QueryRow("SELECT stock FROM products WHERE id = ?", productID).Scan(&stock); err != nil {
		t.Fatalf("get product stock for %d: %v", productID, err)
	}

	return stock
}

func doJSONRequest(t *testing.T, router http.Handler, method, path string, payload any, token string) (int, []byte) {
	t.Helper()

	var body bytes.Buffer
	if payload != nil {
		if err := json.NewEncoder(&body).Encode(payload); err != nil {
			t.Fatalf("encode payload: %v", err)
		}
	}

	req := httptest.NewRequest(method, path, &body)
	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)

	responseBody, err := io.ReadAll(recorder.Result().Body)
	if err != nil {
		t.Fatalf("read response body: %v", err)
	}

	return recorder.Result().StatusCode, responseBody
}

func decodeJSON(t *testing.T, body []byte, target any) {
	t.Helper()

	if err := json.Unmarshal(body, target); err != nil {
		t.Fatalf("decode response body: %v body=%s", err, string(body))
	}
}
