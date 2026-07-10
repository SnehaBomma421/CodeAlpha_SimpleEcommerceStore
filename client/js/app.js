/**
 * ========================================
 * APP.JS - Main Application Logic
 * E-Commerce Store - ShopVerse
 * ========================================
 */

// ========================================
// GLOBAL HELPER FUNCTIONS
// ========================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);

  // Remove after animation
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3500);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  return `₹${Number(amount).toFixed(2)}`;
}

/**
 * Generate star rating HTML
 */
function getStarsHTML(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;

  return (
    '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty)
  );
}

/**
 * Truncate text
 */
function truncateText(text, length = 80) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

// ========================================
// PRODUCT CARD RENDERER
// ========================================

/**
 * Create HTML for a product card
 */
function createProductCard(product) {
  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image || 'https://via.placeholder.com/300'}" alt="${product.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300?text=Product'">
        ${product.featured ? '<span class="product-badge"><i class="fas fa-star"></i> Featured</span>' : ''}
        <button class="wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}" data-id="${product._id}" onclick="toggleWishlist('${product._id}')">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category || 'General'}</p>
        <h3 class="product-title"><a href="/product?id=${product._id}">${product.title}</a></h3>
        <div class="product-rating">
          <span class="stars">${getStarsHTML(product.rating || 0)}</span>
          <span class="rating-count">(${product.numReviews || 0})</span>
        </div>
        <p class="product-description">${truncateText(product.description, 80)}</p>
        <div class="product-price">
          ₹${Number(product.price).toFixed(2)}
        </div>
        <div class="product-actions">
          <button class="btn btn-primary btn-small add-to-cart-btn" data-id="${product._id}">
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
          <a href="/product?id=${product._id}" class="btn btn-secondary btn-small">
            <i class="fas fa-eye"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}

// ========================================
// WISHLIST
// ========================================

/**
 * Get wishlist from localStorage
 */
