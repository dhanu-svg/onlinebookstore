<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

$page_title = "Home - Public Domain Masterpieces";

// Fetch featured books from database
try {
    $stmt = $pdo->query("SELECT * FROM books ORDER BY id ASC LIMIT 8");
    $featured_books = $stmt->fetchAll();
} catch (PDOException $e) {
    $featured_books = [];
}

require_once __DIR__ . '/includes/header.php';
?>

<!-- Hero Section -->
<div class="p-5 mb-4 bg-dark text-white rounded-3 shadow-sm border border-secondary" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
    <div class="container-fluid py-3">
        <div class="row align-items-center">
            <div class="col-lg-8">
                <span class="badge bg-warning text-dark px-3 py-2 text-uppercase fw-bold mb-2">Project Gutenberg Edition</span>
                <h1 class="display-5 fw-bold text-white mb-3">Timeless Literature, Free &amp; Forever Yours</h1>
                <p class="col-md-10 fs-5 text-light opacity-75">
                    Explore centuries of human genius. Our bookstore curates real, public-domain masterpieces legally preserved by Project Gutenberg. Read full texts online instantly or order physical collector editions with swift fulfillment.
                </p>
                <div class="d-flex flex-wrap gap-2 mt-4">
                    <a href="/php_bookstore/books.php" class="btn btn-warning btn-lg px-4 fw-semibold" id="hero-browse-btn">
                        <i class="bi bi-book me-1"></i> Browse Catalog
                    </a>
                    <a href="#featured" class="btn btn-outline-light btn-lg px-4" id="hero-featured-btn">
                        Featured Classics
                    </a>
                </div>
            </div>
            <div class="col-lg-4 d-none d-lg-block text-center">
                <i class="bi bi-journal-bookmark-fill text-warning opacity-75" style="font-size: 8rem;"></i>
            </div>
        </div>
    </div>
</div>

<!-- Search & Quick Filter Bar -->
<div class="card shadow-sm border-0 mb-5">
    <div class="card-body p-3">
        <form action="/php_bookstore/books.php" method="GET" class="row g-2 align-items-center">
            <div class="col-md-7">
                <div class="input-group">
                    <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
                    <input type="text" name="search" class="form-control border-start-0" placeholder="Search by title, author, or keyword (e.g., Shelley, Holmes)...">
                </div>
            </div>
            <div class="col-md-3">
                <select name="genre" class="form-select">
                    <option value="">All Genres</option>
                    <option value="Classic Romance">Classic Romance</option>
                    <option value="Gothic Horror">Gothic Horror</option>
                    <option value="Mystery & Crime">Mystery & Crime</option>
                    <option value="Adventure & Epic">Adventure & Epic</option>
                    <option value="Fantasy & Children">Fantasy & Children</option>
                    <option value="Philosophical Fiction">Philosophical Fiction</option>
                </select>
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100 fw-semibold">
                    <i class="bi bi-funnel me-1"></i> Filter
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Value Props -->
<div class="row g-4 mb-5 text-center">
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm p-3">
            <div class="card-body">
                <div class="feature-icon bg-warning bg-opacity-25 text-warning-emphasis p-3 rounded-circle d-inline-block mb-3">
                    <i class="bi bi-globe2 fs-2 text-warning"></i>
                </div>
                <h5 class="fw-bold">Legally Public Domain</h5>
                <p class="text-muted small mb-0">Every book is certified legally free, preserved faithfully through the digital archives of Project Gutenberg.</p>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm p-3">
            <div class="card-body">
                <div class="feature-icon bg-info bg-opacity-25 text-info-emphasis p-3 rounded-circle d-inline-block mb-3">
                    <i class="bi bi-book-half fs-2 text-info"></i>
                </div>
                <h5 class="fw-bold">Read Online Instantly</h5>
                <p class="text-muted small mb-0">No purchase necessary to read. Embedded reader provides immediate access to the complete, unabridged original text.</p>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card h-100 border-0 shadow-sm p-3">
            <div class="card-body">
                <div class="feature-icon bg-success bg-opacity-25 text-success-emphasis p-3 rounded-circle d-inline-block mb-3">
                    <i class="bi bi-lightning-charge fs-2 text-success"></i>
                </div>
                <h5 class="fw-bold">Seamless AJAX Cart</h5>
                <p class="text-muted small mb-0">Add titles to your cart dynamically without jarring page refreshes. Real-time subtotal calculations and checkout.</p>
            </div>
        </div>
    </div>
</div>

<!-- Featured Books Grid -->
<div id="featured" class="mb-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-1">Featured Public-Domain Classics</h2>
            <p class="text-muted mb-0">Authentic cover art from Open Library Covers API &amp; Project Gutenberg</p>
        </div>
        <a href="/php_bookstore/books.php" class="btn btn-outline-dark btn-sm">
            View All Books <i class="bi bi-arrow-right ms-1"></i>
        </a>
    </div>

    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        <?php foreach ($featured_books as $book): ?>
            <div class="col">
                <div class="card h-100 shadow-sm border-0 book-card position-relative">
                    <!-- Stock Badge -->
                    <?php if ($book['stock'] <= 0): ?>
                        <span class="badge bg-danger position-absolute top-0 end-0 m-2">Out of Stock</span>
                    <?php elseif ($book['stock'] < 5): ?>
                        <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2">Only <?= e($book['stock']) ?> left!</span>
                    <?php endif; ?>

                    <div class="book-cover-wrapper bg-secondary bg-opacity-10 text-center p-3">
                        <img src="<?= e($book['cover_image']) ?>" 
                             alt="<?= e($book['title']) ?>" 
                             class="img-fluid rounded shadow book-cover-img"
                             loading="lazy"
                             onerror="this.src='https://placehold.co/300x450/2d3748/ffffff?text=Book+Cover'">
                    </div>

                    <div class="card-body d-flex flex-column p-3">
                        <div class="text-muted small mb-1"><?= e($book['genre'] ?? 'Classic') ?></div>
                        <h6 class="card-title fw-bold text-truncate mb-1" title="<?= e($book['title']) ?>">
                            <a href="/php_bookstore/book_detail.php?id=<?= $book['id'] ?>" class="text-decoration-none text-dark">
                                <?= e($book['title']) ?>
                            </a>
                        </h6>
                        <p class="card-subtitle text-muted small mb-2"><?= e($book['author']) ?></p>
                        <p class="card-text text-secondary small flex-grow-1 line-clamp-2">
                            <?= e(mb_strimwidth($book['description'], 0, 110, "...")) ?>
                        </p>

                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <span class="fs-5 fw-bold text-primary">$<?= number_format($book['price'], 2) ?></span>
                            <span class="text-muted small"><i class="bi bi-box-seam"></i> <?= $book['stock'] ?> in stock</span>
                        </div>

                        <div class="d-grid gap-2">
                            <!-- Read Online Button -->
                            <a href="/php_bookstore/read.php?id=<?= $book['id'] ?>" class="btn btn-outline-secondary btn-sm" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-book me-1"></i> Read Online Free
                            </a>
                            <!-- Add to Cart AJAX Button -->
                            <button class="btn btn-warning btn-sm fw-semibold add-to-cart-btn" 
                                    data-book-id="<?= $book['id'] ?>" 
                                    data-title="<?= e($book['title']) ?>"
                                    <?= $book['stock'] <= 0 ? 'disabled' : '' ?>>
                                <i class="bi bi-cart-plus me-1"></i> <?= $book['stock'] <= 0 ? 'Out of Stock' : 'Add to Cart' ?>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
