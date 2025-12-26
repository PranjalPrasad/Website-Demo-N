// ==================== wellness.js – WELLNESS ESSENTIALS PAGE ====================

const API_BASE_URL = 'http://localhost:8083/api/products';
const API_BASE_IMG_URL = 'http://localhost:8083';

const FALLBACK_IMAGE = '../Images/product_details_fallback_img.jpg';
const DEBUG_MODE = true;

// ==================== WELLNESS CATEGORIES ====================
const WELLNESS_CATEGORIES = [
  { id: 'all', name: 'All Wellness Products', backendSubcategories: [] },
  { 
    id: 'vitamins', 
    name: 'Vitamins & Supplements', 
    backendSubcategories: [
      'Vitamin', 'Supplement', 'Multivitamin', 'Vitamin C', 'Vitamin D',
      'Omega-3', 'Fish Oil', 'Calcium', 'Iron', 'Probiotic', 'Nutritional Supplement'
    ] 
  },
  { 
    id: 'hairskin', 
    name: 'Hair & Skin Care', 
    backendSubcategories: [
      'Hair Care', 'Skin Care', 'Hair Oil', 'Shampoo', 'Conditioner',
      'Face Cream', 'Serum', 'Moisturizer', 'Sunscreen', 'Face Wash',
      'Beauty', 'Cosmetic', 'Anti-aging'
    ] 
  },
  { 
    id: 'fitness', 
    name: 'Fitness & Weight Management', 
    backendSubcategories: [
      'Fitness', 'Weight', 'Protein', 'Whey', 'Weight Loss', 'Weight Gain',
      'Fitness Supplement', 'Sports Nutrition', 'Energy', 'Workout', 'Muscle', 'Exercise'
    ] 
  },
  { 
    id: 'immunity', 
    name: 'Immunity Boosters', 
    backendSubcategories: [
      'Immunity', 'Immune', 'Chyawanprash', 'Giloy', 'Tulsi', 'Ashwagandha',
      'Amritarishta', 'Ayurvedic Immunity', 'Herbal Immunity', 'Wellness Drink'
    ] 
  },
  { 
    id: 'senior', 
    name: 'Senior Care Products', 
    backendSubcategories: [
      'Senior Care', 'Elderly', 'Adult Diaper', 'BP Monitor', 'Glucose Monitor',
      'Walking Aid', 'Joint Care', 'Bone Health', 'Memory', 'Geriatric'
    ] 
  },
  { 
    id: 'oral', 
    name: 'Oral Care Essentials', 
    backendSubcategories: [
      'Oral Care', 'Toothpaste', 'Toothbrush', 'Mouthwash', 'Dental',
      'Oral Hygiene', 'Mouth Freshener', 'Tooth Powder', 'Dental Care'
    ] 
  },
  { 
    id: 'menstrual', 
    name: 'Menstrual Care Products', 
    backendSubcategories: [
      'Menstrual', 'Sanitary', 'Pad', 'Tampon', 'Menstrual Cup', 'Period',
      'Feminine Hygiene', 'Intimate Care', 'Women Care'
    ] 
  }
];

const categoryNames = {
  'all': { title: 'All Wellness Products', pageTitle: 'Wellness Essentials', description: 'Complete range of health and wellness products' },
  'vitamins': { title: 'Vitamins & Supplements', pageTitle: 'Vitamins & Supplements', description: 'Essential vitamins and supplements for daily health' },
  'hairskin': { title: 'Hair & Skin Care', pageTitle: 'Hair & Skin Care Essentials', description: 'Natural products for beautiful hair and glowing skin' },
  'fitness': { title: 'Fitness & Weight Management', pageTitle: 'Fitness & Weight Products', description: 'Supplements and gear for your fitness journey' },
  'immunity': { title: 'Immunity Boosters', pageTitle: 'Immunity Boosters', description: 'Strengthen your natural defenses' },
  'senior': { title: 'Senior Care Products', pageTitle: 'Senior Care Essentials', description: 'Specialized products for elderly wellness' },
  'oral': { title: 'Oral Care Essentials', pageTitle: 'Oral Care Products', description: 'For a healthy and bright smile' },
  'menstrual': { title: 'Menstrual Care Products', pageTitle: 'Menstrual Care Essentials', description: 'Comfort and care during menstrual cycle' }
};

// ==================== GLOBAL VARIABLES ====================
let allProducts = [];
let filteredProducts = [];
let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let currentPage = 1;
const pageSize = 12;

let filterState = {
  category: 'all',
  brand: 'all',
  discount: 0,
  minPrice: 0,
  maxPrice: 5000,
  sort: 'default'
};

