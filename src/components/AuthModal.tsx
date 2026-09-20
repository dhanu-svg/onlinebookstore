import React, { useState } from 'react';
import { User, Book } from '../types';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  pendingBook?: Book | null;
  onClose: () => void;
  onLogin: (user: User) => void;
  onRegister: (name: string, email: string, role: 'user' | 'admin', password?: string) => User;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode,
  pendingBook,
  onClose,
  onLogin,
  onRegister
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Verification state for registration
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [tempUserData, setTempUserData] = useState<{
    name: string;
    email: string;
    role: 'user' | 'admin';
    password?: string;
  } | null>(null);

  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];

    if (!name.trim()) errs.push('Full name is required (at least 2 characters).');
    if (!email.trim() || !email.includes('@')) errs.push('Valid email address is required.');
    if (password.length < 6) errs.push('Password must be at least 6 characters long.');
    if (password !== confirmPassword) errs.push('Passwords do not match.');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setErrors([]);
    // Generate a 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setTempUserData({
      name: name.trim(),
      email: email.trim(),
      role,
      password
    });
    setIsVerifying(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedCode) {
      setOtpError('Invalid verification code. Please check or click "Auto-Fill Code".');
      return;
    }

    if (!tempUserData) return;

    // Code verified! Complete registration
    const newUser = onRegister(
      tempUserData.name,
      tempUserData.email,
      tempUserData.role,
      tempUserData.password
    );
    onLogin(newUser);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];

    if (!email.trim()) errs.push('Email is required.');
    if (!password) errs.push('Password is required.');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    // Check predefined or test accounts
    if (email === 'admin@bookstore.com') {
      onLogin({
        id: 1,
        name: 'Admin Librarian',
        email: 'admin@bookstore.com',
        role: 'admin',
        created_at: '2026-09-01 10:00:00',
        is_verified: true
      });
      onClose();
    } else if (email === 'reader@bookstore.com') {
      onLogin({
        id: 2,
        name: 'Eleanor Dashwood',
        email: 'reader@bookstore.com',
        role: 'user',
        created_at: '2026-09-02 14:30:00',
        is_verified: true
      });
      onClose();
    } else {
      // Authenticate typed user
      onLogin({
        id: Date.now(),
        name: email.split('@')[0],
        email: email.trim(),
        role: 'user',
        created_at: new Date().toISOString(),
        is_verified: true
      });
      onClose();
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1070 }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white border-0 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2 mb-0" style={{ fontFamily: "'Playfair Display', serif" }}>
              <i className="bi bi-book-half text-warning"></i>
              {isVerifying
                ? 'Verify Email Address'
                : mode === 'register'
                ? 'Create Reader Account'
                : 'Sign In to Shelf Space'}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            {/* Banner when visitor clicked to read a book */}
            {pendingBook && (
              <div className="alert alert-warning border-0 shadow-xs mb-3 d-flex align-items-start gap-3 py-2 px-3">
                <i className="bi bi-journal-bookmark-fill text-dark fs-4 mt-1"></i>
                <div className="small">
                  <div className="fw-bold text-dark">
                    Ready to read &ldquo;{pendingBook.title}&rdquo;?
                  </div>
                  <div className="text-secondary">
                    Please create an account or sign in to open the free Gutenberg reader. Once registered, you won&rsquo;t be asked again!
                  </div>
                </div>
              </div>
            )}

            {/* If in OTP verification step */}
            {isVerifying ? (
              <div>
                <div className="text-center mb-3">
                  <div className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-6 mb-2">
                    <i className="bi bi-envelope-check me-1"></i> Verification Code Sent
                  </div>
                  <p className="text-muted small mb-1">
                    We sent a 6-digit code to <strong>{tempUserData?.email}</strong>.
                  </p>
                  <div className="bg-light p-2 rounded border small text-dark d-inline-block">
                    Demo Code: <strong className="font-monospace text-primary fs-6">{generatedCode}</strong>
                  </div>
                </div>

                {otpError && (
                  <div className="alert alert-danger py-2 small mb-3">
                    {otpError}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-3 text-center">
                    <label className="form-label fw-semibold small text-muted">Enter 6-Digit Code</label>
                    <input
                      type="text"
                      className="form-control text-center fs-4 fw-bold font-monospace letter-spacing-2"
                      placeholder="••••••"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => {
                        setEnteredOtp(e.target.value.replace(/\D/g, ''));
                        setOtpError('');
                      }}
                      autoFocus
                      required
                    />
                  </div>

                  <div className="d-flex gap-2 mb-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm flex-fill"
                      onClick={() => setEnteredOtp(generatedCode)}
                    >
                      <i className="bi bi-magic me-1"></i> Auto-Fill Code
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm flex-fill"
                      onClick={() => setIsVerifying(false)}
                    >
                      <i className="bi bi-arrow-left me-1"></i> Back to Form
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-warning w-100 fw-bold py-2 shadow-sm text-dark"
                  >
                    <i className="bi bi-check2-circle me-1"></i> Verify &amp; Start Reading
                  </button>
                </form>
              </div>
            ) : (
              <>
                {/* Tabs between Sign In and Create Account */}
                <ul className="nav nav-pills nav-fill mb-3 bg-light p-1 rounded">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link fw-semibold py-2 ${mode === 'register' ? 'active bg-warning text-dark shadow-xs' : 'text-muted'}`}
                      onClick={() => {
                        setMode('register');
                        setErrors([]);
                      }}
                    >
                      <i className="bi bi-person-plus me-1"></i> Create Account
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link fw-semibold py-2 ${mode === 'login' ? 'active bg-warning text-dark shadow-xs' : 'text-muted'}`}
                      onClick={() => {
                        setMode('login');
                        setErrors([]);
                      }}
                    >
                      <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                    </button>
                  </li>
                </ul>

                {errors.length > 0 && (
                  <div className="alert alert-danger py-2 small mb-3">
                    <ul className="mb-0 ps-3">
                      {errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {mode === 'register' ? (
                  /* REGISTRATION FORM */
                  <form onSubmit={handleStartRegistration} noValidate>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark mb-1">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Jane Bennet"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark mb-1">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark mb-1">
                        Password <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark mb-1">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark mb-1">Account Role</label>
                      <select
                        className="form-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                      >
                        <option value="user">Reader / Member</option>
                        <option value="admin">Bookstore Administrator</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-warning w-100 py-2 fw-bold text-dark shadow-sm mt-2"
                      id="btn-modal-register-next"
                    >
                      <i className="bi bi-shield-check me-1"></i> Continue to Verification
                    </button>
                  </form>
                ) : (
                  /* SIGN IN FORM */
                  <form onSubmit={handleLoginSubmit} noValidate>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark mb-1">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold small text-dark mb-1">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-warning w-100 py-2 fw-bold text-dark shadow-sm"
                      id="btn-modal-login-submit"
                    >
                      <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
