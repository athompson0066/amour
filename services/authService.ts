
import { User } from '../types';

const GUEST_STORAGE_KEY = 'amour_guest_session';
const ADMIN_AUTH_KEY = 'amour_admin_auth';

// The specified admin credentials
const ADMIN_CREDENTIALS = {
    username: 'athompson',
    password: 'Beachzipper66$'
};

const createInitialGuest = (): User => ({
  id: 'guest_' + Math.random().toString(36).substr(2, 9),
  email: 'guest@amour.local',
  name: 'Guest User',
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`,
  credits: 0,
  purchasedContentIds: JSON.parse(localStorage.getItem('amour_purchased_ids') || '[]'),
  isSubscriber: false
});

export const getCurrentUser = async (): Promise<User | null> => {
  const stored = localStorage.getItem(GUEST_STORAGE_KEY);
  if (stored) {
    const user = JSON.parse(stored);
    // Sync purchased IDs from dedicated key
    user.purchasedContentIds = JSON.parse(localStorage.getItem('amour_purchased_ids') || '[]');
    return user;
  }
  const newUser = createInitialGuest();
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
};

/**
 * Admin Authentication Logic
 */
export const loginAsAdmin = async (username: string, password: string): Promise<boolean> => {
    // Artificial delay for security/UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify({
            authenticated: true,
            timestamp: Date.now(),
            user: username
        }));
        return true;
    }
    return false;
};

export const isAdminAuthenticated = (): boolean => {
    const stored = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!stored) return false;
    
    try {
        const auth = JSON.parse(stored);
        // Sessions expire after 24 hours
        const isExpired = Date.now() - auth.timestamp > 24 * 60 * 60 * 1000;
        if (isExpired) {
            localStorage.removeItem(ADMIN_AUTH_KEY);
            return false;
        }
        return auth.authenticated;
    } catch (e) {
        return false;
    }
};

export const logoutAdmin = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
};

export const login = async (email: string): Promise<User | null> => {
  return getCurrentUser();
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(GUEST_STORAGE_KEY);
  localStorage.removeItem('amour_purchased_ids');
};

export const updateUser = async (user: User): Promise<void> => {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem('amour_purchased_ids', JSON.stringify(user.purchasedContentIds));
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return () => {};
};
