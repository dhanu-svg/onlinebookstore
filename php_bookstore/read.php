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
        die("Book not found.");
    }
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reading: <?= e($book['title']) ?> - Classic Gutenberg Reader</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body, html {
            height: 100%;
            margin: 0;
            overflow: hidden;
            background-color: #1a1a24;
            color: #f1f1f1;
        }
        #reader-frame {
            width: 100%;
            height: calc(100vh - 56px);
            border: none;
            background-color: #ffffff;
        }
        .reader-bar {
            height: 56px;
            background-color: #1e1e2d;
            border-bottom: 1px solid #323248;
        }
    </style>
</head>
<body class="d-flex flex-column">

<!-- Reader Control Navbar -->
<header class="reader-bar px-3 d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center gap-3">
        <a href="/php_bookstore/book_detail.php?id=<?= $book['id'] ?>" class="btn btn-outline-light btn-sm" title="Back to Book Details">
            <i class="bi bi-arrow-left me-1"></i> Back to Store
        </a>
        <div class="text-truncate" style="max-width: 450px;">
            <strong class="text-white"><?= e($book['title']) ?></strong>
            <span class="text-white-50 ms-2 small">by <?= e($book['author']) ?></span>
        </div>
    </div>

    <div class="d-flex align-items-center gap-2">
        <span class="badge bg-warning text-dark d-none d-md-inline-block">Project Gutenberg Public Domain</span>
        <a href="<?= e($book['gutenberg_url']) ?>" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-info" title="Open source in new tab">
            <i class="bi bi-box-arrow-up-right me-1"></i> Original Gutenberg URL
        </a>
        <button class="btn btn-sm btn-outline-secondary text-white" onclick="toggleFullScreen()" title="Full Screen">
            <i class="bi bi-arrows-fullscreen"></i>
        </button>
    </div>
</header>

<!-- Main Gutenberg Embedded Reading Area -->
<main class="flex-grow-1 position-relative">
    <iframe id="reader-frame" 
            src="<?= e($book['gutenberg_url']) ?>" 
            title="Read <?= e($book['title']) ?>" 
            sandbox="allow-same-origin allow-scripts" 
            allowfullscreen>
    </iframe>
</main>

<script>
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
</script>
</body>
</html>
