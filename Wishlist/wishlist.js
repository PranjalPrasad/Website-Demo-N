// ==================== FRONTEND-ONLY WISHLIST PAGE SCRIPT ====================
// This script integrates with the existing cart-wishlist-system from home.js
// Uses the same localStorage structure: 'wishlist' and 'cart'

// ==================== UTILITY FUNCTIONS (Matching home.js) ====================

// Get wishlist from localStorage (same as home.js)
function getWishlist() {
    try { 
        return JSON.parse(localStorage.getItem('wishlist') || '[]'); 
    }
    catch(e) { 
        localStorage.removeItem('wishlist'); 
        return []; 
    }
}

// Save wishlist to localStorage (same as home.js)
function saveWishlist(wishlist) {
    try { 
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
        window.dispatchEvent(new StorageEvent('storage', { key: 'wishlist', newValue: JSON.stringify(wishlist) }));
    }
    catch(e) { 
        console.error('Wishlist save error:', e); 
    }
}

// Get cart from localStorage (same as home.js)
function getCart() {
    try { 
        return JSON.parse(localStorage.getItem('cart') || '[]'); 
    }
    catch(e) { 
        localStorage.removeItem('cart'); 
        return []; 
    }
}

// Save cart to localStorage (same as home.js)
function saveCart(cart) {
    try { 
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
    catch(e) { 
        console.error('Cart save error:', e); 
    }
}

// Update cart count (matching home.js)
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    document.querySelectorAll('#desktop-cart-count, #mobile-cart-count, .cart-count, [id*="cart-count"], [class*="cart-count"]').forEach(el => {
        if (el) { 
            el.textContent = totalItems; 
            el.style.display = totalItems > 0 ? 'flex' : 'none'; 
        }
    });
}

// Update wishlist count (matching home.js)
function updateWishlistCount() {
    const wishlist = getWishlist();
    const count = wishlist.length;
    
    // Update all wishlist count elements
    document.querySelectorAll('#desktop-wishlist-count, #mobile-wishlist-count, .wishlist-count, [class*="wishlist-count"]').forEach(el => {
        if (el) { 
            el.textContent = count; 
            el.style.display = count > 0 ? 'flex' : 'none'; 
        }
    });
    
    // Update badge on wishlist page
    const badge = document.getElementById('wishlist-count-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = `(${count})`;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
    
    return count;
}

// Show toast notification (matching home.js style)
function showToast(message, type = 'add') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = `toast-notification ${type === 'add' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-xl shadow-xl`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ==================== WISHLIST OPERATIONS ====================

// Remove item from wishlist
function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    const item = wishlist.find(i => i.id == productId);
    
    if (!item) {
        showToast('Item not found in wishlist', 'error');
        return false;
    }
    
    wishlist = wishlist.filter(item => item.id != productId);
    saveWishlist(wishlist);
    showToast('Removed from wishlist', 'error');
    
    // Re-render wishlist page
    renderWishlist();
    updateWishlistCount();
    
    return true;
}

// Clear entire wishlist
function clearWishlist() {
    if (!confirm('Are you sure you want to clear your entire wishlist?')) {
        return;
    }
    
    saveWishlist([]);
    showToast('Wishlist cleared successfully', 'success');
    renderWishlist();
    updateWishlistCount();
}

// ==================== CART OPERATIONS (Matching home.js) ====================

