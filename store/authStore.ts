import { create } from "zustand";

type AuthState = {
  token: string | null;
  hydrated: boolean;
  setHydrated: () => void;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  hydrated: false,

  setHydrated: () => {
    const token = localStorage.getItem("token");

    set({
      token,
      hydrated: true,
    });
  },

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },
}));