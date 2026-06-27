const products = [
  { id: 1, name: "Transit Daypack", category: "Bags", price: 78, rating: 4.8, code: "B1" },
  { id: 2, name: "Field Jacket", category: "Apparel", price: 132, rating: 4.7, code: "A1" },
  { id: 3, name: "Apex Watch", category: "Accessories", price: 214, rating: 4.9, code: "X1" },
  { id: 4, name: "Canvas Tote", category: "Bags", price: 46, rating: 4.5, code: "B2" },
  { id: 5, name: "Ridge Hoodie", category: "Apparel", price: 84, rating: 4.6, code: "A2" },
  { id: 6, name: "Trail Bottle", category: "Accessories", price: 32, rating: 4.4, code: "X2" },
  { id: 7, name: "Merino Beanie", category: "Apparel", price: 28, rating: 4.3, code: "A3" },
  { id: 8, name: "Weekend Duffle", category: "Bags", price: 118, rating: 4.8, code: "B3" }
];

const state = {
  category: "All",
  search: "",
  sort: "featured",
  cart: [],
  wishlist: [],
  showWishlistOnly: false
};

const productGrid = document.querySelector("#productGrid");
const categoryFilters = document.querySelector("#categoryFilters");
const productCount = document.querySelector("#productCount");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const clearFilters = document.querySelector("#clearFilters");
const wishlistButton = document.querySelector("#wishlistButton");
const wishlistCount = document.querySelector("#wishlistCount");
const cartButton = document.querySelector("#cartButton");
const closeCart = document.querySelector("#closeCart");
const cartPanel = document.querySelector("#cartPanel");
const overlay = document.querySelector("#overlay");
const cartCount = document.querySelector("#cartCount");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const statusMessage = document.querySelector("#statusMessage");

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function getCategories() {
  return ["All", ...new Set(products.map((product) => product.category))];
}

// Show short feedback to the user after cart or checkout actions.
function showStatus(message) {
  if (!statusMessage) return;

  statusMessage.textContent = message;
  statusMessage.classList.add("visible");

  window.clearTimeout(showStatus.timer);
  showStatus.timer = window.setTimeout(() => {
    statusMessage.textContent = "";
    statusMessage.classList.remove("visible");
  }, 2200);
}

function getVisibleProducts() {
  const query = state.search.trim().toLowerCase();

  return products
    .filter((product) => state.category === "All" || product.category === state.category)
    .filter((product) => !state.showWishlistOnly || state.wishlist.includes(product.id))
    .filter((product) => product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query))
    .sort((a, b) => {
      if (state.sort === "price-low") return a.price - b.price;
      if (state.sort === "price-high") return b.price - a.price;
      if (state.sort === "rating") return b.rating - a.rating;
      return a.id - b.id;
    });
}

function renderCategories() {
  categoryFilters.innerHTML = getCategories()
    .map((category) => {
      const active = category === state.category ? "active" : "";
      return `<button class="${active}" type="button" data-category="${category}">${category}</button>`;
    })
    .join("");
}

function renderWishlist() {
  wishlistCount.textContent = state.wishlist.length;
  wishlistButton.classList.toggle("active", state.showWishlistOnly);
}

function renderProducts() {
  const visibleProducts = getVisibleProducts();
  productCount.textContent = `${visibleProducts.length} item${visibleProducts.length === 1 ? "" : "s"}`;

  if (visibleProducts.length === 0) {
    productGrid.innerHTML = `<p class="empty-state">No products found.</p>`;
    return;
  }

  productGrid.innerHTML = visibleProducts
    .map((product) => {
      const saved = state.wishlist.includes(product.id);

      return `
        <article class="product-card ${saved ? "saved" : ""}">
          <div class="product-image" aria-hidden="true">${product.code}</div>
          <div class="product-body">
            <div class="product-meta">
              <span>${product.category}</span>
              <span>${product.rating} stars</span>
            </div>
            <h3>${product.name}</h3>
            <div class="product-row">
              <span class="price">${currency.format(product.price)}</span>
              <div class="product-actions">
                <button class="save-product ${saved ? "active" : ""}" type="button" data-save-id="${product.id}">
                  ${saved ? "Saved" : "Save"}
                </button>
                <button type="button" data-product-id="${product.id}">Add</button>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCart() {
  cartCount.textContent = state.cart.reduce((total, item) => total + item.quantity, 0);

  if (state.cart.length === 0) {
    cartItems.innerHTML = `<p class="empty-state">Your cart is empty.</p>`;
    cartTotal.textContent = currency.format(0);
    return;
  }

  cartItems.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <p><strong>${item.name}</strong></p>
            <small>${item.quantity} x ${currency.format(item.price)}</small>
          </div>
          <button type="button" data-remove-id="${item.id}" aria-label="Remove ${item.name}">x</button>
        </div>
      `
    )
    .join("");

  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = currency.format(total);
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  const existing = state.cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }

  renderCart();
  showStatus(`${product.name} added to cart`);
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  renderCart();
}

function toggleWishlist(productId) {
  if (state.wishlist.includes(productId)) {
    state.wishlist = state.wishlist.filter((id) => id !== productId);
  } else {
    state.wishlist.push(productId);
  }

  renderWishlist();
  renderProducts();
}

function setCartOpen(isOpen) {
  cartPanel.classList.toggle("open", isOpen);
  overlay.classList.toggle("open", isOpen);
  cartPanel.setAttribute("aria-hidden", String(!isOpen));
}

categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  state.category = button.dataset.category;
  renderCategories();
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const saveButton = event.target.closest("[data-save-id]");
  if (saveButton) {
    toggleWishlist(Number(saveButton.dataset.saveId));
    return;
  }

  const button = event.target.closest("[data-product-id]");
  if (!button) return;

  addToCart(Number(button.dataset.productId));
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-id]");
  if (!button) return;

  removeFromCart(Number(button.dataset.removeId));
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

clearFilters.addEventListener("click", () => {
  state.category = "All";
  state.search = "";
  state.sort = "featured";
  state.showWishlistOnly = false;
  searchInput.value = "";
  sortSelect.value = "featured";
  renderCategories();
  renderWishlist();
  renderProducts();
});

wishlistButton.addEventListener("click", () => {
  state.showWishlistOnly = !state.showWishlistOnly;
  renderWishlist();
  renderProducts();
});

const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.addEventListener("click", () => {
  if (state.cart.length === 0) {
    showStatus("Your cart is empty");
    return;
  }

  showStatus("Checkout is coming soon");
});

cartButton.addEventListener("click", () => setCartOpen(true));
closeCart.addEventListener("click", () => setCartOpen(false));
overlay.addEventListener("click", () => setCartOpen(false));

renderCategories();
renderWishlist();
renderProducts();
renderCart();
