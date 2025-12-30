// ==================== GLOBAL STATE ====================
let allProducts = [];
let filteredProducts = [];
let wishlist = [];
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let currentPage = 1;
const pageSize = 12;
let filterState = {
  category: 'all',
  brand: 'all',
  discount: 0,
  minPrice: 0,
  maxPrice: 10000,
  sort: 'default'
};
const API_BASE = "http://localhost:8083/api/mb/products";
const WISHLIST_API_BASE = "http://localhost:8083/api/wishlist";
const IMAGE_BASE = "http://localhost:8083";

// Dynamic user ID (exactly like ref code)
function getCurrentUserId() {
  try {
    const userData = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    if (!userData) return null;
    const user = JSON.parse(userData);
    const id = user.userId || user.id || user.userID;
    return id ? Number(id) : null;
  } catch (error) {
    console.error('Error reading currentUser:', error);
    return null;
  }
}

console.log("====getCurrentUserId function returns :", getCurrentUserId());
const CURRENT_USER_ID = getCurrentUserId(); // Exactly like ref code

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ==================== WISHLIST BACKEND SYNC (NOW EXACTLY LIKE REF) ====================
async function addToWishlistBackend(productId) {
  if (!CURRENT_USER_ID) {
    console.log("No user logged in – cannot add to backend wishlist");
    return false;
  }
  try {
    const response = await fetch(`${WISHLIST_API_BASE}/add-wishlist-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: CURRENT_USER_ID,
        productId: productId,
        productType: "MOTHER"
      })
    });
    if (response.ok) {
      console.log("Backend: Added to wishlist");
      return true;
    }
  } catch (err) {
    console.error("Error adding to wishlist backend:", err);
  }
  return false;
}

async function removeFromWishlistBackend(productId) {
  if (!CURRENT_USER_ID) {
    console.log("No user logged in – cannot remove from backend wishlist");
    return false;
  }
  try {
    const response = await fetch(`${WISHLIST_API_BASE}/remove-wishlist-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: CURRENT_USER_ID,
        productId: productId,
        productType: "MOTHER"
      })
    });
    if (response.ok) {
      console.log("Backend: Removed from wishlist");
      return true;
    }
  } catch (err) {
    console.error("Error removing from wishlist backend:", err);
  }
  return false;
}

async function loadWishlistFromBackend() {
  if (!CURRENT_USER_ID) {
    console.log("No user logged in, skipping wishlist load from backend");
    wishlist = [];
    updateHeaderCounts();
    renderProducts();
    return;
  }
  try {
    const response = await fetch(`${WISHLIST_API_BASE}/get-wishlist-items?userId=${CURRENT_USER_ID}`);
    if (response.ok) {
      const backendItems = await response.json();
      console.log("Loaded wishlist from backend:", backendItems.length, "items");
      wishlist = backendItems.map(item => ({
        id: item.productId || item.id
      }));
      updateHeaderCounts();
      renderProducts(); // Refresh heart icons
    } else {
      console.warn("Failed to load wishlist:", response.status);
      wishlist = [];
      updateHeaderCounts();
      renderProducts();
    }
  } catch (err) {
    console.error("Failed to load wishlist from backend:", err);
    wishlist = [];
    updateHeaderCounts();
    renderProducts();
  }
}

