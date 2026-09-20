import React from 'react';

interface FooterProps {
  onOpenCodeInspector?: () => void;
  onOpenDatabaseInspector?: () => void;
  onSetTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSetTab
}) => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto border-top border-secondary" id="main-footer">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Col 1: About */}
          <div className="col-lg-5 col-md-12">
            <div className="d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-book-half text-warning fs-3"></i>
              <h5 className="mb-0 fw-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Shelf Space
              </h5>
            </div>
            <p className="text-secondary small mb-3">
              Your online classical bookstore and digital reader dedicated to preserving and exploring timeless literature with personal reading shelves.
            </p>
            <div className="small text-secondary">
              <i className="bi bi-globe me-1 text-info"></i> All literary works are legally hosted in the public domain by <strong>Project Gutenberg</strong>.
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase fw-bold text-warning small mb-3">Navigation</h6>
            <ul className="list-unstyled small mb-0">
              <li className="mb-2">
                <button
                  type="button"
                  className="btn btn-link text-warning text-decoration-none p-0 small"
                  onClick={() => onSetTab('register')}
                >
                  <i className="bi bi-person-plus me-1"></i> Register / Sign In
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none p-0 small"
                  onClick={() => onSetTab('home')}
                >
                  <i className="bi bi-house-door me-1"></i> Home Page
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none p-0 small"
                  onClick={() => onSetTab('profile')}
                >
                  <i className="bi bi-person me-1"></i> Profile
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none p-0 small"
                  onClick={() => onSetTab('history')}
                >
                  <i className="bi bi-clock-history me-1"></i> History
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none p-0 small"
                  onClick={() => onSetTab('library')}
                >
                  <i className="bi bi-heart me-1 text-danger"></i> Favorites/List
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none p-0 small"
                  onClick={() => onSetTab('books')}
                >
                  <i className="bi bi-collection me-1"></i> Book Catalog
                </button>
              </li>
              <li className="mb-2">
                <button
                  type="button"
                  className="btn btn-link text-secondary text-decoration-none p-0 small"
                  onClick={() => onSetTab('cart')}
                >
                  <i className="bi bi-bag me-1"></i> Shopping Cart
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Bookstore Features */}
          <div className="col-lg-4 col-md-6">
            <h6 className="text-uppercase fw-bold text-info small mb-3">Bookstore Features</h6>
            <ul className="list-unstyled small mb-0 text-secondary">
              <li className="mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-journal-text text-warning"></i>
                <span>Public Domain Masterpieces</span>
              </li>
              <li className="mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-book-half text-info"></i>
                <span>Free In-Browser Reader</span>
              </li>
              <li className="mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-bookmarks text-success"></i>
                <span>Personal Reading Shelf &amp; Notes</span>
              </li>
              <li className="mb-2 d-flex align-items-center gap-2">
                <i className="bi bi-shield-check text-primary"></i>
                <span>Instant &amp; Secure Order Processing</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary my-3" />

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 small text-secondary">
          <div>
            &copy; {new Date().getFullYear()} Shelf Space. Unabridged literature in the public domain.
          </div>
          <div className="d-flex gap-3 text-secondary">
            <span>Project Gutenberg Archive</span>
            <span>&middot;</span>
            <span>Reader Protection</span>
            <span>&middot;</span>
            <span>Public Domain Books</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
