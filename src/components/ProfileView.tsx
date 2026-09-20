import React, { useState } from 'react';
import { User, Order, FavoriteItem, ReadLaterItem, ReadingHistoryItem } from '../types';

interface ProfileViewProps {
  currentUser: User | null;
  orders: Order[];
  favorites: FavoriteItem[];
  readLater: ReadLaterItem[];
  readingHistory: ReadingHistoryItem[];
  onUpdateProfile: (name: string, email: string) => void;
  onNavigate: (tab: 'home' | 'books' | 'cart' | 'library' | 'history' | 'profile' | 'admin') => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  orders,
  favorites,
  readLater,
  readingHistory,
  onUpdateProfile,
  onNavigate,
  onOpenAuth,
  onLogout
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change demo state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMessage, setPwdMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Keep fields synced if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container py-5" id="profile-guest-view">
        <div className="card border-0 shadow-sm mx-auto text-center p-5" style={{ maxWidth: '580px', borderRadius: '16px' }}>
          <div className="card-body">
            <div className="bg-warning-subtle text-warning d-inline-flex p-3 rounded-circle mb-3">
              <i className="bi bi-person-fill-lock fs-1 text-dark"></i>
            </div>
            <h2 className="fw-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              User Profile
            </h2>
            <p className="text-muted mb-4">
              Sign in to manage your account details, access your saved favorites, view reading logs, and track physical book orders.
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
              <button
                type="button"
                className="btn btn-primary px-4 py-2 fw-semibold"
                onClick={() => onOpenAuth('login')}
                id="btn-profile-signin"
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
              </button>
              <button
                type="button"
                className="btn btn-outline-dark px-4 py-2"
                onClick={() => onOpenAuth('register')}
                id="btn-profile-register"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userOrders = orders.filter((o) => o.user_id === currentUser.id);
  const userFavs = favorites.filter((f) => f.user_id === currentUser.id);
  const userReadLater = readLater.filter((rl) => rl.user_id === currentUser.id);
  const userHistory = readingHistory.filter((rh) => rh.user_id === currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onUpdateProfile(name.trim(), email.trim());
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPwdMessage({ text: 'Please enter your current password.', type: 'danger' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({ text: 'New password must be at least 6 characters.', type: 'danger' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: 'New passwords do not match.', type: 'danger' });
      return;
    }

    setPwdMessage({
      text: 'Password updated successfully! Your account credentials have been updated.',
      type: 'success'
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwdMessage(null), 5000);
  };

  return (
    <div className="container py-4" id="profile-container">
      {/* Profile Header Card */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div
          className="p-4 p-md-5 text-white position-relative"
          style={{
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #312e81 100%)'
          }}
        >
          <div className="d-flex flex-column flex-md-row align-items-center gap-4">
            {/* Avatar */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-warning text-dark fw-bold shadow"
              style={{ width: '90px', height: '90px', fontSize: '2.5rem', flexShrink: 0 }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>

            <div className="text-center text-md-start flex-grow-1">
              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
                <h2 className="fw-bold mb-0 text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {currentUser.name}
                </h2>
                <span className={`badge ${currentUser.role === 'admin' ? 'bg-danger' : 'bg-primary'} text-uppercase`}>
                  {currentUser.role === 'admin' ? 'Administrator' : 'Gutenberg Reader'}
                </span>
              </div>
              <p className="text-light opacity-75 mb-2">
                <i className="bi bi-envelope me-1"></i> {currentUser.email}
              </p>
              <div className="small text-white-50 d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-3">
                <span>
                  <i className="bi bi-calendar3 me-1"></i> Member since: {currentUser.created_at || 'Jan 2026'}
                </span>
                <span>
                  <i className="bi bi-shield-check text-success me-1"></i> Protected Account
                </span>
                <span>
                  <i className="bi bi-person-badge me-1"></i> User ID: #{currentUser.id}
                </span>
              </div>
            </div>

            {/* Quick Action Navigator buttons */}
            <div className="d-flex flex-row flex-md-column gap-2">
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <i className={`bi ${isEditing ? 'bi-x-lg' : 'bi-pencil'} me-1`}></i>
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm text-white"
                onClick={onLogout}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Account Activity Stats Bar with Quick Nav Links */}
        <div className="bg-light border-top px-3 py-3">
          <div className="row g-2 text-center">
            <div className="col-6 col-md-3">
              <button
                type="button"
                className="btn btn-white w-100 p-2 shadow-sm border text-start d-flex align-items-center gap-3 transition-all"
                onClick={() => onNavigate('library')}
                title="Go to Favorites & Lists"
              >
                <div className="bg-danger-subtle text-danger p-2 rounded-circle">
                  <i className="bi bi-heart-fill fs-5"></i>
                </div>
                <div>
                  <div className="fs-5 fw-bold text-dark">{userFavs.length}</div>
                  <div className="small text-muted">Favorites</div>
                </div>
              </button>
            </div>

            <div className="col-6 col-md-3">
              <button
                type="button"
                className="btn btn-white w-100 p-2 shadow-sm border text-start d-flex align-items-center gap-3 transition-all"
                onClick={() => onNavigate('library')}
                title="Go to Read Later Shelf"
              >
                <div className="bg-primary-subtle text-primary p-2 rounded-circle">
                  <i className="bi bi-bookmark-check-fill fs-5"></i>
                </div>
                <div>
                  <div className="fs-5 fw-bold text-dark">{userReadLater.length}</div>
                  <div className="small text-muted">Read Later</div>
                </div>
              </button>
            </div>

            <div className="col-6 col-md-3">
              <button
                type="button"
                className="btn btn-white w-100 p-2 shadow-sm border text-start d-flex align-items-center gap-3 transition-all"
                onClick={() => onNavigate('history')}
                title="Go to Reading History"
              >
                <div className="bg-success-subtle text-success p-2 rounded-circle">
                  <i className="bi bi-journal-text fs-5"></i>
                </div>
                <div>
                  <div className="fs-5 fw-bold text-dark">{userHistory.length}</div>
                  <div className="small text-muted">Reading Logs</div>
                </div>
              </button>
            </div>

            <div className="col-6 col-md-3">
              <button
                type="button"
                className="btn btn-white w-100 p-2 shadow-sm border text-start d-flex align-items-center gap-3 transition-all"
                onClick={() => onNavigate('history')}
                title="Go to Order History"
              >
                <div className="bg-warning-subtle text-warning p-2 rounded-circle">
                  <i className="bi bi-box-seam-fill fs-5 text-dark"></i>
                </div>
                <div>
                  <div className="fs-5 fw-bold text-dark">{userOrders.length}</div>
                  <div className="small text-muted">Orders Placed</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <span>Profile changes saved successfully!</span>
          <button type="button" className="btn-close" onClick={() => setSaveSuccess(false)}></button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Left Column: Profile Details & Password */}
        <div className="col-lg-7">
          {/* Edit Profile Card */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-person-lines-fill text-primary me-2"></i>Account Information
              </h5>
              {!isEditing && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="bi bi-pencil me-1"></i>Edit Details
                </button>
              )}
            </div>
            <div className="card-body p-4">
              {isEditing ? (
                <form onSubmit={handleSaveProfile}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <div className="form-text">Used for sign-in, order receipts, and notifications.</div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary px-4">
                      <i className="bi bi-save me-1"></i> Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setName(currentUser.name);
                        setEmail(currentUser.email);
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded border-start border-3 border-primary">
                      <div className="small text-muted">Display Name</div>
                      <div className="fw-bold fs-6 text-dark">{currentUser.name}</div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded border-start border-3 border-info">
                      <div className="small text-muted">Registered Email</div>
                      <div className="fw-bold fs-6 text-dark">{currentUser.email}</div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded border-start border-3 border-secondary">
                      <div className="small text-muted">Account Role</div>
                      <div className="fw-bold fs-6 text-dark text-capitalize">{currentUser.role}</div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded border-start border-3 border-success">
                      <div className="small text-muted">Account Security</div>
                      <div className="fw-bold fs-6 text-success">
                        <i className="bi bi-shield-check me-1"></i> Active &amp; Protected
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security & Password */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-key-fill text-warning me-2"></i>Security &amp; Password
              </h5>
            </div>
            <div className="card-body p-4">
              {pwdMessage && (
                <div className={`alert alert-${pwdMessage.type} small py-2 mb-3`} role="alert">
                  {pwdMessage.text}
                </div>
              )}
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Current Password</label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-muted">New Password</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="col-sm-6">
                    <label className="form-label small fw-semibold text-muted">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-outline-dark btn-sm">
                  <i className="bi bi-shield-lock me-1"></i> Update Password
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Navigator Buttons & Shortcuts */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-compass-fill text-danger me-2"></i>Quick Navigator Buttons
              </h5>
            </div>
            <div className="card-body p-3">
              <p className="small text-muted mb-3">
                Quick 1-click navigation to your library, order records, and the book catalog:
              </p>

              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center justify-content-between p-3 text-start rounded-3"
                  onClick={() => onNavigate('home')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-house-door-fill fs-4 text-primary"></i>
                    <div>
                      <div className="fw-bold">Home Page</div>
                      <div className="small text-muted">Featured classics &amp; bookstore showcase</div>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger d-flex align-items-center justify-content-between p-3 text-start rounded-3"
                  onClick={() => onNavigate('library')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-heart-fill fs-4 text-danger"></i>
                    <div>
                      <div className="fw-bold">Favorites &amp; Lists</div>
                      <div className="small text-muted">{userFavs.length} favorites &middot; {userReadLater.length} on read-later shelf</div>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-success d-flex align-items-center justify-content-between p-3 text-start rounded-3"
                  onClick={() => onNavigate('history')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-clock-history fs-4 text-success"></i>
                    <div>
                      <div className="fw-bold">History (Reading &amp; Orders)</div>
                      <div className="small text-muted">{userHistory.length} reading logs &middot; {userOrders.length} orders</div>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary d-flex align-items-center justify-content-between p-3 text-start rounded-3"
                  onClick={() => onNavigate('books')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-collection-fill fs-4 text-secondary"></i>
                    <div>
                      <div className="fw-bold">Browse Catalog</div>
                      <div className="small text-muted">Explore public-domain classics</div>
                    </div>
                  </div>
                  <i className="bi bi-chevron-right text-muted"></i>
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    className="btn btn-outline-warning text-dark d-flex align-items-center justify-content-between p-3 text-start rounded-3"
                    onClick={() => onNavigate('admin')}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <i className="bi bi-shield-lock-fill fs-4 text-danger"></i>
                      <div>
                        <div className="fw-bold">Admin Management</div>
                        <div className="small text-muted">Manage books inventory, users, and orders</div>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right text-muted"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
