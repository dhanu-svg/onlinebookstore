import React, { useState } from 'react';
import { Book, User, Order, ReadingHistoryItem } from '../types';

interface HistoryViewProps {
  currentUser: User | null;
  readingHistory: ReadingHistoryItem[];
  orders: Order[];
  onOpenReader: (book: Book) => void;
  onSelectBook: (book: Book) => void;
  onDeleteHistoryItem: (historyId: number) => void;
  onClearAllHistory: () => void;
  onUpdateHistoryProgress: (historyId: number, progress: number, notes?: string) => void;
  onBrowseBooks: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  initialTab?: 'reading' | 'orders';
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentUser,
  readingHistory,
  orders,
  onOpenReader,
  onSelectBook,
  onDeleteHistoryItem,
  onClearAllHistory,
  onUpdateHistoryProgress,
  onBrowseBooks,
  onOpenAuth,
  initialTab = 'reading'
}) => {
  const [activeTab, setActiveTab] = useState<'reading' | 'orders'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [progressInput, setProgressInput] = useState<number>(100);
  const [noteInput, setNoteInput] = useState<string>('');

  if (!currentUser) {
    return (
      <div className="container py-5" id="history-guest-view">
        <div className="card border-0 shadow-sm mx-auto text-center p-5" style={{ maxWidth: '580px', borderRadius: '16px' }}>
          <div className="card-body">
            <i className="bi bi-clock-history text-primary display-3 mb-3"></i>
            <h3 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Sign In to View Your History
            </h3>
            <p className="text-muted mb-4">
              Track your reading progress across Project Gutenberg public-domain classics and view your physical book order history in one place.
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
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter for user
  const userReading = readingHistory.filter((rh) => rh.user_id === currentUser.id);
  const userOrders = orders.filter((o) => o.user_id === currentUser.id);

  // Search filter
  const filteredReading = userReading.filter(
    (rh) =>
      rh.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rh.book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rh.notes && rh.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredOrders = userOrders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shipping_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some((it) => it.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startEdit = (item: ReadingHistoryItem) => {
    setEditingId(item.id);
    setProgressInput(item.progress_percent);
    setNoteInput(item.notes || '');
  };

  const saveEdit = (id: number) => {
    onUpdateHistoryProgress(id, progressInput, noteInput);
    setEditingId(null);
  };

  return (
    <div className="container py-4" id="history-container">
      {/* Header & Switcher */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            <i className="bi bi-clock-history text-success me-2"></i>Activity &amp; History
          </h2>
          <p className="text-muted mb-0">
            Account: <strong>{currentUser.email}</strong> &middot; {userReading.length} reading session(s) &middot; {userOrders.length} order(s)
          </p>
        </div>

        {/* History Type Navigator Tabs */}
        <div className="btn-group shadow-sm bg-white p-1 rounded-pill border" role="group">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1 ${
              activeTab === 'reading' ? 'btn-success text-white fw-bold' : 'btn-light text-secondary'
            }`}
            onClick={() => setActiveTab('reading')}
            id="tab-history-reading"
          >
            <i className="bi bi-book-half"></i>
            <span>Reading History</span>
            <span className="badge bg-dark rounded-pill ms-1">{userReading.length}</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1 ${
              activeTab === 'orders' ? 'btn-primary text-white fw-bold' : 'btn-light text-secondary'
            }`}
            onClick={() => setActiveTab('orders')}
            id="tab-history-orders"
          >
            <i className="bi bi-receipt"></i>
            <span>Order History</span>
            <span className="badge bg-dark rounded-pill ms-1">{userOrders.length}</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card border-0 shadow-sm mb-4 bg-light">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-md-7">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder={
                    activeTab === 'reading'
                      ? 'Search reading history by title, author, or notes...'
                      : 'Search orders by order number, city, or title...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-md-5 d-flex justify-content-md-end gap-2">
              {activeTab === 'reading' && userReading.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    if (window.confirm('Clear all reading history records for this account?')) {
                      onClearAllHistory();
                    }
                  }}
                >
                  <i className="bi bi-trash3 me-1"></i> Clear All History
                </button>
              )}
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onBrowseBooks}>
                <i className="bi bi-collection me-1"></i> Browse Catalog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reading History View */}
      {activeTab === 'reading' && (
        <div>
          {filteredReading.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <i className="bi bi-journal-x text-muted display-4 mb-3"></i>
                <h4 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {searchTerm ? 'No matching reading records found' : 'No Reading History Recorded Yet'}
                </h4>
                <p className="text-muted mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
                  Whenever you read or open books in the Project Gutenberg viewer, your progress and thoughts are automatically logged to your personal reading history!
                </p>
                <button type="button" className="btn btn-success px-4 py-2" onClick={onBrowseBooks}>
                  <i className="bi bi-book me-1"></i> Read a Book Now
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {filteredReading.map((item) => (
                <div key={item.id} className="card border-0 shadow-sm overflow-hidden">
                  <div className="card-body p-3 p-md-4">
                    <div className="row align-items-center g-3">
                      {/* Book Cover */}
                      <div className="col-auto">
                        <img
                          src={item.book.cover_image}
                          alt={item.book.title}
                          className="rounded shadow-sm"
                          style={{ width: '68px', height: '100px', objectFit: 'cover' }}
                        />
                      </div>

                      {/* Info & Progress */}
                      <div className="col">
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <h5
                            className="card-title fw-bold mb-0 text-dark cursor-pointer text-decoration-underline-hover"
                            onClick={() => onSelectBook(item.book)}
                            role="button"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {item.book.title}
                          </h5>
                          <span className="badge bg-secondary-subtle text-secondary small">
                            {item.book.genre}
                          </span>
                          {item.progress_percent >= 100 && (
                            <span className="badge bg-success small">
                              <i className="bi bi-check-circle-fill me-1"></i>Finished
                            </span>
                          )}
                        </div>

                        <p className="small text-muted mb-2">by {item.book.author}</p>

                        {/* Progress bar */}
                        <div className="d-flex align-items-center gap-2 mb-2" style={{ maxWidth: '350px' }}>
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div
                              className={`progress-bar ${
                                item.progress_percent >= 100 ? 'bg-success' : 'bg-primary'
                              }`}
                              style={{ width: `${item.progress_percent}%` }}
                            ></div>
                          </div>
                          <span className="small fw-bold text-muted">{item.progress_percent}%</span>
                        </div>

                        {/* Notes */}
                        {editingId === item.id ? (
                          <div className="p-2 bg-light rounded border mt-2">
                            <div className="row g-2 align-items-center">
                              <div className="col-sm-4">
                                <label className="form-label small text-muted mb-0">Progress %</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  className="form-control form-control-sm"
                                  value={progressInput}
                                  onChange={(e) => setProgressInput(Number(e.target.value))}
                                />
                              </div>
                              <div className="col-sm-8">
                                <label className="form-label small text-muted mb-0">Reading Note</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={noteInput}
                                  onChange={(e) => setNoteInput(e.target.value)}
                                  placeholder="E.g. Chapter 4, great dialogue"
                                />
                              </div>
                            </div>
                            <div className="mt-2 d-flex gap-2 justify-content-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => saveEdit(item.id)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="small text-muted d-flex align-items-center gap-2 flex-wrap">
                            <span className="fst-italic text-dark">
                              <i className="bi bi-chat-left-quote me-1 text-primary"></i>
                              {item.notes || 'No custom notes logged yet.'}
                            </span>
                            <button
                              type="button"
                              className="btn btn-link btn-xs p-0 text-decoration-none"
                              onClick={() => startEdit(item)}
                              title="Edit progress and notes"
                            >
                              <i className="bi bi-pencil"></i> edit
                            </button>
                          </div>
                        )}

                        <div className="small text-muted mt-1">
                          <i className="bi bi-clock me-1"></i> Last activity: {item.read_at}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="col-md-auto d-flex flex-row flex-md-column gap-2">
                        <button
                          type="button"
                          className="btn btn-success btn-sm d-flex align-items-center justify-content-center gap-1"
                          onClick={() => onOpenReader(item.book)}
                        >
                          <i className="bi bi-book-half"></i> Continue Reading
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm d-flex align-items-center justify-content-center gap-1"
                          onClick={() => onSelectBook(item.book)}
                        >
                          <i className="bi bi-info-circle"></i> Details
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-1"
                          onClick={() => onDeleteHistoryItem(item.id)}
                          title="Delete from reading history"
                        >
                          <i className="bi bi-trash3"></i> Delete
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

      {/* Order History View */}
      {activeTab === 'orders' && (
        <div>
          {filteredOrders.length === 0 ? (
            <div className="card border-0 shadow-sm text-center py-5">
              <div className="card-body">
                <i className="bi bi-receipt text-muted display-4 mb-3"></i>
                <h4 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {searchTerm ? 'No matching orders found' : 'No Order History Yet'}
                </h4>
                <p className="text-muted mb-4" style={{ maxWidth: '480px', margin: '0 auto' }}>
                  You haven't ordered any physical book copies yet. Check out our bookstore collection and place your first order!
                </p>
                <button type="button" className="btn btn-primary px-4 py-2" onClick={onBrowseBooks}>
                  <i className="bi bi-bag me-1"></i> Browse Bookstore
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="card border-0 shadow-sm overflow-hidden">
                  <div className="card-header bg-light py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                      <span className="text-muted small">ORDER NUMBER</span>
                      <div className="fw-bold text-dark font-monospace fs-6">{order.order_number}</div>
                    </div>
                    <div>
                      <span className="text-muted small">ORDER DATE</span>
                      <div className="small fw-semibold">{order.created_at}</div>
                    </div>
                    <div>
                      <span className="text-muted small">TOTAL PAID</span>
                      <div className="fw-bold text-success fs-6">₹{order.total_amount.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted small">STATUS</span>
                      <div>
                        <span
                          className={`badge ${
                            order.status === 'completed'
                              ? 'bg-success'
                              : order.status === 'processing'
                              ? 'bg-primary'
                              : 'bg-warning text-dark'
                          } text-uppercase`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="card-body p-4">
                    <h6 className="fw-bold text-muted small text-uppercase mb-3">Purchased Items</h6>
                    <div className="table-responsive mb-3">
                      <table className="table table-sm align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Book Title</th>
                            <th>Author</th>
                            <th className="text-center">Qty</th>
                            <th className="text-end">Price</th>
                            <th className="text-end">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id}>
                              <td className="fw-bold text-dark">{item.title}</td>
                              <td className="text-muted small">{item.author}</td>
                              <td className="text-center">{item.quantity}</td>
                              <td className="text-end">₹{item.price.toFixed(2)}</td>
                              <td className="text-end fw-bold">₹{item.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-3 bg-light rounded small border d-flex flex-wrap justify-content-between gap-2">
                      <div>
                        <strong>Shipping to:</strong> {order.shipping_name}, {order.shipping_address}, {order.shipping_city}, {order.shipping_country}
                      </div>
                      <div>
                        <strong>Payment:</strong> <span className="text-capitalize">{order.payment_method}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
