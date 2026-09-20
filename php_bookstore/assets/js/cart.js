/**
 * AJAX Shopping Cart JavaScript
 * Classic Gutenberg Bookstore
 * Handles non-reloading Add to Cart, quantity modification, and item removal
 */

document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners to all AJAX "Add to Cart" buttons
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const bookId = this.getAttribute('data-book-id');
            const title = this.getAttribute('data-title') || 'Book';
            handleAddToCart(bookId, 1, title, this);
        });
    });
});

/**
 * Perform asynchronous AJAX request to add a book to the session cart
 */
function handleAddToCart(bookId, quantity = 1, title = 'Book', btnElement = null) {
    if (btnElement) {
        const originalHTML = btnElement.innerHTML;
        btnElement.disabled = true;
        btnElement.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Adding...';

        fetch('/php_bookstore/api/cart_ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                action: 'add',
                book_id: parseInt(bookId),
                quantity: parseInt(quantity)
            })
        })
        .then(response => response.json())
        .then(data => {
            btnElement.disabled = false;
            btnElement.innerHTML = originalHTML;

            if (data.success) {
                // Update badge in navbar
                updateCartBadge(data.cart_count);
                // Trigger toast
                showToastNotification(`Added <strong>${title}</strong> to your cart!`);
            } else {
                showToastNotification(data.message || 'Could not add item to cart', 'error');
            }
        })
        .catch(err => {
            btnElement.disabled = false;
            btnElement.innerHTML = originalHTML;
            console.error('AJAX cart error:', err);
            showToastNotification('Network error occurred.', 'error');
        });
    } else {
        // Direct call without button element (e.g. from book_detail.php quantity form)
        fetch('/php_bookstore/api/cart_ajax.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                action: 'add',
                book_id: parseInt(bookId),
                quantity: parseInt(quantity)
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateCartBadge(data.cart_count);
                showToastNotification(`Added item to your cart!`);
            } else {
                showToastNotification(data.message || 'Could not add item to cart', 'error');
            }
        })
        .catch(err => console.error('Cart error:', err));
    }
}

/**
 * Update item quantity in the cart via AJAX
 */
function updateCartQty(bookId, newQty) {
    fetch('/php_bookstore/api/cart_ajax.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            action: 'update',
            book_id: parseInt(bookId),
            quantity: parseInt(newQty)
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            updateCartBadge(data.cart_count);
            // Refresh cart display
            window.location.reload();
        }
    });
}

/**
 * Remove an item from the cart via AJAX
 */
function removeCartItem(bookId) {
    if (!confirm('Are you sure you want to remove this book from your cart?')) {
        return;
    }

    fetch('/php_bookstore/api/cart_ajax.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
            action: 'remove',
            book_id: parseInt(bookId)
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            updateCartBadge(data.cart_count);
            const row = document.getElementById(`cart-item-row-${bookId}`);
            if (row) {
                row.remove();
            }
            window.location.reload();
        }
    });
}

/**
 * Helper to update cart badge number
 */
function updateCartBadge(count) {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = count;
        badge.classList.add('scale-bump');
        setTimeout(() => badge.classList.remove('scale-bump'), 300);
    }
}

/**
 * Helper to display Bootstrap Toast notification
 */
function showToastNotification(htmlContent, type = 'success') {
    const toastEl = document.getElementById('cartToast');
    const toastMsg = document.getElementById('cartToastMessage');
    if (toastEl && toastMsg) {
        toastMsg.innerHTML = type === 'error' 
            ? `<i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i> <span>${htmlContent}</span>`
            : `<i class="bi bi-bag-check-fill text-success fs-5"></i> <span>${htmlContent}</span>`;
        const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
        toast.show();
    }
}
