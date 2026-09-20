import React, { useState } from 'react';
import { Book } from '../types';

interface ReaderModalProps {
  book: Book | null;
  onClose: () => void;
  onLogReading?: (book: Book, progress: number, notes?: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (book: Book) => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  book,
  onClose,
  onLogReading,
  isFavorite,
  onToggleFavorite
}) => {
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [progress, setProgress] = useState<number>(100);
  const [markedFinished, setMarkedFinished] = useState<boolean>(false);

  React.useEffect(() => {
    if (book && onLogReading) {
      onLogReading(book, 25, 'Opened and reading in Project Gutenberg viewer.');
    }
  }, [book]);

  if (!book) return null;

  const handleMarkFinished = () => {
    if (onLogReading) {
      onLogReading(book, 100, 'Marked 100% completed in reader.');
    }
    setProgress(100);
    setMarkedFinished(true);
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1060 }}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-fullscreen" role="document">
        <div className={`modal-content border-0 ${theme === 'dark' ? 'bg-dark text-white' : theme === 'sepia' ? 'bg-amber-50 text-dark' : 'bg-white text-dark'}`}>
          {/* Reader Top Bar */}
          <div className="modal-header py-2 px-3 bg-dark text-white border-bottom border-secondary d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
                onClick={onClose}
                id="btn-close-reader"
              >
                <i className="bi bi-arrow-left"></i> Exit Reader
              </button>
              <div className="text-truncate" style={{ maxWidth: '400px' }}>
                <strong className="text-white">{book.title}</strong>
                <span className="text-white-50 ms-2 small">by {book.author}</span>
              </div>
            </div>

            {/* Middle Reader Badges & Reading History Status */}
            <div className="d-none d-md-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark">
                <i className="bi bi-patch-check-fill me-1"></i>
                Project Gutenberg Legal Free Text
              </span>

              {onLogReading && (
                <button
                  type="button"
                  className={`btn btn-xs rounded-pill px-3 ${markedFinished ? 'btn-success' : 'btn-outline-success text-white'}`}
                  onClick={handleMarkFinished}
                >
                  <i className="bi bi-check2-circle me-1"></i>
                  {markedFinished ? 'Marked 100% Read ✓' : 'Mark as Finished'}
                </button>
              )}

              {onToggleFavorite && (
                <button
                  type="button"
                  className={`btn btn-xs rounded-pill px-2 ${isFavorite ? 'btn-danger' : 'btn-outline-light'}`}
                  onClick={() => onToggleFavorite(book)}
                >
                  <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </button>
              )}
            </div>

            {/* Controls */}
            <div className="d-flex align-items-center gap-2">
              {/* Theme selector */}
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn ${theme === 'light' ? 'btn-light text-dark fw-bold' : 'btn-outline-secondary text-white'}`}
                  onClick={() => setTheme('light')}
                  title="Day Mode"
                >
                  Light
                </button>
                <button
                  type="button"
                  className={`btn ${theme === 'sepia' ? 'btn-warning text-dark fw-bold' : 'btn-outline-secondary text-white'}`}
                  onClick={() => setTheme('sepia')}
                  title="Sepia Mode"
                >
                  Sepia
                </button>
                <button
                  type="button"
                  className={`btn ${theme === 'dark' ? 'btn-secondary text-white fw-bold' : 'btn-outline-secondary text-white'}`}
                  onClick={() => setTheme('dark')}
                  title="Dark Mode"
                >
                  Dark
                </button>
              </div>

              {/* Direct Project Gutenberg Link */}
              <a
                href={book.gutenberg_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-info btn-sm"
                title="Open directly in Project Gutenberg"
              >
                <i className="bi bi-box-arrow-up-right me-1"></i> Original Source
              </a>

              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
          </div>

          {/* Reader Body with Live Gutenberg Iframe */}
          <div className="modal-body p-0 position-relative" style={{ height: 'calc(100vh - 58px)' }}>
            <iframe
              src={book.gutenberg_url}
              title={`Read ${book.title} online`}
              className="w-100 h-100 border-0"
              sandbox="allow-same-origin allow-scripts"
              style={{
                filter: theme === 'dark' ? 'invert(0.9) hue-rotate(180deg)' : theme === 'sepia' ? 'sepia(0.35) contrast(0.95)' : 'none',
                backgroundColor: theme === 'dark' ? '#121212' : theme === 'sepia' ? '#fdf6e2' : '#ffffff'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
