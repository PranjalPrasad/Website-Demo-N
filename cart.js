// ==================== CART.JS - FINAL FIXED VERSION ====================

// Base URL for your backend API
const BASE_URL = 'http://localhost:8083';
const CART_API_URL = `${BASE_URL}/api/cart`;

// Global variable to store cart items for button handlers
let currentCartItems = [];

// Function to get current user ID
function getUserId() {
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || localStorage.getItem('currentUserId');
    console.log('[DEBUG] getUserId() - Found userId:', userId);
    if (!userId) {
        console.log('[DEBUG] getUserId() - No user ID found');
        return null;
    }
    return parseInt(userId);
}

// Check if user is logged in
function isUserLoggedIn() {
    const isLoggedIn = getUserId() !== null;
    console.log('[DEBUG] isUserLoggedIn() - Result:', isLoggedIn);
    return isLoggedIn;
}

// Function to show toast messages
function showToast(message, type = 'success') {
    console.log('[DEBUG] showToast() - Message:', message, 'Type:', type);
    const toast = document.getElementById('toast');
    if (!toast) {
        console.log('[DEBUG] showToast() - Toast element not found');
        return;
    }
    
    const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
    toast.innerHTML = `${icon} ${message}`;
    toast.className = `fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white font-medium shadow-xl z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Function to get cart from localStorage
function getLocalCart() {
    try {
        const cart = JSON.parse(localStorage.getItem('medcare_cart') || '[]');
        console.log('[DEBUG] getLocalCart() - Cart from localStorage:', cart);
        return cart;
    } catch (error) {
        console.error('[DEBUG] getLocalCart() - Error parsing localStorage:', error);
        return [];
    }
}

// Function to save cart to localStorage
function saveCart(data) {
    console.log('[DEBUG] saveCart() - Saving to localStorage:', data);
    try {
        localStorage.setItem('medcare_cart', JSON.stringify(data));
        // Also update the global variable
        currentCartItems = [...data];
        console.log('[DEBUG] saveCart() - Updated global cart items:', currentCartItems);
    } catch (error) {
        console.error('[DEBUG] saveCart() - Error saving to localStorage:', error);
    }
}

// Function to clear local cart
function clearLocalCart() {
    console.log('[DEBUG] clearLocalCart() - Clearing localStorage cart');
    localStorage.removeItem('medcare_cart');
    currentCartItems = [];
}

// Cart UI elements
const cartItemsContainer = document.getElementById('cart-items-container');
const mrpTotalEl = document.getElementById('mrp-total');
const discountAmountEl = document.getElementById('discount-amount');
const totalEl = document.getElementById('total');
const emptyCartScreen = document.getElementById('empty-cart-fullscreen');
const cartWithItems = document.getElementById('cart-with-items');
const shippingText = document.getElementById('shipping-text');
const shippingStriked = document.getElementById('shipping-striked');

// Function to show empty cart UI with login message
function showLoginRequiredCart() {
    console.log('[DEBUG] showLoginRequiredCart() - Showing login required message');
    if (!emptyCartScreen || !cartWithItems) {
        console.log('[DEBUG] showLoginRequiredCart() - UI elements not found');
        return;
    }
    
    emptyCartScreen.classList.remove('hidden');
    cartWithItems.classList.add('hidden');
    
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = '';
    }
    
    if (mrpTotalEl) mrpTotalEl.textContent = '₹0';
    if (discountAmountEl) discountAmountEl.textContent = '-₹0';
    if (totalEl) totalEl.textContent = '₹0';
}

// Function to update cart count in UI
function updateCartCount() {
    console.log('[DEBUG] updateCartCount() - Updating cart count');
    const userId = getUserId();
    
    if (!userId) {
        console.log('[DEBUG] updateCartCount() - User not logged in, showing 0');
        document.querySelectorAll('#desktop-cart-count, #mobile-cart-count, #cart-count, #cartItemsCount, .cart-count').forEach(el => {
            if (el) {
                el.textContent = '0';
                el.style.display = 'none';
            }
        });
        
        const badge = document.getElementById('cart-count-badge');
        if (badge) {
            badge.classList.add('hidden');
        }
        return;
    }

    const cart = currentCartItems.length > 0 ? currentCartItems : getLocalCart();
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    console.log('[DEBUG] updateCartCount() - Total items:', totalItems);

    document.querySelectorAll('#desktop-cart-count, #mobile-cart-count, #cart-count, #cartItemsCount, .cart-count').forEach(el => {
        if (el) {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        }
    });

    const badge = document.getElementById('cart-count-badge');
    if (badge) {
        badge.classList.toggle('hidden', totalItems === 0);
        const countSpan = badge.querySelector('#cart-count');
        if (countSpan) countSpan.textContent = totalItems;
    }
}

// Function to fetch cart from backend
async function fetchCartFromBackend() {
    const userId = getUserId();
    console.log('[DEBUG] fetchCartFromBackend() - User ID:', userId);
    
    if (!userId) {
        console.log('[DEBUG] fetchCartFromBackend() - User not logged in');
        return [];
    }

    try {
        console.log('[DEBUG] fetchCartFromBackend() - Fetching from:', `${CART_API_URL}/get-cart-items?userId=${userId}`);
        const response = await fetch(`${CART_API_URL}/get-cart-items?userId=${userId}`);
        
        if (!response.ok) {
            console.error('[DEBUG] fetchCartFromBackend() - Failed to fetch cart, status:', response.status);
            throw new Error('Failed to fetch cart');
        }
        
        const backendCart = await response.json();
        console.log('[DEBUG] fetchCartFromBackend() - Backend response:', backendCart);
        
        // Transform backend data

        const transformedCart = backendCart.map(item => {
            let sellingPrice = 0;
            let mrpPrice = 0;

            if (Array.isArray(item.price) && item.price.length >= 2) {
                sellingPrice = Number(item.price[0]);  // discounted price
                mrpPrice = Number(item.price[1]);      // original MRP
            } else if (Array.isArray(item.price) && item.price.length === 1) {
                sellingPrice = Number(item.price[0]);
                mrpPrice = sellingPrice * 1.2; // fallback
            } else {
                // fallback for old format
                sellingPrice = Number(item.price || 0);
                mrpPrice = Number(item.mrp || item.originalPrice || sellingPrice * 1.2);
            }

            const cartItem = {
                id: item.cartItemId || item.id,
                cartItemId: item.cartItemId,
                itemId: item.itemId,
                productId: item.type === 'PRODUCT' ? item.itemId : null,
                mbpId: item.type === 'MBP' ? item.itemId : null,
                type: item.type,
                title: item.title || item.name || 'Unknown Product',
                price: sellingPrice,           // ← now a number
                mrp: mrpPrice,                 // ← now a number
                quantity: item.quantity || 1,
                size: item.selectedSize || '',
                productType: item.productType || 'MEDICINE',
                mainImageUrl: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}`) : 'https://via.placeholder.com/150'
            };
            
            return cartItem;
        });

        // const transformedCart = backendCart.map(item => {
        //     const cartItem = {
        //         id: item.cartItemId || item.id,
        //         cartItemId: item.cartItemId,
        //         itemId: item.itemId,
        //         productId: item.type === 'PRODUCT' ? item.itemId : null,
        //         mbpId: item.type === 'MBP' ? item.itemId : null,
        //         type: item.type,
        //         title: item.title || item.name || 'Unknown Product',
        //         price: item.price || 0,
        //         mrp: item.mrp || item.originalPrice || (item.price ? item.price * 1.2 : 0),
        //         quantity: item.quantity || 1,
        //         size: item.selectedSize || '',
        //         productType: item.productType || 'MEDICINE',
        //         mainImageUrl: item.imageUrl ? (item.imageUrl.startsWith('http') ? item.imageUrl : `${BASE_URL}${item.imageUrl}`) : 'https://via.placeholder.com/150'
        //     };
            
        //     console.log('[DEBUG] fetchCartFromBackend() - Transformed item:', cartItem);
        //     return cartItem;
        // });

        console.log('[DEBUG] fetchCartFromBackend() - Transformed cart:', transformedCart);
        return transformedCart;
    } catch (error) {
        console.error('[DEBUG] fetchCartFromBackend() - Error:', error);
        return [];
    }
}

