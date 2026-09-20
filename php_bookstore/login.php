<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

// Redirect if already logged in
if (is_logged_in()) {
    header('Location: /php_bookstore/index.php');
    exit;
}

$errors = [];
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = 'Invalid security token. Please refresh and try again.';
    } else {
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($email) || empty($password)) {
            $errors[] = 'Please enter both your email address and password.';
        } else {
            try {
                // Prepared statement to fetch user
                $stmt = $pdo->prepare("SELECT id, name, email, password, role FROM users WHERE email = :email LIMIT 1");
                $stmt->execute([':email' => $email]);
                $user = $stmt->fetch();

                // Verify bcrypt password hash
                if ($user && password_verify($password, $user['password'])) {
                    // Regenerate session ID to prevent session fixation attacks
                    session_regenerate_id(true);

                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_name'] = $user['name'];
                    $_SESSION['user_email'] = $user['email'];
                    $_SESSION['role'] = $user['role'];

                    $_SESSION['flash_success'] = "Welcome back, {$user['name']}!";

                    if ($user['role'] === 'admin') {
                        header('Location: /php_bookstore/admin/books.php');
                    } else {
                        header('Location: /php_bookstore/index.php');
                    }
                    exit;
                } else {
                    $errors[] = 'Invalid email address or password.';
                }
            } catch (PDOException $e) {
                $errors[] = 'A server error occurred. Please try again later.';
            }
        }
    }
}

$page_title = "Reader & Admin Login";
require_once __DIR__ . '/includes/header.php';
?>

<div class="row justify-content-center my-4">
    <div class="col-md-7 col-lg-5">
        <div class="card shadow-sm border-0">
            <div class="card-body p-4 p-md-5">
                <div class="text-center mb-4">
                    <div class="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-inline-block mb-3">
                        <i class="bi bi-box-arrow-in-right fs-2"></i>
                    </div>
                    <h3 class="fw-bold">Sign In</h3>
                    <p class="text-muted small">Access your reading list, order history, or admin tools</p>
                </div>

                <!-- Quick Demo Login Helpers -->
                <div class="alert alert-light border small mb-4">
                    <div class="fw-bold mb-1"><i class="bi bi-key-fill text-warning me-1"></i> Demo Credentials:</div>
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <span><strong>Admin:</strong> admin@bookstore.com</span>
                        <button type="button" class="btn btn-xs btn-outline-secondary py-0" onclick="fillCredentials('admin@bookstore.com', 'admin123')">Use Admin</button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span><strong>Reader:</strong> reader@bookstore.com</span>
                        <button type="button" class="btn btn-xs btn-outline-secondary py-0" onclick="fillCredentials('reader@bookstore.com', 'reader123')">Use Reader</button>
                    </div>
                </div>

                <?php if (!empty($errors)): ?>
                    <div class="alert alert-danger shadow-sm">
                        <ul class="mb-0 ps-3">
                            <?php foreach ($errors as $err): ?>
                                <li><?= e($err) ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <form method="POST" action="/php_bookstore/login.php" id="login-form">
                    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

                    <div class="mb-3">
                        <label for="login-email" class="form-label fw-semibold">Email Address</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light"><i class="bi bi-envelope"></i></span>
                            <input type="email" class="form-control" id="login-email" name="email" value="<?= e($email) ?>" placeholder="user@example.com" required>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label for="login-password" class="form-label fw-semibold">Password</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light"><i class="bi bi-lock"></i></span>
                            <input type="password" class="form-control" id="login-password" name="password" placeholder="Your password" required>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold mb-3" id="btn-submit-login">
                        Sign In
                    </button>

                    <div class="text-center text-muted small">
                        Don't have an account? <a href="/php_bookstore/register.php" class="text-primary fw-semibold text-decoration-none">Create an account</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function fillCredentials(email, pass) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = pass;
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
