<?php
/**
 * Authentication and Security Middleware
 * Classic Gutenberg Bookstore
 */

if (session_status() === PHP_SESSION_NONE) {
    // Configure secure session cookie settings
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    session_start();
}

/**
 * Sanitize output strings against XSS attacks
 */
function e($string) {
    return htmlspecialchars((string)$string, ENT_QUOTES, 'UTF-8');
}

/**
 * Check if a user is currently logged in
 */
function is_logged_in() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Check if the current user has the admin role
 */
function is_admin() {
    return is_logged_in() && isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
}

/**
 * Get the current user session array
 */
function get_current_user_session() {
    if (!is_logged_in()) {
        return null;
    }
    return [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'] ?? 'Reader',
        'email' => $_SESSION['user_email'] ?? '',
        'role' => $_SESSION['role'] ?? 'user'
    ];
}

/**
 * Require login to access a page
 */
function require_login($redirect_to = '/php_bookstore/login.php') {
    if (!is_logged_in()) {
        $_SESSION['flash_error'] = 'Please log in to continue.';
        header("Location: " . $redirect_to);
        exit;
    }
}

/**
 * Require admin privileges to access a page
 */
function require_admin($redirect_to = '/php_bookstore/index.php') {
    if (!is_admin()) {
        $_SESSION['flash_error'] = 'Unauthorized access: Admin privileges required.';
        header("Location: " . $redirect_to);
        exit;
    }
}

/**
 * CSRF Protection
 */
function csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token($token) {
    if (!isset($_SESSION['csrf_token']) || empty($token)) {
        return false;
    }
    return hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Cart Item Count in Session
 */
function get_cart_count() {
    if (!isset($_SESSION['cart']) || !is_array($_SESSION['cart'])) {
        return 0;
    }
    $count = 0;
    foreach ($_SESSION['cart'] as $item) {
        $count += (int)($item['quantity'] ?? 0);
    }
    return $count;
}
