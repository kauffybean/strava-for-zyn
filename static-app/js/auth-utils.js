/**
 * Zynfantry Authentication Utilities
 * Provides functions for managing user authentication and sessions
 */

// Using ES5 compatible function object instead of ES6 class
var ZynfantryAuth = function() {
  var self = this;
  
  // Auto-initialize if on login page
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    this.checkAuth().then(function(status) {
      if (status.authenticated) {
        window.location.href = '/feed.html';
      }
    });
  }
};

// Check if user is authenticated by verifying the session
ZynfantryAuth.prototype.checkAuth = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    fetch('/api/session-check', {
      method: 'GET',
      credentials: 'include'
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        return { authenticated: false };
      }
    })
    .then(function(data) {
      resolve({ authenticated: data.authenticated });
    })
    .catch(function(error) {
      console.error('Auth check error:', error);
      resolve({ authenticated: false });
    });
  });
};

// Fetch current user data
ZynfantryAuth.prototype.getCurrentUser = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    fetch('/api/user', {
      method: 'GET',
      credentials: 'include'
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      return null;
    })
    .then(function(userData) {
      if (userData) {
        self.storeUser(userData);
      }
      resolve(userData);
    })
    .catch(function(error) {
      console.error('Get user error:', error);
      resolve(null);
    });
  });
};

// Store user data locally
ZynfantryAuth.prototype.storeUser = function(userData) {
  localStorage.setItem('user', JSON.stringify(userData));
};

// Get stored user data
ZynfantryAuth.prototype.getStoredUser = function() {
  try {
    var userData = localStorage.getItem('user');
    if (!userData) return null;
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

// Clear stored user data
ZynfantryAuth.prototype.clearStoredUser = function() {
  localStorage.removeItem('user');
};

// Logout the current user
ZynfantryAuth.prototype.logout = function() {
  var self = this;
  fetch('/api/logout', {
    method: 'POST',
    credentials: 'include'
  })
  .then(function() {
    self.clearStoredUser();
    window.location.href = '/';
  })
  .catch(function(error) {
    console.error('Logout error:', error);
  });
};

// Protect a page that requires authentication
// If not authenticated, redirects to login page
ZynfantryAuth.prototype.protectRoute = function() {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.checkAuth()
      .then(function(status) {
        if (!status.authenticated) {
          // Not authenticated, redirect to login
          window.location.href = '/';
          resolve(false);
          return;
        }
        
        // Try to get user data if we don't have it stored
        if (!self.getStoredUser()) {
          return self.getCurrentUser().then(function() {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      })
      .catch(function(error) {
        console.error('Protect route error:', error);
        window.location.href = '/';
        resolve(false);
      });
  });
};

// Initialize auth utilities on page load
ZynfantryAuth.prototype.init = function() {
  var self = this;
  // Add logout handler to logout links
  var logoutLinks = document.querySelectorAll('#logout-link');
  for (var i = 0; i < logoutLinks.length; i++) {
    logoutLinks[i].addEventListener('click', function(e) {
      e.preventDefault();
      self.logout();
    });
  }
};

// Create a single instance to use across the application
var auth = new ZynfantryAuth();