// Add to cart (matching home.js functionality)
function addToCart(product, quantity = 1) {
    let cart = getCart();
    let existing = cart.find(item => item.id == product.id);
    
    if (existing) {
        if (existing.quantity >= 10) { 
            showToast(`Max 10 items allowed!`, 'error'); 
            return false; 
        }
        existing.quantity += quantity;
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
    updateCartCount();
    showToast('Added to cart! 🌿', 'add');
    return true;
}

// Move item from wishlist to cart
function moveToCart(productId) {
    const wishlist = getWishlist();
    const item = wishlist.find(i => i.id == productId);
    
    if (!item) {
        showToast('Item not found in wishlist', 'error');
        return;
    }
    
    // Get numeric price
    const priceNum = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₹', '').replace(',', ''));
    
    // Add to cart
    const cartItem = {
        id: item.id,
        name: item.name,
        price: priceNum,
        image: item.image,
        quantity: 1
    };
    
    let cart = getCart();
    let existing = cart.find(i => i.id == item.id);
    
    if (existing) {
        if (existing.quantity >= 10) { 
            showToast(`Max 10 items allowed!`, 'error'); 
            return; 
        }
        existing.quantity += 1;
    } else {
        cart.push(cartItem);
    }
    
    saveCart(cart);
    updateCartCount();
    
    // Remove from wishlist
    let newWishlist = wishlist.filter(i => i.id != productId);
    saveWishlist(newWishlist);
    
    showToast('Item moved to cart! 🌿', 'add');
    renderWishlist();
    updateWishlistCount();
}

// ==================== RENDER FUNCTIONS ====================

// Calculate discount percentage
function calculateDiscount(originalPrice, currentPrice) {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    const origNum = typeof originalPrice === 'string' ? parseFloat(originalPrice.replace('₹', '').replace(',', '')) : originalPrice;
    const currNum = typeof currentPrice === 'string' ? parseFloat(currentPrice.replace('₹', '').replace(',', '')) : currentPrice;
    if (origNum <= currNum) return 0;
    return Math.round(((origNum - currNum) / origNum) * 100);
}

// Format price for display
function formatPrice(price) {
    if (typeof price === 'number') return `₹${price}`;
    if (typeof price === 'string') {
        if (price.startsWith('₹')) return price;
        return `₹${price}`;
    }
    return `₹${price}`;
}

// Create wishlist card HTML
function createWishlistCard(item) {
    const currentPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('₹', '').replace(',', ''));
    const originalPrice = item.originalPrice ? (typeof item.originalPrice === 'number' ? item.originalPrice : parseFloat(String(item.originalPrice).replace('₹', '').replace(',', ''))) : currentPrice;
    const discount = calculateDiscount(originalPrice, currentPrice);
    const displayPrice = formatPrice(currentPrice);
    const displayOriginal = formatPrice(originalPrice);
    
    return `
        <div class="product-card fade-in" style="animation-delay: ${Math.random() * 0.1}s">
            <div class="relative">
                <img src="${item.image}" 
                     alt="${item.name}" 
                     class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                     onerror="this.src='https://picsum.photos/id/116/300/300'">
                ${discount > 0 ? `
                    <div class="absolute top-2 left-2 discount-badge text-white px-2 py-1 rounded-lg text-xs font-bold">
                        ${discount}% OFF
                    </div>
                ` : ''}
                <button onclick="removeFromWishlist(${item.id})" 
                        class="remove-btn absolute top-2 right-2 bg-white/90 hover:bg-red-500 text-red-600 hover:text-white w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
                        data-id="${item.id}"
                        title="Remove from wishlist">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <div class="p-4">
                <p class="text-xs font-semibold mb-1" style="color: var(--green-mid);">${item.brand || 'GreenNest'}</p>
                <h3 class="font-semibold text-sm line-clamp-2 h-10 mb-2" style="color: var(--text-dark);">${item.name}</h3>
                <div class="flex items-center gap-2 mb-3">
                    <span class="text-lg font-bold" style="color: var(--green-dark);">${displayPrice}</span>
                    ${originalPrice > currentPrice ? `
                        <span class="text-sm text-gray-400 line-through">${displayOriginal}</span>
                    ` : ''}
                </div>
                ${item.sizes && item.sizes.length > 0 ? `
                    <div class="text-xs text-gray-600 mb-2">
                        <i class="fas fa-ruler mr-1" style="color: var(--green-light);"></i> ${item.sizes.join(', ')}
                    </div>
                ` : ''}
                <button onclick="moveToCart(${item.id})" 
                        class="btn-cart w-full text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95">
                    <i class="fas fa-shopping-cart"></i>
                    Move to Cart
                </button>
            </div>
        </div>
    `;
}

