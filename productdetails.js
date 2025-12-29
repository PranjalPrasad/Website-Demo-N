// ==================== productdetails.js ====================
const API_BASE_URL = 'http://localhost:8083/api/products';
const API_BASE_IMG_URL = 'http://localhost:8083';
const CART_API_BASE = 'http://localhost:8083/api/cart';
const WISHLIST_API_BASE = 'http://localhost:8083/api/wishlist';
const FALLBACK_IMAGE = './Images/product_details_fallback_img.jpg';

// Global variables
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let currentProduct = null;
let currentUserId = 1;
let selectedVariantIndex = 0;

// ------------------- Utility Functions -------------------
function removeSkeleton() {
    document.querySelectorAll('.skeleton').forEach(el => {
        el.classList.remove('skeleton');
        el.style.background = '';
        el.style.backgroundImage = '';
        el.style.animation = '';
    });
}

function showToast(message, type = "success") {
    document.querySelectorAll('.toast-notification').forEach(toast => toast.remove());
    const toast = document.createElement('div');
    toast.className = `toast-notification fixed top-20 right-4 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    ['desktop-cart-count', 'mobile-cart-count'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = total;
            el.style.display = total > 0 ? 'flex' : 'none';
        }
    });
}

function updateRightCartPanel() {
    const items = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const countEl = document.getElementById('cart-items-number');
    const textEl = document.getElementById('cart-items-text');
    const fullText = document.getElementById('cart-item-count-display');
    if (countEl) countEl.textContent = items;
    if (textEl) textEl.textContent = items === 1 ? '' : 's';
    if (fullText) {
        fullText.innerHTML = items === 0
            ? 'Your cart is empty'
            : `<span id="cart-items-number">${items}</span> Item<span id="cart-items-text">${items === 1 ? '' : 's'}</span> in Cart`;
    }
}

function updateLocalCart(product, qty = 1) {
    const cartItem = {
        id: product.id,
        name: product.name,
        price: Number(product.selectedPrice),
        image: product.image,
        quantity: qty,
        brand: product.brand || '',
        unit: product.selectedSize || '',
        type: "PRODUCT",
        productId: product.id,
        productType: "MEDICINE"
    };
    const existing = cart.find(item => item.id == cartItem.id && item.unit === cartItem.unit);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push(cartItem);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    updateRightCartPanel();
}

// ------------------- Backend Cart & Wishlist -------------------
async function getValidUserId() {
    const testIds = [1, 100, 1000, 1001, 10000];
    for (const testId of testIds) {
        try {
            const response = await fetch(`${CART_API_BASE}/get-cart-items?userId=${testId}`);
            if (response.ok) return testId;
        } catch (e) {}
    }
    return 1;
}

async function addToCartBackend(product, qty = 1) {
    try {
        const payload = {
            userId: currentUserId,
            type: "PRODUCT",
            productId: product.id,
            quantity: qty,
            selectedSize: product.selectedSize || "",
            productType: "MEDICINE"
        };
        const response = await fetch(`${CART_API_BASE}/add-cart-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const err = await response.text();
            if (err.includes("User not found")) {
                currentUserId = await getValidUserId();
                payload.userId = currentUserId;
                const retry = await fetch(`${CART_API_BASE}/add-cart-items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                return retry.ok;
            }
            throw new Error(err);
        }
        return true;
    } catch (err) {
        console.error("Backend cart error:", err);
        return false;
    }
}

async function syncCartFromBackend() {
    try {
        const response = await fetch(`${CART_API_BASE}/get-cart-items?userId=${currentUserId}`);
        if (response.ok) {
            const items = await response.json();
            cart = items.map(item => ({
                id: item.itemId,
                name: item.title,
                price: Number(item.price),
                image: item.imageUrl,
                quantity: item.quantity,
                brand: '',
                unit: item.selectedSize || '',
                type: item.type,
                productId: item.itemId,
                productType: item.productType
            }));
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            updateRightCartPanel();
        }
    } catch (err) {
        console.error("Failed to sync cart:", err);
    }
}

async function addToWishlistBackend(product) {
    try {
        const response = await fetch(`${WISHLIST_API_BASE}/add-wishlist-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, productId: product.id, productType: "MEDICINE" })
        });
        return response.ok;
    } catch (err) { console.error(err); return false; }
}

