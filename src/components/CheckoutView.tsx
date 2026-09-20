import React, { useState } from 'react';
import { User, CartItem, Order } from '../types';

interface CheckoutViewProps {
  cart: CartItem[];
  currentUser: User | null;
  onOrderPlaced: (order: Order) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onCancel: () => void;
  onViewOrderHistory: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  currentUser,
  onOrderPlaced,
  onOpenAuth,
  onCancel,
  onViewOrderHistory
}) => {
  const [shippingName, setShippingName] = useState(currentUser?.name || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingCountry, setShippingCountry] = useState('United States');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [errors, setErrors] = useState<string[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  if (!currentUser) {
    return (
      <div className="card border-0 shadow-sm text-center p-5 my-4">
        <div className="card-body">
          <i className="bi bi-person-lock text-warning display-3 mb-3"></i>
          <h4 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sign In Required to Checkout
          </h4>
          <p className="text-muted mb-4">
            Please log in with your reader account or register a new account to proceed with your order.
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
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    if (!shippingName.trim()) validationErrors.push('Recipient full name is required.');
    if (!shippingAddress.trim()) validationErrors.push('Shipping street address is required.');
    if (!shippingCity.trim()) validationErrors.push('City is required.');
    if (!shippingCountry.trim()) validationErrors.push('Country is required.');

    if (cart.length === 0) {
      validationErrors.push('Cart is empty.');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    // Create Relational Order & Order Items
    const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newOrderId = Date.now();

    const orderItems = cart.map((item, index) => ({
      id: newOrderId * 10 + index,
      order_id: newOrderId,
      book_id: item.book.id,
      title: item.book.title,
      author: item.book.author,
      price: item.book.price,
      quantity: item.quantity,
      subtotal: item.book.price * item.quantity
    }));

    const newOrder: Order = {
      id: newOrderId,
      user_id: currentUser.id,
      order_number: orderNumber,
      total_amount: subtotal,
      shipping_name: shippingName.trim(),
      shipping_address: shippingAddress.trim(),
      shipping_city: shippingCity.trim(),
      shipping_country: shippingCountry.trim(),
      payment_method: paymentMethod,
      status: 'completed',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      items: orderItems
    };

    // Trigger state update
    onOrderPlaced(newOrder);
    setConfirmedOrder(newOrder);
  };

  // If order was placed, display submitted form data back to user with confirmation
  if (confirmedOrder) {
    return (
      <div className="row justify-content-center my-4" id="order-confirmation-screen">
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white py-4 text-center">
              <i className="bi bi-check-circle-fill display-4 d-block mb-2"></i>
              <h3 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Order Confirmed!
              </h3>
              <p className="mb-0 opacity-75">
                Order Number: <strong className="font-monospace">{confirmedOrder.order_number}</strong>
              </p>
            </div>

            <div className="card-body p-4 p-md-5">
              <div className="alert alert-light border d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                  <span className="text-muted small d-block">Customer:</span>
                  <strong className="text-dark">{currentUser.name}</strong> ({currentUser.email})
                </div>
                <div>
                  <span className="text-muted small d-block">Date:</span>
                  <strong>{confirmedOrder.created_at}</strong>
                </div>
                <div>
                  <span className="badge bg-success px-3 py-2 text-uppercase">Completed</span>
                </div>
              </div>

              {/* Confirmation of submitted shipping data */}
              <h5 className="fw-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                <i className="bi bi-geo-alt-fill text-primary me-2"></i>Submitted Shipping &amp; Billing Details
              </h5>
              <div className="row g-3 mb-4 bg-light p-3 rounded border">
                <div className="col-md-6">
                  <span className="text-muted small d-block">Recipient:</span>
                  <strong>{confirmedOrder.shipping_name}</strong>
                </div>
                <div className="col-md-6">
                  <span className="text-muted small d-block">Payment Method:</span>
                  <strong>{confirmedOrder.payment_method}</strong>
                </div>
                <div className="col-12">
                  <span className="text-muted small d-block">Delivery Address:</span>
                  <span>
                    {confirmedOrder.shipping_address}, {confirmedOrder.shipping_city}, {confirmedOrder.shipping_country}
                  </span>
                </div>
              </div>

              {/* Line items confirmation */}
              <h5 className="fw-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                <i className="bi bi-journal-bookmark text-primary me-2"></i>Ordered Public-Domain Editions
              </h5>
              <div className="table-responsive mb-4">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Title &amp; Author</th>
                      <th className="text-center">Price</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmedOrder.items.map((it) => (
                      <tr key={it.id}>
                        <td>
                          <strong>{it.title}</strong>
                          <div className="small text-muted">by {it.author}</div>
                        </td>
                        <td className="text-center">₹{it.price.toFixed(2)}</td>
                        <td className="text-center">{it.quantity}</td>
                        <td className="text-end fw-semibold">₹{it.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={3} className="text-end">
                        Total Amount Charged:
                      </th>
                      <th className="text-end text-primary fs-5">
                        ₹{confirmedOrder.total_amount.toFixed(2)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="d-flex justify-content-between flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary px-4 fw-semibold"
                  onClick={onViewOrderHistory}
                  id="btn-view-order-history"
                >
                  <i className="bi bi-clock-history me-1"></i> View in Order History
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={onCancel}
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-4 my-3" id="checkout-container">
      <div className="col-lg-7">
        <div className="card border-0 shadow-sm p-4 bg-white">
          <h4 className="fw-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            <i className="bi bi-credit-card-2-front text-primary me-2"></i>Delivery &amp; Payment Details
          </h4>

          {errors.length > 0 && (
            <div className="alert alert-danger mb-4 shadow-sm">
              <h6 className="fw-bold mb-2">Please correct the following errors:</h6>
              <ul className="mb-0 ps-3">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="checkout-name" className="form-label fw-semibold">
                Recipient Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="checkout-name"
                className="form-control"
                value={shippingName}
                onChange={(e) => setShippingName(e.target.value)}
                placeholder="Eleanor Dashwood"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="checkout-address" className="form-label fw-semibold">
                Shipping Street Address <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="checkout-address"
                className="form-control"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="48 Barton Cottage Road"
                required
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label htmlFor="checkout-city" className="form-label fw-semibold">
                  City <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="checkout-city"
                  className="form-control"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  placeholder="Devonshire"
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="checkout-country" className="form-label fw-semibold">
                  Country <span className="text-danger">*</span>
                </label>
                <select
                  id="checkout-country"
                  className="form-select"
                  value={shippingCountry}
                  onChange={(e) => setShippingCountry(e.target.value)}
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Payment Method</label>
              <div className="border rounded p-3 bg-light">
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentRadio"
                    id="pay-card"
                    value="Credit Card"
                    checked={paymentMethod === 'Credit Card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="pay-card">
                    <i className="bi bi-credit-card me-1"></i> Credit / Debit Card (Direct simulated fulfillment)
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentRadio"
                    id="pay-cod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="pay-cod">
                    <i className="bi bi-cash-stack me-1"></i> Pay Upon Delivery / In-Store Pickup
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-warning btn-lg w-100 fw-bold py-3 shadow-sm"
              id="btn-confirm-place-order"
            >
              <i className="bi bi-lock-fill me-1"></i> Place Order (₹{subtotal.toFixed(2)})
            </button>
          </form>
        </div>
      </div>

      {/* Overview Column */}
      <div className="col-lg-5">
        <div className="card border-0 shadow-sm p-4 bg-white sticky-top" style={{ top: '80px' }}>
          <h5 className="fw-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Items in Order ({cart.length})
          </h5>

          <div className="list-group list-group-flush mb-3">
            {cart.map(({ book, quantity }) => (
              <div key={book.id} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={book.cover_image}
                    alt=""
                    style={{ width: '35px', height: '50px', objectFit: 'cover' }}
                    className="rounded shadow-xs"
                  />
                  <div>
                    <h6 className="mb-0 small fw-bold text-truncate" style={{ maxWidth: '180px' }}>
                      {book.title}
                    </h6>
                    <small className="text-muted">
                      {quantity} &times; ₹{book.price.toFixed(2)}
                    </small>
                  </div>
                </div>
                <span className="fw-bold">₹{(book.price * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-between mb-2 text-muted">
            <span>Subtotal</span>
            <span className="text-dark fw-semibold">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2 text-muted">
            <span>Shipping</span>
            <span className="text-success fw-semibold">FREE</span>
          </div>

          <hr className="my-2" />

          <div className="d-flex justify-content-between fs-5 fw-bold text-dark mb-4">
            <span>Total</span>
            <span className="text-primary">₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="p-3 bg-light rounded small text-muted">
            <i className="bi bi-shield-check text-success me-1"></i> Submitting this form processes your order with instant confirmation and saves your purchase to your account history.
          </div>
        </div>
      </div>
    </div>
  );
};
