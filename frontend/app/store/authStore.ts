import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../services/types';
import { authApi } from '../services/authApi';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string, phone: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  init: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      isHydrated: false,

        login: async (email: string, password: string): Promise<boolean> => {
          set({ isLoading: true, error: null });

          try {
            const response = await authApi.login(email, password);

            if (response.success && response.data) {
              set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
              });
              return true;
            } else {
              set({
                error: response.error || 'Login failed',
                isLoading: false,
              });
              return false;
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'An error occurred during login',
              isLoading: false,
            });
            return false;
          }
        },

       register: async (fullName: string, email: string, password: string, phone: string): Promise<boolean> => {
         set({ isLoading: true, error: null });
 
         try {
           const response = await authApi.register(fullName, email, password, phone);
 
           if (response.success) {
             set({
               isLoading: false,
             });
             return true;
           } else {
             set({
               error: response.error || 'Registration failed',
               isLoading: false,
             });
             return false;
           }
         } catch (error) {
           set({
             error: error instanceof Error ? error.message : 'An error occurred during registration',
             isLoading: false,
           });
           return false;
         }
       },

       logout: () => {
         authApi.logout();
         set({
           user: null,
           isAuthenticated: false,
           error: null,
         });
       },

clearError: () => {
        set({ error: null });
      },

      updateUser: (updatedUser: User) => {
        set({ 
          user: updatedUser,
          isAuthenticated: true,
        });
      },
 
       init: async () => {
         try {
           // First check if we have a valid token in storage
           const storedUser = localStorage.getItem('user');
           const isAuth = localStorage.getItem('isAuthenticated') === 'true';
           
           if (storedUser && isAuth) {
             // Optimistically set auth state from storage
             set({
               user: JSON.parse(storedUser),
               isAuthenticated: true,
               isHydrated: true,
             });
             
             // Then verify with backend in background (non-blocking)
             authApi.getProfile().then(response => {
               if (!response.success || !response.data) {
                 // Token invalid/invalid, logout
                 set({ user: null, isAuthenticated: false });
               }
               // If valid, keep the optimistically set state
             }).catch(() => {
               // Network error - keep optimistic state, retry later
             });
             return;
           }
           
           // No valid token in storage, do full check
           const response = await authApi.getProfile();
           if (response.success && response.data) {
             set({
               user: response.data,
               isAuthenticated: true,
             });
           } else {
             set({
               user: null,
               isAuthenticated: false,
             });
           }
         } catch {
           set({
             user: null,
             isAuthenticated: false,
           });
         } finally {
           set({ isHydrated: true });
         }
       },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
