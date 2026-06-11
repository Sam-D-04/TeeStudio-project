import { create } from "zustand";
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredUser,
  saveAuthSession,
  syncStoredUser,
} from "@/lib/authStorage";
import type { AuthSession, AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setSession: (session: AuthSession) => void;
  updateUser: (user: AuthUser) => void;
  clearSession: () => void;
  hydrate: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  hydrated: false,

  setSession: (session) => {
    saveAuthSession(session);
    set({
      user: session.user,
      accessToken: session.accessToken,
      isAuthenticated: true,
      hydrated: true,
    });
  },

  updateUser: (user) => {
    syncStoredUser(user);
    set({ user });
  },

  clearSession: () => {
    clearAuthSession();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hydrated: true,
    });
  },

  hydrate: () => {
    const user = getStoredUser();
    const accessToken = getStoredAccessToken();
    set({
      user,
      accessToken,
      isAuthenticated: Boolean(user),
      hydrated: true,
    });
  },
}));

export default useAuthStore;
