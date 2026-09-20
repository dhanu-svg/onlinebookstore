<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_middleware.php';

require_admin('/php_bookstore/login.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $_SESSION['flash_error'] = "Security check failed. Invalid CSRF token.";
        header('Location: /php_bookstore/admin/books.php');
        exit;
    }

    $book_id = isset($_POST['book_id']) ? (int)$_POST['book_id'] : 0;
    if ($book_id <= 0) {
        $_SESSION['flash_error'] = "Invalid book ID.";
        header('Location: /php_bookstore/admin/books.php');
        exit;
    }

    try {
        // Check if book exists
        $check_stmt = $pdo->prepare("SELECT title FROM books WHERE id = :id");
        $check_stmt->execute([':id' => $book_id]);
        $book = $check_stmt->fetch();

        if ($book) {
            $del_stmt = $pdo->prepare("DELETE FROM books WHERE id = :id");
            $del_stmt->execute([':id' => $book_id]);

            $_SESSION['flash_success'] = "Book '{$book['title']}' (ID #{$book_id}) was successfully deleted.";
        } else {
            $_SESSION['flash_error'] = "Book not found.";
        }
    } catch (PDOException $e) {
        // May fail if restricted by foreign key in order_items
        $_SESSION['flash_error'] = "Cannot delete this book because it is referenced in past customer orders. You can set its stock to 0 instead.";
    }
}

header('Location: /php_bookstore/admin/books.php');
exit;