// Function to load and display cart
async function loadCart() {
    console.log('[DEBUG] loadCart() - Starting cart load');
    const userId = getUserId();
    
    if (!userId) {
        console.log('[DEBUG] loadCart() - User not logged in');
        showLoginRequiredCart();
        updateCartCount();
        return;
    }
    
    console.log('[DEBUG] loadCart() - User logged in, fetching cart');
    
    try {
        const backendCart = await fetchCartFromBackend();
        console.log('[DEBUG] loadCart() - Backend cart length:', backendCart.length);
        
        if (backendCart.length === 0) {
            console.log('[DEBUG] loadCart() - No items in backend cart');
            saveCart([]);
            showLoginRequiredCart();
        } else {
            console.log('[DEBUG] loadCart() - Has items, saving and updating UI');
            saveCart(backendCart);
            updateCartUI(backendCart);
        }
        
        updateCartCount();
    } catch (error) {
        console.error('[DEBUG] loadCart() - Error loading cart:', error);
        showLoginRequiredCart();
    }
}

// Function to add item to cart
async function addToCart(itemData) {
    console.log('[DEBUG] addToCart() - Adding item:', itemData);
    const userId = getUserId();
    
    if (!userId) {
        console.log('[DEBUG] addToCart() - User not logged in');
        showToast('Please login to add items to cart', 'error');
        return null;
    }

    try {
        const requestData = {
            userId: userId,
            type: itemData.type || "PRODUCT",
            quantity: itemData.quantity || 1,
            selectedSize: itemData.size || "",
            productType: itemData.productType || "MEDICINE"
        };

        if (itemData.type === 'PRODUCT' && itemData.productId) {
            requestData.productId = itemData.productId;
        } else if (itemData.type === 'MBP' && itemData.mbpId) {
            requestData.mbpId = itemData.mbpId;
        }

        console.log('[DEBUG] addToCart() - Sending request:', requestData);

        const response = await fetch(`${CART_API_URL}/add-cart-items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('[DEBUG] addToCart() - Backend response:', result);
            
            await loadCart();
            showToast('Added to cart successfully', 'success');
            return result;
        } else {
            const errorData = await response.json();
            console.error('[DEBUG] addToCart() - Backend error:', errorData);
            showToast(errorData.error || 'Failed to add to cart', 'error');
            return null;
        }
    } catch (error) {
        console.error('[DEBUG] addToCart() - Network error:', error);
        showToast('Network error', 'error');
        return null;
    }
}

// Function to update quantity - FIXED: Uses global currentCartItems
async function updateQuantity(cartItemId, newQty) {
    console.log('[DEBUG] updateQuantity() - Called with:', { cartItemId, newQty });
    
    const userId = getUserId();
    if (!userId) {
        console.log('[DEBUG] updateQuantity() - User not logged in');
        showToast('Please login to modify cart', 'error');
        return;
    }

    const itemIdNum = parseInt(cartItemId);
    console.log('[DEBUG] updateQuantity() - Parsed item ID:', itemIdNum);

    if (newQty < 1) {
        console.log('[DEBUG] updateQuantity() - Quantity < 1, removing item');
        await removeFromCartById(itemIdNum);
        return;
    }

    try {
        // FIRST: Try to get item from global currentCartItems
        let item = currentCartItems.find(item => item.id == itemIdNum);
        if (!item) {
            item = currentCartItems.find(item => item.cartItemId == itemIdNum);
        }
        
        // SECOND: If not in global, try localStorage
        if (!item) {
            console.log('[DEBUG] updateQuantity() - Not in global, checking localStorage');
            const localCart = getLocalCart();
            item = localCart.find(item => item.id == itemIdNum || item.cartItemId == itemIdNum);
        }
        
        // THIRD: If still not found, reload cart from backend
        if (!item) {
            console.log('[DEBUG] updateQuantity() - Not found anywhere, reloading cart');
            await loadCart();
            // Try to find again after reload
            item = currentCartItems.find(item => item.id == itemIdNum || item.cartItemId == itemIdNum);
        }
        
        if (!item) {
            console.error('[DEBUG] updateQuantity() - Item not found after all attempts:', itemIdNum);
            showToast('Item not found in cart', 'error');
            return;
        }

        console.log('[DEBUG] updateQuantity() - Found item:', item);
        
        const requestData = {
            userId: userId,
            type: item.type,
            quantity: newQty,
            selectedSize: item.size || "",
            productType: item.productType || "MEDICINE"
        };

        if (item.type === 'PRODUCT' && item.productId) {
            requestData.productId = item.productId;
        } else if (item.type === 'MBP' && item.mbpId) {
            requestData.mbpId = item.mbpId;
        }

        console.log('[DEBUG] updateQuantity() - Sending update request:', requestData);

        const response = await fetch(`${CART_API_URL}/update-cart-items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[DEBUG] updateQuantity() - Backend error:', errorData);
            throw new Error('Failed to update quantity');
        }
        
        console.log('[DEBUG] updateQuantity() - Success, reloading cart');
        await loadCart();
        showToast('Quantity updated', 'success');
    } catch (error) {
        console.error('[DEBUG] updateQuantity() - Error:', error);
        showToast('Failed to update quantity', 'error');
    }
}

