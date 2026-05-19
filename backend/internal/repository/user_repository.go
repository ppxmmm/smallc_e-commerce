package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/mattn/go-sqlite3"

	"smallc-ecommerce/internal/model"
)

var ErrUserNotFound = errors.New("user not found")
var ErrDuplicateEmail = errors.New("duplicate email")
var ErrProductNotFound = errors.New("product not found")
var ErrOrderNotFound = errors.New("order not found")
var ErrOrderItemNotFound = errors.New("order item not found")
var ErrInsufficientStock = errors.New("insufficient stock")

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, name,email, passwordHash, role string) (*model.User, error) {
	query := `
		INSERT INTO users (name, email, password_hash, role)
		VALUES (?, ?, ?, ?)
		RETURNING id, name, email, password_hash, role, created_at
	`

	user := &model.User{}
	err := r.db.QueryRowContext(ctx, query, name, email, passwordHash, role).
		Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.Role, &user.CreatedAt)
	if err != nil {
		var sqliteErr sqlite3.Error
		if errors.As(err, &sqliteErr) && sqliteErr.ExtendedCode == sqlite3.ErrConstraintUnique {
			return nil, ErrDuplicateEmail
		}

		return nil, fmt.Errorf("create user: %w", err)
	}

	return user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	query := `
		SELECT id, name, email, password_hash, role, created_at
		FROM users
		WHERE email = ?
	`

	user := &model.User{}
	err := r.db.QueryRowContext(ctx, query, email).
		Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.Role, &user.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}

		return nil, fmt.Errorf("get user by email: %w", err)
	}

	return user, nil
}

type ProductFilters struct {
	Search   string
	SellerID *int64
}

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) List(ctx context.Context, filters ProductFilters) ([]model.Product, error) {
	query := `
		SELECT id, seller_id, name, COALESCE(description, ''), price, stock, created_at
		FROM products
		WHERE 1 = 1
	`

	args := make([]any, 0, 2)
	if filters.Search != "" {
		query += ` AND (LOWER(name) LIKE ? OR LOWER(COALESCE(description, '')) LIKE ?)`
		search := "%" + strings.ToLower(filters.Search) + "%"
		args = append(args, search, search)
	}

	if filters.SellerID != nil {
		query += ` AND seller_id = ?`
		args = append(args, *filters.SellerID)
	}

	query += ` ORDER BY created_at DESC, id DESC`

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list products: %w", err)
	}
	defer rows.Close()

	products := make([]model.Product, 0)
	for rows.Next() {
		var product model.Product
		if err := rows.Scan(
			&product.ID,
			&product.SellerID,
			&product.Name,
			&product.Description,
			&product.Price,
			&product.Stock,
			&product.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan product: %w", err)
		}

		products = append(products, product)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate products: %w", err)
	}

	return products, nil
}

func (r *ProductRepository) GetByID(ctx context.Context, productID int64) (*model.Product, error) {
	product := &model.Product{}
	err := r.db.QueryRowContext(
		ctx,
		`SELECT id, seller_id, name, COALESCE(description, ''), price, stock, created_at
		 FROM products
		 WHERE id = ?`,
		productID,
	).Scan(
		&product.ID,
		&product.SellerID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.Stock,
		&product.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrProductNotFound
		}

		return nil, fmt.Errorf("get product by id: %w", err)
	}

	return product, nil
}

func (r *ProductRepository) Create(ctx context.Context, sellerID int64, name, description string, price, stock int64) (*model.Product, error) {
	product := &model.Product{}
	err := r.db.QueryRowContext(
		ctx,
		`INSERT INTO products (seller_id, name, description, price, stock)
		 VALUES (?, ?, ?, ?, ?)
		 RETURNING id, seller_id, name, COALESCE(description, ''), price, stock, created_at`,
		sellerID,
		name,
		description,
		price,
		stock,
	).Scan(
		&product.ID,
		&product.SellerID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.Stock,
		&product.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("create product: %w", err)
	}

	return product, nil
}

func (r *ProductRepository) Update(ctx context.Context, productID int64, name, description string, price, stock int64) (*model.Product, error) {
	product := &model.Product{}
	err := r.db.QueryRowContext(
		ctx,
		`UPDATE products
		 SET name = ?, description = ?, price = ?, stock = ?
		 WHERE id = ?
		 RETURNING id, seller_id, name, COALESCE(description, ''), price, stock, created_at`,
		name,
		description,
		price,
		stock,
		productID,
	).Scan(
		&product.ID,
		&product.SellerID,
		&product.Name,
		&product.Description,
		&product.Price,
		&product.Stock,
		&product.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrProductNotFound
		}

		return nil, fmt.Errorf("update product: %w", err)
	}

	return product, nil
}