function getWishlist() {
  try {
    const items = localStorage.getItem('wishlist');
    return items ? JSON.parse(items) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save wishlist to localStorage
 */
function saveWishlist(items) {
  localStorage.setItem('wishlist', JSON.stringify(items));
}

/**
 * Check if product is in wishlist
 */
function isInWishlist(productId) {
  return getWishlist().includes(productId);
}

/**
 * Toggle wishlist item
 */
function toggleWishlist(productId) {
  let items = getWishlist();

  if (items.includes(productId)) {
    items = items.filter((id) => id !== productId);
    showToast('Removed from wishlist', 'info');
  } else {
    items.push(productId);
    showToast('Added to wishlist! ❤️', 'success');
  }

  saveWishlist(items);

  // Update UI if on wishlist or product page
  const btns = document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`);
  btns.forEach((btn) => btn.classList.toggle('active'));

  if (window.location.pathname === '/wishlist' || window.location.pathname === '/wishlist.html') {
    renderWishlist();
  }
}

/**
 * Render wishlist page
 */
async function renderWishlist() {
  const grid = document.getElementById('wishlistGrid');
  const empty = document.getElementById('wishlistEmpty');
  if (!grid) return;

  const ids = getWishlist();

  if (ids.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';
  grid.innerHTML = '<div class="loading-spinner" style="min-height:200px;"><div class="spinner"></div></div>';

  try {
    // Fetch each product
    const products = await Promise.all(
      ids.map((id) => API.getProductById(id).catch(() => null))
    );

    const validProducts = products.filter((p) => p && p.success).map((p) => p.data);

    if (validProducts.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }

    grid.innerHTML = validProducts.map(createProductCard).join('');

    // Add to cart listeners
    grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const result = await API.getProductById(btn.dataset.id);
          if (result.success) {
            Cart.addItem(result.data, 1);
            showToast('Added to cart! 🛒', 'success');
          }
        } catch (err) {
          showToast('Error adding to cart', 'error');
        }
      });
    });
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Error loading wishlist</p>';
  }
}

// ========================================
// HOME PAGE
// ========================================

/**
 * Load featured products on homepage
 */
async function loadFeaturedProducts() {
  const grid = document.getElementById('featuredProductsGrid');
  if (!grid) return;

  try {
    const result = await API.getFeaturedProducts();

    if (result.success && result.data.length > 0) {
      grid.innerHTML = result.data.map(createProductCard).join('');
    } else {
      // Fallback: load regular products and mark first 4 as featured
      const allProducts = await API.getProducts({ limit: 8 });
      if (allProducts.success) {
        grid.innerHTML = allProducts.data.map(createProductCard).join('');
      }
    }

    // Attach add-to-cart events
    grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const result = await API.getProductById(btn.dataset.id);
          if (result.success) {
            Cart.addItem(result.data, 1);
            showToast('Added to cart! 🛒', 'success');
          }
        } catch (err) {
          showToast('Error adding to cart', 'error');
        }
      });
    });
  } catch (error) {
    console.error('Error loading featured products:', error);
    grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);">Unable to load featured products</p>';
  }
}

/**
 * Load new arrivals on homepage
 */
async function loadNewArrivals() {
  const grid = document.getElementById('newArrivalsGrid');
  if (!grid) return;

  try {
    const result = await API.getProducts({ sort: 'newest', limit: 4 });

    if (result.success) {
      grid.innerHTML = result.data.map(createProductCard).join('');
    }

    grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const r = await API.getProductById(btn.dataset.id);
          if (r.success) {
            Cart.addItem(r.data, 1);
            showToast('Added to cart! 🛒', 'success');
          }
        } catch (err) {
          showToast('Error adding to cart', 'error');
        }
      });
    });

    // Update total products count in hero
    const totalEl = document.getElementById('totalProducts');
    if (totalEl && result.total) {
      totalEl.textContent = `${result.total}+`;
    }
  } catch (error) {
    grid.innerHTML = '';
  }
}

/**
 * Load categories on homepage
 */
async function loadCategories() {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  const categoryIcons = {
    Electronics: '📱',
    Clothing: '👕',
    'Home & Kitchen': '🏠',
    Books: '📚',
    Sports: '⚽',
    Beauty: '💄',
    Toys: '🧸',
    Automotive: '🚗',
    Grocery: '🛒',
    Music: '🎵',
    default: '📦',
  };

  try {
    const result = await API.getProducts({ limit: 1 });

    if (result.categories && result.categories.length > 0) {
      grid.innerHTML = result.categories
        .map(
          (cat) => `
        <div class="category-card" onclick="window.location.href='/products?category=${encodeURIComponent(cat)}'">
          <span class="category-icon">${categoryIcons[cat] || categoryIcons.default}</span>
          <h3>${cat}</h3>
          <p>Shop ${cat}</p>
        </div>
      `
        )
        .join('');

      // Also populate footer categories
      const footerCats = document.getElementById('footerCategories');
      if (footerCats) {
        footerCats.innerHTML = result.categories
          .slice(0, 6)
          .map((cat) => `<li><a href="/products?category=${encodeURIComponent(cat)}">${cat}</a></li>`)
          .join('');
      }
    }
  } catch (error) {
    // Use default categories
    const defaultCats = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'];
    grid.innerHTML = defaultCats
      .map(
        (cat) => `
      <div class="category-card" onclick="window.location.href='/products?category=${encodeURIComponent(cat)}'">
        <span class="category-icon">${categoryIcons[cat] || categoryIcons.default}</span>
        <h3>${cat}</h3>
        <p>Shop ${cat}</p>
      </div>
    `
      )
      .join('');
  }
}

// ========================================
// PRODUCTS PAGE (Listing)
// ========================================

let currentFilters = {
  search: '',
  category: 'all',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
  page: 1,
};

/**
 * Load products for products page
 */
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const pagination = document.getElementById('pagination');
  const resultCount = document.getElementById('resultCount');

  if (!grid) return;

  grid.innerHTML = `
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
  `;

  try {
    const params = {};
    if (currentFilters.search) params.search = currentFilters.search;
    if (currentFilters.category !== 'all') params.category = currentFilters.category;
    if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
    if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;
    if (currentFilters.sort) params.sort = currentFilters.sort;
    params.page = currentFilters.page;
    params.limit = 12;

    const result = await API.getProducts(params);

    if (resultCount) {
      resultCount.textContent = `Showing ${result.data.length} of ${result.total} products`;
    }

    if (result.data.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
          <div style="font-size:3rem;margin-bottom:15px;opacity:0.3;">🔍</div>
          <h3>No products found</h3>
          <p style="color:var(--text-muted);">Try adjusting your filters</p>
        </div>
      `;
      if (pagination) pagination.innerHTML = '';
      return;
    }

    grid.innerHTML = result.data.map(createProductCard).join('');

    // Add to cart events
    grid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const r = await API.getProductById(btn.dataset.id);
          if (r.success) {
            Cart.addItem(r.data, 1);
            showToast('Added to cart! 🛒', 'success');
          }
        } catch (err) {
          showToast('Error adding to cart', 'error');
        }
      });
    });

    // Pagination
    if (pagination) {
      renderPagination(pagination, result);
    }

    // Update category filters
    updateCategoryFilters(result.categories);
  } catch (error) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;">
        <h3>Error loading products</h3>
        <p style="color:var(--text-muted);">${error.message}</p>
      </div>
    `;
  }
}

/**
 * Render pagination
 */
function renderPagination(container, result) {
  const { currentPage, totalPages } = result;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  // Previous button
  html += `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">‹ Prev</button>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<button disabled>...</button>`;
    }
  }

  // Next button
  html += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">Next ›</button>`;

  container.innerHTML = html;
}

