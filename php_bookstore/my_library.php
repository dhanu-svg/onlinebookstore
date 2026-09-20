<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

require_login('/php_bookstore/login.php');

$page_title = "My Library: Favorites, Read Later & Reading History";
$user_id = (int)$_SESSION['user_id'];

// Handle POST actions (deletions / note updates) with CSRF protection
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (verify_csrf_token($token)) {
        $action = $_POST['action'] ?? '';
        
        if ($action === 'delete_favorite') {
            $fav_id = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare("DELETE FROM favorites WHERE id = :id AND user_id = :uid");
            $stmt->execute([':id' => $fav_id, ':uid' => $user_id]);
            $_SESSION['flash_success'] = "Book removed from your Favorites.";
        } elseif ($action === 'delete_read_later') {
            $rl_id = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare("DELETE FROM read_later WHERE id = :id AND user_id = :uid");
            $stmt->execute([':id' => $rl_id, ':uid' => $user_id]);
            $_SESSION['flash_success'] = "Book removed from Read Later list.";
        } elseif ($action === 'delete_history') {
            $h_id = (int)($_POST['id'] ?? 0);
            $stmt = $pdo->prepare("DELETE FROM reading_history WHERE id = :id AND user_id = :uid");
            $stmt->execute([':id' => $h_id, ':uid' => $user_id]);
            $_SESSION['flash_success'] = "Entry removed from Reading History.";
        } elseif ($action === 'clear_all_history') {
            $stmt = $pdo->prepare("DELETE FROM reading_history WHERE user_id = :uid");
            $stmt->execute([':uid' => $user_id]);
            $_SESSION['flash_success'] = "Your reading history has been completely cleared.";
        }
    }
    header('Location: /php_bookstore/my_library.php');
    exit;
}

