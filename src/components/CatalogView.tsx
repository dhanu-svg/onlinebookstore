import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { BookCard } from './BookCard';

interface CatalogViewProps {
  books: Book[];
  favoriteBookIds?: Set<number>;
  readLaterBookIds?: Set<number>;
  onSelectBook: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onAddToCart: (book: Book) => void;
  onToggleFavorite?: (book: Book) => void;
  onToggleReadLater?: (book: Book) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  books,
  favoriteBookIds = new Set(),
  readLaterBookIds = new Set(),
  onSelectBook,
  onOpenReader,
  onAddToCart,
  onToggleFavorite,
  onToggleReadLater
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'title' | 'year'>('featured');

  // Extract unique genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.genre) set.add(b.genre);
    });
    return Array.from(set);
  }, [books]);

  // Filter & Sort
  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        const matchesSearch =
          b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = selectedGenre === 'all' || b.genre === selectedGenre;
        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
        return 0; // featured default
      });
  }, [books, searchTerm, selectedGenre, sortBy]);

  return (
    <div className="my-4" id="catalog-view-container">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          <i className="bi bi-collection text-primary me-2"></i>Public-Domain Book Catalog
        </h2>
        <p className="text-muted mb-0">
          Showing {filteredBooks.length} of {books.length} literary classics with free Project Gutenberg text reading &amp; collector copies.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          {/* Search Input */}
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by title, author, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="catalog-search-input"
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Genre Filter */}
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="genre-select" className="small fw-semibold text-muted text-nowrap">
                Genre:
              </label>
              <select
                id="genre-select"
                className="form-select"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="all">All Genres ({books.length})</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Selector */}
          <div className="col-md-3">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="sort-select" className="small fw-semibold text-muted text-nowrap">
                Sort:
              </label>
              <select
                id="sort-select"
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="featured">Featured / Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="title">Alphabetical (Title)</option>
                <option value="year">Year Published</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Genre Pills */}
        <div className="d-flex gap-2 flex-wrap mt-3 pt-3 border-top">
          <span className="small text-muted align-self-center me-1">Quick Filter:</span>
          <button
            type="button"
            className={`btn btn-xs rounded-pill ${selectedGenre === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSelectedGenre('all')}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              className={`btn btn-xs rounded-pill ${selectedGenre === g ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <i className="bi bi-search text-muted display-4 mb-3"></i>
            <h5 className="fw-bold">No Books Found</h5>
            <p className="text-muted mb-3">
              No titles match your search for "{searchTerm}" with genre filter "{selectedGenre}".
            </p>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('all');
              }}
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {filteredBooks.map((book) => (
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
      )}
    </div>
  );
};
