<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

$page_title = "Browse Books Catalog";

// Search and filter parameters
$search = trim($_GET['search'] ?? '');
$genre = trim($_GET['genre'] ?? '');
$sort = trim($_GET['sort'] ?? 'title_asc');

// Base query with prepared statement params
$sql = "SELECT * FROM books WHERE 1=1";
$params = [];

if (!empty($search)) {
    $sql .= " AND (title LIKE :search1 OR author LIKE :search2 OR description LIKE :search3)";
    $searchTerm = "%{$search}%";
    $params[':search1'] = $searchTerm;
    $params[':search2'] = $searchTerm;
    $params[':search3'] = $searchTerm;
}

if (!empty($genre)) {
    $sql .= " AND genre = :genre";
    $params[':genre'] = $genre;
}

switch ($sort) {
    case 'price_asc':
        $sql .= " ORDER BY price ASC";
        break;
    case 'price_desc':
        $sql .= " ORDER BY price DESC";
        break;
    case 'year_asc':
        $sql .= " ORDER BY year ASC";
        break;
    case 'year_desc':
        $sql .= " ORDER BY year DESC";
        break;
    case 'title_desc':
        $sql .= " ORDER BY title DESC";
        break;
    default:
        $sql .= " ORDER BY title ASC";
        break;
}

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $books = $stmt->fetchAll();

    // Fetch unique genres for filter dropdown
    $genre_stmt = $pdo->query("SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL AND genre != '' ORDER BY genre ASC");
    $genres = $genre_stmt->fetchAll(PDO::FETCH_COLUMN);
} catch (PDOException $e) {
    $books = [];
    $genres = [];
    $error = "Unable to retrieve book catalog.";
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
    <div>
        <h2 class="fw-bold mb-1"><i class="bi bi-collection text-primary me-2"></i>Public-Domain Book Catalog</h2>
        <p class="text-muted mb-0">Discover and read unabridged classics directly from Project Gutenberg</p>
    </div>
    <span class="badge bg-secondary fs-6 px-3 py-2"><?= count($books) ?> books available</span>
</div>

<!-- Filters & Search Toolbar -->
<div class="card shadow-sm border-0 mb-4">
    <div class="card-body">
        <form method="GET" action="/php_bookstore/books.php" class="row g-3 align-items-center">
            <div class="col-md-5">
                <div class="input-group">
                    <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
                    <input type="text" name="search" class="form-control" placeholder="Search by title, author, or keyword..." value="<?= e($search) ?>">
                </div>
            </div>
            <div class="col-md-3">
                <select name="genre" class="form-select">
                    <option value="">All Genres</option>
                    <?php foreach ($genres as $g): ?>
                        <option value="<?= e($g) ?>" <?= $genre === $g ? 'selected' : '' ?>><?= e($g) ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="col-md-2">
                <select name="sort" class="form-select">
                    <option value="title_asc" <?= $sort === 'title_asc' ? 'selected' : '' ?>>Title (A-Z)</option>
                    <option value="title_desc" <?= $sort === 'title_desc' ? 'selected' : '' ?>>Title (Z-A)</option>
                    <option value="price_asc" <?= $sort === 'price_asc' ? 'selected' : '' ?>>Price (Low to High)</option>
                    <option value="price_desc" <?= $sort === 'price_desc' ? 'selected' : '' ?>>Price (High to Low)</option>
                    <option value="year_asc" <?= $sort === 'year_asc' ? 'selected' : '' ?>>Publication Year (Oldest)</option>
                    <option value="year_desc" <?= $sort === 'year_desc' ? 'selected' : '' ?>>Publication Year (Newest)</option>
                </select>
            </div>
            <div class="col-md-2 d-flex gap-2">
                <button type="submit" class="btn btn-primary w-100 fw-semibold">Apply</button>
                <?php if (!empty($search) || !empty($genre) || $sort !== 'title_asc'): ?>
                    <a href="/php_bookstore/books.php" class="btn btn-outline-secondary" title="Reset filters">
                        <i class="bi bi-x-lg"></i>
                    </a>
                <?php endif; ?>
            </div>
        </form>
    </div>
</div>

<?php if (empty($books)): ?>
    <div class="text-center py-5 bg-white rounded shadow-sm">
        <i class="bi bi-book text-muted display-3 mb-3"></i>
        <h4>No books found</h4>
        <p class="text-muted">Try adjusting your search criteria or clearing your filters.</p>
        <a href="/php_bookstore/books.php" class="btn btn-outline-primary">Reset All Filters</a>
    </div>
<?php else: ?>
    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-5">
        <?php foreach ($books as $book): ?>
            <div class="col">
                <div class="card h-100 shadow-sm border-0 book-card position-relative">
                    <?php if ($book['stock'] <= 0): ?>
                        <span class="badge bg-danger position-absolute top-0 end-0 m-2">Out of Stock</span>
                    <?php elseif ($book['stock'] < 5): ?>
                        <span class="badge bg-warning text-dark position-absolute top-0 end-0 m-2"><?= $book['stock'] ?> left</span>
                    <?php endif; ?>

                    <div class="book-cover-wrapper bg-secondary bg-opacity-10 text-center p-3">
                        <img src="<?= e($book['cover_image']) ?>" 
                             alt="<?= e($book['title']) ?>" 
                             class="img-fluid rounded shadow book-cover-img"
                             loading="lazy"
                             onerror="this.src='https://placehold.co/300x450/2d3748/ffffff?text=Book+Cover'">
                    </div>

                    <div class="card-body d-flex flex-column p-3">
                        <div class="d-flex justify-content-between text-muted small mb-1">
                            <span><?= e($book['genre'] ?? 'Classic') ?></span>
                            <?php if (!empty($book['year'])): ?>
                                <span><?= e($book['year']) ?></span>
                            <?php endif; ?>
                        </div>
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
                            <span class="text-muted small"><i class="bi bi-box-seam"></i> <?= $book['stock'] ?> left</span>
                        </div>

                        <div class="d-grid gap-2">
                            <a href="/php_bookstore/read.php?id=<?= $book['id'] ?>" class="btn btn-outline-secondary btn-sm" target="_blank" rel="noopener noreferrer">
                                <i class="bi bi-book me-1"></i> Read Online Free
                            </a>
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
<?php endif; ?>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