/**
 * Go to page
 */
function goToPage(page) {
  currentFilters.page = page;
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Update category filter UI
 */
function updateCategoryFilters(categories) {
  const container = document.getElementById('categoryFilters');
  if (!container || !categories || categories.length === 0) return;

  // Remove existing options except "All Categories"
  const existingRadios = container.querySelectorAll('.filter-option');
  existingRadios.forEach((el, idx) => {
    if (idx > 0) el.remove();
  });

  categories.forEach((cat) => {
    const label = document.createElement('label');
    label.className = 'filter-option';
    label.innerHTML = `
      <input type="radio" name="category" value="${cat}" ${currentFilters.category === cat ? 'checked' : ''}>
      ${cat}
    `;
    label.querySelector('input').addEventListener('change', (e) => {
      if (e.target.checked) {
        currentFilters.category = cat;
        currentFilters.page = 1;
        loadProducts();
      }
    });
    container.appendChild(label);
  });
}

/**
 * Initialize products page filters
 */
function initProductFilters() {
  // Search input
  const filterSearch = document.getElementById('filterSearch');
  if (filterSearch) {
    filterSearch.addEventListener('input', debounce((e) => {
      currentFilters.search = e.target.value;
      currentFilters.page = 1;
      loadProducts();
    }, 500));
  }

  // Category radio buttons
  document.querySelectorAll('#categoryFilters input[name="category"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        currentFilters.category = e.target.value;
        currentFilters.page = 1;
        loadProducts();
      }
    });
  });

  // Clear category
  const clearCat = document.getElementById('clearCategory');
  if (clearCat) {
    clearCat.addEventListener('click', () => {
      const allRadio = document.querySelector('#categoryFilters input[value="all"]');
      if (allRadio) {
        allRadio.checked = true;
        currentFilters.category = 'all';
        currentFilters.page = 1;
        loadProducts();
      }
    });
  }

  // Price filter
  const applyPrice = document.getElementById('applyPriceFilter');
  if (applyPrice) {
    applyPrice.addEventListener('click', () => {
      currentFilters.minPrice = document.getElementById('minPrice').value;
      currentFilters.maxPrice = document.getElementById('maxPrice').value;
      currentFilters.page = 1;
      loadProducts();
    });
  }

  // Sort
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentFilters.sort = e.target.value;
      currentFilters.page = 1;
      loadProducts();
    });
  }

  // Reset filters
  const resetBtn = document.getElementById('resetFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentFilters = {
        search: '',
        category: 'all',
        minPrice: '',
        maxPrice: '',
        sort: 'newest',
        page: 1,
      };

      // Reset UI elements
      if (filterSearch) filterSearch.value = '';
      document.getElementById('minPrice').value = '';
      document.getElementById('maxPrice').value = '';
      document.getElementById('sortSelect').value = 'newest';
      const allRadio = document.querySelector('#categoryFilters input[value="all"]');
      if (allRadio) allRadio.checked = true;

      loadProducts();
    });
  }
}

/**
 * Debounce utility
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ========================================
// PRODUCT DETAIL PAGE
// ========================================

/**
 * Load product details
 */
