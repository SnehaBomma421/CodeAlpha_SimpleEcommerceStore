/**
 * ========================================
 * API SERVICE - E-Commerce Store
 * Handles all HTTP communication with the backend
 * ========================================
 */

const API = {
  // Base URL for API calls
  BASE_URL: '/api',

  /**
   * Get the stored auth token
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get headers with auth token if available
   */
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  },

  /**
   * Handle API response and errors
   */
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  },

  // ========================================
  // AUTH ENDPOINTS
  // ========================================

  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(userData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login user
   */
  async login(credentials) {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(credentials),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user profile
   */
  async getProfile() {
    try {
      const response = await fetch(`${this.BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // PRODUCT ENDPOINTS
  // ========================================

  /**
   * Get all products with optional filters
   */
  async getProducts(params = {}) {
    try {
      const queryString = new URLSearchParams();

      if (params.search) queryString.append('search', params.search);
      if (params.category && params.category !== 'all')
        queryString.append('category', params.category);
      if (params.minPrice) queryString.append('minPrice', params.minPrice);
      if (params.maxPrice) queryString.append('maxPrice', params.maxPrice);
      if (params.sort) queryString.append('sort', params.sort);
      if (params.page) queryString.append('page', params.page);
      if (params.limit) queryString.append('limit', params.limit);

      const url = `${
        this.BASE_URL
      }/products?${queryString.toString()}`;

      const response = await fetch(url, {
        headers: this.getHeaders(false),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get single product by ID
   */
  async getProductById(id) {
    try {
      const response = await fetch(`${this.BASE_URL}/products/${id}`, {
        headers: this.getHeaders(false),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get featured products
   */
  async getFeaturedProducts() {
    try {
      const response = await fetch(`${this.BASE_URL}/products/featured`, {
        headers: this.getHeaders(false),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get search suggestions
   */
  async getSuggestions(query) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/products/suggestions?q=${encodeURIComponent(query)}`,
        { headers: this.getHeaders(false) }
      );
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // ORDER ENDPOINTS
  // ========================================

  /**
   * Create a new order
   */
  async createOrder(orderData) {
    try {
      const response = await fetch(`${this.BASE_URL}/orders`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(orderData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's orders
   */
  async getUserOrders() {
    try {
      const response = await fetch(`${this.BASE_URL}/orders`, {
        headers: this.getHeaders(true),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get order by ID
   */
  async getOrderById(id) {
    try {
      const response = await fetch(`${this.BASE_URL}/orders/${id}`, {
        headers: this.getHeaders(true),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all orders (Admin)
   */
  async getAllOrders() {
    try {
      const response = await fetch(`${this.BASE_URL}/orders/all`, {
        headers: this.getHeaders(true),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update order status (Admin)
   */
  async updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(
        `${this.BASE_URL}/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: this.getHeaders(true),
          body: JSON.stringify({ status }),
        }
      );
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // ADMIN PRODUCT ENDPOINTS
  // ========================================

  /**
   * Create a product (Admin)
   */
  async createProduct(productData) {
    try {
      const response = await fetch(`${this.BASE_URL}/products`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(productData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update a product (Admin)
   */
  async updateProduct(id, productData) {
    try {
      const response = await fetch(`${this.BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(productData),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a product (Admin)
   */
  async deleteProduct(id) {
    try {
      const response = await fetch(`${this.BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });
      return await this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  },
};
