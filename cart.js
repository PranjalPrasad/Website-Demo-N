// ==================== CART.JS - FRONTEND ONLY WITH DYNAMIC PRICE UPDATE ====================
// Uses localStorage only - No backend connectivity
// Updates prices dynamically when quantity changes

// ==================== CONSTANTS ====================
const STORAGE_KEY = 'cart';

// ==================== UTILITY FUNCTIONS ====================

// Get cart from localStorage (matches home.js structure)
function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        console.log('[DEBUG] getCart() - Cart from localStorage:', cart);
        return cart;
    } catch (error) {
        console.error('[DEBUG] getCart() - Error parsing localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
}

// Save cart to localStorage
function saveCart(cart) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        console.log('[DEBUG] saveCart() - Saved cart:', cart);
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(cart) }));
    } catch (error) {
        console.error('[DEBUG] saveCart() - Error saving to localStorage:', error);
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2`;
    const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
    toast.innerHTML = `${icon} ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Update cart count in header (matches home.js)
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    document.querySelectorAll('#desktop-cart-count, #mobile-cart-count, .cart-count, [id*="cart-count"], [class*="cart-count"]').forEach(el => {
        if (el) {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    });
    
    console.log('[DEBUG] updateCartCount() - Total items:', totalItems);
}

// Animate price element
function animatePrice(element) {
    if (element) {
        element.classList.add('price-update');
        setTimeout(() => {
            element.classList.remove('price-update');
        }, 300);
    }
}

// Get numeric price
function getNumericPrice(price) {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') return parseFloat(price.replace('₹', '').replace(',', ''));
    return 0;
}

// Calculate discount percentage
function calculateDiscount(originalPrice, currentPrice) {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    const origNum = getNumericPrice(originalPrice);
    const currNum = getNumericPrice(currentPrice);
    if (origNum <= currNum) return 0;
    return Math.round(((origNum - currNum) / origNum) * 100);
}

// ==================== CART OPERATIONS ====================

// Add item to cart (called from productdetails.js and home.js)
function addToCart(product, quantity = 1, selectedSize = '') {
    console.log('[DEBUG] addToCart() - Adding product:', product, 'Quantity:', quantity, 'Size:', selectedSize);
    
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id == product.id && item.selectedSize === selectedSize);
    
    if (existingIndex !== -1) {
        const newQty = cart[existingIndex].quantity + quantity;
        if (newQty > 10) {
            showToast('Max 10 items allowed per product!', 'error');
            return false;
        }
        cart[existingIndex].quantity = newQty;
        console.log('[DEBUG] addToCart() - Updated existing item quantity to:', newQty);
    } else {
        const productPrice = typeof product.price === 'number' ? product.price : getNumericPrice(product.price);
        const productOriginalPrice = product.originalPrice ? (typeof product.originalPrice === 'number' ? product.originalPrice : getNumericPrice(product.originalPrice)) : null;
        
        const newItem = {
            id: product.id,
            name: product.name,
            price: productPrice,
            originalPrice: productOriginalPrice,
            image: product.image,
            quantity: quantity,
            selectedSize: selectedSize,
            brand: product.brand || 'GreenNest'
        };
        cart.push(newItem);
        console.log('[DEBUG] addToCart() - Added new item:', newItem);
    }
    
    saveCart(cart);
    updateCartCount();
    renderCart();
    showToast(`🌿 ${product.name} added to cart!`, 'success');
    return true;
}

// Update quantity of an item and recalculate prices
function updateQuantity(itemId, newQty) {
    console.log('[DEBUG] updateQuantity() - Item ID:', itemId, 'New Quantity:', newQty);
    
    if (newQty < 1) {
        removeFromCart(itemId);
        return;
    }
    
    if (newQty > 10) {
        showToast('Max 10 items allowed per product!', 'error');
        return;
    }
    
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id == itemId);
    
    if (itemIndex === -1) {
        console.error('[DEBUG] updateQuantity() - Item not found:', itemId);
        return;
    }
    
    // Update quantity
    cart[itemIndex].quantity = newQty;
    saveCart(cart);
    updateCartCount();
    
    // Re-render cart with updated prices
    renderCart();
    showToast('Quantity updated', 'success');
}

// Remove item from cart
function removeFromCart(itemId) {
    console.log('[DEBUG] removeFromCart() - Item ID:', itemId);
    
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.id == itemId);
    
    if (itemIndex === -1) {
        console.error('[DEBUG] removeFromCart() - Item not found:', itemId);
        return;
    }
    
    const itemName = cart[itemIndex].name;
    cart.splice(itemIndex, 1);
    saveCart(cart);
    updateCartCount();
    renderCart();
    showToast(`Removed ${itemName} from cart`, 'error');
}

// Clear entire cart
function clearCart() {
    if (!confirm('Clear all items from your cart?')) {
        return;
    }
    
    saveCart([]);
    updateCartCount();
    renderCart();
    showToast('Cart cleared successfully', 'success');
}

