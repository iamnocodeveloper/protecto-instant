export interface SystemSettings {
  id: string;
  logoUrl: string;
  storeName: string;
  storeRut: string;
  storeAddress: string;
  storePhone: string;
  ticketMessage: string;
  taxRate: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}
