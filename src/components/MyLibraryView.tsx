import React, { useState } from 'react';
import { Book, User, FavoriteItem, ReadLaterItem, ReadingHistoryItem } from '../types';

interface MyLibraryViewProps {
  currentUser: User | null;
  favorites: FavoriteItem[];
  readLater: ReadLaterItem[];
  readingHistory: ReadingHistoryItem[];
  onRemoveFavorite: (bookId: number) => void;
  onUpdateFavoriteNote: (bookId: number, note: string) => void;
  onRemoveReadLater: (bookId: number) => void;
  onUpdateReadLaterPriority: (bookId: number, priority: 'low' | 'medium' | 'high') => void;
  onDeleteHistoryItem: (historyId: number) => void;
  onClearAllHistory: () => void;
  onUpdateHistoryProgress: (historyId: number, progress: number, notes?: string) => void;
  onOpenReader: (book: Book) => void;
  onSelectBook: (book: Book) => void;
  onAddToCart: (book: Book) => void;
  onExploreCatalog: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  initialSubTab?: 'favorites' | 'readlater' | 'history';
}

export const MyLibraryView: React.FC<MyLibraryViewProps> = ({
  currentUser,
  favorites,
  readLater,
  readingHistory,
  onRemoveFavorite,
  onUpdateFavoriteNote,
  onRemoveReadLater,
  onUpdateReadLaterPriority,
  onDeleteHistoryItem,
  onClearAllHistory,
  onUpdateHistoryProgress,
  onOpenReader,
  onSelectBook,
  onAddToCart,
  onExploreCatalog,
  onOpenAuth,
  initialSubTab = 'favorites'
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'readlater' | 'history'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);
  const [editingNoteBookId, setEditingNoteBookId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  if (!currentUser) {
    return (
      <div className="card border-0 shadow-sm text-center p-5 my-5">
        <div className="card-body">
          <i className="bi bi-bookmarks text-warning display-3 mb-3"></i>
          <h3 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sign In to Access Your Personal Library
          </h3>
          <p className="text-muted mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
            Keep track of your favorite books, save titles to read later, and log your reading history and notes.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-primary px-4 fw-semibold"
              onClick={() => onOpenAuth('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={() => onOpenAuth('register')}
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter history
  const filteredHistory = readingHistory.filter((item) =>
    item.book.title.toLowerCase().includes(historySearch.toLowerCase()) ||
    item.book.author.toLowerCase().includes(historySearch.toLowerCase())
  );

  const startEditNote = (fav: FavoriteItem) => {
    setEditingNoteBookId(fav.book_id);
    setNoteDraft(fav.note || '');
  };

  const saveNote = (bookId: number) => {
    onUpdateFavoriteNote(bookId, noteDraft.trim());
    setEditingNoteBookId(null);
  };

  return (
    <div className="my-4" id="my-library-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <span className="badge bg-primary text-uppercase px-2 py-1 mb-1">Personal Reader Shelf</span>
          <h2 className="fw-bold mb-0" style={{ fontFamily: "'Playfair Display', serif" }}>
            <i className="bi bi-bookmarks-fill text-warning me-2"></i>My Library &amp; Reading Lists
          </h2>
          <p className="text-muted mb-0 small">
            Signed in as <strong>{currentUser.name}</strong> ({currentUser.email})
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={onExploreCatalog}
        >
          <i className="bi bi-search me-1"></i> Browse More Classics
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 gap-2 border-bottom pb-3">
        <li className="nav-item">
          <button
            type="button"
            className={`btn d-flex align-items-center gap-2 ${
              activeTab === 'favorites' ? 'btn-danger fw-bold shadow-sm' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveTab('favorites')}
            id="tab-btn-favorites"
          >
            <i className="bi bi-heart-fill"></i>
            <span>Favorites</span>
            <span className="badge bg-light text-dark rounded-pill">{favorites.length}</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`btn d-flex align-items-center gap-2 ${
              activeTab === 'readlater' ? 'btn-primary fw-bold shadow-sm' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveTab('readlater')}
            id="tab-btn-readlater"
          >
            <i className="bi bi-clock-fill"></i>
            <span>Read Later Shelf</span>
            <span className="badge bg-light text-dark rounded-pill">{readLater.length}</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`btn d-flex align-items-center gap-2 ${
              activeTab === 'history' ? 'btn-success fw-bold shadow-sm' : 'btn-outline-secondary'
            }`}
            onClick={() => setActiveTab('history')}
            id="tab-btn-history"
          >
            <i className="bi bi-clock-history"></i>
            <span>Reading History</span>
            <span className="badge bg-light text-dark rounded-pill">{readingHistory.length}</span>
          </button>
        </li>
      </ul>

      {/* 1. FAVORITES TAB */}
      {activeTab === 'favorites' && (
        <div id="favorites-section">
          {favorites.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <i className="bi bi-heart text-muted display-4 mb-3"></i>
                <h5 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  No Favorites Yet
                </h5>
                <p className="text-muted mb-4">
                  Click the heart icon on any book in the catalog to save it to your personal favorites collection.
                </p>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={onExploreCatalog}
                >
                  Explore Classics Catalog
                </button>
              </div>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {favorites.map((fav) => (
                <div className="col" key={fav.id}>
                  <div className="card h-100 border-0 shadow-sm position-relative">
                    <div className="card-body d-flex flex-column p-3">
                      <div className="d-flex gap-3 mb-3">
                        <img
                          src={fav.book.cover_image}
                          alt={fav.book.title}
                          className="rounded shadow-sm cursor-pointer"
                          style={{ width: '80px', height: '120px', objectFit: 'cover' }}
                          onClick={() => onSelectBook(fav.book)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/2d3748/ffffff?text=Book';
                          }}
                        />
                        <div className="flex-grow-1 d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start">
                            <span className="badge bg-light text-dark border small">{fav.book.genre}</span>
                            <button
                              type="button"
                              className="btn btn-link text-danger p-0"
                              title="Remove from Favorites"
                              onClick={() => onRemoveFavorite(fav.book_id)}
                            >
                              <i className="bi bi-heart-fill fs-5"></i>
                            </button>
                          </div>

                          <h6
                            className="fw-bold text-dark mt-1 mb-0 cursor-pointer text-truncate"
                            title={fav.book.title}
                            onClick={() => onSelectBook(fav.book)}
                            style={{ maxWidth: '180px' }}
                          >
                            {fav.book.title}
                          </h6>
                          <small className="text-muted mb-2">{fav.book.author}</small>
                          <span className="fw-bold text-primary">₹{fav.book.price.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Notes CRUD */}
                      <div className="bg-light p-2 rounded mb-3 border small flex-grow-1">
                        {editingNoteBookId === fav.book_id ? (
                          <div>
                            <label className="fw-semibold small text-muted d-block mb-1">Personal Note / Quote:</label>
                            <textarea
                              className="form-control form-control-sm mb-2"
                              rows={2}
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="e.g. Favorite quotes or reflections..."
                            />
                            <div className="d-flex gap-1 justify-content-end">
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-secondary"
                                onClick={() => setEditingNoteBookId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="btn btn-xs btn-primary"
                                onClick={() => saveNote(fav.book_id)}
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <span className="text-muted small fw-semibold d-block">Personal Note:</span>
                              <span className="fst-italic text-secondary">
                                {fav.note || 'No notes added yet.'}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-link text-secondary p-0 ms-1"
                              title="Edit Note"
                              onClick={() => startEditNote(fav)}
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => onOpenReader(fav.book)}
                        >
                          <i className="bi bi-book-half me-1"></i> Read Online Free
                        </button>
                        <button
                          type="button"
                          className="btn btn-warning btn-sm text-dark fw-semibold"
                          onClick={() => onAddToCart(fav.book)}
                        >
                          <i className="bi bi-cart-plus me-1"></i> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. READ LATER SHELF TAB */}
      {activeTab === 'readlater' && (
        <div id="readlater-section">
          {readLater.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <i className="bi bi-clock-history text-muted display-4 mb-3"></i>
                <h5 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Your Read Later Shelf is Empty
                </h5>
                <p className="text-muted mb-4">
                  Bookmark titles you plan to read in the future by clicking "Read Later" on any book.
                </p>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={onExploreCatalog}
                >
                  Explore Classics
                </button>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold">Saved Reading Queue ({readLater.length} Books)</h6>
                <span className="badge bg-secondary">Saved Shelf</span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40%' }}>Book</th>
                      <th style={{ width: '20%' }}>Priority Level</th>
                      <th style={{ width: '15%' }}>Saved Date</th>
                      <th className="text-end" style={{ width: '25%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readLater.map((rl) => (
                      <tr key={rl.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={rl.book.cover_image}
                              alt=""
                              className="rounded shadow-sm cursor-pointer"
                              style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                              onClick={() => onSelectBook(rl.book)}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/2d3748/ffffff?text=Book';
                              }}
                            />
                            <div>
                              <strong
                                className="d-block text-dark cursor-pointer text-truncate"
                                style={{ maxWidth: '240px' }}
                                onClick={() => onSelectBook(rl.book)}
                              >
                                {rl.book.title}
                              </strong>
                              <span className="text-muted small">by {rl.book.author}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {/* Priority dropdown editor */}
                          <select
                            className="form-select form-select-sm"
                            style={{ width: '110px' }}
                            value={rl.priority}
                            onChange={(e) =>
                              onUpdateReadLaterPriority(rl.book_id, e.target.value as 'low' | 'medium' | 'high')
                            }
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </td>
                        <td className="small text-muted">{rl.added_at.split(' ')[0]}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={() => onOpenReader(rl.book)}
                            >
                              <i className="bi bi-book me-1"></i> Read Now
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Delete from Read Later"
                              onClick={() => onRemoveReadLater(rl.book_id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. READING HISTORY TAB */}
      {activeTab === 'history' && (
        <div id="history-section">
          {readingHistory.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <i className="bi bi-clock-history text-muted display-4 mb-3"></i>
                <h5 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  No Reading History Recorded
                </h5>
                <p className="text-muted mb-4">
                  Whenever you open and read a book in the Project Gutenberg embedded reader, it will automatically appear in your reading history log!
                </p>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={onExploreCatalog}
                >
                  Start Reading Now
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Toolbar */}
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search history log..."
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-light text-dark border">
                    {filteredHistory.length} Sessions Logged
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={onClearAllHistory}
                    title="Clear entire reading history table"
                  >
                    <i className="bi bi-trash3 me-1"></i> Clear All History
                  </button>
                </div>
              </div>

              {/* History Table */}
              <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '35%' }}>Book</th>
                        <th style={{ width: '25%' }}>Progress &amp; Status</th>
                        <th style={{ width: '20%' }}>Notes / Reading Log</th>
                        <th style={{ width: '10%' }}>Timestamp</th>
                        <th className="text-end" style={{ width: '10%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((h) => (
                        <tr key={h.id}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={h.book.cover_image}
                                alt=""
                                className="rounded shadow-sm cursor-pointer"
                                style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                                onClick={() => onSelectBook(h.book)}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://placehold.co/100x150/2d3748/ffffff?text=Book';
                                }}
                              />
                              <div>
                                <strong
                                  className="d-block text-dark cursor-pointer text-truncate"
                                  style={{ maxWidth: '220px' }}
                                  onClick={() => onSelectBook(h.book)}
                                >
                                  {h.book.title}
                                </strong>
                                <span className="text-muted small">by {h.book.author}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            {/* Interactive Reading Progress Slider */}
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="range"
                                className="form-range"
                                min={0}
                                max={100}
                                step={5}
                                value={h.progress_percent}
                                onChange={(e) =>
                                  onUpdateHistoryProgress(h.id, parseInt(e.target.value, 10), h.notes)
                                }
                                style={{ maxWidth: '120px' }}
                              />
                              <span className="small fw-bold text-dark">{h.progress_percent}%</span>
                              {h.progress_percent === 100 && (
                                <span className="badge bg-success-subtle text-success border border-success-subtle small">
                                  Finished
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="small text-muted fst-italic">
                              {h.notes || 'Finished reading session.'}
                            </span>
                          </td>
                          <td className="small text-muted">{h.read_at.split(' ')[0]}</td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                title="Resume reading online"
                                onClick={() => onOpenReader(h.book)}
                              >
                                <i className="bi bi-arrow-repeat"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                title="Delete from history"
                                onClick={() => onDeleteHistoryItem(h.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
