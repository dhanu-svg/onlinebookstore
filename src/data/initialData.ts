import { Book, User, Order } from '../types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 1,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "The romantic clash between the opinionated Elizabeth Bennet and her proud aristocratic suitor, Fitzwilliam Darcy, exploring marriage, morality, and social station in Georgian England.",
    price: 299,
    cover_image: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
    stock: 25,
    gutenberg_url: "https://www.gutenberg.org/cache/epub/1342/pg1342-images.html",
    isbn: "9780141439518",
    year: 1813,
    genre: "Classic Romance"
  },
  {
    id: 2,
    title: "Frankenstein",
    author: "Mary Shelley",
    description: "The gothic masterpiece of Victor Frankenstein, a young scientist who creates a sentient creature in an unorthodox scientific experiment, grappling with ambition and tragic consequence.",
    price: 249,
    cover_image: "https://covers.openlibrary.org/b/isbn/9780486282114-L.jpg",
    stock: 18,
    gutenberg_url: "https://www.gutenberg.org/cache/epub/84/pg84-images.html",
    isbn: "9780486282114",
    year: 1818,
    genre: "Gothic Horror"
  },
  {
    id: 3,
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    description: "A collection of twelve detective mysteries featuring consulting detective Sherlock Holmes and Dr. John Watson solving bizarre enigmas across Victorian London.",
    price: 349,
    cover_image: "https://covers.openlibrary.org/b/isbn/9780140437805-L.jpg",
    stock: 30,
    gutenberg_url: "https://www.gutenberg.org/cache/epub/1661/pg1661-images.html",
    isbn: "9780140437805",
    year: 1892,
    genre: "Mystery & Crime"
  },
  {
    id: 4,
    title: "Moby-Dick; or, The Whale",
    author: "Herman Melville",
    description: "Sailor Ishmael recounts the obsessive quest of Captain Ahab for revenge against Moby Dick, the ferocious white sperm whale that bit off Ahab's leg at the knee.",
    price: 399,
    cover_image: "https://covers.openlibrary.org/b/isbn/9780142437247-L.jpg",
    stock: 15,
    gutenberg_url: "https://www.gutenberg.org/cache/epub/2701/pg2701-images.html",
    isbn: "9780142437247",
    year: 1851,
    genre: "Adventure & Epic"
  },
  {
    id: 5,
    title: "Alice's Adventures in Wonderland",
    author: "Lewis Carroll",
    description: "Young Alice falls through a rabbit hole into a whimsical, nonsensical underground fantasy world populated by anthropomorphic creatures and surreal logic.",
    price: 199,
    cover_image: "https://covers.openlibrary.org/b/isbn/9780141439761-L.jpg",
    stock: 40,
    gutenberg_url: "https://www.gutenberg.org/cache/epub/11/pg11-images.html",
    isbn: "9780141439761",
    year: 1865,
    genre: "Fantasy & Children"
  },
  {
    id: 6,
    title: "A Tale of Two Cities",
    author: "Charles Dickens",
    description: "Set in London and Paris before and during the French Revolution, depicting the plight of the French peasantry and the brutality of the Reign of Terror.",
    price: 299,
    cover_image: "https://covers.openlibrary.org/b/isbn/9780141439600-L.jpg",
    stock: 22,
    gutenberg_url: "https://www.gutenberg.org/cache/epub/98/pg98-images.html",
    isbn: "9780141439600",
    year: 1859,
    genre: "Historical Fiction"
  },
  {
    id: 7,
    title: "Dracula",
    author: "Bram Stoker",
    description: "Count Dracula's attempt to move from Transylvania to England to spread the undead curse, confronted by Professor Abraham Van Helsing and an intrepid circle of allies.",
    price: 279,
    cover_image: "https://covers.openlibrary.org/b/isbn/9780141439846-L.jpg",
    stock: 20,
    gutenberg_url: "https://www.gutenberg.org/cache/epub/345/pg345-images.html",
    isbn: "9780141439846",
    year: 1897,
    genre: "Gothic Horror"
  },
  {
    id: 8,
    title: "The Picture of Dorian Gray",
    author: "Oscar Wilde",
    description: "The philosophical story of Dorian Gray, an exceptionally handsome young man whose portrait ages and absorbs his corrupt moral decay while he remains eternally youthful.",
    price: 249,
    cover_image: "https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg",
    stock: 14,
    gutenberg_url: "https://www.gutenberg.org/cache/epub/174/pg174-images.html",
    isbn: "9780141439570",
    year: 1890,
    genre: "Philosophical Fiction"
  },
  {
    id: 9,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "The tragic story of Jay Gatsby, a self-made millionaire, and his obsessive pursuit of Daisy Buchanan amidst the roaring excess and disillusionment of the Jazz Age.",
    price: 299,
    cover_image: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    stock: 35,
    gutenberg_url: "https://www.gutenberg.org/ebooks/64317.html.images",
    isbn: "9780743273565",
    year: 1925,
    genre: "Modernist Fiction"
  },
  {
    id: 10,
    title: "The Metamorphosis",
    author: "Franz Kafka",
    description: "Gregor Samsa wakes up one morning transformed into a monstrous insect, examining alienation, familial obligation, and absurdity in modern bureaucratic life.",
    price: 199,
    cover_image: "https://covers.openlibrary.org/b/isbn/9780553213690-L.jpg",
    stock: 28,
    gutenberg_url: "https://www.gutenberg.org/cache/epub/5200/pg5200-images.html",
    isbn: "9780553213690",
    year: 1915,
    genre: "Existential Fiction"
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: "Admin Librarian",
    email: "admin@bookstore.com",
    role: "admin",
    created_at: "2026-09-01 10:00:00"
  },
  {
    id: 2,
    name: "Eleanor Dashwood",
    email: "reader@bookstore.com",
    role: "user",
    created_at: "2026-09-02 14:30:00"
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    user_id: 2,
    order_number: "ORD-2026-9014",
    total_amount: 548.00,
    shipping_name: "Eleanor Dashwood",
    shipping_address: "48 Barton Cottage Road",
    shipping_city: "Devonshire",
    shipping_country: "United Kingdom",
    payment_method: "Credit Card",
    status: "completed",
    created_at: "2026-09-15 11:22:00",
    items: [
      {
        id: 1,
        order_id: 1,
        book_id: 1,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        price: 299.00,
        quantity: 1,
        subtotal: 299.00
      },
      {
        id: 2,
        order_id: 1,
        book_id: 2,
        title: "Frankenstein",
        author: "Mary Shelley",
        price: 249.00,
        quantity: 1,
        subtotal: 249.00
      }
    ]
  }
];

