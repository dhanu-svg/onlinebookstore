export interface PhpFileItem {
  filename: string;
  category: 'database' | 'config' | 'auth' | 'catalog' | 'cart_order' | 'admin';
  description: string;
  code: string;
}

export const PHP_PROJECT_FILES: PhpFileItem[] = [
  {
    filename: 'database/schema.sql',
    category: 'database',
    description: 'Relational MySQL Schema with users, books, orders, order_items tables, foreign keys, and indexes.',
    code: `-- Shelf Space Bookstore Database Schema
CREATE DATABASE IF NOT EXISTS \`bookstore_db\` CHARACTER SET utf8mb4;
USE \`bookstore_db\`;

CREATE TABLE \`users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE \`books\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`title\` VARCHAR(255) NOT NULL,
  \`author\` VARCHAR(150) NOT NULL,
  \`description\` TEXT NOT NULL,
  \`price\` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  \`cover_image\` VARCHAR(500) NOT NULL,
  \`stock\` INT UNSIGNED NOT NULL DEFAULT 10,
  \`gutenberg_url\` VARCHAR(500) NOT NULL,
  \`isbn\` VARCHAR(20) DEFAULT NULL,
  \`year\` INT DEFAULT NULL,
  \`genre\` VARCHAR(100) DEFAULT 'Classic Literature'
);

CREATE TABLE \`orders\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT UNSIGNED NOT NULL,
  \`order_number\` VARCHAR(32) NOT NULL UNIQUE,
  \`total_amount\` DECIMAL(10, 2) NOT NULL,
  \`shipping_name\` VARCHAR(100) NOT NULL,
  \`shipping_address\` VARCHAR(255) NOT NULL,
  \`shipping_city\` VARCHAR(100) NOT NULL,
  \`shipping_country\` VARCHAR(100) NOT NULL,
  \`payment_method\` VARCHAR(50) NOT NULL,
  \`status\` ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'completed',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
);

CREATE TABLE \`order_items\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`order_id\` INT UNSIGNED NOT NULL,
  \`book_id\` INT UNSIGNED NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`author\` VARCHAR(150) NOT NULL,
  \`price\` DECIMAL(10, 2) NOT NULL,
  \`quantity\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`subtotal\` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (\`order_id\`) REFERENCES \`orders\` (\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`book_id\`) REFERENCES \`books\` (\`id\`)
);`
  },
  {
    filename: 'config/db.php',
    category: 'config',
    description: 'Secure PDO MySQL connection with ERRMODE_EXCEPTION and native prepared statements enabled.',
    code: `<?php
$db_host = getenv('DB_HOST') ?: '127.0.0.1';
$db_name = getenv('DB_NAME') ?: 'bookstore_db';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';

$dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false, // Native prepared statements
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    die("Database connection failed. Please check MySQL credentials.");
}`
  },
  {
    filename: 'register.php',
    category: 'auth',
    description: 'Registration form with client & server-side validation, duplicate check, and bcrypt password hashing.',
    code: `<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Server-side validation
    if (empty($name) || strlen($name) < 2) $errors[] = "Valid name required.";
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = "Valid email required.";
    if (strlen($password) < 6) $errors[] = "Password must be at least 6 characters.";

    if (empty($errors)) {
        // Check duplicate email with prepared statement
        $check = $pdo->prepare("SELECT id FROM users WHERE email = :email");
        $check->execute([':email' => $email]);
        if ($check->fetch()) {
            $errors[] = "Email is already registered.";
        } else {
            // Bcrypt password hash
            $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, 'user')");
            $stmt->execute([':name' => $name, ':email' => $email, ':password' => $hash]);

            $_SESSION['user_id'] = $pdo->lastInsertId();
            $_SESSION['user_name'] = $name;
            $_SESSION['user_email'] = $email;
            $_SESSION['role'] = 'user';
            header("Location: index.php");
            exit;
        }
    }
}`
  },
  {
    filename: 'login.php',
    category: 'auth',
    description: 'Bcrypt password_verify authentication and session fixation protection.',
    code: `<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare("SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        session_regenerate_id(true); // Prevent session fixation
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        header("Location: index.php");
        exit;
    } else {
        $errors[] = "Invalid email or password.";
    }
}`
  },
  {
    filename: 'admin/add_book.php',
    category: 'admin',
    description: 'Admin-only book creation with server-side validation and confirmation screen displaying submitted data.',
    code: `<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_middleware.php';
require_admin(); // Enforce admin session role

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $author = trim($_POST['author'] ?? '');
    $price = (float)($_POST['price'] ?? 0);
    $cover_image = trim($_POST['cover_image'] ?? '');
    $stock = (int)($_POST['stock'] ?? 0);
    $gutenberg_url = trim($_POST['gutenberg_url'] ?? '');
    $description = trim($_POST['description'] ?? '');

    // Server-side validation
    if (empty($title)) $errors[] = "Title is required.";
    if (empty($author)) $errors[] = "Author is required.";
    if ($price < 0) $errors[] = "Price must be non-negative.";
    if (!filter_var($cover_image, FILTER_VALIDATE_URL)) $errors[] = "Valid cover URL required.";
    if (!filter_var($gutenberg_url, FILTER_VALIDATE_URL)) $errors[] = "Valid Gutenberg reader URL required.";

    if (empty($errors)) {
        $stmt = $pdo->prepare("
            INSERT INTO books (title, author, description, price, cover_image, stock, gutenberg_url)
            VALUES (:title, :author, :desc, :price, :cover, :stock, :url)
        ");
        $stmt->execute([
            ':title' => $title,
            ':author' => $author,
            ':desc' => $description,
            ':price' => $price,
            ':cover' => $cover_image,
            ':stock' => $stock,
            ':url' => $gutenberg_url
        ]);
        $new_id = $pdo->lastInsertId();
        // Render confirmation view displaying submitted form data back to user!
        $confirmation_data = compact('new_id', 'title', 'author', 'price', 'stock', 'cover_image', 'gutenberg_url', 'description');
    }
}`
  },
  {
    filename: 'api/cart_ajax.php',
    category: 'cart_order',
    description: 'AJAX endpoint for asynchronous cart operations (add, update, remove) returning JSON.',
    code: `<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_middleware.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $input['action'] ?? '';

if ($action === 'add') {
    $book_id = (int)$input['book_id'];
    $stmt = $pdo->prepare("SELECT id, title, price, stock, cover_image FROM books WHERE id = :id");
    $stmt->execute([':id' => $book_id]);
    $book = $stmt->fetch();

    if ($book && $book['stock'] > 0) {
        $qty = $_SESSION['cart'][$book_id]['quantity'] ?? 0;
        $_SESSION['cart'][$book_id] = [
            'id' => $book['id'],
            'title' => $book['title'],
            'price' => (float)$book['price'],
            'quantity' => $qty + 1
        ];
        echo json_encode(['success' => true, 'cart_count' => get_cart_count()]);
        exit;
    }
}`
  },
  {
    filename: 'checkout.php',
    category: 'cart_order',
    description: 'MySQL Transaction placing order, creating order & order_items, deducting stock, and clearing cart.',
    code: `<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $pdo->beginTransaction(); // Transaction protection

        $order_number = 'ORD-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
        $stmt = $pdo->prepare("
            INSERT INTO orders (user_id, order_number, total_amount, shipping_name, shipping_address, shipping_city, shipping_country)
            VALUES (:uid, :num, :total, :name, :addr, :city, :country)
        ");
        $stmt->execute([...]);
        $order_id = $pdo->lastInsertId();

        // Insert line items & decrement stock
        foreach ($_SESSION['cart'] as $id => $item) {
            $pdo->prepare("INSERT INTO order_items (...) VALUES (...)")->execute([...]);
            $pdo->prepare("UPDATE books SET stock = GREATEST(0, stock - :q) WHERE id = :id")->execute([...]);
        }

        $pdo->commit();
        $_SESSION['cart'] = []; // Reset cart
        // Display order confirmation back to user
    } catch (Exception $e) {
        $pdo->rollBack();
    }
}`
  },
  {
    filename: 'my_library.php',
    category: 'auth',
    description: 'Personal Library Dashboard for user Favorites, Read Later shelf, and Reading History log with full CRUD.',
    code: `<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';
require_login('/php_bookstore/login.php');

$user_id = (int)$_SESSION['user_id'];

// CRUD: Handle Delete actions with CSRF verification
if ($_SERVER['REQUEST_METHOD'] === 'POST' && verify_csrf_token($_POST['csrf_token'] ?? '')) {
    $action = $_POST['action'] ?? '';
    if ($action === 'delete_favorite') {
        $pdo->prepare("DELETE FROM favorites WHERE id = :id AND user_id = :uid")
            ->execute([':id' => (int)$_POST['id'], ':uid' => $user_id]);
    } elseif ($action === 'delete_read_later') {
        $pdo->prepare("DELETE FROM read_later WHERE id = :id AND user_id = :uid")
            ->execute([':id' => (int)$_POST['id'], ':uid' => $user_id]);
    } elseif ($action === 'delete_history') {
        $pdo->prepare("DELETE FROM reading_history WHERE id = :id AND user_id = :uid")
            ->execute([':id' => (int)$_POST['id'], ':uid' => $user_id]);
    } elseif ($action === 'clear_all_history') {
        $pdo->prepare("DELETE FROM reading_history WHERE user_id = :uid")
            ->execute([':uid' => $user_id]);
    }
}

// Fetch user data via relational queries
$favs = $pdo->prepare("SELECT f.*, b.title, b.author, b.cover_image, b.price FROM favorites f JOIN books b ON f.book_id = b.id WHERE f.user_id = ?");
$favs->execute([$user_id]);

$read_later = $pdo->prepare("SELECT rl.*, b.title, b.author, b.cover_image FROM read_later rl JOIN books b ON rl.book_id = b.id WHERE rl.user_id = ?");
$read_later->execute([$user_id]);

$history = $pdo->prepare("SELECT rh.*, b.title, b.author, b.cover_image FROM reading_history rh JOIN books b ON rh.book_id = b.id WHERE rh.user_id = ? ORDER BY rh.read_at DESC");
$history->execute([$user_id]);`
  },
  {
    filename: 'api/user_lists_ajax.php',
    category: 'auth',
    description: 'AJAX endpoint handling instant CRUD for toggling favorites, priority changes, and reading history logging.',
    code: `<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_middleware.php';

header('Content-Type: application/json');
if (!is_logged_in()) {
    echo json_encode(['success' => false, 'message' => 'Sign in required']);
    exit;
}

$user_id = (int)$_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $data['action'] ?? '';

switch ($action) {
    case 'toggle_favorite':
        // Check if exists; if yes DELETE, if no INSERT
        $chk = $pdo->prepare("SELECT id FROM favorites WHERE user_id = :u AND book_id = :b");
        $chk->execute([':u' => $user_id, ':b' => (int)$data['book_id']]);
        if ($row = $chk->fetch()) {
            $pdo->prepare("DELETE FROM favorites WHERE id = ?")->execute([$row['id']]);
            echo json_encode(['success' => true, 'is_favorite' => false]);
        } else {
            $pdo->prepare("INSERT INTO favorites (user_id, book_id, note) VALUES (?, ?, ?)")
                ->execute([$user_id, (int)$data['book_id'], $data['note'] ?? null]);
            echo json_encode(['success' => true, 'is_favorite' => true]);
        }
        break;

    case 'add_reading_history':
        // Upsert reading history progress
        $pdo->prepare("
            INSERT INTO reading_history (user_id, book_id, progress_percent, notes)
            VALUES (:u, :b, :p, :n)
            ON DUPLICATE KEY UPDATE progress_percent = :p, read_at = CURRENT_TIMESTAMP
        ")->execute([':u' => $user_id, ':b' => (int)$data['book_id'], ':p' => (int)($data['progress'] ?? 100), ':n' => $data['notes'] ?? null]);
        echo json_encode(['success' => true]);
        break;
}`
  }
];
