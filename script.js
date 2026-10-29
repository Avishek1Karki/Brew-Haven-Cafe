/**
 * Brew Haven Café — Himalayan Roastery & Bakery
 * Shared Vanilla JavaScript (First-Year IT College Assignment)
 * 
 * Features:
 * 1. Persistent Shopping Cart (localStorage)
 * 2. Real-time Quantity and Grand Total Calculation in NPR
 * 3. Menu Category Filtering (All, Coffee, Drinks, Bakery) & Search
 * 4. Responsive Mobile Navigation Toggle
 * 5. Dynamic Cart Badge Counter on All Pages
 * 6. Contact Form Validation and Async Success Feedback
 * 7. Toast Notification Feedback System
 * 8. Simulated Checkout Modal
 */

// =============================================================================
// 1. DATA MODEL & INITIALIZATION
// =============================================================================

// Product Catalog (Nepalese Rupees - Rs.)
const PRODUCTS_DATA = [
  {
    id: "espresso",
    name: "Espresso",
    category: "coffee",
    price: 150,
    desc: "Single-origin Himalayan Arabica extracted with thick golden crema and dark cocoa finish.",
    image: "images/espresso.jpg",
    badge: "Specialty Roast"
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    category: "coffee",
    price: 220,
    desc: "Equal parts espresso, velvety steamed milk, and silky microfoam dusted with cocoa powder.",
    image: "images/cappuccino.jpg",
    badge: "House Favorite"
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    category: "coffee",
    price: 280,
    desc: "Chilled espresso poured over crystal ice and fresh organic dairy, refreshing and smooth.",
    image: "images/iced-latte.jpg",
    badge: "Chilled"
  },
  {
    id: "milk-tea",
    name: "Milk Tea",
    category: "drinks",
    price: 100,
    desc: "Traditional slow-brewed Himalayan tea leaves simmered with fragrant spices and creamy milk.",
    image: "images/milk-tea.jpg",
    badge: "Traditional"
  },
  {
    id: "lemon-tea",
    name: "Lemon Iced Tea",
    category: "drinks",
    price: 160,
    desc: "Crisp hand-shaken black tea infused with fresh local lemon juice and wild mountain honey.",
    image: "images/lemon-tea.jpg",
    badge: "Refreshing"
  },
  {
    id: "croissant",
    name: "Chocolate Croissant",
    category: "bakery",
    price: 180,
    desc: "Flaky European butter pastry filled with molten Belgian dark chocolate batons.",
    image: "images/croissant.jpg",
    badge: "Fresh Baked"
  },
  {
    id: "muffin",
    name: "Blueberry Muffin",
    category: "bakery",
    price: 160,
    desc: "Tender, golden baked muffin loaded with plump Himalayan blueberries and sugar crust.",
    image: "images/muffin.jpg",
    badge: "Bakery Daily"
  },
  {
    id: "brownie",
    name: "Chocolate Brownie",
    category: "bakery",
    price: 190,
    desc: "Rich, dense fudge brownie with roasted walnuts and a decadent dark chocolate core.",
    image: "images/brownie.jpg",
    badge: "Best Seller"
  }
];

// LocalStorage Key
const CART_STORAGE_KEY = "brew_haven_cart_items";

// =============================================================================
// 2. SHOPPING CART ENGINE (Local Storage & State)
// =============================================================================

/**
 * Retrieve current cart from localStorage safely
 * @returns {Array} Array of cart items: { id, name, price, image, quantity }
 */
function getCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading cart from localStorage:", error);
    return [];
  }
}

/**
 * Save cart to localStorage and trigger UI updates
 * @param {Array} cart - Updated cart items array
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
  updateCartBadge();
  renderCartSummary();
  renderDrawerCart();
}

/**
 * Add a product to cart by product ID
 * @param {string} productId 
 * @param {number} quantity 
 */
function addToCart(productId, quantity = 1) {
  const product = PRODUCTS_DATA.find(item => item.id === productId);
  if (!product) {
    console.warn("Product not found:", productId);
    return;
  }

  const cart = getCart();
  const existingItemIndex = cart.findIndex(item => item.id === productId);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    });
  }

  saveCart(cart);
  showToast(`Added ${product.name} to cart!`);
}

