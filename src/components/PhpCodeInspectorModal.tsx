import React, { useState } from 'react';
import { PHP_PROJECT_FILES, PhpFileItem } from '../data/phpCodeFiles';

interface PhpCodeInspectorModalProps {
  onClose: () => void;
}

export const PhpCodeInspectorModal: React.FC<PhpCodeInspectorModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<PhpFileItem>(PHP_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1080 }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-dark text-white py-3">
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-filetype-php text-warning fs-3"></i>
              <div>
                <h5 className="modal-title fw-bold mb-0">PHP &amp; MySQL Full-Stack Source Code</h5>
                <small className="text-muted">Generated files located in <code>/php_bookstore/</code></small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-0">
            <div className="row g-0">
              {/* File List Sidebar */}
              <div className="col-md-4 border-end bg-light p-3" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <h6 className="fw-bold text-uppercase small text-muted mb-3">Project Files</h6>
                <div className="list-group list-group-flush">
                  {PHP_PROJECT_FILES.map((f) => (
                    <button
                      key={f.filename}
                      type="button"
                      className={`list-group-item list-group-item-action py-2 px-3 rounded mb-1 text-start ${
                        selectedFile.filename === f.filename ? 'active fw-bold' : ''
                      }`}
                      onClick={() => setSelectedFile(f)}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="font-monospace small">{f.filename}</span>
                        <span
                          className={`badge ${
                            selectedFile.filename === f.filename ? 'bg-light text-dark' : 'bg-secondary'
                          }`}
                          style={{ fontSize: '0.65rem' }}
                        >
                          {f.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="alert alert-warning small mt-4 p-2">
                  <i className="bi bi-shield-check me-1"></i>
                  <strong>Security Best Practices:</strong>
                  <ul className="mb-0 ps-3 mt-1">
                    <li>PDO Prepared Statements (SQLi Prevention)</li>
                    <li>Bcrypt <code>password_hash</code></li>
                    <li>Session fixation prevention</li>
                    <li>CSRF verification token</li>
                    <li><code>htmlspecialchars</code> output sanitization</li>
                  </ul>
                </div>
              </div>

              {/* Code Viewer Panel */}
              <div className="col-md-8 p-3 bg-dark text-white d-flex flex-column" style={{ maxHeight: '600px' }}>
                <div className="d-flex justify-content-between align-items-center mb-2 border-bottom border-secondary pb-2">
                  <div>
                    <h6 className="mb-0 font-monospace text-warning">{selectedFile.filename}</h6>
                    <small className="text-muted">{selectedFile.description}</small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={handleCopy}
                  >
                    <i className={`bi ${copied ? 'bi-check-lg text-success' : 'bi-clipboard'} me-1`}></i>
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>

                <pre
                  className="flex-grow-1 p-3 bg-black rounded font-monospace small text-light mb-0"
                  style={{ overflowX: 'auto', overflowY: 'auto' }}
                >
                  <code>{selectedFile.code}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light py-2">
            <span className="small text-muted me-auto">
              Ready for Apache, XAMPP, LAMP, or PHP built-in web server.
            </span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
