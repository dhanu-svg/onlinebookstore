import React, { useState, useRef, useEffect } from 'react';
import { User, Book } from '../types';

interface RegisterViewProps {
  users: User[];
  pendingBook?: Book | null;
  onRegister: (name: string, email: string, role: 'user' | 'admin', password?: string) => User;
  onLogin: (user: User) => void;
  onGuestExplore: () => void;
  initialMode?: 'register' | 'login';
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  users,
  pendingBook,
  onRegister,
  onLogin,
  onGuestExplore,
  initialMode = 'register'
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>(initialMode);
  
  // Registration Form State
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Verification Step State
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<string[]>([]);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown for resend verification code
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Focus first OTP input when entering verification step
  useEffect(() => {
    if (isVerifying && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }
  }, [isVerifying]);

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-secondary' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 33, label: 'Fair', color: 'bg-danger' };
    if (score <= 3) return { score: 66, label: 'Good', color: 'bg-warning' };
    return { score: 100, label: 'Strong', color: 'bg-success' };
  };

  // Generate a random 6-digit verification code
  const createNewVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setResendCooldown(30);
    return code;
  };

  // Handle Registration Form Submission
  const handleProceedToVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    const trimmedName = userName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // 1. User Name Validation
    if (!trimmedName) {
      errors.push('User name is required.');
    } else if (trimmedName.length < 2) {
      errors.push('User name must be at least 2 characters long.');
    }

    // 2. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.push('Email address is required.');
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.push('Please enter a valid email address (e.g. name@example.com).');
    } else if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      errors.push('An account with this email address already exists. Please sign in instead.');
    }

    // 3. Password Validation
    if (!password) {
      errors.push('Password is required.');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }

    // 4. Confirm Password Match
    if (password !== confirmPassword) {
      errors.push('Passwords do not match. Please verify your password entry.');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    createNewVerificationCode();
    setIsVerifying(true);
    setOtpDigits(['', '', '', '', '', '']);
    setVerificationError(null);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric input
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue.slice(-1);
    setOtpDigits(newDigits);
    setVerificationError(null);

    // Auto-advance to next input
    if (cleanValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP Keydown for backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);
    setVerificationError(null);

    const nextIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // Auto-fill generated code convenience helper
  const handleAutoFillCode = () => {
    if (!generatedCode) return;
    setOtpDigits(generatedCode.split(''));
    setVerificationError(null);
  };

  // Resend code handler
  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    const newCode = createNewVerificationCode();
    setOtpDigits(['', '', '', '', '', '']);
    setVerificationError(null);
    if (otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  };

  // Verify Code and finalize registration
  const handleVerifyCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredCode = otpDigits.join('');

    if (enteredCode.length !== 6) {
      setVerificationError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (enteredCode !== generatedCode) {
      setVerificationError('Incorrect verification code. Please check the code and try again.');
      return;
    }

    // Success!
    setVerificationError(null);
    setIsVerifiedSuccess(true);

    setTimeout(() => {
      const newUser = onRegister(userName.trim(), email.trim(), role, password);
      onLogin(newUser);
    }, 1000);
  };

  // Handle Login Form Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    const trimmedEmail = loginEmail.trim().toLowerCase();

    if (!trimmedEmail) errors.push('Email is required.');
    if (!loginPassword) errors.push('Password is required.');

    if (errors.length > 0) {
      setLoginErrors(errors);
      return;
    }

    // Match against registered users or known credentials
    const foundUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (foundUser) {
      // Check password if stored, or allow test accounts
      if (foundUser.password && foundUser.password !== loginPassword) {
        setLoginErrors(['Incorrect password. Please try again.']);
        return;
      }
      setLoginErrors([]);
      onLogin(foundUser);
    } else if (trimmedEmail === 'admin@bookstore.com' && loginPassword === 'admin123') {
      const adminUser: User = {
        id: 1,
        name: 'Admin Librarian',
        email: 'admin@bookstore.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        is_verified: true
      };
      onLogin(adminUser);
    } else if (trimmedEmail === 'reader@bookstore.com' && loginPassword === 'reader123') {
      const readerUser: User = {
        id: 2,
        name: 'Eleanor Dashwood',
        email: 'reader@bookstore.com',
        role: 'user',
        created_at: new Date().toISOString(),
        is_verified: true
      };
      onLogin(readerUser);
    } else {
      setLoginErrors(['No account found with this email address. Please create an account to get started.']);
    }
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="py-5" id="registration-onboarding-view">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-7 col-xl-6">
          {/* Header Brand */}
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-dark text-warning p-3 rounded-circle shadow-sm mb-3">
              <i className="bi bi-book-half fs-1"></i>
            </div>
            <h1 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              Shelf Space
            </h1>
            <p className="text-muted small">
              Timeless Literature &middot; In-Browser Reader &middot; Personal Reading Shelves
            </p>
          </div>

          {/* Main Card */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            {/* Pending Book Banner */}
            {pendingBook && (
              <div className="alert alert-warning border-0 rounded-0 mb-0 py-3 px-4 d-flex align-items-center gap-3">
                <i className="bi bi-journal-bookmark-fill fs-3 text-dark"></i>
                <div>
                  <strong className="d-block text-dark">Ready to read &ldquo;{pendingBook.title}&rdquo;?</strong>
                  <span className="small text-secondary">
                    Create an account or sign in below. Once registered, you won&rsquo;t be prompted again when reading any book!
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Tabs between Register & Sign In */}
            {!isVerifying && (
              <div className="card-header bg-white border-bottom p-0">
                <div className="row g-0 text-center">
                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn w-100 py-3 fw-bold rounded-0 border-0 ${
                        activeTab === 'register'
                          ? 'bg-warning text-dark border-bottom border-warning border-3'
                          : 'text-muted bg-light'
                      }`}
                      onClick={() => {
                        setActiveTab('register');
                        setFormErrors([]);
                      }}
                      id="tab-btn-create-account"
                    >
                      <i className="bi bi-person-plus me-1"></i> Create an Account
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      type="button"
                      className={`btn w-100 py-3 fw-bold rounded-0 border-0 ${
                        activeTab === 'login'
                          ? 'bg-warning text-dark border-bottom border-warning border-3'
                          : 'text-muted bg-light'
                      }`}
                      onClick={() => {
                        setActiveTab('login');
                        setLoginErrors([]);
                      }}
                      id="tab-btn-sign-in"
                    >
                      <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="card-body p-4 p-md-5">
              {/* VIEW 1: REGISTRATION FORM */}
              {activeTab === 'register' && !isVerifying && (
                <div>
                  <div className="mb-4 text-center">
                    <h4 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Create Your Account
                    </h4>
                    <p className="text-muted small mb-0">
                      Sign up to access full classics, track reading progress, and save your personal shelf.
                    </p>
                  </div>

                  {formErrors.length > 0 && (
                    <div className="alert alert-danger py-2 small mb-4" role="alert">
                      <div className="fw-bold mb-1">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i> Please fix the following:
                      </div>
                      <ul className="mb-0 ps-3">
                        {formErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <form onSubmit={handleProceedToVerification} noValidate>
                    {/* User Name Input */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark">
                        User Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary">
                          <i className="bi bi-person"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="e.g. Jane Bennet"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          id="register-input-username"
                          autoComplete="name"
                          required
                        />
                      </div>
                      <div className="form-text small text-muted">
                        This name will appear on your reading shelf and account profile.
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control border-start-0 ps-0"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          id="register-input-email"
                          autoComplete="email"
                          required
                        />
                      </div>
                      <div className="form-text small text-muted">
                        We will send a 6-digit verification code to verify this address.
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark">
                        Password <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control border-start-0 border-end-0 ps-0"
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          id="register-input-password"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-light border border-start-0 text-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="mt-2">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                              Password Strength: <strong>{passwordStrength.label}</strong>
                            </span>
                            <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                              {password.length}/6+ chars
                            </span>
                          </div>
                          <div className="progress" style={{ height: '5px' }}>
                            <div
                              className={`progress-bar ${passwordStrength.color}`}
                              role="progressbar"
                              style={{ width: `${passwordStrength.score}%` }}
                              aria-valuenow={passwordStrength.score}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary">
                          <i className="bi bi-shield-lock"></i>
                        </span>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="form-control border-start-0 border-end-0 ps-0"
                          placeholder="Re-enter password to verify"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          id="register-input-confirm-password"
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-light border border-start-0 text-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                      {confirmPassword && (
                        <div className="small mt-1">
                          {password === confirmPassword ? (
                            <span className="text-success">
                              <i className="bi bi-check-circle-fill me-1"></i> Passwords match
                            </span>
                          ) : (
                            <span className="text-danger">
                              <i className="bi bi-x-circle-fill me-1"></i> Passwords do not match
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Account Type / Role */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold small text-dark">Account Type</label>
                      <select
                        className="form-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                        id="register-select-role"
                      >
                        <option value="user">Reader Account (Reading, Shelf &amp; Library)</option>
                        <option value="admin">Administrator (Catalog Management &amp; Orders)</option>
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-warning w-100 py-2 fw-bold text-dark shadow-sm mb-3"
                      id="btn-register-submit"
                    >
                      <i className="bi bi-shield-check me-2"></i> Verify Account &amp; Continue
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW 2: VERIFICATION CODE STEP */}
              {isVerifying && (
                <div>
                  {isVerifiedSuccess ? (
                    <div className="text-center py-4">
                      <div className="d-inline-flex align-items-center justify-content-center bg-success text-white p-3 rounded-circle mb-3">
                        <i className="bi bi-check-lg fs-1"></i>
                      </div>
                      <h4 className="fw-bold mb-2">Account Verified Successfully!</h4>
                      <p className="text-muted mb-4">
                        Welcome to <strong>Shelf Space</strong>, {userName}! Launching your reading library now...
                      </p>
                      <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Step Header */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <span className="badge bg-warning text-dark px-3 py-1 fw-bold">
                          Step 2 of 2: Security Verification
                        </span>
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-secondary text-decoration-none p-0"
                          onClick={() => setIsVerifying(false)}
                        >
                          <i className="bi bi-arrow-left me-1"></i> Edit Details
                        </button>
                      </div>

                      <div className="text-center mb-4">
                        <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary p-3 rounded-circle mb-3">
                          <i className="bi bi-envelope-check-fill fs-2"></i>
                        </div>
                        <h4 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Verify Your Email Address
                        </h4>
                        <p className="text-muted small mb-0">
                          We sent a 6-digit verification code to <br />
                          <strong className="text-dark">{email}</strong>
                        </p>
                      </div>

                      {/* Code Notice Banner & Quick Auto-Fill */}
                      <div className="p-3 bg-light rounded-3 border border-secondary-subtle mb-4">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <div>
                            <div className="small text-muted mb-1">
                              <i className="bi bi-shield-lock-fill text-warning me-1"></i>
                              Verification Code Sent:
                            </div>
                            <span className="fs-5 fw-bold font-monospace text-dark letter-spacing-2">
                              {generatedCode}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-dark fw-semibold"
                            onClick={handleAutoFillCode}
                            id="btn-auto-fill-otp"
                          >
                            <i className="bi bi-clipboard-check me-1 text-success"></i> Auto-Fill Code
                          </button>
                        </div>
                      </div>

                      {/* Error Alert */}
                      {verificationError && (
                        <div className="alert alert-danger py-2 small mb-3" role="alert">
                          <i className="bi bi-exclamation-circle-fill me-1"></i> {verificationError}
                        </div>
                      )}

                      {/* 6 Digit Inputs */}
                      <form onSubmit={handleVerifyCode}>
                        <div className="d-flex justify-content-between gap-2 mb-4">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                otpInputRefs.current[idx] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              className="form-control text-center fw-bold fs-4 border-2"
                              style={{ width: '48px', height: '56px', borderRadius: '8px' }}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              onPaste={idx === 0 ? handleOtpPaste : undefined}
                              id={`otp-digit-input-${idx}`}
                              autoComplete="one-time-code"
                            />
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <button
                          type="submit"
                          className="btn btn-warning w-100 py-2 fw-bold text-dark shadow-sm mb-3"
                          id="btn-confirm-verification"
                          disabled={otpDigits.join('').length !== 6}
                        >
                          <i className="bi bi-check-circle-fill me-1"></i> Verify &amp; Launch Shelf Space
                        </button>

                        <div className="d-flex justify-content-between align-items-center small text-muted">
                          <span>Didn't receive the code?</span>
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-decoration-none p-0 text-primary fw-semibold"
                            onClick={handleResendCode}
                            disabled={resendCooldown > 0}
                            id="btn-resend-verification-code"
                          >
                            {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 3: SIGN IN FORM */}
              {activeTab === 'login' && !isVerifying && (
                <div>
                  <div className="mb-4 text-center">
                    <h4 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Welcome Back
                    </h4>
                    <p className="text-muted small mb-0">
                      Sign in to your registered account to access your shelves and history.
                    </p>
                  </div>

                  {loginErrors.length > 0 && (
                    <div className="alert alert-danger py-2 small mb-4" role="alert">
                      <ul className="mb-0 ps-3">
                        {loginErrors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} noValidate>
                    {/* Email Input */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-dark">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary">
                          <i className="bi bi-envelope"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control border-start-0 ps-0"
                          placeholder="name@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          id="login-input-email"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="mb-4">
                      <label className="form-label fw-semibold small text-dark">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          className="form-control border-start-0 border-end-0 ps-0"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          id="login-input-password"
                          autoComplete="current-password"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-light border border-start-0 text-secondary"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          tabIndex={-1}
                          aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                        >
                          <i className={`bi ${showLoginPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-warning w-100 py-2 fw-bold text-dark shadow-sm mb-3"
                      id="btn-login-submit"
                    >
                      <i className="bi bi-box-arrow-in-right me-1"></i> Sign In to Shelf Space
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Footer option: Continue as Guest */}
            <div className="card-footer bg-light border-top text-center py-3">
              <span className="small text-muted me-2">Just browsing?</span>
              <button
                type="button"
                className="btn btn-link btn-sm text-dark fw-bold text-decoration-none p-0"
                onClick={onGuestExplore}
                id="btn-explore-as-guest"
              >
                Explore Books as Guest <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
