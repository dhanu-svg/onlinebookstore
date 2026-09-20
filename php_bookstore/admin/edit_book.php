<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_middleware.php';

require_admin('/php_bookstore/login.php');

$book_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($book_id <= 0) {
    header('Location: /php_bookstore/admin/books.php');
    exit;
}

$page_title = "Admin: Edit Book Record #{$book_id}";
$errors = [];
$update_success = false;
$submitted_data = null;

// Fetch current book record
try {
    $stmt = $pdo->prepare("SELECT * FROM books WHERE id = :id");
    $stmt->execute([':id' => $book_id]);
    $book = $stmt->fetch();

    if (!$book) {
        $_SESSION['flash_error'] = "Book #{$book_id} was not found in the database.";
        header('Location: /php_bookstore/admin/books.php');
        exit;
    }
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}

$title = $book['title'];
$author = $book['author'];
$description = $book['description'];
$price = $book['price'];
$cover_image = $book['cover_image'];
$stock = $book['stock'];
$gutenberg_url = $book['gutenberg_url'];
$isbn = $book['isbn'] ?? '';
$year = $book['year'] ?? '';
$genre = $book['genre'] ?? 'Classic Literature';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = 'CSRF security token invalid.';
    } else {
        $title = trim($_POST['title'] ?? '');
        $author = trim($_POST['author'] ?? '');
        $description = trim($_POST['description'] ?? '');
        $price = trim($_POST['price'] ?? '');
        $cover_image = trim($_POST['cover_image'] ?? '');
        $stock = trim($_POST['stock'] ?? '');
        $gutenberg_url = trim($_POST['gutenberg_url'] ?? '');
        $isbn = trim($_POST['isbn'] ?? '');
        $year = trim($_POST['year'] ?? '');
        $genre = trim($_POST['genre'] ?? '');

        // Validation
        if (empty($title)) $errors[] = 'Title is required.';
        if (empty($author)) $errors[] = 'Author is required.';
        if (empty($description)) $errors[] = 'Description is required.';
        if (!is_numeric($price) || (float)$price < 0) $errors[] = 'Price must be non-negative.';
        if (empty($cover_image) || !filter_var($cover_image, FILTER_VALIDATE_URL)) $errors[] = 'Valid cover URL is required.';
        if (!is_numeric($stock) || (int)$stock < 0) $errors[] = 'Stock must be non-negative.';
        if (empty($gutenberg_url) || !filter_var($gutenberg_url, FILTER_VALIDATE_URL)) $errors[] = 'Valid Gutenberg reading URL is required.';

        if (empty($errors)) {
            try {
                $update_stmt = $pdo->prepare("
                    UPDATE books SET 
                        title = :title,
                        author = :author,
                        description = :description,
                        price = :price,
                        cover_image = :cover_image,
                        stock = :stock,
                        gutenberg_url = :gutenberg_url,
                        isbn = :isbn,
                        year = :year,
                        genre = :genre
                    WHERE id = :id
                ");

                $update_stmt->execute([
                    ':title' => $title,
                    ':author' => $author,
                    ':description' => $description,
                    ':price' => (float)$price,
                    ':cover_image' => $cover_image,
                    ':stock' => (int)$stock,
                    ':gutenberg_url' => $gutenberg_url,
                    ':isbn' => !empty($isbn) ? $isbn : null,
                    ':year' => !empty($year) ? (int)$year : null,
                    ':genre' => $genre,
                    ':id' => $book_id
                ]);

                $update_success = true;
                $submitted_data = [
                    'id' => $book_id,
                    'title' => $title,
                    'author' => $author,
                    'description' => $description,
                    'price' => number_format((float)$price, 2),
                    'cover_image' => $cover_image,
                    'stock' => (int)$stock,
                    'gutenberg_url' => $gutenberg_url,
                    'isbn' => $isbn,
                    'year' => $year,
                    'genre' => $genre
                ];
            } catch (PDOException $e) {
                $errors[] = "Update failed: " . $e->getMessage();
            }
        }
    }
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="row justify-content-center my-3">
    <div class="col-lg-9">
        <nav aria-label="breadcrumb" class="mb-3">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/php_bookstore/index.php">Store</a></li>
                <li class="breadcrumb-item"><a href="/php_bookstore/admin/books.php">Manage Books</a></li>
                <li class="breadcrumb-item active">Edit Book #<?= $book_id ?></li>
            </ol>
        </nav>

        <?php if ($update_success && $submitted_data): ?>
            <!-- CONFIRMATION OF SUBMITTED FORM DATA -->
            <div class="card border-0 shadow-sm mb-5">
                <div class="card-header bg-success text-white py-3">
                    <h4 class="mb-0 fw-bold"><i class="bi bi-check-circle-fill me-2"></i>Book Record Successfully Updated!</h4>
                    <small class="opacity-75">All changes to Record #<?= $book_id ?> were persisted to the MySQL database.</small>
                </div>
                <div class="card-body p-4">
                    <div class="alert alert-light border mb-4">
                        <h6 class="fw-bold mb-3">Updated Record Summary:</h6>
                        <div class="row g-3">
                            <div class="col-md-3 text-center">
                                <img src="<?= e($submitted_data['cover_image']) ?>" alt="" class="img-fluid rounded shadow-sm" style="max-height: 200px;">
                            </div>
                            <div class="col-md-9">
                                <table class="table table-sm table-borderless">
                                    <tr>
                                        <th style="width: 25%;">Title:</th>
                                        <td class="fw-bold"><?= e($submitted_data['title']) ?></td>
                                    </tr>
                                    <tr>
                                        <th>Author:</th>
                                        <td><?= e($submitted_data['author']) ?></td>
                                    </tr>
                                    <tr>
                                        <th>Price:</th>
                                        <td class="text-primary fw-bold">$<?= e($submitted_data['price']) ?></td>
                                    </tr>
                                    <tr>
                                        <th>Stock Quantity:</th>
                                        <td><?= e($submitted_data['stock']) ?> units</td>
                                    </tr>
                                    <tr>
                                        <th>Genre:</th>
                                        <td><span class="badge bg-secondary"><?= e($submitted_data['genre']) ?></span></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex gap-2">
                        <a href="/php_bookstore/book_detail.php?id=<?= $book_id ?>" class="btn btn-primary" target="_blank">
                            <i class="bi bi-box-arrow-up-right me-1"></i> View Live Detail Page
                        </a>
                        <a href="/php_bookstore/admin/books.php" class="btn btn-outline-dark">
                            Back to Books List
                        </a>
                    </div>
                </div>
            </div>
        <?php else: ?>
            <!-- EDIT FORM -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h4 class="fw-bold mb-0"><i class="bi bi-pencil-square text-primary me-2"></i>Edit Book Record #<?= $book_id ?></h4>
                    <span class="badge bg-secondary">MySQL ID: <?= $book_id ?></span>
                </div>
                <div class="card-body p-4 p-md-5">
                    <?php if (!empty($errors)): ?>
                        <div class="alert alert-danger shadow-sm mb-4">
                            <ul class="mb-0 ps-3">
                                <?php foreach ($errors as $err): ?>
                                    <li><?= e($err) ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="/php_bookstore/admin/edit_book.php?id=<?= $book_id ?>" novalidate>
                        <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

                        <div class="row g-3">
                            <div class="col-md-8">
                                <label for="book-title" class="form-label fw-semibold">Book Title <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="book-title" name="title" value="<?= e($title) ?>" required>
                            </div>
                            <div class="col-md-4">
                                <label for="book-author" class="form-label fw-semibold">Author <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="book-author" name="author" value="<?= e($author) ?>" required>
                            </div>

                            <div class="col-md-4">
                                <label for="book-genre" class="form-label fw-semibold">Genre</label>
                                <input type="text" class="form-control" id="book-genre" name="genre" value="<?= e($genre) ?>" required>
                            </div>

                            <div class="col-md-4">
                                <label for="book-price" class="form-label fw-semibold">Price ($) <span class="text-danger">*</span></label>
                                <input type="number" step="0.01" min="0" class="form-control" id="book-price" name="price" value="<?= e($price) ?>" required>
                            </div>

                            <div class="col-md-4">
                                <label for="book-stock" class="form-label fw-semibold">Stock Quantity <span class="text-danger">*</span></label>
                                <input type="number" min="0" class="form-control" id="book-stock" name="stock" value="<?= e($stock) ?>" required>
                            </div>

                            <div class="col-12">
                                <label for="book-cover" class="form-label fw-semibold">Cover Image URL <span class="text-danger">*</span></label>
                                <input type="url" class="form-control" id="book-cover" name="cover_image" value="<?= e($cover_image) ?>" required>
                            </div>

                            <div class="col-12">
                                <label for="book-gutenberg" class="form-label fw-semibold">Project Gutenberg Reading Source URL <span class="text-danger">*</span></label>
                                <input type="url" class="form-control" id="book-gutenberg" name="gutenberg_url" value="<?= e($gutenberg_url) ?>" required>
                            </div>

                            <div class="col-md-6">
                                <label for="book-isbn" class="form-label fw-semibold">ISBN-13</label>
                                <input type="text" class="form-control" id="book-isbn" name="isbn" value="<?= e($isbn) ?>">
                            </div>

                            <div class="col-md-6">
                                <label for="book-year" class="form-label fw-semibold">Year Published</label>
                                <input type="number" class="form-control" id="book-year" name="year" value="<?= e($year) ?>">
                            </div>

                            <div class="col-12">
                                <label for="book-desc" class="form-label fw-semibold">Description / Synopsis <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="book-desc" name="description" rows="5" required><?= e($description) ?></textarea>
                            </div>
                        </div>

                        <hr class="my-4">

                        <div class="d-flex justify-content-between">
                            <a href="/php_bookstore/admin/books.php" class="btn btn-outline-secondary">
                                Cancel
                            </a>
                            <button type="submit" class="btn btn-primary px-4 fw-semibold">
                                <i class="bi bi-save me-1"></i> Update Book Record
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
