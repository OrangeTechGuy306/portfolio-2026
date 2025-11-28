// Simple authentication utilities without hooks

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
};

export const getUserData = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getUserData();
  return !!(token && user);
};

export const clearAuthData = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
};

export const setAuthData = (token: string, refreshToken: string, user: User): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('auth_token', token);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user_data', JSON.stringify(user));
};

export const logout = async (): Promise<void> => {
  const token = getAuthToken();
  
  // Call logout endpoint if token exists
  if (token) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api/v1'}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
  }
  
  // Clear local storage
  clearAuthData();
};