async function loadProductDetail() {
  const loading = document.getElementById('productLoading');
  const content = document.getElementById('productContent');
  const relatedGrid = document.getElementById('relatedProductsGrid');
  const breadcrumbProduct = document.getElementById('breadcrumbProduct');

  if (!loading || !content) return;

  // Get product ID from URL
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    loading.style.display = 'none';
    content.innerHTML = '<div style="text-align:center;padding:60px;"><h2>Product not found</h2><p style="color:var(--text-muted);">No product ID specified</p></div>';
    return;
  }

  try {
    const result = await API.getProductById(productId);

    if (!result.success) {
      throw new Error('Product not found');
    }

    const product = result.data;

    loading.style.display = 'none';
    content.style.display = 'grid';

    // Update breadcrumb
    if (breadcrumbProduct) breadcrumbProduct.textContent = product.title;

    // Set product details
    document.getElementById('productImage').src = product.image || 'https://via.placeholder.com/500';
    document.getElementById('productImage').alt = product.title;
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productCategory').textContent = product.category || 'General';
    document.getElementById('productStars').textContent = getStarsHTML(product.rating || 0);
    document.getElementById('productRatingText').textContent = `(${product.numReviews || 0} reviews)`;
    document.getElementById('productPrice').textContent = `₹${Number(product.price).toFixed(2)}`;
    document.getElementById('productDescription').textContent = product.description;

    // Stock info
    const stockInfo = document.getElementById('stockInfo');
    const stockText = document.getElementById('stockText');
    if (product.stock > 0) {
      stockInfo.className = 'stock-info in-stock';
      stockText.textContent = `In Stock (${product.stock} available)`;
      document.getElementById('addToCartBtn').disabled = false;
      document.getElementById('buyNowBtn').disabled = false;
    } else {
      stockInfo.className = 'stock-info out-of-stock';
      stockText.textContent = 'Out of Stock';
      document.getElementById('addToCartBtn').disabled = true;
      document.getElementById('buyNowBtn').disabled = true;
      document.getElementById('addToCartBtn').style.opacity = '0.5';
      document.getElementById('buyNowBtn').style.opacity = '0.5';
    }

    // Quantity selector
    const qtyInput = document.getElementById('quantity');
    document.getElementById('decreaseQty').onclick = () => {
      const val = parseInt(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = val - 1;
    };
    document.getElementById('increaseQty').onclick = () => {
      const val = parseInt(qtyInput.value) || 1;
      if (val < (product.stock || 99)) qtyInput.value = val + 1;
      else showToast('Maximum stock reached', 'warning');
    };

    // Add to cart
    document.getElementById('addToCartBtn').onclick = () => {
      Cart.addItem(product, parseInt(qtyInput.value) || 1);
      showToast(`${product.title} added to cart! 🛒`, 'success');
    };

    // Buy now
    document.getElementById('buyNowBtn').onclick = () => {
      Cart.addItem(product, parseInt(qtyInput.value) || 1);
      window.location.href = '/checkout';
    };

    // Wishlist toggle
    const wishlistBtn = document.getElementById('wishlistBtn');
    wishlistBtn.classList.toggle('btn-outline', !isInWishlist(product._id));
    wishlistBtn.classList.toggle('btn-danger', isInWishlist(product._id));
    wishlistBtn.onclick = () => {
      toggleWishlist(product._id);
      wishlistBtn.classList.toggle('btn-outline');
      wishlistBtn.classList.toggle('btn-danger');
    };

    // Save to recently viewed
    addToRecentlyViewed(product);

    // Related products
    if (relatedGrid && result.relatedProducts) {
      if (result.relatedProducts.length > 0) {
        relatedGrid.innerHTML = result.relatedProducts.map(createProductCard).join('');

        relatedGrid.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
          btn.addEventListener('click', async () => {
            try {
              const r = await API.getProductById(btn.dataset.id);
              if (r.success) {
                Cart.addItem(r.data, 1);
                showToast('Added to cart! 🛒', 'success');
              }
            } catch (err) {
              showToast('Error', 'error');
            }
          });
        });
      } else {
        relatedGrid.innerHTML = '<p style="color:var(--text-muted);">No related products found</p>';
      }
    }
  } catch (error) {
    loading.style.display = 'none';
    content.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;">
        <div style="font-size:4rem;margin-bottom:15px;">😕</div>
        <h2>Product Not Found</h2>
        <p style="color:var(--text-muted);margin-bottom:20px;">${error.message}</p>
        <a href="/products" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Back to Products</a>
      </div>
    `;
  }
}

/**
 * Recently Viewed (localStorage)
 */
function addToRecentlyViewed(product) {
  try {
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    viewed = viewed.filter((id) => id !== product._id);
    viewed.unshift(product._id);
    if (viewed.length > 8) viewed = viewed.slice(0, 8);
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
  } catch (e) {
    // ignore
  }
}

// ========================================
// CHECKOUT PAGE
// ========================================

/**
 * Initialize checkout page
 */
function initCheckout() {
  const placeOrderBtn = document.getElementById('placeOrderBtn');
  if (!placeOrderBtn) return;

  const cartItems = Cart.getItems();
  const totals = Cart.getTotals();

  // Check if cart is empty
  if (cartItems.length === 0) {
    document.querySelector('.checkout-form').innerHTML = `
      <div style="text-align:center;padding:40px;">
        <div style="font-size:3rem;margin-bottom:15px;opacity:0.3;">🛒</div>
        <h2>Your cart is empty</h2>
        <p style="color:var(--text-muted);margin-bottom:20px;">Add some products before checkout</p>
        <a href="/products" class="btn btn-primary"><i class="fas fa-store"></i> Browse Products</a>
      </div>
    `;
    document.querySelector('.checkout-summary').innerHTML = '<p style="color:var(--text-muted);">Add items to your cart first</p>';
    return;
  }

  // Render checkout items
  const checkoutItems = document.getElementById('checkoutItems');
  if (checkoutItems) {
    checkoutItems.innerHTML = cartItems
      .map(
        (item) => `
      <div class="checkout-item">
        <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/60?text=P'">
        <div class="checkout-item-info">
          <h4>${item.title}</h4>
          <p>Qty: ${item.quantity} × ₹${Number(item.price).toFixed(2)}</p>
        </div>
        <p style="font-weight:600;">₹${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    `
      )
      .join('');
  }

  // Update totals
  document.getElementById('checkoutSubtotal').textContent = `₹${totals.subtotal.toFixed(2)}`;
  document.getElementById('checkoutDelivery').textContent = totals.deliveryCharge === 0 ? 'FREE' : `₹${totals.deliveryCharge.toFixed(2)}`;
  document.getElementById('checkoutTax').textContent = `₹${totals.tax.toFixed(2)}`;
  document.getElementById('checkoutTotal').textContent = `₹${totals.total.toFixed(2)}`;

  // Payment method selection
  document.querySelectorAll('.payment-method').forEach((method) => {
    method.addEventListener('click', () => {
      document.querySelectorAll('.payment-method').forEach((m) => m.classList.remove('selected'));
      method.classList.add('selected');
      method.querySelector('input[type="radio"]').checked = true;
    });
  });

  // Place order
  placeOrderBtn.addEventListener('click', placeOrder);
}

/**
 * Place an order
 */
async function placeOrder() {
  const btn = document.getElementById('placeOrderBtn');

  // Check auth
  if (!Auth.isLoggedIn()) {
    showToast('Please login to place an order', 'error');
    setTimeout(() => (window.location.href = '/login'), 1500);
    return;
  }

  // Get form values
  const customerName = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  const city = document.getElementById('city').value.trim();
  const state = document.getElementById('state').value.trim();
  const pincode = document.getElementById('pincode').value.trim();

  // Validate
  if (!customerName || !phone || !email || !address || !city || !state || !pincode) {
    showToast('Please fill in all shipping details', 'error');
    return;
  }

  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'Cash on Delivery';

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';

  try {
    const cartData = Cart.getCheckoutData();

    const orderData = {
      items: cartData.items.map((item) => ({
        productId: item.productId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      shippingAddress: {
        address,
        city,
        state,
        pincode,
        phone,
        email,
        name: customerName,
      },
      paymentMethod,
    };

    const result = await API.createOrder(orderData);

    if (result.success) {
      // Clear cart and coupon
      Cart.clear();
      localStorage.removeItem('coupon');

      // Save order data for success page
      sessionStorage.setItem(
        'lastOrder',
        JSON.stringify({
          orderId: result.data.orderId,
          estimatedDelivery: result.data.estimatedDelivery,
        })
      );

      showToast('Order placed successfully! 🎉', 'success');
      window.location.href = '/order-success';
    } else {
      throw new Error(result.message || 'Failed to place order');
    }
  } catch (error) {
    showToast(error.message || 'Error placing order', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Place Order';
  }
}

// ========================================
// PROFILE PAGE
// ========================================

/**
 * Load user profile and orders
 */
async function loadProfile() {
  const profileContent = document.getElementById('profileContent');
  const loginPrompt = document.getElementById('loginPrompt');

  if (!profileContent) return;

  if (!Auth.isLoggedIn()) {
    if (profileContent) profileContent.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'block';
    return;
  }

  if (loginPrompt) loginPrompt.style.display = 'none';
  if (profileContent) profileContent.style.display = 'block';

  try {
    // Load profile
    const profileResult = await API.getProfile();
    if (profileResult.success) {
      const user = profileResult.data;
      document.getElementById('profileName').textContent = user.name;
      document.getElementById('profileEmail').textContent = user.email;
      document.getElementById('detailName').textContent = user.name;
      document.getElementById('detailEmail').textContent = user.email;
      document.getElementById('detailJoined').textContent = new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    // Load orders
    loadOrders();
  } catch (error) {
    if (error.status === 401) {
      Auth.logout();
    }
    showToast('Error loading profile', 'error');
  }
}

/**
 * Load user orders
 */
async function loadOrders() {
  const ordersList = document.getElementById('ordersList');
  if (!ordersList) return;

  try {
    const result = await API.getUserOrders();

    if (!result.success || result.data.length === 0) {
      ordersList.innerHTML = `
        <div style="text-align:center;padding:40px;">
          <div style="font-size:3rem;margin-bottom:10px;opacity:0.3;">📦</div>
          <p style="color:var(--text-muted);">No orders yet. Start shopping!</p>
          <a href="/products" class="btn btn-primary" style="margin-top:15px;"><i class="fas fa-store"></i> Browse Products</a>
        </div>
      `;
      return;
    }

    ordersList.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${result.data
              .map(
                (order) => `
              <tr>
                <td><strong>${order.orderId || order._id.slice(-8).toUpperCase()}</strong></td>
                <td>${order.items.length} item(s)</td>
                <td>₹${order.totalPrice.toFixed(2)}</td>
                <td>${order.paymentMethod}</td>
                <td><span class="order-status ${order.status.toLowerCase()}">${order.status}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    ordersList.innerHTML = `<p style="color:var(--text-muted);text-align:center;">Error loading orders</p>`;
  }
}

