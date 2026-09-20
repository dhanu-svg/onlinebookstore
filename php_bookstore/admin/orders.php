<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_middleware.php';

require_admin('/php_bookstore/login.php');

$page_title = "Admin: Customer Orders";

try {
    // Fetch all orders with user details
    $stmt = $pdo->query("
        SELECT o.*, u.name as customer_name, u.email as customer_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    ");
    $orders = $stmt->fetchAll();

    // Fetch order items
    $item_stmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = :order_id");
    $orders_with_items = [];
    foreach ($orders as $ord) {
        $item_stmt->execute([':order_id' => $ord['id']]);
        $ord['items'] = $item_stmt->fetchAll();
        $orders_with_items[] = $ord;
    }
} catch (PDOException $e) {
    $orders_with_items = [];
    $error = "Error fetching orders: " . $e->getMessage();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
    <div>
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-1">
                <li class="breadcrumb-item"><a href="/php_bookstore/index.php">Store</a></li>
                <li class="breadcrumb-item"><a href="/php_bookstore/admin/books.php">Admin Panel</a></li>
                <li class="breadcrumb-item active">Customer Orders</li>
            </ol>
        </nav>
        <h2 class="fw-bold mb-0"><i class="bi bi-receipt-cutoff text-warning me-2"></i>All Customer Orders</h2>
    </div>
    <div>
        <a href="/php_bookstore/admin/books.php" class="btn btn-outline-dark">
            <i class="bi bi-journal-text me-1"></i> Manage Books
        </a>
    </div>
</div>

<div class="card border-0 shadow-sm">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold">Customer Transactions (<?= count($orders_with_items) ?> Orders)</h5>
        <span class="badge bg-secondary">MySQL: <code>orders</code> &amp; <code>order_items</code></span>
    </div>
    <div class="card-body p-0">
        <?php if (empty($orders_with_items)): ?>
            <div class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                No customer orders found in the database.
            </div>
        <?php else: ?>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Order #</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Shipping Address</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($orders_with_items as $ord): ?>
                            <tr>
                                <td class="fw-bold font-monospace text-primary"><?= e($ord['order_number']) ?></td>
                                <td>
                                    <strong><?= e($ord['customer_name']) ?></strong>
                                    <div class="text-muted small"><?= e($ord['customer_email']) ?></div>
                                </td>
                                <td class="small text-muted">
                                    <?= date('M j, Y g:i a', strtotime($ord['created_at'])) ?>
                                </td>
                                <td class="small">
                                    <div><strong><?= e($ord['shipping_name']) ?></strong></div>
                                    <div class="text-muted"><?= e($ord['shipping_address']) ?>, <?= e($ord['shipping_city']) ?>, <?= e($ord['shipping_country']) ?></div>
                                </td>
                                <td>
                                    <span class="badge bg-light text-dark border">
                                        <?= count($ord['items']) ?> book(s)
                                    </span>
                                    <ul class="list-unstyled mb-0 small mt-1 text-muted" style="max-width: 250px;">
                                        <?php foreach ($ord['items'] as $it): ?>
                                            <li class="text-truncate" title="<?= e($it['title']) ?>">
                                                &bull; <?= $it['quantity'] ?>&times; <?= e($it['title']) ?>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                </td>
                                <td class="fw-bold text-dark fs-6">
                                    $<?= number_format($ord['total_amount'], 2) ?>
                                </td>
                                <td>
                                    <span class="badge bg-success text-uppercase"><?= e($ord['status']) ?></span>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
