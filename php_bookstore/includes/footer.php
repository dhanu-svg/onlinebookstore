    </div><!-- /.container -->
</main>

<!-- Footer -->
<footer class="bg-dark text-white-50 py-4 mt-auto border-top border-secondary">
    <div class="container">
        <div class="row gy-3 align-items-center">
            <div class="col-md-6 text-center text-md-start">
                <p class="mb-1 text-white fw-bold">Classic Gutenberg Bookstore</p>
                <p class="small mb-0">Empowering readers with legally free public-domain literature curated from <a href="https://www.gutenberg.org" target="_blank" rel="noopener noreferrer" class="text-warning text-decoration-none">Project Gutenberg</a> and covers via <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer" class="text-warning text-decoration-none">Open Library</a>.</p>
            </div>
            <div class="col-md-6 text-center text-md-end small">
                <p class="mb-0">&copy; <?= date('Y') ?> Classic Gutenberg Bookstore. Built with PHP, MySQL, Bootstrap 5, &amp; JavaScript.</p>
                <div class="mt-1">
                    <span class="badge bg-secondary me-1">Secure Prepared Statements</span>
                    <span class="badge bg-secondary me-1">Bcrypt Hashing</span>
                    <span class="badge bg-secondary">XSS Sanitized</span>
                </div>
            </div>
        </div>
    </div>
</footer>

<!-- Toast Container for AJAX Cart Notifications -->
<div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100;">
    <div id="cartToast" class="toast align-items-center text-bg-dark border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2" id="cartToastMessage">
                <i class="bi bi-bag-check-fill text-success fs-5"></i>
                <span>Item added to your cart!</span>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    </div>
</div>

<!-- Bootstrap 5 Bundle JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<!-- Application AJAX JavaScript -->
<script src="/php_bookstore/assets/js/cart.js"></script>
</body>
</html>
