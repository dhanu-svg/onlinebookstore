# Classic Gutenberg Bookstore (PHP, MySQL, Bootstrap 5, JS)

A production-ready full-stack Bookstore web application built with native **PHP (PDO)**, **MySQL**, **Bootstrap 5**, **HTML5**, and **JavaScript (Fetch/AJAX)**.

---

## 🌟 Key Features

1. **User Authentication & Session Security**:
   - Secure registration with validation for name, email, and password.
   - Bcrypt password hashing (`password_hash($pass, PASSWORD_BCRYPT)` and `password_verify`).
   - Session regeneration (`session_regenerate_id(true)`) upon login to prevent session fixation.
   - Distinct **User** and **Admin** roles.
   - CSRF protection across all forms (`csrf_token()` and `verify_csrf_token()`).
   - XSS sanitization via `htmlspecialchars()` helper.

2. **Complete Book CRUD (Admin Only)**:
   - Admin inventory management: Create, Read, Update, and Delete.
   - Form handling with both client-side and server-side validation.
   - Form submission confirmation displaying submitted values back to the user before redirection.

3. **Public-Domain Literary Collection (Project Gutenberg & Open Library)**:
   - 100% legal public-domain books (*Pride and Prejudice*, *Frankenstein*, *The Adventures of Sherlock Holmes*, *Moby-Dick*, *Alice's Adventures in Wonderland*, *A Tale of Two Cities*, *Dracula*, *The Picture of Dorian Gray*, etc.).
   - Authentic cover art pulled directly from the **Open Library Covers API** (`https://covers.openlibrary.org/b/isbn/{ISBN}-L.jpg`) and Project Gutenberg.
   - **"Read Online Free"** embedded reading experience and full-screen reader directly streaming unabridged original text from Project Gutenberg.

4. **AJAX Shopping Cart & Relational MySQL Orders**:
   - Asynchronous cart updates via AJAX (`fetch()`) without full page reloads.
   - Real-time cart item badges and toast notifications.
   - Multi-step checkout with MySQL transaction safety (`beginTransaction()`, `commit()`, `rollBack()`).
   - Relational database schema with foreign keys: `users` ➔ `orders` ➔ `order_items` ➔ `books`.
   - Automatic stock quantity deduction upon order confirmation.
   - User Order History and Admin Order Management.

---

## 📂 Directory Structure

```text
/php_bookstore/
├── admin/
│   ├── add_book.php          # Admin create book with validation & confirmation view
│   ├── books.php             # Admin books inventory table with CRUD actions
│   ├── delete_book.php       # Admin secure POST deletion handler with CSRF
│   ├── edit_book.php         # Admin edit book with validation & update confirmation
│   └── orders.php            # Admin customer orders overview
├── api/
│   └── cart_ajax.php         # JSON AJAX endpoint for cart actions (add, update, remove)
├── assets/
│   ├── css/
│   │   └── style.css         # Custom responsive book card and typography styling
│   └── js/
│       └── cart.js           # AJAX Fetch cart controller & notification handler
├── config/
│   └── db.php                # PDO connection with UTF8MB4 and ERRMODE_EXCEPTION
├── database/
│   └── schema.sql            # MySQL schema & sample seed data with real Gutenberg books
├── includes/
│   ├── auth_middleware.php   # Security, session, CSRF, and role helper functions
│   ├── footer.php            # Responsive Bootstrap footer & modal templates
│   └── header.php            # Navbar with active state, cart badge, & flash alerts
├── book_detail.php           # Single book details, Gutenberg preview & cart form
├── books.php                 # Search, filtering, and sortable catalog page
├── cart.php                  # Shopping cart view with quantity management
├── checkout.php              # Checkout form, validation, and confirmation screen
├── index.php                 # Home page featuring hero banner & Gutenberg highlights
├── login.php                 # Login page with bcrypt authentication
├── logout.php                # Session destruction and logout script
├── order_history.php         # Customer past orders with line items
├── read.php                  # Full-screen embedded Project Gutenberg reader
├── register.php              # New reader account registration with validation
└── README.md                 # Documentation & installation guide
```

---

## 🚀 Setup & Installation (XAMPP / LAMP / MAMP / Docker)

### 1. Database Setup
1. Open **phpMyAdmin** or MySQL command line:
   ```bash
   mysql -u root -p
   ```
2. Import `database/schema.sql`:
   ```bash
   source /path/to/php_bookstore/database/schema.sql;
   ```
   Or paste the contents of `database/schema.sql` into phpMyAdmin SQL query tab.

### 2. Configure Database Credentials
Edit `config/db.php` if your MySQL user/password differs:
```php
$db_host = getenv('DB_HOST') ?: '127.0.0.1';
$db_port = getenv('DB_PORT') ?: '3306';
$db_name = getenv('DB_NAME') ?: 'bookstore_db';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';
```

### 3. Deploy to Web Server
- Copy the `php_bookstore` folder into your web root (e.g. `htdocs/` in XAMPP, `/var/www/html/` in Apache).
- Access in your browser:
  ```
  http://localhost/php_bookstore/index.php
  ```

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@bookstore.com` | `admin123` |
| **Reader (User)** | `reader@bookstore.com` | `reader123` |

*(You can also register any new account on the Register page).*
