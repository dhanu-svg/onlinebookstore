import React from 'react';
import { CartItem } from '../types';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (bookId: number, newQty: number) => void;
  onRemoveItem: (bookId: number) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping
}) => {
  const subtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="card border-0 shadow-sm text-center py-5 my-4">
        <div className="card-body">
          <i className="bi bi-cart-x text-muted display-3 mb-3"></i>
          <h4 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Cart is Empty
          </h4>
          <p className="text-muted mb-4">
            You have not added any public-domain collector editions yet.
          </p>
          <button
            type="button"
            className="btn btn-warning px-4 py-2 fw-semibold"
            onClick={onContinueShopping}
            id="cart-empty-browse-btn"
          >
            <i className="bi bi-collection me-1"></i> Browse Shelf Space Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4" id="cart-view-container">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            <i className="bi bi-bag-check text-primary me-2"></i>Shopping Cart
          </h2>
          <p className="text-muted mb-0">
            Session-backed cart with AJAX state management &middot; {cart.length} unique book(s)
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onContinueShopping}
        >
          <i className="bi bi-arrow-left me-1"></i> Continue Browsing
        </button>
      </div>

      <div className="row g-4">
        {/* Table of items */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '45%' }}>Book</th>
                      <th className="text-center" style={{ width: '15%' }}>Price</th>
                      <th className="text-center" style={{ width: '20%' }}>Quantity</th>
                      <th className="text-end" style={{ width: '15%' }}>Total</th>
                      <th className="text-center" style={{ width: '5%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(({ book, quantity }) => (
                      <tr key={book.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={book.cover_image}
                              alt={book.title}
                              className="rounded shadow-sm"
                              style={{ width: '45px', height: '65px', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://placehold.co/100x150/2d3748/ffffff?text=Book`;
                              }}
                            />
                            <div>
                              <h6 className="fw-bold mb-0 text-dark">{book.title}</h6>
                              <small className="text-muted">{book.author}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center fw-semibold text-secondary">
                          ₹{book.price.toFixed(2)}
                        </td>
                        <td className="text-center">
                          <div
                            className="input-group input-group-sm justify-content-center mx-auto"
                            style={{ maxWidth: '110px' }}
                          >
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => onUpdateQuantity(book.id, quantity - 1)}
                            >
                              -
                            </button>
                            <input
                              type="text"
                              className="form-control text-center px-1"
                              value={quantity}
                              readOnly
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => onUpdateQuantity(book.id, quantity + 1)}
                              disabled={quantity >= book.stock}
                            >
                              +
                            </button>
                          </div>
                          {quantity >= book.stock && (
                            <div className="text-danger small mt-1" style={{ fontSize: '0.7rem' }}>
                              Max stock reached
                            </div>
                          )}
                        </td>
                        <td className="text-end fw-bold text-primary">
                          ₹{(book.price * quantity).toFixed(2)}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-link text-danger p-0"
                            title="Remove book from cart"
                            onClick={() => onRemoveItem(book.id)}
                          >
                            <i className="bi bi-trash3 fs-6"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 bg-white sticky-top" style={{ top: '80px' }}>
            <h5 className="fw-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Order Summary
            </h5>

            <div className="d-flex justify-content-between mb-2 text-muted">
              <span>Subtotal</span>
              <span className="fw-semibold text-dark">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 text-muted">
              <span>Standard Shipping</span>
              <span className="text-success fw-semibold">FREE</span>
            </div>
            <div className="d-flex justify-content-between mb-3 text-muted">
              <span>Sales Tax / GST</span>
              <span className="fw-semibold text-dark">₹0.00</span>
            </div>

            <hr className="my-2" />

            <div className="d-flex justify-content-between mb-4 fs-5 fw-bold text-dark">
              <span>Estimated Total</span>
              <span className="text-primary">₹{subtotal.toFixed(2)}</span>
            </div>

            <button
              type="button"
              className="btn btn-warning btn-lg fw-bold py-2 shadow-sm w-100 mb-3"
              onClick={onProceedToCheckout}
              id="btn-proceed-checkout"
            >
              Proceed to Checkout <i className="bi bi-arrow-right ms-1"></i>
            </button>

            <div className="p-3 bg-light rounded small text-muted">
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-shield-lock-fill text-success fs-5"></i>
                <span className="fw-bold text-dark">Guaranteed &amp; Secure Checkout</span>
              </div>
              <span>All orders include inventory reservation, instant order confirmation, and complimentary digital reader access.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
