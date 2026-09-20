<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_middleware.php';

header('Content-Type: application/json');

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $input['action'] ?? '';

if ($action === 'add') {
    $book_id = (int)($input['book_id'] ?? 0);
    $quantity = max(1, (int)($input['quantity'] ?? 1));

    if ($book_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid book ID']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT id, title, author, price, cover_image, stock FROM books WHERE id = :id");
        $stmt->execute([':id' => $book_id]);
        $book = $stmt->fetch();

        if (!$book) {
            echo json_encode(['success' => false, 'message' => 'Book not found']);
            exit;
        }

        if ($book['stock'] <= 0) {
            echo json_encode(['success' => false, 'message' => 'This book is currently out of stock']);
            exit;
        }

        $current_in_cart = $_SESSION['cart'][$book_id]['quantity'] ?? 0;
        $new_qty = min($book['stock'], $current_in_cart + $quantity);

        $_SESSION['cart'][$book_id] = [
            'id' => $book['id'],
            'title' => $book['title'],
            'author' => $book['author'],
            'price' => (float)$book['price'],
            'cover_image' => $book['cover_image'],
            'quantity' => $new_qty,
            'max_stock' => (int)$book['stock']
        ];

        echo json_encode([
            'success' => true,
            'message' => "Added '{$book['title']}' to cart",
            'cart_count' => get_cart_count()
        ]);
        exit;
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database query failed']);
        exit;
    }
}

if ($action === 'update') {
    $book_id = (int)($input['book_id'] ?? 0);
    $quantity = (int)($input['quantity'] ?? 1);

    if (isset($_SESSION['cart'][$book_id])) {
        if ($quantity <= 0) {
            unset($_SESSION['cart'][$book_id]);
        } else {
            $max_stock = $_SESSION['cart'][$book_id]['max_stock'] ?? 99;
            $_SESSION['cart'][$book_id]['quantity'] = min($max_stock, $quantity);
        }

        // Calculate totals
        $subtotal = 0;
        foreach ($_SESSION['cart'] as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }

        echo json_encode([
            'success' => true,
            'cart_count' => get_cart_count(),
            'subtotal' => number_format($subtotal, 2)
        ]);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Item not in cart']);
    exit;
}

if ($action === 'remove') {
    $book_id = (int)($input['book_id'] ?? 0);
    if (isset($_SESSION['cart'][$book_id])) {
        unset($_SESSION['cart'][$book_id]);
    }

    $subtotal = 0;
    foreach ($_SESSION['cart'] as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }

    echo json_encode([
        'success' => true,
        'cart_count' => get_cart_count(),
        'subtotal' => number_format($subtotal, 2)
    ]);
    exit;
}

if ($action === 'get') {
    $subtotal = 0;
    foreach ($_SESSION['cart'] as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }

    echo json_encode([
        'success' => true,
        'cart' => $_SESSION['cart'],
        'cart_count' => get_cart_count(),
        'subtotal' => number_format($subtotal, 2)
    ]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