export const INITIAL_FAVORITES = [
  {
    id: 1,
    user_id: 2,
    book_id: 1,
    book: INITIAL_BOOKS[0],
    created_at: "2026-09-15 12:00:00",
    note: "Favorite romantic classic of all time."
  },
  {
    id: 2,
    user_id: 2,
    book_id: 3,
    book: INITIAL_BOOKS[2],
    created_at: "2026-09-16 16:20:00",
    note: "Sherlock Holmes mysteries are brilliant."
  }
];

export const INITIAL_READ_LATER = [
  {
    id: 1,
    user_id: 2,
    book_id: 4,
    book: INITIAL_BOOKS[3],
    added_at: "2026-09-16 18:00:00",
    priority: "high" as const
  },
  {
    id: 2,
    user_id: 2,
    book_id: 8,
    book: INITIAL_BOOKS[7],
    added_at: "2026-09-17 09:15:00",
    priority: "medium" as const
  }
];

export const INITIAL_READING_HISTORY = [
  {
    id: 1,
    user_id: 2,
    book_id: 1,
    book: INITIAL_BOOKS[0],
    read_at: "2026-09-15 14:00:00",
    progress_percent: 100,
    notes: "Finished reading chapters 1 to 61."
  },
  {
    id: 2,
    user_id: 2,
    book_id: 2,
    book: INITIAL_BOOKS[1],
    read_at: "2026-09-17 19:30:00",
    progress_percent: 65,
    notes: "Reading chapter 14 at the university."
  }
];