/**
 * Initialize profile tabs
 */
function initProfileTabs() {
  const tabs = document.querySelectorAll('.profile-nav button[data-tab]');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;
      document.getElementById('ordersTab').style.display = tabName === 'orders' ? 'block' : 'none';
      document.getElementById('detailsTab').style.display = tabName === 'details' ? 'block' : 'none';
    });
  });
}

// ========================================
// ORDER SUCCESS PAGE
// ========================================

/**
 * Load order success data
 */
function loadOrderSuccess() {
  const orderIdEl = document.getElementById('successOrderId');
  const deliveryDateEl = document.getElementById('successDeliveryDate');

  if (!orderIdEl) return;

  try {
    const lastOrder = JSON.parse(sessionStorage.getItem('lastOrder'));

    if (lastOrder) {
      if (orderIdEl) orderIdEl.textContent = lastOrder.orderId;
      if (deliveryDateEl) {
        const date = new Date(lastOrder.estimatedDelivery);
        deliveryDateEl.textContent = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
    }
  } catch (e) {
    // Use defaults
  }
}

// ========================================
// ADMIN PANEL
// ========================================

/**
 * Initialize admin panel
 */
async function initAdminPanel() {
  const loginPrompt = document.getElementById('adminLoginPrompt');
  const adminContent = document.getElementById('adminContent');
  const adminWelcome = document.getElementById('adminWelcome');

  if (!adminContent) return;

  // Check admin access
  if (!Auth.isLoggedIn()) {
    if (loginPrompt) loginPrompt.style.display = 'block';
    if (adminContent) adminContent.style.display = 'none';
    return;
  }

  if (!Auth.isAdmin()) {
    if (loginPrompt) {
      loginPrompt.innerHTML = `
        <div style="font-size:4rem;margin-bottom:20px;">🚫</div>
        <h2>Access Denied</h2>
        <p style="color:var(--text-muted);margin-bottom:20px;">You need admin privileges to access this page.</p>
        <a href="/" class="btn btn-primary">Go Home</a>
      `;
      loginPrompt.style.display = 'block';
    }
    if (adminContent) adminContent.style.display = 'none';
    return;
  }

  // Show admin content
  if (loginPrompt) loginPrompt.style.display = 'none';
  if (adminContent) adminContent.style.display = 'block';

  const user = Auth.getUser();
  if (adminWelcome) adminWelcome.textContent = `Welcome, ${user.name || 'Admin'}`;

  // Admin tabs
  const tabs = document.querySelectorAll('.admin-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const tabName = tab.dataset.tab;
      document.getElementById('adminProductsTab').style.display = tabName === 'products' ? 'block' : 'none';
      document.getElementById('adminOrdersTab').style.display = tabName === 'orders' ? 'block' : 'none';
      document.getElementById('adminAddProductTab').style.display = tabName === 'add-product' ? 'block' : 'none';

      if (tabName === 'orders') loadAdminOrders();
      if (tabName === 'products') loadAdminProducts();
    });
  });

  // Load initial data
  await Promise.all([loadAdminProducts(), loadAdminOrders()]);
  initAddProductForm();
  initEditProductForm();
}