// ==================== LOAD PRODUCTS FROM BACKEND ====================
async function loadProductsBySubcategories() {
  console.log("Starting loadProductsBySubcategories...");
  const subcategories = [
    "Test Kits",
    "Skin Care",
    "Vitamins & Supplements",
    "Personal Care & Hygiene",
    "Trimester Kits",
    "Garbhsanskar Essentials & Ayurvedic Medicines",
    "Accessories & Maternity Wear",
    "Delivery Kits",
    "Post delivery recovery",
    "Breastfeeding Essentials",
    "Postpartum Hygiene",
    "Postpartum Nutrition",
    "Pain & Healing Support",
    "Uterine Health",
    "Menstruation Essentials and Hygiene",
    "PCOS and Preconception",
    "MenoPausal Medicines"
  ];
  try {
    const requests = subcategories.map(sub => {
      const url = `${API_BASE}/sub-category/${encodeURIComponent(sub)}`;
      return fetch(url)
        .then(res => res.ok ? res.json() : [])
        .catch(() => []);
    });
    const results = await Promise.all(requests);
    const productsFromApi = results.flat();
    allProducts = productsFromApi.map(p => ({
      id: p.id,
      title: p.title || "Untitled Product",
      price: p.price?.[0] || 999,
      originalPrice: p.originalPrice?.[0] || null,
      discount: p.discount || (p.originalPrice?.[0] && p.price?.[0]
        ? Math.round(((p.originalPrice[0] - p.price[0]) / p.originalPrice[0]) * 100)
        : 0),
      rating: p.rating || 4.5,
      brand: p.brand || "Premium Brand",
      category: p.category || "Mother Care",
      subcategory: p.subCategory || "",
      inStock: p.inStock !== false,
      mainImageUrl: `${IMAGE_BASE}/api/mb/products/${p.id}/image`,
      description: Array.isArray(p.description) ? p.description.join(". ") : (p.description || "No description available"),
      productType: "MOTHER"
    }));
    filteredProducts = [...allProducts];
    setText("resultsCount", `Showing ${filteredProducts.length} products`);
    renderProducts();
    await loadWishlistFromBackend();
  } catch (err) {
    console.error("FATAL ERROR in loadProductsBySubcategories:", err);
    setText("resultsCount", "Failed to load products");
  }
}

// ==================== UI & RENDERING ====================
function updateHeaderCounts() {
  console.log("Updating header counts...");
  const updateBadge = (id, count) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = count;
      el.classList.toggle("hidden", count === 0);
    }
  };
  const cartTotal = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  updateBadge("cartCount", cartTotal);
  updateBadge("wishlistCount", wishlist.length);
}

