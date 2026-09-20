import React from 'react';
import { Order, User } from '../types';

interface OrderHistoryViewProps {
  orders: Order[];
  currentUser: User | null;
  onBrowseBooks: () => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  currentUser,
  onBrowseBooks
}) => {
  // Filter orders for the logged-in user
  const userOrders = orders.filter(
    (ord) => currentUser && ord.user_id === currentUser.id
  );

  return (
    <div className="my-4" id="order-history-container">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            <i className="bi bi-clock-history text-primary me-2"></i>My Order History
          </h2>
          <p className="text-muted mb-0">
            Account: <strong>{currentUser?.email}</strong> &middot; {userOrders.length} order(s) placed
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={onBrowseBooks}
        >
          <i className="bi bi-book me-1"></i> Browse Catalog
        </button>
      </div>

      {userOrders.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <i className="bi bi-receipt text-muted display-3 mb-3"></i>
            <h4 className="fw-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              No Orders Found
            </h4>
            <p className="text-muted mb-4">
              You haven't ordered any physical book editions yet. Browse our public-domain catalog!
            </p>
            <button
              type="button"
              className="btn btn-primary px-4 py-2"
              onClick={onBrowseBooks}
            >
              Explore Books
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {userOrders.map((order) => (
            <div className="col-12" key={order.id}>
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <span className="text-muted small d-block">Order Number</span>
                    <span className="fw-bold font-monospace text-primary">{order.order_number}</span>
                  </div>
                  <div>
                    <span className="text-muted small d-block">Placed On</span>
                    <span className="fw-semibold text-dark">{order.created_at}</span>
                  </div>
                  <div>
                    <span className="text-muted small d-block">Total Paid</span>
                    <span className="fw-bold text-dark fs-5">₹{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="badge bg-success px-3 py-2 text-uppercase">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="card-body p-4">
                  <div className="row g-3 mb-3 small">
                    <div className="col-md-6">
                      <span className="text-muted d-block fw-semibold">Delivery Address:</span>
                      <div><strong>{order.shipping_name}</strong></div>
                      <div className="text-muted">
                        {order.shipping_address}, {order.shipping_city}, {order.shipping_country}
                      </div>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <span className="text-muted d-block fw-semibold">Payment Method:</span>
                      <div>{order.payment_method}</div>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-sm table-bordered align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Book Title &amp; Author</th>
                          <th className="text-center" style={{ width: '15%' }}>Unit Price</th>
                          <th className="text-center" style={{ width: '15%' }}>Qty</th>
                          <th className="text-end" style={{ width: '15%' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((it) => (
                          <tr key={it.id}>
                            <td>
                              <div className="fw-semibold text-dark">{it.title}</div>
                              <div className="text-muted small">by {it.author}</div>
                            </td>
                            <td className="text-center">₹{it.price.toFixed(2)}</td>
                            <td className="text-center">{it.quantity}</td>
                            <td className="text-end fw-bold">₹{it.subtotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
