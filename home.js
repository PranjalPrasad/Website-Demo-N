// ========== SINGLE SOURCE CART SYSTEM ==========
if (window.cartSystemInitialized) {
    console.warn('⚠️ Cart system already loaded. Skipping duplicate initialization.');
} else {
    window.cartSystemInitialized = true;
    console.log('✅ Initializing cart system...');

    function getCart() {
        try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
        catch (e) { localStorage.removeItem('cart'); return []; }
    }
    function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }

    function updateCartCount() {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        document.querySelectorAll('#desktop-cart-count, #mobile-cart-count, .cart-count, [id*="cart-count"], [class*="cart-count"]').forEach(el => {
            if (el) { el.textContent = totalItems; el.style.display = totalItems > 0 ? 'flex' : 'none'; }
        });
    }

    function showToast(message, type = 'add') {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = `fixed top-20 right-5 z-50 px-8 py-4 rounded-xl text-white font-bold shadow-2xl transition-all ${
            type === 'add' ? 'bg-green-600' : 'bg-red-600'
        } transform translate-x-full`;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        setTimeout(() => toast.remove(), 3000);
    }

    function restoreQuantitySelectors() {
        const cart = getCart();
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            const productId = btn.dataset.productId || btn.getAttribute('data-product-id');
            const item = cart.find(i => i.id == productId);
            const container = btn.closest('.relative') || btn.parentElement;
            const selector = container?.querySelector('.quantity-selector');
            const qtyDisplay = selector?.querySelector('.qty-display');
            if (selector && qtyDisplay) {
                if (item && item.quantity > 0) {
                    btn.classList.add('hidden'); selector.classList.remove('hidden'); qtyDisplay.textContent = item.quantity;
                } else { btn.classList.remove('hidden'); selector.classList.add('hidden'); }
            }
        });
    }

    let isProcessingClick = false;
    const MAX_QTY = 10;

    document.addEventListener('click', function handleGlobalClick(e) {
        if (isProcessingClick) return;
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
            isProcessingClick = true;
            const product = {
                id: addBtn.dataset.productId || addBtn.getAttribute('data-product-id'),
                name: addBtn.dataset.productName || addBtn.getAttribute('data-product-name'),
                price: parseFloat(addBtn.dataset.productPrice || addBtn.getAttribute('data-product-price')),
                image: addBtn.dataset.productImage || addBtn.getAttribute('data-product-image')
            };
            let cart = getCart();
            let existing = cart.find(item => item.id == product.id);
            if (existing) {
                if (existing.quantity >= MAX_QTY) { showToast(`Max ${MAX_QTY} items allowed!`, 'error'); isProcessingClick = false; return; }
                existing.quantity += 1;
            } else { cart.push({ ...product, quantity: 1 }); }
            saveCart(cart); restoreQuantitySelectors(); updateCartCount(); showToast('Added to cart! 🌿', 'add');
            setTimeout(() => { isProcessingClick = false; }, 300);
            return;
        }
        const increaseBtn = e.target.closest('.increase-qty');
        if (increaseBtn) {
            e.stopPropagation(); e.stopImmediatePropagation(); isProcessingClick = true;
            const selector = increaseBtn.closest('.quantity-selector');
            const qtyDisplay = selector.querySelector('.qty-display');
            const addBtnRef = selector.closest('.relative')?.querySelector('.add-to-cart-btn') || selector.parentElement.querySelector('.add-to-cart-btn');
            const productId = addBtnRef.dataset.productId || addBtnRef.getAttribute('data-product-id');
            let cart = getCart(); const item = cart.find(i => i.id == productId);
            if (!item || item.quantity >= MAX_QTY) { showToast(`Max ${MAX_QTY} allowed!`, 'error'); isProcessingClick = false; return; }
            item.quantity += 1; qtyDisplay.textContent = item.quantity; saveCart(cart); updateCartCount();
            setTimeout(() => { isProcessingClick = false; }, 300); return;
        }
        const decreaseBtn = e.target.closest('.decrease-qty');
        if (decreaseBtn) {
            e.stopPropagation(); e.stopImmediatePropagation(); isProcessingClick = true;
            const selector = decreaseBtn.closest('.quantity-selector');
            const qtyDisplay = selector.querySelector('.qty-display');
            const addBtnRef = selector.closest('.relative')?.querySelector('.add-to-cart-btn') || selector.parentElement.querySelector('.add-to-cart-btn');
            const productId = addBtnRef.dataset.productId || addBtnRef.getAttribute('data-product-id');
            let cart = getCart(); const item = cart.find(i => i.id == productId);
            if (!item) { isProcessingClick = false; return; }
            item.quantity -= 1;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id != productId); saveCart(cart);
                selector.classList.add('hidden'); addBtnRef.classList.remove('hidden'); showToast('Removed from cart', 'error');
            } else { qtyDisplay.textContent = item.quantity; saveCart(cart); }
            restoreQuantitySelectors(); updateCartCount();
            setTimeout(() => { isProcessingClick = false; }, 300); return;
        }
    }, true);

    function initializeCart() {
        updateCartCount(); restoreQuantitySelectors();
        setTimeout(() => { restoreQuantitySelectors(); updateCartCount(); }, 1000);
    }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initializeCart); } else { initializeCart(); }
    window.addEventListener('storage', (e) => { if (e.key === 'cart') { updateCartCount(); restoreQuantitySelectors(); } });
}

