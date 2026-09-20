import React from 'react';
import { Book } from '../types';
import { BookCard } from './BookCard';

interface HomeViewProps {
  books: Book[];
  favoriteBookIds?: Set<number>;
  readLaterBookIds?: Set<number>;
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onAddToCart: (book: Book) => void;
  onToggleFavorite?: (book: Book) => void;
  onToggleReadLater?: (book: Book) => void;
  onExploreCatalog: () => void;
  onOpenCodeInspector?: () => void;
  onOpenDatabaseInspector?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  books,
  favoriteBookIds = new Set(),
  readLaterBookIds = new Set(),
  onSelectBook,
  onOpenReader,
  onAddToCart,
  onToggleFavorite,
  onToggleReadLater,
  onExploreCatalog
}) => {
  // Grab top 4 featured books
  const featuredBooks = books.slice(0, 4);

  return (
    <div id="home-view-container">
      {/* Hero Banner */}
      <section className="py-5 bg-dark text-white rounded-3 my-4 shadow-sm position-relative overflow-hidden">
        <div className="container py-4 position-relative z-1">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark px-3 py-2 text-uppercase fw-bold mb-3">
                100% Free Public-Domain Literature
              </span>
              <h1
                className="display-4 fw-bold text-white mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Timeless Literature, <br />
                <span className="text-warning">Free to Read Forever</span>
              </h1>
              <p className="lead text-light opacity-75 mb-4" style={{ maxWidth: '580px' }}>
                Explore unabridged classics by Jane Austen, Mary Shelley, Arthur Conan Doyle, and more.
                Read the original text online via Project Gutenberg or collect physical editions.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-warning btn-lg px-4 fw-bold shadow-sm"
                  onClick={onExploreCatalog}
                  id="hero-explore-btn"
                >
                  <i className="bi bi-book-half me-1"></i> Browse All Books
                </button>
              </div>
            </div>

            {/* Hero Visual Mockup */}
            <div className="col-lg-5 d-none d-lg-block text-center">
              <div className="position-relative d-inline-block">
                <img
                  src="https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg"
                  alt="Pride and Prejudice"
                  className="rounded shadow-lg"
                  style={{ width: '180px', transform: 'rotate(-6deg)', zIndex: 2, position: 'relative' }}
                />
                <img
                  src="https://covers.openlibrary.org/b/isbn/9780486282114-L.jpg"
                  alt="Frankenstein"
                  className="rounded shadow-lg position-absolute"
                  style={{ width: '180px', right: '-40px', top: '20px', zIndex: 1, transform: 'rotate(6deg)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Badges Banner */}
      <section className="row g-3 mb-5">
        <div className="col-md-3">
          <div className="p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-warning">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-book text-warning fs-2"></i>
              <div>
                <h6 className="fw-bold mb-0">Project Gutenberg</h6>
                <small className="text-muted">Unabridged public-domain text</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-primary">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-journal-richtext text-primary fs-2"></i>
              <div>
                <h6 className="fw-bold mb-0">In-Browser Reader</h6>
                <small className="text-muted">Read classic books instantly</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-success">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-bookmarks text-success fs-2"></i>
              <div>
                <h6 className="fw-bold mb-0">Personal Shelf</h6>
                <small className="text-muted">Curate favorites &amp; queue</small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-info">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-box2-heart text-info fs-2"></i>
              <div>
                <h6 className="fw-bold mb-0">Physical Editions</h6>
                <small className="text-muted">Quality paperbacks &amp; hardcovers</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Classics Section */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
          <div>
            <span className="text-primary fw-bold text-uppercase small">Curated Classics</span>
            <h2 className="fw-bold mb-0" style={{ fontFamily: "'Playfair Display', serif" }}>
              Featured Public-Domain Masterpieces
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm fw-semibold"
            onClick={onExploreCatalog}
          >
            View Complete Catalog ({books.length}) <i className="bi bi-arrow-right ms-1"></i>
          </button>
        </div>

        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
          {featuredBooks.map((book) => (
            <div className="col" key={book.id}>
              <BookCard
                book={book}
                isFavorite={favoriteBookIds.has(book.id)}
                inReadLater={readLaterBookIds.has(book.id)}
                onSelectBook={onSelectBook}
                onOpenReader={onOpenReader}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                onToggleReadLater={onToggleReadLater}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Embedded Gutenberg Reading Showcase Section */}
      <section className="bg-light p-4 p-md-5 rounded shadow-sm mb-5 border">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <span className="badge bg-primary text-uppercase px-2 py-1 mb-2">Embedded Reading Feature</span>
            <h3 className="fw-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Read the Full Original Books Instantly Online
            </h3>
            <p className="text-muted">
              Every book in our collection features a direct link and an embedded full-screen reading experience connected directly to Project Gutenberg archives. Enjoy original typography, illustrations, and chapter breaks right from your browser with zero subscription or login required.
            </p>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary fw-semibold"
                onClick={() => onOpenReader(books[0])}
              >
                <i className="bi bi-book-half me-1"></i> Try Reader: Pride &amp; Prejudice
              </button>
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={onExploreCatalog}
              >
                <i className="bi bi-collection me-1"></i> Browse Complete Catalog
              </button>
            </div>
          </div>
          <div className="col-lg-6 text-center">
            <div className="p-2 bg-white rounded shadow-sm border">
              <div className="bg-dark text-white p-2 rounded-top small d-flex justify-content-between">
                <span><i className="bi bi-circle-fill text-danger me-1"></i>Project Gutenberg Reader Preview</span>
                <span className="text-warning">Unabridged Online Edition</span>
              </div>
              <div className="p-3 text-start small font-monospace bg-light" style={{ maxHeight: '180px', overflowY: 'hidden' }}>
                <p className="fw-bold text-center mb-1">PRIDE AND PREJUDICE</p>
                <p className="text-center text-muted small mb-2">By Jane Austen</p>
                <p className="small mb-0">
                  "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
