<?php
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/includes/auth_middleware.php';

// Redirect if already logged in
if (is_logged_in()) {
    header('Location: /php_bookstore/index.php');
    exit;
}

$errors = [];
$name = '';
$email = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!verify_csrf_token($token)) {
        $errors[] = 'Invalid security token. Please try again.';
    } else {
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';
        $password_confirm = $_POST['password_confirm'] ?? '';

        // Server-side validation
        if (empty($name)) {
            $errors[] = 'Full name is required.';
        } elseif (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
            $errors[] = 'Full name must be between 2 and 100 characters.';
        }

        if (empty($email)) {
            $errors[] = 'Email address is required.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Please provide a valid email address.';
        }

        if (empty($password)) {
            $errors[] = 'Password is required.';
        } elseif (strlen($password) < 6) {
            $errors[] = 'Password must be at least 6 characters long.';
        }

        if ($password !== $password_confirm) {
            $errors[] = 'Passwords do not match.';
        }

        // Check if email already exists
        if (empty($errors)) {
            try {
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
                $stmt->execute([':email' => $email]);
                if ($stmt->fetch()) {
                    $errors[] = 'An account with this email address already exists.';
                } else {
                    // Hash password with bcrypt
                    $hashed_password = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

                    // Insert user using prepared statement
                    $insert_stmt = $pdo->prepare("
                        INSERT INTO users (name, email, password, role) 
                        VALUES (:name, :email, :password, 'user')
                    ");
                    $insert_stmt->execute([
                        ':name' => $name,
                        ':email' => $email,
                        ':password' => $hashed_password
                    ]);

                    $new_user_id = $pdo->lastInsertId();

                    // Automatically log user in
                    $_SESSION['user_id'] = $new_user_id;
                    $_SESSION['user_name'] = $name;
                    $_SESSION['user_email'] = $email;
                    $_SESSION['role'] = 'user';

                    $_SESSION['flash_success'] = "Welcome to Classic Gutenberg Bookstore, {$name}! Your account has been registered.";
                    header('Location: /php_bookstore/index.php');
                    exit;
                }
            } catch (PDOException $e) {
                $errors[] = "A database error occurred during registration. Please try again.";
            }
        }
    }
}

$page_title = "Register Account";
require_once __DIR__ . '/includes/header.php';
?>

<div class="row justify-content-center my-4">
    <div class="col-md-7 col-lg-5">
        <div class="card shadow-sm border-0">
            <div class="card-body p-4 p-md-5">
                <div class="text-center mb-4">
                    <div class="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-inline-block mb-3">
                        <i class="bi bi-person-plus-fill fs-2"></i>
                    </div>
                    <h3 class="fw-bold">Create Reader Account</h3>
                    <p class="text-muted small">Join our classic literary community today</p>
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

                <form method="POST" action="/php_bookstore/register.php" id="register-form" novalidate onsubmit="return validateRegisterForm(this)">
                    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">

                    <div class="mb-3">
                        <label for="reg-name" class="form-label fw-semibold">Full Name</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light"><i class="bi bi-person"></i></span>
                            <input type="text" class="form-control" id="reg-name" name="name" value="<?= e($name) ?>" placeholder="Jane Austen" required minlength="2">
                        </div>
                        <div class="invalid-feedback">Please enter your full name (at least 2 characters).</div>
                    </div>

                    <div class="mb-3">
                        <label for="reg-email" class="form-label fw-semibold">Email Address</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light"><i class="bi bi-envelope"></i></span>
                            <input type="email" class="form-control" id="reg-email" name="email" value="<?= e($email) ?>" placeholder="jane@example.com" required>
                        </div>
                        <div class="invalid-feedback">Please enter a valid email address.</div>
                    </div>

                    <div class="mb-3">
                        <label for="reg-password" class="form-label fw-semibold">Password</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light"><i class="bi bi-lock"></i></span>
                            <input type="password" class="form-control" id="reg-password" name="password" placeholder="At least 6 characters" required minlength="6">
                        </div>
                        <div class="form-text small">Passwords are securely hashed using bcrypt.</div>
                        <div class="invalid-feedback">Password must be at least 6 characters.</div>
                    </div>

                    <div class="mb-4">
                        <label for="reg-password-confirm" class="form-label fw-semibold">Confirm Password</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light"><i class="bi bi-lock-fill"></i></span>
                            <input type="password" class="form-control" id="reg-password-confirm" name="password_confirm" placeholder="Repeat your password" required>
                        </div>
                        <div class="invalid-feedback">Passwords must match.</div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold mb-3" id="btn-submit-register">
                        Register Account
                    </button>

                    <div class="text-center text-muted small">
                        Already have an account? <a href="/php_bookstore/login.php" class="text-primary fw-semibold text-decoration-none">Log in here</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
function validateRegisterForm(form) {
    let isValid = true;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;
    const confirm = form.password_confirm.value;

    if (name.length < 2) {
        form.name.classList.add('is-invalid');
        isValid = false;
    } else {
        form.name.classList.remove('is-invalid');
    }

    if (!email || !email.includes('@')) {
        form.email.classList.add('is-invalid');
        isValid = false;
    } else {
        form.email.classList.remove('is-invalid');
    }

    if (password.length < 6) {
        form.password.classList.add('is-invalid');
        isValid = false;
    } else {
        form.password.classList.remove('is-invalid');
    }

    if (password !== confirm) {
        form.password_confirm.classList.add('is-invalid');
        isValid = false;
    } else {
        form.password_confirm.classList.remove('is-invalid');
    }

    return isValid;
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
