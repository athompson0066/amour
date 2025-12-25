
import { User } from '../types';

const GUEST_STORAGE_KEY = 'amour_guest_session';

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

export const login = async (email: string): Promise<User | null> => {
  // Bypassed: Users don't need to log in anymore
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
    // Return empty unsubscribe
    return () => {};
};