/**
 * Update quantity of a specific cart item
 * @param {string} productId 
 * @param {number} newQuantity 
 */
function updateCartItemQuantity(productId, newQuantity) {
  let cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === productId);

  if (itemIndex > -1) {
    if (newQuantity <= 0) {
      // Remove item if quantity is zero or negative
      const removedName = cart[itemIndex].name;
      cart.splice(itemIndex, 1);
      showToast(`Removed ${removedName} from cart.`);
    } else {
      cart[itemIndex].quantity = newQuantity;
    }
    saveCart(cart);
  }
}

/**
 * Remove an item completely from the cart
 * @param {string} productId 
 */
function removeFromCart(productId) {
  let cart = getCart();
  const itemIndex = cart.findIndex(item => item.id === productId);
  if (itemIndex > -1) {
    const removedName = cart[itemIndex].name;
    cart.splice(itemIndex, 1);
    saveCart(cart);
    showToast(`Removed ${removedName} from cart.`);
  }
}

/**
 * Empty the entire cart
 */
function clearCart() {
  if (confirm("Are you sure you want to empty your shopping cart?")) {
    saveCart([]);
    showToast("Shopping cart cleared.");
  }
}

/**
 * Calculate total number of items and grand total in NPR
 * @returns {Object} { totalItems, grandTotal }
 */
function calculateCartTotals() {
  const cart = getCart();
  let totalItems = 0;
  let grandTotal = 0;

  cart.forEach(item => {
    totalItems += item.quantity;
    grandTotal += item.price * item.quantity;
  });

  return { totalItems, grandTotal };
}

/**
 * Update the cart badge count in the header navigation
 */
function updateCartBadge() {
  const badges = document.querySelectorAll(".cart-badge");
  const { totalItems } = calculateCartTotals();

  badges.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? "inline-flex" : "none";
  });
}

// =============================================================================
// 3. UI RENDERING FUNCTIONS
// =============================================================================

/**
 * Render the full cart section on menu.html
 */