async function removeFromWishlistBackend(product) {
    try {
        const response = await fetch(`${WISHLIST_API_BASE}/remove-wishlist-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId, productId: product.id })
        });
        return response.ok;
    } catch (err) { console.error(err); return false; }
}

async function isInWishlistBackend(productId) {
    try {
        const response = await fetch(`${WISHLIST_API_BASE}/get-wishlist-items?userId=${currentUserId}`);
        if (!response.ok) return false;
        const items = await response.json();
        return items.some(item => item.productId == productId);
    } catch (err) { return false; }
}

function updateLocalWishlistSync(product, isAdded) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (isAdded) {
        if (!wishlist.some(p => p.id === product.id)) {
            wishlist.push({ id: product.id, name: product.name, price: product.selectedPrice, image: product.image, brand: product.brand, unit: product.selectedSize });
        }
    } else {
        wishlist = wishlist.filter(p => p.id !== product.id);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
}

async function toggleWishlist(product) {
    const btn = document.getElementById('wishlist-btn');
    if (!btn) return;
    const icon = btn.querySelector('i');
    const isAdded = icon.classList.contains('fas');
    const success = isAdded ? await removeFromWishlistBackend(product) : await addToWishlistBackend(product);
    if (success) {
        icon.className = isAdded ? 'far fa-heart text-2xl text-gray-600' : 'fas fa-heart text-2xl text-red-500';
        btn.title = isAdded ? 'Add to wishlist' : 'Remove from wishlist';
        showToast(isAdded ? 'Removed from wishlist!' : 'Added to wishlist!');
        updateLocalWishlistSync(product, !isAdded);
    }
}

function updateWishlistButton() {
    const btn = document.getElementById('wishlist-btn');
    if (!btn || !currentProduct) return;
    const icon = btn.querySelector('i');
    icon.className = 'far fa-heart text-2xl text-gray-600';
    btn.title = 'Add to wishlist';
    isInWishlistBackend(currentProduct.id).then(isAdded => {
        if (isAdded) {
            icon.className = 'fas fa-heart text-2xl text-red-500';
            btn.title = 'Remove from wishlist';
        }
        btn.onclick = () => toggleWishlist(currentProduct);
    });
}

async function addToCart(product, qty = 1) {
    const success = await addToCartBackend(product, qty);
    showToast(success ? `${qty} item${qty > 1 ? 's' : ''} added to cart!` : `${qty} item${qty > 1 ? 's' : ''} added locally`);
    updateLocalCart(product, qty);
}

// ------------------- Image Helper -------------------
function getImageUrl(path) {
    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return API_BASE_IMG_URL + path;
}

// ------------------- Variant & Price Logic -------------------
function updatePriceDisplay() {
    if (!currentProduct || !currentProduct.variants || currentProduct.variants.length === 0) {
        document.getElementById('selling-price').textContent = currentProduct?.priceText || '—';
        document.querySelector('.line-through')?.classList.add('hidden');
        document.getElementById('discount-badge')?.classList.add('hidden');
        return;
    }

    const variant = currentProduct.variants[selectedVariantIndex];
    document.getElementById('selling-price').textContent = `₹${variant.price.toFixed(0)}`;

    const mrpEl = document.getElementById('mrp-price');
    const discountBadge = document.getElementById('discount-badge');
    const lineThrough = document.querySelector('.line-through');

    if (variant.mrp && variant.mrp > variant.price) {
        mrpEl.textContent = `₹${variant.mrp.toFixed(0)}`;
        discountBadge.textContent = `${variant.discount}% OFF`;
        discountBadge.classList.remove('hidden');
        lineThrough?.classList.remove('hidden');
    } else {
        discountBadge.classList.add('hidden');
        lineThrough?.classList.add('hidden');
    }

    document.getElementById('product-unit').textContent = variant.size;
}

// Global function for variant selection with active state update
window.selectVariant = function(index) {
    selectedVariantIndex = index;
    updatePriceDisplay();

    // Update active button style
    document.querySelectorAll('#variant-selector button').forEach((btn, i) => {
        if (i === index) {
            btn.classList.remove('border-gray-300', 'hover:border-gray-400');
            btn.classList.add('border-pharmeasy-green', 'bg-pharmeasy-light-green');
        } else {
            btn.classList.remove('border-pharmeasy-green', 'bg-pharmeasy-light-green');
            btn.classList.add('border-gray-300', 'hover:border-gray-400');
        }
    });
};


// ------------------- API Calls -------------------
async function fetchProductById(productId) {
    const urls = [
        `${API_BASE_URL}/${productId}`,
        `${API_BASE_URL}/get-by-id/${productId}`,
        `${API_BASE_URL}/get-product/${productId}`,
        `${API_BASE_URL}/product/${productId}`
    ];
    for (const url of urls) {
        try {
            const res = await fetch(url);
            if (res.ok) return await res.json();
        } catch (e) {}
    }
    return null;
}

async function fetchRelatedProducts(category, currentId) {
    try {
        const res = await fetch(`${API_BASE_URL}/get-by-category/${encodeURIComponent(category)}`);
        if (!res.ok) return [];
        const products = await res.json();
        return products.filter(p => p.productId != currentId && p.productQuantity > 0 && !p.deleted).slice(0, 4);
    } catch (err) { return []; }
}


// Render variant selector
function renderVariantSelector() {
    const sizes = currentProduct.productSizes || [];
    if (sizes.length <= 1) return;

    let html = `
        <div id="variant-selector" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select Size:</label>
            <div class="flex flex-wrap gap-3">
    `;

    sizes.forEach((size, i) => {
        const price = currentProduct.productPrice[i] || 0;
        const activeClass = i === 0 ? 'border-pharmeasy-green bg-pharmeasy-light-green' : 'border-gray-300 hover:border-gray-400';
        html += `
            <button 
                class="px-4 py-2 border rounded-lg text-sm font-medium transition ${activeClass}"
                onclick="selectVariant(${i})">
                ${size} <span class="text-pharmeasy-green font-bold">₹${price.toFixed(0)}</span>
            </button>
        `;
    });

    html += `</div></div>`;

    const quantitySection = document.querySelector('#quantity-input').closest('.mb-6');
    quantitySection.insertAdjacentHTML('beforebegin', html);
}

// ------------------- Pincode Delivery Checker -------------------
function setupPincodeChecker() {
    const pincodeInput = document.getElementById('pincodeInput');
    const checkBtn = document.getElementById('checkPincodeBtn');
    if (!pincodeInput || !checkBtn) return;

    const resultDiv = document.getElementById('deliveryResult');
    const successDiv = document.getElementById('deliverySuccess');
    const errorDiv = document.getElementById('deliveryError');
    const locationText = document.getElementById('deliveryLocation');
    const deliveryTime = document.getElementById('deliveryTime');
    const deliveryOffer = document.getElementById('deliveryOffer');

    // Remove references to chargeText if it exists in HTML (no longer used)

    // Load saved pincode
    const savedPincode = localStorage.getItem('lastValidPincode');
    if (savedPincode) {
        pincodeInput.value = savedPincode;
        checkPincodeRealTime(savedPincode);
    }

    // Only digits, max 6
    pincodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    });

    const checkPincode = async () => {
        const pincode = pincodeInput.value.trim();
        if (pincode.length !== 6) {
            showToast('Enter a valid 6-digit pincode', 'error');
            return;
        }
        checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        checkBtn.disabled = true;
        await checkPincodeRealTime(pincode);
        checkBtn.innerHTML = '<i class="fas fa-search-location"></i> Check';
        checkBtn.disabled = false;
    };

    checkBtn.addEventListener('click', checkPincode);
    pincodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPincode();
    });

    // List of allowed villages/areas (all get FREE delivery)
    const allowedLocations = new Set([
        'alagudewadi', 'chaudharwadi', 'dhuldev', 'farandwadi', 'ghadge mala',
        'jadhavwadi', 'sastewadi', 'sonwadi bk', 'thakurki', 'tathavada', 'vidani',
        'bhadali bk', 'bhadali kh', 'bhilkatti', 'fadatarwadi', 'kambleshwar',
        'kashiwadi', 'khunte', 'kurvali kh', 'mirgaon', 'nimbhore', 'nirugudi',
        'saskal', 'shindewadi', 'somanthali', 'songaon', 'sonwadi kh', 'tavadi',
        'vadjal', 'vinchurni', 'wathar (nimbalkar)',
        'bagewadi', 'barad', 'bodkewadi', 'dalvadi', 'dhaval', 'dhavalewadi',
        'dhumalwadi', 'dombalwadi', 'dudhebavi', 'ghadgewadi', 'girvi', 'gunware',
        'hingangaon', 'jinti', 'kalaj', 'kharadewadi', 'malvadi', 'mathachiwadi',
        'mirdhe', 'mulikwadi', 'naik bombawadi', 'nandal', 'nimbalak', 'pimpalwadi',
        'pimparad', 'rajale', 'sangavi', 'sarade', 'sathe', 'sherechiwadi',
        'shereshindewadi', 'survadi', 'tadavale', 'takalwade', 'taradgaon',
        'tirakwadi', 'upalave', 'vadale', 'vadgaon', 'vajegaon', 'vitthalwadi',
        'wakhari'
    ].map(loc => loc.toLowerCase().trim()));

    async function checkPincodeRealTime(pincode) {
        resultDiv.classList.remove('hidden');
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (!data || data[0]?.Status !== "Success" || !data[0].PostOffice || data[0].PostOffice.length === 0) {
                showDeliveryError("Invalid pincode");
                return;
            }

            // Take the first post office (primary one)
            const postOffice = data[0].PostOffice[0];
            const villageName = postOffice.Name.toLowerCase().trim();

            // Check if the village/post office name matches your allowed list
            if (!allowedLocations.has(villageName)) {
                showDeliveryError("Delivery not available for this area");
                return;
            }

            // Success - Free Delivery for all allowed areas
            successDiv.classList.remove('hidden');
            errorDiv.classList.add('hidden');

            locationText.textContent = `${postOffice.Name}, Phaltan, Satara`;

            // Optional texts (customize as needed)
            if (deliveryTime) deliveryTime.textContent = 'Delivery within 2-5 days';
            if (deliveryOffer) deliveryOffer.textContent = 'Free Delivery • No minimum order required';

            // Save valid pincode
            localStorage.setItem('lastValidPincode', pincode);
            localStorage.setItem('lastDeliveryArea', `${postOffice.Name}, Phaltan`);

            showToast('Delivery available! Free Delivery', 'success');

        } catch (err) {
            console.error("Pincode check failed:", err);
            showDeliveryError("Network error. Please try again.");
        }
    }

    function showDeliveryError(message) {
        successDiv.classList.add('hidden');
        errorDiv.classList.remove('hidden');
        errorDiv.querySelector('p:last-child').textContent = message;
        localStorage.removeItem('lastValidPincode');
        localStorage.removeItem('lastDeliveryArea');
    }

    // Removed: getCoordinatesFromPincode(), calculateDistance()
}


// ------------------- Rendering Functions -------------------
async function renderThumbnails(mainPath, subPaths = []) {
    const container = document.getElementById('thumbnail-container');
    if (!container) return;
    container.innerHTML = '';

    const allImages = [getImageUrl(mainPath), ...subPaths.map(getImageUrl)];

    allImages.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Thumbnail';
        img.className = 'w-20 h-20 object-contain border-2 rounded-lg cursor-pointer hover:border-pharmeasy-green transition';
        img.onerror = () => img.src = FALLBACK_IMAGE;
        img.onclick = () => {
            document.getElementById('main-product-image').src = src;
            container.querySelectorAll('img').forEach(t => t.classList.remove('border-pharmeasy-green'));
            img.classList.add('border-pharmeasy-green');
        };
        container.appendChild(img);
    });

    if (container.children.length > 0) container.children[0].classList.add('border-pharmeasy-green');
}

function formatDate(dateStr) {
    if (!dateStr) return 'Not specified';
    try { return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
}

function renderProductDetailsTab() {
    const tbody = document.getElementById('specifications-table-body');
    if (!tbody || !currentProduct) return;
    tbody.innerHTML = '';
    const dyn = currentProduct.productDynamicFields || {};
    const rows = [
        { label: 'Product Description', value: currentProduct.productDescription || 'No description available' },
        { label: 'Brand', value: currentProduct.brandName || 'Generic' },
        { label: 'Category', value: currentProduct.productSubCategory || currentProduct.productCategory || 'Health Supplements' },
        { label: 'Manufacturing Date', value: formatDate(currentProduct.mfgDate) },
        { label: 'Expiry Date', value: formatDate(currentProduct.expDate) },
        { label: 'Batch Number', value: currentProduct.batchNo || 'Not specified' },
        { label: 'Available Quantity', value: currentProduct.productQuantity || 0 },
        { label: 'Form', value: dyn.form || 'Not specified' },
        { label: 'Strength', value: dyn.strength || 'Not specified' },
        { label: 'Country of Origin', value: dyn.countryOfOrigin || 'India' }
    ];
    rows.forEach((r, i) => {
        if (r.value && r.value.toString().trim()) {
            tbody.innerHTML += `
                <tr class="${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}">
                    <td class="spec-label py-3 px-6 border-b border-gray-200"><span class="font-semibold text-gray-700">${r.label}</span></td>
                    <td class="spec-value py-3 px-6 border-b border-gray-200 text-gray-600">${r.value}</td>
                </tr>
            `;
        }
    });
}

function renderBenefitsTab() {
    const el = document.getElementById('benefits-content');
    if (!el || !currentProduct) return;
    const list = currentProduct.benefitsList || [];
    el.innerHTML = list.length === 0
        ? `<div class="py-8"><h3 class="text-xl font-bold text-gray-800 mb-6">Product Benefits</h3><p class="text-gray-600">No benefits information available.</p></div>`
        : `<div class="py-8"><h3 class="text-xl font-bold text-gray-800 mb-6">Key Benefits</h3><div class="bg-white rounded-lg border p-6"><ul class="space-y-4">${list.map(b => `<li class="flex items-start"><span class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1"><i class="fas fa-check text-green-600 text-sm"></i></span><span class="text-gray-700">${b}</span></li>`).join('')}</ul></div></div>`;
}

function renderIngredientsTab() {
    const el = document.getElementById('ingredients-content');
    if (!el || !currentProduct) return;
    const list = currentProduct.ingredientsList || [];
    el.innerHTML = list.length === 0
        ? `<div class="py-8"><h3 class="text-xl font-bold text-gray-800 mb-6">Product Ingredients</h3><p class="text-gray-600">No ingredients information available.</p></div>`
        : `<div class="py-8"><h3 class="text-xl font-bold text-gray-800 mb-6">Product Composition</h3><div class="bg-white rounded-lg border p-6"><ul class="space-y-3">${list.map((ing, i) => `<li class="flex items-start"><span class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1 text-blue-600 text-xs font-bold">${i+1}</span><span class="text-gray-700">${ing}</span></li>`).join('')}</ul></div></div>`;
}

function renderDirectionsTab() {
    // const el = document.getElementById('directions-content');
    if (!el || !currentProduct) return;
    const list = currentProduct.directionsList || [];
    const dyn = currentProduct.productDynamicFields || {};
    let html = `<div class="py-8"><h3 class="text-xl font-bold text-gray-800 mb-6">Directions for Use</h3>`;
    if (list.length > 0) {
        html += `<div class="mb-8"><div class="bg-white rounded-lg border p-6"><ul class="space-y-4">${list.map((d, i) => `<li class="flex items-start"><span class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1 text-orange-600 font-bold">${i+1}</span><span class="text-gray-700">${d}</span></li>`).join('')}</ul></div></div>`;
    }
    const extra = [];
    if (dyn.dosage) extra.push({ l: 'Recommended Dosage', v: dyn.dosage });
    extra.push({ l: 'Prescription Required', v: currentProduct.prescriptionRequired ? '<span class="text-red-600 font-semibold">Yes</span>' : '<span class="text-green-600 font-semibold">No</span>' });
    if (dyn.storage) extra.push({ l: 'Storage Instructions', v: dyn.storage });
    if (dyn.suitableFor) extra.push({ l: 'Suitable For', v: dyn.suitableFor });
    if (extra.length > 0) {
        html += `<div><h4 class="text-lg font-bold text-gray-800 mb-4">Additional Information</h4><div class="bg-gray-50 rounded-lg border p-6"><table class="w-full"><tbody>${extra.map(e => `<tr class="border-b last:border-b-0"><td class="py-3 font-medium text-gray-700 w-1/3">${e.l}</td><td class="py-3 text-gray-600">${e.v}</td></tr>`).join('')}</tbody></table></div></div>`;
    }
    html += `</div>`;
    el.innerHTML = html;
}

function renderAllTabs() {
    renderProductDetailsTab();
    renderBenefitsTab();
    renderIngredientsTab();
    // renderDirectionsTab();
}

function renderRelatedProducts(products) {
    const container = document.getElementById('related-products-container');
    if (!container) return;
    container.innerHTML = products.length === 0 ? '<p class="col-span-full text-center text-gray-500 py-8">No related products found</p>' : '';
    products.forEach(p => {
        const priceText = p.productPrice?.length ? `₹${Math.min(...p.productPrice.filter(x=>x>0))}` : 'Price on request';
        container.innerHTML += `
            <div class="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition cursor-pointer">
                <img src="${getImageUrl(p.productMainImage)}" onerror="this.src='${FALLBACK_IMAGE}'" class="w-full h-40 object-cover rounded-lg mb-3" alt="${p.productName}">
                <h4 class="font-medium text-sm line-clamp-2 mb-1">${p.productName}</h4>
                <p class="text-xs text-gray-500">${p.brandName || 'Generic'}</p>
                <div class="mt-2"><span class="text-lg font-bold text-green-600">${priceText}</span></div>
                <button onclick="window.location.href='productdetails.html?id=${p.productId}'" class="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm">View Details</button>
            </div>
        `;
    });
}

// ------------------- Main Load Function -------------------
async function loadProduct() {
    currentUserId = await getValidUserId();
    await syncCartFromBackend();

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) return showNotFound();

    const product = await fetchProductById(productId);
    if (!product) return showNotFound();
    if (product.deleted) {
        document.getElementById('product-name').textContent = product.productName + ' (Unavailable)';
        document.body.style.filter = 'grayscale(100%) opacity(0.6)';
        document.body.style.pointerEvents = 'none';
        return showNotFound();
    }

    const sizes = product.productSizes || [];
    const prices = product.productPrice || [];
    const oldPrices = product.productOldPrice || [];

    const variants = sizes.map((size, i) => ({
        size,
        price: prices[i] || 0,
        mrp: oldPrices[i] || 0,
        discount: oldPrices[i] && oldPrices[i] > prices[i] ? Math.round(((oldPrices[i] - prices[i]) / oldPrices[i]) * 100) : 0
    }));

    currentProduct = {
        ...product,
        id: product.productId,
        name: product.productName,
        image: getImageUrl(product.productMainImage),
        brand: product.brandName,
        variants,
        selectedPrice: variants.length > 0 ? variants[0].price : 0,
        selectedSize: variants.length > 0 ? variants[0].size : ''
    };

    document.getElementById('product-name').textContent = currentProduct.name;

    const mainImg = document.getElementById('main-product-image');
    mainImg.src = currentProduct.image;
    mainImg.onerror = () => mainImg.src = FALLBACK_IMAGE;

    await renderThumbnails(product.productMainImage, product.productSubImages || []);

    renderVariantSelector();
    updatePriceDisplay();

    const isAvailable = currentProduct.productQuantity > 0 && product.productStock === 'In-Stock';
    const qtyInput = document.getElementById('quantity-input');
    const addBtn = document.getElementById('add-to-cart-btn');
    const buyBtn = document.getElementById('buy-now-btn');

    if (isAvailable) {
        qtyInput.max = Math.min(currentProduct.productQuantity, 10);
        qtyInput.value = 1;
        qtyInput.disabled = false;
        addBtn.disabled = false;
        addBtn.innerHTML = '<i class="fas fa-shopping-cart mr-2"></i> Add to Cart';
        addBtn.className = 'flex-1 px-2 bg-[#295F98] hover:bg-[#5C7285] text-white font-bold py-3 rounded-lg text-md shadow-lg transition flex items-center justify-center';
        buyBtn.disabled = false;
        buyBtn.innerHTML = '<i class="fas fa-bolt mr-2"></i> Buy Now';
        buyBtn.className = 'px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-md shadow-lg transition';
    } else {
        qtyInput.disabled = true;
        qtyInput.value = 0;
        addBtn.disabled = true;
        addBtn.innerHTML = '<i class="fas fa-times-circle mr-2"></i> Out of Stock';
        addBtn.className = 'flex-1 px-2 bg-gray-400 cursor-not-allowed text-white font-bold py-3 rounded-lg';
        buyBtn.disabled = true;
        buyBtn.innerHTML = '<i class="fas fa-times-circle mr-2"></i> Out of Stock';
        buyBtn.className = 'px-6 bg-gray-400 cursor-not-allowed text-white font-bold py-3 rounded-lg';
    }

    renderAllTabs();
    updateWishlistButton();

    const related = await fetchRelatedProducts(currentProduct.productCategory, currentProduct.id);
    renderRelatedProducts(related);

    initCartButtons();
    setupPincodeChecker(); // New feature
    removeSkeleton();
}

function showNotFound() {
    document.getElementById('product-name').textContent = 'Product Not Found or Unavailable';
    document.getElementById('main-product-image').src = FALLBACK_IMAGE;
    document.getElementById('selling-price').textContent = '—';
    document.getElementById('discount-badge').classList.add('hidden');
    document.querySelector('.line-through')?.classList.add('hidden');
    removeSkeleton();
}

function initTabs() {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + '-content').classList.add('active');
        });
    });
}

function initQuantitySelector() {
    const dec = document.getElementById('decrease-qty');
    const inc = document.getElementById('increase-qty');
    const input = document.getElementById('quantity-input');
    if (!dec || !inc || !input) return;
    dec.onclick = () => { if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1; };
    inc.onclick = () => { if (parseInt(input.value) < parseInt(input.max)) input.value = parseInt(input.value) + 1; };
    input.onchange = () => {
        let v = parseInt(input.value);
        if (isNaN(v) || v < 1) v = 1;
        if (v > parseInt(input.max)) v = parseInt(input.max);
        input.value = v;
    };
}

function initCartButtons() {
    const addBtn = document.getElementById('add-to-cart-btn');
    const buyBtn = document.getElementById('buy-now-btn');
    if (addBtn && currentProduct && currentProduct.productQuantity > 0) {
        addBtn.onclick = async () => {
            const qty = parseInt(document.getElementById('quantity-input').value) || 1;
            currentProduct.selectedPrice = currentProduct.variants?.[selectedVariantIndex]?.price || currentProduct.price;
            currentProduct.selectedSize = currentProduct.variants?.[selectedVariantIndex]?.size || '';
            await addToCart(currentProduct, qty);
        };
    }
    if (buyBtn && currentProduct && currentProduct.productQuantity > 0) {
        buyBtn.onclick = async () => {
            const qty = parseInt(document.getElementById('quantity-input').value) || 1;
            currentProduct.selectedPrice = currentProduct.variants?.[selectedVariantIndex]?.price || currentProduct.price;
            currentProduct.selectedSize = currentProduct.variants?.[selectedVariantIndex]?.size || '';
            await addToCart(currentProduct, qty);
            setTimeout(() => window.location.href = 'cart.html', 300);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initQuantitySelector();
    updateCartCount();
    updateRightCartPanel();
    loadProduct();

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInFromRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutToRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        .animate-in { animation: slideInFromRight 0.3s ease-out; }
        .animate-out { animation: slideOutToRight 0.3s ease-in; }
        .toast-notification { min-width: 300px; }
    `;
    document.head.appendChild(style);
});










//======================= OLD CODE =====================//


// // ==================== productdetails.js ====================
// const API_BASE_URL = 'http://localhost:8083/api/products';
// const CART_API_BASE = 'http://localhost:8083/api/cart';
// const WISHLIST_API_BASE = 'http://localhost:8083/api/wishlist';

// // Global variables
// let cart = JSON.parse(localStorage.getItem('cart') || '[]');
// let currentProduct = null;
// let currentUserId = 1; // Will be updated dynamically

// // ------------------- Utility Functions -------------------
// function removeSkeleton() {
//     document.querySelectorAll('.skeleton').forEach(el => {
//         el.classList.remove('skeleton');
//         el.style.background = '';
//         el.style.backgroundImage = '';
//         el.style.animation = '';
//     });
// }

// function showToast(message) {
//     document.querySelectorAll('.toast-notification').forEach(toast => toast.remove());
//     const toast = document.createElement('div');
//     toast.className = 'toast-notification fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right duration-300';
//     toast.textContent = message;
//     document.body.appendChild(toast);
//     setTimeout(() => {
//         toast.classList.add('animate-out', 'slide-out-to-right', 'duration-300');
//         setTimeout(() => toast.remove(), 300);
//     }, 3000);
// }

// function updateCartCount() {
//     const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
//     ['desktop-cart-count', 'mobile-cart-count'].forEach(id => {
//         const el = document.getElementById(id);
//         if (el) {
//             el.textContent = total;
//             el.style.display = total > 0 ? 'flex' : 'none';
//         }
//     });
// }

// function updateRightCartPanel() {
//     const items = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
//     const countEl = document.getElementById('cart-items-number');
//     const textEl = document.getElementById('cart-items-text');
//     const fullText = document.getElementById('cart-item-count-display');
//     if (countEl) countEl.textContent = items;
//     if (textEl) textEl.textContent = items === 1 ? '' : 's';
//     if (fullText) {
//         fullText.innerHTML = items === 0
//             ? 'Your cart is empty'
//             : `<span id="cart-items-number">${items}</span> Item<span id="cart-items-text">${items === 1 ? '' : 's'}</span> in Cart`;
//     }
// }

// // Local cart sync helper (used for UI consistency and offline fallback)
// function updateLocalCart(product, qty = 1) {
//     const cartItem = {
//         id: product.id,
//         name: product.name,
//         price: Number(product.price),
//         image: product.image,
//         quantity: qty,
//         brand: product.brand || '',
//         unit: product.unit || '',
//         type: "PRODUCT",
//         productId: product.id,
//         productType: "MEDICINE" // Adjust if you have different categories
//     };
//     const existing = cart.find(item => item.id == cartItem.id);
//     if (existing) {
//         existing.quantity += qty;
//     } else {
//         cart.push(cartItem);
//     }
//     localStorage.setItem('cart', JSON.stringify(cart));
//     updateCartCount();
//     updateRightCartPanel();
// }

// // ------------------- Backend Cart Functions -------------------
// async function getValidUserId() {
//     const testIds = [1, 100, 1000, 1001, 10000];
//     for (const testId of testIds) {
//         try {
//             const response = await fetch(`${CART_API_BASE}/get-cart-items?userId=${testId}`);
//             if (response.ok || response.status === 200) {
//                 return testId;
//             }
//         } catch (e) {
//             // continue
//         }
//     }
//     console.warn("No valid user ID found. Using default 1.");
//     return 1;
// }

// async function addToCartBackend(product, qty = 1) {
//     try {
//         const payload = {
//             userId: currentUserId,
//             type: "PRODUCT",
//             productId: product.id,
//             quantity: qty,
//             selectedSize: "", // No size for medicines usually
//             productType: "MEDICINE" // Change to MOTHER/BABY if needed
//         };
//         const response = await fetch(`${CART_API_BASE}/add-cart-items`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload)
//         });
//         if (!response.ok) {
//             const err = await response.text();
//             if (err.includes("User not found")) {
//                 currentUserId = await getValidUserId();
//                 payload.userId = currentUserId;
//                 const retry = await fetch(`${CART_API_BASE}/add-cart-items`, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(payload)
//                 });
//                 if (!retry.ok) throw new Error("Retry failed");
//                 const result = await retry.json();
//                 console.log("Cart add success (after retry):", result);
//                 return true;
//             }
//             throw new Error(err);
//         }
//         const result = await response.json();
//         console.log("Cart add success:", result);
//         return true;
//     } catch (err) {
//         console.error("Backend cart error:", err);
//         return false;
//     }
// }

// async function syncCartFromBackend() {
//     try {
//         const response = await fetch(`${CART_API_BASE}/get-cart-items?userId=${currentUserId}`);
//         if (response.ok) {
//             const items = await response.json();
//             cart = items.map(item => ({
//                 id: item.itemId,
//                 name: item.title,
//                 price: Number(item.price),
//                 image: item.imageUrl,
//                 quantity: item.quantity,
//                 brand: '',
//                 unit: '',
//                 type: item.type,
//                 productId: item.itemId,
//                 productType: item.productType
//             }));
//             localStorage.setItem('cart', JSON.stringify(cart));
//             updateCartCount();
//             updateRightCartPanel();
//         }
//     } catch (err) {
//         console.error("Failed to sync cart from backend:", err);
//     }
// }

// // ------------------- Backend Wishlist Functions -------------------
// async function addToWishlistBackend(product) {
//     try {
//         const response = await fetch(`${WISHLIST_API_BASE}/add-wishlist-items`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 userId: currentUserId,
//                 productId: product.id,
//                 productType: "MEDICINE" // Adjust if needed
//             })
//         });
//         return response.ok;
//     } catch (err) {
//         console.error("Wishlist add error:", err);
//         return false;
//     }
// }

// async function removeFromWishlistBackend(product) {
//     try {
//         const response = await fetch(`${WISHLIST_API_BASE}/remove-wishlist-items`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 userId: currentUserId,
//                 productId: product.id
//             })
//         });
//         return response.ok;
//     } catch (err) {
//         console.error("Wishlist remove error:", err);
//         return false;
//     }
// }

// async function isInWishlistBackend(productId) {
//     try {
//         const response = await fetch(`${WISHLIST_API_BASE}/get-wishlist-items?userId=${currentUserId}`);
//         if (!response.ok) return false;
//         const items = await response.json();
//         return items.some(item => item.productId == productId);
//     } catch (err) {
//         console.error("Wishlist check error:", err);
//         return false;
//     }
// }

// function updateLocalWishlistSync(product, isAdded) {
//     let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
//     if (isAdded) {
//         if (!wishlist.some(p => p.id === product.id)) {
//             wishlist.push({
//                 id: product.id,
//                 name: product.name,
//                 price: product.price,
//                 image: product.image,
//                 brand: product.brand,
//                 unit: product.unit
//             });
//         }
//     } else {
//         wishlist = wishlist.filter(p => p.id !== product.id);
//     }
//     localStorage.setItem('wishlist', JSON.stringify(wishlist));
//     window.dispatchEvent(new CustomEvent('wishlistUpdated'));
// }

// async function toggleWishlist(product) {
//     const wishlistBtn = document.getElementById('wishlist-btn');
//     if (!wishlistBtn) return;
//     const heartIcon = wishlistBtn.querySelector('i');
//     const isCurrentlyWishlisted = heartIcon.classList.contains('fas');
//     if (isCurrentlyWishlisted) {
//         const success = await removeFromWishlistBackend(product);
//         if (success) {
//             heartIcon.className = 'far fa-heart text-2xl text-gray-600';
//             wishlistBtn.title = 'Add to wishlist';
//             showToast('Removed from wishlist!');
//             updateLocalWishlistSync(product, false);
//         }
//     } else {
//         const success = await addToWishlistBackend(product);
//         if (success) {
//             heartIcon.className = 'fas fa-heart text-2xl text-red-500';
//             wishlistBtn.title = 'Remove from wishlist';
//             showToast('Added to wishlist!');
//             updateLocalWishlistSync(product, true);
//         }
//     }
// }

// function updateWishlistButton() {
//     const wishlistBtn = document.getElementById('wishlist-btn');
//     if (!wishlistBtn || !currentProduct) return;
//     const heartIcon = wishlistBtn.querySelector('i');
//     if (heartIcon) {
//         heartIcon.className = 'far fa-heart text-2xl text-gray-600'; // default
//         wishlistBtn.title = 'Add to wishlist';
//     }
//     // Check backend status
//     if (currentProduct) {
//         isInWishlistBackend(currentProduct.id).then(isWishlisted => {
//             if (isWishlisted) {
//                 heartIcon.className = 'fas fa-heart text-2xl text-red-500';
//                 wishlistBtn.title = 'Remove from wishlist';
//             }
//             wishlistBtn.onclick = () => toggleWishlist(currentProduct);
//         });
//     }
// }

// // ------------------- Updated Add to Cart -------------------
// async function addToCart(product, qty = 1) {
//     const success = await addToCartBackend(product, qty);
//     if (success) {
//         showToast(`${qty} ${qty > 1 ? 'items' : 'item'} added to cart!`);
//     } else {
//         showToast(`${qty} ${qty > 1 ? 'items' : 'item'} added to cart (saved locally)`);
//     }
//     // Always update local cart for UI consistency
//     updateLocalCart(product, qty);
// }

// // ------------------- API Calls -------------------
// async function fetchProductById(productId) {
//     try {
//         // Try most common endpoint variations - pick the one that matches your controller
//         const possibleUrls = [
//             `${API_BASE_URL}/${productId}`,                    // Option 1: @GetMapping("/{id}")
//             `${API_BASE_URL}/get-by-id/${productId}`,          // Option 2
//             `${API_BASE_URL}/get-product/${productId}`,        // your original
//             `${API_BASE_URL}/product/${productId}`             // Option 3
//         ];

//         for (const url of possibleUrls) {
//             console.log(`Trying product endpoint: ${url}`);
//             const response = await fetch(url);
//             if (response.ok) {
//                 console.log(`Success from: ${url}`);
//                 return await response.json();
//             }
//             console.warn(`Failed ${url} → ${response.status}`);
//         }

//         throw new Error('Product not found - tried multiple endpoints');
//     } catch (err) {
//         console.error("Product fetch error:", err);
//         return null;
//     }
// }

// async function fetchRelatedProducts(category, currentId) {
//     try {
//         const response = await fetch(`${API_BASE_URL}/get-by-category/${encodeURIComponent(category)}`);
//         if (!response.ok) return [];
//         const products = await response.json();
//         return products
//             .filter(p => p.productId != currentId && p.productQuantity > 0)
//             .sort(() => Math.random() - 0.5)
//             .slice(0, 4);
//     } catch (err) {
//         console.error(err);
//         return [];
//     }
// }

// // ------------------- Rendering Functions -------------------
// async function renderThumbnails(productId, mainImageUrl) {
//     const container = document.getElementById('thumbnail-container');
//     if (!container) return;
//     container.innerHTML = '';
//     const images = [mainImageUrl];
//     for (let i = 0; i < 5; i++) {
//         try {
//             const res = await fetch(`${API_BASE_URL}/${productId}/subimage/${i}`);
//             if (res.ok) {
//                 images.push(`${API_BASE_URL}/${productId}/subimage/${i}`);
//             } else {
//                 break;
//             }
//         } catch {
//             break;
//         }
//     }
//     images.forEach((src, index) => {
//         const img = document.createElement('img');
//         img.src = src;
//         img.alt = 'Product thumbnail';
//         img.className = 'w-20 h-20 object-contain border-2 rounded-lg cursor-pointer hover:border-pharmeasy-green transition';
//         img.onclick = () => {
//             document.getElementById('main-product-image').src = src;
//             container.querySelectorAll('img').forEach(t => t.classList.remove('border-pharmeasy-green'));
//             img.classList.add('border-pharmeasy-green');
//         };
//         container.appendChild(img);
//     });
//     if (container.children.length > 0) {
//         container.children[0].classList.add('border-pharmeasy-green');
//     }
// }

// function formatDate(dateStr) {
//     if (!dateStr) return 'Not specified';
//     try {
//         const date = new Date(dateStr);
//         return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
//     } catch {
//         return dateStr;
//     }
// }

// function renderProductDetailsTab() {
//     const tableBody = document.getElementById('specifications-table-body');
//     if (!tableBody || !currentProduct) return;
//     tableBody.innerHTML = '';
//     const dynamicFields = currentProduct.productDynamicFields || {};
//     const productDetails = [
//         { label: 'Product Description', value: currentProduct.productDescription || 'No description available' },
//         { label: 'Brand', value: currentProduct.brandName || 'Generic' },
//         { label: 'Category', value: currentProduct.productSubCategory || currentProduct.productCategory || 'Health Supplements' },
//         { label: 'Manufacturing Date', value: formatDate(currentProduct.mfgDate) },
//         { label: 'Expiry Date', value: formatDate(currentProduct.expDate) },
//         { label: 'Batch Number', value: currentProduct.batchNo || 'Not specified' },
//         { label: 'Product Status', value: currentProduct.productQuantity > 0 ?
//             '<span class="text-green-600 font-semibold">In Stock</span>' :
//             '<span class="text-red-600 font-semibold">Out of Stock</span>' },
//         { label: 'Available Quantity', value: currentProduct.productQuantity || 0 },
//         { label: 'Product Unit', value: currentProduct.productUnit || 'Not specified' },
//         { label: 'Form', value: dynamicFields.form || 'Not specified' },
//         { label: 'Strength', value: dynamicFields.strength || 'Not specified' },
//         { label: 'Shelf Life', value: dynamicFields.shelfLife || '24 months' },
//         { label: 'Country of Origin', value: dynamicFields.countryOfOrigin || 'India' }
//     ];
//     productDetails.forEach((detail, index) => {
//         if (detail.value && detail.value.toString().trim() !== '') {
//             const row = document.createElement('tr');
//             row.className = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
//             row.innerHTML = `
//                 <td class="spec-label py-3 px-6 border-b border-gray-200">
//                     <span class="font-semibold text-gray-700">${detail.label}</span>
//                 </td>
//                 <td class="spec-value py-3 px-6 border-b border-gray-200">
//                     <div class="text-gray-600">${detail.value}</div>
//                 </td>
//             `;
//             tableBody.appendChild(row);
//         }
//     });
// }

// function renderBenefitsTab() {
//     const content = document.getElementById('benefits-content');
//     if (!content || !currentProduct) return;
//     const benefits = currentProduct.benefitsList || [];
//     content.innerHTML = benefits.length === 0
//         ? `<div class="py-8"><h3 class="text-xl font-bold text-gray-800 mb-6">Product Benefits</h3><p class="text-gray-600">No benefits information available.</p></div>`
//         : `<div class="py-8">
//             <h3 class="text-xl font-bold text-gray-800 mb-6">Key Benefits</h3>
//             <div class="bg-white rounded-lg border border-gray-200 p-6">
//                 <ul class="space-y-4">
//                     ${benefits.map(b => `
//                         <li class="flex items-start">
//                             <span class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
//                                 <i class="fas fa-check text-green-600 text-sm"></i>
//                             </span>
//                             <span class="text-gray-700">${b}</span>
//                         </li>`).join('')}
//                 </ul>
//             </div>
//         </div>`;
// }

// function renderIngredientsTab() {
//     const content = document.getElementById('ingredients-content');
//     if (!content || !currentProduct) return;
//     const ingredients = currentProduct.ingredientsList || [];
//     content.innerHTML = ingredients.length === 0
//         ? `<div class="py-8"><h3 class="text-xl font-bold text-gray-800 mb-6">Product Ingredients</h3><p class="text-gray-600">No ingredients information available.</p></div>`
//         : `<div class="py-8">
//             <h3 class="text-xl font-bold text-gray-800 mb-6">Product Composition</h3>
//             <div class="bg-white rounded-lg border border-gray-200 p-6">
//                 <ul class="space-y-3">
//                     ${ingredients.map((ing, i) => `
//                         <li class="flex items-start">
//                             <span class="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-1">
//                                 <span class="text-blue-600 text-xs font-bold">${i + 1}</span>
//                             </span>
//                             <span class="text-gray-700">${ing}</span>
//                         </li>`).join('')}
//                 </ul>
//             </div>
//         </div>`;
// }

// function renderDirectionsTab() {
//     const content = document.getElementById('directions-content');
//     if (!content || !currentProduct) return;
//     const directions = currentProduct.directionsList || [];
//     const dynamic = currentProduct.productDynamicFields || {};
//     let html = `<div class="py-8"><h3 class="text-xl font-bold text-gray-800 mb-6">Directions for Use</h3>`;
//     if (directions.length > 0) {
//         html += `<div class="mb-8"><div class="bg-white rounded-lg border border-gray-200 p-6">
//             <ul class="space-y-4">
//                 ${directions.map((d, i) => `
//                     <li class="flex items-start">
//                         <span class="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-1">
//                             <span class="text-orange-600 font-bold">${i + 1}</span>
//                         </span>
//                         <span class="text-gray-700">${d}</span>
//                     </li>`).join('')}
//             </ul>
//         </div></div>`;
//     } else {
//         html += `<div class="mb-8"><p class="text-gray-600">No directions information available.</p></div>`;
//     }
//     const additional = [];
//     if (dynamic.dosage) additional.push({ label: 'Recommended Dosage', value: dynamic.dosage });
//     if (currentProduct.prescriptionRequired) {
//         additional.push({ label: 'Prescription Required', value: '<span class="text-red-600 font-semibold">Yes</span>' });
//     } else {
//         additional.push({ label: 'Prescription Required', value: '<span class="text-green-600 font-semibold">No</span>' });
//     }
//     if (dynamic.storage) additional.push({ label: 'Storage Instructions', value: dynamic.storage });
//     if (dynamic.suitableFor) additional.push({ label: 'Suitable For', value: dynamic.suitableFor });
//     if (additional.length > 0) {
//         html += `<div><h4 class="text-lg font-bold text-gray-800 mb-4">Additional Information</h4>
//             <div class="bg-gray-50 rounded-lg border border-gray-200 p-6">
//                 <table class="w-full"><tbody>
//                     ${additional.map(a => `
//                         <tr class="border-b border-gray-200 last:border-b-0">
//                             <td class="py-3 font-medium text-gray-700 w-1/3">${a.label}</td>
//                             <td class="py-3 text-gray-600">${a.value}</td>
//                         </tr>`).join('')}
//                 </tbody></table>
//             </div></div>`;
//     }
//     if (dynamic.warnings || dynamic.precautions) {
//         html += `<div class="mt-8"><h4 class="text-lg font-bold text-red-800 mb-4">⚠️ Important Warnings</h4>
//             <div class="bg-red-50 rounded-lg border border-red-200 p-6">
//                 <p class="text-red-700">${dynamic.warnings || dynamic.precautions}</p>
//             </div></div>`;
//     }
//     html += `</div>`;
//     content.innerHTML = html;
// }

// function renderAllTabs() {
//     renderProductDetailsTab();
//     renderBenefitsTab();
//     renderIngredientsTab();
//     renderDirectionsTab();
// }

// function renderRelatedProducts(products) {
//     const container = document.getElementById('related-products-container');
//     if (!container) return;
//     container.innerHTML = products.length === 0
//         ? '<p class="col-span-full text-center text-gray-500 py-8">No related products found</p>'
//         : '';
//     products.forEach(p => {
//         const price = p.productPrice || 0;
//         const mrp = p.productMRP || p.productOldPrice || 0;
//         const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
//         const card = document.createElement('div');
//         card.className = 'bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition cursor-pointer';
//         card.innerHTML = `
//             <img src="${API_BASE_URL}/${p.productId}/image" class="w-full h-40 object-cover rounded-lg mb-3" alt="${p.productName}">
//             <h4 class="font-medium text-sm line-clamp-2 mb-1">${p.productName}</h4>
//             <p class="text-xs text-gray-500">${p.brandName || 'Generic'}</p>
//             <div class="mt-2 flex items-center gap-2">
//                 <span class="text-lg font-bold text-green-600">₹${price.toFixed(0)}</span>
//                 ${mrp > price ? `
//                     <span class="text-sm text-gray-400 line-through">₹${mrp.toFixed(0)}</span>
//                     <span class="text-xs text-green-600 font-bold">${discount}% off</span>
//                 ` : ''}
//             </div>
//             <button onclick="window.location.href='productdetails.html?id=${p.productId}'"
//                 class="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
//                 View Details
//             </button>
//         `;
//         container.appendChild(card);
//     });
// }

// // ------------------- Main Load Function -------------------
// async function loadProduct() {
//     // Get valid user ID first
//     currentUserId = await getValidUserId();
//     await syncCartFromBackend();

//     const params = new URLSearchParams(window.location.search);
//     const productId = params.get('id');
//     if (!productId) {
//         showNotFound();
//         return;
//     }

//     console.log(`Loading product with ID: ${productId}`);

//     const product = await fetchProductById(productId);
//     if (!product) {
//         console.warn(`Product ${productId} not found or API error`);
//         showNotFound();
//         return;
//     }

//     currentProduct = {
//         ...product,
//         id: product.productId,
//         name: product.productName,
//         price: product.productPrice,
//         image: `${API_BASE_URL}/${product.productId}/image`,
//         brand: product.brandName,
//         unit: product.productUnit,
//         category: product.productCategory
//     };

//     document.getElementById('product-name').textContent = currentProduct.name;
//     document.getElementById('selling-price').textContent = '₹' + currentProduct.price.toFixed(0);

//     const mrpPriceEl = document.getElementById('mrp-price');
//     const discountBadge = document.getElementById('discount-badge');
//     const lineThrough = document.querySelector('.line-through');

//     if (product.productMRP && product.productMRP > currentProduct.price) {
//         const mrp = product.productMRP;
//         mrpPriceEl.textContent = '₹' + mrp.toFixed(0);
//         const discount = Math.round(((mrp - currentProduct.price) / mrp) * 100);
//         discountBadge.textContent = discount + '% OFF';
//         discountBadge.classList.remove('hidden');
//         if (lineThrough) lineThrough.classList.remove('hidden');
//     } else {
//         discountBadge.classList.add('hidden');
//         if (lineThrough) lineThrough.classList.add('hidden');
//     }

//     const productUnitEl = document.getElementById('product-unit');
//     if (productUnitEl && currentProduct.unit) {
//         productUnitEl.textContent = currentProduct.unit;
//     }

//     const mainImg = document.getElementById('main-product-image');
//     if (mainImg) {
//         mainImg.src = currentProduct.image;
//     }

//     await renderThumbnails(product.productId, currentProduct.image);

//     const quantityInput = document.getElementById('quantity-input');
//     const available = currentProduct.productQuantity || 0;
//     const addToCartBtn = document.getElementById('add-to-cart-btn');
//     const buyNowBtn = document.getElementById('buy-now-btn');

//     if (available > 0) {
//         quantityInput.max = Math.min(available, 10);
//         quantityInput.value = 1;
//         quantityInput.disabled = false;
//         addToCartBtn.disabled = false;
//         addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart mr-2"></i> Add to Cart';
//         addToCartBtn.className = 'flex-1 px-2 bg-[#295F98] hover:bg-[#5C7285] text-white font-bold py-3 rounded-lg text-md shadow-lg transition flex items-center justify-center';
//         buyNowBtn.disabled = false;
//         buyNowBtn.innerHTML = '<i class="fas fa-bolt mr-2"></i> Buy Now';
//         buyNowBtn.className = 'px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-md shadow-lg transition';
//     } else {
//         quantityInput.disabled = true;
//         quantityInput.value = 0;
//         quantityInput.placeholder = 'Out of Stock';
//         addToCartBtn.disabled = true;
//         addToCartBtn.innerHTML = '<i class="fas fa-times-circle mr-2"></i> Out of Stock';
//         addToCartBtn.className = 'flex-1 px-2 bg-gray-400 cursor-not-allowed text-white font-bold py-3 rounded-lg text-md shadow-lg transition flex items-center justify-center';
//         buyNowBtn.disabled = true;
//         buyNowBtn.innerHTML = '<i class="fas fa-times-circle mr-2"></i> Out of Stock';
//         buyNowBtn.className = 'px-6 bg-gray-400 cursor-not-allowed text-white font-bold py-3 rounded-lg text-md shadow-lg transition';
//     }

//     renderAllTabs();
//     updateWishlistButton();

//     const related = await fetchRelatedProducts(currentProduct.category, currentProduct.id);
//     renderRelatedProducts(related);

//     initCartButtons();
//     removeSkeleton();
// }

// function showNotFound() {
//     document.getElementById('product-name').textContent = 'Product Not Found';
//     document.getElementById('main-product-image').src = 'https://via.placeholder.com/600?text=Product+Not+Found';
//     document.getElementById('selling-price').textContent = '₹0';
//     document.getElementById('discount-badge').classList.add('hidden');
//     removeSkeleton();
// }

// // ------------------- Init Functions -------------------
// function initTabs() {
//     const tabButtons = document.querySelectorAll('.tab-button');
//     const tabContents = document.querySelectorAll('.tab-content');
//     tabButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             const tabId = button.getAttribute('data-tab');
//             tabButtons.forEach(btn => btn.classList.remove('active'));
//             tabContents.forEach(content => content.classList.remove('active'));
//             button.classList.add('active');
//             document.getElementById(`${tabId}-content`).classList.add('active');
//         });
//     });
// }

// function initQuantitySelector() {
//     const decreaseBtn = document.getElementById('decrease-qty');
//     const increaseBtn = document.getElementById('increase-qty');
//     const quantityInput = document.getElementById('quantity-input');
//     if (!decreaseBtn || !increaseBtn || !quantityInput) return;
//     decreaseBtn.onclick = () => {
//         const val = parseInt(quantityInput.value);
//         if (val > 1) quantityInput.value = val - 1;
//     };
//     increaseBtn.onclick = () => {
//         const val = parseInt(quantityInput.value);
//         const max = parseInt(quantityInput.max);
//         if (val < max) quantityInput.value = val + 1;
//     };
//     quantityInput.onchange = () => {
//         let val = parseInt(quantityInput.value);
//         const max = parseInt(quantityInput.max) || 10;
//         const min = 1;
//         if (isNaN(val) || val < min) val = min;
//         if (val > max) val = max;
//         quantityInput.value = val;
//     };
// }

// function initCartButtons() {
//     const addBtn = document.getElementById('add-to-cart-btn');
//     const buyBtn = document.getElementById('buy-now-btn');
//     if (addBtn && currentProduct && currentProduct.productQuantity > 0) {
//         addBtn.onclick = async () => {
//             const qty = parseInt(document.getElementById('quantity-input').value) || 1;
//             await addToCart(currentProduct, qty);
//         };
//     }
//     if (buyBtn && currentProduct && currentProduct.productQuantity > 0) {
//         buyBtn.onclick = async () => {
//             const qty = parseInt(document.getElementById('quantity-input').value) || 1;
//             await addToCart(currentProduct, qty);
//             setTimeout(() => window.location.href = 'cart.html', 300);
//         };
//     }
// }

// // ------------------- Page Init -------------------
// document.addEventListener('DOMContentLoaded', () => {
//     initTabs();
//     initQuantitySelector();
//     updateCartCount();
//     updateRightCartPanel();
//     loadProduct();
//     const style = document.createElement('style');
//     style.textContent = `
//         @keyframes slideInFromRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
//         @keyframes slideOutToRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
//         .animate-in { animation: slideInFromRight 0.3s ease-out; }
//         .animate-out { animation: slideOutToRight 0.3s ease-in; }
//         .toast-notification { min-width: 300px; }
//     `;
//     document.head.appendChild(style);
// });