// Function to remove item from cart - FIXED: Uses global currentCartItems
async function removeFromCartById(cartItemId) {
    console.log('[DEBUG] removeFromCartById() - Called with:', { cartItemId });
    
    const userId = getUserId();
    if (!userId) {
        console.log('[DEBUG] removeFromCartById() - User not logged in');
        showToast('Please login to modify cart', 'error');
        return;
    }

    const itemIdNum = parseInt(cartItemId);
    console.log('[DEBUG] removeFromCartById() - Parsed item ID:', itemIdNum);

    try {
        // Try to get item from global currentCartItems
        let item = currentCartItems.find(item => item.id == itemIdNum);
        if (!item) {
            item = currentCartItems.find(item => item.cartItemId == itemIdNum);
        }
        
        // If not in global, try localStorage
        if (!item) {
            console.log('[DEBUG] removeFromCartById() - Not in global, checking localStorage');
            const localCart = getLocalCart();
            item = localCart.find(item => item.id == itemIdNum || item.cartItemId == itemIdNum);
        }
        
        // If still not found, fetch from backend
        if (!item) {
            console.log('[DEBUG] removeFromCartById() - Not found, fetching from backend');
            const backendCart = await fetchCartFromBackend();
            item = backendCart.find(item => item.id == itemIdNum || item.cartItemId == itemIdNum);
            
            if (!item) {
                console.error('[DEBUG] removeFromCartById() - Item not found anywhere:', itemIdNum);
                showToast('Item not found in cart', 'error');
                return;
            }
        }

        console.log('[DEBUG] removeFromCartById() - Found item:', item);
        
        const requestData = {
            userId: userId,
            type: item.type,
            selectedSize: item.size || ""
        };

        if (item.type === 'PRODUCT' && item.productId) {
            requestData.productId = item.productId;
        } else if (item.type === 'MBP' && item.mbpId) {
            requestData.mbpId = item.mbpId;
        }

        console.log('[DEBUG] removeFromCartById() - Sending remove request:', requestData);

        const response = await fetch(`${CART_API_URL}/remove-cart-items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Failed to remove item');
        }
        
        console.log('[DEBUG] removeFromCartById() - Success, reloading cart');
        await loadCart();
        showToast('Item removed from cart', 'success');
    } catch (error) {
        console.error('[DEBUG] removeFromCartById() - Error:', error);
        showToast('Failed to remove item', 'error');
    }
}

// Function to clear entire cart
async function clearCart() {
    console.log('[DEBUG] clearCart() - Called');
    const userId = getUserId();
    if (!userId) {
        console.log('[DEBUG] clearCart() - User not logged in');
        showToast('Please login to clear cart', 'error');
        return;
    }

    if (confirm('Clear all items from cart?')) {
        try {
            console.log('[DEBUG] clearCart() - Clearing backend cart');
            const response = await fetch(`${CART_API_URL}/clear-cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: userId })
            });

            if (!response.ok) {
                throw new Error('Failed to clear cart');
            }
            
            clearLocalCart();
            await loadCart();
            showToast('Cart cleared successfully', 'success');
        } catch (error) {
            console.error('[DEBUG] clearCart() - Error:', error);
            showToast('Failed to clear cart', 'error');
        }
    }
}

