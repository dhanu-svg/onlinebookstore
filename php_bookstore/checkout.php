<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

// Ensure user is logged in
require_login('/php_bookstore/login.php');

$cart = $_SESSION['cart'] ?? [];
if (empty($cart)) {
    $_SESSION['flash_error'] = "Your cart is empty. Please select books before checking out.";
    header('Location: /php_bookstore/books.php');
    exit;
}

$user = get_current_user_session();
$errors = [];
$order_placed = false;
$order_data = null;

// Calculate total
$subtotal = 0;
foreach ($cart as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}

$shipping_name = $user['name'] ?? '';
$shipping_address = '';
$shipping_city = '';
$shipping_country = 'United States';
$payment_method = 'Credit Card (Simulated)';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = "Security validation failed. Please submit the form again.";
    } else {
        $shipping_name = trim($_POST['shipping_name'] ?? '');
        $shipping_address = trim($_POST['shipping_address'] ?? '');
        $shipping_city = trim($_POST['shipping_city'] ?? '');
        $shipping_country = trim($_POST['shipping_country'] ?? '');
        $payment_method = trim($_POST['payment_method'] ?? 'Credit Card');

        // Validation
        if (empty($shipping_name)) {
            $errors[] = "Recipient name is required.";
        }
        if (empty($shipping_address)) {
            $errors[] = "Shipping street address is required.";
        }
        if (empty($shipping_city)) {
            $errors[] = "Shipping city is required.";
        }
        if (empty($shipping_country)) {
            $errors[] = "Shipping country is required.";
        }

        if (empty($errors)) {
            // Process MySQL Transaction
            try {
                $pdo->beginTransaction();

                $order_number = 'ORD-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));

                // 1. Insert into orders table
                $order_stmt = $pdo->prepare("
                    INSERT INTO orders (user_id, order_number, total_amount, shipping_name, shipping_address, shipping_city, shipping_country, payment_method, status)
                    VALUES (:user_id, :order_number, :total_amount, :shipping_name, :shipping_address, :shipping_city, :shipping_country, :payment_method, 'completed')
                ");
                $order_stmt->execute([
                    ':user_id' => $user['id'],
                    ':order_number' => $order_number,
                    ':total_amount' => $subtotal,
                    ':shipping_name' => $shipping_name,
                    ':shipping_address' => $shipping_address,
                    ':shipping_city' => $shipping_city,
                    ':shipping_country' => $shipping_country,
                    ':payment_method' => $payment_method
                ]);
                $order_id = $pdo->lastInsertId();

                // 2. Insert into order_items and update book stock
                $item_stmt = $pdo->prepare("
                    INSERT INTO order_items (order_id, book_id, title, author, price, quantity, subtotal)
                    VALUES (:order_id, :book_id, :title, :author, :price, :quantity, :subtotal)
                ");
                $stock_stmt = $pdo->prepare("
                    UPDATE books SET stock = GREATEST(0, stock - :qty) WHERE id = :id
                ");

                $saved_items = [];
                foreach ($cart as $book_id => $item) {
                    $item_subtotal = $item['price'] * $item['quantity'];
                    $item_stmt->execute([
                        ':order_id' => $order_id,
                        ':book_id' => $book_id,
                        ':title' => $item['title'],
                        ':author' => $item['author'],
                        ':price' => $item['price'],
                        ':quantity' => $item['quantity'],
                        ':subtotal' => $item_subtotal
                    ]);

                    $stock_stmt->execute([
                        ':qty' => $item['quantity'],
                        ':id' => $book_id
                    ]);

                    $saved_items[] = [
                        'title' => $item['title'],
                        'author' => $item['author'],
                        'price' => $item['price'],
                        'quantity' => $item['quantity'],
                        'subtotal' => $item_subtotal
                    ];
                }

                $pdo->commit();

                // Clear session cart
                $_SESSION['cart'] = [];

                $order_placed = true;
                $order_data = [
                    'order_id' => $order_id,
                    'order_number' => $order_number,
                    'shipping_name' => $shipping_name,
                    'shipping_address' => $shipping_address,
                    'shipping_city' => $shipping_city,
                    'shipping_country' => $shipping_country,
                    'payment_method' => $payment_method,
                    'total_amount' => $subtotal,
                    'items' => $saved_items,
                    'created_at' => date('Y-m-d H:i:s')
                ];
            } catch (Exception $e) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                $errors[] = "Failed to place order due to a database transaction error: " . $e->getMessage();
            }
        }
    }
}

$page_title = $order_placed ? "Order Confirmation" : "Checkout";
require_once __DIR__ . '/includes/header.php';
?>

<?php if ($order_placed && $order_data): ?>
    <!-- Order Confirmation Screen: Display submitted form data back to the user -->
    <div class="row justify-content-center my-4">
        <div class="col-lg-9">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-success text-white py-3 text-center">
                    <i class="bi bi-check-circle-fill display-4 d-block mb-2"></i>
                    <h3 class="fw-bold mb-1">Thank You! Order Confirmed</h3>
                    <p class="mb-0 opacity-75">Order Number: <strong><?= e($order_data['order_number']) ?></strong></p>
                </div>
                <div class="card-body p-4 p-md-5">
                    <div class="alert alert-light border d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <span class="text-muted small d-block">Placed By:</span>
                            <strong class="text-dark"><?= e($user['name']) ?> (<?= e($user['email']) ?>)</strong>
                        </div>
                        <div class="text-end">
                            <span class="text-muted small d-block">Order Date:</span>
                            <strong><?= e($order_data['created_at']) ?></strong>
                        </div>
                    </div>

                    <!-- Submitted Shipping Information Confirmation -->
                    <h5 class="fw-bold mb-3"><i class="bi bi-geo-alt-fill text-primary me-2"></i>Shipping &amp; Delivery Details</h5>
                    <div class="row g-3 mb-4 bg-light p-3 rounded">
                        <div class="col-md-6">
                            <span class="text-muted small d-block">Recipient:</span>
                            <strong><?= e($order_data['shipping_name']) ?></strong>
                        </div>
                        <div class="col-md-6">
                            <span class="text-muted small d-block">Payment Method:</span>
                            <strong><?= e($order_data['payment_method']) ?></strong>
                        </div>
                        <div class="col-12">
                            <span class="text-muted small d-block">Shipping Address:</span>
                            <span><?= e($order_data['shipping_address']) ?>, <?= e($order_data['shipping_city']) ?>, <?= e($order_data['shipping_country']) ?></span>
                        </div>
                    </div>

                    <!-- Purchased Items -->
                    <h5 class="fw-bold mb-3"><i class="bi bi-journal-bookmark text-primary me-2"></i>Ordered Books</h5>
                    <div class="table-responsive mb-4">
                        <table class="table table-bordered align-middle">
                            <thead class="table-light">
                                <tr>
                                    <th>Item</th>
                                    <th class="text-center">Price</th>
                                    <th class="text-center">Quantity</th>
                                    <th class="text-end">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($order_data['items'] as $it): ?>
                                    <tr>
                                        <td>
                                            <strong><?= e($it['title']) ?></strong>
                                            <div class="small text-muted">By <?= e($it['author']) ?></div>
                                        </td>
                                        <td class="text-center">$<?= number_format($it['price'], 2) ?></td>
                                        <td class="text-center"><?= $it['quantity'] ?></td>
                                        <td class="text-end fw-semibold">$<?= number_format($it['subtotal'], 2) ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th colspan="3" class="text-end">Total Amount Charged:</th>
                                    <th class="text-end text-primary fs-5">$<?= number_format($order_data['total_amount'], 2) ?></th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div class="d-flex flex-wrap gap-2 justify-content-between">
                        <a href="/php_bookstore/order_history.php" class="btn btn-primary px-4 fw-semibold">
                            <i class="bi bi-clock-history me-1"></i> View in Order History
                        </a>
                        <a href="/php_bookstore/books.php" class="btn btn-outline-secondary px-4">
                            Continue Browsing Books
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
<?php else: ?>
    <!-- Checkout Form -->
    <div class="row g-4 mb-5">
        <div class="col-lg-7">
            <div class="card border-0 shadow-sm p-4 bg-white">
                <h4 class="fw-bold mb-3"><i class="bi bi-credit-card-2-front text-primary me-2"></i>Shipping &amp; Payment</h4>

                <?php if (!empty($errors)): ?>
                    <div class="alert alert-danger">
                        <ul class="mb-0 ps-3">
                            <?php foreach ($errors as $err): ?>
                                <li><?= e($err) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <form method="POST" action="/php_bookstore/checkout.php" id="checkout-form" novalidate onsubmit="return validateCheckout(this)">
                    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

                    <div class="mb-3">
                        <label for="ship-name" class="form-label fw-semibold">Full Name / Recipient</label>
                        <input type="text" class="form-control" id="ship-name" name="shipping_name" value="<?= e($shipping_name) ?>" required>
                        <div class="invalid-feedback">Recipient name is required.</div>
                    </div>

                    <div class="mb-3">
                        <label for="ship-address" class="form-label fw-semibold">Street Address</label>
                        <input type="text" class="form-control" id="ship-address" name="shipping_address" value="<?= e($shipping_address) ?>" placeholder="124 Baker Street, Suite 4" required>
                        <div class="invalid-feedback">Street address is required.</div>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label for="ship-city" class="form-label fw-semibold">City</label>
                            <input type="text" class="form-control" id="ship-city" name="shipping_city" value="<?= e($shipping_city) ?>" placeholder="London / New York" required>
                            <div class="invalid-feedback">City is required.</div>
                        </div>
                        <div class="col-md-6">
                            <label for="ship-country" class="form-label fw-semibold">Country</label>
                            <select class="form-select" id="ship-country" name="shipping_country" required>
                                <option value="United States" <?= $shipping_country === 'United States' ? 'selected' : '' ?>>United States</option>
                                <option value="United Kingdom" <?= $shipping_country === 'United Kingdom' ? 'selected' : '' ?>>United Kingdom</option>
                                <option value="Canada" <?= $shipping_country === 'Canada' ? 'selected' : '' ?>>Canada</option>
                                <option value="Australia" <?= $shipping_country === 'Australia' ? 'selected' : '' ?>>Australia</option>
                                <option value="Germany" <?= $shipping_country === 'Germany' ? 'selected' : '' ?>>Germany</option>
                                <option value="France" <?= $shipping_country === 'France' ? 'selected' : '' ?>>France</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-semibold">Payment Method</label>
                        <div class="border rounded p-3">
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="radio" name="payment_method" id="pay-cc" value="Credit Card" checked>
                                <label class="form-check-label fw-semibold" for="pay-cc">
                                    <i class="bi bi-credit-card me-1"></i> Credit / Debit Card (Simulated Direct Checkout)
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="payment_method" id="pay-cod" value="Cash on Delivery">
                                <label class="form-check-label fw-semibold" for="pay-cod">
                                    <i class="bi bi-cash-stack me-1"></i> Pay Upon Delivery / In-Store Pickup
                                </label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-warning btn-lg w-100 fw-bold py-3 shadow-sm" id="btn-place-order">
                        <i class="bi bi-lock-fill me-1"></i> Place Order ($<?= number_format($subtotal, 2) ?>)
                    </button>
                </form>
            </div>
        </div>

        <!-- Summary Column -->
        <div class="col-lg-5">
            <div class="card border-0 shadow-sm p-4 bg-white sticky-top" style="top: 80px;">
                <h5 class="fw-bold mb-3">Order Overview (<?= count($cart) ?> items)</h5>
                <div class="list-group list-group-flush mb-3">
                    <?php foreach ($cart as $item): ?>
                        <div class="list-group-item px-0 d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center gap-2">
                                <img src="<?= e($item['cover_image']) ?>" alt="" style="width: 35px; height: 50px; object-fit: cover;" class="rounded">
                                <div>
                                    <h6 class="mb-0 small fw-bold"><?= e($item['title']) ?></h6>
                                    <small class="text-muted"><?= $item['quantity'] ?> &times; $<?= number_format($item['price'], 2) ?></small>
                                </div>
                            </div>
                            <span class="fw-bold">$<?= number_format($item['price'] * $item['quantity'], 2) ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="d-flex justify-content-between mb-2 text-muted">
                    <span>Subtotal</span>
                    <span class="text-dark fw-semibold">$<?= number_format($subtotal, 2) ?></span>
                </div>
                <div class="d-flex justify-content-between mb-2 text-muted">
                    <span>Shipping</span>
                    <span class="text-success fw-semibold">FREE</span>
                </div>
                <hr class="my-2">
                <div class="d-flex justify-content-between fs-5 fw-bold text-dark mb-3">
                    <span>Total</span>
                    <span class="text-primary">$<?= number_format($subtotal, 2) ?></span>
                </div>

                <div class="p-3 bg-light rounded small text-muted">
                    <i class="bi bi-shield-lock text-success me-1"></i> Form data will be validated server-side and recorded in the <code>orders</code> and <code>order_items</code> relational tables.
                </div>
            </div>
        </div>
    </div>

    <script>
    function validateCheckout(form) {
        let valid = true;
        ['shipping_name', 'shipping_address', 'shipping_city'].forEach(fieldName => {
            const input = form[fieldName];
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                valid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        return valid;
    }
    </script>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
