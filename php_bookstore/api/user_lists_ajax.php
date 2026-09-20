<?php
/**
 * User Library CRUD API (AJAX / JSON)
 * Classic Gutenberg Bookstore
 * Handles Favorites, Read Later, and Reading History CRUD
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/auth_middleware.php';

header('Content-Type: application/json');

// Check authentication
if (!is_logged_in()) {
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required. Please sign in to manage your library.'
    ]);
    exit;
}

$user_id = (int)$_SESSION['user_id'];
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true) ?? $_POST;
$action = $data['action'] ?? '';

try {
    switch ($action) {
        // ----------------------------------------------------
        // FAVORITES CRUD
        // ----------------------------------------------------
        case 'toggle_favorite': {
            $book_id = (int)($data['book_id'] ?? 0);
            $note = trim($data['note'] ?? '');

            if ($book_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid book ID']);
                exit;
            }

            // Check if already favorited
            $check = $pdo->prepare("SELECT id FROM favorites WHERE user_id = :uid AND book_id = :bid");
            $check->execute([':uid' => $user_id, ':bid' => $book_id]);
            $existing = $check->fetch();

            if ($existing) {
                // DELETE CRUD
                $del = $pdo->prepare("DELETE FROM favorites WHERE id = :id");
                $del->execute([':id' => $existing['id']]);
                echo json_encode([
                    'success' => true,
                    'is_favorite' => false,
                    'message' => 'Removed from Favorites.'
                ]);
            } else {
                // CREATE CRUD
                $ins = $pdo->prepare("INSERT INTO favorites (user_id, book_id, note) VALUES (:uid, :bid, :note)");
                $ins->execute([':uid' => $user_id, ':bid' => $book_id, ':note' => !empty($note) ? $note : null]);
                echo json_encode([
                    'success' => true,
                    'is_favorite' => true,
                    'id' => $pdo->lastInsertId(),
                    'message' => 'Added to Favorites!'
                ]);
            }
            break;
        }

        case 'delete_favorite': {
            $book_id = (int)($data['book_id'] ?? 0);
            $del = $pdo->prepare("DELETE FROM favorites WHERE user_id = :uid AND book_id = :bid");
            $del->execute([':uid' => $user_id, ':bid' => $book_id]);
            echo json_encode(['success' => true, 'message' => 'Favorite removed.']);
            break;
        }

        case 'update_favorite_note': {
            $book_id = (int)($data['book_id'] ?? 0);
            $note = trim($data['note'] ?? '');
            $upd = $pdo->prepare("UPDATE favorites SET note = :note WHERE user_id = :uid AND book_id = :bid");
            $upd->execute([':note' => $note, ':uid' => $user_id, ':bid' => $book_id]);
            echo json_encode(['success' => true, 'message' => 'Note updated.']);
            break;
        }

        // ----------------------------------------------------
        // READ LATER CRUD
        // ----------------------------------------------------
        case 'toggle_read_later': {
            $book_id = (int)($data['book_id'] ?? 0);
            $priority = in_array($data['priority'] ?? '', ['low', 'medium', 'high']) ? $data['priority'] : 'medium';

            if ($book_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid book ID']);
                exit;
            }

            $check = $pdo->prepare("SELECT id FROM read_later WHERE user_id = :uid AND book_id = :bid");
            $check->execute([':uid' => $user_id, ':bid' => $book_id]);
            $existing = $check->fetch();

            if ($existing) {
                $del = $pdo->prepare("DELETE FROM read_later WHERE id = :id");
                $del->execute([':id' => $existing['id']]);
                echo json_encode([
                    'success' => true,
                    'in_read_later' => false,
                    'message' => 'Removed from Read Later list.'
                ]);
            } else {
                $ins = $pdo->prepare("INSERT INTO read_later (user_id, book_id, priority) VALUES (:uid, :bid, :priority)");
                $ins->execute([':uid' => $user_id, ':bid' => $book_id, ':priority' => $priority]);
                echo json_encode([
                    'success' => true,
                    'in_read_later' => true,
                    'message' => 'Saved to Read Later list!'
                ]);
            }
            break;
        }

        case 'delete_read_later': {
            $book_id = (int)($data['book_id'] ?? 0);
            $del = $pdo->prepare("DELETE FROM read_later WHERE user_id = :uid AND book_id = :bid");
            $del->execute([':uid' => $user_id, ':bid' => $book_id]);
            echo json_encode(['success' => true, 'message' => 'Item removed from Read Later.']);
            break;
        }

        // ----------------------------------------------------
        // READING HISTORY CRUD
        // ----------------------------------------------------
        case 'add_reading_history': {
            $book_id = (int)($data['book_id'] ?? 0);
            $progress = isset($data['progress']) ? max(0, min(100, (int)$data['progress'])) : 100;
            $notes = trim($data['notes'] ?? '');

            if ($book_id <= 0) {
                echo json_encode(['success' => false, 'message' => 'Invalid book ID']);
                exit;
            }

            // Check if already in history; update timestamp and progress if so
            $check = $pdo->prepare("SELECT id FROM reading_history WHERE user_id = :uid AND book_id = :bid");
            $check->execute([':uid' => $user_id, ':bid' => $book_id]);
            $existing = $check->fetch();

            if ($existing) {
                $upd = $pdo->prepare("
                    UPDATE reading_history 
                    SET progress_percent = :prog, notes = COALESCE(NULLIF(:notes, ''), notes), read_at = CURRENT_TIMESTAMP
                    WHERE id = :id
                ");
                $upd->execute([':prog' => $progress, ':notes' => $notes, ':id' => $existing['id']]);
                $history_id = $existing['id'];
            } else {
                $ins = $pdo->prepare("
                    INSERT INTO reading_history (user_id, book_id, progress_percent, notes)
                    VALUES (:uid, :bid, :prog, :notes)
                ");
                $ins->execute([':uid' => $user_id, ':bid' => $book_id, ':prog' => $progress, ':notes' => !empty($notes) ? $notes : null]);
                $history_id = $pdo->lastInsertId();
            }

            echo json_encode([
                'success' => true,
                'history_id' => $history_id,
                'message' => 'Reading history updated.'
            ]);
            break;
        }

        case 'delete_reading_history': {
            $history_id = (int)($data['id'] ?? 0);
            $book_id = (int)($data['book_id'] ?? 0);

            if ($history_id > 0) {
                $del = $pdo->prepare("DELETE FROM reading_history WHERE id = :id AND user_id = :uid");
                $del->execute([':id' => $history_id, ':uid' => $user_id]);
            } elseif ($book_id > 0) {
                $del = $pdo->prepare("DELETE FROM reading_history WHERE book_id = :bid AND user_id = :uid");
                $del->execute([':bid' => $book_id, ':uid' => $user_id]);
            }

            echo json_encode(['success' => true, 'message' => 'Removed from reading history.']);
            break;
        }

        case 'clear_reading_history': {
            $del = $pdo->prepare("DELETE FROM reading_history WHERE user_id = :uid");
            $del->execute([':uid' => $user_id]);
            echo json_encode(['success' => true, 'message' => 'All reading history cleared.']);
            break;
        }

        default:
            echo json_encode(['success' => false, 'message' => 'Unknown action: ' . $action]);
            break;
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
