package model

import "time"

const (
	RoleCustomer = "customer"
	RoleSeller   = "seller"
	RoleAdmin    = "admin"
)

type User struct {
	ID           int64     `json:"id"`
	Name 		 string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

const (
	OrderStatusPending   = "pending"
	OrderStatusPaid      = "paid"
	OrderStatusFailed    = "failed"
	OrderStatusCancelled = "cancelled"
)

const (
	FulfillmentStatusPending    = "pending"
	FulfillmentStatusProcessing = "processing"
	FulfillmentStatusShipped    = "shipped"
	FulfillmentStatusDelivered  = "delivered"
)

type Product struct {
	ID          int64     `json:"id"`
	SellerID    int64     `json:"seller_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       int64     `json:"price"`
	Stock       int64     `json:"stock"`
	CreatedAt   time.Time `json:"created_at"`
}

type Order struct {
	ID          int64     `json:"id"`
	UserID      int64     `json:"user_id"`
	TotalAmount int64     `json:"total_amount"`
	Status      string    `json:"status"`
	PaymentRef  string    `json:"payment_ref"`
	CreatedAt   time.Time `json:"created_at"`
}

type CheckoutItem struct {
	ProductID int64 `json:"product_id"`
	Quantity  int64 `json:"quantity"`
}

type OrderItemDetail struct {
	ID                int64  `json:"id"`
	ProductID         int64  `json:"product_id"`
	ProductName       string `json:"product_name"`
	SellerID          int64  `json:"seller_id"`
	Quantity          int64  `json:"quantity"`
	PriceAtPurchase   int64  `json:"price_at_purchase"`
	FulfillmentStatus string `json:"fulfillment_status"`
}

type OrderDetail struct {
	ID          int64             `json:"id"`
	UserID      int64             `json:"user_id"`
	TotalAmount int64             `json:"total_amount"`
	Status      string            `json:"status"`
	PaymentRef  string            `json:"payment_ref"`
	CreatedAt   time.Time         `json:"created_at"`
	Items       []OrderItemDetail `json:"items"`
}

type PaymentInstructions struct {
	PaymentRef       string `json:"payment_ref"`
	AutoApprove      bool   `json:"auto_approve"`
	CompleteEndpoint string `json:"complete_endpoint"`
}

type CheckoutResponse struct {
	Order   OrderDetail         `json:"order"`
	Payment PaymentInstructions `json:"payment"`
}

type SellerOrderItem struct {
	ID                int64     `json:"id"`
	OrderID           int64     `json:"order_id"`
	ProductID         int64     `json:"product_id"`
	ProductName       string    `json:"product_name"`
	SellerID          int64     `json:"seller_id"`
	CustomerID        int64     `json:"customer_id"`
	Quantity          int64     `json:"quantity"`
	PriceAtPurchase   int64     `json:"price_at_purchase"`
	OrderStatus       string    `json:"order_status"`
	FulfillmentStatus string    `json:"fulfillment_status"`
	CreatedAt         time.Time `json:"created_at"`
}

type AdminStats struct {
	UserCount      int64 `json:"user_count"`
	CustomerCount  int64 `json:"customer_count"`
	SellerCount    int64 `json:"seller_count"`
	ProductCount   int64 `json:"product_count"`
	OrderCount     int64 `json:"order_count"`
	PaidOrderCount int64 `json:"paid_order_count"`
	GrossRevenue   int64 `json:"gross_revenue"`
}
