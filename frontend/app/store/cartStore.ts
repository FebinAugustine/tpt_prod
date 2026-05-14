import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  offerPrice?: number;
  images: string[];
  inStock: boolean;
  quantity: number;
  weight?: string;
  flavour?: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      addToCart: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item._id === product._id);

        if (existingItem) {
          set({
            items: items.map(item =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { ...product, quantity }],
          });
        }
      },

      removeFromCart: (productId: string) => {
        const { items } = get();
        set({ items: items.filter(item => item._id !== productId) });
      },

      updateQuantity: (productId: string, quantity: number) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter(item => item._id !== productId) });
        } else {
          set({
            items: items.map(item =>
              item._id === productId ? { ...item, quantity } : item
            ),
          });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
          const price = item.offerPrice || item.price;
          return total + (price * item.quantity);
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);