import React from 'react';
import { User } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: any) => void;
  currentUser: User | null;
  cartCount: number;
  libraryCount?: number;
  historyCount?: number;
  onOpenAuth: (initialMode?: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenDatabaseInspector?: () => void;
  onOpenCodeInspector?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  cartCount,
  libraryCount = 0,
  historyCount = 0,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="sticky-top shadow-sm" id="application-header">
      {/* Primary Brand & Actions Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-2" id="main-application-navbar">
        <div className="container">
          {/* Brand */}
          <button
            className="navbar-brand d-flex align-items-center gap-2 btn btn-link text-warning text-decoration-none p-0 fw-bold border-0"
            onClick={() => setCurrentTab('home')}
            id="brand-logo-btn"
          >
            <i className="bi bi-book-half fs-3 text-warning"></i>
            <span className="fs-4 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Shelf Space
            </span>
          </button>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#appNavContent"
            aria-controls="appNavContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Primary Navigation Links */}
          <div className="collapse navbar-collapse" id="appNavContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
              {/* Home Page */}
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-decoration-none border-0 px-2 px-xl-3 d-flex align-items-center gap-1 ${
                    currentTab === 'home' ? 'active text-warning fw-bold' : 'text-light'
                  }`}
                  onClick={() => setCurrentTab('home')}
                  id="nav-tab-home"
                >
                  <i className="bi bi-house-door-fill text-warning me-1"></i> Home Page
                </button>
              </li>

              {/* Catalog */}
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-decoration-none border-0 px-2 px-xl-3 d-flex align-items-center gap-1 ${
                    currentTab === 'books' ? 'active text-warning fw-bold' : 'text-light'
                  }`}
                  onClick={() => setCurrentTab('books')}
                  id="nav-tab-books"
                >
                  <i className="bi bi-collection me-1"></i> Catalog
                </button>
              </li>

              {/* Favorites / List */}
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-decoration-none border-0 px-2 px-xl-3 d-flex align-items-center gap-1 ${
                    currentTab === 'library' ? 'active text-warning fw-bold' : 'text-light'
                  }`}
                  onClick={() => setCurrentTab('library')}
                  id="nav-tab-favorites-list"
                  title="Your saved favorites and read-later list"
                >
                  <i className="bi bi-heart-fill text-danger me-1"></i>
                  <span>Favorites / List</span>
                  {libraryCount > 0 && (
                    <span className="badge bg-danger rounded-pill ms-1" style={{ fontSize: '0.7rem' }}>
                      {libraryCount}
                    </span>
                  )}
                </button>
              </li>

              {/* History */}
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-decoration-none border-0 px-2 px-xl-3 d-flex align-items-center gap-1 ${
                    currentTab === 'history' || currentTab === 'orders' ? 'active text-warning fw-bold' : 'text-light'
                  }`}
                  onClick={() => setCurrentTab('history')}
                  id="nav-tab-history"
                  title="Your reading history and book orders"
                >
                  <i className="bi bi-clock-history text-info me-1"></i>
                  <span>History</span>
                  {historyCount > 0 && (
                    <span className="badge bg-success rounded-pill ms-1" style={{ fontSize: '0.7rem' }}>
                      {historyCount}
                    </span>
                  )}
                </button>
              </li>

              {/* Profile */}
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link text-decoration-none border-0 px-2 px-xl-3 d-flex align-items-center gap-1 ${
                    currentTab === 'profile' ? 'active text-warning fw-bold' : 'text-light'
                  }`}
                  onClick={() => setCurrentTab('profile')}
                  id="nav-tab-profile"
                  title="User Profile and Account Details"
                >
                  <i className="bi bi-person-circle text-warning me-1"></i>
                  <span>Profile</span>
                  {currentUser && (
                    <span className="badge bg-secondary-subtle text-secondary ms-1 small" style={{ fontSize: '0.65rem' }}>
                      {currentUser.role === 'admin' ? 'Admin' : 'Reader'}
                    </span>
                  )}
                </button>
              </li>

              {/* Admin Panel */}
              {currentUser?.role === 'admin' && (
                <li className="nav-item">
                  <button
                    className={`nav-link btn btn-link text-decoration-none border-0 px-2 px-xl-3 d-flex align-items-center gap-1 ${
                      currentTab === 'admin' ? 'active text-warning fw-bold' : 'text-warning'
                    }`}
                    onClick={() => setCurrentTab('admin')}
                    id="nav-tab-admin"
                  >
                    <i className="bi bi-shield-lock-fill text-danger me-1"></i> Admin Panel
                  </button>
                </li>
              )}
            </ul>

            {/* Right Action Icons & Auth */}
            <div className="d-flex align-items-center flex-wrap gap-2">
              {/* Shopping Cart Button with Badge */}
              <button
                type="button"
                className={`btn position-relative d-flex align-items-center gap-1 px-3 ${
                  currentTab === 'cart' ? 'btn-warning text-dark fw-bold' : 'btn-outline-light'
                }`}
                onClick={() => setCurrentTab('cart')}
                id="btn-nav-cart"
              >
                <i className="bi bi-bag"></i>
                <span>Cart</span>
                <span
                  className="badge bg-warning text-dark rounded-pill ms-1"
                  id="cart-badge-count"
                  style={{ fontSize: '0.75rem' }}
                >
                  {cartCount}
                </span>
              </button>

              {/* User Session Dropdown or Sign In */}
              {currentUser ? (
                <div className="dropdown">
                  <button
                    className="btn btn-dark border-secondary dropdown-toggle d-flex align-items-center gap-2 text-white"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    id="dropdown-user-menu"
                  >
                    <div
                      className="rounded-circle bg-warning text-dark fw-bold d-inline-flex align-items-center justify-content-center"
                      style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                    >
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="small fw-semibold">{currentUser.name}</span>
                    {currentUser.role === 'admin' && (
                      <span className="badge bg-danger text-uppercase" style={{ fontSize: '0.65rem' }}>
                        Admin
                      </span>
                    )}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow">
                    <li className="dropdown-header small text-muted">
                      Signed in as <strong>{currentUser.email}</strong>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => setCurrentTab('profile')}
                        id="dropdown-btn-profile"
                      >
                        <i className="bi bi-person-badge text-primary"></i> My Profile
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => setCurrentTab('library')}
                        id="dropdown-btn-library"
                      >
                        <i className="bi bi-heart-fill text-danger"></i> Favorites &amp; List
                      </button>
                    </li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => setCurrentTab('history')}
                        id="dropdown-btn-history"
                      >
                        <i className="bi bi-clock-history text-success"></i> History (Reading &amp; Orders)
                      </button>
                    </li>
                    {currentUser.role === 'admin' && (
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2 text-warning bg-dark"
                          onClick={() => setCurrentTab('admin')}
                          id="dropdown-btn-admin"
                        >
                          <i className="bi bi-shield-lock-fill text-danger"></i> Admin Dashboard
                        </button>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item d-flex align-items-center gap-2 text-danger"
                        onClick={onLogout}
                        id="btn-logout"
                      >
                        <i className="bi bi-box-arrow-right"></i> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm px-3 ${
                      currentTab === 'register' ? 'btn-outline-warning text-warning fw-bold' : 'btn-outline-light'
                    }`}
                    onClick={() => onOpenAuth('login')}
                    id="btn-login-modal"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm px-3 ${
                      currentTab === 'register' ? 'btn-warning text-dark fw-bold' : 'btn-primary'
                    }`}
                    onClick={() => onOpenAuth('register')}
                    id="btn-register-modal"
                  >
                    <i className="bi bi-person-plus-fill me-1"></i> Create Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Quick Navigator Strip (Dedicated Navigator Buttons Bar) */}
      <div
        className="bg-body-tertiary border-bottom py-1 px-2 px-md-3 shadow-2xs"
        id="quick-navigator-bar"
        style={{ fontSize: '0.85rem' }}
      >
        <div className="container d-flex align-items-center justify-content-between flex-wrap gap-2">
          {/* Navigator Label */}
          <div className="d-none d-md-flex align-items-center text-muted fw-semibold gap-1">
            <i className="bi bi-compass text-primary"></i>
            <span>Quick Navigator:</span>
          </div>

          {/* Direct Navigator Buttons */}
          <div className="d-flex align-items-center flex-wrap gap-1 flex-grow-1 justify-content-center justify-content-md-end">
            {!currentUser && (
              <button
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1 ${
                  currentTab === 'register' ? 'btn-warning text-dark fw-bold' : 'btn-outline-warning text-dark'
                }`}
                onClick={() => onOpenAuth('register')}
                id="quick-nav-register"
                title="Create Account or Sign In"
              >
                <i className="bi bi-person-plus-fill text-warning"></i>
                <span>Register / Sign In</span>
              </button>
            )}

            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1 ${
                currentTab === 'home' ? 'btn-dark fw-bold' : 'btn-outline-secondary border-0 bg-transparent text-dark'
              }`}
              onClick={() => setCurrentTab('home')}
              id="quick-nav-home"
              title="Navigate to Home Page"
            >
              <i className="bi bi-house-door-fill text-primary"></i>
              <span>Home Page</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1 ${
                currentTab === 'profile' ? 'btn-dark fw-bold' : 'btn-outline-secondary border-0 bg-transparent text-dark'
              }`}
              onClick={() => setCurrentTab('profile')}
              id="quick-nav-profile"
              title="Navigate to User Profile"
            >
              <i className="bi bi-person-fill text-warning"></i>
              <span>Profile</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1 ${
                currentTab === 'history' || currentTab === 'orders' ? 'btn-dark fw-bold' : 'btn-outline-secondary border-0 bg-transparent text-dark'
              }`}
              onClick={() => setCurrentTab('history')}
              id="quick-nav-history"
              title="Navigate to Reading and Order History"
            >
              <i className="bi bi-clock-history text-success"></i>
              <span>History</span>
              {historyCount > 0 && (
                <span className="badge bg-success rounded-pill" style={{ fontSize: '0.65rem' }}>
                  {historyCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1 ${
                currentTab === 'library' ? 'btn-dark fw-bold' : 'btn-outline-secondary border-0 bg-transparent text-dark'
              }`}
              onClick={() => setCurrentTab('library')}
              id="quick-nav-favorites-list"
              title="Navigate to Favorites and Read Later Shelf"
            >
              <i className="bi bi-heart-fill text-danger"></i>
              <span>Favorites/List</span>
              {libraryCount > 0 && (
                <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.65rem' }}>
                  {libraryCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1 ${
                currentTab === 'books' ? 'btn-dark fw-bold' : 'btn-outline-secondary border-0 bg-transparent text-dark'
              }`}
              onClick={() => setCurrentTab('books')}
              id="quick-nav-catalog"
              title="Browse Books Catalog"
            >
              <i className="bi bi-collection text-secondary"></i>
              <span>Catalog</span>
            </button>

            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1 rounded-pill px-3 py-1 ${
                currentTab === 'cart' ? 'btn-dark fw-bold' : 'btn-outline-secondary border-0 bg-transparent text-dark'
              }`}
              onClick={() => setCurrentTab('cart')}
              id="quick-nav-cart"
              title="View Shopping Cart"
            >
              <i className="bi bi-bag-fill text-primary"></i>
              <span>Cart ({cartCount})</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
