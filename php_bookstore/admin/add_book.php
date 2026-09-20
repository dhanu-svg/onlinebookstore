<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_middleware.php';

require_admin('/php_bookstore/login.php');

$page_title = "Admin: Add New Book";
$errors = [];
$submitted_data = null;
$insert_success = false;

// Form variables with default initial values
$title = '';
$author = '';
$description = '';
$price = '';
$cover_image = '';
$stock = '10';
$gutenberg_url = '';
$isbn = '';
$year = '';
$genre = 'Classic Literature';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = 'Security CSRF validation failed.';
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
        $genre = trim($_POST['genre'] ?? 'Classic Literature');

        // Server-side Validation
        if (empty($title)) {
            $errors[] = 'Book title is required.';
        } elseif (mb_strlen($title) > 255) {
            $errors[] = 'Book title cannot exceed 255 characters.';
        }

        if (empty($author)) {
            $errors[] = 'Author name is required.';
        } elseif (mb_strlen($author) > 150) {
            $errors[] = 'Author name cannot exceed 150 characters.';
        }

        if (empty($description)) {
            $errors[] = 'Book description is required.';
        }

        if (!is_numeric($price) || (float)$price < 0) {
            $errors[] = 'Price must be a valid non-negative number.';
        }

        if (empty($cover_image) || !filter_var($cover_image, FILTER_VALIDATE_URL)) {
            $errors[] = 'A valid cover image URL is required (e.g. from Open Library or Project Gutenberg).';
        }

        if (!is_numeric($stock) || (int)$stock < 0) {
            $errors[] = 'Stock quantity must be a non-negative integer.';
        }

        if (empty($gutenberg_url) || !filter_var($gutenberg_url, FILTER_VALIDATE_URL)) {
            $errors[] = 'A valid reading source URL is required (e.g. https://www.gutenberg.org/cache/epub/...).';
        }

        if (!empty($year) && (!is_numeric($year) || (int)$year < 0 || (int)$year > 2030)) {
            $errors[] = 'Publication year must be a valid 4-digit year.';
        }

        // Database insertion via prepared statement if no validation errors
        if (empty($errors)) {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO books (title, author, description, price, cover_image, stock, gutenberg_url, isbn, year, genre)
                    VALUES (:title, :author, :description, :price, :cover_image, :stock, :gutenberg_url, :isbn, :year, :genre)
                ");

                $stmt->execute([
                    ':title' => $title,
                    ':author' => $author,
                    ':description' => $description,
                    ':price' => (float)$price,
                    ':cover_image' => $cover_image,
                    ':stock' => (int)$stock,
                    ':gutenberg_url' => $gutenberg_url,
                    ':isbn' => !empty($isbn) ? $isbn : null,
                    ':year' => !empty($year) ? (int)$year : null,
                    ':genre' => $genre
                ]);

                $new_id = $pdo->lastInsertId();
                $insert_success = true;

                // Save submitted data for confirmation screen
                $submitted_data = [
                    'id' => $new_id,
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
                $errors[] = "Failed to insert book record into MySQL: " . $e->getMessage();
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
                <li class="breadcrumb-item active">Add Book</li>
            </ol>
        </nav>

        <?php if ($insert_success && $submitted_data): ?>
            <!-- FORM CONFIRMATION SCREEN: Displays submitted data back to the user -->
            <div class="card border-0 shadow-sm mb-5">
                <div class="card-header bg-success text-white py-3">
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-check2-circle fs-3"></i>
                        <div>
                            <h4 class="mb-0 fw-bold">Book Successfully Added to Database!</h4>
                            <small class="opacity-75">MySQL Record ID #<?= e($submitted_data['id']) ?> was created using secure prepared statements.</small>
                        </div>
                    </div>
                </div>
                <div class="card-body p-4 p-md-5">
                    <div class="alert alert-light border mb-4">
                        <h5 class="fw-bold mb-3"><i class="bi bi-card-checklist text-primary me-2"></i>Confirmation of Submitted Form Data:</h5>
                        
                        <div class="row g-3">
                            <div class="col-md-4 text-center">
                                <img src="<?= e($submitted_data['cover_image']) ?>" 
                                     alt="<?= e($submitted_data['title']) ?>" 
                                     class="img-fluid rounded shadow-sm" 
                                     style="max-height: 240px; object-fit: cover;">
                            </div>
                            <div class="col-md-8">
                                <table class="table table-sm table-borderless">
                                    <tbody>
                                        <tr>
                                            <th style="width: 30%;">Title:</th>
                                            <td class="fw-bold fs-6"><?= e($submitted_data['title']) ?></td>
                                        </tr>
                                        <tr>
                                            <th>Author:</th>
                                            <td><?= e($submitted_data['author']) ?></td>
                                        </tr>
                                        <tr>
                                            <th>Genre:</th>
                                            <td><span class="badge bg-secondary"><?= e($submitted_data['genre']) ?></span></td>
                                        </tr>
                                        <tr>
                                            <th>Price:</th>
                                            <td class="text-primary fw-bold">$<?= e($submitted_data['price']) ?></td>
                                        </tr>
                                        <tr>
                                            <th>Initial Stock:</th>
                                            <td><?= e($submitted_data['stock']) ?> units</td>
                                        </tr>
                                        <tr>
                                            <th>ISBN:</th>
                                            <td><?= !empty($submitted_data['isbn']) ? e($submitted_data['isbn']) : '<span class="text-muted">N/A</span>' ?></td>
                                        </tr>
                                        <tr>
                                            <th>Published Year:</th>
                                            <td><?= !empty($submitted_data['year']) ? e($submitted_data['year']) : '<span class="text-muted">N/A</span>' ?></td>
                                        </tr>
                                        <tr>
                                            <th>Gutenberg Source:</th>
                                            <td>
                                                <a href="<?= e($submitted_data['gutenberg_url']) ?>" target="_blank" class="text-truncate d-inline-block" style="max-width: 320px;">
                                                    <?= e($submitted_data['gutenberg_url']) ?>
                                                </a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="col-12 mt-3">
                                <h6>Description / Synopsis:</h6>
                                <p class="text-muted bg-white p-3 rounded border small mb-0"><?= nl2br(e($submitted_data['description'])) ?></p>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex gap-2">
                        <a href="/php_bookstore/book_detail.php?id=<?= $submitted_data['id'] ?>" class="btn btn-primary" target="_blank">
                            <i class="bi bi-box-arrow-up-right me-1"></i> View Live Detail Page
                        </a>
                        <a href="/php_bookstore/admin/add_book.php" class="btn btn-outline-secondary">
                            <i class="bi bi-plus-circle me-1"></i> Add Another Book
                        </a>
                        <a href="/php_bookstore/admin/books.php" class="btn btn-outline-dark ms-auto">
                            Back to Books List
                        </a>
                    </div>
                </div>
            </div>
        <?php else: ?>
            <!-- INSERT FORM -->
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                    <h4 class="fw-bold mb-0"><i class="bi bi-journal-plus text-primary me-2"></i>Add Public-Domain Book Record</h4>
                    <span class="badge bg-warning text-dark">Admin Only Form</span>
                </div>
                <div class="card-body p-4 p-md-5">
                    <?php if (!empty($errors)): ?>
                        <div class="alert alert-danger shadow-sm mb-4">
                            <h6 class="fw-bold mb-2"><i class="bi bi-exclamation-octagon-fill me-1"></i> Form Submission Errors:</h6>
                            <ul class="mb-0 ps-3">
                                <?php foreach ($errors as $err): ?>
                                    <li><?= e($err) ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    <?php endif; ?>

                    <form method="POST" action="/php_bookstore/admin/add_book.php" id="add-book-form" novalidate onsubmit="return validateBookForm(this)">
                        <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

                        <!-- Quick Template Pre-fill -->
                        <div class="alert alert-info py-2 px-3 small d-flex justify-content-between align-items-center mb-4">
                            <span><i class="bi bi-lightbulb-fill text-warning me-1"></i> Quick Pre-fill Sample:</span>
                            <div class="btn-group btn-group-sm">
                                <button type="button" class="btn btn-outline-primary btn-sm" onclick="prefillJaneEyre()">Jane Eyre</button>
                                <button type="button" class="btn btn-outline-primary btn-sm" onclick="prefillTimeMachine()">The Time Machine</button>
                            </div>
                        </div>

                        <div class="row g-3">
                            <div class="col-md-8">
                                <label for="book-title" class="form-label fw-semibold">Book Title <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="book-title" name="title" value="<?= e($title) ?>" placeholder="e.g., Jane Eyre" required maxlength="255">
                                <div class="invalid-feedback">Please enter the title.</div>
                            </div>
                            <div class="col-md-4">
                                <label for="book-author" class="form-label fw-semibold">Author <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="book-author" name="author" value="<?= e($author) ?>" placeholder="e.g., Charlotte Brontë" required maxlength="150">
                                <div class="invalid-feedback">Author name is required.</div>
                            </div>

                            <div class="col-md-4">
                                <label for="book-genre" class="form-label fw-semibold">Genre</label>
                                <select class="form-select" id="book-genre" name="genre">
                                    <option value="Classic Literature" <?= $genre === 'Classic Literature' ? 'selected' : '' ?>>Classic Literature</option>
                                    <option value="Gothic Horror" <?= $genre === 'Gothic Horror' ? 'selected' : '' ?>>Gothic Horror</option>
                                    <option value="Classic Romance" <?= $genre === 'Classic Romance' ? 'selected' : '' ?>>Classic Romance</option>
                                    <option value="Science Fiction" <?= $genre === 'Science Fiction' ? 'selected' : '' ?>>Science Fiction</option>
                                    <option value="Mystery & Crime" <?= $genre === 'Mystery & Crime' ? 'selected' : '' ?>>Mystery & Crime</option>
                                    <option value="Adventure & Epic" <?= $genre === 'Adventure & Epic' ? 'selected' : '' ?>>Adventure & Epic</option>
                                    <option value="Philosophical Fiction" <?= $genre === 'Philosophical Fiction' ? 'selected' : '' ?>>Philosophical Fiction</option>
                                </select>
                            </div>

                            <div class="col-md-4">
                                <label for="book-price" class="form-label fw-semibold">Price ($) <span class="text-danger">*</span></label>
                                <input type="number" step="0.01" min="0" class="form-control" id="book-price" name="price" value="<?= e($price) ?>" placeholder="12.99" required>
                                <div class="invalid-feedback">Valid price is required.</div>
                            </div>

                            <div class="col-md-4">
                                <label for="book-stock" class="form-label fw-semibold">Stock Quantity <span class="text-danger">*</span></label>
                                <input type="number" min="0" class="form-control" id="book-stock" name="stock" value="<?= e($stock) ?>" required>
                                <div class="invalid-feedback">Stock quantity is required.</div>
                            </div>

                            <div class="col-12">
                                <label for="book-cover" class="form-label fw-semibold">Cover Image URL <span class="text-danger">*</span></label>
                                <input type="url" class="form-control" id="book-cover" name="cover_image" value="<?= e($cover_image) ?>" placeholder="https://covers.openlibrary.org/b/isbn/... or Project Gutenberg cover" required>
                                <div class="form-text small">Use Open Library Covers API (e.g., <code>https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg</code>) or Gutenberg cover URL.</div>
                                <div class="invalid-feedback">Valid image URL is required.</div>
                            </div>

                            <div class="col-12">
                                <label for="book-gutenberg" class="form-label fw-semibold">Project Gutenberg Reading Source URL <span class="text-danger">*</span></label>
                                <input type="url" class="form-control" id="book-gutenberg" name="gutenberg_url" value="<?= e($gutenberg_url) ?>" placeholder="https://www.gutenberg.org/cache/epub/1260/pg1260-images.html" required>
                                <div class="form-text small">Full free unabridged HTML/reader link from Project Gutenberg.</div>
                                <div class="invalid-feedback">Valid URL is required.</div>
                            </div>

                            <div class="col-md-6">
                                <label for="book-isbn" class="form-label fw-semibold">ISBN-13 (Optional)</label>
                                <input type="text" class="form-control" id="book-isbn" name="isbn" value="<?= e($isbn) ?>" placeholder="9780141441146">
                            </div>

                            <div class="col-md-6">
                                <label for="book-year" class="form-label fw-semibold">Year Published (Optional)</label>
                                <input type="number" class="form-control" id="book-year" name="year" value="<?= e($year) ?>" placeholder="1847">
                            </div>

                            <div class="col-12">
                                <label for="book-desc" class="form-label fw-semibold">Description / Synopsis <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="book-desc" name="description" rows="4" placeholder="Enter book synopsis and historical context..." required><?= e($description) ?></textarea>
                                <div class="invalid-feedback">Description is required.</div>
                            </div>
                        </div>

                        <hr class="my-4">

                        <div class="d-flex justify-content-between align-items-center">
                            <a href="/php_bookstore/admin/books.php" class="btn btn-outline-secondary">
                                Cancel
                            </a>
                            <button type="submit" class="btn btn-primary px-4 fw-semibold" id="btn-submit-add-book">
                                <i class="bi bi-check-lg me-1"></i> Save &amp; Insert Book Record
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<script>
function prefillJaneEyre() {
    document.getElementById('book-title').value = "Jane Eyre";
    document.getElementById('book-author').value = "Charlotte Brontë";
    document.getElementById('book-genre').value = "Gothic Horror";
    document.getElementById('book-price').value = "11.99";
    document.getElementById('book-stock').value = "20";
    document.getElementById('book-cover').value = "https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg";
    document.getElementById('book-gutenberg').value = "https://www.gutenberg.org/cache/epub/1260/pg1260-images.html";
    document.getElementById('book-isbn').value = "9780141441146";
    document.getElementById('book-year').value = "1847";
    document.getElementById('book-desc').value = "An orphaned governess discovers romance, mystery, and dark secrets locked within the attic of Thornfield Hall with Mr. Rochester, revolutionizing Victorian feminist literature.";
}

function prefillTimeMachine() {
    document.getElementById('book-title').value = "The Time Machine";
    document.getElementById('book-author').value = "H.G. Wells";
    document.getElementById('book-genre').value = "Science Fiction";
    document.getElementById('book-price').value = "9.95";
    document.getElementById('book-stock').value = "25";
    document.getElementById('book-cover').value = "https://covers.openlibrary.org/b/isbn/9780451528551-L.jpg";
    document.getElementById('book-gutenberg').value = "https://www.gutenberg.org/cache/epub/35/pg35-images.html";
    document.getElementById('book-isbn').value = "9780451528551";
    document.getElementById('book-year').value = "1895";
    document.getElementById('book-desc').value = "A Victorian scientist travels into the far future of AD 802,701, encountering the childlike Eloi and the subterranean Morlocks in the seminal foundation of time travel fiction.";
}

function validateBookForm(form) {
    let valid = true;
    ['title', 'author', 'price', 'cover_image', 'gutenberg_url', 'description'].forEach(field => {
        const el = form[field];
        if (!el || !el.value.trim()) {
            el.classList.add('is-invalid');
            valid = false;
        } else {
            el.classList.remove('is-invalid');
        }
    });
    return valid;
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
