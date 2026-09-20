import React, { useState } from 'react';
import { Book } from '../types';

interface BookDetailModalProps {
  book: Book | null;
  isFavorite?: boolean;
  inReadLater?: boolean;
  onClose: () => void;
  onOpenReader: (book: Book) => void;
  onAddToCart: (book: Book, quantity: number) => void;
  onToggleFavorite?: (book: Book) => void;
  onToggleReadLater?: (book: Book) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isFavorite = false,
  inReadLater = false,
  onClose,
  onOpenReader,
  onAddToCart,
  onToggleFavorite,
  onToggleReadLater
}) => {
  const [qty, setQty] = useState<number>(1);

  if (!book) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToCart(book, qty);
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {book.title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="row g-4">
              {/* Cover Column */}
              <div className="col-md-5 text-center">
                <div className="bg-light p-3 rounded mb-3">
                  <img
                    src={book.cover_image}
                    alt={book.title}
                    className="img-fluid rounded shadow"
                    style={{ maxHeight: '340px', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/300x450/2d3748/ffffff?text=${encodeURIComponent(book.title)}`;
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 py-2 fw-semibold mb-2"
                  onClick={() => {
                    onClose();
                    onOpenReader(book);
                  }}
                  id="modal-btn-read-online"
                >
                  <i className="bi bi-book-half me-1"></i> Read Online Free
                </button>

                {/* Favorite and Read Later Quick Buttons */}
                <div className="d-flex gap-2 mb-3">
                  {onToggleFavorite && (
                    <button
                      type="button"
                      className={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 ${
                        isFavorite ? 'btn-danger' : 'btn-outline-danger'
                      }`}
                      onClick={() => onToggleFavorite(book)}
                    >
                      <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                      <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                    </button>
                  )}
                  {onToggleReadLater && (
                    <button
                      type="button"
                      className={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1 ${
                        inReadLater ? 'btn-primary' : 'btn-outline-primary'
                      }`}
                      onClick={() => onToggleReadLater(book)}
                    >
                      <i className={`bi ${inReadLater ? 'bi-bookmark-check-fill' : 'bi-bookmark'}`}></i>
                      <span>{inReadLater ? 'On List' : 'Read Later'}</span>
                    </button>
                  )}
                </div>

                <a
                  href={book.gutenberg_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="small text-muted text-decoration-none d-block text-center"
                >
                  <i className="bi bi-box-arrow-up-right me-1"></i> Project Gutenberg Source Link
                </a>
              </div>

              {/* Details Column */}
              <div className="col-md-7 d-flex flex-column">
                <div className="mb-2">
                  <span className="badge bg-secondary me-2">{book.genre || 'Classic'}</span>
                  {book.year && <span className="text-muted small">Published {book.year}</span>}
                </div>

                <h3 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {book.title}
                </h3>
                <h6 className="text-muted mb-3">By <span className="text-dark fw-semibold">{book.author}</span></h6>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <span className="fs-3 fw-bold text-primary">₹{book.price.toFixed(2)}</span>
                  {book.stock > 0 ? (
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                      <i className="bi bi-check-circle me-1"></i> {book.stock} in stock
                    </span>
                  ) : (
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                      Out of stock
                    </span>
                  )}
                </div>

                <div className="alert alert-info py-2 px-3 small mb-3">
                  <strong><i className="bi bi-globe me-1"></i> Public Domain Work:</strong> Unabridged original text hosted legally by Project Gutenberg. Free to read and explore without copyright restrictions.
                </div>

                <h6 className="fw-bold mb-1">Book Synopsis</h6>
                <p className="text-muted small lh-base mb-4 flex-grow-1" style={{ whiteSpace: 'pre-line' }}>
                  {book.description}
                </p>

                {/* Form to add to cart */}
                {book.stock > 0 ? (
                  <form onSubmit={handleAdd} className="border-top pt-3 mt-auto">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <label htmlFor="modal-qty-input" className="small fw-semibold">Quantity:</label>
                        <input
                          id="modal-qty-input"
                          type="number"
                          className="form-control text-center"
                          value={qty}
                          min={1}
                          max={book.stock}
                          onChange={(e) => setQty(Math.max(1, Math.min(book.stock, parseInt(e.target.value) || 1)))}
                          style={{ width: '70px' }}
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-warning fw-bold flex-grow-1 py-2"
                        id="modal-submit-add-cart"
                      >
                        <i className="bi bi-cart-plus me-1"></i> Add to Cart (₹{(book.price * qty).toFixed(2)})
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="alert alert-warning mb-0 small">
                    Physical copies are temporarily sold out. You can read the full free book text online immediately!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