/**
 * Load admin products
 */
async function loadAdminProducts() {
  const tbody = document.getElementById('adminProductsBody');
  if (!tbody) return;

  try {
    const result = await API.getProducts({ limit: 100 });

    if (!result.success || result.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">No products found</td></tr>';
      return;
    }

    tbody.innerHTML = result.data
      .map(
        (product) => `
      <tr>
        <td><img src="${product.image || 'https://via.placeholder.com/50'}" alt="" onerror="this.src='https://via.placeholder.com/50?text=P'"></td>
        <td>${product.title}</td>
        <td>${product.category}</td>
        <td>₹${Number(product.price).toFixed(2)}</td>
        <td>${product.stock}</td>
        <td>${product.rating || 0} ⭐</td>
        <td>
          <button class="btn btn-small btn-primary" onclick="openEditModal('${product._id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-small btn-danger" onclick="deleteAdminProduct('${product._id}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `
      )
      .join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);">Error: ${error.message}</td></tr>`;
  }
}

/**
 * Delete product from admin
 */
async function deleteAdminProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const result = await API.deleteProduct(id);
    if (result.success) {
      showToast('Product deleted successfully', 'success');
      loadAdminProducts();
    }
  } catch (error) {
    showToast(error.message || 'Error deleting product', 'error');
  }
}

