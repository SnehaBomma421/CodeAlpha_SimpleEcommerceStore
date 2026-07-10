/**
 * ========================================
 * CART MODULE - E-Commerce Store
 * Manages shopping cart using localStorage
 * ========================================
 */

const Cart = {
  /**
   * Get cart items from localStorage
   */
  getItems() {
    try {
      const items = localStorage.getItem('cart');
      return items ? JSON.parse(items) : [];
    } catch (e) {
      console.error('Error reading cart:', e);
      return [];
    }
  },

  /**
   * Save cart items to localStorage
   */
  saveItems(items) {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      this.updateCartCount();
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  },

  /**
   * Add item to cart
   */
  addItem(product, quantity = 1) {
    const items = this.getItems();
    const existingIndex = items.findIndex(
      (item) => item.productId === product._id || item.productId === product.id
    );

    if (existingIndex >= 0) {
      // Item exists, update quantity
      items[existingIndex].quantity += quantity;
    } else {
      // New item
      items.push({
        productId: product._id || product.id,
        title: product.title || product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        quantity: quantity,
      });
    }

    this.saveItems(items);
    return items;
  },

  /**
   * Remove item from cart
   */
  removeItem(productId) {
    const items = this.getItems().filter(
      (item) => item.productId !== productId
    );
    this.saveItems(items);
    return items;
  },

  /**
   * Update item quantity
   */
  updateQuantity(productId, quantity) {
    const items = this.getItems();
    const item = items.find((i) => i.productId === productId);

    if (item) {
      if (quantity <= 0) {
        return this.removeItem(productId);
      }
      item.quantity = quantity;
    }

    this.saveItems(items);
    return items;
  },

  /**
   * Clear entire cart
   */
  clear() {
    localStorage.removeItem('cart');
    this.updateCartCount();
  },

  /**
   * Get total number of items in cart
   */
  getItemCount() {
    return this.getItems().reduce((total, item) => total + item.quantity, 0);
  },

  /**
   * Calculate cart totals
   */
  getTotals() {
    const items = this.getItems();
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryCharge = subtotal >= 500 ? 0 : 50;
    const tax = subtotal * 0.08;
    const total = subtotal + tax + deliveryCharge;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryCharge,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },

  /**
   * Update the cart count badge in the navbar
   */
  updateCartCount() {
    const count = this.getItemCount();
    const badges = document.querySelectorAll('.cart-count');

    badges.forEach((badge) => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
  },

  /**
   * Render cart items on cart page
   */
  renderCartPage() {
    const items = this.getItems();
    const cartItemsContainer = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartContent = document.getElementById('cartContent');

    if (!cartItemsContainer) return;

    if (items.length === 0) {
      if (cartContent) cartContent.style.display = 'none';
      if (cartEmpty) cartEmpty.style.display = 'block';
      return;
    }

    if (cartContent) cartContent.style.display = 'block';
    if (cartEmpty) cartEmpty.style.display = 'none';

    cartItemsContainer.innerHTML = items
      .map(
        (item) => `
      <div class="cart-item" data-id="${item.productId}">
        <div class="cart-item-image">
          <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/100?text=Product'">
        </div>
        <div class="cart-item-info">
          <h3><a href="/product?id=${item.productId}">${item.title}</a></h3>
          <p class="cart-item-price">₹${Number(item.price).toFixed(2)}</p>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-controls">
            <button class="qty-decrease" data-id="${item.productId}">−</button>
            <input type="number" class="qty-input" value="${item.quantity}" min="1" max="${item.stock || 99}" readonly>
            <button class="qty-increase" data-id="${item.productId}">+</button>
          </div>
          <button class="remove-btn" data-id="${item.productId}">
            <i class="fas fa-trash-alt"></i> Remove
          </button>
        </div>
      </div>
    `
      )
      .join('');

    this.updateCartSummary();

    // Attach event listeners
    cartItemsContainer.querySelectorAll('.qty-decrease').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const currentItem = items.find((i) => i.productId === id);
        if (currentItem && currentItem.quantity > 1) {
          this.updateQuantity(id, currentItem.quantity - 1);
          this.renderCartPage();
        } else {
          if (confirm('Remove this item from cart?')) {
            this.removeItem(id);
            this.renderCartPage();
          }
        }
      });
    });

    cartItemsContainer.querySelectorAll('.qty-increase').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const currentItem = items.find((i) => i.productId === id);
        if (currentItem && currentItem.quantity < (currentItem.stock || 99)) {
          this.updateQuantity(id, currentItem.quantity + 1);
          this.renderCartPage();
        } else {
          showToast('Maximum stock reached!', 'warning');
        }
      });
    });

    cartItemsContainer.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Remove this item from cart?')) {
          this.removeItem(btn.dataset.id);
          this.renderCartPage();
          showToast('Item removed from cart', 'info');
        }
      });
    });
  },

  /**
   * Update cart summary with totals
   */
  updateCartSummary() {
    const totals = this.getTotals();

    const subtotalEl = document.getElementById('cartSubtotal');
    const deliveryEl = document.getElementById('cartDelivery');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');

    if (subtotalEl) subtotalEl.textContent = `₹${totals.subtotal.toFixed(2)}`;
    if (deliveryEl) {
      deliveryEl.textContent =
        totals.deliveryCharge === 0
          ? 'FREE'
          : `₹${totals.deliveryCharge.toFixed(2)}`;
    }
    if (taxEl) taxEl.textContent = `₹${totals.tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${totals.total.toFixed(2)}`;
  },

  /**
   * Apply coupon code
   */
  applyCoupon(code) {
    const couponMessage = document.getElementById('couponMessage');
    if (!couponMessage) return false;

    const validCoupons = {
      SAVE10: { discount: 0.1, msg: '10% discount applied!' },
      WELCOME20: { discount: 0.2, msg: '20% welcome discount applied!' },
      FREESHIP: { discount: 0, freeShipping: true, msg: 'Free shipping applied!' },
    };

    const coupon = validCoupons[code.toUpperCase()];

    if (coupon) {
      couponMessage.style.display = 'block';
      couponMessage.style.color = 'var(--success)';

      if (coupon.freeShipping) {
        // Override delivery to free
        const deliveryEl = document.getElementById('cartDelivery');
        if (deliveryEl) deliveryEl.textContent = 'FREE';
        couponMessage.textContent = coupon.msg;
      } else {
        const totals = this.getTotals();
        const discount = totals.subtotal * coupon.discount;
        const newTotal = totals.total - discount;
        const totalEl = document.getElementById('cartTotal');
        if (totalEl) totalEl.textContent = `₹${newTotal.toFixed(2)}`;
        couponMessage.textContent = `${coupon.msg} (-₹${discount.toFixed(2)})`;
      }

      localStorage.setItem('coupon', JSON.stringify({ code: code.toUpperCase(), ...coupon }));
      return true;
    } else {
      couponMessage.style.display = 'block';
      couponMessage.style.color = 'var(--danger)';
      couponMessage.textContent = 'Invalid coupon code';
      return false;
    }
  },

  /**
   * Get cart data for checkout
   */
  getCheckoutData() {
    return {
      items: this.getItems(),
      totals: this.getTotals(),
    };
  },
};
