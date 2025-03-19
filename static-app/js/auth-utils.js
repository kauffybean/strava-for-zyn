/**
 * Zynfantry Authentication Utilities
 * Provides functions for managing user authentication and sessions
 */

class ZynfantryAuth {
  /**
   * Constructor - initializes the auth utilities
   */
  constructor() {
    // Auto-initialize if on login page
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      this.checkAuth().then(status => {
        if (status.authenticated) {
          window.location.href = '/feed.html';
        }
      });
    }
  }

  /**
   * Check if user is authenticated by verifying the session
   */
  async checkAuth() {
    try {
      const response = await fetch('/api/session-check', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        return { authenticated: false };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Session check error:', error);
      return { authenticated: false };
    }
  }
  
  /**
   * Fetch current user data
   */
  async getCurrentUser() {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
  
  /**
   * Store user data locally
   */
  storeUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }
  
  /**
   * Get stored user data
   */
  getStoredUser() {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }
  
  /**
   * Clear stored user data
   */
  clearStoredUser() {
    localStorage.removeItem('user');
  }
  
  /**
   * Logout the current user
   */
  async logout() {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      this.clearStoredUser();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  /**
   * Protect a page that requires authentication
   * If not authenticated, redirects to login page
   */
  async protectRoute() {
    const status = await this.checkAuth();
    
    if (!status.authenticated) {
      // Not authenticated, redirect to login
      window.location.href = '/';
      return false;
    }
    
    return true;
  }
  
  /**
   * Initialize auth utilities on page load
   */
  init() {
    // On login pages, redirect authenticated users to feed
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      this.checkAuth().then(status => {
        if (status.authenticated) {
          window.location.href = '/feed.html';
        }
      });
    }
  }
}

// Create a single instance to use across the application
const auth = new ZynfantryAuth();