/**
 * Open edit modal
 */
async function openEditModal(id) {
  const modal = document.getElementById('editModal');
  if (!modal) return;

  modal.classList.add('active');

  try {
    const result = await API.getProductById(id);
    if (result.success) {
      const p = result.data;
      document.getElementById('editProdId').value = p._id;
      document.getElementById('editTitle').value = p.title;
      document.getElementById('editDescription').value = p.description;
      document.getElementById('editCategory').value = p.category;
      document.getElementById('editPrice').value = p.price;
      document.getElementById('editStock').value = p.stock;
      document.getElementById('editRating').value = p.rating;
      document.getElementById('editImage').value = p.image || '';
    }
  } catch (error) {
    showToast('Error loading product', 'error');
    modal.classList.remove('active');
  }
}

/**
 * Initialize edit product form
 */
function initEditProductForm() {
  const form = document.getElementById('editProductForm');
  const modal = document.getElementById('editModal');
  const closeBtn = document.getElementById('closeEditModal');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editProdId').value;
    const data = {
      title: document.getElementById('editTitle').value,
      description: document.getElementById('editDescription').value,
      category: document.getElementById('editCategory').value,
      price: parseFloat(document.getElementById('editPrice').value),
      stock: parseInt(document.getElementById('editStock').value),
      rating: parseFloat(document.getElementById('editRating').value),
      image: document.getElementById('editImage').value || undefined,
    };

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';

    try {
      const result = await API.updateProduct(id, data);
      if (result.success) {
        showToast('Product updated successfully', 'success');
        modal.classList.remove('active');
        loadAdminProducts();
      }
    } catch (error) {
      showToast(error.message || 'Error updating product', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Update Product';
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

/**
 * Initialize add product form
 */
function initAddProductForm() {
  const form = document.getElementById('addProductForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      title: document.getElementById('prodTitle').value,
      description: document.getElementById('prodDescription').value,
      category: document.getElementById('prodCategory').value,
      price: parseFloat(document.getElementById('prodPrice').value),
      stock: parseInt(document.getElementById('prodStock').value) || 0,
      rating: parseFloat(document.getElementById('prodRating').value) || 0,
      featured: document.getElementById('prodFeatured')?.checked || false,
      image: document.getElementById('prodImage').value || undefined,
    };

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    try {
      const result = await API.createProduct(data);
      if (result.success) {
        showToast('Product added successfully!', 'success');
        form.reset();
        loadAdminProducts();
      }
    } catch (error) {
      showToast(error.message || 'Error adding product', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-plus"></i> Add Product';
    }
  });
}

/**
 * Load admin orders
 */
async function loadAdminOrders() {
  const tbody = document.getElementById('adminOrdersBody');
  if (!tbody) return;

  try {
    const result = await API.getAllOrders();

    if (!result.success || result.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">No orders found</td></tr>';
      return;
    }

    tbody.innerHTML = result.data
      .map(
        (order) => `
      <tr>
        <td><strong>${order.orderId || order._id.slice(-8).toUpperCase()}</strong></td>
        <td>${order.user ? order.user.name || order.user.email : 'Unknown'}</td>
        <td>${order.items.length}</td>
        <td>₹${order.totalPrice.toFixed(2)}</td>
        <td>${order.paymentMethod}</td>
        <td>
          <select class="status-select" onchange="updateOrderStatus('${order._id}', this.value)">
            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
      </tr>
    `
      )
      .join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);">Error: ${error.message}</td></tr>`;
  }
}

/**
 * Update order status from admin
 */
async function updateOrderStatus(orderId, status) {
  try {
    const result = await API.updateOrderStatus(orderId, status);
    if (result.success) {
      showToast(`Order status updated to "${status}"`, 'success');
    }
  } catch (error) {
    showToast(error.message || 'Error updating status', 'error');
    loadAdminOrders(); // Reload to reset select
  }
}

// ========================================
// SEARCH SUGGESTIONS
// ========================================

/**
 * Initialize search suggestions
 */
function initSearchSuggestions() {
  const searchInput = document.getElementById('searchInput');
  const suggestions = document.getElementById('searchSuggestions');

  if (!searchInput || !suggestions) return;

  // Handle search on all pages with search input
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        suggestions.classList.remove('active');

        // Navigate based on current page
        if (window.location.pathname.includes('products')) {
          const filterSearch = document.getElementById('filterSearch');
          if (filterSearch) {
            filterSearch.value = query;
            currentFilters.search = query;
            currentFilters.page = 1;
            loadProducts();
          }
        } else {
          window.location.href = `/products?search=${encodeURIComponent(query)}`;
        }
      }
    }
  });

  // Live suggestions
  searchInput.addEventListener(
    'input',
    debounce(async (e) => {
      const query = e.target.value.trim();

      if (query.length < 2) {
        suggestions.classList.remove('active');
        return;
      }

      try {
        const result = await API.getSuggestions(query);

        if (result.success && result.data.length > 0) {
          suggestions.innerHTML = result.data
            .map(
              (p) => `
            <div class="search-suggestion-item" onclick="window.location.href='/product?id=${p._id}'">
              <div class="suggestion-info">
                <h4>${p.title}</h4>
                <span>${p.category || 'Product'}</span>
              </div>
            </div>
          `
            )
            .join('');
          suggestions.classList.add('active');
        } else {
          suggestions.innerHTML = `
            <div class="search-suggestion-item" style="cursor:default;">
              <div class="suggestion-info">
                <h4>No products found</h4>
              </div>
            </div>
          `;
          suggestions.classList.add('active');
        }
      } catch (error) {
        suggestions.classList.remove('active');
      }
    }, 400)
  );

  // Close suggestions on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.classList.remove('active');
    }
  });
}

