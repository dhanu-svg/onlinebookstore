import React, { useState } from 'react';
import { Book, User, Order, FavoriteItem, ReadLaterItem, ReadingHistoryItem } from '../types';

interface DatabaseInspectorModalProps {
  books: Book[];
  users: User[];
  orders: Order[];
  favorites?: FavoriteItem[];
  readLater?: ReadLaterItem[];
  readingHistory?: ReadingHistoryItem[];
  onClose: () => void;
}

export const DatabaseInspectorModal: React.FC<DatabaseInspectorModalProps> = ({
  books,
  users,
  orders,
  favorites = [],
  readLater = [],
  readingHistory = [],
  onClose
}) => {
  const [activeTable, setActiveTable] = useState<'books' | 'users' | 'orders' | 'order_items' | 'favorites' | 'read_later' | 'reading_history'>('books');
  const [customQuery, setCustomQuery] = useState('SELECT * FROM books WHERE stock > 0 ORDER BY price DESC;');
  const [queryResult, setQueryResult] = useState<string | null>(null);

  // Flatten order items for order_items table
  const allOrderItems = orders.flatMap((o) => o.items);

  const runSimulatedQuery = () => {
    const q = customQuery.trim().toLowerCase();
    if (q.includes('from books')) {
      setQueryResult(`Query OK. Returned ${books.length} rows from \`books\` table.`);
    } else if (q.includes('from users')) {
      setQueryResult(`Query OK. Returned ${users.length} rows from \`users\` table.`);
    } else if (q.includes('from orders')) {
      setQueryResult(`Query OK. Returned ${orders.length} rows from \`orders\` table.`);
    } else if (q.includes('from order_items')) {
      setQueryResult(`Query OK. Returned ${allOrderItems.length} rows from \`order_items\` table.`);
    } else if (q.includes('from favorites')) {
      setQueryResult(`Query OK. Returned ${favorites.length} rows from \`favorites\` table.`);
    } else if (q.includes('from read_later')) {
      setQueryResult(`Query OK. Returned ${readLater.length} rows from \`read_later\` table.`);
    } else if (q.includes('from reading_history')) {
      setQueryResult(`Query OK. Returned ${readingHistory.length} rows from \`reading_history\` table.`);
    } else {
      setQueryResult(`Query executed successfully against MySQL bookstore_db.`);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1080 }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-dark text-white py-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-database text-info fs-4"></i>
              <div>
                <h5 className="modal-title fw-bold mb-0">MySQL Database Inspector &amp; Schema</h5>
                <small className="text-muted">Database: <code>bookstore_db</code> (InnoDB, utf8mb4)</small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            {/* Table Tabs */}
            <div className="d-flex gap-2 mb-3 flex-wrap">
              <button
                type="button"
                className={`btn btn-sm ${activeTable === 'books' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTable('books')}
              >
                <i className="bi bi-table me-1"></i> books ({books.length} rows)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTable === 'users' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTable('users')}
              >
                <i className="bi bi-table me-1"></i> users ({users.length} rows)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTable === 'orders' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTable('orders')}
              >
                <i className="bi bi-table me-1"></i> orders ({orders.length} rows)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTable === 'order_items' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTable('order_items')}
              >
                <i className="bi bi-table me-1"></i> order_items ({allOrderItems.length} rows)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTable === 'favorites' ? 'btn-danger fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTable('favorites')}
              >
                <i className="bi bi-heart-fill me-1"></i> favorites ({favorites.length} rows)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTable === 'read_later' ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTable('read_later')}
              >
                <i className="bi bi-clock-fill me-1"></i> read_later ({readLater.length} rows)
              </button>
              <button
                type="button"
                className={`btn btn-sm ${activeTable === 'reading_history' ? 'btn-success fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTable('reading_history')}
              >
                <i className="bi bi-clock-history me-1"></i> reading_history ({readingHistory.length} rows)
              </button>
            </div>

            {/* Table Data View */}
            <div className="card mb-4 border">
              <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold font-monospace small">TABLE `{activeTable}`</span>
                <span className="badge bg-secondary">ENGINE=InnoDB</span>
              </div>
              <div className="card-body p-0" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {activeTable === 'books' && (
                  <table className="table table-sm table-striped font-monospace small mb-0">
                    <thead className="table-dark sticky-top">
                      <tr>
                        <th>id (PK)</th>
                        <th>title</th>
                        <th>author</th>
                        <th>price</th>
                        <th>stock</th>
                        <th>genre</th>
                        <th>isbn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((b) => (
                        <tr key={b.id}>
                          <td className="fw-bold">{b.id}</td>
                          <td>{b.title}</td>
                          <td>{b.author}</td>
                          <td>₹{b.price.toFixed(2)}</td>
                          <td>{b.stock}</td>
                          <td>{b.genre}</td>
                          <td>{b.isbn || 'NULL'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTable === 'users' && (
                  <table className="table table-sm table-striped font-monospace small mb-0">
                    <thead className="table-dark sticky-top">
                      <tr>
                        <th>id (PK)</th>
                        <th>name</th>
                        <th>email (UNIQUE)</th>
                        <th>role</th>
                        <th>created_at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="fw-bold">{u.id}</td>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td>{u.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTable === 'orders' && (
                  <table className="table table-sm table-striped font-monospace small mb-0">
                    <thead className="table-dark sticky-top">
                      <tr>
                        <th>id (PK)</th>
                        <th>user_id (FK)</th>
                        <th>order_number (UNIQUE)</th>
                        <th>total_amount</th>
                        <th>shipping_name</th>
                        <th>status</th>
                        <th>created_at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id}>
                          <td className="fw-bold">{o.id}</td>
                          <td>{o.user_id}</td>
                          <td>{o.order_number}</td>
                          <td>₹{o.total_amount.toFixed(2)}</td>
                          <td>{o.shipping_name}</td>
                          <td>
                            <span className="badge bg-success">{o.status}</span>
                          </td>
                          <td>{o.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTable === 'order_items' && (
                  <table className="table table-sm table-striped font-monospace small mb-0">
                    <thead className="table-dark sticky-top">
                      <tr>
                        <th>id (PK)</th>
                        <th>order_id (FK)</th>
                        <th>book_id (FK)</th>
                        <th>title</th>
                        <th>price</th>
                        <th>quantity</th>
                        <th>subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allOrderItems.map((it) => (
                        <tr key={it.id}>
                          <td className="fw-bold">{it.id}</td>
                          <td>{it.order_id}</td>
                          <td>{it.book_id}</td>
                          <td>{it.title}</td>
                          <td>₹{it.price.toFixed(2)}</td>
                          <td>{it.quantity}</td>
                          <td>₹{it.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTable === 'favorites' && (
                  <table className="table table-sm table-striped font-monospace small mb-0">
                    <thead className="table-dark sticky-top">
                      <tr>
                        <th>id (PK)</th>
                        <th>user_id (FK)</th>
                        <th>book_id (FK)</th>
                        <th>book_title</th>
                        <th>personal_note</th>
                        <th>created_at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {favorites.map((fav) => (
                        <tr key={fav.id}>
                          <td className="fw-bold">{fav.id}</td>
                          <td>{fav.user_id}</td>
                          <td>{fav.book_id}</td>
                          <td>{fav.book.title}</td>
                          <td className="fst-italic">{fav.note || 'NULL'}</td>
                          <td>{fav.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTable === 'read_later' && (
                  <table className="table table-sm table-striped font-monospace small mb-0">
                    <thead className="table-dark sticky-top">
                      <tr>
                        <th>id (PK)</th>
                        <th>user_id (FK)</th>
                        <th>book_id (FK)</th>
                        <th>book_title</th>
                        <th>priority</th>
                        <th>added_at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readLater.map((rl) => (
                        <tr key={rl.id}>
                          <td className="fw-bold">{rl.id}</td>
                          <td>{rl.user_id}</td>
                          <td>{rl.book_id}</td>
                          <td>{rl.book.title}</td>
                          <td>
                            <span className={`badge ${rl.priority === 'high' ? 'bg-danger' : rl.priority === 'medium' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                              {rl.priority}
                            </span>
                          </td>
                          <td>{rl.added_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTable === 'reading_history' && (
                  <table className="table table-sm table-striped font-monospace small mb-0">
                    <thead className="table-dark sticky-top">
                      <tr>
                        <th>id (PK)</th>
                        <th>user_id (FK)</th>
                        <th>book_id (FK)</th>
                        <th>book_title</th>
                        <th>progress_percent</th>
                        <th>notes</th>
                        <th>read_at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {readingHistory.map((rh) => (
                        <tr key={rh.id}>
                          <td className="fw-bold">{rh.id}</td>
                          <td>{rh.user_id}</td>
                          <td>{rh.book_id}</td>
                          <td>{rh.book.title}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-bold">{rh.progress_percent}%</span>
                              <div className="progress" style={{ width: '60px', height: '6px' }}>
                                <div className="progress-bar bg-success" style={{ width: `${rh.progress_percent}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="text-truncate" style={{ maxWidth: '200px' }}>{rh.notes || 'NULL'}</td>
                          <td>{rh.read_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* SQL Query Console */}
            <div className="card bg-dark text-white p-3">
              <h6 className="fw-bold text-info mb-2 font-monospace">
                <i className="bi bi-terminal me-1"></i> SQL Query Console
              </h6>
              <div className="input-group input-group-sm mb-2">
                <span className="input-group-text bg-secondary text-white border-secondary font-monospace">mysql&gt;</span>
                <input
                  type="text"
                  className="form-control bg-black text-warning font-monospace border-secondary"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="SELECT * FROM books..."
                />
                <button
                  type="button"
                  className="btn btn-info fw-bold"
                  onClick={runSimulatedQuery}
                >
                  Execute Query
                </button>
              </div>
              {queryResult && (
                <div className="p-2 bg-black rounded font-monospace small text-success">
                  &gt; {queryResult}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