// Fetch Favorites
$fav_stmt = $pdo->prepare("
    SELECT f.*, b.title, b.author, b.cover_image, b.price, b.stock, b.gutenberg_url, b.genre
    FROM favorites f
    JOIN books b ON f.book_id = b.id
    WHERE f.user_id = :uid
    ORDER BY f.created_at DESC
");
$fav_stmt->execute([':uid' => $user_id]);
$favorites = $fav_stmt->fetchAll();

// Fetch Read Later
$rl_stmt = $pdo->prepare("
    SELECT rl.*, b.title, b.author, b.cover_image, b.price, b.stock, b.gutenberg_url, b.genre
    FROM read_later rl
    JOIN books b ON rl.book_id = b.id
    WHERE rl.user_id = :uid
    ORDER BY rl.added_at DESC
");
$rl_stmt->execute([':uid' => $user_id]);
$read_later = $rl_stmt->fetchAll();

// Fetch Reading History
$rh_stmt = $pdo->prepare("
    SELECT rh.*, b.title, b.author, b.cover_image, b.price, b.stock, b.gutenberg_url, b.genre
    FROM reading_history rh
    JOIN books b ON rh.book_id = b.id
    WHERE rh.user_id = :uid
    ORDER BY rh.read_at DESC
");
$rh_stmt->execute([':uid' => $user_id]);
$reading_history = $rh_stmt->fetchAll();

require_once __DIR__ . '/includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
    <div>
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-1">
                <li class="breadcrumb-item"><a href="/php_bookstore/index.php">Store</a></li>
                <li class="breadcrumb-item active">My Library</li>
            </ol>
        </nav>
        <h2 class="fw-bold mb-0"><i class="bi bi-bookmarks-fill text-warning me-2"></i>My Personal Library</h2>
        <p class="text-muted mb-0">Manage your saved favorites, read later shelf, and reading history logs.</p>
    </div>
    <div class="d-flex gap-2">
        <a href="/php_bookstore/books.php" class="btn btn-primary btn-sm">
            <i class="bi bi-search me-1"></i> Discover More Books
        </a>
    </div>
</div>

<!-- Tabs Navigation -->
<ul class="nav nav-tabs mb-4" id="libraryTab" role="tablist">
    <li class="nav-item" role="presentation">
        <button class="nav-link active fw-semibold" id="favorites-tab" data-bs-toggle="tab" data-bs-target="#favorites-pane" type="button" role="tab">
            <i class="bi bi-heart-fill text-danger me-1"></i> Favorites <span class="badge bg-danger rounded-pill ms-1"><?= count($favorites) ?></span>
        </button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link fw-semibold" id="readlater-tab" data-bs-toggle="tab" data-bs-target="#readlater-pane" type="button" role="tab">
            <i class="bi bi-clock text-primary me-1"></i> Read Later <span class="badge bg-primary rounded-pill ms-1"><?= count($read_later) ?></span>
        </button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link fw-semibold" id="history-tab" data-bs-toggle="tab" data-bs-target="#history-pane" type="button" role="tab">
            <i class="bi bi-clock-history text-success me-1"></i> Reading History <span class="badge bg-success rounded-pill ms-1"><?= count($reading_history) ?></span>
        </button>
    </li>
</ul>

<div class="tab-content" id="libraryTabContent">
    <!-- 1. FAVORITES TAB -->
    <div class="tab-pane fade show active" id="favorites-pane" role="tabpanel">
        <?php if (empty($favorites)): ?>
            <div class="card border-0 shadow-sm text-center py-5">
                <div class="card-body">
                    <i class="bi bi-heart text-muted display-4 mb-3"></i>
                    <h5 class="fw-bold">No Favorites Saved Yet</h5>
                    <p class="text-muted mb-3">Click the heart icon on any book card to bookmark your favorite literary masterpieces.</p>
                    <a href="/php_bookstore/books.php" class="btn btn-outline-primary btn-sm">Browse Catalog</a>
                </div>
            </div>
        <?php else: ?>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                <?php foreach ($favorites as $f): ?>
                    <div class="col">
                        <div class="card h-100 border-0 shadow-sm">
                            <div class="card-body d-flex gap-3">
                                <img src="<?= e($f['cover_image']) ?>" alt="<?= e($f['title']) ?>" class="rounded shadow-sm" style="width: 75px; height: 110px; object-fit: cover;">
                                <div class="flex-grow-1 d-flex flex-column">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <h6 class="fw-bold mb-0 text-truncate" style="max-width: 170px;" title="<?= e($f['title']) ?>">
                                            <?= e($f['title']) ?>
                                        </h6>
                                        <form method="POST" action="/php_bookstore/my_library.php" onsubmit="return confirm('Remove from favorites?');">
                                            <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                            <input type="hidden" name="action" value="delete_favorite">
                                            <input type="hidden" name="id" value="<?= $f['id'] ?>">
                                            <button type="submit" class="btn btn-link text-danger p-0 ms-1" title="Remove Favorite">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </form>
                                    </div>
                                    <small class="text-muted mb-2"><?= e($f['author']) ?></small>
                                    <?php if (!empty($f['note'])): ?>
                                        <div class="small bg-light p-2 rounded mb-2 border fst-italic">
                                            "<?= e($f['note']) ?>"
                                        </div>
                                    <?php endif; ?>
                                    <div class="mt-auto d-flex gap-2">
                                        <a href="/php_bookstore/read.php?id=<?= $f['book_id'] ?>" class="btn btn-sm btn-outline-secondary" target="_blank">
                                            <i class="bi bi-book"></i> Read
                                        </a>
                                        <a href="/php_bookstore/book_detail.php?id=<?= $f['book_id'] ?>" class="btn btn-sm btn-outline-primary">
                                            Details
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- 2. READ LATER TAB -->
    <div class="tab-pane fade" id="readlater-pane" role="tabpanel">
        <?php if (empty($read_later)): ?>
            <div class="card border-0 shadow-sm text-center py-5">
                <div class="card-body">
                    <i class="bi bi-clock text-muted display-4 mb-3"></i>
                    <h5 class="fw-bold">Your Reading List is Empty</h5>
                    <p class="text-muted mb-3">Add books to your Read Later shelf to remember what to dive into next.</p>
                    <a href="/php_bookstore/books.php" class="btn btn-outline-primary btn-sm">Explore Books</a>
                </div>
            </div>
        <?php else: ?>
            <div class="card border-0 shadow-sm">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Book</th>
                                <th>Priority</th>
                                <th>Added Date</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($read_later as $rl): ?>
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-3">
                                            <img src="<?= e($rl['cover_image']) ?>" alt="" style="width: 40px; height: 60px; object-fit: cover;" class="rounded shadow-sm">
                                            <div>
                                                <strong><?= e($rl['title']) ?></strong>
                                                <div class="text-muted small">by <?= e($rl['author']) ?></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge <?= $rl['priority'] === 'high' ? 'bg-danger' : ($rl['priority'] === 'medium' ? 'bg-warning text-dark' : 'bg-secondary') ?>">
                                            <?= ucfirst($rl['priority']) ?>
                                        </span>
                                    </td>
                                    <td class="small text-muted"><?= date('M j, Y', strtotime($rl['added_at'])) ?></td>
                                    <td class="text-end">
                                        <div class="d-flex justify-content-end gap-2">
                                            <a href="/php_bookstore/read.php?id=<?= $rl['book_id'] ?>" class="btn btn-sm btn-outline-success">
                                                <i class="bi bi-book me-1"></i> Start Reading
                                            </a>
                                            <form method="POST" action="/php_bookstore/my_library.php" onsubmit="return confirm('Remove from Read Later?');">
                                                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                                <input type="hidden" name="action" value="delete_read_later">
                                                <input type="hidden" name="id" value="<?= $rl['id'] ?>">
                                                <button type="submit" class="btn btn-sm btn-outline-danger">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <!-- 3. READING HISTORY TAB -->
    <div class="tab-pane fade" id="history-pane" role="tabpanel">
        <?php if (empty($reading_history)): ?>
            <div class="card border-0 shadow-sm text-center py-5">
                <div class="card-body">
                    <i class="bi bi-clock-history text-muted display-4 mb-3"></i>
                    <h5 class="fw-bold">No Reading History Recorded</h5>
                    <p class="text-muted mb-3">Whenever you open and read a book online, it will automatically be tracked here.</p>
                    <a href="/php_bookstore/books.php" class="btn btn-outline-primary btn-sm">Start Reading Classics</a>
                </div>
            </div>
        <?php else: ?>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-muted small">Showing <?= count($reading_history) ?> logged reading sessions</span>
                <form method="POST" action="/php_bookstore/my_library.php" onsubmit="return confirm('Are you sure you want to clear your ENTIRE reading history?');">
                    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                    <input type="hidden" name="action" value="clear_all_history">
                    <button type="submit" class="btn btn-outline-danger btn-sm">
                        <i class="bi bi-trash3 me-1"></i> Clear All History
                    </button>
                </form>
            </div>

            <div class="card border-0 shadow-sm">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Book</th>
                                <th>Reading Progress</th>
                                <th>Notes / Log</th>
                                <th>Last Read</th>
                                <th class="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($reading_history as $rh): ?>
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-3">
                                            <img src="<?= e($rh['cover_image']) ?>" alt="" style="width: 40px; height: 60px; object-fit: cover;" class="rounded shadow-sm">
                                            <div>
                                                <strong><?= e($rh['title']) ?></strong>
                                                <div class="text-muted small">by <?= e($rh['author']) ?></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="width: 20%;">
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="progress flex-grow-1" style="height: 6px;">
                                                <div class="progress-bar bg-success" style="width: <?= $rh['progress_percent'] ?>%"></div>
                                            </div>
                                            <span class="small fw-semibold"><?= $rh['progress_percent'] ?>%</span>
                                        </div>
                                    </td>
                                    <td class="small text-muted">
                                        <?= !empty($rh['notes']) ? e($rh['notes']) : '<em>No notes recorded</em>' ?>
                                    </td>
                                    <td class="small text-muted"><?= date('M j, Y g:i a', strtotime($rh['read_at'])) ?></td>
                                    <td class="text-end">
                                        <div class="d-flex justify-content-end gap-2">
                                            <a href="/php_bookstore/read.php?id=<?= $rh['book_id'] ?>" class="btn btn-sm btn-outline-primary" target="_blank">
                                                <i class="bi bi-arrow-repeat me-1"></i> Resume
                                            </a>
                                            <form method="POST" action="/php_bookstore/my_library.php" onsubmit="return confirm('Delete this history record?');">
                                                <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
                                                <input type="hidden" name="action" value="delete_history">
                                                <input type="hidden" name="id" value="<?= $rh['id'] ?>">
                                                <button type="submit" class="btn btn-sm btn-outline-danger" title="Delete from history">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