async function toggleWishlist(id) {
  console.log("Toggle wishlist for product ID:", id);
  const index = wishlist.findIndex(item => item.id === id);

  if (index === -1) {
    // Trying to add
    if (!CURRENT_USER_ID) {
      showToast("Please log in to add to wishlist");
      return;
    }
    const success = await addToWishlistBackend(id);
    if (success) {
      wishlist.push({ id });
      showToast("Added to wishlist");
    } else {
      showToast("Failed to add to wishlist");
      return;
    }
  } else {
    // Trying to remove
    const success = await removeFromWishlistBackend(id);
    if (success) {
      wishlist.splice(index, 1);
      showToast("Removed from wishlist");
    } else {
      showToast("Failed to remove from wishlist");
      return;
    }
  }

  updateHeaderCounts();
  renderProducts(); // Re-render to update all heart icons instantly
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.className = "fixed bottom-20 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full z-50 shadow-lg";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function createProductCard(p) {
  const inWishlist = wishlist.some(x => x.id === p.id);
  const isOutOfStock = !p.inStock;
  return `
    <div class="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100
                ${isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : ''}"
         ${!isOutOfStock ? `onclick="event.stopPropagation(); viewProductDetails(${p.id})"` : ''}
         style="${isOutOfStock ? 'pointer-events: none;' : ''}">
      <div class="relative bg-gray-50 aspect-[6/4] overflow-hidden">
        <img src="${p.mainImageUrl}" alt="${p.title}"
             class="w-full h-full object-contain p-5 transition-transform duration-500 ${!isOutOfStock ? 'group-hover:scale-110' : ''}"
             onerror="this.onerror=null; this.src='https://i.imgur.com/8Rm9x2J.png'">
        <div class="absolute top-2 left-2 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10
                    ${isOutOfStock ? 'bg-red-600' : 'bg-green-600'}">
          ${isOutOfStock ? 'Out of Stock' : 'In Stock'}
        </div>
        <button onclick="event.stopPropagation(); toggleWishlist(${p.id})"
                class="absolute top-2 right-2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center
                       ${isOutOfStock ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-10"
                ${isOutOfStock ? 'disabled' : ''}>
          <i class="${inWishlist ? 'fas fa-heart text-pink-600' : 'far fa-heart text-gray-600'} text-lg"></i>
        </button>
      </div>
      <div class="p-3">
        <p class="text-xs text-gray-500 uppercase font-medium truncate">${p.brand || 'Brand'}</p>
        <h3 class="text-sm font-medium text-gray-800 line-clamp-2 mt-1">${p.title}</h3>
        <div class="mt-2 flex items-center gap-2">
          <span class="text-lg font-bold text-gray-900">₹${p.price.toLocaleString()}</span>
          ${p.originalPrice > p.price ? `
            <span class="text-sm text-gray-500 line-through">₹${p.originalPrice.toLocaleString()}</span>
            <span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">${p.discount}% OFF</span>
          ` : ''}
        </div>
        <button onclick="event.stopPropagation(); viewProductDetails(${p.id})"
                class="mt-3 w-full font-medium text-sm py-2.5 rounded-lg transition
                        ${isOutOfStock ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#CD2C58] hover:bg-[#AB886D] text-white'}">
          ${isOutOfStock ? 'Out of Stock' : 'View Details'}
        </button>
      </div>
    </div>
  `;
}

function renderProducts() {
  const start = (currentPage - 1) * pageSize;
  const paginated = filteredProducts.slice(start, start + pageSize);
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  grid.innerHTML = paginated.length
    ? paginated.map(createProductCard).join("")
    : `<p class="col-span-full text-center text-gray-500 py-10">No products found</p>`;
  setText("resultsCount", `Showing ${filteredProducts.length} products`);
  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const container = document.getElementById("pagination");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-4 py-2 rounded border mx-1 ${i === currentPage ? 'bg-[#9A3F3F] text-white' : 'bg-white text-pink-600 border-pink-300'}`;
    btn.onclick = () => { currentPage = i; renderProducts(); };
    container.appendChild(btn);
  }
}

function applyFilters() {
  filteredProducts = allProducts.filter(p => {
    const catMatch = filterState.category === 'all' || p.subcategory === filterState.category;
    const brandMatch = filterState.brand === 'all' || p.brand === filterState.brand;
    const discMatch = p.discount >= filterState.discount;
    const priceMatch = p.price >= filterState.minPrice && p.price <= filterState.maxPrice;
    return catMatch && brandMatch && discMatch && priceMatch;
  });
  sortProducts(filterState.sort);
  currentPage = 1;
  renderProducts();
  saveFiltersToStorage();
}

function sortProducts(type) {
  switch (type) {
    case 'price-low': filteredProducts.sort((a, b) => a.price - b.price); break;
    case 'price-high': filteredProducts.sort((a, b) => b.price - a.price); break;
    case 'rating': filteredProducts.sort((a, b) => b.rating - a.rating); break;
    case 'newest': filteredProducts.sort((a, b) => b.id - a.id); break;
    default: break;
  }
}

function loadFiltersFromStorage() {
  try {
    const saved = localStorage.getItem('motherCareFilters');
    if (saved) {
      filterState = { ...filterState, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load filters", e);
  }
}

function saveFiltersToStorage() {
  localStorage.setItem('motherCareFilters', JSON.stringify(filterState));
}

function initPriceSliders() {
  const maxRange = 10000;
  const sliders = document.querySelectorAll(".price-slider-container");
  sliders.forEach(container => {
    const minThumb = container.querySelector('input[type="range"]:first-of-type');
    const maxThumb = container.querySelector('input[type="range"]:last-of-type');
    const fill = container.querySelector(".slider-fill");
    const minVal = container.querySelector("#minValue") || container.querySelector(".price-values span:first-child");
    const maxVal = container.querySelector("#maxValue") || container.querySelector(".price-values span:last-child");
    const update = (minP, maxP) => {
      const minPct = (minP / maxRange) * 100;
      const maxPct = (maxP / maxRange) * 100;
      if (fill) {
        fill.style.left = minPct + "%";
        fill.style.width = (maxPct - minPct) + "%";
      }
      minVal.textContent = `₹${minP.toLocaleString()}`;
      maxVal.textContent = `₹${maxP.toLocaleString()}`;
      filterState.minPrice = minP;
      filterState.maxPrice = maxP;
    };
    minThumb.addEventListener("input", () => {
      let val = parseInt(minThumb.value);
      if (val > parseInt(maxThumb.value)) val = parseInt(maxThumb.value);
      update(val, parseInt(maxThumb.value));
      applyFilters();
    });
    maxThumb.addEventListener("input", () => {
      let val = parseInt(maxThumb.value);
      if (val < parseInt(minThumb.value)) val = parseInt(minThumb.value);
      update(parseInt(minThumb.value), val);
      applyFilters();
    });
    update(filterState.minPrice, filterState.maxPrice);
  });
}

function initFiltersAndUI() {
  loadFiltersFromStorage();
  document.querySelectorAll('input[name="category"], input[name="brand"], input[name="discount"]').forEach(input => {
    if ((input.name === "category" && input.value === filterState.category) ||
        (input.name === "brand" && input.value === filterState.brand) ||
        (input.name === "discount" && parseInt(input.value) === filterState.discount)) {
      input.checked = true;
    }
    input.addEventListener('change', () => {
      if (input.name === "category") filterState.category = input.value;
      if (input.name === "brand") filterState.brand = input.value;
      if (input.name === "discount") filterState.discount = parseInt(input.value);
      applyFilters();
    });
  });
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.value = filterState.sort;
    sortSelect.addEventListener("change", (e) => {
      filterState.sort = e.target.value;
      sortProducts(filterState.sort);
      renderProducts();
      saveFiltersToStorage();
    });
  }
  document.getElementById("applyMobileFilters")?.addEventListener("click", () => {
    const cat = document.querySelector('#filterSheet input[name="category"]:checked')?.value || 'all';
    const brd = document.querySelector('#filterSheet input[name="brand"]:checked')?.value || 'all';
    const disc = parseInt(document.querySelector('#filterSheet input[name="discount"]:checked')?.value || 0);
    filterState.category = cat; filterState.brand = brd; filterState.discount = disc;
    applyFilters();
    document.getElementById("filterSheet").classList.add("translate-y-full");
    document.getElementById("mobileSheetBackdrop").classList.add("hidden");
  });
  document.getElementById("clearMobileFilters")?.addEventListener("click", () => {
    filterState = { category: 'all', brand: 'all', discount: 0, minPrice: 0, maxPrice: 10000, sort: 'default' };
    localStorage.removeItem("motherCareFilters");
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = (r.value === 'all' || r.value === '0'));
    if (sortSelect) sortSelect.value = 'default';
    initPriceSliders();
    applyFilters();
  });
  applyFilters();
}

function viewProductDetails(id) {
  localStorage.setItem("selectedProductId", id);
  window.location.href = "mother-product-details.html";
}

function initBanner() {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  let i = 0;
  const go = (n) => {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('active');
    dots[i].classList.add('active');
  };
  dots.forEach((d, idx) => d.onclick = () => go(idx));
  setInterval(() => go(i + 1), 5000);
}

function initMobileSheets() {
  const backdrop = document.getElementById("mobileSheetBackdrop");
  document.getElementById("openFilterSheet")?.addEventListener("click", () => {
    document.getElementById("filterSheet").classList.remove("translate-y-full");
    backdrop.classList.remove("hidden");
  });
  document.getElementById("openSortSheet")?.addEventListener("click", () => {
    document.getElementById("sortSheet").classList.remove("translate-y-full");
    backdrop.classList.remove("hidden");
  });
  document.querySelectorAll("#closeFilterSheet, #closeSortSheet, #mobileSheetBackdrop").forEach(el => {
    el?.addEventListener("click", () => {
      document.getElementById("filterSheet").classList.add("translate-y-full");
      document.getElementById("sortSheet").classList.add("translate-y-full");
      backdrop.classList.add("hidden");
    });
  });
}

// ==================== DOM CONTENT LOADED ====================
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded!");
  initBanner();
  initMobileSheets();
  initPriceSliders();
  initFiltersAndUI();
  updateHeaderCounts();
  loadProductsBySubcategories();
});