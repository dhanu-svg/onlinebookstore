import React from 'react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  isFavorite?: boolean;
  inReadLater?: boolean;
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onAddToCart: (book: Book) => void;
  onToggleFavorite?: (book: Book) => void;
  onToggleReadLater?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isFavorite = false,
  inReadLater = false,
  onSelectBook,
  onOpenReader,
  onAddToCart,
  onToggleFavorite,
  onToggleReadLater
}) => {
  return (
    <div className="card h-100 shadow-sm border-0 book-card position-relative bg-white" id={`book-card-${book.id}`}>
      {/* Top action icons: Favorite & Read Later */}
      <div className="position-absolute top-0 start-0 m-2 z-2 d-flex gap-1">
        {onToggleFavorite && (
          <button
            type="button"
            className={`btn btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm ${
              isFavorite ? 'btn-danger text-white' : 'btn-light text-muted'
            }`}
            style={{ width: '32px', height: '32px' }}
            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(book);
            }}
          >
            <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          </button>
        )}
        {onToggleReadLater && (
          <button
            type="button"
            className={`btn btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm ${
              inReadLater ? 'btn-primary text-white' : 'btn-light text-muted'
            }`}
            style={{ width: '32px', height: '32px' }}
            title={inReadLater ? 'In Read Later List' : 'Add to Read Later'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleReadLater(book);
            }}
          >
            <i className={`bi ${inReadLater ? 'bi-bookmark-check-fill' : 'bi-bookmark'}`}></i>
          </button>
        )}
      </div>

      {/* Stock indicator badge */}
      {book.stock <= 0 ? (
        <span className="badge bg-danger position-absolute top-0 end-0 m-2 z-1 shadow-sm">
          Out of Stock
        </span>
      ) : book.stock < 5 ? (
        <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-2 z-1 shadow-sm">
          Only {book.stock} left!
        </span>
      ) : null}

      {/* Cover Image Wrapper */}
      <div
        className="book-cover-wrapper bg-light text-center p-3 cursor-pointer"
        style={{ height: '270px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => onSelectBook(book)}
      >
        <img
          src={book.cover_image}
          alt={book.title}
          className="img-fluid rounded shadow-sm book-cover-img"
          style={{ maxHeight: '230px', width: 'auto', objectFit: 'cover' }}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/300x450/2d3748/ffffff?text=${encodeURIComponent(book.title)}`;
          }}
        />
      </div>

      {/* Card Body */}
      <div className="card-body d-flex flex-column p-3">
        <div className="d-flex justify-content-between text-muted small mb-1">
          <span className="badge bg-light text-dark border">{book.genre || 'Classic'}</span>
          {book.year && <span className="text-secondary">{book.year}</span>}
        </div>

        <h6
          className="card-title fw-bold text-truncate mb-1 cursor-pointer"
          title={book.title}
          onClick={() => onSelectBook(book)}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {book.title}
        </h6>

        <p className="card-subtitle text-muted small mb-2">{book.author}</p>

        <p
          className="card-text text-secondary small flex-grow-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4'
          }}
        >
          {book.description}
        </p>

        <div className="d-flex justify-content-between align-items-center mb-3 mt-2">
          <span className="fs-5 fw-bold text-primary">₹{book.price.toFixed(2)}</span>
          <span className="text-muted small">
            <i className="bi bi-box-seam me-1"></i>
            {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="d-grid gap-2">
          {/* Read Online Button */}
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-1"
            onClick={() => onOpenReader(book)}
            id={`btn-read-${book.id}`}
          >
            <i className="bi bi-book-half text-primary"></i> Read Online Free
          </button>

          {/* Add to Cart AJAX Button */}
          <button
            type="button"
            className={`btn btn-sm fw-semibold d-flex align-items-center justify-content-center gap-1 ${
              book.stock <= 0 ? 'btn-secondary disabled' : 'btn-warning text-dark'
            }`}
            onClick={() => onAddToCart(book)}
            disabled={book.stock <= 0}
            id={`btn-cart-${book.id}`}
          >
            <i className="bi bi-cart-plus"></i>
            {book.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
