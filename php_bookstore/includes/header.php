<?php
require_once __DIR__ . '/auth_middleware.php';
$cart_count = get_cart_count();
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= isset($page_title) ? e($page_title) . ' - ' : '' ?>Classic Gutenberg Bookstore</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <!-- Custom Style -->
    <link rel="stylesheet" href="/php_bookstore/assets/css/style.css">
</head>
<body class="bg-light d-flex flex-column min-vh-100">

<!-- Navigation Bar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2" id="main-nav">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-warning" href="/php_bookstore/index.php" id="brand-link">
            <i class="bi bi-book-half fs-4"></i>
            <span>Gutenberg Books</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent" aria-controls="navContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link <?= $current_page === 'index.php' ? 'active text-warning fw-bold' : '' ?>" href="/php_bookstore/index.php" id="nav-home">
                        <i class="bi bi-house-door-fill text-warning me-1"></i> Home Page
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= $current_page === 'books.php' ? 'active text-warning fw-bold' : '' ?>" href="/php_bookstore/books.php" id="nav-books">
                        <i class="bi bi-collection me-1"></i> Catalog
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= $current_page === 'my_library.php' ? 'active text-warning fw-bold' : '' ?>" href="/php_bookstore/my_library.php" id="nav-library">
                        <i class="bi bi-heart-fill me-1 text-danger"></i> Favorites/List
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= $current_page === 'history.php' ? 'active text-warning fw-bold' : '' ?>" href="/php_bookstore/history.php" id="nav-history">
                        <i class="bi bi-clock-history me-1 text-info"></i> History
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link <?= $current_page === 'profile.php' ? 'active text-warning fw-bold' : '' ?>" href="/php_bookstore/profile.php" id="nav-profile">
                        <i class="bi bi-person-circle me-1 text-warning"></i> Profile
                    </a>
                </li>
            </ul>

            <ul class="navbar-nav ms-auto align-items-lg-center gap-2">
                <!-- Cart Link with Dynamic Badge -->
                <li class="nav-item">
                    <a class="btn btn-outline-light position-relative px-3 py-1 d-flex align-items-center gap-1" href="/php_bookstore/cart.php" id="nav-cart-btn">
                        <i class="bi bi-bag"></i> Cart
                        <span class="badge bg-warning text-dark rounded-pill ms-1" id="cart-badge"><?= $cart_count ?></span>
                    </a>
                </li>

                <?php if (is_logged_in()): ?>
                    <?php if (is_admin()): ?>
                        <li class="nav-item dropdown">
                            <a class="btn btn-warning dropdown-toggle fw-semibold" href="#" role="button" data-bs-toggle="dropdown" id="adminDropdown">
                                <i class="bi bi-shield-lock-fill me-1"></i> Admin Panel
                            </a>
                            <ul class="dropdown-menu dropdown-menu-end shadow">
                                <li><a class="dropdown-item" href="/php_bookstore/admin/books.php"><i class="bi bi-journal-text me-2"></i>Manage Books (CRUD)</a></li>
                                <li><a class="dropdown-item" href="/php_bookstore/admin/add_book.php"><i class="bi bi-plus-circle me-2"></i>Add New Book</a></li>
                                <li><a class="dropdown-item" href="/php_bookstore/admin/orders.php"><i class="bi bi-receipt-cutoff me-2"></i>All Customer Orders</a></li>
                            </ul>
                        </li>
                    <?php endif; ?>

                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle text-white d-flex align-items-center gap-1" href="#" role="button" data-bs-toggle="dropdown" id="userDropdown">
                            <i class="bi bi-person-circle fs-5"></i>
                            <span><?= e($_SESSION['user_name'] ?? 'Account') ?></span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end shadow">
                            <li class="dropdown-header text-muted small"><?= e($_SESSION['user_email'] ?? '') ?></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="/php_bookstore/my_library.php"><i class="bi bi-bookmarks-fill me-2 text-warning"></i>My Library (Favorites &amp; History)</a></li>
                            <li><a class="dropdown-item" href="/php_bookstore/order_history.php"><i class="bi bi-clock-history me-2"></i>Order History</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="/php_bookstore/logout.php"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                        </ul>
                    </li>
                <?php else: ?>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="/php_bookstore/login.php" id="nav-login">
                            <i class="bi bi-box-arrow-in-right me-1"></i> Login
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-primary btn-sm px-3" href="/php_bookstore/register.php" id="nav-register">
                            Register
                        </a>
                    </li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</nav>

<!-- Main Page Container -->
<main class="flex-grow-1 py-4">
    <div class="container">
        <!-- Flash Notifications -->
        <?php if (!empty($_SESSION['flash_success'])): ?>
            <div class="alert alert-success alert-dismissible fade show shadow-sm" role="alert" id="alert-flash-success">
                <i class="bi bi-check-circle-fill me-2"></i> <?= e($_SESSION['flash_success']) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <?php unset($_SESSION['flash_success']); ?>
        <?php endif; ?>

        <?php if (!empty($_SESSION['flash_error'])): ?>
            <div class="alert alert-danger alert-dismissible fade show shadow-sm" role="alert" id="alert-flash-error">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> <?= e($_SESSION['flash_error']) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            <?php unset($_SESSION['flash_error']); ?>
        <?php endif; ?>