// ==================== PRICE CALCULATION ====================

// Calculate and update all prices
function calculateAndUpdatePrices(cart) {
    let totalMRP = 0;
    let totalSellingPrice = 0;
    
    cart.forEach(item => {
        const itemPrice = getNumericPrice(item.price);
        const itemMRP = item.originalPrice ? getNumericPrice(item.originalPrice) : itemPrice;
        const quantity = item.quantity || 1;
        
        totalMRP += itemMRP * quantity;
        totalSellingPrice += itemPrice * quantity;
    });
    
    const totalDiscount = totalMRP - totalSellingPrice;
    const shipping = totalSellingPrice >= 499 ? 0 : 49;
    const finalTotal = totalSellingPrice + shipping;
    
    return {
        totalMRP,
        totalSellingPrice,
        totalDiscount,
        shipping,
        finalTotal
    };
}

// ==================== CART UI RENDERING ====================

// Render cart UI with dynamic prices
function renderCart() {
    const cart = getCart();
    const emptyCartScreen = document.getElementById('empty-cart-fullscreen');
    const cartWithItems = document.getElementById('cart-with-items');
    const cartItemsContainer = document.getElementById('cart-items-container');
    
    if (!cartItemsContainer || !emptyCartScreen || !cartWithItems) {
        console.error('[DEBUG] renderCart() - Required UI elements not found');
        return;
    }
    
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    // Update headers
    const itemCountHeader = document.getElementById('item-count-header');
    const itemCountPrice = document.getElementById('item-count-price');
    if (itemCountHeader) itemCountHeader.textContent = totalItems + ' Item' + (totalItems !== 1 ? 's' : '');
    if (itemCountPrice) itemCountPrice.textContent = '(' + totalItems + ' Item' + (totalItems !== 1 ? 's' : '') + ')';
    
    if (cart.length === 0) {
        emptyCartScreen.classList.remove('hidden');
        cartWithItems.classList.add('hidden');
        cartItemsContainer.innerHTML = '';
        updatePriceDisplay(0, 0, 0);
        return;
    }
    
    emptyCartScreen.classList.add('hidden');
    cartWithItems.classList.remove('hidden');
    
    // Generate cart items HTML with individual item totals
    const cartItemsHTML = cart.map((item) => {
        const itemPrice = getNumericPrice(item.price);
        const itemMRP = item.originalPrice ? getNumericPrice(item.originalPrice) : itemPrice;
        const quantity = item.quantity || 1;
        const discount = calculateDiscount(itemMRP, itemPrice);
        const itemTotal = itemPrice * quantity;
        const itemMRPTotal = itemMRP * quantity;
        
        return `
        <div class="cart-item bg-white border-b p-5 flex gap-4 items-start" style="border-color: #e8f5e9;" data-item-id="${item.id}">
            <div class="flex-shrink-0">
                <img src="${item.image || 'https://picsum.photos/id/116/150/150'}" 
                     alt="${item.name}" 
                     class="w-28 h-28 object-cover rounded-xl border" 
                     style="border-color: #d8f3dc;"
                     onerror="this.src='https://picsum.photos/id/116/150/150'">
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <div class="flex-1">
                        <p class="text-xs font-semibold mb-1" style="color: var(--green-mid);">${item.brand || 'GreenNest'}</p>
                        <h3 class="font-semibold text-gray-800 text-base mb-2">${item.name}</h3>
                        ${item.selectedSize ? `<p class="text-xs text-gray-500 mb-2">Size: ${item.selectedSize}</p>` : ''}
                        
                        <div class="flex items-center gap-3 mb-2">
                            <span class="font-bold text-lg" style="color: var(--green-dark);">₹${itemPrice.toFixed(0)}</span>
                            ${itemMRP > itemPrice ? `<span class="text-gray-400 line-through text-sm">₹${itemMRP.toFixed(0)}</span>` : ''}
                            ${discount > 0 ? `<span class="text-red-500 font-semibold text-sm">(${discount}% OFF)</span>` : ''}
                        </div>
                        
                        <!-- Item Total Price (Quantity * Price) -->
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-xs text-gray-500">Total:</span>
                            <span class="item-total-price font-bold" style="color: var(--green-accent);">₹${itemTotal.toFixed(0)}</span>
                            <span class="text-xs text-gray-400 line-through">₹${itemMRPTotal.toFixed(0)}</span>
                        </div>

                        <div class="flex items-center gap-6">
                            <div class="flex items-center border rounded-lg overflow-hidden" style="border-color: #b7e4c7;">
                                <button class="decrease-btn qty-btn w-8 h-8 text-lg font-bold" data-item-id="${item.id}">−</button>
                                <span class="quantity-display w-12 text-center font-semibold text-gray-800">${quantity}</span>
                                <button class="increase-btn qty-btn w-8 h-8 text-lg font-bold" data-item-id="${item.id}">+</button>
                            </div>
                            <button class="delete-btn text-gray-400 hover:text-red-600 transition text-lg" data-item-id="${item.id}">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    cartItemsContainer.innerHTML = cartItemsHTML;
    
    // Calculate and update all prices
    const prices = calculateAndUpdatePrices(cart);
    updatePriceDisplay(prices.totalMRP, prices.totalDiscount, prices.finalTotal, prices.shipping);
    
    // Attach event listeners
    attachEventListeners();
}

// Update price display with animation
function updatePriceDisplay(totalMRP, totalDiscount, finalTotal, shipping = null) {
    const mrpTotalEl = document.getElementById('mrp-total');
    const discountAmountEl = document.getElementById('discount-amount');
    const totalAmountEl = document.getElementById('total-amount');
    const shippingText = document.getElementById('shipping-text');
    const shippingStriked = document.getElementById('shipping-striked');
    
    if (mrpTotalEl) {
        mrpTotalEl.textContent = '₹' + totalMRP.toFixed(0);
        animatePrice(mrpTotalEl);
    }
    if (discountAmountEl) {
        discountAmountEl.textContent = '-₹' + totalDiscount.toFixed(0);
        animatePrice(discountAmountEl);
    }
    if (totalAmountEl) {
        totalAmountEl.textContent = '₹' + finalTotal.toFixed(0);
        animatePrice(totalAmountEl);
    }
    
    // Update shipping display if provided
    if (shipping !== null && shippingText && shippingStriked) {
        if (shipping === 0) {
            shippingStriked.style.display = 'inline';
            shippingText.textContent = 'FREE';
            shippingText.classList.add('text-green-600');
            shippingText.classList.remove('text-gray-700');
        } else {
            shippingStriked.style.display = 'none';
            shippingText.textContent = '₹49';
            shippingText.classList.remove('text-green-600');
            shippingText.classList.add('text-gray-700');
        }
    }
}

// Attach event listeners to cart buttons
function attachEventListeners() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (!cartItemsContainer) return;
    
    // Remove existing listener to avoid duplicates
    const newContainer = cartItemsContainer.cloneNode(true);
    cartItemsContainer.parentNode.replaceChild(newContainer, cartItemsContainer);
    
    newContainer.addEventListener('click', function(e) {
        const target = e.target;
        
        // Handle decrease button
        if (target.classList.contains('decrease-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const itemId = parseInt(target.getAttribute('data-item-id'));
            const quantitySpan = target.nextElementSibling;
            if (quantitySpan && quantitySpan.classList.contains('quantity-display')) {
                const currentQty = parseInt(quantitySpan.textContent) || 1;
                const newQty = currentQty - 1;
                if (newQty >= 1) {
                    updateQuantity(itemId, newQty);
                } else {
                    removeFromCart(itemId);
                }
            }
        }
        
        // Handle increase button
        else if (target.classList.contains('increase-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const itemId = parseInt(target.getAttribute('data-item-id'));
            const quantitySpan = target.previousElementSibling;
            if (quantitySpan && quantitySpan.classList.contains('quantity-display')) {
                const currentQty = parseInt(quantitySpan.textContent) || 1;
                const newQty = currentQty + 1;
                if (newQty <= 10) {
                    updateQuantity(itemId, newQty);
                } else {
                    showToast('Max 10 items allowed per product!', 'error');
                }
            }
        }
        
        // Handle delete button
        else if (target.classList.contains('delete-btn') || target.classList.contains('fa-trash-alt')) {
            e.preventDefault();
            e.stopPropagation();
            const button = target.classList.contains('delete-btn') ? target : target.closest('.delete-btn');
            if (button) {
                const itemId = parseInt(button.getAttribute('data-item-id'));
                if (confirm('Remove this item from cart?')) {
                    removeFromCart(itemId);
                }
            }
        }
    });
}

// ==================== CHECKOUT - FIXED TO REDIRECT PROPERLY ====================
function proceedToCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    showToast('Proceeding to checkout! 🌿', 'success');
    // Redirect to checkout page - UNCOMMENTED TO WORK
    window.location.href = 'checkout.html';
}

// ==================== INITIALIZATION ====================
function initCart() {
    console.log('[DEBUG] initCart() - Initializing cart page');
    renderCart();
    updateCartCount();
}

// Load cart when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initCart();
});

// Listen for storage changes (for cross-tab sync)
window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
        console.log('[DEBUG] storage event - Cart changed in another tab');
        renderCart();
        updateCartCount();
    }
});

// Listen for custom events
window.addEventListener('cartUpdated', () => {
    console.log('[DEBUG] cartUpdated event received');
    renderCart();
    updateCartCount();
});

// ==================== EXPOSE GLOBAL FUNCTIONS ====================
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.getCart = getCart;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;

console.log('[DEBUG] Cart.js loaded successfully - Frontend only with dynamic price updates');