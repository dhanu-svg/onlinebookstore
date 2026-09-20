<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

require_login('/php_bookstore/login.php');

$user = get_current_user_session();
$page_title = "My Order History";

try {
    // Fetch all orders for current user
    $stmt = $pdo->prepare("
        SELECT * FROM orders 
        WHERE user_id = :user_id 
        ORDER BY created_at DESC
    ");
    $stmt->execute([':user_id' => $user['id']]);
    $orders = $stmt->fetchAll();

    // Fetch order items for each order
    $orders_with_items = [];
    $item_stmt = $pdo->prepare("
        SELECT * FROM order_items 
        WHERE order_id = :order_id
    ");

    foreach ($orders as $ord) {
        $item_stmt->execute([':order_id' => $ord['id']]);
        $ord['items'] = $item_stmt->fetchAll();
        $orders_with_items[] = $ord;
    }
} catch (PDOException $e) {
    $orders_with_items = [];
    $error = "Failed to load order history: " . $e->getMessage();
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h2 class="fw-bold mb-1"><i class="bi bi-clock-history text-primary me-2"></i>My Order History</h2>
        <p class="text-muted mb-0">Past book orders placed under <strong><?= e($user['email']) ?></strong></p>
    </div>
    <a href="/php_bookstore/books.php" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-book me-1"></i> Browse Catalog
    </a>
</div>

<?php if (empty($orders_with_items)): ?>
    <div class="card border-0 shadow-sm text-center py-5">
        <div class="card-body">
            <i class="bi bi-receipt text-muted display-3 mb-3"></i>
            <h4 class="fw-bold">No orders placed yet</h4>
            <p class="text-muted">You haven't ordered any physical book editions yet. Browse our public-domain catalog!</p>
            <a href="/php_bookstore/books.php" class="btn btn-primary px-4 py-2">Find Books</a>
        </div>
    </div>
<?php else: ?>
    <div class="row g-4 mb-5">
        <?php foreach ($orders_with_items as $order): ?>
            <div class="col-12">
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                        <div>
                            <span class="text-muted small d-block">Order #</span>
                            <span class="fw-bold font-monospace fs-6"><?= e($order['order_number']) ?></span>
                        </div>
                        <div>
                            <span class="text-muted small d-block">Order Date</span>
                            <span class="fw-semibold text-dark"><?= date('F j, Y, g:i a', strtotime($order['created_at'])) ?></span>
                        </div>
                        <div>
                            <span class="text-muted small d-block">Total</span>
                            <span class="fw-bold text-primary fs-5">$<?= number_format($order['total_amount'], 2) ?></span>
                        </div>
                        <div>
                            <span class="badge bg-success px-3 py-2 text-uppercase"><?= e($order['status']) ?></span>
                        </div>
                    </div>

                    <div class="card-body p-4">
                        <div class="row g-3 mb-3">
                            <div class="col-md-6 small">
                                <span class="text-muted d-block fw-semibold">Shipped To:</span>
                                <div><?= e($order['shipping_name']) ?></div>
                                <div class="text-muted"><?= e($order['shipping_address']) ?>, <?= e($order['shipping_city']) ?>, <?= e($order['shipping_country']) ?></div>
                            </div>
                            <div class="col-md-6 small text-md-end">
                                <span class="text-muted d-block fw-semibold">Payment Method:</span>
                                <div><?= e($order['payment_method']) ?></div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-sm table-bordered align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Book Title &amp; Author</th>
                                        <th class="text-center" style="width: 15%;">Unit Price</th>
                                        <th class="text-center" style="width: 15%;">Quantity</th>
                                        <th class="text-end" style="width: 15%;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($order['items'] as $item): ?>
                                        <tr>
                                            <td>
                                                <div class="fw-semibold"><?= e($item['title']) ?></div>
                                                <div class="text-muted small">by <?= e($item['author']) ?></div>
                                            </td>
                                            <td class="text-center">$<?= number_format($item['price'], 2) ?></td>
                                            <td class="text-center"><?= $item['quantity'] ?></td>
                                            <td class="text-end fw-bold">$<?= number_format($item['subtotal'], 2) ?></td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
