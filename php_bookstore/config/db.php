<?php
/**
 * Database Connection using PHP Data Objects (PDO)
 * Classic Gutenberg Bookstore
 */

// Load environment configurations or use secure defaults
$db_host = getenv('DB_HOST') ?: '127.0.0.1';
$db_port = getenv('DB_PORT') ?: '3306';
$db_name = getenv('DB_NAME') ?: 'bookstore_db';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';

$dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";

$options = [
    // Throw PDOExceptions on error for strict error handling
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    // Return associative arrays by default
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    // Disable emulated prepared statements to ensure native prepared statements
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    // Log internal error safely in production, prevent credential exposure
    error_log("Database Connection Error: " . $e->getMessage());
    die("Database connection failed. Please ensure MySQL is running and credentials in config/db.php are correct.");
}
