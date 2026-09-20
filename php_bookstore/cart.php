<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

$cart = $_SESSION['cart'] ?? [];
$page_title = "Your Shopping Cart";

$subtotal = 0;
foreach ($cart as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <div>
        <h2 class="fw-bold mb-1"><i class="bi bi-bag-check text-primary me-2"></i>Shopping Cart</h2>
        <p class="text-muted mb-0">Review your physical collector's edition public-domain book selections</p>
    </div>
    <a href="/php_bookstore/books.php" class="btn btn-outline-secondary btn-sm">
        <i class="bi bi-arrow-left me-1"></i> Continue Browsing
    </a>
</div>

<?php if (empty($cart)): ?>
    <div class="card border-0 shadow-sm text-center py-5">
        <div class="card-body">
            <i class="bi bi-cart-x text-muted display-3 mb-3"></i>
            <h4 class="fw-bold">Your cart is empty</h4>
            <p class="text-muted">Explore our curated collection of free public-domain classics and add your favorites!</p>
            <a href="/php_bookstore/books.php" class="btn btn-warning px-4 py-2 fw-semibold">
                Explore Gutenberg Books
            </a>
        </div>
    </div>
<?php else: ?>
    <div class="row g-4" id="cart-content-row">
        <!-- Cart Table -->
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th style="width: 45%;">Book</th>
                                    <th class="text-center" style="width: 15%;">Price</th>
                                    <th class="text-center" style="width: 20%;">Quantity</th>
                                    <th class="text-end" style="width: 15%;">Subtotal</th>
                                    <th class="text-center" style="width: 5%;"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($cart as $id => $item): 
                                    $item_total = $item['price'] * $item['quantity'];
                                ?>
                                    <tr id="cart-item-row-<?= $id ?>">
                                        <td>
                                            <div class="d-flex align-items-center gap-3">
                                                <img src="<?= e($item['cover_image']) ?>" 
                                                     alt="<?= e($item['title']) ?>" 
                                                     class="rounded shadow-sm" 
                                                     style="width: 48px; height: 70px; object-fit: cover;"
                                                     onerror="this.src='https://placehold.co/100x150/2d3748/ffffff?text=Book'">
                                                <div>
                                                    <h6 class="fw-bold mb-0">
                                                        <a href="/php_bookstore/book_detail.php?id=<?= $id ?>" class="text-decoration-none text-dark">
                                                            <?= e($item['title']) ?>
                                                        </a>
                                                    </h6>
                                                    <small class="text-muted"><?= e($item['author']) ?></small>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="text-center fw-semibold">
                                            $<?= number_format($item['price'], 2) ?>
                                        </td>
                                        <td class="text-center">
                                            <div class="input-group input-group-sm justify-content-center mx-auto" style="max-width: 110px;">
                                                <button class="btn btn-outline-secondary" type="button" onclick="updateCartQty(<?= $id ?>, <?= $item['quantity'] - 1 ?>)">-</button>
                                                <input type="text" class="form-control text-center px-1" value="<?= $item['quantity'] ?>" readonly>
                                                <button class="btn btn-outline-secondary" type="button" onclick="updateCartQty(<?= $id ?>, <?= $item['quantity'] + 1 ?>)">+</button>
                                            </div>
                                        </td>
                                        <td class="text-end fw-bold text-primary">
                                            $<?= number_format($item_total, 2) ?>
                                        </td>
                                        <td class="text-center">
                                            <button class="btn btn-link text-danger p-0" title="Remove item" onclick="removeCartItem(<?= $id ?>)">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Order Summary Column -->
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm p-4 bg-white sticky-top" style="top: 80px;">
                <h5 class="fw-bold mb-3">Order Summary</h5>
                <div class="d-flex justify-content-between mb-2 text-muted">
                    <span>Subtotal</span>
                    <span id="summary-subtotal" class="fw-semibold text-dark">$<?= number_format($subtotal, 2) ?></span>
                </div>
                <div class="d-flex justify-content-between mb-2 text-muted">
                    <span>Standard Shipping</span>
                    <span class="text-success fw-semibold">FREE</span>
                </div>
                <div class="d-flex justify-content-between mb-3 text-muted">
                    <span>Estimated Sales Tax</span>
                    <span class="fw-semibold text-dark">$0.00</span>
                </div>
                <hr class="my-2">
                <div class="d-flex justify-content-between mb-4 fs-5 fw-bold text-dark">
                    <span>Estimated Total</span>
                    <span id="summary-total" class="text-primary">$<?= number_format($subtotal, 2) ?></span>
                </div>

                <div class="d-grid gap-2">
                    <a href="/php_bookstore/checkout.php" class="btn btn-warning btn-lg fw-bold py-2" id="btn-proceed-checkout">
                        Proceed to Checkout <i class="bi bi-arrow-right ms-1"></i>
                    </a>
                </div>

                <div class="mt-4 p-3 bg-light rounded text-muted small">
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <i class="bi bi-shield-check text-success fs-5"></i>
                        <span class="fw-bold text-dark">Secure Session &amp; Transactions</span>
                    </div>
                    <span>Orders are saved in the MySQL database under relational foreign keys.</span>
                </div>
            </div>
        </div>
    </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