function renderCartSummary() {
  const cartContainer = document.getElementById("cart-content-container");
  if (!cartContainer) return; // Not on menu.html or container absent

  const cart = getCart();
  const { totalItems, grandTotal } = calculateCartTotals();

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart-view">
        <div class="empty-cart-icon">☕</div>
        <h4>Your Shopping Cart is Empty</h4>
        <p>Explore our handcrafted coffee, traditional teas, and fresh artisan pastries to add items to your tray.</p>
        <a href="#menu-grid" class="btn btn-secondary btn-sm">Explore Menu</a>
      </div>
    `;
    return;
  }

  // Render Cart Item Rows
  let itemsHtml = '<div class="cart-items-list">';
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    itemsHtml += `
      <div class="cart-item-row" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='images/espresso.jpg'">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="cart-item-unit-price">Rs. ${item.price} each</span>
        </div>
        <div class="cart-qty-controls">
          <button type="button" class="qty-btn btn-decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button type="button" class="qty-btn btn-increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>
        <div class="cart-item-total">
          Rs. ${itemTotal.toLocaleString()}
        </div>
        <button type="button" class="cart-remove-btn" data-id="${item.id}" title="Remove item" aria-label="Remove item">
          &times;
        </button>
      </div>
    `;
  });
  itemsHtml += '</div>';

  // Render Footer Breakdown
  const footerHtml = `
    <div class="cart-summary-footer">
      <div class="cart-calculation-rows">
        <div class="calc-row">
          <span>Total Selected Items:</span>
          <span><strong>${totalItems}</strong></span>
        </div>
        <div class="calc-row">
          <span>Subtotal:</span>
          <span>Rs. ${grandTotal.toLocaleString()}</span>
        </div>
        <div class="calc-row grand-total">
          <span>Grand Total:</span>
          <span>Rs. ${grandTotal.toLocaleString()}</span>
        </div>
      </div>
      <div class="cart-actions">
        <button type="button" class="btn btn-outline btn-clear-action" id="btn-clear-cart">Clear Cart</button>
        <button type="button" class="btn btn-primary" id="btn-checkout">Proceed to Order</button>
      </div>
    </div>
  `;

  cartContainer.innerHTML = itemsHtml + footerHtml;

  // Attach dynamic event listeners inside cart
  attachCartEventListeners(cartContainer);
}

/**
 * Render the global slide-over drawer cart (accessible from any page)
 */
function renderDrawerCart() {
  const drawerBody = document.getElementById("drawer-cart-items");
  const drawerTotal = document.getElementById("drawer-cart-total");
  const drawerCheckoutBtn = document.getElementById("drawer-btn-checkout");
  if (!drawerBody) return;

  const cart = getCart();
  const { totalItems, grandTotal } = calculateCartTotals();

  if (cart.length === 0) {
    drawerBody.innerHTML = `
      <div class="empty-cart-view" style="padding: 2rem 0;">
        <div class="empty-cart-icon" style="font-size: 2.5rem;">☕</div>
        <h4 style="font-size: 1.15rem;">Your Cart is Empty</h4>
        <p style="font-size: 0.85rem;">Select from our Himalayan roasts & bakery!</p>
        <a href="menu.html" class="btn btn-secondary btn-sm" style="margin-top: 0.5rem;">View Menu</a>
      </div>
    `;
    if (drawerTotal) drawerTotal.textContent = "Rs. 0";
    if (drawerCheckoutBtn) drawerCheckoutBtn.disabled = true;
    return;
  }

  let html = '<div class="cart-items-list" style="margin-bottom: 0;">';
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    html += `
      <div class="cart-item-row" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='images/espresso.jpg'">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="cart-item-unit-price">Rs. ${item.price}</span>
        </div>
        <div class="cart-qty-controls">
          <button type="button" class="qty-btn btn-decrease" data-id="${item.id}">−</button>
          <span class="qty-display">${item.quantity}</span>
          <button type="button" class="qty-btn btn-increase" data-id="${item.id}">+</button>
        </div>
        <div class="cart-item-total">
          Rs. ${itemTotal.toLocaleString()}
        </div>
        <button type="button" class="cart-remove-btn" data-id="${item.id}" title="Remove">&times;</button>
      </div>
    `;
  });
  html += '</div>';

  drawerBody.innerHTML = html;
  if (drawerTotal) drawerTotal.textContent = `Rs. ${grandTotal.toLocaleString()}`;
  if (drawerCheckoutBtn) drawerCheckoutBtn.disabled = false;

  attachCartEventListeners(drawerBody);
}

/**
 * Attach click handlers for quantity buttons and remove buttons inside a container
 * @param {HTMLElement} container 
 */
function attachCartEventListeners(container) {
  // Quantity Increase
  container.querySelectorAll(".btn-increase").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if (item) updateCartItemQuantity(id, item.quantity + 1);
    });
  });

  // Quantity Decrease
  container.querySelectorAll(".btn-decrease").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if (item) updateCartItemQuantity(id, item.quantity - 1);
    });
  });

  // Remove Item
  container.querySelectorAll(".cart-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      removeFromCart(id);
    });
  });

  // Clear Cart Button (on menu page)
  const clearBtn = container.querySelector("#btn-clear-cart");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearCart);
  }

  // Checkout Button (on menu page)
  const checkoutBtn = container.querySelector("#btn-checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", showCheckoutModal);
  }
}

// =============================================================================
// 4. MENU CATEGORY FILTERING & SEARCH (menu.html)
// =============================================================================

function setupMenuFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const productCards = document.querySelectorAll(".product-card");
  const searchInput = document.getElementById("menu-search");

  if (!filterButtons.length || !productCards.length) return;

  let activeCategory = "all";
  let searchQuery = "";

  function applyFilter() {
    let visibleCount = 0;

    productCards.forEach(card => {
      const itemCategory = card.getAttribute("data-category") || "";
      const itemName = (card.getAttribute("data-name") || "").toLowerCase();
      const itemDesc = (card.getAttribute("data-desc") || "").toLowerCase();

      const matchesCategory = activeCategory === "all" || itemCategory === activeCategory;
      const matchesSearch = !searchQuery || itemName.includes(searchQuery) || itemDesc.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = "flex";
        visibleCount++;
      } else {
        card.style.display = "none";
      }
    });

    const noResultsMsg = document.getElementById("no-results-msg");
    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
    }
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-filter") || "all";
      applyFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      applyFilter();
    });
  }
}

// =============================================================================
// 5. CONTACT FORM VALIDATION & INTERACTION (contact.html)
// =============================================================================

function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const nameInput = document.getElementById("contact-name");
  const emailInput = document.getElementById("contact-email");
  const subjectInput = document.getElementById("contact-subject");
  const messageInput = document.getElementById("contact-message");
  const successAlert = document.getElementById("contact-success-alert");
  const submitBtn = document.getElementById("contact-submit-btn");

  // Helper validation functions
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function setError(inputElement, errorElementId, message) {
    inputElement.classList.add("has-error");
    const errorEl = document.getElementById(errorElementId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    }
  }

  function clearError(inputElement, errorElementId) {
    inputElement.classList.remove("has-error");
    const errorEl = document.getElementById(errorElementId);
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("visible");
    }
  }

  // Real-time input cleaning
  [nameInput, emailInput, messageInput].forEach(field => {
    if (field) {
      field.addEventListener("input", () => {
        field.classList.remove("has-error");
        const errEl = document.getElementById(field.id + "-error");
        if (errEl) errEl.classList.remove("visible");
      });
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let isValid = true;

    // Validate Name
    const nameVal = nameInput ? nameInput.value.trim() : "";
    if (!nameVal) {
      setError(nameInput, "contact-name-error", "Please provide your full name.");
      isValid = false;
    } else if (nameVal.length < 2) {
      setError(nameInput, "contact-name-error", "Name must be at least 2 characters.");
      isValid = false;
    } else {
      clearError(nameInput, "contact-name-error");
    }

    // Validate Email
    const emailVal = emailInput ? emailInput.value.trim() : "";
    if (!emailVal) {
      setError(emailInput, "contact-email-error", "Please enter your email address.");
      isValid = false;
    } else if (!validateEmail(emailVal)) {
      setError(emailInput, "contact-email-error", "Please provide a valid email format (e.g., name@domain.com).");
      isValid = false;
    } else {
      clearError(emailInput, "contact-email-error");
    }

    // Validate Message
    const messageVal = messageInput ? messageInput.value.trim() : "";
    if (!messageVal) {
      setError(messageInput, "contact-message-error", "Please write a brief message for our team.");
      isValid = false;
    } else if (messageVal.length < 10) {
      setError(messageInput, "contact-message-error", "Message must be at least 10 characters long.");
      isValid = false;
    } else {
      clearError(messageInput, "contact-message-error");
    }

    if (!isValid) return;

    // Simulate safe successful form submission
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending Message...";
    }

    setTimeout(() => {
      if (successAlert) {
        successAlert.innerHTML = `
          <h4>Thank you, ${escapeHtml(nameVal)}!</h4>
          <p>Your message has been received in our demonstration system. We will get back to you at <strong>${escapeHtml(emailVal)}</strong>.</p>
        `;
        successAlert.classList.add("visible");
        successAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      showToast("Message sent successfully!");
      form.reset();

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      }
    }, 600);
  });
}

/**
 * Safe DOM string sanitizer to prevent any XSS
 * @param {string} str 
 * @returns {string} sanitized string
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// =============================================================================
// 6. TOAST NOTIFICATIONS & FEEDBACK
// =============================================================================

function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>✓</span> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 2800);
}

// =============================================================================
// 7. CHECKOUT MODAL (Demonstration Order)
// =============================================================================

function showCheckoutModal() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast("Your cart is empty! Please add items first.");
    return;
  }

  const { totalItems, grandTotal } = calculateCartTotals();

  let modalOverlay = document.getElementById("checkout-modal-overlay");
  if (!modalOverlay) {
    modalOverlay = document.createElement("div");
    modalOverlay.id = "checkout-modal-overlay";
    modalOverlay.className = "checkout-modal-overlay";
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="modal-order-title">
      <div class="checkout-modal-icon">☕</div>
      <h3 id="modal-order-title">Brew Haven Order Placed!</h3>
      <p>Namaste! Your order for <strong>${totalItems}</strong> item(s) has been simulated successfully for our Jhamsikhel café.</p>
      
      <div class="checkout-summary-box">
        <div style="display:flex; justify-content:space-between; margin-bottom: 0.4rem; font-size: 0.9rem;">
          <span>Order Type:</span>
          <strong>Café Dine-In / Takeaway</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 0.4rem; font-size: 0.9rem;">
          <span>Currency:</span>
          <strong>Nepalese Rupees (NPR)</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size: 1.1rem; font-weight:700; color:var(--color-primary); border-top: 1px solid var(--color-outline); padding-top: 0.5rem; margin-top: 0.5rem;">
          <span>Total Paid (Demo):</span>
          <span>Rs. ${grandTotal.toLocaleString()}</span>
        </div>
      </div>

      <p style="font-size: 0.8rem; color: var(--color-text-light); margin-bottom: 1.5rem;">
        * This is a first-year college assignment demonstration. No real financial transaction has occurred.
      </p>

      <button type="button" class="btn btn-primary" id="btn-close-checkout-modal" style="width: 100%;">
        Done &amp; Reset Cart
      </button>
    </div>
  `;

  modalOverlay.classList.add("is-open");

  document.getElementById("btn-close-checkout-modal").addEventListener("click", () => {
    modalOverlay.classList.remove("is-open");
    // Clear cart after checkout
    saveCart([]);
    showToast("Thank you for visiting Brew Haven Café!");
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove("is-open");
    }
  });
}

