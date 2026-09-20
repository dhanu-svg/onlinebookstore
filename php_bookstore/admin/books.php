<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_middleware.php';

require_admin('/php_bookstore/login.php');

$page_title = "Admin: Manage Books (CRUD)";

try {
    $stmt = $pdo->query("SELECT * FROM books ORDER BY id DESC");
    $books = $stmt->fetchAll();
} catch (PDOException $e) {
    $books = [];
    $error = "Error fetching books: " . $e->getMessage();
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
    <div>
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-1">
                <li class="breadcrumb-item"><a href="/php_bookstore/index.php">Store</a></li>
                <li class="breadcrumb-item active">Admin Panel</li>
            </ol>
        </nav>
        <h2 class="fw-bold mb-0"><i class="bi bi-gear-fill text-warning me-2"></i>Manage Books Inventory</h2>
    </div>
    <div class="d-flex gap-2">
        <a href="/php_bookstore/admin/orders.php" class="btn btn-outline-dark">
            <i class="bi bi-receipt me-1"></i> Customer Orders
        </a>
        <a href="/php_bookstore/admin/add_book.php" class="btn btn-primary fw-semibold" id="admin-add-book-btn">
            <i class="bi bi-plus-circle me-1"></i> Add New Book
        </a>
    </div>
</div>

<div class="card border-0 shadow-sm">
    <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold">Catalog Books (<?= count($books) ?> Total)</h5>
        <span class="badge bg-secondary">MySQL Table: <code>books</code></span>
    </div>
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th style="width: 5%;">ID</th>
                        <th style="width: 10%;">Cover</th>
                        <th style="width: 25%;">Title &amp; Author</th>
                        <th style="width: 15%;">Genre / Year</th>
                        <th style="width: 10%;">Price</th>
                        <th style="width: 10%;">Stock</th>
                        <th style="width: 10%;">Gutenberg</th>
                        <th class="text-end" style="width: 15%;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($books as $book): ?>
                        <tr>
                            <td class="fw-bold text-muted"><?= $book['id'] ?></td>
                            <td>
                                <img src="<?= e($book['cover_image']) ?>" 
                                     alt="<?= e($book['title']) ?>" 
                                     class="rounded shadow-sm" 
                                     style="width: 40px; height: 60px; object-fit: cover;"
                                     onerror="this.src='https://placehold.co/80x120/2d3748/ffffff?text=Cover'">
                            </td>
                            <td>
                                <strong class="d-block text-dark"><?= e($book['title']) ?></strong>
                                <span class="text-muted small"><?= e($book['author']) ?></span>
                            </td>
                            <td class="small">
                                <div><?= e($book['genre'] ?? 'Classic') ?></div>
                                <span class="text-muted"><?= e($book['year'] ?? '') ?></span>
                            </td>
                            <td class="fw-bold text-primary">
                                $<?= number_format($book['price'], 2) ?>
                            </td>
                            <td>
                                <?php if ($book['stock'] <= 0): ?>
                                    <span class="badge bg-danger">0 Out</span>
                                <?php elseif ($book['stock'] < 5): ?>
                                    <span class="badge bg-warning text-dark"><?= $book['stock'] ?> Low</span>
                                <?php else: ?>
                                    <span class="badge bg-success"><?= $book['stock'] ?> In</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <a href="<?= e($book['gutenberg_url']) ?>" target="_blank" class="btn btn-xs btn-outline-info" title="Test Reading Link">
                                    <i class="bi bi-box-arrow-up-right"></i>
                                </a>
                            </td>
                            <td class="text-end">
                                <div class="btn-group btn-group-sm">
                                    <a href="/php_bookstore/book_detail.php?id=<?= $book['id'] ?>" class="btn btn-outline-secondary" title="View Public Page">
                                        <i class="bi bi-eye"></i>
                                    </a>
                                    <a href="/php_bookstore/admin/edit_book.php?id=<?= $book['id'] ?>" class="btn btn-outline-primary" title="Edit Book">
                                        <i class="bi bi-pencil-square"></i> Edit
                                    </a>
                                    <button type="button" class="btn btn-outline-danger" title="Delete Book" onclick="confirmDeleteBook(<?= $book['id'] ?>, '<?= e(addslashes($book['title'])) ?>')">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Delete Confirmation Modal -->
<div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <form method="POST" action="/php_bookstore/admin/delete_book.php" class="modal-content">
            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
            <input type="hidden" name="book_id" id="delete-book-id">
            <div class="modal-header bg-danger text-white">
                <h5 class="modal-title"><i class="bi bi-exclamation-triangle-fill me-2"></i>Confirm Book Deletion</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to permanently delete <strong id="delete-book-title"></strong> from the database?</p>
                <div class="alert alert-warning small mb-0">
                    This action executes a MySQL <code>DELETE FROM books WHERE id = ?</code> prepared statement.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-danger">Confirm Delete</button>
            </div>
        </form>
    </div>
</div>

<script>
function confirmDeleteBook(id, title) {
    document.getElementById('delete-book-id').value = id;
    document.getElementById('delete-book-title').textContent = title;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
