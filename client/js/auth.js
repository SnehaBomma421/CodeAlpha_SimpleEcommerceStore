/**
 * ========================================
 * AUTH MODULE - E-Commerce Store
 * Handles user authentication state and UI
 * ========================================
 */

const Auth = {
  /**
   * Get current user from localStorage
   */
  getUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Get auth token
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!this.getToken();
  },

  /**
   * Check if user is admin
   */
  isAdmin() {
    const user = this.getUser();
    return user && user.isAdmin === true;
  },

  /**
   * Save auth data after login/register
   */
  saveAuth(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  },

  /**
   * Clear auth data on logout
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.updateUI();
    window.location.href = '/';
  },

  /**
   * Update navbar UI based on auth state
   */
  updateUI() {
    const authLink = document.getElementById('authLink');

    if (authLink) {
      if (this.isLoggedIn()) {
        const user = this.getUser();
        if (this.isAdmin()) {
          authLink.innerHTML = `<i class="fas fa-shield-alt"></i> <span>Admin</span>`;
          authLink.href = '/admin';
        } else {
          authLink.innerHTML = `<i class="fas fa-user"></i> <span>${user.name || 'Account'}</span>`;
          authLink.href = '/profile';
        }
      } else {
        authLink.innerHTML = `<i class="fas fa-user"></i> <span>Login</span>`;
        authLink.href = '/login';
      }
    }

    // Update cart count
    if (typeof Cart !== 'undefined') {
      Cart.updateCartCount();
    }
  },

  /**
   * Initialize login form
   */
  initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const btn = document.getElementById('loginBtn');

      if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

      try {
        const result = await API.login({ email, password });

        if (result.success) {
          this.saveAuth(result.data);
          showToast('Login successful! Welcome back!', 'success');

          // Redirect based on admin status
          if (result.data.isAdmin) {
            setTimeout(() => (window.location.href = '/admin'), 1000);
          } else {
            setTimeout(() => (window.location.href = '/'), 1000);
          }
        }
      } catch (error) {
        showToast(error.message || 'Login failed', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
      }
    });
  },

  /**
   * Initialize register form
   */
  initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const btn = document.getElementById('registerBtn');

      // Validation
      if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

      try {
        const result = await API.register({
          name,
          email,
          password,
          confirmPassword,
        });

        if (result.success) {
          this.saveAuth(result.data);
          showToast('Registration successful! Welcome!', 'success');
          setTimeout(() => (window.location.href = '/'), 1000);
        }
      } catch (error) {
        showToast(error.message || 'Registration failed', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
      }
    });
  },

  /**
   * Initialize logout button
   */
  initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
      adminLogoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  },

  /**
   * Initialize auth module
   */
  init() {
    this.updateUI();
    this.initLoginForm();
    this.initRegisterForm();
    this.initLogout();
  },
};
