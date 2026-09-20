import React, { useState } from 'react';
import { Book, Order } from '../types';

interface AdminPanelProps {
  books: Book[];
  orders: Order[];
  onAddBook: (book: Omit<Book, 'id'>) => Book;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (bookId: number) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  books,
  orders,
  onAddBook,
  onUpdateBook,
  onDeleteBook
}) => {
  const [adminTab, setAdminTab] = useState<'inventory' | 'add' | 'edit' | 'orders'>('inventory');
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Add/Edit Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '12.99',
    stock: '15',
    cover_image: '',
    gutenberg_url: '',
    genre: 'Classic Literature',
    isbn: '',
    year: ''
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [confirmedSubmittedData, setConfirmedSubmittedData] = useState<{
    action: 'add' | 'edit';
    book: Book;
  } | null>(null);

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      price: '12.99',
      stock: '15',
      cover_image: '',
      gutenberg_url: '',
      genre: 'Classic Literature',
      isbn: '',
      year: ''
    });
    setFormErrors([]);
    setConfirmedSubmittedData(null);
  };

  const handleStartEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price.toString(),
      stock: book.stock.toString(),
      cover_image: book.cover_image,
      gutenberg_url: book.gutenberg_url,
      genre: book.genre || 'Classic Literature',
      isbn: book.isbn || '',
      year: book.year ? book.year.toString() : ''
    });
    setFormErrors([]);
    setConfirmedSubmittedData(null);
    setAdminTab('edit');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];

    // Client & Server-side style validation
    if (!formData.title.trim()) errs.push('Book title is required.');
    if (!formData.author.trim()) errs.push('Author name is required.');
    if (!formData.description.trim()) errs.push('Book synopsis / description is required.');
    
    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      errs.push('Price must be a valid non-negative number.');
    }

    const parsedStock = parseInt(formData.stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      errs.push('Stock quantity must be a non-negative integer.');
    }

    if (!formData.cover_image.trim()) {
      errs.push('Cover image URL is required.');
    } else if (!formData.cover_image.startsWith('http://') && !formData.cover_image.startsWith('https://')) {
      errs.push('Cover image URL must start with http:// or https://');
    }

    if (!formData.gutenberg_url.trim()) {
      errs.push('Project Gutenberg reading source URL is required.');
    } else if (!formData.gutenberg_url.startsWith('http://') && !formData.gutenberg_url.startsWith('https://')) {
      errs.push('Project Gutenberg URL must start with http:// or https://');
    }

    if (errs.length > 0) {
      setFormErrors(errs);
      return;
    }

    setFormErrors([]);

    if (adminTab === 'add') {
      const createdBook = onAddBook({
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        price: parsedPrice,
        stock: parsedStock,
        cover_image: formData.cover_image.trim(),
        gutenberg_url: formData.gutenberg_url.trim(),
        genre: formData.genre,
        isbn: formData.isbn.trim() || undefined,
        year: formData.year ? parseInt(formData.year, 10) : undefined
      });

      // Display submitted form data back to user with confirmation
      setConfirmedSubmittedData({
        action: 'add',
        book: createdBook
      });
    } else if (adminTab === 'edit' && editingBook) {
      const updated: Book = {
        ...editingBook,
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        price: parsedPrice,
        stock: parsedStock,
        cover_image: formData.cover_image.trim(),
        gutenberg_url: formData.gutenberg_url.trim(),
        genre: formData.genre,
        isbn: formData.isbn.trim() || undefined,
        year: formData.year ? parseInt(formData.year, 10) : undefined
      };

      onUpdateBook(updated);

      // Display submitted form data back to user with confirmation
      setConfirmedSubmittedData({
        action: 'edit',
        book: updated
      });
    }
  };

  const executeDelete = () => {
    if (bookToDelete) {
      onDeleteBook(bookToDelete.id);
      setBookToDelete(null);
    }
  };

  const prefillJaneEyre = () => {
    setFormData({
      title: 'Jane Eyre',
      author: 'Charlotte Brontë',
      description: 'An orphaned governess discovers romance, dark secrets, and high moral courage locked within Thornfield Hall with Mr. Rochester, revolutionizing Victorian literature.',
      price: '11.99',
      stock: '20',
      cover_image: 'https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg',
      gutenberg_url: 'https://www.gutenberg.org/cache/epub/1260/pg1260-images.html',
      genre: 'Gothic Horror',
      isbn: '9780141441146',
      year: '1847'
    });
  };

  const prefillTimeMachine = () => {
    setFormData({
      title: 'The Time Machine',
      author: 'H.G. Wells',
      description: 'A Victorian scientist travels into the far future of AD 802,701, encountering the gentle Eloi and the monstrous subterranean Morlocks in the seminal foundation of science fiction.',
      price: '9.95',
      stock: '25',
      cover_image: 'https://covers.openlibrary.org/b/isbn/9780451528551-L.jpg',
      gutenberg_url: 'https://www.gutenberg.org/cache/epub/35/pg35-images.html',
      genre: 'Science Fiction',
      isbn: '9780451528551',
      year: '1895'
    });
  };

  return (
    <div className="my-4" id="admin-panel-container">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <span className="badge bg-danger text-uppercase px-2 py-1 mb-1">Administrator Access</span>
          <h2 className="fw-bold mb-0" style={{ fontFamily: "'Playfair Display', serif" }}>
            <i className="bi bi-shield-lock-fill text-warning me-2"></i>Admin Dashboard
          </h2>
        </div>

        {/* Sub-nav Buttons */}
        <div className="btn-group shadow-sm">
          <button
            type="button"
            className={`btn ${adminTab === 'inventory' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => {
              setAdminTab('inventory');
              setConfirmedSubmittedData(null);
            }}
          >
            <i className="bi bi-journal-text me-1"></i> Books ({books.length})
          </button>
          <button
            type="button"
            className={`btn ${adminTab === 'add' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => {
              resetForm();
              setAdminTab('add');
            }}
          >
            <i className="bi bi-plus-circle me-1"></i> Add Book
          </button>
          <button
            type="button"
            className={`btn ${adminTab === 'orders' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => {
              setAdminTab('orders');
              setConfirmedSubmittedData(null);
            }}
          >
            <i className="bi bi-receipt me-1"></i> Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* 1. CONFIRMATION VIEW (Display submitted form data back to user with confirmation) */}
      {confirmedSubmittedData && (
        <div className="card border-0 shadow-sm mb-4" id="admin-form-confirmation">
          <div className="card-header bg-success text-white py-3 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-check-circle-fill fs-4"></i>
              <div>
                <h5 className="mb-0 fw-bold">
                  {confirmedSubmittedData.action === 'add'
                    ? 'New Book Record Created in Catalog!'
                    : 'Book Record Successfully Updated!'}
                </h5>
                <small className="opacity-75">
                  Book ID #{confirmedSubmittedData.book.id} &middot; Saved to catalog
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-light btn-sm fw-semibold"
              onClick={() => {
                setConfirmedSubmittedData(null);
                setAdminTab('inventory');
              }}
            >
              Done &amp; View Inventory
            </button>
          </div>
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-card-checklist text-primary me-1"></i> Submitted Form Data Confirmation:
            </h6>
            <div className="row g-3">
              <div className="col-md-3 text-center">
                <img
                  src={confirmedSubmittedData.book.cover_image}
                  alt={confirmedSubmittedData.book.title}
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
              </div>
              <div className="col-md-9">
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <th style={{ width: '25%' }}>Title:</th>
                      <td className="fw-bold fs-6">{confirmedSubmittedData.book.title}</td>
                    </tr>
                    <tr>
                      <th>Author:</th>
                      <td>{confirmedSubmittedData.book.author}</td>
                    </tr>
                    <tr>
                      <th>Genre:</th>
                      <td><span className="badge bg-secondary">{confirmedSubmittedData.book.genre}</span></td>
                    </tr>
                    <tr>
                      <th>Price:</th>
                      <td className="text-primary fw-bold">₹{confirmedSubmittedData.book.price.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <th>Stock Quantity:</th>
                      <td>{confirmedSubmittedData.book.stock} units</td>
                    </tr>
                    <tr>
                      <th>Gutenberg Source:</th>
                      <td>
                        <a
                          href={confirmedSubmittedData.book.gutenberg_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: '350px' }}
                        >
                          {confirmedSubmittedData.book.gutenberg_url}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-12 mt-2">
                <span className="fw-semibold small text-muted d-block mb-1">Synopsis:</span>
                <p className="bg-light p-3 rounded small mb-0 border">
                  {confirmedSubmittedData.book.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. INVENTORY TAB (Read & Delete) */}
      {adminTab === 'inventory' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">All Books in Catalog ({books.length})</h5>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                resetForm();
                setAdminTab('add');
              }}
            >
              <i className="bi bi-plus-circle me-1"></i> Add New Book
            </button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '5%' }}>ID</th>
                    <th style={{ width: '10%' }}>Cover</th>
                    <th style={{ width: '30%' }}>Title &amp; Author</th>
                    <th style={{ width: '15%' }}>Genre</th>
                    <th style={{ width: '10%' }}>Price</th>
                    <th style={{ width: '10%' }}>Stock</th>
                    <th className="text-end" style={{ width: '20%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.id}>
                      <td className="fw-bold text-muted">{b.id}</td>
                      <td>
                        <img
                          src={b.cover_image}
                          alt=""
                          className="rounded shadow-sm"
                          style={{ width: '40px', height: '60px', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/80x120/2d3748/ffffff?text=Cover';
                          }}
                        />
                      </td>
                      <td>
                        <strong className="d-block text-dark">{b.title}</strong>
                        <span className="text-muted small">{b.author}</span>
                      </td>
                      <td className="small">{b.genre}</td>
                      <td className="fw-bold text-primary">₹{b.price.toFixed(2)}</td>
                      <td>
                        {b.stock <= 0 ? (
                          <span className="badge bg-danger">0 Out</span>
                        ) : b.stock < 5 ? (
                          <span className="badge bg-warning text-dark">{b.stock} Low</span>
                        ) : (
                          <span className="badge bg-success">{b.stock} In</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            title="Edit book"
                            onClick={() => handleStartEdit(b)}
                          >
                            <i className="bi bi-pencil-square me-1"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title="Delete book"
                            onClick={() => setBookToDelete(b)}
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

      {/* 3. ADD OR EDIT BOOK FORM TAB */}
      {(adminTab === 'add' || adminTab === 'edit') && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-pencil-square text-primary me-2"></i>
              {adminTab === 'add' ? 'Add New Book Record' : `Edit Book Record #${editingBook?.id}`}
            </h5>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setAdminTab('inventory')}
            >
              Cancel
            </button>
          </div>
          <div className="card-body p-4">
            {formErrors.length > 0 && (
              <div className="alert alert-danger mb-4 shadow-sm">
                <h6 className="fw-bold mb-2">Form Validation Errors:</h6>
                <ul className="mb-0 ps-3">
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick pre-fill buttons for adding */}
            {adminTab === 'add' && (
              <div className="alert alert-info py-2 px-3 small d-flex justify-content-between align-items-center mb-4">
                <span>
                  <i className="bi bi-lightbulb text-warning me-1"></i> Quick Pre-Fill Sample Classics:
                </span>
                <div className="btn-group btn-group-sm">
                  <button type="button" className="btn btn-outline-primary" onClick={prefillJaneEyre}>
                    Jane Eyre
                  </button>
                  <button type="button" className="btn btn-outline-primary" onClick={prefillTimeMachine}>
                    The Time Machine
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} noValidate>
              <div className="row g-3">
                <div className="col-md-8">
                  <label htmlFor="admin-title" className="form-label fw-semibold">
                    Book Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="admin-title"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Jane Eyre"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="admin-author" className="form-label fw-semibold">
                    Author <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="admin-author"
                    className="form-control"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Charlotte Brontë"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="admin-genre" className="form-label fw-semibold">
                    Genre
                  </label>
                  <select
                    id="admin-genre"
                    className="form-select"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  >
                    <option value="Classic Literature">Classic Literature</option>
                    <option value="Gothic Horror">Gothic Horror</option>
                    <option value="Classic Romance">Classic Romance</option>
                    <option value="Science Fiction">Science Fiction</option>
                    <option value="Mystery & Crime">Mystery & Crime</option>
                    <option value="Adventure & Epic">Adventure & Epic</option>
                    <option value="Philosophical Fiction">Philosophical Fiction</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="admin-price" className="form-label fw-semibold">
                    Price (₹) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="admin-price"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="admin-stock" className="form-label fw-semibold">
                    Stock Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="admin-stock"
                    className="form-control"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="admin-cover" className="form-label fw-semibold">
                    Cover Image URL <span className="text-danger">*</span>
                  </label>
                  <input
                    type="url"
                    id="admin-cover"
                    className="form-control"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg"
                    required
                  />
                  <div className="form-text small">
                    Use Open Library Covers API or Project Gutenberg direct cover links.
                  </div>
                </div>

                <div className="col-12">
                  <label htmlFor="admin-gutenberg" className="form-label fw-semibold">
                    Project Gutenberg Full Free Reading Source URL <span className="text-danger">*</span>
                  </label>
                  <input
                    type="url"
                    id="admin-gutenberg"
                    className="form-control"
                    value={formData.gutenberg_url}
                    onChange={(e) => setFormData({ ...formData, gutenberg_url: e.target.value })}
                    placeholder="https://www.gutenberg.org/cache/epub/1260/pg1260-images.html"
                    required
                  />
                  <div className="form-text small">
                    Unabridged HTML/Reader URL from Project Gutenberg.
                  </div>
                </div>

                <div className="col-md-6">
                  <label htmlFor="admin-isbn" className="form-label fw-semibold">
                    ISBN-13 (Optional)
                  </label>
                  <input
                    type="text"
                    id="admin-isbn"
                    className="form-control"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="9780141441146"
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="admin-year" className="form-label fw-semibold">
                    Published Year (Optional)
                  </label>
                  <input
                    type="number"
                    id="admin-year"
                    className="form-control"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="1847"
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="admin-desc" className="form-label fw-semibold">
                    Description / Synopsis <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="admin-desc"
                    className="form-control"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter unabridged synopsis..."
                    required
                  />
                </div>
              </div>

              <hr className="my-4" />

              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setAdminTab('inventory')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm">
                  <i className="bi bi-check-lg me-1"></i>
                  {adminTab === 'add' ? 'Save Book Record' : 'Update Book Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ORDERS TAB */}
      {adminTab === 'orders' && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">Customer Orders ({orders.length})</h5>
            <span className="badge bg-secondary">All Active Orders</span>
          </div>
          <div className="card-body p-0">
            {orders.length === 0 ? (
              <div className="text-center py-5 text-muted">No orders found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Order #</th>
                      <th>Date</th>
                      <th>Recipient &amp; Address</th>
                      <th>Items Ordered</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="fw-bold font-monospace text-primary">{o.order_number}</td>
                        <td className="small text-muted">{o.created_at}</td>
                        <td className="small">
                          <strong>{o.shipping_name}</strong>
                          <div className="text-muted">
                            {o.shipping_address}, {o.shipping_city}, {o.shipping_country}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border mb-1">
                            {o.items.length} book(s)
                          </span>
                          <ul className="list-unstyled mb-0 small text-muted" style={{ maxWidth: '240px' }}>
                            {o.items.map((it) => (
                              <li key={it.id} className="text-truncate">
                                &bull; {it.quantity}&times; {it.title}
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="fw-bold text-dark fs-6">₹{o.total_amount.toFixed(2)}</td>
                        <td>
                          <span className="badge bg-success text-uppercase">{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}
          tabIndex={-1}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Confirm Book Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setBookToDelete(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to permanently delete <strong>{bookToDelete.title}</strong> by{' '}
                  {bookToDelete.author} (ID #{bookToDelete.id}) from the catalog?
                </p>
                <div className="alert alert-warning small mb-0">
                  <i className="bi bi-info-circle me-1"></i> This book will be removed from the bookstore inventory and customer search results.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBookToDelete(null)}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-danger fw-semibold" onClick={executeDelete}>
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