// ========== WISHLIST ==========
function forceUpdateWishlistCount() {
    const count = getWishlist().length;
    const desktopBadge = document.getElementById('desktop-wishlist-count');
    if (desktopBadge) { desktopBadge.textContent = count; desktopBadge.style.display = count > 0 ? 'flex' : 'none'; }
    const mobileBadge = document.getElementById('mobile-wishlist-count');
    if (mobileBadge) { mobileBadge.textContent = count; mobileBadge.style.display = count > 0 ? 'flex' : 'none'; }
}
function getWishlist() {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
    catch { localStorage.removeItem('wishlist'); return []; }
}
function saveWishlist(wishlist) {
    try { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }
    catch (e) { console.error('Wishlist save error:', e); }
}
function isInWishlist(id) { return getWishlist().some(item => item.id === id); }

forceUpdateWishlistCount();
document.addEventListener('DOMContentLoaded', forceUpdateWishlistCount);
setTimeout(forceUpdateWishlistCount, 300);
setTimeout(forceUpdateWishlistCount, 1000);
window.getWishlist = getWishlist;
window.isInWishlist = isInWishlist;
window.updateCartCount = updateCartCount;

// ========== NURSERY DATA ==========

// Carousel banners (nursery themed)
const carouselBanners = [
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=900&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=80",
    "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=900&q=80",
    "https://images.unsplash.com/photo-1599598425947-5202edd56bdb?w=900&q=80"
];