// ========================================
// NAVIGATION & UI
// ========================================

/**
 * Initialize navbar and UI elements
 */
function initUI() {
  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navbarLinks');

  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon(next);
    });
  }

  // Back to top
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Mobile filter toggle
  const filterToggle = document.getElementById('mobileFilterToggle');
  const sidebar = document.getElementById('filtersSidebar');
  if (filterToggle && sidebar) {
    filterToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Cart coupon
  const applyCoupon = document.getElementById('applyCouponBtn');
  if (applyCoupon) {
    applyCoupon.addEventListener('click', () => {
      const code = document.getElementById('couponInput').value.trim();
      if (code) {
        Cart.applyCoupon(code);
      } else {
        showToast('Please enter a coupon code', 'warning');
      }
    });
  }
}

/**
 * Update theme icon
 */
function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ========================================
// PARSE URL PARAMS FOR FILTERED NAVIGATION
// ========================================

/**
 * Parse URL query parameters and apply as filters
 */
function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search');
  const category = params.get('category');

  if (search) {
    currentFilters.search = search;
    const filterSearch = document.getElementById('filterSearch');
    if (filterSearch) filterSearch.value = search;

    // Also set the global search input
    const globalSearch = document.getElementById('searchInput');
    if (globalSearch) globalSearch.value = search;
  }

  if (category) {
    currentFilters.category = category;
  }
}

// ========================================
// PAGE-SPECIFIC INITIALIZATION
// ========================================

/**
 * Initialize based on current page
 */
function initPage() {
  const path = window.location.pathname;

  // Update auth UI
  Auth.init();

  // Init search suggestions (all pages)
  initSearchSuggestions();

  // Init UI (all pages)
  initUI();

  // Page-specific
  if (path === '/' || path === '/index.html') {
    loadFeaturedProducts();
    loadNewArrivals();
    loadCategories();
  } else if (path === '/products' || path === '/products.html') {
    applyUrlFilters();
    initProductFilters();
    loadProducts();
  } else if (path === '/product' || path === '/product.html') {
    loadProductDetail();
  } else if (path === '/cart' || path === '/cart.html') {
    Cart.renderCartPage();
  } else if (path === '/checkout' || path === '/checkout.html') {
    initCheckout();
  } else if (path === '/profile' || path === '/profile.html') {
    initProfileTabs();
    loadProfile();
  } else if (path === '/admin' || path === '/admin.html') {
    initAdminPanel();
  } else if (path === '/order-success' || path === '/order-success.html') {
    loadOrderSuccess();
  } else if (path === '/wishlist' || path === '/wishlist.html') {
    renderWishlist();
  }
}

// ========================================
// START APPLICATION
// ========================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', initPage);