// ==================== HELPER FUNCTIONS ====================
function debugLog(...args) {
  if (DEBUG_MODE) console.log('[WELLNESS DEBUG]', ...args);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showToast(msg, type = "success") {
  const existing = document.querySelector('.custom-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement("div");
  toast.className = `custom-toast fixed bottom-20 left-1/2 -translate-x-1/2 ${type === 'success' ? 'bg-green-500' : 'bg-blue-500'} text-white px-6 py-3 rounded-full z-50 shadow-lg`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Price & Image Helpers
function getLowestPrice(priceArray) {
  if (!Array.isArray(priceArray) || priceArray.length === 0) return null;
  const valid = priceArray.filter(p => typeof p === 'number' && p > 0);
  return valid.length > 0 ? Math.min(...valid) : null;
}

function getPriceInfo(priceArray, oldPriceArray = []) {
  const current = getLowestPrice(priceArray);
  const old = getLowestPrice(oldPriceArray);

  if (current === null) {
    return { priceText: "Price on request", discount: 0, showMRP: false, numericPrice: 0 };
  }

  const priceText = priceArray.length > 1 ? `₹${current}` : `₹${current.toLocaleString()}`;
  const discount = old && old > current ? Math.round(((old - current) / old) * 100) : 0;

  return {
    priceText,
    mrp: old,
    discount,
    showMRP: old && old > current,
    numericPrice: current
  };
}

function getImageUrl(path) {
  if (!path) return FALLBACK_IMAGE;
  if (path.startsWith('http') || path.startsWith('data:image')) return path;
  return `${API_BASE_IMG_URL}${path}`;
}

// ==================== SKELETON LOADER ====================
function showSkeletonLoader() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  let skeletonCards = '';
  for (let i = 0; i < 12; i++) {
    skeletonCards += `
      <div class="group relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-pulse">
        <div class="relative bg-gray-200 aspect-[6/4] overflow-hidden">
          <div class="w-full h-full bg-gray-300"></div>
        </div>
        <div class="p-3 space-y-3">
          <div class="h-4 bg-gray-300 rounded w-24"></div>
          <div class="h-5 bg-gray-300 rounded w-full"></div>
          <div class="h-4 bg-gray-300 rounded w-32"></div>
          <div class="h-6 bg-gray-300 rounded w-28"></div>
          <div class="h-8 bg-gray-300 rounded mt-4"></div>
        </div>
      </div>
    `;
  }
  grid.innerHTML = skeletonCards;
}

// ==================== PRODUCT FETCHING ====================
async function fetchProducts() {
  try {
    debugLog('Fetching wellness products...');
    setText("resultsCount", "Loading products...");
    showSkeletonLoader();

    const url = `${API_BASE_URL}/get-by-category/Wellness`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    processProducts(data);

  } catch (error) {
    console.error('Fetch error:', error);
    showToast('Failed to load products', 'error');
    setText("resultsCount", "Failed to load");

    const grid = document.getElementById("productsGrid");
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-10">
          <i class="fas fa-exclamation-triangle text-5xl text-gray-400 mb-4"></i>
          <p class="text-gray-500 mb-2">Failed to load products</p>
          <button onclick="fetchProducts()" class="px-4 py-2 bg-[#36C2CE] text-white rounded-lg">Retry</button>
        </div>
      `;
    }
  }
}

function processProducts(data) {
  let productsArray = [];
  if (Array.isArray(data)) productsArray = data;
  else if (data.content) productsArray = data.content;
  else if (data.products) productsArray = data.products;

  const transformed = transformBackendProducts(productsArray);

  allProducts = transformed.filter(p => {
    if (p.deleted) return false;
    const sub = (p.subcategory || '').toLowerCase();
    return WELLNESS_CATEGORIES.some(cat => 
      cat.id !== 'all' && 
      cat.backendSubcategories.some(s => sub.includes(s.toLowerCase()) || s.toLowerCase().includes(sub))
    );
  });

  debugLog('Final wellness products:', allProducts.length);
  applyFilters();
  updateUIWithProducts();
}

function transformBackendProducts(backendProducts) {
  if (!Array.isArray(backendProducts)) return [];

  return backendProducts.map(p => {
    const id = p.productId;
    const title = p.productName || 'Wellness Product';
    const subcategory = p.productSubCategory || 'Unknown';
    const brand = p.brandName || 'Generic';
    const description = p.productDescription || '';
    const stockQuantity = p.productQuantity || 0;
    const inStock = p.productStock === 'In-Stock' && stockQuantity > 0;
    const deleted = p.deleted === true;

    const priceInfo = getPriceInfo(p.productPrice || [], p.productOldPrice || []);

    const image = getImageUrl(p.productMainImage) || FALLBACK_IMAGE;

    let category = 'all';
    const subLower = subcategory.toLowerCase();
    for (const cat of WELLNESS_CATEGORIES) {
      if (cat.id === 'all') continue;
      if (cat.backendSubcategories.some(s => subLower.includes(s.toLowerCase()))) {
        category = cat.id;
        break;
      }
    }

    return {
      id,
      title,
      price: priceInfo.numericPrice,
      priceText: priceInfo.priceText,
      originalPrice: priceInfo.mrp || 0,
      discount: priceInfo.discount,
      rating: p.rating || 4.0,
      reviewCount: Math.floor(Math.random() * 900) + 100,
      subcategory,
      category,
      brand,
      image,
      description,
      inStock,
      stockQuantity,
      deleted,
      sku: p.sku || `W${String(id).padStart(4, '0')}`
    };
  });
}

// ==================== FILTERING & SORTING ====================
function applyFilters() {
  filteredProducts = allProducts.filter(p => {
    if (p.deleted) return false;

    const catMatch = filterState.category === 'all' || 
      p.category === filterState.category ||
      WELLNESS_CATEGORIES.find(c => c.id === filterState.category)?.backendSubcategories.some(s => 
        p.subcategory.toLowerCase().includes(s.toLowerCase())
      );

    const brandMatch = filterState.brand === 'all' || p.brand === filterState.brand;
    const discMatch = p.discount >= filterState.discount;
    const priceMatch = p.price >= filterState.minPrice && p.price <= filterState.maxPrice;

    return catMatch && brandMatch && discMatch && priceMatch;
  });

  sortProducts(filterState.sort);
  currentPage = 1;
  renderProducts();
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

function clearFilters() {
  filterState = { category: 'all', brand: 'all', discount: 0, minPrice: 0, maxPrice: 5000, sort: 'default' };
  syncFilterStates();
  updateCategoryCardsUI();
  fetchProducts();
}

// ==================== UI UPDATES ====================
function updateUIWithProducts() {
  updateBrandsDropdown();
  updateCategoriesDropdown();
  updatePriceRange();
  initFilterEventListeners();
  syncFilterStates();
  renderProducts();
}

function updateBrandsDropdown() {
  const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))].sort();

  const createHTML = (name) => {
    let html = `<label class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer">
      <input type="radio" name="${name}" value="all" ${filterState.brand === 'all' ? 'checked' : ''}>
      <span class="text-sm">All Brands</span>
    </label>`;
    brands.forEach(b => {
      html += `<label class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer">
        <input type="radio" name="${name}" value="${b}" ${filterState.brand === b ? 'checked' : ''}>
        <span class="text-sm">${b}</span>
      </label>`;
    });
    return html;
  };

  document.querySelector('#filterSidebar [name="brand"]')?.closest('.mt-2')?.querySelectorAll('label').forEach(el => el.remove());
  const desktopContainer = document.querySelector('#filterSidebar .mt-2');
  if (desktopContainer) desktopContainer.innerHTML = createHTML('brand');

  const mobileContainer = document.getElementById('mobileBrandsContainer');
  if (mobileContainer) mobileContainer.innerHTML = createHTML('mobileBrand');
}

function updateCategoriesDropdown() {
  // Static in HTML – just attach listeners
}

function updatePriceRange() {
  const prices = allProducts.map(p => p.price).filter(p => p > 0);
  if (prices.length === 0) return;

  const min = Math.floor(Math.min(...prices));
  const max = Math.ceil(Math.max(...prices));

  filterState.minPrice = min;
  filterState.maxPrice = Math.max(max, 5000);

  updatePriceSliders(min, filterState.maxPrice);
}

function updatePriceSliders(minPrice, maxPrice) {
  const update = (minEl, maxEl, minVal, maxVal) => {
    if (!minEl || !maxEl) return;
    minEl.min = maxEl.min = minPrice;
    minEl.max = maxEl.max = maxPrice;
    minEl.value = minPrice;
    maxEl.value = maxPrice;
    if (minVal) minVal.textContent = `₹${minPrice}`;
    if (maxVal) maxVal.textContent = `₹${maxPrice}`;
  };

  update(
    document.getElementById('minThumb'),
    document.getElementById('maxThumb'),
    document.getElementById('minValue'),
    document.getElementById('maxValue')
  );

  update(
    document.getElementById('mobileMinThumb'),
    document.getElementById('mobileMaxThumb'),
    document.getElementById('mobileMinValue'),
    document.getElementById('mobileMaxValue')
  );
}

function syncFilterStates() {
  document.querySelectorAll('input[type="radio"]').forEach(r => {
    if (r.name.includes('category')) r.checked = r.value === filterState.category;
    if (r.name.includes('Brand')) r.checked = r.value === filterState.brand;
    if (r.name.includes('Discount')) r.checked = parseInt(r.value) === filterState.discount;
  });

  const cat = WELLNESS_CATEGORIES.find(c => c.id === filterState.category) || { name: 'All Wellness Products' };
  setText('categoryTitle', cat.name);
  setText('pageTitle', cat.pageTitle || 'Wellness Essentials');
}

// ==================== PRODUCT CARD ====================
function createProductCard(p) {
  const inWishlist = wishlist.some(x => x.id === p.id);
  const isUnavailable = p.deleted || !p.inStock;

  return `
    <div class="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100
                ${isUnavailable ? 'opacity-60 grayscale' : ''}"
         ${!isUnavailable ? `onclick="viewProductDetails(${p.id})"` : ''}
         style="${isUnavailable ? 'pointer-events: none; cursor: not-allowed;' : 'cursor: pointer;'}">

      <div class="relative bg-gray-50 aspect-[6/4] overflow-hidden">
        <img src="${p.image}" alt="${p.title}" onerror="this.src='${FALLBACK_IMAGE}'"
             class="w-full h-full object-contain p-5 transition-transform duration-500 ${!isUnavailable ? 'group-hover:scale-110' : ''}">

        <div class="absolute top-2 left-2 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10
                    ${isUnavailable ? 'bg-red-600' : 'bg-green-600'}">
          ${isUnavailable ? 'Unavailable' : 'In Stock'}
        </div>

        <button onclick="event.stopPropagation(); toggleWishlist(${p.id})"
                class="absolute top-2 right-2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center 
                       ${isUnavailable ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-10">
          <i class="${inWishlist ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-600'} text-lg"></i>
        </button>
      </div>

      <div class="p-3">
        <div class="flex justify-between items-start">
          <p class="text-xs text-gray-500 uppercase font-medium truncate">${p.brand}</p>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${p.category === 'all' ? 'Wellness' : p.category}</span>
        </div>
        <h3 class="text-sm font-medium text-gray-800 line-clamp-2 mt-1">${p.title}</h3>
        <p class="text-xs text-gray-500 mt-1">${p.subcategory}</p>

        <div class="mt-2 flex items-center gap-2">
          <span class="text-lg font-bold text-green-600">${p.priceText}</span>
          ${p.originalPrice > p.price ? `
            <span class="text-sm text-gray-500 line-through">₹${p.originalPrice.toLocaleString()}</span>
            <span class="text-sm font-medium text-red-500">${p.discount}% OFF</span>
          ` : ''}
        </div>

        <div class="flex items-center mt-2">
          <div class="flex text-yellow-400">
            ${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}
          </div>
          <span class="text-xs text-gray-500 ml-2">(${p.reviewCount})</span>
        </div>

        <button onclick="event.stopPropagation(); viewProductDetails(${p.id})"
                class="mt-3 w-full font-medium text-sm py-2.5 rounded-lg transition
                        ${isUnavailable ? 'bg-gray-300 text-gray-600' : 'bg-[#36C2CE] hover:bg-[#2aa8b3] text-white'}">
          ${isUnavailable ? 'Unavailable' : 'View Details'}
        </button>
      </div>
    </div>
  `;
}

// ==================== RENDERING ====================
function renderProducts() {
  const start = (currentPage - 1) * pageSize;
  const paginated = filteredProducts.slice(start, start + pageSize);
  const grid = document.getElementById("productsGrid");

  if (paginated.length > 0) {
    grid.innerHTML = paginated.map(createProductCard).join("");
    document.getElementById('showMoreContainer')?.classList.toggle('hidden', filteredProducts.length <= pageSize * currentPage);
  } else {
    grid.innerHTML = `
      <div class="col-span-full text-center py-10">
        <i class="fas fa-search text-5xl text-gray-400 mb-4"></i>
        <p class="text-gray-500 mb-2">No wellness products found</p>
        <p class="text-gray-400 text-sm">Try changing your filters</p>
        <button onclick="clearFilters()" class="mt-4 px-4 py-2 bg-[#36C2CE] text-white rounded-lg">Clear Filters</button>
      </div>
    `;
    document.getElementById('showMoreContainer')?.classList.add('hidden');
  }

  setText("resultsCount", `Showing ${filteredProducts.length} products`);
  renderPagination();
}

function renderPagination() {
  const container = document.getElementById("pagination");
  if (!container) return;

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  container.innerHTML = "";

  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = `px-4 py-2 rounded border mx-1 ${i === currentPage ? 'bg-[#36C2CE] text-white' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`;
    btn.onclick = () => { currentPage = i; renderProducts(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    container.appendChild(btn);
  }
}

function showMoreProducts() {
  if (filteredProducts.length > pageSize * currentPage) {
    currentPage++;
    renderProducts();
  }
}

// ==================== REST OF FUNCTIONS (UNCHANGED) ====================
function initCategoryCards() {
  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    card.addEventListener('click', function() {
      categoryCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      filterState.category = this.dataset.category;
      updateRadioButtons('category', filterState.category);
      updateRadioButtons('mobileCategory', filterState.category);
      applyFilters();
    });
  });
}

function updateCategoryCardsUI() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.classList.toggle('active', card.dataset.category === filterState.category);
  });
}

function updateRadioButtons(name, value) {
  document.querySelectorAll(`input[name="${name}"]`).forEach(r => r.checked = r.value === value);
}

function initFilterEventListeners() {
  document.addEventListener('change', (e) => {
    if (e.target.name === 'category' || e.target.name === 'mobileCategory') {
      filterState.category = e.target.value;
      updateCategoryCardsUI();
      applyFilters();
    }
    if (e.target.name === 'brand' || e.target.name === 'mobileBrand') {
      filterState.brand = e.target.value;
      applyFilters();
    }
    if (e.target.name === 'discount' || e.target.name === 'mobileDiscount') {
      filterState.discount = parseInt(e.target.value);
      applyFilters();
    }
  });

  document.getElementById('applyDesktopFilters')?.addEventListener('click', applyFilters);
  document.getElementById('applyMobileFilters')?.addEventListener('click', () => {
    applyFilters();
    document.getElementById('filterSheet').classList.add('translate-y-full');
    document.getElementById('mobileSheetBackdrop').classList.add('hidden');
  });
  document.getElementById('clearMobileFilters')?.addEventListener('click', () => {
    clearFilters();
    document.getElementById('filterSheet').classList.add('translate-y-full');
    document.getElementById('mobileSheetBackdrop').classList.add('hidden');
  });

  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.value = filterState.sort;
    sortSelect.addEventListener("change", (e) => {
      filterState.sort = e.target.value;
      sortProducts(filterState.sort);
      renderProducts();
    });
  }

  document.getElementById("applySortBtn")?.addEventListener('click', () => {
    const sort = document.querySelector('input[name="mobileSort"]:checked')?.value || 'default';
    filterState.sort = sort;
    if (sortSelect) sortSelect.value = sort;
    sortProducts(sort);
    renderProducts();
    document.getElementById('sortSheet').classList.add('translate-y-full');
    document.getElementById('mobileSheetBackdrop').classList.add('hidden');
  });

  document.getElementById('showMoreBtn')?.addEventListener('click', showMoreProducts);
}

function initPriceSliders() {
  const updateSlider = (minEl, maxEl, minValEl, maxValEl) => {
    if (!minEl || !maxEl) return;
    minEl.addEventListener('input', () => {
      const val = parseInt(minEl.value);
      if (val > parseInt(maxEl.value)) minEl.value = maxEl.value;
      filterState.minPrice = parseInt(minEl.value);
      if (minValEl) minValEl.textContent = `₹${filterState.minPrice}`;
      applyFilters();
    });
    maxEl.addEventListener('input', () => {
      const val = parseInt(maxEl.value);
      if (val < parseInt(minEl.value)) maxEl.value = minEl.value;
      filterState.maxPrice = parseInt(maxEl.value);
      if (maxValEl) maxValEl.textContent = `₹${filterState.maxPrice}`;
      applyFilters();
    });
  };

  updateSlider(
    document.getElementById('minThumb'),
    document.getElementById('maxThumb'),
    document.getElementById('minValue'),
    document.getElementById('maxValue')
  );

  updateSlider(
    document.getElementById('mobileMinThumb'),
    document.getElementById('mobileMaxThumb'),
    document.getElementById('mobileMinValue'),
    document.getElementById('mobileMaxValue')
  );
}

function viewProductDetails(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product || !product.inStock) {
    showToast('This product is currently unavailable', 'info');
    return;
  }
  sessionStorage.setItem('selectedProduct', JSON.stringify(product));
  window.location.href = `../../productdetails.html?id=${product.id}`;
}

function toggleWishlist(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const index = wishlist.findIndex(item => item.id === id);
  if (index > -1) {
    wishlist.splice(index, 1);
    showToast("Removed from wishlist ♥", "info");
  } else {
    wishlist.push({
      id: product.id,
      name: product.title.split(' (')[0].trim(),
      price: product.price,
      originalPrice: product.originalPrice || null,
      image: product.image,
      brand: product.brand,
      sku: product.sku,
      description: product.description
    });
    showToast("Added to wishlist ♥", "success");
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateHeaderCounts();
  renderProducts();
}

function updateHeaderCounts() {
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

function initMobileSheets() {
  const backdrop = document.getElementById("mobileSheetBackdrop");
  const filterSheet = document.getElementById("filterSheet");
  const sortSheet = document.getElementById("sortSheet");

  document.getElementById("openFilterSheet")?.addEventListener("click", () => {
    filterSheet.classList.remove("translate-y-full");
    backdrop.classList.remove("hidden");
  });
  document.getElementById("openSortSheet")?.addEventListener("click", () => {
    sortSheet.classList.remove("translate-y-full");
    backdrop.classList.remove("hidden");
  });
  document.getElementById("closeFilterSheet")?.addEventListener("click", () => {
    filterSheet.classList.add("translate-y-full");
    backdrop.classList.add("hidden");
  });
  document.getElementById("closeSortSheet")?.addEventListener("click", () => {
    sortSheet.classList.add("translate-y-full");
    backdrop.classList.add("hidden");
  });
  backdrop.addEventListener("click", () => {
    filterSheet.classList.add("translate-y-full");
    sortSheet.classList.add("translate-y-full");
    backdrop.classList.add("hidden");
  });
}

function initBannerSlider() {
  const slides = document.querySelectorAll('.banner-slide');
  const dots = document.querySelectorAll('.banner-dot');
  if (slides.length === 0) return;

  let currentSlide = 0;
  function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    currentSlide = index;
  }

  setInterval(() => {
    showSlide((currentSlide + 1) % slides.length);
  }, 5000);

  dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
}

function init() {
  console.log('Initializing Wellness page...');
  initMobileSheets();
  initPriceSliders();
  initCategoryCards();
  fetchProducts();
  updateHeaderCounts();
  initBannerSlider();
}

document.addEventListener("DOMContentLoaded", init);








// // ==================== wellness.js – WELLNESS ESSENTIALS PAGE ====================

// // Base API URL - Update this to your backend URL
// const API_BASE_URL = 'http://localhost:8083/api/products';
// const DEBUG_MODE = true;

// // ==================== WELLNESS CATEGORIES ====================
// const WELLNESS_CATEGORIES = [
//   { 
//     id: 'all', 
//     name: 'All Wellness Products', 
//     backendSubcategories: [] 
//   },
//   { 
//     id: 'vitamins', 
//     name: 'Vitamins & Supplements', 
//     backendSubcategories: [
//       'Vitamin', 
//       'Supplement', 
//       'Multivitamin',
//       'Vitamin C',
//       'Vitamin D',
//       'Omega-3',
//       'Fish Oil',
//       'Calcium',
//       'Iron',
//       'Probiotic',
//       'Nutritional Supplement'
//     ] 
//   },
//   { 
//     id: 'hairskin', 
//     name: 'Hair & Skin Care', 
//     backendSubcategories: [
//       'Hair Care',
//       'Skin Care',
//       'Hair Oil',
//       'Shampoo',
//       'Conditioner',
//       'Face Cream',
//       'Serum',
//       'Moisturizer',
//       'Sunscreen',
//       'Face Wash',
//       'Beauty',
//       'Cosmetic',
//       'Anti-aging'
//     ] 
//   },
//   { 
//     id: 'fitness', 
//     name: 'Fitness & Weight Management', 
//     backendSubcategories: [
//       'Fitness',
//       'Weight',
//       'Protein',
//       'Whey',
//       'Weight Loss',
//       'Weight Gain',
//       'Fitness Supplement',
//       'Sports Nutrition',
//       'Energy',
//       'Workout',
//       'Muscle',
//       'Exercise'
//     ] 
//   },
//   { 
//     id: 'immunity', 
//     name: 'Immunity Boosters', 
//     backendSubcategories: [
//       'Immunity',
//       'Immune',
//       'Chyawanprash',
//       'Giloy',
//       'Tulsi',
//       'Ashwagandha',
//       'Amritarishta',
//       'Ayurvedic Immunity',
//       'Herbal Immunity',
//       'Wellness Drink'
//     ] 
//   },
//   { 
//     id: 'senior', 
//     name: 'Senior Care Products', 
//     backendSubcategories: [
//       'Senior Care',
//       'Elderly',
//       'Adult Diaper',
//       'BP Monitor',
//       'Glucose Monitor',
//       'Walking Aid',
//       'Joint Care',
//       'Bone Health',
//       'Memory',
//       'Geriatric'
//     ] 
//   },
//   { 
//     id: 'oral', 
//     name: 'Oral Care Essentials', 
//     backendSubcategories: [
//       'Oral Care',
//       'Toothpaste',
//       'Toothbrush',
//       'Mouthwash',
//       'Dental',
//       'Oral Hygiene',
//       'Mouth Freshener',
//       'Tooth Powder',
//       'Dental Care'
//     ] 
//   },
//   { 
//     id: 'menstrual', 
//     name: 'Menstrual Care Products', 
//     backendSubcategories: [
//       'Menstrual',
//       'Sanitary',
//       'Pad',
//       'Tampon',
//       'Menstrual Cup',
//       'Period',
//       'Feminine Hygiene',
//       'Intimate Care',
//       'Women Care'
//     ] 
//   }
// ];

// // Category Display Names
// const categoryNames = {
//   'all': {
//     title: 'All Wellness Products',
//     pageTitle: 'Wellness Essentials',
//     description: 'Complete range of health and wellness products'
//   },
//   'vitamins': {
//     title: 'Vitamins & Supplements',
//     pageTitle: 'Vitamins & Supplements',
//     description: 'Essential vitamins and supplements for daily health'
//   },
//   'hairskin': {
//     title: 'Hair & Skin Care',
//     pageTitle: 'Hair & Skin Care Essentials',
//     description: 'Natural products for beautiful hair and glowing skin'
//   },
//   'fitness': {
//     title: 'Fitness & Weight Management',
//     pageTitle: 'Fitness & Weight Products',
//     description: 'Supplements and gear for your fitness journey'
//   },
//   'immunity': {
//     title: 'Immunity Boosters',
//     pageTitle: 'Immunity Boosters',
//     description: 'Strengthen your natural defenses'
//   },
//   'senior': {
//     title: 'Senior Care Products',
//     pageTitle: 'Senior Care Essentials',
//     description: 'Specialized products for elderly wellness'
//   },
//   'oral': {
//     title: 'Oral Care Essentials',
//     pageTitle: 'Oral Care Products',
//     description: 'For a healthy and bright smile'
//   },
//   'menstrual': {
//     title: 'Menstrual Care Products',
//     pageTitle: 'Menstrual Care Essentials',
//     description: 'Comfort and care during menstrual cycle'
//   }
// };

// // ==================== GLOBAL VARIABLES ====================
// let allProducts = [];
// let filteredProducts = [];
// let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
// let cart = JSON.parse(localStorage.getItem("cart") || "[]");
// let currentPage = 1;
// const pageSize = 12;

// // Persistent Filter State
// let filterState = {
//   category: 'all',
//   brand: 'all',
//   discount: 0,
//   minPrice: 0,
//   maxPrice: 5000,
//   sort: 'default'
// };

// // ==================== HELPER FUNCTIONS ====================
// function debugLog(...args) {
//   if (DEBUG_MODE) {
//     console.log('[WELLNESS DEBUG]', ...args);
//   }
// }

// function setText(id, text) {
//   const el = document.getElementById(id);
//   if (el) el.textContent = text;
// }

// function showToast(msg, type = "success") {
//   // Remove existing toast
//   const existing = document.querySelector('.custom-toast');
//   if (existing) existing.remove();
  
//   const toast = document.createElement("div");
//   toast.className = `custom-toast fixed bottom-20 left-1/2 -translate-x-1/2 ${type === 'success' ? 'bg-green-500' : 'bg-blue-500'} text-white px-6 py-3 rounded-full z-50 shadow-lg`;
//   toast.textContent = msg;
//   document.body.appendChild(toast);
  
//   setTimeout(() => {
//     toast.style.opacity = '0';
//     toast.style.transition = 'opacity 0.3s';
//     setTimeout(() => toast.remove(), 300);
//   }, 2000);
// }

// // ==================== PRODUCT FETCHING FROM BACKEND ====================
// async function fetchProducts() {
//   try {
//     debugLog('Fetching wellness products from backend...');
//     setText("resultsCount", "Loading products...");
    
//     // Show loading state
//     const grid = document.getElementById("productsGrid");
//     if (grid) {
//       grid.innerHTML = `
//         <div class="col-span-full text-center py-16">
//           <div class="loading-spinner mx-auto"></div>
//           <p class="text-gray-500 mt-4">Loading wellness products from database...</p>
//         </div>
//       `;
//     }
    
//     allProducts = [];
//     filteredProducts = [];
    
//     // Fetch ALL products from backend
//     const url = `${API_BASE_URL}/get-by-category/Wellness`;
    
//     debugLog('Fetching from URL:', url);
    
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//       }
//     });
    
//     debugLog('Response status:', response.status);
    
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
    
//     const data = await response.json();
//     processProducts(data);
    
//   } catch (error) {
//     console.error('Error in fetchProducts:', error);
//     showToast('Error loading products. Please check console for details.', 'error');
//     setText("resultsCount", "Failed to load products");
    
//     // Show error state
//     const grid = document.getElementById("productsGrid");
//     if (grid) {
//       grid.innerHTML = `
//         <div class="col-span-full text-center py-10">
//           <div class="text-gray-400 mb-4">
//             <i class="fas fa-exclamation-triangle text-5xl"></i>
//           </div>
//           <p class="text-gray-500 mb-2">Failed to load products</p>
//           <p class="text-gray-400 text-sm">Error: ${error.message}</p>
//           <button onclick="fetchProducts()" class="mt-4 px-4 py-2 bg-[#36C2CE] text-white rounded-lg">
//             Retry
//           </button>
//         </div>
//       `;
//     }
//   }
// }

// function processProducts(data) {
//   debugLog('API Response data:', data);
  
//   let productsArray = [];
  
//   // Handle different response formats
//   if (Array.isArray(data)) {
//     productsArray = data;
//   } else if (data.content && Array.isArray(data.content)) {
//     productsArray = data.content;
//   } else if (data.products && Array.isArray(data.products)) {
//     productsArray = data.products;
//   } else if (typeof data === 'object' && data !== null) {
//     productsArray = [data];
//   }
  
//   debugLog('Total products from API:', productsArray.length);
  
//   const allTransformedProducts = transformBackendProducts(productsArray);
  
//   // DEBUG: Check each product
//   debugLog('=== CHECKING WELLNESS PRODUCT SUB CATEGORIES ===');
//   allTransformedProducts.forEach(product => {
//     debugLog(`Product: "${product.title}" - Subcategory: "${product.subcategory}"`);
//   });
  
//   const allSubcategories = [...new Set(allTransformedProducts.map(p => p.subcategory))];
//   debugLog('All subcategories in DB:', allSubcategories);
  
//   // FILTER: Only keep products that match our Wellness categories
//   allProducts = allTransformedProducts.filter(product => {
//     const productSubcategory = product.subcategory || '';
    
//     const isWellnessProduct = WELLNESS_CATEGORIES.some(category => {
//       if (category.id === 'all') return false;
      
//       return category.backendSubcategories.some(backendSubcat => {
//         const productSubLower = productSubcategory.toLowerCase();
//         const backendSubLower = backendSubcat.toLowerCase();
        
//         return productSubLower === backendSubLower || 
//                productSubLower.includes(backendSubLower) || 
//                backendSubLower.includes(productSubLower);
//       });
//     });
    
//     if (!isWellnessProduct) {
//       debugLog(`Filtered out (non-Wellness): ${product.title} - ${product.subcategory}`);
//     }
    
//     return isWellnessProduct;
//   });
  
//   debugLog('Wellness products after filtering:', allProducts.length);
//   debugLog('Wellness product subcategories:', [...new Set(allProducts.map(p => p.subcategory))]);
  
//   applyFilters();
//   updateUIWithProducts();
// }

// function transformBackendProducts(backendProducts) {
//   if (!Array.isArray(backendProducts) || backendProducts.length === 0) {
//     return [];
//   }
  
//   debugLog('Transforming', backendProducts.length, 'products');
  
//   return backendProducts.map((product, index) => {
//     try {
//       // Extract basic fields from backend
//       const id = product.productId || product.id || index + 1;
//       const title = product.productName || product.name || 'Wellness Product';
//       const price = Number(product.productPrice || product.price || 100);
//       const originalPrice = Number(product.productOldPrice || product.originalPrice || product.mrp || price * 1.2);
//       const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
      
//       // Get subcategory - this is critical for filtering
//       const subcategory = product.productSubCategory || 'Unknown';
      
//       // Get brand
//       const brand = product.brandName || product.brand || product.manufacturer || 'Generic';
      
//       const description = product.productDescription || product.description || 'No description available';
//       const stockQuantity = product.productQuantity || product.stockQuantity || product.quantity || 0;
//       const inStock = product.productStock === 'In-Stock' || stockQuantity > 0;
      
//       // Get image URL
//       let imageUrl = 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop';
      
//       if (product.productMainImage) {
//         // Check if it's a path starting with /api/
//         if (product.productMainImage.startsWith('/api/')) {
//           // It's a relative path, make it absolute
//           imageUrl = `http://localhost:8083${product.productMainImage}`;
//         } 
//         // Check if it's base64
//         else if (product.productMainImage.startsWith('data:image')) {
//           imageUrl = product.productMainImage;
//         }
//         // Check if it's a URL
//         else if (product.productMainImage.startsWith('http')) {
//           imageUrl = product.productMainImage;
//         }
//         // Otherwise assume it's base64
//         else {
//           imageUrl = `data:image/jpeg;base64,${product.productMainImage}`;
//         }
//       } else if (product.productId) {
//         imageUrl = `${API_BASE_URL}/${product.productId}/image`;
//       }
      
//       // Generate SKU if not available
//       const sku = product.sku || `W${String(id).padStart(4, '0')}`;
      
//       // Map backend category to our wellness categories
//       let category = 'all';
//       const productSubLower = subcategory.toLowerCase();
      
//       // Determine which wellness category this product belongs to
//       for (const wellnessCat of WELLNESS_CATEGORIES) {
//         if (wellnessCat.id === 'all') continue;
        
//         if (wellnessCat.backendSubcategories.some(backendSubcat => {
//           const backendSubLower = backendSubcat.toLowerCase();
//           return productSubLower.includes(backendSubLower) || backendSubLower.includes(productSubLower);
//         })) {
//           category = wellnessCat.id;
//           break;
//         }
//       }
      
//       return {
//         id: id,
//         title: title,
//         price: price,
//         originalPrice: originalPrice,
//         discount: discount,
//         rating: product.rating || product.productRating || 4.0,
//         reviewCount: product.reviewCount || product.totalReviews || Math.floor(Math.random() * 1000),
//         subcategory: subcategory,
//         category: category,
//         brand: brand,
//         image: imageUrl,
//         description: description,
//         inStock: inStock,
//         stockQuantity: stockQuantity,
//         sku: sku
//       };
//     } catch (error) {
//       console.error('Error transforming product:', product, error);
//       return null;
//     }
//   }).filter(product => product !== null);
// }

// // ==================== FILTERING ====================
// function applyFilters() {
//   debugLog('Applying filters with', allProducts.length, 'products');
//   debugLog('Current filter state:', filterState);
  
//   // Sync the UI with current filter state
//   syncFilterStates();
  
//   filteredProducts = allProducts.filter(p => {
//     // Category filter - MOST IMPORTANT
//     let categoryMatch = false;
    
//     if (filterState.category === 'all') {
//       categoryMatch = true;
//     } else {
//       const selectedCategory = WELLNESS_CATEGORIES.find(cat => cat.id === filterState.category);
//       if (!selectedCategory || selectedCategory.id === 'all') {
//         categoryMatch = true;
//       } else {
//         const productSubcategory = (p.subcategory || '').toLowerCase().trim();
        
//         // Check if product matches any backend subcategory for this Wellness category
//         categoryMatch = selectedCategory.backendSubcategories.some(backendSubcat => {
//           const backendSubLower = backendSubcat.toLowerCase().trim();
          
//           // DEBUG: Log what's being compared
//           if (DEBUG_MODE) {
//             debugLog(`Comparing: "${productSubcategory}" with "${backendSubLower}"`);
//           }
          
//           // STRICT MATCHING
//           const exactMatch = productSubcategory === backendSubLower;
          
//           // For partial matches
//           const wordMatch = productSubcategory.split(/\s+/).some(word => 
//             word === backendSubLower || backendSubLower.split(/\s+/).some(w => w === word)
//           );
          
//           const containsAsWord = productSubcategory.includes(backendSubLower) && 
//                                 (productSubcategory === backendSubLower || 
//                                  productSubcategory.startsWith(backendSubLower + ' ') ||
//                                  productSubcategory.endsWith(' ' + backendSubLower) ||
//                                  productSubcategory.includes(' ' + backendSubLower + ' '));
          
//           const matches = exactMatch || wordMatch || containsAsWord;
          
//           if (matches && DEBUG_MODE) {
//             debugLog(`✓ MATCH: Product "${p.title}" (${productSubcategory}) matches "${backendSubLower}" for category "${selectedCategory.name}"`);
//           }
          
//           return matches;
//         });
        
//         // If no match found with backend subcategories, try direct category mapping
//         if (!categoryMatch) {
//           // Check if we already assigned a category during transformation
//           if (p.category === filterState.category) {
//             categoryMatch = true;
//             if (DEBUG_MODE) {
//               debugLog(`✓ Pre-assigned category match: Product "${p.title}" has category "${p.category}"`);
//             }
//           }
//         }
//       }
//     }
    
//     // Other filters
//     const brandMatch = filterState.brand === 'all' || p.brand === filterState.brand;
//     const discMatch = p.discount >= filterState.discount;
//     const priceMatch = p.price >= filterState.minPrice && p.price <= filterState.maxPrice;
    
//     const matches = categoryMatch && brandMatch && discMatch && priceMatch;
    
//     if (!matches && DEBUG_MODE) {
//       debugLog(`✗ Product "${p.title}" filtered out:`, {
//         categoryMatch, 
//         brandMatch, 
//         discMatch, 
//         priceMatch,
//         category: filterState.category,
//         brand: filterState.brand,
//         productBrand: p.brand,
//         productDiscount: p.discount,
//         requiredDiscount: filterState.discount
//       });
//     }
    
//     return matches;
//   });

//   debugLog('After filtering:', filteredProducts.length, 'products');
  
//   // Apply sorting
//   sortProducts(filterState.sort);
  
//   // Reset to first page
//   currentPage = 1;
  
//   // Render products
//   renderProducts();
// }

// function sortProducts(type) {
//   switch (type) {
//     case 'price-low': 
//       filteredProducts.sort((a, b) => a.price - b.price); 
//       break;
//     case 'price-high': 
//       filteredProducts.sort((a, b) => b.price - a.price); 
//       break;
//     case 'rating': 
//       filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0)); 
//       break;
//     case 'newest': 
//       filteredProducts.sort((a, b) => b.id - a.id); 
//       break;
//     default: 
//       // Keep original order
//       break;
//   }
// }

// function clearFilters() {
//   filterState = {
//     category: 'all',
//     brand: 'all',
//     discount: 0,
//     minPrice: 0,
//     maxPrice: 5000,
//     sort: 'default'
//   };
  
//   // Reset UI
//   const sortSelect = document.getElementById("sortSelect");
//   if (sortSelect) sortSelect.value = 'default';
  
//   // Sync filter states
//   syncFilterStates();
  
//   // Update category cards
//   updateCategoryCardsUI();
  
//   // Fetch products with cleared filters
//   fetchProducts();
// }

// // ==================== UI UPDATES ====================
// function updateUIWithProducts() {
//   updateBrandsDropdown();
//   updateCategoriesDropdown();
//   updatePriceRange();
//   initFilterEventListeners();
//   syncFilterStates();
//   renderProducts();
// }

// function updateBrandsDropdown() {
//   const brands = [...new Set(allProducts.map(p => p.brand).filter(Boolean))];
//   brands.sort();
  
//   debugLog('Available brands:', brands);
  
//   // Update desktop brands dropdown
//   const desktopBrands = document.querySelector('#filterSidebar [name="brand"]')?.closest('.mt-2');
//   if (desktopBrands) {
//     let html = `
//       <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer">
//         <input type="radio" name="brand" value="all" ${filterState.brand === 'all' ? 'checked' : ''} class="w-4 h-4 text-blue-600">
//         <span class="text-sm">All Brands</span>
//       </label>
//     `;
    
//     brands.forEach(brand => {
//       html += `
//         <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer">
//           <input type="radio" name="brand" value="${brand}" ${filterState.brand === brand ? 'checked' : ''} class="w-4 h-4 text-blue-600">
//           <span class="text-sm">${brand}</span>
//         </label>
//       `;
//     });
    
//     desktopBrands.innerHTML = html;
//   }
  
//   // Update mobile brands dropdown
//   const mobileBrands = document.getElementById('mobileBrandsContainer');
//   if (mobileBrands) {
//     let html = `
//       <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer">
//         <input type="radio" name="mobileBrand" value="all" ${filterState.brand === 'all' ? 'checked' : ''} class="w-4 h-4 text-blue-600">
//         <span class="text-sm">All Brands</span>
//       </label>
//     `;
    
//     brands.forEach(brand => {
//       html += `
//         <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 cursor-pointer">
//           <input type="radio" name="mobileBrand" value="${brand}" ${filterState.brand === brand ? 'checked' : ''} class="w-4 h-4 text-blue-600">
//           <span class="text-sm">${brand}</span>
//         </label>
//       `;
//     });
    
//     mobileBrands.innerHTML = html;
//   }
// }

// function updateCategoriesDropdown() {
//   debugLog('Updating categories dropdown with:', WELLNESS_CATEGORIES);
  
//   // Update desktop categories (already has static HTML, just add event listeners)
//   const desktopCategories = document.querySelector('#filterSidebar input[name="category"]')?.closest('.mt-3');
//   if (desktopCategories) {
//     // Add event listeners to existing radio buttons
//     desktopCategories.querySelectorAll('input[name="category"]').forEach(input => {
//       input.addEventListener('change', (e) => {
//         filterState.category = e.target.value;
//         debugLog('Desktop category changed to:', filterState.category);
//         updateCategoryCardsUI();
//         applyFilters();
//       });
//     });
//   }
  
//   // Update mobile categories (in filter sheet)
//   const mobileCategories = document.querySelector('#filterSheet [name="mobileCategory"]')?.closest('.mt-3');
//   if (mobileCategories && mobileCategories.querySelectorAll('input').length > 0) {
//     // Just update the event listeners
//     mobileCategories.querySelectorAll('input[name="mobileCategory"]').forEach(input => {
//       input.addEventListener('change', (e) => {
//         filterState.category = e.target.value;
//         debugLog('Mobile category changed to:', filterState.category);
//         updateCategoryCardsUI();
//       });
//     });
//   }
// }

// function updatePriceRange() {
//   if (allProducts.length === 0) return;
  
//   const prices = allProducts.map(p => p.price).filter(p => p > 0);
//   if (prices.length === 0) return;
  
//   const minPrice = Math.min(...prices);
//   const maxPrice = Math.max(...prices);
  
//   // Update filter state with actual product prices
//   filterState.minPrice = minPrice;
//   filterState.maxPrice = Math.max(maxPrice, 5000); // Keep min 5000 as default max
  
//   debugLog('Price range:', minPrice, 'to', filterState.maxPrice);
  
//   // Update sliders if they exist
//   updatePriceSliders(minPrice, filterState.maxPrice);
// }

// function updatePriceSliders(minPrice, maxPrice) {
//   // Ensure min and max are valid numbers
//   minPrice = Math.max(0, Math.floor(minPrice));
//   maxPrice = Math.max(minPrice + 100, Math.ceil(maxPrice));
  
//   // Update desktop sliders
//   const desktopMin = document.getElementById('minThumb');
//   const desktopMax = document.getElementById('maxThumb');
//   const desktopMinVal = document.getElementById('minValue');
//   const desktopMaxVal = document.getElementById('maxValue');
  
//   if (desktopMin && desktopMax) {
//     desktopMin.min = minPrice;
//     desktopMin.max = maxPrice;
//     desktopMin.value = minPrice;
    
//     desktopMax.min = minPrice;
//     desktopMax.max = maxPrice;
//     desktopMax.value = maxPrice;
    
//     if (desktopMinVal) desktopMinVal.textContent = `₹${minPrice}`;
//     if (desktopMaxVal) desktopMaxVal.textContent = `₹${maxPrice}`;
    
//     // Update filter state
//     filterState.minPrice = minPrice;
//     filterState.maxPrice = maxPrice;
//   }
  
//   // Update mobile sliders
//   const mobileMin = document.getElementById('mobileMinThumb');
//   const mobileMax = document.getElementById('mobileMaxThumb');
//   const mobileMinVal = document.getElementById('mobileMinValue');
//   const mobileMaxVal = document.getElementById('mobileMaxValue');
  
//   if (mobileMin && mobileMax) {
//     mobileMin.min = minPrice;
//     mobileMin.max = maxPrice;
//     mobileMin.value = minPrice;
    
//     mobileMax.min = minPrice;
//     mobileMax.max = maxPrice;
//     mobileMax.value = maxPrice;
    
//     if (mobileMinVal) mobileMinVal.textContent = `₹${minPrice}`;
//     if (mobileMaxVal) mobileMaxVal.textContent = `₹${maxPrice}`;
//   }
// }

// function syncFilterStates() {
//   debugLog('Syncing filter states...');
  
//   // Sync desktop radios with filterState
//   const categoryRadio = document.querySelector(`#filterSidebar input[name="category"][value="${filterState.category}"]`);
//   if (categoryRadio) categoryRadio.checked = true;
  
//   const brandRadio = document.querySelector(`#filterSidebar input[name="brand"][value="${filterState.brand}"]`);
//   if (brandRadio) brandRadio.checked = true;
  
//   const discountRadio = document.querySelector(`#filterSidebar input[name="discount"][value="${filterState.discount}"]`);
//   if (discountRadio) discountRadio.checked = true;
  
//   // Sync mobile radios with filterState
//   const mobileCategoryRadio = document.querySelector(`#filterSheet input[name="mobileCategory"][value="${filterState.category}"]`);
//   if (mobileCategoryRadio) mobileCategoryRadio.checked = true;
  
//   const mobileBrandRadio = document.querySelector(`#filterSheet input[name="mobileBrand"][value="${filterState.brand}"]`);
//   if (mobileBrandRadio) mobileBrandRadio.checked = true;
  
//   const mobileDiscountRadio = document.querySelector(`#filterSheet input[name="mobileDiscount"][value="${filterState.discount}"]`);
//   if (mobileDiscountRadio) mobileDiscountRadio.checked = true;
  
//   // Update category title
//   const categoryTitle = document.getElementById('categoryTitle');
//   if (categoryTitle) {
//     if (filterState.category === 'all') {
//       categoryTitle.textContent = 'All Wellness Products';
//     } else {
//       const category = WELLNESS_CATEGORIES.find(cat => cat.id === filterState.category);
//       categoryTitle.textContent = category ? category.name : 'Wellness Products';
//     }
//   }
  
//   // Update page title
//   const pageTitleEl = document.getElementById("pageTitle");
//   if (pageTitleEl) {
//     if (filterState.category === 'all') {
//       pageTitleEl.textContent = 'Wellness Essentials';
//     } else {
//       const category = WELLNESS_CATEGORIES.find(cat => cat.id === filterState.category);
//       pageTitleEl.textContent = category ? category.name : 'Wellness Essentials';
//     }
//   }
  
//   debugLog('Filter states synced');
// }

// // ==================== HEADER COUNTS ====================
// function updateHeaderCounts() {
//   const updateBadge = (id, count) => {
//     const el = document.getElementById(id);
//     if (el) {
//       el.textContent = count;
//       el.classList.toggle("hidden", count === 0);
//     }
//   };
//   const cartTotal = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
//   updateBadge("cartCount", cartTotal);
//   updateBadge("wishlistCount", wishlist.length);
// }

// // ==================== WISHLIST ====================
// function toggleWishlist(id) {
//   const product = allProducts.find(p => p.id === id);
//   if (!product) return;

//   const index = wishlist.findIndex(item => item.id === id);

//   if (index > -1) {
//     wishlist.splice(index, 1);
//     showToast("Removed from wishlist ♥", "info");
//   } else {
//     const wishlistItem = {
//       id: product.id,
//       name: product.title.split(' (')[0].trim(),
//       price: product.price,
//       originalPrice: product.originalPrice || null,
//       image: product.image,
//       brand: product.brand,
//       sku: product.sku,
//       description: product.description
//     };
//     wishlist.push(wishlistItem);
//     showToast("Added to wishlist ♥", "success");
//   }

//   localStorage.setItem("wishlist", JSON.stringify(wishlist));
//   updateHeaderCounts();
//   renderProducts();
// }

// // ==================== PRODUCT CARD ====================
// function createProductCard(p) {
//   const inWishlist = wishlist.some(x => x.id === p.id);
//   const isOutOfStock = !p.inStock;
//   const categoryData = categoryNames[p.category] || categoryNames['all'];

//   return `
//     <div class="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100
//                 ${isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : ''}"
//          ${!isOutOfStock ? `onclick="viewProductDetails(${p.id})"` : ''}
//          style="${isOutOfStock ? 'pointer-events: none;' : 'cursor: pointer;'}">

//       <div class="relative bg-gray-50 aspect-[6/4] overflow-hidden">
//         <img src="${p.image}" alt="${p.title}"
//              class="w-full h-full object-contain p-5 transition-transform duration-500 ${!isOutOfStock ? 'group-hover:scale-110' : ''}"
//              onerror="this.src='https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop'">

//         <div class="absolute top-2 left-2 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10
//                     ${isOutOfStock ? 'bg-red-600' : 'bg-green-600'}">
//           ${isOutOfStock ? 'Out of Stock' : 'In Stock'}
//         </div>

//         <button onclick="event.stopPropagation(); toggleWishlist(${p.id})"
//                 class="absolute top-2 right-2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center 
//                        ${isOutOfStock ? 'opacity-50' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-10">
//           <i class="${inWishlist ? 'fas fa-heart text-red-500' : 'far fa-heart text-gray-600'} text-lg"></i>
//         </button>
//       </div>

//       <div class="p-3">
//         <div class="flex justify-between items-start">
//           <p class="text-xs text-gray-500 uppercase font-medium truncate">${p.brand || 'Brand'}</p>
//           <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${categoryData.title.split(' ')[0]}</span>
//         </div>
//         <h3 class="text-sm font-medium text-gray-800 line-clamp-2 mt-1">${p.title}</h3>
//         <p class="text-xs text-gray-500 mt-1">${p.subcategory || 'Wellness Product'}</p>

//         <div class="mt-2 flex items-center gap-2">
//           <span class="text-lg font-bold text-green-600">₹${p.price.toLocaleString()}</span>
//           ${p.originalPrice > p.price ? `
//             <span class="text-sm text-gray-500 line-through">₹${p.originalPrice.toLocaleString()}</span>
//           ` : ''}
//           ${p.discount > 0 ? `<span class="text-sm font-medium text-red-500">${p.discount}% OFF</span>` : ''}
//         </div>

//         <div class="flex items-center mt-2">
//           <div class="flex text-yellow-400">
//             ${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}
//           </div>
//           <span class="text-xs text-gray-500 ml-2">(${p.reviewCount})</span>
//         </div>

//         <button onclick="event.stopPropagation(); viewProductDetails(${p.id})"
//                 class="mt-3 w-full font-medium text-sm py-2.5 rounded-lg transition
//                         ${isOutOfStock 
//                           ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
//                           : 'bg-[#36C2CE] hover:bg-[#2aa8b3] text-white'}">
//           ${isOutOfStock ? 'Out of Stock' : 'View Details'}
//         </button>
//       </div>
//     </div>
//   `;
// }

// // ==================== RENDERING ====================
// function renderProducts() {
//   debugLog('Rendering products, filteredProducts length:', filteredProducts.length);
  
//   const start = (currentPage - 1) * pageSize;
//   const paginated = filteredProducts.slice(start, start + pageSize);
//   const grid = document.getElementById("productsGrid");

//   if (grid) {
//     if (paginated.length > 0) {
//       grid.innerHTML = paginated.map(createProductCard).join("");
      
//       // Show/Hide "Show More" button
//       const showMoreBtn = document.getElementById('showMoreBtn');
//       const showMoreContainer = document.getElementById('showMoreContainer');
//       if (showMoreBtn && showMoreContainer) {
//         if (filteredProducts.length > pageSize * currentPage) {
//           showMoreContainer.classList.remove('hidden');
//         } else {
//           showMoreContainer.classList.add('hidden');
//         }
//       }
//     } else {
//       grid.innerHTML = `
//         <div class="col-span-full text-center py-10">
//           <div class="text-gray-400 mb-4">
//             <i class="fas fa-search text-5xl"></i>
//           </div>
//           <p class="text-gray-500 mb-2">No wellness products found</p>
//           <p class="text-gray-400 text-sm">Try changing your filters</p>
//           <button onclick="clearFilters()" class="mt-4 px-4 py-2 bg-[#36C2CE] text-white rounded-lg">
//             Clear Filters
//           </button>
//         </div>
//       `;
      
//       // Hide "Show More" button when no products
//       const showMoreContainer = document.getElementById('showMoreContainer');
//       if (showMoreContainer) showMoreContainer.classList.add('hidden');
//     }
//   }

//   setText("resultsCount", `Showing ${filteredProducts.length} products`);
//   renderPagination();
// }

// function renderPagination() {
//   const container = document.getElementById("pagination");
//   if (!container) return;
  
//   const totalPages = Math.ceil(filteredProducts.length / pageSize);
//   container.innerHTML = "";
  
//   if (totalPages <= 1) return;
  
//   for (let i = 1; i <= totalPages; i++) {
//     const btn = document.createElement("button");
//     btn.textContent = i;
//     btn.className = `px-4 py-2 rounded border mx-1 ${i === currentPage ? 'bg-[#36C2CE] text-white' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`;
//     btn.onclick = () => { 
//       currentPage = i; 
//       renderProducts();
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     };
//     container.appendChild(btn);
//   }
// }

// // Show more products function
// function showMoreProducts() {
//   if (filteredProducts.length > pageSize * currentPage) {
//     currentPage++;
//     renderProducts();
//   }
// }

// // ==================== CATEGORY CARDS ====================
// function initCategoryCards() {
//   const categoryCards = document.querySelectorAll('.category-card');
  
//   categoryCards.forEach(card => {
//     card.addEventListener('click', function() {
//       // Remove active class from all cards
//       categoryCards.forEach(c => c.classList.remove('active'));
      
//       // Add active class to clicked card
//       this.classList.add('active');
      
//       // Get category from data attribute
//       const category = this.dataset.category;
      
//       // Update category in filters
//       filterState.category = category;
      
//       // Update radio buttons in desktop and mobile filters
//       updateRadioButtons('category', category);
//       updateRadioButtons('mobileCategory', category);
      
//       // Apply filters
//       applyFilters();
//     });
//   });
// }

// function updateCategoryCardsUI() {
//   const categoryCards = document.querySelectorAll('.category-card');
//   categoryCards.forEach(card => {
//     if (card.dataset.category === filterState.category) {
//       card.classList.add('active');
//     } else {
//       card.classList.remove('active');
//     }
//   });
// }

// function updateRadioButtons(name, value) {
//   const radios = document.querySelectorAll(`input[name="${name}"]`);
//   radios.forEach(radio => {
//     radio.checked = (radio.value === value);
//   });
// }

// // ==================== EVENT LISTENERS ====================
// function initFilterEventListeners() {
//   debugLog('Initializing filter event listeners...');
  
//   // Desktop Category Filters
//   document.addEventListener('change', (e) => {
//     if (e.target.name === 'category') {
//       filterState.category = e.target.value;
//       debugLog('Desktop category changed to:', filterState.category);
//       updateCategoryCardsUI();
//       applyFilters();
//     }
    
//     if (e.target.name === 'mobileCategory') {
//       filterState.category = e.target.value;
//       debugLog('Mobile category changed to:', filterState.category);
//       updateCategoryCardsUI();
//     }
    
//     if (e.target.name === 'brand') {
//       filterState.brand = e.target.value;
//       debugLog('Desktop brand changed to:', filterState.brand);
//       applyFilters();
//     }
    
//     if (e.target.name === 'mobileBrand') {
//       filterState.brand = e.target.value;
//       debugLog('Mobile brand changed to:', filterState.brand);
//     }
    
//     if (e.target.name === 'discount') {
//       filterState.discount = parseInt(e.target.value);
//       debugLog('Desktop discount changed to:', filterState.discount);
//       applyFilters();
//     }
    
//     if (e.target.name === 'mobileDiscount') {
//       filterState.discount = parseInt(e.target.value);
//       debugLog('Mobile discount changed to:', filterState.discount);
//     }
//   });
  
//   // Apply Desktop Filters Button
//   const applyDesktopBtn = document.getElementById('applyDesktopFilters');
//   if (applyDesktopBtn) {
//     applyDesktopBtn.addEventListener('click', applyFilters);
//   }
  
//   // Apply Mobile Filters Button
//   const applyMobileBtn = document.getElementById('applyMobileFilters');
//   if (applyMobileBtn) {
//     applyMobileBtn.addEventListener('click', () => {
//       applyFilters();
//       document.getElementById('filterSheet').classList.add('translate-y-full');
//       document.getElementById('mobileSheetBackdrop').classList.add('hidden');
//     });
//   }
  
//   // Clear Mobile Filters
//   const clearMobileBtn = document.getElementById('clearMobileFilters');
//   if (clearMobileBtn) {
//     clearMobileBtn.addEventListener('click', () => {
//       clearFilters();
//       document.getElementById('filterSheet').classList.add('translate-y-full');
//       document.getElementById('mobileSheetBackdrop').classList.add('hidden');
//     });
//   }
  
//   // Sort Select
//   const sortSelect = document.getElementById("sortSelect");
//   if (sortSelect) {
//     sortSelect.value = filterState.sort;
//     sortSelect.addEventListener("change", (e) => {
//       filterState.sort = e.target.value;
//       sortProducts(filterState.sort);
//       renderProducts();
//     });
//   }
  
//   // Apply Sort Button
//   const applySortBtn = document.getElementById("applySortBtn");
//   if (applySortBtn) {
//     applySortBtn.addEventListener('click', () => {
//       const sort = document.querySelector('input[name="mobileSort"]:checked')?.value || 'default';
//       filterState.sort = sort;
      
//       if (sortSelect) sortSelect.value = sort;
      
//       sortProducts(sort);
//       renderProducts();
      
//       document.getElementById('sortSheet').classList.add('translate-y-full');
//       document.getElementById('mobileSheetBackdrop').classList.add('hidden');
//     });
//   }
  
//   // Show More Button
//   const showMoreBtn = document.getElementById('showMoreBtn');
//   if (showMoreBtn) {
//     showMoreBtn.addEventListener('click', showMoreProducts);
//   }
  
//   debugLog('Filter event listeners initialized');
// }

// // ==================== PRICE SLIDERS ====================
// function initPriceSliders() {
//   // Desktop sliders
//   const desktopMin = document.getElementById('minThumb');
//   const desktopMax = document.getElementById('maxThumb');
  
//   if (desktopMin && desktopMax) {
//     desktopMin.addEventListener('input', (e) => {
//       const value = parseInt(e.target.value);
//       const maxValue = parseInt(desktopMax.value);
      
//       if (value > maxValue) {
//         e.target.value = maxValue;
//         filterState.minPrice = maxValue;
//       } else {
//         filterState.minPrice = value;
//       }
      
//       document.getElementById('minValue').textContent = `₹${filterState.minPrice}`;
//       applyFilters();
//     });
    
//     desktopMax.addEventListener('input', (e) => {
//       const value = parseInt(e.target.value);
//       const minValue = parseInt(desktopMin.value);
      
//       if (value < minValue) {
//         e.target.value = minValue;
//         filterState.maxPrice = minValue;
//       } else {
//         filterState.maxPrice = value;
//       }
      
//       document.getElementById('maxValue').textContent = `₹${filterState.maxPrice}`;
//       applyFilters();
//     });
//   }
  
//   // Mobile sliders
//   const mobileMin = document.getElementById('mobileMinThumb');
//   const mobileMax = document.getElementById('mobileMaxThumb');
  
//   if (mobileMin && mobileMax) {
//     mobileMin.addEventListener('input', (e) => {
//       const value = parseInt(e.target.value);
//       const maxValue = parseInt(mobileMax.value);
      
//       if (value > maxValue) {
//         e.target.value = maxValue;
//         filterState.minPrice = maxValue;
//       } else {
//         filterState.minPrice = value;
//       }
      
//       document.getElementById('mobileMinValue').textContent = `₹${filterState.minPrice}`;
//     });
    
//     mobileMax.addEventListener('input', (e) => {
//       const value = parseInt(e.target.value);
//       const minValue = parseInt(mobileMin.value);
      
//       if (value < minValue) {
//         e.target.value = minValue;
//         filterState.maxPrice = minValue;
//       } else {
//         filterState.maxPrice = value;
//       }
      
//       document.getElementById('mobileMaxValue').textContent = `₹${filterState.maxPrice}`;
//     });
//   }
// }

// // ==================== VIEW PRODUCT DETAILS ====================
// function viewProductDetails(id) {
//   const product = allProducts.find(p => p.id === id);
//   if (!product) {
//     showToast('Product not found');
//     return;
//   }
  
//   if (!product.inStock) {
//     showToast('This product is currently out of stock', "info");
//     return;
//   }

//   // Store in sessionStorage for product details page
//   sessionStorage.setItem('selectedProduct', JSON.stringify(product));
  
//   // Navigate to product details page
//   window.location.href = `../../productdetails.html?id=${product.id}&name=${encodeURIComponent(product.title)}&price=${product.price}`;
// }

// // ==================== MOBILE SHEETS ====================
// function initMobileSheets() {
//   const backdrop = document.getElementById("mobileSheetBackdrop");
//   const filterSheet = document.getElementById("filterSheet");
//   const sortSheet = document.getElementById("sortSheet");
  
//   if (!backdrop || !filterSheet || !sortSheet) {
//     console.warn('Mobile sheet elements not found');
//     return;
//   }
  
//   // Open Filter Sheet
//   document.getElementById("openFilterSheet")?.addEventListener("click", () => {
//     filterSheet.classList.remove("translate-y-full");
//     backdrop.classList.remove("hidden");
//   });
  
//   // Open Sort Sheet
//   document.getElementById("openSortSheet")?.addEventListener("click", () => {
//     sortSheet.classList.remove("translate-y-full");
//     backdrop.classList.remove("hidden");
//   });
  
//   // Close Filter Sheet
//   document.getElementById("closeFilterSheet")?.addEventListener("click", () => {
//     filterSheet.classList.add("translate-y-full");
//     backdrop.classList.add("hidden");
//   });
  
//   // Close Sort Sheet
//   document.getElementById("closeSortSheet")?.addEventListener("click", () => {
//     sortSheet.classList.add("translate-y-full");
//     backdrop.classList.add("hidden");
//   });
  
//   // Close on backdrop click
//   backdrop.addEventListener("click", () => {
//     filterSheet.classList.add("translate-y-full");
//     sortSheet.classList.add("translate-y-full");
//     backdrop.classList.add("hidden");
//   });
// }

// // ==================== BANNER SLIDER ====================
// function initBannerSlider() {
//   const slides = document.querySelectorAll('.banner-slide');
//   const dots = document.querySelectorAll('.banner-dot');
  
//   if (slides.length === 0) return;
  
//   let currentSlide = 0;
  
//   function showSlide(index) {
//     slides.forEach((slide, i) => {
//       slide.classList.toggle('active', i === index);
//     });
    
//     dots.forEach((dot, i) => {
//       dot.classList.toggle('active', i === index);
//     });
    
//     currentSlide = index;
//   }
  
//   // Auto-rotate slides every 5 seconds
//   setInterval(() => {
//     let nextSlide = currentSlide + 1;
//     if (nextSlide >= slides.length) {
//       nextSlide = 0;
//     }
//     showSlide(nextSlide);
//   }, 5000);
  
//   // Add click handlers to dots
//   dots.forEach((dot, index) => {
//     dot.addEventListener('click', () => {
//       showSlide(index);
//     });
//   });
// }

// // ==================== INITIALIZATION ====================
// function init() {
//   console.log('Initializing Wellness Essentials page...');
  
//   // Initialize mobile sheets
//   initMobileSheets();
  
//   // Initialize price sliders
//   initPriceSliders();
  
//   // Initialize sort select
//   const sortSelect = document.getElementById("sortSelect");
//   if (sortSelect) {
//     sortSelect.value = filterState.sort;
//     sortSelect.addEventListener("change", (e) => {
//       filterState.sort = e.target.value;
//       sortProducts(filterState.sort);
//       renderProducts();
//     });
//   }
  
//   // Initialize "Show More" button
//   const showMoreBtn = document.getElementById('showMoreBtn');
//   if (showMoreBtn) {
//     showMoreBtn.addEventListener('click', showMoreProducts);
//   }
  
//   // Initialize category cards
//   initCategoryCards();
  
//   // Fetch initial products from backend
//   fetchProducts();
  
//   // Update header counts
//   updateHeaderCounts();
  
//   // Initialize banner slider
//   initBannerSlider();
// }

// // ==================== ON LOAD ====================
// document.addEventListener("DOMContentLoaded", init);``