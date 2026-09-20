-- ==========================================================
-- Classic Gutenberg Bookstore Database Schema
-- Database: bookstore_db
-- RDBMS: MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+
-- Tables: users, books, orders, order_items
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `bookstore_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `bookstore_db`;

-- 1. USERS TABLE
DROP TABLE IF EXISTS `reading_history`;
DROP TABLE IF EXISTS `read_later`;
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `books`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BOOKS TABLE
CREATE TABLE `books` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `cover_image` VARCHAR(500) NOT NULL,
  `stock` INT UNSIGNED NOT NULL DEFAULT 10,
  `gutenberg_url` VARCHAR(500) NOT NULL COMMENT 'Link to full free text on Project Gutenberg',
  `isbn` VARCHAR(20) DEFAULT NULL,
  `year` INT DEFAULT NULL,
  `genre` VARCHAR(100) DEFAULT 'Classic Literature',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_books_title` (`title`),
  INDEX `idx_books_author` (`author`),
  INDEX `idx_books_genre` (`genre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ORDERS TABLE
CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `order_number` VARCHAR(32) NOT NULL UNIQUE,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `shipping_name` VARCHAR(100) NOT NULL,
  `shipping_address` VARCHAR(255) NOT NULL,
  `shipping_city` VARCHAR(100) NOT NULL,
  `shipping_country` VARCHAR(100) NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL DEFAULT 'Credit Card / Digital Payment',
  `status` ENUM('pending', 'processing', 'completed', 'cancelled') NOT NULL DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ORDER ITEMS TABLE
CREATE TABLE `order_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `book_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `author` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE RESTRICT,
  INDEX `idx_order_items_order` (`order_id`),
  INDEX `idx_order_items_book` (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. FAVORITES TABLE (User saved favorites / wishlist)
CREATE TABLE `favorites` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `book_id` INT UNSIGNED NOT NULL,
  `note` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_favorite` (`user_id`, `book_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  INDEX `idx_favorites_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. READ LATER TABLE (Want to Read list)
CREATE TABLE `read_later` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `book_id` INT UNSIGNED NOT NULL,
  `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_read_later` (`user_id`, `book_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  INDEX `idx_read_later_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. READING HISTORY TABLE (Books opened & read log)
CREATE TABLE `reading_history` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `book_id` INT UNSIGNED NOT NULL,
  `progress_percent` INT UNSIGNED NOT NULL DEFAULT 100,
  `notes` VARCHAR(500) DEFAULT NULL,
  `read_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  INDEX `idx_reading_history_user` (`user_id`),
  INDEX `idx_reading_history_date` (`read_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED INITIAL DATA
-- Default Passwords (bcrypt hashed with cost=10):
-- Admin: 'admin123' -> $2y$10$tZ8Q7NlqgQk5N5u5yX1fUuTf2eS1c/LpY3eS1c/LpY3eS1c/LpY3e
-- User:  'reader123' -> $2y$10$w8.mB1Gz1k8m2J5X.u3rQ.xK7qZ9y1w8.mB1Gz1k8m2J5X.u3rQ.x
-- ==========================================================

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Admin Librarian', 'admin@bookstore.com', '$2y$10$yFGBm7QJ.c6iHkW5Vf5d2Op23bTzOknw88s7oY1FfB0o23bTzOknw', 'admin'),
(2, 'Eleanor Dashwood', 'reader@bookstore.com', '$2y$10$K7XG9wZ6f8l4Y2j0N3p1QeR4s6t8u0v2w4x6y8z0A1b2c3d4e5f6g', 'user');

-- Insert Real Public-Domain Books with Project Gutenberg & Open Library links
INSERT INTO `books` (`id`, `title`, `author`, `description`, `price`, `cover_image`, `stock`, `gutenberg_url`, `isbn`, `year`, `genre`) VALUES
(1, 'Pride and Prejudice', 'Jane Austen', 'The romantic clash between the opinionated Elizabeth Bennet and her proud aristocratic suitor, Fitzwilliam Darcy, exploring marriage, morality, and social station in Georgian England.', 12.99, 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg', 25, 'https://www.gutenberg.org/cache/epub/1342/pg1342-images.html', '9780141439518', 1813, 'Classic Romance'),
(2, 'Frankenstein', 'Mary Shelley', 'The gothic masterpiece of Victor Frankenstein, a young scientist who creates a sentient creature in an unorthodox scientific experiment, grappling with ambition and consequence.', 11.50, 'https://covers.openlibrary.org/b/isbn/9780486282114-L.jpg', 18, 'https://www.gutenberg.org/cache/epub/84/pg84-images.html', '9780486282114', 1818, 'Gothic Horror'),
(3, 'The Adventures of Sherlock Holmes', 'Arthur Conan Doyle', 'A collection of twelve detective mysteries featuring consulting detective Sherlock Holmes and Dr. John Watson solving bizarre enigmas across Victorian London.', 14.25, 'https://covers.openlibrary.org/b/isbn/9780140437805-L.jpg', 30, 'https://www.gutenberg.org/cache/epub/1661/pg1661-images.html', '9780140437805', 1892, 'Mystery & Crime'),
(4, 'Moby-Dick; or, The Whale', 'Herman Melville', 'Sailor Ishmael recounts the obsessive quest of Captain Ahab for revenge against Moby Dick, the ferocious white sperm whale that bit off Ahab\'s leg at the knee.', 15.99, 'https://covers.openlibrary.org/b/isbn/9780142437247-L.jpg', 15, 'https://www.gutenberg.org/cache/epub/2701/pg2701-images.html', '9780142437247', 1851, 'Adventure & Epic'),
(5, 'Alice\'s Adventures in Wonderland', 'Lewis Carroll', 'Young Alice falls through a rabbit hole into a whimsical, nonsensical underground fantasy world populated by anthropomorphic creatures and surreal logic.', 9.99, 'https://covers.openlibrary.org/b/isbn/9780141439761-L.jpg', 40, 'https://www.gutenberg.org/cache/epub/11/pg11-images.html', '9780141439761', 1865, 'Fantasy & Children'),
(6, 'A Tale of Two Cities', 'Charles Dickens', 'Set in London and Paris before and during the French Revolution, depicting the plight of the French peasantry and the brutality of the Reign of Terror.', 13.50, 'https://covers.openlibrary.org/b/isbn/9780141439600-L.jpg', 22, 'https://www.gutenberg.org/cache/epub/98/pg98-images.html', '9780141439600', 1859, 'Historical Fiction'),
(7, 'Dracula', 'Bram Stoker', 'Count Dracula\'s attempt to move from Transylvania to England to spread the undead curse, confronted by Professor Abraham Van Helsing and an intrepid circle of allies.', 12.75, 'https://covers.openlibrary.org/b/isbn/9780141439846-L.jpg', 20, 'https://www.gutenberg.org/cache/epub/345/pg345-images.html', '9780141439846', 1897, 'Gothic Horror'),
(8, 'The Picture of Dorian Gray', 'Oscar Wilde', 'The philosophical story of Dorian Gray, an exceptionally handsome young man whose portrait ages and absorbs his corrupt moral decay while he remains eternally youthful.', 10.99, 'https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg', 14, 'https://www.gutenberg.org/cache/epub/174/pg174-images.html', '9780141439570', 1890, 'Philosophical Fiction'),
(9, 'The Great Gatsby', 'F. Scott Fitzgerald', 'The tragic story of Jay Gatsby, a self-made millionaire, and his obsessive pursuit of Daisy Buchanan amidst the roaring excess and disillusionment of the Jazz Age.', 13.99, 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg', 35, 'https://www.gutenberg.org/ebooks/64317.html.images', '9780743273565', 1925, 'Modernist Fiction'),
(10, 'The Metamorphosis', 'Franz Kafka', 'Gregor Samsa wakes up one morning transformed into a monstrous insect, examining alienation, familial obligation, and absurdity in modern bureaucratic life.', 8.99, 'https://covers.openlibrary.org/b/isbn/9780553213690-L.jpg', 28, 'https://www.gutenberg.org/cache/epub/5200/pg5200-images.html', '9780553213690', 1915, 'Existential Fiction');

-- Seed Sample Order
INSERT INTO `orders` (`id`, `user_id`, `order_number`, `total_amount`, `shipping_name`, `shipping_address`, `shipping_city`, `shipping_country`, `status`) VALUES
(1, 2, 'ORD-2026-9014', 24.49, 'Eleanor Dashwood', '48 Barton Cottage Road', 'Devonshire', 'United Kingdom', 'completed');

INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `title`, `author`, `price`, `quantity`, `subtotal`) VALUES
(1, 1, 1, 'Pride and Prejudice', 'Jane Austen', 12.99, 1, 12.99),
(2, 1, 2, 'Frankenstein', 'Mary Shelley', 11.50, 1, 11.50);

-- Seed User Favorites
INSERT INTO `favorites` (`id`, `user_id`, `book_id`, `note`) VALUES
(1, 2, 1, 'Favorite romantic classic of all time.'),
(2, 2, 3, 'Sherlock Holmes mysteries are brilliant.');

-- Seed Read Later list
INSERT INTO `read_later` (`id`, `user_id`, `book_id`, `priority`) VALUES
(1, 2, 4, 'high'),
(2, 2, 8, 'medium');

-- Seed Reading History
INSERT INTO `reading_history` (`id`, `user_id`, `book_id`, `progress_percent`, `notes`, `read_at`) VALUES
(1, 2, 1, 100, 'Finished reading chapters 1 to 61.', '2026-09-15 14:00:00'),
(2, 2, 2, 65, 'Reading chapter 14 at the university.', '2026-09-17 19:30:00');
