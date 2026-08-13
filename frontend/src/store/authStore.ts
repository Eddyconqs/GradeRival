import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { forgotPasswordRequest, getProfileRequest, loginRequest, registerRequest, updateProfileRequest } from '../api/auth';
import { demoUser } from '../data/mockData';
import { LoginPayload, ProfileSettings, RegisterPayload, User } from '../types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  settings: ProfileSettings;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
  updateProfile: (payload: Partial<User>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
  updateSettings: (settings: Partial<ProfileSettings>) => void;
  continueWithDemo: () => void;
  clearError: () => void;
}

const demoTokens = {
  accessToken: 'demo-access-token',
  refreshToken: 'demo-refresh-token'
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      settings: {
        showOnLeaderboard: true,
        publicProfile: true,
        studyReminders: true
      },
      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const data = await loginRequest(payload);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ error: 'Unable to sign in. Use the Google/demo button below if your API is offline.', isLoading: false });
          throw error;
        }
      },
      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const data = await registerRequest(payload);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          const localUser: User = {
            ...demoUser,
            id: `local-${Date.now()}`,
            email: payload.email,
            username: payload.username,
            school: payload.school,
            bio: `${payload.name}'s GradeRival profile`
          };
          set({
            user: localUser,
            accessToken: demoTokens.accessToken,
            refreshToken: demoTokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: 'Connected demo mode because the API is unavailable.'
          });
        }
      },
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null
        }),
      loadProfile: async () => {
        if (!get().isAuthenticated) return;
        try {
          const user = await getProfileRequest();
          set({ user });
        } catch {
          if (!get().user) {
            set({ user: demoUser });
          }
        }
      },
      updateProfile: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const user = await updateProfileRequest(payload);
          set({ user, isLoading: false });
        } catch {
          set({ user: { ...(get().user ?? demoUser), ...payload }, isLoading: false });
        }
      },
      requestPasswordReset: async (email) => {
        try {
          const response = await forgotPasswordRequest(email);
          return response.message;
        } catch {
          return 'Password reset instructions were prepared in demo mode.';
        }
      },
      updateSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),
      continueWithDemo: () =>
        set({
          user: demoUser,
          accessToken: demoTokens.accessToken,
          refreshToken: demoTokens.refreshToken,
          isAuthenticated: true,
          error: null
        }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'graderival-auth'
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('graderival:tokens-updated', (event: Event) => {
    const detail = (event as CustomEvent<{ accessToken: string; refreshToken: string }>).detail;
    if (!detail) {
      return;
    }

    useAuthStore.setState({
      accessToken: detail.accessToken,
      refreshToken: detail.refreshToken
    });
  });
}