// Toggle clear wishlist button visibility
function toggleClearButton(show) {
    const btn = document.getElementById('clear-wishlist-btn');
    if (btn) {
        if (show) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    }
}

// Main render function
function renderWishlist() {
    const loading = document.getElementById('loading-state');
    const empty = document.getElementById('empty-state');
    const container = document.getElementById('wishlist-items');
    
    // Show loading state
    if (loading) loading.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    if (container) container.classList.add('hidden');
    toggleClearButton(false);
    
    // Get wishlist items
    const items = getWishlist();
    
    // Hide loading
    if (loading) loading.classList.add('hidden');
    
    // Check if empty
    if (items.length === 0) {
        if (empty) empty.classList.remove('hidden');
        if (container) container.classList.add('hidden');
        toggleClearButton(false);
        return;
    }
    
    // Render items
    if (container) {
        container.classList.remove('hidden');
        container.innerHTML = items.map(createWishlistCard).join('');
    }
    toggleClearButton(true);
}

// ==================== SAMPLE PRODUCTS FOR TESTING (Optional) ====================
// This function adds sample products to wishlist for demonstration
// Comment out or remove this function in production
function addSampleProductsForTesting() {
    const wishlist = getWishlist();
    if (wishlist.length === 0) {
        const sampleProducts = [
            {
                id: 40,
                name: "Monstera Deliciosa",
                price: 549,
                originalPrice: 699,
                image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=300&q=80",
                brand: "GreenNest",
                sizes: ["Small (4\")", "Medium (6\")", "Large (8\")"],
                discount: "21% off"
            },
            {
                id: 41,
                name: "Peace Lily Plant",
                price: 349,
                originalPrice: 449,
                image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=300&q=80",
                brand: "GreenNest",
                sizes: ["Small (4\")", "Medium (6\")"],
                discount: "22% off"
            },
            {
                id: 48,
                name: "Terracotta Pot Set (3pcs)",
                price: 349,
                originalPrice: 449,
                image: "https://images.unsplash.com/photo-1582547560836-c19f5a2f01a2?w=300&q=80",
                brand: "GreenNest Essentials",
                sizes: ["Set of 3"],
                discount: "22% off"
            }
        ];
        
        sampleProducts.forEach(product => {
            let wishlistItems = getWishlist();
            if (!wishlistItems.some(item => item.id === product.id)) {
                wishlistItems.push(product);
                saveWishlist(wishlistItems);
            }
        });
        console.log("Sample products added to wishlist for testing");
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Wishlist page loaded - Frontend-only mode active');
    
    // Uncomment the line below to add sample products for testing
    // addSampleProductsForTesting();
    
    // Render wishlist
    renderWishlist();
    updateWishlistCount();
    updateCartCount();
});

// ==================== AUTO-REFRESH ON VISIBILITY CHANGE ====================
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        renderWishlist();
        updateWishlistCount();
        updateCartCount();
    }
});

// ==================== STORAGE EVENT LISTENER ====================
window.addEventListener('storage', (e) => {
    if (e.key === 'wishlist') {
        renderWishlist();
        updateWishlistCount();
    }
    if (e.key === 'cart') {
        updateCartCount();
    }
});

// Listen for custom events
window.addEventListener('wishlistUpdated', () => {
    renderWishlist();
    updateWishlistCount();
});

window.addEventListener('cartUpdated', () => {
    updateCartCount();
});

// ==================== EXPOSE FUNCTIONS GLOBALLY ====================
window.removeFromWishlist = removeFromWishlist;
window.moveToCart = moveToCart;
window.clearWishlist = clearWishlist;
window.updateWishlistCount = updateWishlistCount;
window.updateCartCount = updateCartCount;
window.getWishlist = getWishlist;