// =============================================================================
// 8. MOBILE MENU & SLIDE-OVER DRAWER LOGIC
// =============================================================================

function setupNavigation() {
  const toggleBtn = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("is-active");
      if (isOpen) {
        navMenu.classList.remove("is-active");
        toggleBtn.classList.remove("is-active");
        toggleBtn.setAttribute("aria-expanded", "false");
      } else {
        navMenu.classList.add("is-active");
        toggleBtn.classList.add("is-active");
        toggleBtn.setAttribute("aria-expanded", "true");
      }
    });

    // Close mobile menu on clicking any link
    navMenu.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-active");
        toggleBtn.classList.remove("is-active");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Slide-over cart drawer triggers
  const cartTriggers = document.querySelectorAll(".cart-trigger-btn");
  const drawerOverlay = document.getElementById("cart-drawer-overlay");
  const drawer = document.getElementById("cart-drawer");
  const drawerCloseBtn = document.getElementById("drawer-close-btn");
  const drawerCheckoutBtn = document.getElementById("drawer-btn-checkout");

  if (cartTriggers.length && drawer && drawerOverlay) {
    cartTriggers.forEach(btn => {
      btn.addEventListener("click", (e) => {
        // If already on menu.html and cart section exists, optionally scroll to it
        const onMenuPage = window.location.pathname.endsWith("menu.html");
        if (onMenuPage) {
          const cartSection = document.getElementById("cart-section");
          if (cartSection) {
            cartSection.scrollIntoView({ behavior: "smooth" });
            return;
          }
        }
        // Otherwise open the universal slide drawer
        e.preventDefault();
        drawer.classList.add("is-open");
        drawerOverlay.classList.add("is-open");
        renderDrawerCart();
      });
    });

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener("click", () => {
        drawer.classList.remove("is-open");
        drawerOverlay.classList.remove("is-open");
      });
    }

    drawerOverlay.addEventListener("click", (e) => {
      if (e.target === drawerOverlay) {
        drawer.classList.remove("is-open");
        drawerOverlay.classList.remove("is-open");
      }
    });

    if (drawerCheckoutBtn) {
      drawerCheckoutBtn.addEventListener("click", () => {
        drawer.classList.remove("is-open");
        drawerOverlay.classList.remove("is-open");
        showCheckoutModal();
      });
    }
  }

  // Setup 'Add to Cart' buttons in product cards
  document.querySelectorAll(".btn-add-cart").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = btn.getAttribute("data-id");
      if (productId) {
        addToCart(productId, 1);
      }
    });
  });
}

// =============================================================================
// 9. DOM CONTENT LOADED EVENT
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Update badge count immediately
  updateCartBadge();

  // Setup header navigation & mobile toggle
  setupNavigation();

  // Render cart summary if on menu.html
  renderCartSummary();

  // Render drawer cart
  renderDrawerCart();

  // Setup category filters on menu.html
  setupMenuFilters();

  // Setup contact form on contact.html
  setupContactForm();
});