func (r *ProductRepository) Delete(ctx context.Context, productID int64) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM products WHERE id = ?`, productID)
	if err != nil {
		return fmt.Errorf("delete product: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("delete product rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return ErrProductNotFound
	}

	return nil
}

type OrderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) CreatePendingOrder(ctx context.Context, userID int64, items []model.CheckoutItem, paymentRef string) (*model.OrderDetail, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin order transaction: %w", err)
	}

	type productSnapshot struct {
		ID       int64
		SellerID int64
		Name     string
		Price    int64
		Stock    int64
		Quantity int64
	}

	snapshots := make([]productSnapshot, 0, len(items))
	var totalAmount int64

	for _, item := range items {
		var snapshot productSnapshot
		err := tx.QueryRowContext(
			ctx,
			`SELECT id, seller_id, name, price, stock FROM products WHERE id = ?`,
			item.ProductID,
		).Scan(&snapshot.ID, &snapshot.SellerID, &snapshot.Name, &snapshot.Price, &snapshot.Stock)
		if err != nil {
			_ = tx.Rollback()
			if errors.Is(err, sql.ErrNoRows) {
				return nil, ErrProductNotFound
			}

			return nil, fmt.Errorf("load product: %w", err)
		}

		if snapshot.Stock < item.Quantity {
			_ = tx.Rollback()
			return nil, ErrInsufficientStock
		}

		snapshot.Quantity = item.Quantity
		totalAmount += snapshot.Price * item.Quantity
		snapshots = append(snapshots, snapshot)
	}

	order := &model.OrderDetail{}
	err = tx.QueryRowContext(
		ctx,
		`INSERT INTO orders (user_id, total_amount, status, payment_ref)
		 VALUES (?, ?, ?, ?)
		 RETURNING id, user_id, total_amount, status, payment_ref, created_at`,
		userID,
		totalAmount,
		model.OrderStatusPending,
		paymentRef,
	).Scan(
		&order.ID,
		&order.UserID,
		&order.TotalAmount,
		&order.Status,
		&order.PaymentRef,
		&order.CreatedAt,
	)
	if err != nil {
		_ = tx.Rollback()
		return nil, fmt.Errorf("create order: %w", err)
	}

	order.Items = make([]model.OrderItemDetail, 0, len(snapshots))
	for _, snapshot := range snapshots {
		var itemDetail model.OrderItemDetail
		err := tx.QueryRowContext(
			ctx,
			`INSERT INTO order_items (order_id, product_id, seller_id, quantity, price_at_purchase, fulfillment_status)
			 VALUES (?, ?, ?, ?, ?, ?)
			 RETURNING id, product_id, seller_id, quantity, price_at_purchase, fulfillment_status`,
			order.ID,
			snapshot.ID,
			snapshot.SellerID,
			snapshot.Quantity,
			snapshot.Price,
			model.FulfillmentStatusPending,
		).Scan(
			&itemDetail.ID,
			&itemDetail.ProductID,
			&itemDetail.SellerID,
			&itemDetail.Quantity,
			&itemDetail.PriceAtPurchase,
			&itemDetail.FulfillmentStatus,
		)
		if err != nil {
			_ = tx.Rollback()
			return nil, fmt.Errorf("create order item: %w", err)
		}

		itemDetail.ProductName = snapshot.Name
		order.Items = append(order.Items, itemDetail)

		if _, err := tx.ExecContext(ctx, `UPDATE products SET stock = stock - ? WHERE id = ?`, snapshot.Quantity, snapshot.ID); err != nil {
			_ = tx.Rollback()
			return nil, fmt.Errorf("deduct stock: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit order transaction: %w", err)
	}

	return order, nil
}

func (r *OrderRepository) GetOrderDetail(ctx context.Context, orderID int64) (*model.OrderDetail, error) {
	order := &model.OrderDetail{}
	err := r.db.QueryRowContext(
		ctx,
		`SELECT id, user_id, total_amount, status, payment_ref, created_at
		 FROM orders
		 WHERE id = ?`,
		orderID,
	).Scan(
		&order.ID,
		&order.UserID,
		&order.TotalAmount,
		&order.Status,
		&order.PaymentRef,
		&order.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrOrderNotFound
		}

		return nil, fmt.Errorf("get order detail: %w", err)
	}

	items, err := r.listOrderItems(ctx, orderID)
	if err != nil {
		return nil, err
	}
	order.Items = items

	return order, nil
}

func (r *OrderRepository) ListCustomerOrders(ctx context.Context, userID int64) ([]model.OrderDetail, error) {
	rows, err := r.db.QueryContext(
		ctx,
		`SELECT id, user_id, total_amount, status, payment_ref, created_at
		 FROM orders
		 WHERE user_id = ?
		 ORDER BY created_at DESC, id DESC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("list customer orders: %w", err)
	}
	defer rows.Close()

	orders := make([]model.OrderDetail, 0)
	for rows.Next() {
		var order model.OrderDetail
		if err := rows.Scan(
			&order.ID,
			&order.UserID,
			&order.TotalAmount,
			&order.Status,
			&order.PaymentRef,
			&order.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan customer order: %w", err)
		}

		items, err := r.listOrderItems(ctx, order.ID)
		if err != nil {
			return nil, err
		}

		order.Items = items
		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate customer orders: %w", err)
	}

	return orders, nil
}

