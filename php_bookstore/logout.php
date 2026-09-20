<?php
require_once __DIR__ . '/includes/auth_middleware.php';

// Unset all session variables
$_SESSION = [];

// Destroy session cookie
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Destroy session
session_destroy();

// Start a fresh session for the flash notification
session_start();
$_SESSION['flash_success'] = "You have been logged out successfully.";

header("Location: /php_bookstore/login.php");
exit;
