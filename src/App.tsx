import React, { useState, useEffect, useMemo } from 'react';
import { Book, User, CartItem, Order, FavoriteItem, ReadLaterItem, ReadingHistoryItem } from './types';
import { INITIAL_BOOKS, INITIAL_USERS, INITIAL_ORDERS, INITIAL_FAVORITES, INITIAL_READ_LATER, INITIAL_READING_HISTORY } from './data/initialData';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { CatalogView } from './components/CatalogView';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { OrderHistoryView } from './components/OrderHistoryView';
import { MyLibraryView } from './components/MyLibraryView';
import { ProfileView } from './components/ProfileView';
import { HistoryView } from './components/HistoryView';
import { AdminPanel } from './components/AdminPanel';
import { RegisterView } from './components/RegisterView';
import { BookDetailModal } from './components/BookDetailModal';
import { ReaderModal } from './components/ReaderModal';
import { AuthModal } from './components/AuthModal';
import { DatabaseInspectorModal } from './components/DatabaseInspectorModal';
import { PhpCodeInspectorModal } from './components/PhpCodeInspectorModal';
import { Footer } from './components/Footer';

export default function App() {
  // Navigation State: Defaults to 'register' if user is not registered / logged in!
  const [currentTab, setCurrentTab] = useState<
    'home' | 'books' | 'cart' | 'checkout' | 'orders' | 'admin' | 'library' | 'history' | 'profile' | 'register'
  >(() => {
    try {
      const savedUser = localStorage.getItem('gutenberg_current_user');
      return savedUser ? 'home' : 'register';
    } catch {
      return 'register';
    }
  });

  const [registerInitialMode, setRegisterInitialMode] = useState<'register' | 'login'>('register');

  // Relational Database / Model State with LocalStorage Persistence
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('gutenberg_books');
      if (saved) {
        const parsed: Book[] = JSON.parse(saved);
        if (parsed.length > 0 && parsed.some((b) => b.price < 50)) {
          localStorage.setItem('gutenberg_books', JSON.stringify(INITIAL_BOOKS));
          return INITIAL_BOOKS;
        }
        return parsed;
      }
      return INITIAL_BOOKS;
    } catch {
      return INITIAL_BOOKS;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('gutenberg_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('gutenberg_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        if (parsed.length > 0 && parsed.some((o) => o.total_amount < 50)) {
          localStorage.setItem('gutenberg_orders', JSON.stringify(INITIAL_ORDERS));
          return INITIAL_ORDERS;
        }
        return parsed;
      }
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // User Library State (Favorites, Read Later, Reading History)
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    try {
      const saved = localStorage.getItem('gutenberg_favorites');
      return saved ? JSON.parse(saved) : INITIAL_FAVORITES;
    } catch {
      return INITIAL_FAVORITES;
    }
  });

  const [readLater, setReadLater] = useState<ReadLaterItem[]>(() => {
    try {
      const saved = localStorage.getItem('gutenberg_read_later');
      return saved ? JSON.parse(saved) : INITIAL_READ_LATER;
    } catch {
      return INITIAL_READ_LATER;
    }
  });

  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('gutenberg_reading_history');
      return saved ? JSON.parse(saved) : INITIAL_READING_HISTORY;
    } catch {
      return INITIAL_READING_HISTORY;
    }
  });

  // Current Logged In User State (null if user is not registered / logged in yet)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('gutenberg_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Shopping Cart State (Session / Client state)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gutenberg_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals State
  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);
  const [selectedBookForReader, setSelectedBookForReader] = useState<Book | null>(null);
  const [pendingBookToRead, setPendingBookToRead] = useState<Book | null>(null);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);
  const [showDatabaseInspector, setShowDatabaseInspector] = useState(false);
  const [showCodeInspector, setShowCodeInspector] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('gutenberg_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('gutenberg_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('gutenberg_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('gutenberg_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('gutenberg_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gutenberg_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('gutenberg_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('gutenberg_read_later', JSON.stringify(readLater));
  }, [readLater]);

  useEffect(() => {
    localStorage.setItem('gutenberg_reading_history', JSON.stringify(readingHistory));
  }, [readingHistory]);

  // Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Cart Handlers
  const handleAddToCart = (book: Book, quantity: number = 1) => {
    if (book.stock <= 0) {
      triggerToast(`Sorry, "${book.title}" is out of stock.`);
      return;
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.book.id === book.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(book.stock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        return [...prevCart, { book, quantity: Math.min(book.stock, quantity) }];
      }
    });

    triggerToast(`Added "${book.title}" to cart!`);
  };

  const handleUpdateCartQuantity = (bookId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(bookId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.book.id === bookId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (bookId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.book.id !== bookId));
    triggerToast('Item removed from cart.');
  };

  // Checkout Handler: creates order, creates order_items, deducts stock, clears cart
  const handleOrderPlaced = (newOrder: Order) => {
    // 1. Add order to orders list
    setOrders((prev) => [newOrder, ...prev]);

    // 2. Deduct book stocks in books state
    setBooks((prevBooks) => {
      const bookQuantities = new Map<number, number>();
      newOrder.items.forEach((it) => {
        bookQuantities.set(it.book_id, it.quantity);
      });

      return prevBooks.map((b) => {
        if (bookQuantities.has(b.id)) {
          const qty = bookQuantities.get(b.id) || 0;
          return { ...b, stock: Math.max(0, b.stock - qty) };
        }
        return b;
      });
    });

    // 3. Clear cart
    setCart([]);
    triggerToast(`Order #${newOrder.order_number} confirmed!`);
  };

  // Admin CRUD Handlers
  const handleAddBook = (newBookData: Omit<Book, 'id'>): Book => {
    const newId = books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;
    const newBook: Book = {
      ...newBookData,
      id: newId,
      created_at: new Date().toISOString()
    };
    setBooks((prev) => [newBook, ...prev]);
    triggerToast(`Book "${newBook.title}" added to catalog.`);
    return newBook;
  };

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );
    // If in cart, update cart item book info too
    setCart((prev) =>
      prev.map((it) => (it.book.id === updatedBook.id ? { ...it, book: updatedBook } : it))
    );
    triggerToast(`Book "${updatedBook.title}" updated successfully.`);
  };

  const handleDeleteBook = (bookId: number) => {
    const target = books.find((b) => b.id === bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setCart((prev) => prev.filter((it) => it.book.id !== bookId));
    triggerToast(`Book "${target?.title || bookId}" was deleted.`);
  };

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (pendingBookToRead) {
      const bookToOpen = pendingBookToRead;
      setPendingBookToRead(null);
      setAuthModalMode(null);
      setSelectedBookForReader(bookToOpen);
      triggerToast(`Welcome to Shelf Space, ${user.name}! Opening "${bookToOpen.title}".`);
    } else {
      if (currentTab === 'register') {
        setCurrentTab('home');
      }
      triggerToast(`Welcome to Shelf Space, ${user.name}!`);
    }
  };

  // Conditional Authentication for Reading:
  // If visitor is not registered, show registration form to create account or login.
  // If already registered, open the reader directly without asking again!
  const handleOpenReader = (book: Book) => {
    if (!currentUser) {
      setPendingBookToRead(book);
      setAuthModalMode('register');
      return;
    }
    setSelectedBookForReader(book);
  };

  const handleRegister = (name: string, email: string, role: 'user' | 'admin', password?: string): User => {
    const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser: User = {
      id: newId,
      name,
      email,
      role,
      password,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      is_verified: true
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRegisterInitialMode('register');
    setCurrentTab('register');
    triggerToast('You have been signed out.');
  };

  const handleOpenAuth = (mode?: 'login' | 'register') => {
    setRegisterInitialMode(mode || 'register');
    setCurrentTab('register');
  };

  const handleUpdateProfile = (name: string, email: string) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, name, email };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    triggerToast('Your profile details were successfully updated.');
  };

  // User Library Handlers (Favorites, Read Later, Reading History CRUD)
  const userFavorites = useMemo(() => {
    if (!currentUser) return [];
    return favorites.filter((f) => f.user_id === currentUser.id);
  }, [favorites, currentUser]);

  const userReadLater = useMemo(() => {
    if (!currentUser) return [];
    return readLater.filter((rl) => rl.user_id === currentUser.id);
  }, [readLater, currentUser]);

  const userReadingHistory = useMemo(() => {
    if (!currentUser) return [];
    return readingHistory.filter((rh) => rh.user_id === currentUser.id);
  }, [readingHistory, currentUser]);

  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter((o) => o.user_id === currentUser.id);
  }, [orders, currentUser]);

  const totalHistoryCount = userReadingHistory.length + userOrders.length;

  const favoriteBookIds = useMemo(() => {
    return new Set(userFavorites.map((f) => f.book_id));
  }, [userFavorites]);

  const readLaterBookIds = useMemo(() => {
    return new Set(userReadLater.map((rl) => rl.book_id));
  }, [userReadLater]);

  const handleToggleFavorite = (book: Book, note?: string) => {
    if (!currentUser) {
      setAuthModalMode('login');
      triggerToast('Please sign in to save books to your favorites.');
      return;
    }

    const existing = favorites.find((f) => f.user_id === currentUser.id && f.book_id === book.id);
    if (existing) {
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
      triggerToast(`Removed "${book.title}" from favorites.`);
    } else {
      const newFav: FavoriteItem = {
        id: favorites.length > 0 ? Math.max(...favorites.map((f) => f.id)) + 1 : 1,
        user_id: currentUser.id,
        book_id: book.id,
        book,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        note: note || undefined
      };
      setFavorites((prev) => [newFav, ...prev]);
      triggerToast(`Saved "${book.title}" to favorites! ❤️`);
    }
  };

  const handleRemoveFavorite = (bookId: number) => {
    if (!currentUser) return;
    setFavorites((prev) => prev.filter((f) => !(f.user_id === currentUser.id && f.book_id === bookId)));
    triggerToast('Removed from favorites.');
  };

  const handleUpdateFavoriteNote = (bookId: number, note: string) => {
    if (!currentUser) return;
    setFavorites((prev) =>
      prev.map((f) =>
        f.user_id === currentUser.id && f.book_id === bookId ? { ...f, note } : f
      )
    );
    triggerToast('Personal note updated.');
  };

  const handleToggleReadLater = (book: Book, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (!currentUser) {
      setAuthModalMode('login');
      triggerToast('Please sign in to add books to your Read Later list.');
      return;
    }

    const existing = readLater.find((rl) => rl.user_id === currentUser.id && rl.book_id === book.id);
    if (existing) {
      setReadLater((prev) => prev.filter((rl) => rl.id !== existing.id));
      triggerToast(`Removed "${book.title}" from Read Later.`);
    } else {
      const newReadLater: ReadLaterItem = {
        id: readLater.length > 0 ? Math.max(...readLater.map((rl) => rl.id)) + 1 : 1,
        user_id: currentUser.id,
        book_id: book.id,
        book,
        added_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        priority
      };
      setReadLater((prev) => [newReadLater, ...prev]);
      triggerToast(`Added "${book.title}" to Read Later list! 🔖`);
    }
  };

  const handleRemoveReadLater = (bookId: number) => {
    if (!currentUser) return;
    setReadLater((prev) => prev.filter((rl) => !(rl.user_id === currentUser.id && rl.book_id === bookId)));
    triggerToast('Removed from Read Later list.');
  };

  const handleUpdateReadLaterPriority = (bookId: number, priority: 'low' | 'medium' | 'high') => {
    if (!currentUser) return;
    setReadLater((prev) =>
      prev.map((rl) =>
        rl.user_id === currentUser.id && rl.book_id === bookId ? { ...rl, priority } : rl
      )
    );
    triggerToast(`Priority set to ${priority}.`);
  };

  const handleLogReading = (book: Book, progress: number, notes?: string) => {
    if (!currentUser) return;
    setReadingHistory((prev) => {
      const existing = prev.find((rh) => rh.user_id === currentUser.id && rh.book_id === book.id);
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      if (existing) {
        return prev.map((rh) =>
          rh.id === existing.id
            ? {
                ...rh,
                progress_percent: Math.max(rh.progress_percent, progress),
                notes: notes || rh.notes,
                read_at: timestamp
              }
            : rh
        );
      } else {
        const newHist: ReadingHistoryItem = {
          id: prev.length > 0 ? Math.max(...prev.map((h) => h.id)) + 1 : 1,
          user_id: currentUser.id,
          book_id: book.id,
          book,
          read_at: timestamp,
          progress_percent: progress,
          notes: notes || 'Started reading online'
        };
        return [newHist, ...prev];
      }
    });
  };

  const handleDeleteHistoryItem = (historyId: number) => {
    setReadingHistory((prev) => prev.filter((h) => h.id !== historyId));
    triggerToast('Reading history record deleted.');
  };

  const handleClearAllHistory = () => {
    if (!currentUser) return;
    setReadingHistory((prev) => prev.filter((h) => h.user_id !== currentUser.id));
    triggerToast('All reading history cleared.');
  };

  const handleUpdateHistoryProgress = (historyId: number, progress: number, notes?: string) => {
    setReadingHistory((prev) =>
      prev.map((h) =>
        h.id === historyId
          ? { ...h, progress_percent: progress, ...(notes !== undefined ? { notes } : {}) }
          : h
      )
    );
    triggerToast(`Progress updated to ${progress}%.`);
  };

  const totalLibraryCount = userFavorites.length + userReadLater.length;

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light" id="app-root-wrapper">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab as any}
        currentUser={currentUser}
        cartCount={totalCartCount}
        libraryCount={totalLibraryCount}
        historyCount={totalHistoryCount}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div
          className="position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1100 }}
        >
          <div className="toast show align-items-center text-white bg-dark border-0 shadow-lg" role="alert">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className="bi bi-info-circle-fill text-warning fs-5"></i>
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToastMessage(null)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Content */}
      <main className="container flex-grow-1">
        {currentTab === 'register' && (
          <RegisterView
            users={users}
            pendingBook={pendingBookToRead}
            onRegister={handleRegister}
            onLogin={handleLogin}
            onGuestExplore={() => setCurrentTab('books')}
            initialMode={registerInitialMode}
          />
        )}

        {currentTab === 'home' && (
          <HomeView
            books={books}
            favoriteBookIds={favoriteBookIds}
            readLaterBookIds={readLaterBookIds}
            onSelectBook={(book) => setSelectedBookForDetail(book)}
            onOpenReader={handleOpenReader}
            onAddToCart={(book) => handleAddToCart(book, 1)}
            onToggleFavorite={handleToggleFavorite}
            onToggleReadLater={(b) => handleToggleReadLater(b, 'medium')}
            onExploreCatalog={() => setCurrentTab('books')}
          />
        )}

        {currentTab === 'books' && (
          <CatalogView
            books={books}
            favoriteBookIds={favoriteBookIds}
            readLaterBookIds={readLaterBookIds}
            onSelectBook={(book) => setSelectedBookForDetail(book)}
            onOpenReader={handleOpenReader}
            onAddToCart={(book) => handleAddToCart(book, 1)}
            onToggleFavorite={handleToggleFavorite}
            onToggleReadLater={(b) => handleToggleReadLater(b, 'medium')}
          />
        )}

        {currentTab === 'library' && (
          <MyLibraryView
            currentUser={currentUser}
            favorites={userFavorites}
            readLater={userReadLater}
            readingHistory={userReadingHistory}
            onRemoveFavorite={handleRemoveFavorite}
            onUpdateFavoriteNote={handleUpdateFavoriteNote}
            onRemoveReadLater={handleRemoveReadLater}
            onUpdateReadLaterPriority={handleUpdateReadLaterPriority}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onClearAllHistory={handleClearAllHistory}
            onUpdateHistoryProgress={handleUpdateHistoryProgress}
            onOpenReader={handleOpenReader}
            onSelectBook={(book) => setSelectedBookForDetail(book)}
            onAddToCart={(book) => handleAddToCart(book, 1)}
            onExploreCatalog={() => setCurrentTab('books')}
            onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
          />
        )}

        {currentTab === 'cart' && (
          <CartView
            cart={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onProceedToCheckout={() => setCurrentTab('checkout')}
            onContinueShopping={() => setCurrentTab('books')}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutView
            cart={cart}
            currentUser={currentUser}
            onOrderPlaced={handleOrderPlaced}
            onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
            onCancel={() => setCurrentTab('books')}
            onViewOrderHistory={() => setCurrentTab('orders')}
          />
        )}

        {currentTab === 'orders' && (
          <OrderHistoryView
            orders={orders}
            currentUser={currentUser}
            onBrowseBooks={() => setCurrentTab('books')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            currentUser={currentUser}
            readingHistory={userReadingHistory}
            orders={orders}
            onOpenReader={handleOpenReader}
            onSelectBook={(book) => setSelectedBookForDetail(book)}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onClearAllHistory={handleClearAllHistory}
            onUpdateHistoryProgress={handleUpdateHistoryProgress}
            onBrowseBooks={() => setCurrentTab('books')}
            onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            orders={orders}
            favorites={favorites}
            readLater={readLater}
            readingHistory={readingHistory}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={(tab) => setCurrentTab(tab as any)}
            onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            books={books}
            orders={orders}
            onAddBook={handleAddBook}
            onUpdateBook={handleUpdateBook}
            onDeleteBook={handleDeleteBook}
          />
        )}
      </main>

      {/* Book Detail Modal */}
      {selectedBookForDetail && (
        <BookDetailModal
          book={selectedBookForDetail}
          isFavorite={favoriteBookIds.has(selectedBookForDetail.id)}
          inReadLater={readLaterBookIds.has(selectedBookForDetail.id)}
          onClose={() => setSelectedBookForDetail(null)}
          onOpenReader={handleOpenReader}
          onAddToCart={(b, qty) => {
            handleAddToCart(b, qty);
            setSelectedBookForDetail(null);
          }}
          onToggleFavorite={handleToggleFavorite}
          onToggleReadLater={(b) => handleToggleReadLater(b, 'medium')}
        />
      )}

      {/* Project Gutenberg Live Reader Modal */}
      {selectedBookForReader && (
        <ReaderModal
          book={selectedBookForReader}
          isFavorite={favoriteBookIds.has(selectedBookForReader.id)}
          onClose={() => setSelectedBookForReader(null)}
          onLogReading={handleLogReading}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      {authModalMode && (
        <AuthModal
          initialMode={authModalMode}
          pendingBook={pendingBookToRead}
          onClose={() => {
            setAuthModalMode(null);
            setPendingBookToRead(null);
          }}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {/* Database Inspector Modal */}
      {showDatabaseInspector && (
        <DatabaseInspectorModal
          books={books}
          users={users}
          orders={orders}
          favorites={favorites}
          readLater={readLater}
          readingHistory={readingHistory}
          onClose={() => setShowDatabaseInspector(false)}
        />
      )}

      {/* PHP Source Code Inspector Modal */}
      {showCodeInspector && (
        <PhpCodeInspectorModal
          onClose={() => setShowCodeInspector(false)}
        />
      )}

      {/* Responsive Footer */}
      <Footer
        onSetTab={(tab) => setCurrentTab(tab as any)}
      />
    </div>
  );
}