func (r *OrderRepository) GetOrderByID(ctx context.Context, orderID int64) (*model.Order, error) {
	order := &model.Order{}
	err := r.db.QueryRowContext(
		ctx,
		`SELECT id, user_id, total_amount, status, payment_ref, created_at
		 FROM orders
		 WHERE id = ?`,
		orderID,
	).Scan(
		&order.ID,
		&order.UserID,
		&order.TotalAmount,
		&order.Status,
		&order.PaymentRef,
		&order.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrOrderNotFound
		}

		return nil, fmt.Errorf("get order by id: %w", err)
	}

	return order, nil
}

func (r *OrderRepository) GetOrderByPaymentRef(ctx context.Context, paymentRef string) (*model.Order, error) {
	order := &model.Order{}
	err := r.db.QueryRowContext(
		ctx,
		`SELECT id, user_id, total_amount, status, payment_ref, created_at
		 FROM orders
		 WHERE payment_ref = ?`,
		paymentRef,
	).Scan(
		&order.ID,
		&order.UserID,
		&order.TotalAmount,
		&order.Status,
		&order.PaymentRef,
		&order.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrOrderNotFound
		}

		return nil, fmt.Errorf("get order by payment ref: %w", err)
	}

	return order, nil
}

func (r *OrderRepository) UpdateOrderStatus(ctx context.Context, orderID int64, status string) (*model.Order, error) {
	order := &model.Order{}
	err := r.db.QueryRowContext(
		ctx,
		`UPDATE orders
		 SET status = ?
		 WHERE id = ?
		 RETURNING id, user_id, total_amount, status, payment_ref, created_at`,
		status,
		orderID,
	).Scan(
		&order.ID,
		&order.UserID,
		&order.TotalAmount,
		&order.Status,
		&order.PaymentRef,
		&order.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrOrderNotFound
		}

		return nil, fmt.Errorf("update order status: %w", err)
	}

	return order, nil
}

func (r *OrderRepository) UpdateOrderItemsStatus(ctx context.Context, orderID int64, fromStatuses []string, toStatus string) error {
	if len(fromStatuses) == 0 {
		return nil
	}

	placeholders := strings.TrimSuffix(strings.Repeat("?,", len(fromStatuses)), ",")
	args := make([]any, 0, len(fromStatuses)+2)
	args = append(args, toStatus, orderID)
	for _, status := range fromStatuses {
		args = append(args, status)
	}

	query := fmt.Sprintf(
		`UPDATE order_items
		 SET fulfillment_status = ?
		 WHERE order_id = ?
		 AND fulfillment_status IN (%s)`,
		placeholders,
	)

	if _, err := r.db.ExecContext(ctx, query, args...); err != nil {
		return fmt.Errorf("update order item statuses: %w", err)
	}

	return nil
}

