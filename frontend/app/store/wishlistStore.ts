import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  offerPrice?: number;
  images: string[];
  inStock: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addToWishlist: (product: WishlistItem) => {
        const { items } = get();
        if (!items.find(item => item._id === product._id)) {
          set({ items: [...items, product] });
        }
      },

      removeFromWishlist: (productId: string) => {
        const { items } = get();
        set({ items: items.filter(item => item._id !== productId) });
      },

      toggleWishlist: (product: WishlistItem) => {
        const { items, addToWishlist, removeFromWishlist } = get();
        if (items.find(item => item._id === product._id)) {
          removeFromWishlist(product._id);
        } else {
          addToWishlist(product);
        }
      },

      isInWishlist: (productId: string) => {
        const { items } = get();
        return items.some(item => item._id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);