// Function to update cart UI
function updateCartUI(cartData = null) {
    console.log('[DEBUG] updateCartUI() - Called');
    
    if (!cartItemsContainer || !emptyCartScreen || !cartWithItems) {
        console.error('[DEBUG] updateCartUI() - Required UI elements not found');
        return;
    }
    
    const cart = cartData || getLocalCart();
    console.log('[DEBUG] updateCartUI() - Cart data:', cart);
    
    // Update global variable
    currentCartItems = [...cart];
    console.log('[DEBUG] updateCartUI() - Updated global cart items:', currentCartItems);
    
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    console.log('[DEBUG] updateCartUI() - Total items:', totalItems);

    // Update item count headers
    const itemCountHeader = document.getElementById('item-count-header');
    const itemCountPrice = document.getElementById('item-count-price');
    if (itemCountHeader) {
        itemCountHeader.textContent = totalItems + ' Item' + (totalItems !== 1 ? 's' : '');
    }
    if (itemCountPrice) {
        itemCountPrice.textContent = '(' + totalItems + ' Item' + (totalItems !== 1 ? 's' : '') + ')';
    }

    if (cart.length === 0) {
        console.log('[DEBUG] updateCartUI() - Cart is empty');
        emptyCartScreen.classList.remove('hidden');
        cartWithItems.classList.add('hidden');
        cartItemsContainer.innerHTML = '';
        if (mrpTotalEl) mrpTotalEl.textContent = '₹0';
        if (discountAmountEl) discountAmountEl.textContent = '-₹0';
        if (totalEl) totalEl.textContent = '₹0';
        return;
    }

    console.log('[DEBUG] updateCartUI() - Cart has items, showing them');
    emptyCartScreen.classList.add('hidden');
    cartWithItems.classList.remove('hidden');

    // Calculate prices
    let totalMRP = 0;
    let totalPrice = 0;

    // Generate cart items HTML
    const cartItemsHTML = cart.map((item) => {
        const itemMRP = Number(item.mrp || item.originalPrice || item.price * 1.2);
        const itemPrice = Number(item.price);
        const itemDiscount = itemMRP - itemPrice;
        const discountPercent = Math.round((itemDiscount / itemMRP) * 100);

        totalMRP += itemMRP * item.quantity;
        totalPrice += itemPrice * item.quantity;
        
        const itemId = item.id || item.cartItemId;
        console.log(`[DEBUG] updateCartUI() - Generating HTML for item:`, {
            title: item.title,
            itemId: itemId,
            quantity: item.quantity
        });

        return `
        <div class="cart-item bg-white border-b p-5 flex gap-4 items-start">
            <div class="flex-shrink-0">
                <img src="${item.mainImageUrl || 'https://via.placeholder.com/150'}" 
                     alt="${item.title || 'Unknown Product'}" 
                     class="w-28 h-28 object-cover rounded-lg border">
            </div>
            <div class="flex-1">
                <div class="flex justify-between">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-800 text-base mb-1">${item.title || 'Unknown Product'}</h3>
                        ${item.size ? `<p class="text-xs text-gray-500 mb-2">Size: ${item.size}</p>` : ''}
                        ${item.productType ? `<p class="text-xs text-gray-500 mb-2">Category: ${item.productType}</p>` : ''}
                        
                        <div class="flex items-center gap-3 mb-3">
                            <span class="font-bold text-green-600">₹${itemPrice.toFixed(0)}</span>
                            <span class="text-gray-400 line-through text-sm">₹${itemMRP.toFixed(0)}</span>
                            <span class="text-red-500 font-semibold text-sm">(${discountPercent}% OFF)</span>
                        </div>

                        <div class="flex items-center gap-6">
                            <div class="flex items-center border rounded">
                                <button class="decrease-btn w-8 h-8 hover:bg-gray-100 text-gray-600 font-bold transition" data-item-id="${itemId}">-</button>
                                <span class="quantity-display w-12 text-center font-semibold text-gray-800 border-x">${item.quantity}</span>
                                <button class="increase-btn w-8 h-8 hover:bg-gray-100 text-gray-600 font-bold transition" data-item-id="${itemId}">+</button>
                            </div>
                        </div>
                    </div>
                    <button class="delete-btn text-gray-400 hover:text-red-600 transition" data-item-id="${itemId}">
                        <i class="far fa-trash-alt text-xl"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Set the HTML
    cartItemsContainer.innerHTML = cartItemsHTML;
    console.log('[DEBUG] updateCartUI() - HTML generated and set');

    // Calculate totals
    const totalDiscount = totalMRP - totalPrice;
    const shipping = totalPrice >= 799 ? 0 : 49;
    const finalTotal = totalPrice + shipping;

    if (mrpTotalEl) mrpTotalEl.textContent = '₹' + totalMRP.toFixed(0);
    if (discountAmountEl) discountAmountEl.textContent = '-₹' + totalDiscount.toFixed(0);
    if (totalEl) totalEl.textContent = '₹' + finalTotal.toFixed(0);
    
    if (shippingText && shippingStriked) {
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
    
    // Attach event listeners
    attachEventListenersToCart();
}

// Function to attach event listeners to cart buttons
function attachEventListenersToCart() {
    console.log('[DEBUG] attachEventListenersToCart() - Attaching listeners');
    
    if (!cartItemsContainer) {
        console.error('[DEBUG] attachEventListenersToCart() - Container not found');
        return;
    }
    
    // Use event delegation
    cartItemsContainer.addEventListener('click', async function(e) {
        const target = e.target;
        console.log('[DEBUG] Container click - Target:', target);
        
        // Handle decrease button
        if (target.classList.contains('decrease-btn')) {
            e.preventDefault();
            const itemId = target.getAttribute('data-item-id');
            console.log('[DEBUG] Decrease button clicked - Item ID:', itemId);
            
            const quantitySpan = target.nextElementSibling;
            if (quantitySpan && quantitySpan.classList.contains('quantity-display')) {
                const currentQty = parseInt(quantitySpan.textContent) || 1;
                const newQty = currentQty - 1;
                console.log('[DEBUG] Decreasing quantity from', currentQty, 'to', newQty);
                await updateQuantity(itemId, newQty);
            }
        }
        
        // Handle increase button
        else if (target.classList.contains('increase-btn')) {
            e.preventDefault();
            const itemId = target.getAttribute('data-item-id');
            console.log('[DEBUG] Increase button clicked - Item ID:', itemId);
            
            const quantitySpan = target.previousElementSibling;
            if (quantitySpan && quantitySpan.classList.contains('quantity-display')) {
                const currentQty = parseInt(quantitySpan.textContent) || 1;
                const newQty = currentQty + 1;
                console.log('[DEBUG] Increasing quantity from', currentQty, 'to', newQty);
                await updateQuantity(itemId, newQty);
            }
        }
        
        // Handle delete button
        else if (target.classList.contains('delete-btn') || target.classList.contains('fa-trash-alt')) {
            e.preventDefault();
            const button = target.classList.contains('delete-btn') ? target : target.closest('.delete-btn');
            if (button) {
                const itemId = button.getAttribute('data-item-id');
                console.log('[DEBUG] Delete button clicked - Item ID:', itemId);
                
                if (confirm('Remove this item from cart?')) {
                    await removeFromCartById(itemId);
                }
            }
        }
    });
    
    console.log('[DEBUG] Event listeners attached');
}

// Global functions for backward compatibility
window.updateQty = async function(index, newQty) {
    console.log('[DEBUG] updateQty() - Deprecated function called');
    if (currentCartItems[index]) {
        const item = currentCartItems[index];
        await updateQuantity(item.id, newQty);
    }
};

window.removeItem = async function(index) {
    console.log('[DEBUG] removeItem() - Deprecated function called');
    if (confirm('Remove this item from cart?')) {
        if (currentCartItems[index]) {
            const item = currentCartItems[index];
            await removeFromCartById(item.id);
        }
    }
};

window.proceedToCheckout = function() {
    console.log('[DEBUG] proceedToCheckout() - Called');
    const userId = getUserId();
    if (!userId) {
        console.log('[DEBUG] proceedToCheckout() - User not logged in');
        showToast('Please login to proceed to checkout', 'error');
        return;
    }

    if (currentCartItems.length === 0) {
        console.log('[DEBUG] proceedToCheckout() - Cart is empty');
        alert('Your cart is empty!');
        return;
    }
    
    console.log('[DEBUG] proceedToCheckout() - Proceeding to checkout');
    location.href = 'checkout.html';
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[DEBUG] DOMContentLoaded - Initializing cart');
    await loadCart();
    console.log('[DEBUG] DOMContentLoaded - Cart initialization complete');
});

// Function to handle user login
window.handleUserLogin = async function() {
    console.log('[DEBUG] handleUserLogin() - User logged in');
    await loadCart();
    showToast('Welcome back!', 'success');
};

// Function to handle user logout
window.handleUserLogout = function() {
    console.log('[DEBUG] handleUserLogout() - User logged out');
    clearLocalCart();
    showLoginRequiredCart();
    updateCartCount();
    showToast('You have been logged out', 'info');
};

// Listen for storage changes
window.addEventListener('storage', (e) => {
    console.log('[DEBUG] storage event - Key:', e.key);
    if (e.key === 'medcare_cart') {
        console.log('[DEBUG] storage event - Cart changed, updating UI');
        const cart = getLocalCart();
        updateCartUI(cart);
        updateCartCount();
    }
    
    if (e.key === 'userId' || e.key === 'currentUserId') {
        console.log('[DEBUG] storage event - User ID changed, reloading cart');
        setTimeout(() => {
            loadCart();
        }, 100);
    }
});

// Add clear cart button functionality
document.addEventListener('DOMContentLoaded', () => {
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        console.log('[DEBUG] Found clear cart button');
        clearCartBtn.addEventListener('click', clearCart);
    }
});

// Export functions for use in other files
window.cartFunctions = {
    getCart: () => currentCartItems.length > 0 ? currentCartItems : getLocalCart(),
    addToCart,
    updateQuantity,
    removeFromCart: removeFromCartById,
    clearCart,
    loadCart,
    isUserLoggedIn,
    getUserId,
    handleUserLogin,
    handleUserLogout
};

// Auto-refresh cart when tab becomes visible
document.addEventListener('visibilitychange', () => {
    console.log('[DEBUG] visibilitychange - Document hidden:', document.hidden);
    if (!document.hidden && isUserLoggedIn()) {
        console.log('[DEBUG] Tab visible, reloading cart');
        loadCart();
    }
});

// Initial cart count update
updateCartCount();

console.log('[DEBUG] Cart.js loaded successfully');