// ===== NURSERY CATEGORIES =====
let categoriesData = [
    { name: "Indoor Plants", image: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=300&q=80", url: "/indoor/index.html" },
    { name: "Outdoor Plants", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=80", url: "/outdoor/index.html" },
    { name: "Succulents", image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=300&q=80", url: "/succulents/index.html" },
    { name: "Herbs & Veg", image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=300&q=80", url: "/herbs/index.html" },
    { name: "Seeds & Bulbs", image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=300&q=80", url: "/seeds/index.html" },
    { name: "Planters & Pots", image: "https://images.unsplash.com/photo-1582547560836-c19f5a2f01a2?w=300&q=80", url: "/pots/index.html" },
    { name: "Soil & Compost", image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=300&q=80", url: "/tools/soil.html" },
    { name: "Fertilizers", image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=300&q=80", url: "/tools/fertilizers.html" },
    { name: "Gardening Tools", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=80", url: "/tools/gardening.html" },
    { name: "Gift Hampers", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80", url: "/gifts/combos.html" },
    { name: "Hanging Plants", image: "https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=300&q=80", url: "/indoor/hanging.html" },
    { name: "Rare Plants", image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=300&q=80", url: "/succulents/rare.html" },
    { name: "Air Purifying", image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=300&q=80", url: "/indoor/air-purifying.html" },
    { name: "Flowering Plants", image: "https://images.unsplash.com/photo-1490750967868-88df5691cc9e?w=300&q=80", url: "/outdoor/flowering.html" },
    { name: "Fruit Plants", image: "https://images.unsplash.com/photo-1519519033554-a0fc3b67d10a?w=300&q=80", url: "/outdoor/fruit.html" },
];

// ===== FEATURED INDOOR PLANTS =====
const productsData = [
    { id: 40, name: "Monstera Deliciosa", image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&q=80", price: "₹549", originalPrice: "₹699", discount: "21% off", brand: "Indoor", tag: "bestseller" },
    { id: 41, name: "Peace Lily Plant", image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400&q=80", price: "₹349", originalPrice: "₹449", discount: "22% off", brand: "Air Purifying" },
    { id: 42, name: "Golden Pothos Vine", image: "https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=400&q=80", price: "₹199", originalPrice: "₹249", discount: "20% off", brand: "Low Maintenance", tag: "new" },
    { id: 43, name: "Snake Plant (Sansevieria)", image: "https://images.unsplash.com/photo-1567748157439-651aca2ff064?w=400&q=80", price: "₹299", originalPrice: "₹379", discount: "21% off", brand: "Air Purifying" },
    { id: 44, name: "Fiddle Leaf Fig", image: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&q=80", price: "₹799", originalPrice: "₹999", discount: "20% off", brand: "Statement Plant" },
    { id: 45, name: "ZZ Plant", image: "https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=400&q=80", price: "₹399", originalPrice: "₹499", discount: "20% off", brand: "Low Light" },
    { id: 46, name: "Spider Plant", image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=400&q=80", price: "₹179", originalPrice: "₹229", discount: "22% off", brand: "Hanging" },
    { id: 47, name: "Rubber Plant (Ficus)", image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=400&q=80", price: "₹449", originalPrice: "₹549", discount: "18% off", brand: "Statement Plant" }
];

// ===== TOOLS & ACCESSORIES =====
const medicinesData = [
    { id: 48, name: "Terracotta Pot Set (3pcs)", image: "https://images.unsplash.com/photo-1582547560836-c19f5a2f01a2?w=400&q=80", price: "₹349", originalPrice: "₹449", discount: "22% off", brand: "Planters" },
    { id: 49, name: "Ceramic Self-Watering Pot", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80", price: "₹599", originalPrice: "₹749", discount: "20% off", brand: "Smart Pots" },
    { id: 50, name: "Premium Potting Mix (5kg)", image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&q=80", price: "₹249", originalPrice: "₹319", discount: "22% off", brand: "Soil & Compost" },
    { id: 51, name: "Organic Fertilizer Granules", image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&q=80", price: "₹199", originalPrice: "₹249", discount: "20% off", brand: "Fertilizers" },
    { id: 52, name: "Garden Hand Tool Set", image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80", price: "₹449", originalPrice: "₹599", discount: "25% off", brand: "Tools" },
    { id: 53, name: "Hanging Macramé Planter", image: "https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=400&q=80", price: "₹299", originalPrice: "₹399", discount: "25% off", brand: "Hanging Planters" },
    { id: 54, name: "Plant Grow Light LED", image: "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?w=400&q=80", price: "₹899", originalPrice: "₹1199", discount: "25% off", brand: "Accessories" },
    { id: 55, name: "Succulent & Cactus Mix Kit", image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=400&q=80", price: "₹349", originalPrice: "₹449", discount: "22% off", brand: "Starter Kits" }
];

// ===== ARTICLES DATA =====
let articlesData = [
    {
        title: "5 Air-Purifying Plants for Your Home",
        image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&q=80",
        description: "Discover the best plants that naturally filter toxins and improve indoor air quality for a healthier home.",
        link: "#"
    },
    {
        title: "Beginner's Guide to Succulent Care",
        image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=600&q=80",
        description: "Learn the essentials of watering, lighting, and repotting your succulents to keep them thriving all year.",
        link: "#"
    },
    {
        title: "How to Start Your Kitchen Herb Garden",
        image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&q=80",
        description: "Fresh herbs at your fingertips! A step-by-step guide to growing basil, mint, coriander, and more indoors.",
        link: "#"
    }
];

// ===== OPEN PRODUCT DETAILS =====
function openProductDetails(id) {
    const all = [...productsData, ...medicinesData];
    const p = all.find(item => item.id === id);
    if (!p) return alert("Product not found");
    const price = parseFloat(p.price.replace('₹', '').replace(',', ''));
    const originalPrice = p.originalPrice ? parseFloat(p.originalPrice.replace('₹', '').replace(',', '')) : 0;
    let discountPercentage = 0;
    if (originalPrice > 0 && price < originalPrice) {
        discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    const randomQuantity = Math.floor(Math.random() * 16) + 5;
    const params = new URLSearchParams({
        id: p.id, name: encodeURIComponent(p.name || p.title),
        price: price.toString(), originalPrice: originalPrice.toString(),
        discount: discountPercentage.toString(), image: encodeURIComponent(p.image || p.mainImageUrl),
        description: encodeURIComponent(p.description || 'Premium nursery-fresh plant.'),
        category: p.category || 'plants', quantity: randomQuantity.toString(),
        unit: 'pot', sku: `SKU-${p.id}`,
        brand: encodeURIComponent(p.brand || 'GreenNest'), rating: '4.5', mrp: originalPrice.toString()
    });
    window.location.href = `productdetails.html?${params.toString()}`;
}
window.openProductDetails = openProductDetails;

// ===== MYNTRA CARD CREATE =====
function createMyntraCard(p) {
    const inWish = isInWishlist(p.id);
    const cleanPrice = p.price.replace('₹', '').trim();
    return `
        <div class="myntra-card group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer w-full" style="border: 1px solid #e8f5e9;">
            ${p.discount ? `
                <div class="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-sm" style="background: #40916c;">
                    ${p.discount}
                </div>
            ` : ''}
            ${p.tag === 'new' ? `
                <div class="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-sm" style="background: #52b788;">
                    NEW
                </div>
            ` : ''}
            ${p.tag === 'bestseller' ? `
                <div class="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-sm" style="background: #a07850;">
                    🏆 Best Seller
                </div>
            ` : ''}

            <!-- Wishlist Heart -->
            <div class="myntra-wishlist absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm z-10 transition-all duration-200 ${inWish ? 'active text-red-500' : 'text-gray-400 hover:text-red-500'}"
                 data-id="${p.id}" onclick="toggleWishlistItem(${p.id})">
                <i class="${inWish ? 'fas' : 'far'} fa-heart text-sm"></i>
            </div>

            <!-- Image -->
            <div class="relative h-48 overflow-hidden" style="background: #f0faf4;">
                <img src="${p.image || p.mainImageUrl}"
                     alt="${p.name || p.title}"
                     loading="lazy"
                     class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
            </div>

            <!-- Info -->
            <div class="p-4">
                ${p.brand ? `<div class="text-xs font-semibold mb-1" style="color: var(--green-mid);">${p.brand}</div>` : ''}
                <h3 class="text-gray-800 font-semibold text-sm mb-2 leading-tight overflow-hidden" style="height: 2.4rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                    ${p.name || p.title}
                </h3>

                <div class="flex items-center gap-2 mb-3">
                    <span class="text-lg font-bold" style="color: var(--green-dark);">${p.price}</span>
                    ${p.originalPrice ? `<span class="text-gray-400 line-through text-sm">${p.originalPrice}</span>` : ''}
                    ${p.discount ? `<span class="text-xs font-bold text-red-500">${p.discount}</span>` : ''}
                </div>

                <!-- Nursery fresh badge -->
                <div class="flex items-center gap-1 mb-3">
                    <span style="font-size:11px; background: #d8f3dc; color: #2d6a4f; padding: 2px 8px; border-radius: 9999px; font-weight: 700;">🌱 Nursery Fresh</span>
                </div>

                <button class="add-to-cart-btn w-full text-white font-semibold text-sm py-2.5 rounded-lg transition-all duration-200 active:scale-95 shadow-sm flex items-center justify-center"
                        style="background: linear-gradient(135deg, #40916c, #2d6a4f);"
                        data-product-id="${p.id}"
                        data-product-name="${p.name || p.title}"
                        data-product-price="${cleanPrice}"
                        data-product-image="${p.image || p.mainImageUrl}">
                    <i class="fas fa-shopping-basket mr-2 text-xs"></i>ADD TO CART
                </button>

                <button onclick="openProductDetails(${p.id})"
                        class="w-full mt-2 font-medium text-xs py-2 rounded-md transition-colors duration-200"
                        style="color: var(--green-mid);">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// ===== RENDER MYNTRA SECTION =====
function renderMyntraSection(trackId, data) {
    const track = document.getElementById(trackId);
    if (!track) { console.error(`Element #${trackId} not found!`); return; }
    track.innerHTML = '';
    data.forEach(product => { track.innerHTML += createMyntraCard(product); });

    let prevBtn, nextBtn;
    if (trackId === 'plant-track') { prevBtn = document.getElementById('plant-prev'); nextBtn = document.getElementById('plant-next'); }
    else if (trackId === 'tools-track') { prevBtn = document.getElementById('tools-prev'); nextBtn = document.getElementById('tools-next'); }

    const cardWidth = 230, gap = 16, scrollAmount = (cardWidth + gap) * 3;
    if (nextBtn) { nextBtn.onclick = () => track.scrollBy({ left: scrollAmount, behavior: 'smooth' }); }
    if (prevBtn) { prevBtn.onclick = () => track.scrollBy({ left: -scrollAmount, behavior: 'smooth' }); }

    const updateArrows = () => {
        const isAtStart = track.scrollLeft <= 10;
        const isAtEnd = track.scrollWidth - track.clientWidth - track.scrollLeft <= 10;
        if (prevBtn) { prevBtn.style.opacity = isAtStart ? '0.4' : '1'; prevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto'; }
        if (nextBtn) { nextBtn.style.opacity = isAtEnd ? '0.4' : '1'; nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto'; }
    };
    track.addEventListener('scroll', updateArrows);
    setTimeout(updateArrows, 100);
    window.addEventListener('resize', updateArrows);
}

// ===== TOGGLE WISHLIST =====
function toggleWishlist(product) {
    let wishlist = getWishlist();
    const exists = wishlist.some(item => item.id == product.id);
    if (exists) {
        wishlist = wishlist.filter(item => item.id != product.id);
        showToast('Removed from wishlist', 'error');
    } else {
        wishlist.push({
            id: product.id,
            name: product.name || product.title || 'Product',
            price: product.price ? String(product.price).replace('₹', '').trim() : '0',
            originalPrice: product.originalPrice ? String(product.originalPrice).replace('₹', '').trim() : null,
            image: product.image || 'https://via.placeholder.com/300',
            discount: product.discount || null
        });
        showToast('Added to wishlist! 🌿', 'add');
    }
    saveWishlist(wishlist); updateWishlistCount(); updateAllWishlistIcons();
}
function updateWishlistCount() {
    const count = getWishlist().length;
    document.querySelectorAll('#desktop-wishlist-count, #mobile-wishlist-count, .wishlist-count').forEach(el => {
        if (el) { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; }
    });
}
function updateAllWishlistIcons() {
    const wishlistIds = getWishlist().map(item => item.id);
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = parseInt(btn.dataset.productId || btn.getAttribute('data-product-id'));
        const svg = btn.querySelector('svg');
        if (svg) {
            if (wishlistIds.includes(productId)) { svg.classList.add('fill-red-500', 'text-red-500'); svg.setAttribute('fill', 'currentColor'); }
            else { svg.classList.remove('fill-red-500', 'text-red-500'); svg.removeAttribute('fill'); }
        }
    });
}
function toggleWishlistItem(id) {
    const product = [...productsData, ...medicinesData].find(p => p.id === id);
    if (product) {
        toggleWishlist(product);
        const btn = document.querySelector(`.myntra-wishlist[data-id="${id}"]`);
        if (btn) { btn.classList.toggle('active', isInWishlist(id)); }
    }
}
window.getWishlist = getWishlist;
window.toggleWishlist = toggleWishlist;
window.isInWishlist = isInWishlist;
window.toggleWishlistItem = toggleWishlistItem;

document.addEventListener('DOMContentLoaded', () => {
    updateWishlistCount(); updateAllWishlistIcons();
    setTimeout(() => { updateAllWishlistIcons(); updateWishlistCount(); }, 800);
});
window.addEventListener('storage', (e) => {
    if (e.key === 'wishlist') { updateWishlistCount(); updateAllWishlistIcons(); }
});

// ===== CATEGORIES RENDER =====
const categoryContainer = document.getElementById('categoryContainer');
const scrollIndicator = document.getElementById('scrollIndicator');

function renderCategories(categories) {
    if (!categoryContainer) return;
    categoryContainer.innerHTML = '';
    categories.forEach((category, index) => {
        const card = document.createElement('div');
        card.className = 'category-item flex-shrink-0 w-36 h-36 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110 hover:shadow-xl bg-white shadow-md overflow-hidden group animate-fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="w-full h-full rounded-full overflow-hidden flex items-center justify-center" style="background: #f0faf4;">
                <img src="${category.image}" alt="${category.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
            </div>
            <div class="category-label">
                <p class="text-white font-bold text-center text-xs px-2">${category.name}</p>
            </div>
        `;
        card.addEventListener('click', (event) => {
            card.classList.add('ring-4', 'ring-green-400', 'ring-opacity-60');
            setTimeout(() => { if (category.url) window.location.href = category.url; }, 300);
        });
        card.classList.add('category-item');
        categoryContainer.appendChild(card);
    });
    addScrollIndicators();
}

function addScrollIndicators() {
    if (!scrollIndicator) return;
    scrollIndicator.innerHTML = '';
    const dotsCount = Math.ceil(categoriesData.length / 4);
    for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('div');
        dot.className = `w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${i === 0 ? 'w-5' : ''}`;
        dot.style.background = i === 0 ? 'var(--green-mid)' : '#b7e4c7';
        dot.addEventListener('click', () => {
            const sectionWidth = categoryContainer.scrollWidth / dotsCount;
            categoryContainer.scrollTo({ left: sectionWidth * i, behavior: 'smooth' });
        });
        scrollIndicator.appendChild(dot);
    }
}
function updateActiveIndicator() {
    if (!categoryContainer || !scrollIndicator) return;
    const scrollLeft = categoryContainer.scrollLeft;
    const dotsCount = Math.ceil(categoriesData.length / 4);
    const sectionWidth = categoryContainer.scrollWidth / dotsCount;
    const activeSection = Math.floor(scrollLeft / sectionWidth);
    document.querySelectorAll('#scrollIndicator > div').forEach((dot, index) => {
        if (index === activeSection) { dot.style.background = 'var(--green-mid)'; dot.style.width = '20px'; }
        else { dot.style.background = '#b7e4c7'; dot.style.width = '8px'; }
    });
}

let autoScrollInterval;
function startAutoScroll() {
    if (!categoryContainer) return;
    autoScrollInterval = setInterval(() => {
        const scrollLeft = categoryContainer.scrollLeft;
        const scrollWidth = categoryContainer.scrollWidth - categoryContainer.clientWidth;
        if (scrollLeft >= scrollWidth - 10) { categoryContainer.scrollTo({ left: 0, behavior: 'smooth' }); }
        else { categoryContainer.scrollBy({ left: 280, behavior: 'smooth' }); }
    }, 4000);
}
function stopAutoScroll() { clearInterval(autoScrollInterval); }
if (categoryContainer) {
    categoryContainer.addEventListener('mouseenter', stopAutoScroll);
    categoryContainer.addEventListener('mouseleave', startAutoScroll);
    categoryContainer.addEventListener('scroll', updateActiveIndicator);
}
renderCategories(categoriesData);
startAutoScroll();

// ===== ARTICLES SECTION =====
function renderArticlesSection(articles) {
    const section = document.getElementById('articlesSection');
    if (!section) return;
    section.innerHTML = `
        <h2 style="font-family: 'Playfair Display', serif; font-size: 28px; color: #1b3a2d; margin-bottom: 8px;">Plant Care & Gardening Tips</h2>
        <div style="width:60px; height:3px; background: linear-gradient(90deg, #40916c, #74c69d); margin: 0 auto 2.5rem; border-radius:2px;"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${articles.map(article => `
                <div class="article-card bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer" style="border: 1px solid #d8f3dc;">
                    <div class="overflow-hidden h-52">
                        <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
                    </div>
                    <div class="p-6">
                        <h3 class="text-lg font-bold mb-2" style="color: #1b3a2d; font-family: 'Playfair Display', serif;">${article.title}</h3>
                        <p class="text-gray-600 mb-4 text-sm leading-relaxed">${article.description}</p>
                        <a href="${article.link}" class="font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all" style="color: var(--green-mid);">
                            Read More <i class="fas fa-arrow-right text-xs"></i>
                        </a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ===== CAROUSEL =====
function renderCarousel() {
    const carousel = document.getElementById("carousel");
    const dotsContainer = document.getElementById("dotsContainer");
    if (!carousel || !dotsContainer) return;
    carousel.innerHTML = carouselBanners.map((src, idx) => `
        <img src="${src}" class="carousel-image w-full flex-shrink-0 rounded-xl object-cover" style="height: 320px;" alt="Plant Banner ${idx + 1}">
    `).join('');
    dotsContainer.innerHTML = carouselBanners.map(() => `
        <button class="dot w-3 h-3 bg-white rounded-full opacity-50 hover:opacity-100 transition-opacity"></button>
    `).join('');
}

function initializeCarousel() {
    const carousel = document.getElementById("carousel");
    if (!carousel) return;
    const slides = carousel.children.length;
    const dots = document.querySelectorAll(".dot");
    let index = 0;
    function showSlide(i) {
        index = (i + slides) % slides;
        carousel.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, idx) => {
            dot.classList.toggle("opacity-100", idx === index);
            dot.classList.toggle("opacity-50", idx !== index);
        });
    }
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    if (prevBtn) prevBtn.onclick = () => showSlide(index - 1);
    if (nextBtn) nextBtn.onclick = () => showSlide(index + 1);
    dots.forEach((dot, idx) => dot.addEventListener("click", () => showSlide(idx)));
    setInterval(() => showSlide(index + 1), 4000);
    showSlide(0);
}

// ===== PRODUCT SECTIONS =====
function renderProductSections() {
    renderMyntraSection('plant-track', productsData);
    renderMyntraSection('tools-track', medicinesData);
    setTimeout(() => {
        if (typeof updateCartCount === 'function') updateCartCount();
        if (typeof restoreQuantitySelectors === 'function') restoreQuantitySelectors();
    }, 800);
}

// ===== GLOBAL SEARCH =====
let globalSearchProducts = [];
const API_BASE = "http://localhost:8083";

async function loadGlobalSearchData(forceRefresh = false) {
    if (!forceRefresh && globalSearchProducts.length > 0) return;
    try {
        globalSearchProducts = [];
        let page = 0, hasMore = true;
        while (hasMore) {
            const res = await fetch(`${API_BASE}/api/products/get-all-active-products?page=${page}&size=50`);
            if (!res.ok) break;
            const json = await res.json();
            if (!Array.isArray(json) || json.length === 0) break;
            json.forEach(p => {
                globalSearchProducts.push({
                    id: p.productId, name: p.productName || 'Unknown Product',
                    subCategory: (p.productSubCategory || 'Plant').trim(),
                    price: Array.isArray(p.productPrice) ? Number(p.productPrice[0] || 0) : Number(p.productPrice || 0),
                    image: p.productMainImage || '',
                    detailUrl: `/productdetails.html?id=${p.productId}`, type: 'regular'
                });
            });
            hasMore = json.length === 50; page++;
        }
    } catch (err) { console.error("Global search load error:", err); }
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    return text.replace(regex, '<span style="color:#40916c; font-weight:bold;">$1</span>');
}

function initSearch() {
    const input = document.getElementById('searchInput');
    const suggestionsEl = document.getElementById('searchSuggestions');
    if (!suggestionsEl) return;
    let isMouseOver = false;
    input?.addEventListener('input', e => showSearchSuggestions(e.target.value));
    suggestionsEl.addEventListener('mouseenter', () => { isMouseOver = true; });
    suggestionsEl.addEventListener('mouseleave', () => { isMouseOver = false; });
    document.addEventListener('click', function (e) {
        if (!suggestionsEl.contains(e.target) && e.target !== input && !isMouseOver) {
            suggestionsEl.style.display = 'none';
        }
    });
    async function showSearchSuggestions(query = '') {
        suggestionsEl.style.display = 'block';
        suggestionsEl.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">🌱 Finding plants for you...</div>';
        await loadGlobalSearchData(true);
        const q = query.toLowerCase().trim();
        // Also search local data
        const localResults = [...productsData, ...medicinesData].filter(p =>
            (p.name || '').toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q)
        ).map(p => ({
            id: p.id, name: p.name, subCategory: p.brand || 'Plant',
            price: parseFloat(p.price.replace('₹', '')), image: p.image,
            detailUrl: `productdetails.html?id=${p.id}`
        }));
        const backendResults = globalSearchProducts.filter(p =>
            (p.name || '').toLowerCase().includes(q) || (p.subCategory || '').toLowerCase().includes(q)
        ).slice(0, 5);
        const combined = [...localResults, ...backendResults].slice(0, 8);
        if (combined.length === 0 && q) {
            suggestionsEl.innerHTML = '<div class="p-4 text-center text-gray-500">No plants found 🌵</div>'; return;
        }
        suggestionsEl.innerHTML = combined.map(p => `
            <div class="suggestion-item group flex items-center p-4 border-b hover:bg-green-50 transition-colors cursor-pointer"
                 data-url="${p.detailUrl}" style="border-color: #f0faf4;">
                <img src="${p.image || API_BASE + p.image}"
                     class="w-12 h-12 object-cover rounded-lg mr-3" alt="${p.name}"
                     onerror="this.style.display='none';">
                <div class="flex-1">
                    <div class="font-semibold text-gray-800 group-hover:text-green-700">${highlightText(p.name, q)}</div>
                    <div class="text-xs text-gray-500">${p.subCategory}</div>
                </div>
                <i class="fas fa-arrow-right text-xs opacity-0 group-hover:opacity-100" style="color: var(--green-mid);"></i>
            </div>
        `).join('');
        suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault(); e.stopPropagation();
                const url = this.getAttribute('data-url');
                setTimeout(() => { window.location.href = url; }, 100);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => { initSearch(); loadGlobalSearchData(); });

// ===== SUCCESS MODAL =====
function initializeSuccessModal() {
    const successCloseBtn = document.getElementById('successCloseBtn');
    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', function () {
            const successModal = document.getElementById('successModal');
            const successModalContent = document.getElementById('successModalContent');
            if (successModal && successModalContent) {
                successModalContent.classList.remove('scale-100', 'opacity-100');
                successModalContent.classList.add('scale-95', 'opacity-0');
                setTimeout(() => { successModal.classList.add('hidden'); }, 300);
            }
        });
    }
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function () {
    console.log('🌿 ========== GREENNEST NURSERY INITIALIZING ==========');

    // Scroll buttons
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    const catContainer = document.getElementById('categoryContainer');
    if (scrollLeftBtn && scrollRightBtn && catContainer) {
        scrollLeftBtn.addEventListener('click', () => catContainer.scrollBy({ left: -280, behavior: 'smooth' }));
        scrollRightBtn.addEventListener('click', () => catContainer.scrollBy({ left: 280, behavior: 'smooth' }));
    }

    renderCategories(categoriesData);
    renderProductSections();
    renderCarousel();
    initializeCarousel();
    renderArticlesSection(articlesData);
    initializeSuccessModal();

    if (typeof updateCartCount === 'function') updateCartCount();
    if (typeof restoreQuantitySelectors === 'function') {
        restoreQuantitySelectors();
        setTimeout(restoreQuantitySelectors, 600);
    }

    console.log('🌱 ========== GREENNEST INITIALIZED SUCCESSFULLY! ==========');
});

window.addEventListener('storage', (e) => { if (e.key === 'cart') updateCartCount(); });
window.openProductDetails = openProductDetails;
window.updateCartCount = updateCartCount;