/**
 * TypeScript Interfaces matching the MySQL Schema and Application State
 */

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  created_at: string;
  is_verified?: boolean;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  price: number;
  cover_image: string;
  stock: number;
  gutenberg_url: string;
  isbn?: string;
  year?: number;
  genre: string;
  created_at?: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  book_id: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  payment_method: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  items: OrderItem[];
}

export interface FavoriteItem {
  id: number;
  user_id: number;
  book_id: number;
  book: Book;
  created_at: string;
  note?: string;
}

export interface ReadLaterItem {
  id: number;
  user_id: number;
  book_id: number;
  book: Book;
  added_at: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ReadingHistoryItem {
  id: number;
  user_id: number;
  book_id: number;
  book: Book;
  read_at: string;
  progress_percent: number;
  notes?: string;
}
