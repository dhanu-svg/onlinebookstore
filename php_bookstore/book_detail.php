<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

$book_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($book_id <= 0) {
    header('Location: /php_bookstore/books.php');
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM books WHERE id = :id");
    $stmt->execute([':id' => $book_id]);
    $book = $stmt->fetch();

    if (!$book) {
        $_SESSION['flash_error'] = "Book not found in catalog.";
        header('Location: /php_bookstore/books.php');
        exit;
    }
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}

$page_title = $book['title'] . " by " . $book['author'];
require_once __DIR__ . '/includes/header.php';
?>

<!-- Breadcrumb -->
<nav aria-label="breadcrumb" class="mb-4">
    <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="/php_bookstore/index.php">Home</a></li>
        <li class="breadcrumb-item"><a href="/php_bookstore/books.php">Books</a></li>
        <li class="breadcrumb-item active" aria-current="page"><?= e($book['title']) ?></li>
    </ol>
</nav>

<div class="row g-4 mb-5">
    <!-- Cover Column -->
    <div class="col-md-4 col-lg-4 text-center">
        <div class="card border-0 shadow-sm p-3 bg-white mb-3">
            <img src="<?= e($book['cover_image']) ?>" 
                 alt="<?= e($book['title']) ?>" 
                 class="img-fluid rounded shadow-sm mx-auto" 
                 style="max-height: 460px; object-fit: cover;"
                 onerror="this.src='https://placehold.co/400x600/2d3748/ffffff?text=Book+Cover'">
        </div>
        
        <!-- Quick Action Buttons -->
        <div class="d-grid gap-2">
            <a href="/php_bookstore/read.php?id=<?= $book['id'] ?>" class="btn btn-outline-primary btn-lg" id="detail-read-btn">
                <i class="bi bi-book-half me-1"></i> Read Online (Full Free Text)
            </a>
            <a href="<?= e($book['gutenberg_url']) ?>" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-link text-muted">
                <i class="bi bi-box-arrow-up-right me-1"></i> View on Project Gutenberg Archives
            </a>
        </div>
    </div>

    <!-- Details Column -->
    <div class="col-md-8 col-lg-8">
        <div class="card border-0 shadow-sm p-4 bg-white h-100">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <span class="badge bg-secondary mb-2"><?= e($book['genre'] ?? 'Public Domain Classic') ?></span>
                    <h1 class="h2 fw-bold text-dark mb-1"><?= e($book['title']) ?></h1>
                    <p class="fs-5 text-muted mb-3">By <span class="text-dark fw-semibold"><?= e($book['author']) ?></span></p>
                </div>
                <div class="text-end">
                    <div class="fs-2 fw-bold text-primary">$<?= number_format($book['price'], 2) ?></div>
                    <span class="badge bg-success">Free Digital Version</span>
                </div>
            </div>

            <hr class="my-3 text-muted">

            <!-- Metadata Pills -->
            <div class="row g-2 mb-4 small text-muted">
                <?php if (!empty($book['isbn'])): ?>
                    <div class="col-sm-4">
                        <strong class="text-dark">ISBN:</strong> <?= e($book['isbn']) ?>
                    </div>
                <?php endif; ?>
                <?php if (!empty($book['year'])): ?>
                    <div class="col-sm-4">
                        <strong class="text-dark">First Published:</strong> <?= e($book['year']) ?>
                    </div>
                <?php endif; ?>
                <div class="col-sm-4">
                    <strong class="text-dark">Availability:</strong> 
                    <?php if ($book['stock'] > 0): ?>
                        <span class="text-success fw-bold"><i class="bi bi-check-circle"></i> In Stock (<?= $book['stock'] ?>)</span>
                    <?php else: ?>
                        <span class="text-danger fw-bold"><i class="bi bi-x-circle"></i> Out of Stock</span>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Description -->
            <h5 class="fw-bold mb-2">Book Synopsis</h5>
            <p class="text-secondary lh-lg mb-4" style="white-space: pre-line;">
                <?= e($book['description']) ?>
            </p>

            <!-- Legal Public Domain Notice -->
            <div class="alert alert-info py-2 px-3 small mb-4 d-flex align-items-center gap-2">
                <i class="bi bi-info-circle-fill fs-5"></i>
                <div>
                    <strong>100% Free Public Domain Edition:</strong> This work entered the public domain in the United States and most jurisdictions. You are free to read, copy, or distribute it without copyright restrictions under Project Gutenberg license terms.
                </div>
            </div>

            <!-- Purchase & Cart Form -->
            <div class="mt-auto pt-3 border-top">
                <?php if ($book['stock'] > 0): ?>
                    <form class="d-flex align-items-center gap-3 flex-wrap" id="detail-add-form" onsubmit="event.preventDefault(); addCartWithQuantity(<?= $book['id'] ?>);">
                        <div class="d-flex align-items-center gap-2">
                            <label for="detail-qty" class="fw-semibold text-dark">Qty:</label>
                            <input type="number" id="detail-qty" name="quantity" class="form-control text-center" value="1" min="1" max="<?= $book['stock'] ?>" style="width: 80px;">
                        </div>
                        <button type="submit" class="btn btn-warning btn-lg px-4 fw-bold flex-grow-1" id="detail-submit-cart">
                            <i class="bi bi-cart-plus me-1"></i> Add Physical Edition to Cart ($<?= number_format($book['price'], 2) ?>)
                        </button>
                    </form>
                <?php else: ?>
                    <div class="alert alert-warning mb-0">
                        This physical collector's edition is currently out of stock. You can still read the complete unabridged book online for free!
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- Embedded Gutenberg Reader Preview Card -->
<div class="card border-0 shadow-sm mb-5">
    <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
        <h5 class="mb-0 fw-bold"><i class="bi bi-book me-2 text-warning"></i>Read <?= e($book['title']) ?> Online Now</h5>
        <a href="/php_bookstore/read.php?id=<?= $book['id'] ?>" target="_blank" class="btn btn-outline-light btn-sm">
            <i class="bi bi-fullscreen me-1"></i> Open Full Screen Reader
        </a>
    </div>
    <div class="card-body p-0">
        <div class="ratio ratio-16x9" style="min-height: 520px;">
            <iframe src="<?= e($book['gutenberg_url']) ?>" 
                    title="Read <?= e($book['title']) ?> online"
                    sandbox="allow-same-origin allow-scripts" 
                    loading="lazy"
                    class="w-100 h-100 border-0"></iframe>
        </div>
    </div>
    <div class="card-footer bg-light text-muted small py-2 d-flex justify-content-between">
        <span>Source: <a href="https://www.gutenberg.org" target="_blank" rel="noopener noreferrer" class="text-decoration-none">Project Gutenberg</a></span>
        <span>Unabridged Complete Free Public Domain Text</span>
    </div>
</div>

<script>
function addCartWithQuantity(bookId) {
    const qtyInput = document.getElementById('detail-qty');
    const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
    if (typeof handleAddToCart === 'function') {
        handleAddToCart(bookId, qty);
    }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