func (r *OrderRepository) ListSellerPaidItems(ctx context.Context, sellerID int64) ([]model.SellerOrderItem, error) {
	rows, err := r.db.QueryContext(
		ctx,
		`SELECT oi.id, oi.order_id, oi.product_id, p.name, oi.seller_id, o.user_id,
		        oi.quantity, oi.price_at_purchase, o.status, oi.fulfillment_status, o.created_at
		 FROM order_items oi
		 JOIN orders o ON o.id = oi.order_id
		 JOIN products p ON p.id = oi.product_id
		 WHERE oi.seller_id = ? AND o.status = ?
		 ORDER BY o.created_at DESC, oi.id DESC`,
		sellerID,
		model.OrderStatusPaid,
	)
	if err != nil {
		return nil, fmt.Errorf("list seller paid items: %w", err)
	}
	defer rows.Close()

	items := make([]model.SellerOrderItem, 0)
	for rows.Next() {
		var item model.SellerOrderItem
		if err := rows.Scan(
			&item.ID,
			&item.OrderID,
			&item.ProductID,
			&item.ProductName,
			&item.SellerID,
			&item.CustomerID,
			&item.Quantity,
			&item.PriceAtPurchase,
			&item.OrderStatus,
			&item.FulfillmentStatus,
			&item.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan seller paid item: %w", err)
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate seller paid items: %w", err)
	}

	return items, nil
}

func (r *OrderRepository) GetSellerOrderItem(ctx context.Context, itemID int64) (*model.SellerOrderItem, error) {
	item := &model.SellerOrderItem{}
	err := r.db.QueryRowContext(
		ctx,
		`SELECT oi.id, oi.order_id, oi.product_id, p.name, oi.seller_id, o.user_id,
		        oi.quantity, oi.price_at_purchase, o.status, oi.fulfillment_status, o.created_at
		 FROM order_items oi
		 JOIN orders o ON o.id = oi.order_id
		 JOIN products p ON p.id = oi.product_id
		 WHERE oi.id = ?`,
		itemID,
	).Scan(
		&item.ID,
		&item.OrderID,
		&item.ProductID,
		&item.ProductName,
		&item.SellerID,
		&item.CustomerID,
		&item.Quantity,
		&item.PriceAtPurchase,
		&item.OrderStatus,
		&item.FulfillmentStatus,
		&item.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrOrderItemNotFound
		}

		return nil, fmt.Errorf("get seller order item: %w", err)
	}

	return item, nil
}

func (r *OrderRepository) UpdateOrderItemStatus(ctx context.Context, itemID int64, status string) (*model.SellerOrderItem, error) {
	if _, err := r.db.ExecContext(ctx, `UPDATE order_items SET fulfillment_status = ? WHERE id = ?`, status, itemID); err != nil {
		return nil, fmt.Errorf("update order item status: %w", err)
	}

	return r.GetSellerOrderItem(ctx, itemID)
}

func (r *OrderRepository) listOrderItems(ctx context.Context, orderID int64) ([]model.OrderItemDetail, error) {
	rows, err := r.db.QueryContext(
		ctx,
		`SELECT oi.id, oi.product_id, p.name, oi.seller_id, oi.quantity, oi.price_at_purchase, oi.fulfillment_status
		 FROM order_items oi
		 JOIN products p ON p.id = oi.product_id
		 WHERE oi.order_id = ?
		 ORDER BY oi.id ASC`,
		orderID,
	)
	if err != nil {
		return nil, fmt.Errorf("list order items: %w", err)
	}
	defer rows.Close()

	items := make([]model.OrderItemDetail, 0)
	for rows.Next() {
		var item model.OrderItemDetail
		if err := rows.Scan(
			&item.ID,
			&item.ProductID,
			&item.ProductName,
			&item.SellerID,
			&item.Quantity,
			&item.PriceAtPurchase,
			&item.FulfillmentStatus,
		); err != nil {
			return nil, fmt.Errorf("scan order item detail: %w", err)
		}

		items = append(items, item)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate order items: %w", err)
	}

	return items, nil
}

type AdminRepository struct {
	db *sql.DB
}

func NewAdminRepository(db *sql.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) GetStats(ctx context.Context) (*model.AdminStats, error) {
	stats := &model.AdminStats{}
	err := r.db.QueryRowContext(
		ctx,
		`SELECT
			(SELECT COUNT(*) FROM users),
			(SELECT COUNT(*) FROM users WHERE role = ?),
			(SELECT COUNT(*) FROM users WHERE role = ?),
			(SELECT COUNT(*) FROM products),
			(SELECT COUNT(*) FROM orders),
			(SELECT COUNT(*) FROM orders WHERE status = ?),
			COALESCE((SELECT SUM(total_amount) FROM orders WHERE status = ?), 0)`,
		model.RoleCustomer,
		model.RoleSeller,
		model.OrderStatusPaid,
		model.OrderStatusPaid,
	).Scan(
		&stats.UserCount,
		&stats.CustomerCount,
		&stats.SellerCount,
		&stats.ProductCount,
		&stats.OrderCount,
		&stats.PaidOrderCount,
		&stats.GrossRevenue,
	)
	if err != nil {
		return nil, fmt.Errorf("get admin stats: %w", err)
	}

	return stats, nil
}
