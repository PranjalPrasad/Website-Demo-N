// ========== SINGLE SOURCE CART SYSTEM ==========
// This prevents double item additions
// Check if cart system is already loaded
if (window.cartSystemInitialized) {
    console.warn('⚠️ Cart system already loaded. Skipping duplicate initialization.');
} else {
    window.cartSystemInitialized = true;
    console.log('✅ Initializing cart system...');
    // Get cart from localStorage
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch (e) {
            console.warn('Cart corrupted, resetting...');
            localStorage.removeItem('cart');
            return [];
        }
    }
    // Save cart
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    // UPDATE CART COUNT
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
    // Toast
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
    // Restore quantity selectors
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
                    btn.classList.add('hidden');
                    selector.classList.remove('hidden');
                    qtyDisplay.textContent = item.quantity;
                } else {
                    btn.classList.remove('hidden');
                    selector.classList.add('hidden');
                }
            }
        });
    }
    // SINGLE EVENT DELEGATION with click prevention
    let isProcessingClick = false;
    const MAX_QTY = 10;
    // Main click handler - ONLY THIS ONE SHOULD EXIST
    document.addEventListener('click', function handleGlobalClick(e) {
        // Prevent rapid multiple clicks
        if (isProcessingClick) {
            console.log('⏸️ Click already being processed, ignoring...');
            return;
        }
        // ADD TO CART
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Prevent other listeners
           
            // Set processing flag
            isProcessingClick = true;
           
            const product = {
                id: addBtn.dataset.productId || addBtn.getAttribute('data-product-id'),
                name: addBtn.dataset.productName || addBtn.getAttribute('data-product-name'),
                price: parseFloat(addBtn.dataset.productPrice || addBtn.getAttribute('data-product-price')),
                image: addBtn.dataset.productImage || addBtn.getAttribute('data-product-image')
            };
            console.log(`🛒 Adding to cart: ${product.name} (ID: ${product.id})`);
            let cart = getCart();
            let existing = cart.find(item => item.id == product.id);
            if (existing) {
                if (existing.quantity >= MAX_QTY) {
                    showToast(`Max ${MAX_QTY} items allowed!`, 'error');
                    isProcessingClick = false;
                    return;
                }
                existing.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            saveCart(cart);
            restoreQuantitySelectors();
            updateCartCount();
            showToast('Added to cart!', 'add');
           
            // Reset processing flag after delay
            setTimeout(() => {
                isProcessingClick = false;
            }, 300);
           
            return;
        }
        // INCREASE (+)
        const increaseBtn = e.target.closest('.increase-qty');
        if (increaseBtn) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            isProcessingClick = true;
            const selector = increaseBtn.closest('.quantity-selector');
            const qtyDisplay = selector.querySelector('.qty-display');
            const addBtn = selector.closest('.relative')?.querySelector('.add-to-cart-btn') ||
                           selector.parentElement.querySelector('.add-to-cart-btn');
            const productId = addBtn.dataset.productId || addBtn.getAttribute('data-product-id');
            let cart = getCart();
            const item = cart.find(i => i.id == productId);
            if (!item || item.quantity >= MAX_QTY) {
                showToast(`Max ${MAX_QTY} allowed!`, 'error');
                isProcessingClick = false;
                return;
            }
            item.quantity += 1;
            qtyDisplay.textContent = item.quantity;
            saveCart(cart);
            updateCartCount();
           
            setTimeout(() => { isProcessingClick = false; }, 300);
            return;
        }
        // DECREASE (-)
        const decreaseBtn = e.target.closest('.decrease-qty');
        if (decreaseBtn) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            isProcessingClick = true;
            const selector = decreaseBtn.closest('.quantity-selector');
            const qtyDisplay = selector.querySelector('.qty-display');
            const addBtn = selector.closest('.relative')?.querySelector('.add-to-cart-btn') ||
                           selector.parentElement.querySelector('.add-to-cart-btn');
            const productId = addBtn.dataset.productId || addBtn.getAttribute('data-product-id');
            let cart = getCart();
            const item = cart.find(i => i.id == productId);
            if (!item) {
                isProcessingClick = false;
                return;
            }
            item.quantity -= 1;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id != productId);
                saveCart(cart);
                selector.classList.add('hidden');
                addBtn.classList.remove('hidden');
                showToast('Removed from cart', 'error');
            } else {
                qtyDisplay.textContent = item.quantity;
                saveCart(cart);
            }
            restoreQuantitySelectors();
            updateCartCount();
           
            setTimeout(() => { isProcessingClick = false; }, 300);
            return;
        }
    }, true); // Use capture phase to ensure this runs first
    // Initialize cart system
    function initializeCart() {
        console.log('🛒 Setting up cart listeners...');
       
        // Initialize UI
        updateCartCount();
        restoreQuantitySelectors();
       
        // Re-check after dynamic content
        setTimeout(() => {
            restoreQuantitySelectors();
            updateCartCount();
        }, 1000);
       
        console.log('✅ Cart system ready');
    }
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCart);
    } else {
        initializeCart();
    }
    // Sync across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            updateCartCount();
            restoreQuantitySelectors();
        }
    });
}
// ========== WISHLIST FUNCTIONS (keep these) ==========
// FORCE WISHLIST COUNT TO SHOW ON EVERY PAGE LOAD
function forceUpdateWishlistCount() {
    const count = getWishlist().length;
    // Update desktop badge
    const desktopBadge = document.getElementById('desktop-wishlist-count');
    if (desktopBadge) {
        desktopBadge.textContent = count;
        desktopBadge.style.display = count > 0 ? 'flex' : 'none';
    }
    // Update mobile badge
    const mobileBadge = document.getElementById('mobile-wishlist-count');
    if (mobileBadge) {
        mobileBadge.textContent = count;
        mobileBadge.style.display = count > 0 ? 'flex' : 'none';
    }
}
// WISHLIST HELPERS
function getWishlist() {
    try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
    catch { localStorage.removeItem('wishlist'); return []; }
}
function saveWishlist(wishlist) {
    try {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        console.log('Wishlist saved:', wishlist);
    } catch (e) {
        console.error('Wishlist save error:', e);
    }
}
function isInWishlist(id) {
    return getWishlist().some(item => item.id === id);
}
// Run wishlist updates
forceUpdateWishlistCount();
document.addEventListener('DOMContentLoaded', forceUpdateWishlistCount);
setTimeout(forceUpdateWishlistCount, 300);
setTimeout(forceUpdateWishlistCount, 1000);
// Make functions globally accessible
window.getWishlist = getWishlist;
window.isInWishlist = isInWishlist;
window.updateCartCount = updateCartCount;
// Comprehensive pharmacy categories and products
const pharmacyCategories = {
    // 'Medicines & Healthcare': {
    //     icon: '💊',
    //     subcategories: [
    //         'Prescription Medicines (Upload Prescription)',
    //         'Over-the-Counter (OTC) Medicines',
    //         'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)',
    //         'First Aid & Emergency (Bandages, Antiseptics, Ointments, Thermometers)',
    //         'Pain Relief & Fever',
    //         'Allergy & Cold Care',
    //         'Digestive Health (Antacids, Probiotics, Laxatives)'
    //     ]
    // },
    // 'Mother Care & Maternity': {
    //     icon: '🤱',
    //     subcategories: [
    //         'Maternity Wear (Dresses, Nursing Wear, Innerwear)',
    //         'Pregnancy Nutrition (Prenatal Vitamins, Supplements)',
    //         'Skincare for Moms (Stretch Mark Cream, Sunscreen, Moisturizers)',
    //         'Trimester Kits (1st, 2nd, 3rd Trimester Essentials)',
    //         'Postpartum Recovery (Belly Belts, Nursing Pads, Sitz Baths)',
    //         'Breastfeeding Essentials (Pumps, Bottles, Nipple Creams)'
    //     ]
    // },
    // 'Baby Care': {
    //     icon: '👶',
    //     subcategories: [
    //         'Diapers & Wipes',
    //         'Baby Skin & Hair Care',
    //         'Feeding & Nursing',
    //         'Baby Health & Safety',
    //         'Toys & Learning',
    //         'Baby Clothing & Accessories'
    //     ]
    // },
    // 'Wellness & Personal Care': {
    //     icon: '💆',
    //     subcategories: [
    //         'Vitamins & Supplements',
    //         'Skin & Hair Care',
    //         'Oral Care',
    //         'Menstrual & Intimate Care',
    //         'Fitness & Weight Management'
    //     ]
    // },
    // 'Medical Devices & Equipment': {
    //     icon: '🩺',
    //     subcategories: [
    //         'Monitoring Devices (BP Monitors, Glucometers, Pulse Oximeters)',
    //         'Mobility Aids (Walkers, Wheelchairs, Sticks)',
    //         'Respiratory Care (Nebulizers, Oxygen Supplies)'
    //     ]
    // },
    // 'Speciality Care': {
    //     icon: '🏥',
    //     subcategories: [
    //         "Women's Health",
    //         "Men's Health",
    //         'Senior Care',
    //         'Immunity Boosters',
    //         'Ayurveda & Herbal Products'
    //     ]
    // }
};
// Create comprehensive search terms including variations and keywords
const searchTerms = [];
// Add main categories
Object.keys(pharmacyCategories).forEach(category => {
    searchTerms.push({
        term: category,
        type: 'main_category',
        icon: pharmacyCategories[category].icon,
        category: category
    });
  
    // Add subcategories
    pharmacyCategories[category].subcategories.forEach(sub => {
        searchTerms.push({
            term: sub,
            type: 'subcategory',
            icon: '🔸',
            category: category,
            parent: pharmacyCategories[category].icon
        });
    });
});
// Add additional searchable keywords for better matching
const additionalKeywords = [
    // Medicines keywords
    // { term: 'medicines', matches: 'Medicines & Healthcare', icon: '💊' },
    // { term: 'prescription', matches: 'Prescription Medicines (Upload Prescription)', icon: '📋' },
    // { term: 'otc', matches: 'Over-the-Counter (OTC) Medicines', icon: '💊' },
    // { term: 'diabetes', matches: 'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)', icon: '🩺' },
    // { term: 'blood pressure', matches: 'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)', icon: '🩺' },
    // { term: 'hypertension', matches: 'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)', icon: '🩺' },
    // { term: 'asthma', matches: 'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)', icon: '🩺' },
    // { term: 'thyroid', matches: 'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)', icon: '🩺' },
    // { term: 'bandages', matches: 'First Aid & Emergency (Bandages, Antiseptics, Ointments, Thermometers)', icon: '🩹' },
    // { term: 'first aid', matches: 'First Aid & Emergency (Bandages, Antiseptics, Ointments, Thermometers)', icon: '🚑' },
    // { term: 'pain relief', matches: 'Pain Relief & Fever', icon: '💊' },
    // { term: 'fever', matches: 'Pain Relief & Fever', icon: '🌡️' },
    // { term: 'allergy', matches: 'Allergy & Cold Care', icon: '🤧' },
    // { term: 'cold', matches: 'Allergy & Cold Care', icon: '🤧' },
  
    // // Mother Care keywords
    // { term: 'maternity', matches: 'Maternity Wear (Dresses, Nursing Wear, Innerwear)', icon: '👗' },
    // { term: 'pregnancy', matches: 'Pregnancy Nutrition (Prenatal Vitamins, Supplements)', icon: '🤰' },
    // { term: 'prenatal', matches: 'Pregnancy Nutrition (Prenatal Vitamins, Supplements)', icon: '🤰' },
    // { term: 'breastfeeding', matches: 'Breastfeeding Essentials (Pumps, Bottles, Nipple Creams)', icon: '🍼' },
  
    // // Baby Care keywords
    // { term: 'diapers', matches: 'Diapers & Wipes', icon: '👶' },
    // { term: 'baby', matches: 'Baby Care', icon: '👶' },
    // { term: 'toys', matches: 'Toys & Learning', icon: '🧸' },
  
    // // Wellness keywords
    // { term: 'vitamins', matches: 'Vitamins & Supplements', icon: '💊' },
    // { term: 'supplements', matches: 'Vitamins & Supplements', icon: '💊' },
    // { term: 'skincare', matches: 'Skin & Hair Care', icon: '🧴' },
    // { term: 'oral care', matches: 'Oral Care', icon: '🦷' },
    // { term: 'fitness', matches: 'Fitness & Weight Management', icon: '💪' },
  
    // // Medical Devices keywords
    // { term: 'bp monitor', matches: 'Monitoring Devices (BP Monitors, Glucometers, Pulse Oximeters)', icon: '🩺' },
    // { term: 'glucometer', matches: 'Monitoring Devices (BP Monitors, Glucometers, Pulse Oximeters)', icon: '🩺' },
    // { term: 'wheelchair', matches: 'Mobility Aids (Walkers, Wheelchairs, Sticks)', icon: '♿' },
    // { term: 'nebulizer', matches: 'Respiratory Care (Nebulizers, Oxygen Supplies)', icon: '🫁' },
  
    // // Specialty Care keywords
    // { term: 'women health', matches: "Women's Health", icon: '♀️' },
    // { term: 'men health', matches: "Men's Health", icon: '♂️' },
    // { term: 'ayurveda', matches: 'Ayurveda & Herbal Products', icon: '🌿' },
    // { term: 'herbal', matches: 'Ayurveda & Herbal Products', icon: '🌿' },
    // { term: 'immunity', matches: 'Immunity Boosters', icon: '🛡️' }
];
function openProductDetails(id) {
    const all = [...productsData, ...medicinesData];
    const p = all.find(item => item.id === id);
    if (!p) return alert("Product not found");
    // Parse price and original price
    const price = parseFloat(p.price.replace('₹', '').replace(',', ''));
    const originalPrice = p.originalPrice ? parseFloat(p.originalPrice.replace('₹', '').replace(',', '')) : 0;
   
    // Calculate discount percentage
    let discountPercentage = 0;
    if (originalPrice > 0 && price < originalPrice) {
        discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    // Generate a random quantity (5-20) for demo purposes
    const randomQuantity = Math.floor(Math.random() * 16) + 5;
   
    const params = new URLSearchParams({
        id: p.id,
        name: encodeURIComponent(p.name || p.title),
        price: price.toString(),
        originalPrice: originalPrice.toString(),
        discount: discountPercentage.toString(),
        image: encodeURIComponent(p.image || p.mainImageUrl),
        description: encodeURIComponent(p.description || 'Premium quality healthcare product.'),
        category: p.category || 'all',
        quantity: randomQuantity.toString(),
        unit: 'pack',
        sku: `SKU-${p.id}`,
        brand: encodeURIComponent(p.brand || 'Generic Brand'),
        rating: '4.5',
        mrp: originalPrice.toString() // Add MRP for display
    });
   
    window.location.href = `productdetails.html?${params.toString()}`;
}
const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('searchSuggestions');
function createSuggestionItem(item, isMainCategory = false, icon = '🔍', parentIcon = '') {
    const div = document.createElement('div');
    div.className = 'suggestion-item flex items-center p-3 cursor-pointer rounded-lg transition-colors bg-white-50 duration-150 hover:bg-blue-50';
  
    let displayIcon = icon;
    let textColor = 'text-gray-800';
    let displayText = item.term || item;
  
    if (isMainCategory) {
        textColor = 'text-blue-700 font-semibold';
        displayIcon = item.icon || icon;
        displayText = item.term || item;
    } else if (item.type === 'subcategory') {
        textColor = 'text-gray-700';
        displayIcon = item.parent + ' ' + item.icon;
        displayText = item.term;
    } else if (item.type === 'keyword') {
        textColor = 'text-green-600';
        displayIcon = item.icon;
        displayText = item.term;
    }
  
    div.innerHTML = `
        <span class="mr-3 text-lg">${displayIcon}</span>
        <span class="flex-1 ${textColor}">${displayText}</span>
        <span class="text-sm text-gray-400">→</span>
    `;
  
    div.addEventListener('click', () => {
        const searchValue = displayText;
        searchInput.value = searchValue;
        suggestions.classList.add('hidden');
        performSearch(searchValue);
    });
  
    return div;
}
// Show suggestions when clicking/focusing the input
function showSuggestions() {
    suggestions.classList.remove('hidden');
}
// Hide suggestions when clicking outside
function hideSuggestions(e) {
    // If the click is NOT inside the search input OR the suggestions box → hide it
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.classList.add('hidden');
    }
}
function performSearch(query) {
    console.log('Searching for:', query);
    // Here you would typically make an API call or redirect to search results
    alert(`Searching for: ${query}`);
}
// Event listeners for search
if (searchInput && suggestions) {
    searchInput.addEventListener('focus', () => showSuggestions(searchInput.value));
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query.length > 0) {
            showSuggestions(query);
        } else {
            showSuggestions();
        }
    });
    // Show suggestions when input is focused
    searchInput.addEventListener('focus', () => {
        suggestions.classList.remove('hidden');
    });
   
    searchInput.addEventListener('blur', (e) => {
        // Delay hiding suggestions to allow clicks
        setTimeout(() => {
            suggestions.classList.add('hidden');
        }, 150);
    });
    searchInput.addEventListener('focus', showSuggestions);
    searchInput.addEventListener('click', showSuggestions);
    // Hide when clicking anywhere else on the page
    document.addEventListener('click', hideSuggestions);
    // Optional: Also hide on Escape key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            suggestions.classList.add('hidden');
            searchInput.blur();
        }
    });
    // Optional: Keep open if user clicks inside suggestions (prevents closing when selecting)
    suggestions.addEventListener('click', (e) => {
        e.stopPropagation(); // This stops the click from bubbling up to document
    });
   
    // Search button functionality
    const searchButton = document.querySelector('button[class*="bg-blue-600"]');
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            performSearch(searchInput.value);
        });
    }
   
    // Enter key search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
   
    // Optional: Hide on Escape key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            suggestions.classList.add('hidden');
            searchInput.blur();
        }
    });
}
// Category button functionality
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const categoryMap = {
            'Medicines': 'Medicines & Healthcare',
            'Mother Care': 'Mother Care & Maternity',
            'Baby Care': 'Baby Care',
            'Wellness': 'Wellness & Personal Care',
            'Medical Devices': 'Medical Devices & Equipment'
        };
      
        const buttonText = btn.textContent.trim();
        const categoryKey = Object.keys(categoryMap).find(key => buttonText.includes(key));
        const fullCategory = categoryMap[categoryKey] || buttonText;
      
        searchInput.value = fullCategory;
        performSearch(fullCategory);
    });
});
// Click outside to close suggestions
document.addEventListener('click', (e) => {
    if (suggestions && searchInput && !searchInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.classList.add('hidden');
    }
});
// Dynamic data for banners (can be fetched from backend)
const mainBackgroundBanner = "Images/IMG/pharmacyBanner11.jpg";
const carouselBanners = [
    "Images/IMG/pharmacyBanner2.jpg",
    "Images/IMG/farmasi banner 5th.jpg",
    "Images/IMG/farmasi banner 3rd.jpg",
    "Images/IMG/farmasi banner 4th.jpg"
];
const secondaryBanner = "Images/IMG/farmasi banner 8th.jpg";
// Sample data for 6 categories (can be fetched from backend)
let categoriesData = [
    { name: "Mother Care", image: "Images/category/allergy and cold care.png", url: "./MotherCare/mother.html"},
    { name: "Baby Care", image: "Images/category/Ayurveda.png", url: "./BabyCare/baby.html" },
    { name: "LifeStyle Disorder", image: "Images/category/CHRONIC 1.png", url: "./Medical and HealthCare/LifeStyle/lifestyle.html"},
    { name: "Fertility Essentials", image: "Images/category/Digestive Health.png", url: "./Medical and HealthCare/Fertility/firtility.html" },
    { name: "Surgical", image: "Images/category/FIRST AID & EMERGENCY.png", url: "./Surgical/Surgical.html?sub=dressings-and-bandages" },
    { name: "Vitamins and Supplements", image: "Images/category/vitamins.png", url: "./Wellness/wellness.html?sub=vitamins-supplements"},
    { name: "Respiratory Devices", image: "Images/category/immunity Boosters.png", url: "./DEVICES/RESPIRATORY CARE/respiratory.html"},
  
    { name: "Mobility Aids", image: "Images/category/mobility aids (1).png", url: "./DEVICES/MOBILITY AIDS/mobility.html" },
    { name: "Monitoring Devices", image: "Images/category/monitoring devices.png", url: "./DEVICES/MONITORING DEVICES/monitor.html" },
    { name: "Oral Care", image: "Images/category/Oral care.png", url: "./Wellness/wellness.html?sub=oral-care" },
    { name: "OTC", image: "Images/category/OTC.png", url: "./Medical and HealthCare/OTC/otc.html" },
  
    { name: "Prescription Based", image: "Images/category/Prescription based.png", url: "./Medical and HealthCare/Prescription/prescription.html" },
    { name: "Senior Care", image: "Images/category/Senior Care.png", url: "./Wellness/wellness.html?sub=senior-care" },
    { name: "Skin & Hair", image: "Images/category/skin & hair care.png", url: "./Wellness/wellness.html?sub=hair-skin-care" },
    { name: "Menstrual Care", image: "Images/category", url: "./Wellness/wellness.html?sub=menstrual-care" },
];
const productsData = [
    { id: 40, name: "Whisper Ultra Clean Wings", image: "https://i.pinimg.com/736x/15/b9/8d/15b98d803f2e10178711489c46061497.jpg", price: "₹279", originalPrice: "₹329", discount: "15% off" },
    { id: 41, name: "Sofy Anti-Bacteria Extra Long", image: "https://i.pinimg.com/736x/98/8e/a0/988ea0dfd9d5d8fe68a741f6fa010c20.jpg", price: "₹259", originalPrice: "₹310", discount: "16% off" },
    { id: 42, name: "Bella Regular Soft Pads", image: "https://i.pinimg.com/1200x/9e/9a/ff/9e9aff588641655ee47d3f1430291a1f.jpg", price: "₹189", originalPrice: "₹239", discount: "21% off" },
    { id: 43, name: "Tampax Pearl Regular Tampons", image: "https://i.pinimg.com/1200x/05/5a/31/055a316a51a66f464c778ab07c8f7c99.jpg", price: "₹399", originalPrice: "₹459", discount: "13% off" },
    { id: 44, name: "Carefree Panty Liners", image: "https://i.pinimg.com/1200x/9a/ae/62/9aae62e4e98e6bc15554dc9fd3e5c713.jpg", price: "₹149", originalPrice: "₹179", discount: "17% off" },
    { id: 45, name: "Sirona Reusable Menstrual Cup", image: "https://i.pinimg.com/736x/68/04/70/6804705cf54829aa6171565b16ecae00.jpg", price: "₹499", originalPrice: "₹599", discount: "17% off" },
    { id: 46, name: "Nua Cramp Comfort Heat Patches", image: "https://i.pinimg.com/736x/5a/f4/0a/5af40a443e4c0c0fe65384cdf70a5508.jpg", price: "₹299", originalPrice: "₹349", discount: "14% off" },
    { id: 47, name: "VWash Plus Intimate Wash", image: "https://i.pinimg.com/1200x/2a/30/1f/2a301fa528e6ae13eb929c3d46ba5227.jpg", price: "₹229", originalPrice: "₹269", discount: "15% off" }
];
const medicinesData = [
    { id: 48, name: "Paracetamol 500mg", image: "https://i.pinimg.com/1200x/df/3b/b2/df3bb27c00bb0f4b54692f9000a56b1f.jpg", price: "₹49", originalPrice: "₹59", discount: "17% off" },
    { id: 49, name: "Ibuprofen Tablets", image: "https://i.pinimg.com/1200x/42/a4/9d/42a49d09e810f203fd7c82999efe1c51.jpg", price: "₹89", originalPrice: "₹99", discount: "10% off" },
    { id: 50, name: "Digital Thermometer", image: "https://i.pinimg.com/736x/3f/80/34/3f803459fbfc629161ae550bee4c4b75.jpg", price: "₹199", originalPrice: "₹249", discount: "20% off" },
    { id: 51, name: "Blood Pressure Monitor", image: "https://i.pinimg.com/736x/86/85/b8/8685b8bc870fd478367baee1e5065fe5.jpg", price: "₹1299", originalPrice: "₹1499", discount: "13% off" },
    { id: 52, name: "Vitamin C Supplements", image: "https://i.pinimg.com/736x/6e/8f/a8/6e8fa8670eacd8fdd912a4f040c47875.jpg", price: "₹299", originalPrice: "₹349", discount: "14% off" },
    { id: 53, name: "Diabetes Test Strips", image: "https://i.pinimg.com/736x/f3/fd/72/f3fd721aeac334de1a8fd9ca53a43f19.jpg", price: "₹499", originalPrice: "₹599", discount: "17% off" },
    { id: 54, name: "First Aid Kit", image: "https://i.pinimg.com/1200x/94/6a/25/946a25a8467b2cfc3bbee39bb13c2751.jpg", price: "₹349", originalPrice: "₹399", discount: "13% off" },
    { id: 55, name: "Asthma Inhaler", image: "https://i.pinimg.com/1200x/d3/0f/4c/d30f4c670beb8884b309c0068c11afcf.jpg", price: "₹189", originalPrice: "₹219", discount: "14% off" }
];
// ==================== UPDATED createCard() FUNCTION ====================
function createMyntraCard(p) {
    const inWish = isInWishlist(p.id);
    const cleanPrice = p.price.replace('₹', '').trim();
    return `
        <div class="myntra-card group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer w-full">
            <!-- Discount Badge -->
            ${p.discount ? `
                <div class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded z-10 shadow-sm">
                    ${p.discount}
                </div>
            ` : ''}
           
            <!-- Wishlist Heart -->
            <div class="myntra-wishlist absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm z-10 transition-all duration-200 ${inWish ? 'active text-red-500' : 'text-gray-400 hover:text-red-500'}"
                 data-id="${p.id}"
                 onclick="toggleWishlistItem(${p.id})">
                <i class="${inWish ? 'fas' : 'far'} fa-heart text-sm"></i>
            </div>
           
            <!-- Product Image Container -->
            <div class="relative h-48 overflow-hidden bg-gray-100">
                <img src="${p.image || p.mainImageUrl}"
                     alt="${p.name || p.title}"
                     loading="lazy"
                     class="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105">
               
                <!-- "NEW" Badge if applicable -->
                ${p.tag === 'new' ? `
                    <div class="absolute top-3 right-12 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                        NEW
                    </div>
                ` : ''}
            </div>
           
            <!-- Product Info -->
            <div class="p-4">
                <!-- Product Name - Smaller and compact -->
                <h3 class="myntra-product-name text-gray-800 font-normal text-sm mb-2 line-clamp-2 h-8 leading-tight overflow-hidden">
                    ${p.name || p.title}
                </h3>
               
                <!-- Brand/Type if available -->
                ${p.brand ? `
                    <div class="text-xs text-gray-500 mb-1 font-medium">
                        ${p.brand}
                    </div>
                ` : ''}
               
                ${p.type ? `
                    <div class="text-xs text-gray-400 mb-2">
                        ${p.type}
                    </div>
                ` : ''}
               
                <!-- Price Row - More compact -->
                <div class="myntra-price-row flex items-center gap-2 mb-3">
                    <span class="myntra-current-price text-lg font-bold text-green-600">
                        ${p.price}
                    </span>
                    ${p.originalPrice ? `
                        <span class="myntra-original-price text-gray-500 line-through text-sm">
                            ${p.originalPrice}
                        </span>
                    ` : ''}
                    <span class="myntra-current-price text-sm font-bold text-red-600">
                        ${p.discount}
                    </span>
                </div>
               
                <!-- Rating/Reviews if available -->
                ${p.rating ? `
                    <div class="flex items-center gap-1 mb-3">
                        <div class="flex text-yellow-400 text-xs">
                            ${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}
                        </div>
                        <span class="text-xs text-gray-500">(${p.reviews || 0})</span>
                    </div>
                ` : ''}
               
                <!-- Add to Cart Button - More compact -->
                <button class="add-to-cart-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-md transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center"
                        data-product-id="${p.id}"
                        data-product-name="${p.name || p.title}"
                        data-product-price="${cleanPrice}"
                        data-product-image="${p.image || p.mainImageUrl}">
                    <i class="fas fa-shopping-bag mr-2 text-xs"></i>ADD TO CART
                </button>
               
                <!-- Quick View Button - Smaller and less prominent -->
                <button onclick="openProductDetails(${p.id})"
                        class="w-full mt-2 text-gray-600 hover:text-blue-600 font-medium text-xs py-2 rounded-md transition-colors duration-200">
                    Quick View
                </button>
            </div>
        </div>
    `;
}
function renderMyntraSection(trackId, data) {
    const track = document.getElementById(trackId);
    if (!track) {
        console.error(`Element #${trackId} not found!`);
        return;
    }
    // Clear existing content
    track.innerHTML = '';
   
    // Add cards directly without extra wrapper divs
    data.forEach(product => {
        const cardHtml = createMyntraCard(product);
        track.innerHTML += cardHtml;
    });
    // Get arrow buttons - FIXED LOGIC
    let prevBtn, nextBtn;
   
    if (trackId === 'feminine-track') {
        prevBtn = document.getElementById('fem-prev');
        nextBtn = document.getElementById('fem-next');
    } else if (trackId === 'medicine-track') {
        prevBtn = document.getElementById('med-prev');
        nextBtn = document.getElementById('med-next');
    } else {
        // Fallback: try common patterns
        prevBtn = document.querySelector(`[data-track="${trackId}"] .prev-btn`) ||
                  document.querySelector(`#${trackId}-container .prev-btn`);
        nextBtn = document.querySelector(`[data-track="${trackId}"] .next-btn`) ||
                  document.querySelector(`#${trackId}-container .next-btn`);
    }
    const cardWidth = 230; // Card width
    const gap = 16; // Gap between cards
    const scrollAmount = (cardWidth + gap) * 3; // Scroll 3 cards at a time
    if (nextBtn) {
        console.log(`✓ Next button found for ${trackId}:`, nextBtn.id || nextBtn.className);
        nextBtn.onclick = () => {
            console.log(`Scrolling ${trackId} forward by ${scrollAmount}px`);
            track.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        };
    } else {
        console.warn(`✗ Next button not found for ${trackId}. Available buttons:`, {
            'fem-prev': document.getElementById('fem-prev'),
            'fem-next': document.getElementById('fem-next'),
            'med-prev': document.getElementById('med-prev'),
            'med-next': document.getElementById('med-next')
        });
    }
   
    if (prevBtn) {
        console.log(`✓ Prev button found for ${trackId}:`, prevBtn.id || prevBtn.className);
        prevBtn.onclick = () => {
            console.log(`Scrolling ${trackId} backward by ${scrollAmount}px`);
            track.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        };
    } else {
        console.warn(`✗ Prev button not found for ${trackId}`);
    }
    // Update arrow visibility based on scroll position
    const updateArrows = () => {
        const isAtStart = track.scrollLeft <= 10;
        const isAtEnd = track.scrollWidth - track.clientWidth - track.scrollLeft <= 10;
       
        if (prevBtn) {
            prevBtn.style.opacity = isAtStart ? '0.4' : '1';
            prevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
            prevBtn.disabled = isAtStart;
        }
       
        if (nextBtn) {
            nextBtn.style.opacity = isAtEnd ? '0.4' : '1';
            nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
            nextBtn.disabled = isAtEnd;
        }
    };
   
    // Add scroll event listener
    track.addEventListener('scroll', updateArrows);
   
    // Initial update
    setTimeout(updateArrows, 100);
   
    // Also update on window resize
    window.addEventListener('resize', updateArrows);
}
// Toggle wishlist (FIXED VERSION)
function toggleWishlist(product) {
    let wishlist = getWishlist();
    const exists = wishlist.some(item => item.id == product.id);
    if (exists) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.id != product.id);
        showToast('Removed from wishlist', 'error');
    } else {
        // Add to wishlist - ENSURE ALL FIELDS ARE SAVED
        const wishlistItem = {
            id: product.id,
            name: product.name || product.title || 'Product',
            price: product.price ? String(product.price).replace('₹', '').trim() : '0',
            originalPrice: product.originalPrice ? String(product.originalPrice).replace('₹', '').trim() : null,
            image: product.image || product.images?.[0] || 'https://via.placeholder.com/300',
            discount: product.discount || null
        };
       
        wishlist.push(wishlistItem);
        showToast('Added to wishlist!', 'add');
    }
    saveWishlist(wishlist);
    updateWishlistCount();
    updateAllWishlistIcons();
}
// Update wishlist count in header
function updateWishlistCount() {
    const count = getWishlist().length;
   
    document.querySelectorAll('#desktop-wishlist-count, #mobile-wishlist-count, .wishlist-count, [class*="wishlist-count"]').forEach(el => {
        if (el) {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        }
    });
}
// Update all heart icons (red if in wishlist)
function updateAllWishlistIcons() {
    const wishlist = getWishlist();
    const wishlistIds = wishlist.map(item => item.id);
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = parseInt(btn.dataset.productId || btn.getAttribute('data-product-id'));
        const svg = btn.querySelector('svg');
        if (svg) {
            if (wishlistIds.includes(productId)) {
                svg.classList.add('fill-red-500', 'text-red-500');
                svg.setAttribute('fill', 'currentColor');
            } else {
                svg.classList.remove('fill-red-500', 'text-red-500');
                svg.removeAttribute('fill');
            }
        }
    });
}
// Wishlist click handler for myntra cards
function toggleWishlistItem(id) {
    const product = [...productsData, ...medicinesData].find(p => p.id === id);
    if (product) {
        toggleWishlist(product);
        const btn = document.querySelector(`.myntra-wishlist[data-id="${id}"]`);
        if (btn) {
            btn.classList.toggle('active', isInWishlist(id));
        }
    }
}
// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateWishlistCount();
    updateAllWishlistIcons();
    // Re-check after dynamic content loads
    setTimeout(() => {
        updateAllWishlistIcons();
        updateWishlistCount();
    }, 800);
});
// Sync wishlist across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'wishlist') {
        updateWishlistCount();
        updateAllWishlistIcons();
    }
});
// Make functions globally accessible
window.getWishlist = getWishlist;
window.toggleWishlist = toggleWishlist;
window.isInWishlist = isInWishlist;
window.toggleWishlistItem = toggleWishlistItem;
function openProductDetails(id) {
    const all = [...productsData, ...medicinesData];
    const p = all.find(item => item.id === id);
    if (!p) return alert("Product not found");
    const params = new URLSearchParams({
        id: p.id,
        name: p.name || p.title,
        price: p.price,
        originalPrice: p.originalPrice || '',
        discount: p.discount || '',
        image: p.image || p.mainImageUrl,
        description: 'Premium quality healthcare product.'
    });
    window.location.href = `productdetails.html?${params.toString()}`;
}
window.openProductDetails = openProductDetails;
// Sync across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') updateCartCount();
});
// Make functions global if needed elsewhere
window.openProductDetails = openProductDetails;
window.updateCartCount = updateCartCount;
// Smooth scroll
function scrollSection(containerId, amount) {
    const container = document.getElementById(containerId);
    container.scrollBy({ left: amount, behavior: 'smooth' });
}
// NEW: Dynamic data for Articles (can be fetched from backend)
let articlesData = [
    {
        title: "Tips for a Balanced Diet",
        image: "https://i.pinimg.com/736x/9d/22/4a/9d224aeb2f9d4a66d048b5d4d4802cd3.jpg",
        description: "Learn how to maintain a balanced diet with our expert tips on nutrition and meal planning.",
        link: "#"
    },
    {
        title: "Mental Health Matters",
        image: "https://i.pinimg.com/736x/95/50/7b/95507ba220ef508566c715ed9a6e13b1.jpg",
        description: "Explore strategies to support your mental health and reduce stress in daily life.",
        link: "#"
    },
    {
        title: "Benefits of Regular Exercise",
        image: "https://i.pinimg.com/736x/8f/8f/57/8f8f570f1021bff9305fc72ec3be82e5.jpg",
        description: "Discover how regular physical activity can improve your health and well-being.",
        link: "#"
    }
    // Add more articles if needed
];
// NEW: Dynamic data for Footer (can be fetched from backend)
let footerData = {
    company: {
        name: "MediCare Pharmacy",
        description: "Your trusted source for quality medications and health products."
    },
    quickLinks: [
        { text: "Home", link: "#" },
        { text: "Shop", link: "#" },
        { text: "About Us", link: "#" },
        { text: "Contact", link: "#" }
    ],
    contact: {
        email: "support@medicarepharmacy.com",
        phone: "(123) 456-7890",
        social: [
            { icon: "fab fa-facebook-f", link: "#" },
            { icon: "fab fa-twitter", link: "#" },
            { icon: "fab fa-instagram", link: "#" }
        ]
    },
    copyright: "&copy; 2025 MediCare Pharmacy. All rights reserved."
};
// Function to show product details by redirecting to productDetails.html
function showProductDetails(product) {
    // Encode product data to pass as query parameters
    const queryParams = new URLSearchParams({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        originalPrice: product.originalPrice,
        discount: product.discount,
        description: product.description
    }).toString();
    // Redirect to productDetails.html with query parameters
    window.location.href = `productdetails.html?${queryParams}`;
}
// Function to add product to cart
function addToCart(product, button) {
    // Show success feedback
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check mr-2"></i>Added';
    button.classList.add('added');
   
    // Reset button after animation
    setTimeout(() => {
        button.innerHTML = originalText;
        button.classList.remove('added');
    }, 1500);
    // In a real app, you would add to cart logic here
    console.log(`Added to cart: ${product.name}`);
}
// DOM elements
const categoryContainer = document.getElementById('categoryContainer');
const scrollIndicator = document.getElementById('scrollIndicator');
// Function to render categories dynamically
function renderCategories(categories) {
    if (!categoryContainer) return;
  
    categoryContainer.innerHTML = ''; // Clear existing content
   
    categories.forEach((category, index) => {
        const card = document.createElement('div');
        card.className = 'flex-shrink-0 w-40 h-40 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110 hover:shadow-xl bg-white shadow-md overflow-hidden group animate-fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-blue-50">
                <img src="${category.image}" alt="${category.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
            </div>
            <div class="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p class="text-white font-semibold text-center text-sm px-2">${category.name}</p>
            </div>
        `;
       
        // Add click event to redirect to category page
        card.addEventListener('click', (event) => {
            redirectToCategory(category, event);
        });
        // Add active class to clicked category
        card.classList.add('category-item');
        categoryContainer.appendChild(card);
       
        console.log(`Selected category: ${category.name}`);
    });
   
    // Add indicator dots
    addScrollIndicators();
}
// Function to handle category redirection
function redirectToCategory(category, event) {
    const card = event.currentTarget;
    // Optional: Add loading state or animation
    card.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50');
   
    // Optional: Add a small delay for better UX
    setTimeout(() => {
        if(category.url) {
            window.location.href = category.url;
        } else {
            console.warn(`No URL defined for category: ${category.name}`);
        }
    }, 300);
}
// For Single Page Applications (SPA approach)
function navigateToCategory(category) {
    // Update browser history
    history.pushState({}, '', category.url);
   
    // Update page content dynamically
    loadCategoryContent(category);
}
// Function to load category content (for SPAs)
function loadCategoryContent(category) {
    // This would typically make an API call or load content dynamically
    console.log(`Loading content for: ${category.name}`);
   
    // Example: Update page title and content
    document.title = `${category.name} - Health Store`;
   
    // You would update the main content area here
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <h1 class="text-3xl font-bold mb-6">${category.name}</h1>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Category products would be loaded here -->
                    <div class="bg-white p-4 rounded-lg shadow">
                        <p>Products for ${category.name} would appear here</p>
                    </div>
                </div>
            </div>
        `;
    }
}
// Add scroll indicators
function addScrollIndicators() {
    if (!scrollIndicator) return;
   
    scrollIndicator.innerHTML = '';
    const dotsCount = Math.ceil(categoriesData.length / 4);
   
    for (let i = 0; i < dotsCount; i++) {
        const dot = document.createElement('div');
        dot.className = `w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${i === 0 ? 'bg-blue-500' : 'bg-gray-300'}`;
       
        dot.addEventListener('click', () => {
            scrollToSection(i);
        });
       
        scrollIndicator.appendChild(dot);
    }
}
// Scroll to specific section
function scrollToSection(sectionIndex) {
    if (!categoryContainer) return;
   
    const scrollWidth = categoryContainer.scrollWidth;
    const sectionWidth = scrollWidth / Math.ceil(categoriesData.length / 4);
    categoryContainer.scrollTo({
        left: sectionWidth * sectionIndex,
        behavior: 'smooth'
    });
   
    updateActiveIndicator();
}
// Auto-scroll functionality
let autoScrollInterval;
function startAutoScroll() {
    if (!categoryContainer) return;
   
    autoScrollInterval = setInterval(() => {
        const scrollLeft = categoryContainer.scrollLeft;
        const scrollWidth = categoryContainer.scrollWidth - categoryContainer.clientWidth;
       
        if (scrollLeft >= scrollWidth - 10) {
            categoryContainer.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        } else {
            categoryContainer.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        }
    }, 4000);
}
function stopAutoScroll() {
    clearInterval(autoScrollInterval);
}
// Update active indicator based on scroll position
function updateActiveIndicator() {
    if (!categoryContainer || !scrollIndicator) return;
   
    const scrollLeft = categoryContainer.scrollLeft;
    const scrollWidth = categoryContainer.scrollWidth;
    const sectionWidth = scrollWidth / Math.ceil(categoriesData.length / 4);
    const activeSection = Math.floor(scrollLeft / sectionWidth);
   
    document.querySelectorAll('#scrollIndicator > div').forEach((dot, index) => {
        if (index === activeSection) {
            dot.classList.remove('bg-gray-300');
            dot.classList.add('bg-blue-500');
        } else {
            dot.classList.remove('bg-blue-500');
            dot.classList.add('bg-gray-300');
        }
    });
}
// Event listeners for category container
if (categoryContainer) {
    categoryContainer.addEventListener('mouseenter', stopAutoScroll);
    categoryContainer.addEventListener('mouseleave', startAutoScroll);
    categoryContainer.addEventListener('scroll', updateActiveIndicator);
}
// Initialize
renderCategories(categoriesData);
startAutoScroll();
// ===========================================
// FINAL WORKING CODE – NO MORE ERRORS!
// ===========================================
// ALL PRODUCTS DATA (Combined)
const allProducts = [...productsData, ...medicinesData];
// GLOBAL: Render any product grid (used by both sections)
function renderProductGrid(containerId, productsArray) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container #${containerId} not found!`);
        return;
    }
    container.innerHTML = ''; // Clear
    productsArray.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-red rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300';
        card.innerHTML = `
            <div class="relative group">
                <div class="absolute top-2 left-2 bg-red-500 text-white text-xs px-1 py-1 rounded z-10">
                    ${product.discount}
                </div>
                <img src="${product.image}" alt="${product.name}"
                     class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500">
                <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <!-- Quick view button removed for simplicity -->
                </div>
            </div>
            <div class="p-5">
                <h3 class="font-semibold text-md text-center mb-2 line-clamp-2">${product.name}</h3>
                <div class="flex items-center justify-center gap-3 mb-2">
                    <span class="text-xl font-bold text-green-600">${product.price}</span>
                    <span class="text-gray-500 line-through">${product.originalPrice}</span>
                </div>
                <div class="flex gap-3">
                    <button onclick="openProductDetails(${product.id})"
                            class="flex-1 bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 transition font-medium">
                        View Details
                    </button>
                    <button class="add-to-cart-btn bg-teal-600 text-white px-6 py-1 rounded-lg hover:bg-teal-700 transition font-bold"
                            data-product-id="${product.id}"
                            data-product-name="${product.name}"
                            data-product-price="${product.price.replace('₹', '')}"
                            data-product-image="${product.image}">
                        Add
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}
// Setup scroll buttons - FIXED VERSION
function setupScrollButtons() {
    const scrollContainer = document.getElementById('productGrid');
    const scrollLeft = document.getElementById('scrollLeft');
    const scrollRight = document.getElementById('scrollRight');
   
    if (scrollLeft && scrollRight && scrollContainer) {
        scrollLeft.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
        });
       
        scrollRight.addEventListener('click', () => {
            scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
        });
       
        // Show/hide scroll buttons based on scroll position
        const updateScrollButtons = () => {
            const isAtStart = scrollContainer.scrollLeft <= 10;
            const isAtEnd = scrollContainer.scrollLeft >=
                scrollContainer.scrollWidth - scrollContainer.clientWidth - 10;
           
            scrollLeft.style.opacity = isAtStart ? '0.5' : '1';
            scrollLeft.style.pointerEvents = isAtStart ? 'none' : 'auto';
           
            scrollRight.style.opacity = isAtEnd ? '0.5' : '1';
            scrollRight.style.pointerEvents = isAtEnd ? 'none' : 'auto';
        };
       
        scrollContainer.addEventListener('scroll', updateScrollButtons);
        updateScrollButtons();
    }
}
function renderMedicines(medicines) {
    const grid = document.getElementById('medicineGrid');
    if (!grid) return;
  
    grid.innerHTML = ''; // Clear existing content
  
    medicines.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 min-w-[250px] flex flex-col';
      
        card.innerHTML = `
            <div class="relative mb-3">
                <div class="absolute top-2 right-2 z-10">
                    <button class="wishlist-icon bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-contain rounded-md mb-2">
            </div>
            <div class="flex-1 flex flex-col">
                <h3 class="text-sm font-semibold text-gray-800 mb-2">${product.name}</h3>
                <div class="mt-auto">
                    <div class="flex items-center justify-center mb-2">
                        <span class="text-lg font-bold text-gray-900">${product.price}</span>
                        <span class="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                        <span class="text-sm font-semibold text-green-600 ml-2">${product.discount}</span>
                    </div>
                    <button class="view-details-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
                        <i class="fas fa-info-circle mr-2"></i>View Details
                    </button>
                </div>
            </div>
        `;
      
        card.addEventListener('click', (e) => {
            // Prevent opening details if clicking on wishlist button
            if (e.target.closest('.wishlist-icon')) {
                return;
            }
            showProductDetails(product);
        });
      
        grid.appendChild(card);
    });
   
    // Scroll functionality for medicines
    const scrollContainer = document.getElementById('medicineGrid');
    const scrollLeft = document.getElementById('medScrollLeft');
    const scrollRight = document.getElementById('medScrollRight');
   
    if (scrollLeft && scrollRight && scrollContainer) {
        scrollLeft.addEventListener('click', () => {
            scrollContainer.scrollLeft -= 300;
        });
        scrollRight.addEventListener('click', () => {
            scrollContainer.scrollLeft += 300;
        });
    }
}
// NEW: Function to render Doctor Section dynamically
const doctorData = [
    {
        name: "Dr. Rahul Gandhi",
        title: "MBBS, MD - Obstetrics & Gynaecology",
        description: "With over 15 years of experience in Obstetrics & Gynaecology, Dr. Rahul Gandhi specializes in high-risk pregnancies, infertility treatments, and minimally invasive gynecological surgeries. He is known for his compassionate approach and commitment to patient-centered care.",
        image: "https://i.pinimg.com/1200x/5b/43/51/5b4351ad9cbfb15fe0e586f4df121e6.jpg",
        backgroundImage: "https://i.pinimg.com/1200x/61/6c/88/616c8812ef9bfb6f9d2ba5d759543396.jpg",
        achievements: "National Excellence Award, Best Doctor Award",
        association: "Indian Medical Association (IMA)"
    }
];
function renderDoctorSection(doctors) {
    const section = document.getElementById('doctorSection');
    if (!section || doctors.length === 0) return;
    const doctor = doctors[0]; // Render first doctor; extend for multiple if needed
    section.innerHTML = `
        <div class="absolute inset-0">
            <img src="${doctor.backgroundImage}"
                 alt="Background"
                 class="w-full h-[620px] object-cover">
            <div class="absolute inset-0 bg-white/10"></div> <!-- Light overlay -->
        </div>
        <!-- Merged Card -->
        <div class="relative w-full py-8 px-8 lg:px-12">
            <div class="max-w-8xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
                <!-- Doctor Image (Left side) -->
                <div class="h-[550px]">
                    <img src="${doctor.image}"
                         alt="${doctor.name}"
                         class="w-full h-full object-cover">
                </div>
                <!-- About Content (Right side) -->
                <div class="p-8 flex flex-col justify-between">
                    <div>
                        <h1 class="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Meet ${doctor.name}
                        </h1>
                      
                        <h2 class="text-2xl font-semibold text-gray-800 mb-3">
                            ${doctor.title}
                        </h2>
                      
                        <p class="text-[17px] text-gray-800 mb-4 leading-relaxed">
                            ${doctor.description.split('.')[0]} <!-- First sentence for experience -->
                        </p>
                      
                        <p class="text-[17px] text-gray-800 mb-4 leading-relaxed">
                            Recipient of <span class="font-semibold">${doctor.achievements.split(',')[1]}</span> for excellence in infertility management, Dr. Gandhi combines advanced medical expertise with compassion, ensuring safe and personalized care for every patient.
                        </p>
                      
                        <p class="text-[17px] text-gray-700 mb-4 leading-relaxed">
                            An active member of the <span class="font-semibold">${doctor.association}</span>, he regularly updates his knowledge through seminars, workshops, and conferences. Dr. Gandhi's patient-centered approach helps individuals navigate complex pregnancies with confidence and peace of mind.
                        </p>
                    </div>
                    <div class="mt-6 w-20 h-1 bg-pink-500"></div>
                </div>
            </div>
        </div>
    `;
}
// NEW: Function to render Articles Section dynamically
function renderArticlesSection(articles) {
    const section = document.getElementById('articlesSection');
    if (!section) return;
    section.innerHTML = `
        <h2 class="text-2xl font-bold text-center mb-6">Health & Wellness Articles</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${articles.map(article => `
                <div class="article-card bg-white rounded-lg shadow-md overflow-hidden">
                    <img src="${article.image}" alt="${article.title}" class="w-full h-48 object-cover">
                    <div class="p-6">
                        <h3 class="text-xl font-semibold mb-2">${article.title}</h3>
                        <p class="text-gray-600 mb-4">${article.description}</p>
                        <a href="${article.link}" class="text-primary hover:text-secondary font-medium">Read More</a>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}
// NEW: Function to render Footer dynamically
function renderFooter(footer) {
    const section = document.getElementById('footerSection');
    if (!section) return;
    const { company, quickLinks, contact, copyright } = footer;
    section.innerHTML = `
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 class="text-lg font-semibold mb-4">${company.name}</h3>
                    <p class="text-gray-300">${company.description}</p>
                </div>
                <div>
                    <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
                    <ul class="space-y-2">
                        ${quickLinks.map(link => `<li><a href="${link.link}" class="text-gray-300 hover:text-primary">${link.text}</a></li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-semibold mb-4">Contact Us</h3>
                    <p class="text-gray-300">Email: ${contact.email}</p>
                    <p class="text-gray-300">Phone: ${contact.phone}</p>
                    <div class="flex space-x-4 mt-4">
                        ${contact.social.map(social => `<a href="${social.link}" class="text-gray-300 hover:text-primary"><i class="${social.icon}"></i></a>`).join('')}
                    </div>
                </div>
            </div>
            <div class="mt-8 text-center text-gray-400">
                <p>${copyright}</p>
            </div>
        </div>
    `;
}
// Open Upload Prescription modal
document.querySelectorAll('a[href="#upload-prescription"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('uploadModal').classList.remove('hidden');
    });
});
// Close Upload modal when clicking backdrop
const uploadModal = document.getElementById('uploadModal');
if (uploadModal) {
    uploadModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.add('hidden');
        }
    });
}
// NEW: Function to render main background banner dynamically
function renderMainBanner() {
    const bgImage = document.getElementById('mainBackgroundImage');
    if (bgImage) {
        bgImage.src = mainBackgroundBanner;
    }
}
// NEW: Function to render secondary banner dynamically
function renderSecondaryBanner() {
    const secondaryImage = document.getElementById('secondaryBannerImage');
    if (secondaryImage) {
        secondaryImage.src = secondaryBanner;
    }
}
// NEW: Function to render carousel dynamically
function renderCarousel() {
    const carousel = document.getElementById("carousel");
    const dotsContainer = document.getElementById("dotsContainer");
    if (!carousel || !dotsContainer) return;
    // Render slides
    carousel.innerHTML = carouselBanners.map((src, idx) => `
        <img src="${src}" class="carousel-image w-full flex-shrink-0 rounded-xl" alt="Featured Product ${idx + 1}">
    `).join('');
    // Render dots
    dotsContainer.innerHTML = carouselBanners.map(() => `
        <button class="dot w-3 h-3 bg-white rounded-full opacity-50 hover:opacity-100 transition-opacity"></button>
    `).join('');
}
// Carousel functionality (moved to a separate function to call after rendering)
function initializeCarousel() {
    const carousel = document.getElementById("carousel");
    if (!carousel) return;
   
    const slides = carousel.children.length;
    const dots = document.querySelectorAll(".dot");
    let index = 0;
   
    function showSlide(i) {
        index = (i + slides) % slides; // loop around
        carousel.style.transform = `translateX(-${index * 100}%)`;
        // Update dots
        dots.forEach((dot, idx) => {
            dot.classList.toggle("opacity-100", idx === index);
            dot.classList.toggle("opacity-50", idx !== index);
        });
    }
   
    // Buttons
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
   
    if (prevBtn) {
        prevBtn.onclick = () => showSlide(index - 1);
    }
   
    if (nextBtn) {
        nextBtn.onclick = () => showSlide(index + 1);
    }
   
    // Dots click
    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => showSlide(idx));
    });
   
    // Auto play every 4s
    setInterval(() => showSlide(index + 1), 4000);
    // Init
    showSlide(0);
}
// =============== CRITICAL FIX: RENDER PRODUCT SECTIONS ===============
function renderProductSections() {
    console.log('Rendering Feminine Hygiene...');
    renderMyntraSection('feminine-track', productsData);
    console.log('Rendering Medicines & Healthcare...');
    renderMyntraSection('medicine-track', medicinesData);
   
    // Re-apply cart count after products are rendered
    setTimeout(() => {
        if (typeof updateCartCount === 'function') updateCartCount();
        if (typeof restoreQuantitySelectors === 'function') restoreQuantitySelectors();
    }, 800);
}
// ========== FIXED PRESCRIPTION UPLOAD LOGIC ==========
function initializePrescriptionUpload() {
    if (window.prescriptionUploadInitialized) {
        console.warn('⚠️ Prescription upload already initialized. Skipping.');
        return;
    }
    window.prescriptionUploadInitialized = true;
    console.log('🚀 Initializing prescription upload module...');
   
    // Get elements
    const doctorNameInput = document.getElementById('doctorName');
    const fileInput = document.getElementById('prescriptionFileInput');
    const fileNameDisplay = document.getElementById('selectedFileName');
    const fileNameText = document.getElementById('fileNameText');
    const submitBtn = document.getElementById('submitPrescriptionBtn');
    const uploadModal = document.getElementById('uploadModal');
    const uploadFileArea = document.getElementById('uploadFileArea');
    const closeUploadModalBtn = document.getElementById('closeUploadModal');
   
    // Check if elements exist
    if (!doctorNameInput || !fileInput || !submitBtn || !uploadModal) {
        console.warn('Prescription upload elements not found');
        return;
    }
   
    console.log('✅ Found all prescription upload elements');
   
    // Backend API configuration
    const API_BASE_URL = 'http://localhost:8083';
    const CREATE_ORDER_ENDPOINT = `${API_BASE_URL}/api/prescriptions/create-order`;
   
    // Create a separate state object to track form values
    let formState = {
        doctorName: '',
        hasFile: false,
        file: null
    };
    // 1. Enable/disable the submit button - FIXED: Use actual state
    function updateSubmitButton() {
        const hasName = formState.doctorName.trim().length > 0;
        const hasFile = formState.hasFile;
       
        submitBtn.disabled = !(hasName && hasFile);
       
        console.log('📝 Submit button validation:', {
            doctorName: hasName ? '✓' : '✗',
            file: hasFile ? '✓' : '✗',
            buttonEnabled: !submitBtn.disabled ? '✅' : '❌'
        });
    }
    // 2. Update state when doctor name changes - FIXED: Direct state update
    doctorNameInput.addEventListener('input', function(e) {
        formState.doctorName = e.target.value;
        console.log('👨‍⚕️ Doctor name changed:', formState.doctorName);
        updateSubmitButton();
    });
    // 3. Handle file selection - FIXED: Direct state update
    function handleFileSelect() {
        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            formState.hasFile = true;
            formState.file = file;
           
            if (fileNameText && fileNameDisplay) {
                fileNameText.textContent = file.name;
                fileNameDisplay.classList.remove('hidden');
                console.log('📎 File selected:', {
                    name: file.name,
                    size: `${(file.size / 1024).toFixed(2)} KB`,
                    type: file.type,
                    lastModified: new Date(file.lastModified).toLocaleString()
                });
            }
        } else {
            formState.hasFile = false;
            formState.file = null;
            if (fileNameDisplay) {
                fileNameDisplay.classList.add('hidden');
            }
            console.log('📎 No file selected');
        }
        updateSubmitButton();
    }
    fileInput.addEventListener('change', handleFileSelect);
    // 4. Form validation - FIXED: Use actual state
    function validateForm() {
        const errors = [];
       
        console.log('🔍 Validating form - Current values:', formState);
       
        if (!formState.doctorName.trim()) {
            errors.push('Doctor name is required');
            console.log('❌ Doctor name validation failed');
        } else {
            console.log('✅ Doctor name validation passed');
        }
       
        if (!formState.hasFile || !formState.file) {
            errors.push('Prescription image is required');
            console.log('❌ File validation failed');
        } else {
            console.log('✅ File validation passed');
            const file = formState.file;
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            const maxSize = 10 * 1024 * 1024; // 10MB
           
            if (!validTypes.includes(file.type)) {
                errors.push('Please upload only JPG, PNG, or PDF files');
                console.log('❌ File type validation failed:', file.type);
            }
           
            if (file.size > maxSize) {
                errors.push('File size must be less than 10MB');
                console.log('❌ File size validation failed:', file.size);
            }
        }
       
        if (errors.length === 0) {
            console.log('✅ All form validations passed');
        } else {
            console.log(`❌ Form has ${errors.length} validation error(s):`, errors);
        }
       
        return errors;
    }
    // 5. Show loading state
    function showLoading() {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
        console.log('⏳ Showing loading state...');
    }
    // 6. Reset button state
    function resetButtonState() {
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Submit Prescription';
        updateSubmitButton();
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        console.log('🔄 Button state reset');
    }
    // 7. Show success toast
    function showSuccessToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = 'fixed top-20 right-5 z-50 px-8 py-4 rounded-xl text-white font-bold shadow-2xl transition-all bg-green-600 transform translate-x-full';
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        setTimeout(() => toast.remove(), 5000);
        console.log('✅ Success toast:', message);
    }
    // 8. Show error toast
    function showErrorToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.className = 'fixed top-20 right-5 z-50 px-8 py-4 rounded-xl text-white font-bold shadow-2xl transition-all bg-red-600 transform translate-x-full';
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        setTimeout(() => toast.remove(), 5000);
        console.log('❌ Error toast:', message);
    }
    // 9. Show success modal
    function showSuccessModal() {
        const successModal = document.getElementById('successModal');
        const successModalContent = document.getElementById('successModalContent');
       
        if (successModal && successModalContent) {
            successModal.classList.remove('hidden');
            setTimeout(() => {
                successModalContent.classList.remove('scale-95', 'opacity-0');
                successModalContent.classList.add('scale-100', 'opacity-100');
            }, 10);
            console.log('✅ Success modal shown');
        }
    }
    // 10. Reset form to its initial state
    function resetForm() {
        doctorNameInput.value = '';
        fileInput.value = '';
        formState = {
            doctorName: '',
            hasFile: false,
            file: null
        };
       
        if (fileNameDisplay) {
            fileNameDisplay.classList.add('hidden');
        }
       
        resetButtonState();
        console.log('♻️ Form reset to initial state');
    }
   // 11. Form submission handler - FIXED: Correct data format for backend
async function handleSubmit(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
   
    // ADD THIS CHECK
    if (!checkIfUserLoggedIn()) {
        showLoginRequiredMessage();
        console.log('❌ Submission blocked: User not logged in');
        return;
    }
   
    console.log('🚀 ========== STARTING PRESCRIPTION SUBMISSION ==========');
    console.log('📅 Time:', new Date().toLocaleTimeString());
   
    // Validate form with current values
    const errors = validateForm();
    if (errors.length > 0) {
        showErrorToast(errors[0]);
        console.error('❌ Form validation failed:', errors);
        return;
    }
   
    console.log('✅ Step 1: Form validation passed');
   
    // Show loading state
    showLoading();
   
    try {
        const file = formState.file;
        const doctorName = formState.doctorName.trim();
       
        console.log('📦 Step 2: Preparing data for submission');
        console.log(' Doctor Name:', doctorName);
        console.log(' File Name:', file.name);
        console.log(' File Size:', `${(file.size / 1024).toFixed(2)} KB`);
       
        // Get user data from session storage - FIX: Use 'currentUser'
        let userData = null;
        let userId = 1; // Default fallback
        let firstName = 'Patient';
        let lastName = 'Name';
        let email = 'patient@example.com';
        let mobileNumber = '0000000000'; // CHANGED from phone to mobileNumber
        let address = 'Not provided';
       
        try {
            // FIX: Changed from 'userData' to 'currentUser'
            const userDataString = sessionStorage.getItem('currentUser');
            if (userDataString) {
                userData = JSON.parse(userDataString);
                if (userData) {
                    userId = userData.userId || 1;
                    firstName = userData.firstName || 'Patient';
                    lastName = userData.lastName || 'Name';
                    email = userData.email || 'patient@example.com';
                    // CHANGED: Use mobileNumber instead of phone
                    mobileNumber = userData.phone || userData.mobileNumber || '0000000000';
                   
                    // Build address from components
                    if (userData.addressArea && userData.addressCity && userData.addressPincode && userData.addressState) {
                        address = `${userData.addressArea}, ${userData.addressCity}, ${userData.addressPincode}, ${userData.addressState}`;
                        if (userData.addressLandmark) {
                            address += ` (Near ${userData.addressLandmark})`;
                        }
                    }
                   
                    console.log('👤 Using logged-in user data from currentUser:', {
                        userId,
                        firstName,
                        lastName,
                        email,
                        mobileNumber // CHANGED
                    });
                }
            }
        } catch (userDataError) {
            console.log('⚠️ Could not parse user data from currentUser, using defaults:', userDataError);
        }
       
        // Create FormData as expected by backend
        const formData = new FormData();
       
        // Create orderData object with REAL user data from session storage
        const orderData = {
            doctorName: doctorName,
            email: email,
            // CHANGED: Use mobileNumber instead of phone to match backend
            mobileNumber: mobileNumber,
            firstName: firstName, // Use actual first name from user data
            lastName: lastName, // Use actual last name from user data
            userId: userId, // Use actual user ID
            // Optional fields with defaults
            address: address || 'Not provided',
            notes: 'Uploaded via web portal',
            orderStatus: 'PENDING',
            prescriptionType: 'UPLOADED',
            timestamp: new Date().toISOString()
        };
       
        console.log('📄 Order Data (with user info from currentUser):', orderData);
       
        // Append as Blob for JSON
        formData.append('orderData', new Blob([JSON.stringify(orderData)], {
            type: 'application/json'
        }));
       
        // Append file
        formData.append('prescriptionImg', file);
       
        console.log('🌐 Step 3: Sending request to backend');
        console.log(' Endpoint:', CREATE_ORDER_ENDPOINT);
        console.log(' Method: POST');
       
        // Send to backend
        const response = await fetch(CREATE_ORDER_ENDPOINT, {
            method: 'POST',
            body: formData,
        });
       
        console.log('📡 Step 4: Received response');
        console.log(' Status:', response.status);
        console.log(' OK:', response.ok);
       
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
       
        const result = await response.json();
        console.log('🎉 Step 5: Backend response received');
        console.log(' Result:', result);
       
        // Show success message
        if (result.prescriptionId) {
            showSuccessModal();
            console.log(`✅ Prescription created with ID: ${result.prescriptionId}`);
        } else {
            showSuccessToast('Prescription submitted successfully!');
            console.log('✅ Prescription submitted successfully');
        }
       
        // Reset form and close modal
        setTimeout(() => {
            resetForm();
            uploadModal.classList.add('hidden');
            console.log('✅ Modal closed, form reset');
            console.log('🎊 ========== PRESCRIPTION SUBMISSION COMPLETE ==========');
        }, 2000);
       
    } catch (error) {
        console.error('❌ ========== SUBMISSION FAILED ==========');
        console.error('💥 Error details:', error);
       
        let errorMessage = 'Failed to submit prescription. ';
       
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot connect to server. Please check if backend is running on port 8083.';
            console.log('🔌 Network error - Backend might be down');
        } else if (error.message.includes('HTTP 400')) {
            errorMessage += 'Invalid data sent to server.';
            console.log('🔍 Bad request - Check data format');
        } else if (error.message.includes('HTTP 500')) {
            errorMessage += 'Server error. Please try again later.';
            console.log('⚡ Server error - Backend issue');
        } else {
            errorMessage += error.message;
            console.log('❓ Unknown error');
        }
       
        showErrorToast(errorMessage);
        resetButtonState();
    }
}
    // 12. Attach event listeners
    console.log('🔗 Step: Attaching event listeners...');
   
    // Submit button click - FIXED: Use proper event handling
    submitBtn.addEventListener('click', function(e) {
        console.log('🖱️ Submit button clicked');
        handleSubmit(e);
    });
   
    // Make upload area clickable
    if (uploadFileArea) {
        uploadFileArea.addEventListener('click', function(e) {
            console.log('📎 Upload area clicked');
            fileInput.click();
        });
        console.log('✅ File upload area click handler attached');
    }
    // Close modal button
    if (closeUploadModalBtn) {
        closeUploadModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('❌ Close modal button clicked');
            resetForm();
            uploadModal.classList.add('hidden');
        });
        console.log('✅ Modal close button handler attached');
    }
    // 13. Initial state: button disabled
    updateSubmitButton();
   
    console.log('✅ Prescription upload module initialized successfully!');
    console.log('🎯 API Endpoint:', CREATE_ORDER_ENDPOINT);
    console.log('📊 Ready to accept prescriptions');
    console.log('=============================================');
}
// Initialize success modal
function initializeSuccessModal() {
    const successCloseBtn = document.getElementById('successCloseBtn');
    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', function() {
            const successModal = document.getElementById('successModal');
            const successModalContent = document.getElementById('successModalContent');
            if (successModal && successModalContent) {
                successModalContent.classList.remove('scale-100', 'opacity-100');
                successModalContent.classList.add('scale-95', 'opacity-0');
                setTimeout(() => {
                    successModal.classList.add('hidden');
                }, 300);
            }
        });
    }
}
// Fix for upload buttons to open modal - MODIFIED VERSION
function fixUploadModalOpeners() {
    document.querySelectorAll('a[href="#upload-prescription"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
           
            // Check if user is logged in
            const isLoggedIn = checkIfUserLoggedIn();
           
            if (!isLoggedIn) {
                // Redirect to login page or show login modal
                console.log('⚠️ User not logged in. Redirecting to login...');
                showLoginRequiredMessage();
                return;
            }
           
            // User is logged in, open upload modal
            const uploadModal = document.getElementById('uploadModal');
            if (uploadModal) {
                uploadModal.classList.remove('hidden');
                console.log('📋 Upload modal opened via button click');
            }
        });
    });
}
// NEW: Function to check if user is logged in
// NEW: Function to check if user is logged in - FIXED FOR currentUser
function checkIfUserLoggedIn() {
    // Check for the specific structure from your session storage
    try {
        // FIX: Changed from 'userData' to 'currentUser'
        const userDataString = sessionStorage.getItem('currentUser');
       
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            // Check if userData has the expected structure from your example
            if (userData && userData.userId) {
                console.log('✅ User logged in with ID:', userData.userId);
                return true;
            }
        }
       
        console.log('❌ User not logged in - no valid user data found in currentUser');
        return false;
       
    } catch (error) {
        console.log('❌ Error checking login status:', error);
        return false;
    }
}
// NEW: Function to show login required message
function showLoginRequiredMessage() {
    // You can customize this to show a modal, redirect to login page, or show toast
    const toast = document.createElement('div');
    toast.textContent = 'Please login to upload prescription';
    toast.className = 'fixed top-20 right-5 z-50 px-8 py-4 rounded-xl text-white font-bold shadow-2xl transition-all bg-yellow-600 transform translate-x-full';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    setTimeout(() => toast.remove(), 3000);
   
    // Optional: Redirect to login page after a delay
    setTimeout(() => {
        // Change this to your login page URL
        // window.location.href = '/login.html';
        console.log('Redirecting to login page...');
    }, 2000);
}
// FIXED: Add missing functions that were called in initialization
function updateAllWishlistIcons() {
    const wishlist = getWishlist();
    const wishlistIds = wishlist.map(item => item.id);
   
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = parseInt(btn.dataset.productId || btn.getAttribute('data-product-id'));
        const svg = btn.querySelector('svg');
       
        if (svg && wishlistIds.includes(productId)) {
            svg.classList.add('fill-red-500', 'text-red-500');
            svg.setAttribute('fill', 'currentColor');
        } else if (svg) {
            svg.classList.remove('fill-red-500', 'text-red-500');
            svg.removeAttribute('fill');
        }
    });
}


// GLOBAL SEARCH FUNCTIONALITY - Images from backend only, no local placeholders

let globalSearchProducts = [];
const API_BASE = "http://localhost:8083";

async function loadGlobalSearchData(forceRefresh = false) {
    if (!forceRefresh && globalSearchProducts.length > 0) return;

    try {
        globalSearchProducts = []; // Clear old data

        // 1. Fetch Regular Products (paginated)
        let page = 0;
        let hasMore = true;
        while (hasMore) {
            const res = await fetch(`${API_BASE}/api/products/get-all-active-products?page=${page}&size=50`);
            if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);

            const json = await res.json();
            if (!Array.isArray(json) || json.length === 0) break;

            json.forEach(p => {
                globalSearchProducts.push({
                    id: p.productId,
                    name: p.productName || 'Unknown Product',
                    subCategory: (p.productSubCategory || 'Product').trim(),
                    price: Array.isArray(p.productPrice) ? 
                        Number(p.productPrice[0] || 0) : 
                        Number(p.productPrice || p.newPrice || p.price || 0) || 0,                    
                    image: p.productMainImage || '',  // ← empty string = no image → CSS handles it
                    detailUrl: `/productdetails.html?id=${p.productId}`,
                    type: 'regular'
                });
            });

            hasMore = json.length === 50;
            page++;
        }

        // 2. Fetch MB Products
        const mbpRes = await fetch(`${API_BASE}/api/mb/products/get-all`);
        if (!mbpRes.ok) throw new Error(`Failed to fetch MB products: ${mbpRes.status}`);

        const mbpJson = await mbpRes.json();
        if (Array.isArray(mbpJson)) {
            mbpJson.forEach(p => {
                globalSearchProducts.push({
                    id: p.id || p.productId || 'mbp-' + Math.random().toString(36).substr(2, 9),
                    name: p.title || p.productName || 'Unknown MB Product',
                    subCategory: (p.subCategory || p.productSubCategory || 'MB Product').trim(),
                    price: Array.isArray(p.productPrice) ? 
                        Number(p.productPrice[0] || 0) : 
                        Number(p.productPrice || p.newPrice || p.price || 0) || 0,
                    image: p.mainImage || '',  // ← empty string = no image → CSS handles it
                    detailUrl: `/MotherCare/mother-product-details.html?id=${p.id || p.productId}`,
                    type: 'mbp'
                });
            });
        }

        console.log(`Loaded ${globalSearchProducts.length} products`);
        // Optional: Debug products with missing images
        const missingImages = globalSearchProducts.filter(p => !p.image);
        if (missingImages.length > 0) {
            console.log(`${missingImages.length} products have no image URL from backend`);
        }

    } catch (err) {
        console.error("Failed to load global search data:", err);
    }
}


// Optional: Load only products from a specific subcategory (e.g., for Mothercare/Babycare tabs)
async function loadProductsBySubCategory(subCategory) {
    try {
        const res = await fetch(`${API_BASE}/api/products/get-by-sub-category/${encodeURIComponent(subCategory)}`);
        if (!res.ok) throw new Error("Failed to fetch by subcategory");

        const json = await res.json();
        return json.map(p => ({
            id: p.productId,
            name: p.productName || 'Unknown Product',
            subCategory: (p.productSubCategory || 'Product').trim(),
           price: Array.isArray(p.productPrice) ? 
       Number(p.productPrice[0] || 0) : 
       Number(p.productPrice || p.newPrice || p.price || 0) || 0,
            image: p.productMainImage ? `${IMG_BASE}${p.productMainImage}` : null,
            detailUrl: `/productdetails.html?id=${p.productId}`
        }));
    } catch (err) {
        console.error("Failed to load subcategory products", err);
        return [];
    }
}


// HIGHLIGHT MATCHED TEXT (NICE UX)
function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.trim()})`, 'gi');
    return text.replace(regex, '<span class="text-yellow-600 font-bold">$1</span>');
}

// SEARCH UI LOGIC - Improved case-insensitive + trim
function initSearch() {
    const input = document.getElementById('searchInput');
    const suggestions = document.getElementById('searchSuggestions');
    if (!suggestions) return;

    let isMouseOverSuggestions = false;

    input?.addEventListener('input', e => showSuggestions(e.target.value));

    // Keep suggestions open when mouse is over them
    suggestions.addEventListener('mouseenter', () => {
        isMouseOverSuggestions = true;
    });

    suggestions.addEventListener('mouseleave', () => {
        isMouseOverSuggestions = false;
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!suggestions.contains(e.target) && e.target !== input && !isMouseOverSuggestions) {
            suggestions.style.display = 'none';
        }
    });

    async function showSuggestions(query = '') {
        suggestions.style.display = 'block';
        suggestions.innerHTML = '<div class="p-4 text-center text-gray-500">Finding For You...</div>';

        // Load fresh data on every search (prevents missing new products)
        await loadGlobalSearchData(true); // force refresh

        setTimeout(() => {
            const q = query.toLowerCase().trim();
            const results = globalSearchProducts
                .filter(p => {
                    const lowerQ = q.toLowerCase();
                    const subCat = (p.subCategory || '').toLowerCase().trim();
                    return (
                        (p.name || '').toLowerCase().includes(lowerQ) ||
                        subCat.includes(lowerQ) ||
                        // Extra matching for "skin care" variations
                        (lowerQ.includes("skin") && subCat.includes("skin")) ||
                        (lowerQ.includes("baby") && subCat.includes("baby")) ||
                        (lowerQ.includes("mother") && subCat.includes("maternity"))
                    );
                })
                .slice(0, 8);

            if (results.length === 0 && q) {
                suggestions.innerHTML = '<div class="p-4 text-center text-gray-500">No products found</div>';
                return;
            }

            // Create suggestion items with proper click handling
            suggestions.innerHTML = results.map(p => `
                <div class="suggestion-item group flex items-center p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer"
                     data-url="${p.detailUrl}">
                    <img src="${API_BASE}${p.image}" 
                        class="w-12 h-12 object-cover rounded-lg mr-3"
                        alt="${p.name}"
                        onerror="this.src=''; this.alt='Image not available';">
                    <div class="flex-1">
                        <div class="font-medium text-gray-800 group-hover:text-primary">${highlightText(p.name, q)}</div>
                        <div class="text-sm text-gray-500">
                            ${p.subCategory}
                        </div>
                    </div>
                    <i class="fas fa-arrow-right text-primary opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
            `).join('');

            // Add click event listeners to each suggestion item
            const suggestionItems = suggestions.querySelectorAll('.suggestion-item');
            suggestionItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation(); // Prevent event from bubbling up
                    
                    const url = this.getAttribute('data-url');
                    console.log('Redirecting to:', url);
                    
                    // Small delay to ensure UI feedback
                    setTimeout(() => {
                        window.location.href = url;
                    }, 100);
                });
            });

            if (!q && results.length === 0) {
                suggestions.innerHTML = `
                    <div class="p-3 text-xs font-bold text-gray-600 uppercase border-b">Popular Categories</div>
                    <a href="/mothercare.html" class="block px-4 py-3 hover:bg-gray-50">Mother Care</a>
                    <a href="/babycare.html" class="block px-4 py-3 hover:bg-gray-50">Baby Care</a>
                    <a href="/medicine.html" class="block px-4 py-3 hover:bg-gray-50">Medicines</a>
                `;
            }
        }, 300);
    }
}

/// Initialize search
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
    loadGlobalSearchData(); // Initial load
});

function refreshSearchData() {
    loadGlobalSearchData(true); // Force refresh
}



// FIXED: Add proper event listener for the close modal button
document.addEventListener('DOMContentLoaded', function() {
    // Fix for the close modal button error
    const closeModalBtn = document.querySelector('#uploadModal button.absolute.top-3.right-3');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            const uploadModal = document.getElementById('uploadModal');
            if (uploadModal) {
                uploadModal.classList.add('hidden');
            }
        });
    }
   
    // Also fix success modal close button
    const successCloseBtn = document.getElementById('successCloseBtn');
    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', function() {
            const successModal = document.getElementById('successModal');
            const successModalContent = document.getElementById('successModalContent');
            if (successModal && successModalContent) {
                successModalContent.classList.remove('scale-100', 'opacity-100');
                successModalContent.classList.add('scale-95', 'opacity-0');
                setTimeout(() => {
                    successModal.classList.add('hidden');
                }, 300);
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ========== INITIALIZING APPLICATION ==========');
   
    // Fix modal openers FIRST
    fixUploadModalOpeners();
   
    // Initialize success modal
    initializeSuccessModal();
   
    // Initialize prescription upload
    initializePrescriptionUpload();
   
    // Initialize cart count (if function exists)
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
   
    // Restore quantity selectors (if function exists)
    if (typeof restoreQuantitySelectors === 'function') {
        restoreQuantitySelectors();
    }
   
    console.log('🎉 ========== APPLICATION INITIALIZED SUCCESSFULLY! ==========');
});





// FINAL INITIALIZATION - Everything runs after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 ========== INITIALIZING GOODNEEWZ APPLICATION ==========');
    console.log('📅 Date:', new Date().toLocaleString());
    console.log('🌐 Backend configured for port 8083');
   
    // 1. Setup scroll buttons FIRST (before any other operations)
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    const categoryContainer = document.getElementById('categoryContainer');
   
    console.log('🔧 Step 1: Setting up scroll buttons...');
    if (scrollLeftBtn && scrollRightBtn && categoryContainer) {
        scrollLeftBtn.addEventListener('click', () => {
            categoryContainer.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
            console.log('⬅️ Scrolling left');
        });
       
        scrollRightBtn.addEventListener('click', () => {
            categoryContainer.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
            console.log('➡️ Scrolling right');
        });
       
        console.log('✅ Scroll buttons initialized');
    } else {
        console.warn('⚠️ Scroll buttons or category container not found');
    }
   
    // 2. Load content
    console.log('🔧 Step 2: Loading categories...');
    if (typeof renderCategories === 'function' && categoriesData) {
        renderCategories(categoriesData);
        console.log(`✅ Loaded ${categoriesData.length} categories`);
    }
   
    // 3. CRITICAL: Render product sections
    console.log('🔧 Step 3: Rendering product sections...');
    renderProductSections();
    console.log('✅ Product sections rendered');
   
    // 4. Other initializations
    console.log('🔧 Step 4: Initializing other components...');
    if (typeof renderMainBanner === 'function') {
        renderMainBanner();
        console.log('✅ Main banner rendered');
    }
    if (typeof renderCarousel === 'function') {
        renderCarousel();
        console.log('✅ Carousel rendered');
    }
    if (typeof initializeCarousel === 'function') {
        initializeCarousel();
        console.log('✅ Carousel initialized');
    }
    if (typeof renderDoctorSection === 'function') {
        renderDoctorSection(doctorData);
        console.log('✅ Doctor section rendered');
    }
    if (typeof renderArticlesSection === 'function') {
        renderArticlesSection(articlesData);
        console.log('✅ Articles section rendered');
    }
    if (typeof renderFooter === 'function') {
        renderFooter(footerData);
        console.log('✅ Footer rendered');
    }
    if (typeof renderSecondaryBanner === 'function') {
        renderSecondaryBanner();
        console.log('✅ Secondary banner rendered');
    }
   
    // 5. Initialize prescription upload module
    console.log('🔧 Step 5: Initializing prescription upload module...');
    initializePrescriptionUpload();
   
    // 6. Cart system updates
    console.log('🔧 Step 6: Updating cart system...');
    if (typeof updateCartCount === 'function') {
        updateCartCount();
        console.log('✅ Cart count updated');
    }
    if (typeof restoreQuantitySelectors === 'function') {
        restoreQuantitySelectors();
        setTimeout(restoreQuantitySelectors, 600);
        console.log('✅ Quantity selectors restored');
    }
   
    console.log('🎉 ========== GOODNEEWS APPLICATION INITIALIZED SUCCESSFULLY! ==========');
    console.log('📡 Backend API: http://localhost:8083');
    console.log('📊 Prescription upload module: READY');
    console.log('🛒 Cart system: READY');
    console.log('❤️ Wishlist system: READY');
    console.log('=============================================');
});









// // ========== SINGLE SOURCE CART SYSTEM ==========
// // This prevents double item additions
// // Check if cart system is already loaded
// if (window.cartSystemInitialized) {
//     console.warn('⚠️ Cart system already loaded. Skipping duplicate initialization.');
// } else {
//     window.cartSystemInitialized = true;
//     console.log('✅ Initializing cart system...');
//     // Get cart from localStorage
//     function getCart() {
//         try {
//             return JSON.parse(localStorage.getItem('cart') || '[]');
//         } catch (e) {
//             console.warn('Cart corrupted, resetting...');
//             localStorage.removeItem('cart');
//             return [];
//         }
//     }
//     // Save cart
//     function saveCart(cart) {
//         localStorage.setItem('cart', JSON.stringify(cart));
//     }
//     // UPDATE CART COUNT
//     function updateCartCount() {
//         const cart = getCart();
//         const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
//         document.querySelectorAll('#desktop-cart-count, #mobile-cart-count, .cart-count, [id*="cart-count"], [class*="cart-count"]').forEach(el => {
//             if (el) {
//                 el.textContent = totalItems;
//                 el.style.display = totalItems > 0 ? 'flex' : 'none';
//             }
//         });
//     }
//     // Toast
//     function showToast(message, type = 'add') {
//         const toast = document.createElement('div');
//         toast.textContent = message;
//         toast.className = `fixed top-20 right-5 z-50 px-8 py-4 rounded-xl text-white font-bold shadow-2xl transition-all ${
//             type === 'add' ? 'bg-green-600' : 'bg-red-600'
//         } transform translate-x-full`;
//         document.body.appendChild(toast);
//         setTimeout(() => toast.classList.remove('translate-x-full'), 100);
//         setTimeout(() => toast.remove(), 3000);
//     }
//     // Restore quantity selectors
//     function restoreQuantitySelectors() {
//         const cart = getCart();
//         document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
//             const productId = btn.dataset.productId || btn.getAttribute('data-product-id');
//             const item = cart.find(i => i.id == productId);
//             const container = btn.closest('.relative') || btn.parentElement;
//             const selector = container?.querySelector('.quantity-selector');
//             const qtyDisplay = selector?.querySelector('.qty-display');
//             if (selector && qtyDisplay) {
//                 if (item && item.quantity > 0) {
//                     btn.classList.add('hidden');
//                     selector.classList.remove('hidden');
//                     qtyDisplay.textContent = item.quantity;
//                 } else {
//                     btn.classList.remove('hidden');
//                     selector.classList.add('hidden');
//                 }
//             }
//         });
//     }
//     // SINGLE EVENT DELEGATION with click prevention
//     let isProcessingClick = false;
//     const MAX_QTY = 10;
//     // Main click handler - ONLY THIS ONE SHOULD EXIST
//     document.addEventListener('click', function handleGlobalClick(e) {
//         // Prevent rapid multiple clicks
//         if (isProcessingClick) {
//             console.log('⏸️ Click already being processed, ignoring...');
//             return;
//         }
//         // ADD TO CART
//         const addBtn = e.target.closest('.add-to-cart-btn');
//         if (addBtn) {
//             e.preventDefault();
//             e.stopPropagation();
//             e.stopImmediatePropagation(); // Prevent other listeners
           
//             // Set processing flag
//             isProcessingClick = true;
           
//             const product = {
//                 id: addBtn.dataset.productId || addBtn.getAttribute('data-product-id'),
//                 name: addBtn.dataset.productName || addBtn.getAttribute('data-product-name'),
//                 price: parseFloat(addBtn.dataset.productPrice || addBtn.getAttribute('data-product-price')),
//                 image: addBtn.dataset.productImage || addBtn.getAttribute('data-product-image')
//             };
//             console.log(`🛒 Adding to cart: ${product.name} (ID: ${product.id})`);
//             let cart = getCart();
//             let existing = cart.find(item => item.id == product.id);
//             if (existing) {
//                 if (existing.quantity >= MAX_QTY) {
//                     showToast(`Max ${MAX_QTY} items allowed!`, 'error');
//                     isProcessingClick = false;
//                     return;
//                 }
//                 existing.quantity += 1;
//             } else {
//                 cart.push({ ...product, quantity: 1 });
//             }
//             saveCart(cart);
//             restoreQuantitySelectors();
//             updateCartCount();
//             showToast('Added to cart!', 'add');
           
//             // Reset processing flag after delay
//             setTimeout(() => {
//                 isProcessingClick = false;
//             }, 300);
           
//             return;
//         }
//         // INCREASE (+)
//         const increaseBtn = e.target.closest('.increase-qty');
//         if (increaseBtn) {
//             e.stopPropagation();
//             e.stopImmediatePropagation();
//             isProcessingClick = true;
//             const selector = increaseBtn.closest('.quantity-selector');
//             const qtyDisplay = selector.querySelector('.qty-display');
//             const addBtn = selector.closest('.relative')?.querySelector('.add-to-cart-btn') ||
//                            selector.parentElement.querySelector('.add-to-cart-btn');
//             const productId = addBtn.dataset.productId || addBtn.getAttribute('data-product-id');
//             let cart = getCart();
//             const item = cart.find(i => i.id == productId);
//             if (!item || item.quantity >= MAX_QTY) {
//                 showToast(`Max ${MAX_QTY} allowed!`, 'error');
//                 isProcessingClick = false;
//                 return;
//             }
//             item.quantity += 1;
//             qtyDisplay.textContent = item.quantity;
//             saveCart(cart);
//             updateCartCount();
           
//             setTimeout(() => { isProcessingClick = false; }, 300);
//             return;
//         }
//         // DECREASE (-)
//         const decreaseBtn = e.target.closest('.decrease-qty');
//         if (decreaseBtn) {
//             e.stopPropagation();
//             e.stopImmediatePropagation();
//             isProcessingClick = true;
//             const selector = decreaseBtn.closest('.quantity-selector');
//             const qtyDisplay = selector.querySelector('.qty-display');
//             const addBtn = selector.closest('.relative')?.querySelector('.add-to-cart-btn') ||
//                            selector.parentElement.querySelector('.add-to-cart-btn');
//             const productId = addBtn.dataset.productId || addBtn.getAttribute('data-product-id');
//             let cart = getCart();
//             const item = cart.find(i => i.id == productId);
//             if (!item) {
//                 isProcessingClick = false;
//                 return;
//             }
//             item.quantity -= 1;
//             if (item.quantity <= 0) {
//                 cart = cart.filter(i => i.id != productId);
//                 saveCart(cart);
//                 selector.classList.add('hidden');
//                 addBtn.classList.remove('hidden');
//                 showToast('Removed from cart', 'error');
//             } else {
//                 qtyDisplay.textContent = item.quantity;
//                 saveCart(cart);
//             }
//             restoreQuantitySelectors();
//             updateCartCount();
           
//             setTimeout(() => { isProcessingClick = false; }, 300);
//             return;
//         }
//     }, true); // Use capture phase to ensure this runs first
//     // Initialize cart system
//     function initializeCart() {
//         console.log('🛒 Setting up cart listeners...');
       
//         // Initialize UI
//         updateCartCount();
//         restoreQuantitySelectors();
       
//         // Re-check after dynamic content
//         setTimeout(() => {
//             restoreQuantitySelectors();
//             updateCartCount();
//         }, 1000);
       
//         console.log('✅ Cart system ready');
//     }
//     // Initialize when DOM is ready
//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', initializeCart);
//     } else {
//         initializeCart();
//     }
//     // Sync across tabs
//     window.addEventListener('storage', (e) => {
//         if (e.key === 'cart') {
//             updateCartCount();
//             restoreQuantitySelectors();
//         }
//     });
// }
// // ========== WISHLIST FUNCTIONS (keep these) ==========
// // FORCE WISHLIST COUNT TO SHOW ON EVERY PAGE LOAD
// function forceUpdateWishlistCount() {
//     const count = getWishlist().length;
//     // Update desktop badge
//     const desktopBadge = document.getElementById('desktop-wishlist-count');
//     if (desktopBadge) {
//         desktopBadge.textContent = count;
//         desktopBadge.style.display = count > 0 ? 'flex' : 'none';
//     }
//     // Update mobile badge
//     const mobileBadge = document.getElementById('mobile-wishlist-count');
//     if (mobileBadge) {
//         mobileBadge.textContent = count;
//         mobileBadge.style.display = count > 0 ? 'flex' : 'none';
//     }
// }
// // WISHLIST HELPERS
// function getWishlist() {
//     try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); }
//     catch { localStorage.removeItem('wishlist'); return []; }
// }
// function saveWishlist(wishlist) {
//     try {
//         localStorage.setItem('wishlist', JSON.stringify(wishlist));
//         console.log('Wishlist saved:', wishlist);
//     } catch (e) {
//         console.error('Wishlist save error:', e);
//     }
// }
// function isInWishlist(id) {
//     return getWishlist().some(item => item.id === id);
// }
// // Run wishlist updates
// forceUpdateWishlistCount();
// document.addEventListener('DOMContentLoaded', forceUpdateWishlistCount);
// setTimeout(forceUpdateWishlistCount, 300);
// setTimeout(forceUpdateWishlistCount, 1000);
// // Make functions globally accessible
// window.getWishlist = getWishlist;
// window.isInWishlist = isInWishlist;
// window.updateCartCount = updateCartCount;
// // Comprehensive pharmacy categories and products
// const pharmacyCategories = {
//     'Medicines & Healthcare': {
//         icon: '💊',
//         subcategories: [
//             'Prescription Medicines (Upload Prescription)',
//             'Over-the-Counter (OTC) Medicines',
//             'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)',
//             'First Aid & Emergency (Bandages, Antiseptics, Ointments, Thermometers)',
//             'Pain Relief & Fever',
//             'Allergy & Cold Care',
//             'Digestive Health (Antacids, Probiotics, Laxatives)'
//         ]
//     },
//     'Mother Care & Maternity': {
//         icon: '🤱',
//         subcategories: [
//             'Maternity Wear (Dresses, Nursing Wear, Innerwear)',
//             'Pregnancy Nutrition (Prenatal Vitamins, Supplements)',
//             'Skincare for Moms (Stretch Mark Cream, Sunscreen, Moisturizers)',
//             'Trimester Kits (1st, 2nd, 3rd Trimester Essentials)',
//             'Postpartum Recovery (Belly Belts, Nursing Pads, Sitz Baths)',
//             'Breastfeeding Essentials (Pumps, Bottles, Nipple Creams)'
//         ]
//     },
//     'Baby Care': {
//         icon: '👶',
//         subcategories: [
//             'Diapers & Wipes',
//             'Baby Skin & Hair Care',
//             'Feeding & Nursing',
//             'Baby Health & Safety',
//             'Toys & Learning',
//             'Baby Clothing & Accessories'
//         ]
//     },
//     'Wellness & Personal Care': {
//         icon: '💆',
//         subcategories: [
//             'Vitamins & Supplements',
//             'Skin & Hair Care',
//             'Oral Care',
//             'Menstrual & Intimate Care',
//             'Fitness & Weight Management'
//         ]
//     },
//     'Medical Devices & Equipment': {
//         icon: '🩺',
//         subcategories: [
//             'Monitoring Devices (BP Monitors, Glucometers, Pulse Oximeters)',
//             'Mobility Aids (Walkers, Wheelchairs, Sticks)',
//             'Respiratory Care (Nebulizers, Oxygen Supplies)'
//         ]
//     },
//     'Speciality Care': {
//         icon: '🏥',
//         subcategories: [
//             "Women's Health",
//             "Men's Health",
//             'Senior Care',
//             'Immunity Boosters',
//             'Ayurveda & Herbal Products'
//         ]
//     }
// };
// // Create comprehensive search terms including variations and keywords
// const searchTerms = [];
// // Add main categories
// Object.keys(pharmacyCategories).forEach(category => {
//     searchTerms.push({
//         term: category,
//         type: 'main_category',
//         icon: pharmacyCategories[category].icon,
//         category: category
//     });
  
//     // Add subcategories
//     pharmacyCategories[category].subcategories.forEach(sub => {
//         searchTerms.push({
//             term: sub,
//             type: 'subcategory',
//             icon: '🔸',
//             category: category,
//             parent: pharmacyCategories[category].icon
//         });
//     });
// });
// // Add additional searchable keywords for better matching
// const additionalKeywords = [
//     // Medicines keywords
//     { term: 'medicines', matches: 'Medicines & Healthcare', icon: '💊' },
//     { term: 'prescription', matches: 'Prescription Medicines (Upload Prescription)', icon: '📋' },
//     { term: 'otc', matches: 'Over-the-Counter (OTC) Medicines', icon: '💊' },
//     { term: 'diabetes', matches: 'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)', icon: '🩺' },
//     { term: 'blood pressure', matches: 'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)', icon: '🩺' },
//     { term: 'hypertension', matches: 'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)', icon: '🩺' },
//     { term: 'asthma', matches: 'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)', icon: '🩺' },
//     { term: 'thyroid', matches: 'Chronic Care (Diabetes, Hypertension, Cardiac, Asthma, Thyroid)', icon: '🩺' },
//     { term: 'bandages', matches: 'First Aid & Emergency (Bandages, Antiseptics, Ointments, Thermometers)', icon: '🩹' },
//     { term: 'first aid', matches: 'First Aid & Emergency (Bandages, Antiseptics, Ointments, Thermometers)', icon: '🚑' },
//     { term: 'pain relief', matches: 'Pain Relief & Fever', icon: '💊' },
//     { term: 'fever', matches: 'Pain Relief & Fever', icon: '🌡️' },
//     { term: 'allergy', matches: 'Allergy & Cold Care', icon: '🤧' },
//     { term: 'cold', matches: 'Allergy & Cold Care', icon: '🤧' },
  
//     // Mother Care keywords
//     { term: 'maternity', matches: 'Maternity Wear (Dresses, Nursing Wear, Innerwear)', icon: '👗' },
//     { term: 'pregnancy', matches: 'Pregnancy Nutrition (Prenatal Vitamins, Supplements)', icon: '🤰' },
//     { term: 'prenatal', matches: 'Pregnancy Nutrition (Prenatal Vitamins, Supplements)', icon: '🤰' },
//     { term: 'breastfeeding', matches: 'Breastfeeding Essentials (Pumps, Bottles, Nipple Creams)', icon: '🍼' },
  
//     // Baby Care keywords
//     { term: 'diapers', matches: 'Diapers & Wipes', icon: '👶' },
//     { term: 'baby', matches: 'Baby Care', icon: '👶' },
//     { term: 'toys', matches: 'Toys & Learning', icon: '🧸' },
  
//     // Wellness keywords
//     { term: 'vitamins', matches: 'Vitamins & Supplements', icon: '💊' },
//     { term: 'supplements', matches: 'Vitamins & Supplements', icon: '💊' },
//     { term: 'skincare', matches: 'Skin & Hair Care', icon: '🧴' },
//     { term: 'oral care', matches: 'Oral Care', icon: '🦷' },
//     { term: 'fitness', matches: 'Fitness & Weight Management', icon: '💪' },
  
//     // Medical Devices keywords
//     { term: 'bp monitor', matches: 'Monitoring Devices (BP Monitors, Glucometers, Pulse Oximeters)', icon: '🩺' },
//     { term: 'glucometer', matches: 'Monitoring Devices (BP Monitors, Glucometers, Pulse Oximeters)', icon: '🩺' },
//     { term: 'wheelchair', matches: 'Mobility Aids (Walkers, Wheelchairs, Sticks)', icon: '♿' },
//     { term: 'nebulizer', matches: 'Respiratory Care (Nebulizers, Oxygen Supplies)', icon: '🫁' },
  
//     // Specialty Care keywords
//     { term: 'women health', matches: "Women's Health", icon: '♀️' },
//     { term: 'men health', matches: "Men's Health", icon: '♂️' },
//     { term: 'ayurveda', matches: 'Ayurveda & Herbal Products', icon: '🌿' },
//     { term: 'herbal', matches: 'Ayurveda & Herbal Products', icon: '🌿' },
//     { term: 'immunity', matches: 'Immunity Boosters', icon: '🛡️' }
// ];
// function openProductDetails(id) {
//     const all = [...productsData, ...medicinesData];
//     const p = all.find(item => item.id === id);
//     if (!p) return alert("Product not found");
//     // Parse price and original price
//     const price = parseFloat(p.price.replace('₹', '').replace(',', ''));
//     const originalPrice = p.originalPrice ? parseFloat(p.originalPrice.replace('₹', '').replace(',', '')) : 0;
   
//     // Calculate discount percentage
//     let discountPercentage = 0;
//     if (originalPrice > 0 && price < originalPrice) {
//         discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
//     }
//     // Generate a random quantity (5-20) for demo purposes
//     const randomQuantity = Math.floor(Math.random() * 16) + 5;
   
//     const params = new URLSearchParams({
//         id: p.id,
//         name: encodeURIComponent(p.name || p.title),
//         price: price.toString(),
//         originalPrice: originalPrice.toString(),
//         discount: discountPercentage.toString(),
//         image: encodeURIComponent(p.image || p.mainImageUrl),
//         description: encodeURIComponent(p.description || 'Premium quality healthcare product.'),
//         category: p.category || 'all',
//         quantity: randomQuantity.toString(),
//         unit: 'pack',
//         sku: `SKU-${p.id}`,
//         brand: encodeURIComponent(p.brand || 'Generic Brand'),
//         rating: '4.5',
//         mrp: originalPrice.toString() // Add MRP for display
//     });
   
//     window.location.href = `productdetails.html?${params.toString()}`;
// }
// const searchInput = document.getElementById('searchInput');
// const suggestions = document.getElementById('searchSuggestions');
// function createSuggestionItem(item, isMainCategory = false, icon = '🔍', parentIcon = '') {
//     const div = document.createElement('div');
//     div.className = 'suggestion-item flex items-center p-3 cursor-pointer rounded-lg transition-colors bg-white-50 duration-150 hover:bg-blue-50';
  
//     let displayIcon = icon;
//     let textColor = 'text-gray-800';
//     let displayText = item.term || item;
  
//     if (isMainCategory) {
//         textColor = 'text-blue-700 font-semibold';
//         displayIcon = item.icon || icon;
//         displayText = item.term || item;
//     } else if (item.type === 'subcategory') {
//         textColor = 'text-gray-700';
//         displayIcon = item.parent + ' ' + item.icon;
//         displayText = item.term;
//     } else if (item.type === 'keyword') {
//         textColor = 'text-green-600';
//         displayIcon = item.icon;
//         displayText = item.term;
//     }
  
//     div.innerHTML = `
//         <span class="mr-3 text-lg">${displayIcon}</span>
//         <span class="flex-1 ${textColor}">${displayText}</span>
//         <span class="text-sm text-gray-400">→</span>
//     `;
  
//     div.addEventListener('click', () => {
//         const searchValue = displayText;
//         searchInput.value = searchValue;
//         suggestions.classList.add('hidden');
//         performSearch(searchValue);
//     });
  
//     return div;
// }
// // Show suggestions when clicking/focusing the input
// function showSuggestions() {
//     suggestions.classList.remove('hidden');
// }
// // Hide suggestions when clicking outside
// function hideSuggestions(e) {
//     // If the click is NOT inside the search input OR the suggestions box → hide it
//     if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
//         suggestions.classList.add('hidden');
//     }
// }
// function performSearch(query) {
//     console.log('Searching for:', query);
//     // Here you would typically make an API call or redirect to search results
//     alert(`Searching for: ${query}`);
// }
// // Event listeners for search
// if (searchInput && suggestions) {
//     searchInput.addEventListener('focus', () => showSuggestions(searchInput.value));
//     searchInput.addEventListener('input', (e) => {
//         const query = e.target.value;
//         if (query.length > 0) {
//             showSuggestions(query);
//         } else {
//             showSuggestions();
//         }
//     });
//     // Show suggestions when input is focused
//     searchInput.addEventListener('focus', () => {
//         suggestions.classList.remove('hidden');
//     });
   
//     searchInput.addEventListener('blur', (e) => {
//         // Delay hiding suggestions to allow clicks
//         setTimeout(() => {
//             suggestions.classList.add('hidden');
//         }, 150);
//     });
//     searchInput.addEventListener('focus', showSuggestions);
//     searchInput.addEventListener('click', showSuggestions);
//     // Hide when clicking anywhere else on the page
//     document.addEventListener('click', hideSuggestions);
//     // Optional: Also hide on Escape key
//     searchInput.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape') {
//             suggestions.classList.add('hidden');
//             searchInput.blur();
//         }
//     });
//     // Optional: Keep open if user clicks inside suggestions (prevents closing when selecting)
//     suggestions.addEventListener('click', (e) => {
//         e.stopPropagation(); // This stops the click from bubbling up to document
//     });
   
//     // Search button functionality
//     const searchButton = document.querySelector('button[class*="bg-blue-600"]');
//     if (searchButton) {
//         searchButton.addEventListener('click', () => {
//             performSearch(searchInput.value);
//         });
//     }
   
//     // Enter key search
//     searchInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter') {
//             performSearch(searchInput.value);
//         }
//     });
   
//     // Optional: Hide on Escape key
//     searchInput.addEventListener('keydown', (e) => {
//         if (e.key === 'Escape') {
//             suggestions.classList.add('hidden');
//             searchInput.blur();
//         }
//     });
// }
// // Category button functionality
// document.querySelectorAll('.category-btn').forEach(btn => {
//     btn.addEventListener('click', () => {
//         const categoryMap = {
//             'Medicines': 'Medicines & Healthcare',
//             'Mother Care': 'Mother Care & Maternity',
//             'Baby Care': 'Baby Care',
//             'Wellness': 'Wellness & Personal Care',
//             'Medical Devices': 'Medical Devices & Equipment'
//         };
      
//         const buttonText = btn.textContent.trim();
//         const categoryKey = Object.keys(categoryMap).find(key => buttonText.includes(key));
//         const fullCategory = categoryMap[categoryKey] || buttonText;
      
//         searchInput.value = fullCategory;
//         performSearch(fullCategory);
//     });
// });
// // Click outside to close suggestions
// document.addEventListener('click', (e) => {
//     if (suggestions && searchInput && !searchInput.contains(e.target) && !suggestions.contains(e.target)) {
//         suggestions.classList.add('hidden');
//     }
// });
// // Dynamic data for banners (can be fetched from backend)
// const mainBackgroundBanner = "Images/IMG/pharmacyBanner11.jpg";
// const carouselBanners = [
//     "Images/IMG/pharmacyBanner2.jpg",
//     "Images/IMG/farmasi banner 5th.jpg",
//     "Images/IMG/farmasi banner 3rd.jpg",
//     "Images/IMG/farmasi banner 4th.jpg"
// ];
// const secondaryBanner = "Images/IMG/farmasi banner 8th.jpg";
// // Sample data for 6 categories (can be fetched from backend)
// let categoriesData = [
//     { name: "Mother Care", image: "Images/category/allergy and cold care.png", url: "./MotherCare/mother.html"},
//     { name: "Baby Care", image: "Images/category/Ayurveda.png", url: "./BabyCare/baby.html" },
//     { name: "LifeStyle Disorder", image: "Images/category/CHRONIC 1.png", url: "./Medical and HealthCare/LifeStyle/lifestyle.html"},
//     { name: "Fertility Essentials", image: "Images/category/Digestive Health.png", url: "./Medical and HealthCare/Fertility/firtility.html" },
//     { name: "Surgical", image: "Images/category/FIRST AID & EMERGENCY.png", url: "./Surgical/Surgical.html?sub=dressings-and-bandages" },
//     { name: "Vitamins and Supplements", image: "Images/category/vitamins.png", url: "./Wellness/wellness.html?sub=vitamins-supplements"},
//     { name: "Respiratory Devices", image: "Images/category/immunity Boosters.png", url: "./DEVICES/RESPIRATORY CARE/respiratory.html"},
  
//     { name: "Mobility Aids", image: "Images/category/mobility aids (1).png", url: "./DEVICES/MOBILITY AIDS/mobility.html" },
//     { name: "Monitoring Devices", image: "Images/category/monitoring devices.png", url: "./DEVICES/MONITORING DEVICES/monitor.html" },
//     { name: "Oral Care", image: "Images/category/Oral care.png", url: "./Wellness/wellness.html?sub=oral-care" },
//     { name: "OTC", image: "Images/category/OTC.png", url: "./Medical and HealthCare/OTC/otc.html" },
  
//     { name: "Prescription Based", image: "Images/category/Prescription based.png", url: "./Medical and HealthCare/Prescription/prescription.html" },
//     { name: "Senior Care", image: "Images/category/Senior Care.png", url: "./Wellness/wellness.html?sub=senior-care" },
//     { name: "Skin & Hair", image: "Images/category/skin & hair care.png", url: "./Wellness/wellness.html?sub=hair-skin-care" },
//     { name: "Menstrual Care", image: "Images/category", url: "./Wellness/wellness.html?sub=menstrual-care" },
// ];
// const productsData = [
//     { id: 40, name: "Whisper Ultra Clean Wings", image: "https://i.pinimg.com/736x/15/b9/8d/15b98d803f2e10178711489c46061497.jpg", price: "₹279", originalPrice: "₹329", discount: "15% off" },
//     { id: 41, name: "Sofy Anti-Bacteria Extra Long", image: "https://i.pinimg.com/736x/98/8e/a0/988ea0dfd9d5d8fe68a741f6fa010c20.jpg", price: "₹259", originalPrice: "₹310", discount: "16% off" },
//     { id: 42, name: "Bella Regular Soft Pads", image: "https://i.pinimg.com/1200x/9e/9a/ff/9e9aff588641655ee47d3f1430291a1f.jpg", price: "₹189", originalPrice: "₹239", discount: "21% off" },
//     { id: 43, name: "Tampax Pearl Regular Tampons", image: "https://i.pinimg.com/1200x/05/5a/31/055a316a51a66f464c778ab07c8f7c99.jpg", price: "₹399", originalPrice: "₹459", discount: "13% off" },
//     { id: 44, name: "Carefree Panty Liners", image: "https://i.pinimg.com/1200x/9a/ae/62/9aae62e4e98e6bc15554dc9fd3e5c713.jpg", price: "₹149", originalPrice: "₹179", discount: "17% off" },
//     { id: 45, name: "Sirona Reusable Menstrual Cup", image: "https://i.pinimg.com/736x/68/04/70/6804705cf54829aa6171565b16ecae00.jpg", price: "₹499", originalPrice: "₹599", discount: "17% off" },
//     { id: 46, name: "Nua Cramp Comfort Heat Patches", image: "https://i.pinimg.com/736x/5a/f4/0a/5af40a443e4c0c0fe65384cdf70a5508.jpg", price: "₹299", originalPrice: "₹349", discount: "14% off" },
//     { id: 47, name: "VWash Plus Intimate Wash", image: "https://i.pinimg.com/1200x/2a/30/1f/2a301fa528e6ae13eb929c3d46ba5227.jpg", price: "₹229", originalPrice: "₹269", discount: "15% off" }
// ];
// const medicinesData = [
//     { id: 48, name: "Paracetamol 500mg", image: "https://i.pinimg.com/1200x/df/3b/b2/df3bb27c00bb0f4b54692f9000a56b1f.jpg", price: "₹49", originalPrice: "₹59", discount: "17% off" },
//     { id: 49, name: "Ibuprofen Tablets", image: "https://i.pinimg.com/1200x/42/a4/9d/42a49d09e810f203fd7c82999efe1c51.jpg", price: "₹89", originalPrice: "₹99", discount: "10% off" },
//     { id: 50, name: "Digital Thermometer", image: "https://i.pinimg.com/736x/3f/80/34/3f803459fbfc629161ae550bee4c4b75.jpg", price: "₹199", originalPrice: "₹249", discount: "20% off" },
//     { id: 51, name: "Blood Pressure Monitor", image: "https://i.pinimg.com/736x/86/85/b8/8685b8bc870fd478367baee1e5065fe5.jpg", price: "₹1299", originalPrice: "₹1499", discount: "13% off" },
//     { id: 52, name: "Vitamin C Supplements", image: "https://i.pinimg.com/736x/6e/8f/a8/6e8fa8670eacd8fdd912a4f040c47875.jpg", price: "₹299", originalPrice: "₹349", discount: "14% off" },
//     { id: 53, name: "Diabetes Test Strips", image: "https://i.pinimg.com/736x/f3/fd/72/f3fd721aeac334de1a8fd9ca53a43f19.jpg", price: "₹499", originalPrice: "₹599", discount: "17% off" },
//     { id: 54, name: "First Aid Kit", image: "https://i.pinimg.com/1200x/94/6a/25/946a25a8467b2cfc3bbee39bb13c2751.jpg", price: "₹349", originalPrice: "₹399", discount: "13% off" },
//     { id: 55, name: "Asthma Inhaler", image: "https://i.pinimg.com/1200x/d3/0f/4c/d30f4c670beb8884b309c0068c11afcf.jpg", price: "₹189", originalPrice: "₹219", discount: "14% off" }
// ];
// // ==================== UPDATED createCard() FUNCTION ====================
// function createMyntraCard(p) {
//     const inWish = isInWishlist(p.id);
//     const cleanPrice = p.price.replace('₹', '').trim();
//     return `
//         <div class="myntra-card group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer w-full">
//             <!-- Discount Badge -->
//             ${p.discount ? `
//                 <div class="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded z-10 shadow-sm">
//                     ${p.discount}
//                 </div>
//             ` : ''}
           
//             <!-- Wishlist Heart -->
//             <div class="myntra-wishlist absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm z-10 transition-all duration-200 ${inWish ? 'active text-red-500' : 'text-gray-400 hover:text-red-500'}"
//                  data-id="${p.id}"
//                  onclick="toggleWishlistItem(${p.id})">
//                 <i class="${inWish ? 'fas' : 'far'} fa-heart text-sm"></i>
//             </div>
           
//             <!-- Product Image Container -->
//             <div class="relative h-48 overflow-hidden bg-gray-100">
//                 <img src="${p.image || p.mainImageUrl}"
//                      alt="${p.name || p.title}"
//                      loading="lazy"
//                      class="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105">
               
//                 <!-- "NEW" Badge if applicable -->
//                 ${p.tag === 'new' ? `
//                     <div class="absolute top-3 right-12 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded">
//                         NEW
//                     </div>
//                 ` : ''}
//             </div>
           
//             <!-- Product Info -->
//             <div class="p-4">
//                 <!-- Product Name - Smaller and compact -->
//                 <h3 class="myntra-product-name text-gray-800 font-normal text-sm mb-2 line-clamp-2 h-8 leading-tight overflow-hidden">
//                     ${p.name || p.title}
//                 </h3>
               
//                 <!-- Brand/Type if available -->
//                 ${p.brand ? `
//                     <div class="text-xs text-gray-500 mb-1 font-medium">
//                         ${p.brand}
//                     </div>
//                 ` : ''}
               
//                 ${p.type ? `
//                     <div class="text-xs text-gray-400 mb-2">
//                         ${p.type}
//                     </div>
//                 ` : ''}
               
//                 <!-- Price Row - More compact -->
//                 <div class="myntra-price-row flex items-center gap-2 mb-3">
//                     <span class="myntra-current-price text-lg font-bold text-green-600">
//                         ${p.price}
//                     </span>
//                     ${p.originalPrice ? `
//                         <span class="myntra-original-price text-gray-500 line-through text-sm">
//                             ${p.originalPrice}
//                         </span>
//                     ` : ''}
//                     <span class="myntra-current-price text-sm font-bold text-red-600">
//                         ${p.discount}
//                     </span>
//                 </div>
               
//                 <!-- Rating/Reviews if available -->
//                 ${p.rating ? `
//                     <div class="flex items-center gap-1 mb-3">
//                         <div class="flex text-yellow-400 text-xs">
//                             ${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}
//                         </div>
//                         <span class="text-xs text-gray-500">(${p.reviews || 0})</span>
//                     </div>
//                 ` : ''}
               
//                 <!-- Add to Cart Button - More compact -->
//                 <button class="add-to-cart-btn w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-md transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center"
//                         data-product-id="${p.id}"
//                         data-product-name="${p.name || p.title}"
//                         data-product-price="${cleanPrice}"
//                         data-product-image="${p.image || p.mainImageUrl}">
//                     <i class="fas fa-shopping-bag mr-2 text-xs"></i>ADD TO CART
//                 </button>
               
//                 <!-- Quick View Button - Smaller and less prominent -->
//                 <button onclick="openProductDetails(${p.id})"
//                         class="w-full mt-2 text-gray-600 hover:text-blue-600 font-medium text-xs py-2 rounded-md transition-colors duration-200">
//                     Quick View
//                 </button>
//             </div>
//         </div>
//     `;
// }
// function renderMyntraSection(trackId, data) {
//     const track = document.getElementById(trackId);
//     if (!track) {
//         console.error(`Element #${trackId} not found!`);
//         return;
//     }
//     // Clear existing content
//     track.innerHTML = '';
   
//     // Add cards directly without extra wrapper divs
//     data.forEach(product => {
//         const cardHtml = createMyntraCard(product);
//         track.innerHTML += cardHtml;
//     });
//     // Get arrow buttons - FIXED LOGIC
//     let prevBtn, nextBtn;
   
//     if (trackId === 'feminine-track') {
//         prevBtn = document.getElementById('fem-prev');
//         nextBtn = document.getElementById('fem-next');
//     } else if (trackId === 'medicine-track') {
//         prevBtn = document.getElementById('med-prev');
//         nextBtn = document.getElementById('med-next');
//     } else {
//         // Fallback: try common patterns
//         prevBtn = document.querySelector(`[data-track="${trackId}"] .prev-btn`) ||
//                   document.querySelector(`#${trackId}-container .prev-btn`);
//         nextBtn = document.querySelector(`[data-track="${trackId}"] .next-btn`) ||
//                   document.querySelector(`#${trackId}-container .next-btn`);
//     }
//     const cardWidth = 230; // Card width
//     const gap = 16; // Gap between cards
//     const scrollAmount = (cardWidth + gap) * 3; // Scroll 3 cards at a time
//     if (nextBtn) {
//         console.log(`✓ Next button found for ${trackId}:`, nextBtn.id || nextBtn.className);
//         nextBtn.onclick = () => {
//             console.log(`Scrolling ${trackId} forward by ${scrollAmount}px`);
//             track.scrollBy({
//                 left: scrollAmount,
//                 behavior: 'smooth'
//             });
//         };
//     } else {
//         console.warn(`✗ Next button not found for ${trackId}. Available buttons:`, {
//             'fem-prev': document.getElementById('fem-prev'),
//             'fem-next': document.getElementById('fem-next'),
//             'med-prev': document.getElementById('med-prev'),
//             'med-next': document.getElementById('med-next')
//         });
//     }
   
//     if (prevBtn) {
//         console.log(`✓ Prev button found for ${trackId}:`, prevBtn.id || prevBtn.className);
//         prevBtn.onclick = () => {
//             console.log(`Scrolling ${trackId} backward by ${scrollAmount}px`);
//             track.scrollBy({
//                 left: -scrollAmount,
//                 behavior: 'smooth'
//             });
//         };
//     } else {
//         console.warn(`✗ Prev button not found for ${trackId}`);
//     }
//     // Update arrow visibility based on scroll position
//     const updateArrows = () => {
//         const isAtStart = track.scrollLeft <= 10;
//         const isAtEnd = track.scrollWidth - track.clientWidth - track.scrollLeft <= 10;
       
//         if (prevBtn) {
//             prevBtn.style.opacity = isAtStart ? '0.4' : '1';
//             prevBtn.style.pointerEvents = isAtStart ? 'none' : 'auto';
//             prevBtn.disabled = isAtStart;
//         }
       
//         if (nextBtn) {
//             nextBtn.style.opacity = isAtEnd ? '0.4' : '1';
//             nextBtn.style.pointerEvents = isAtEnd ? 'none' : 'auto';
//             nextBtn.disabled = isAtEnd;
//         }
//     };
   
//     // Add scroll event listener
//     track.addEventListener('scroll', updateArrows);
   
//     // Initial update
//     setTimeout(updateArrows, 100);
   
//     // Also update on window resize
//     window.addEventListener('resize', updateArrows);
// }
// // Toggle wishlist (FIXED VERSION)
// function toggleWishlist(product) {
//     let wishlist = getWishlist();
//     const exists = wishlist.some(item => item.id == product.id);
//     if (exists) {
//         // Remove from wishlist
//         wishlist = wishlist.filter(item => item.id != product.id);
//         showToast('Removed from wishlist', 'error');
//     } else {
//         // Add to wishlist - ENSURE ALL FIELDS ARE SAVED
//         const wishlistItem = {
//             id: product.id,
//             name: product.name || product.title || 'Product',
//             price: product.price ? String(product.price).replace('₹', '').trim() : '0',
//             originalPrice: product.originalPrice ? String(product.originalPrice).replace('₹', '').trim() : null,
//             image: product.image || product.images?.[0] || 'https://via.placeholder.com/300',
//             discount: product.discount || null
//         };
       
//         wishlist.push(wishlistItem);
//         showToast('Added to wishlist!', 'add');
//     }
//     saveWishlist(wishlist);
//     updateWishlistCount();
//     updateAllWishlistIcons();
// }
// // Update wishlist count in header
// function updateWishlistCount() {
//     const count = getWishlist().length;
   
//     document.querySelectorAll('#desktop-wishlist-count, #mobile-wishlist-count, .wishlist-count, [class*="wishlist-count"]').forEach(el => {
//         if (el) {
//             el.textContent = count;
//             el.style.display = count > 0 ? 'flex' : 'none';
//         }
//     });
// }
// // Update all heart icons (red if in wishlist)
// function updateAllWishlistIcons() {
//     const wishlist = getWishlist();
//     const wishlistIds = wishlist.map(item => item.id);
//     document.querySelectorAll('.wishlist-btn').forEach(btn => {
//         const productId = parseInt(btn.dataset.productId || btn.getAttribute('data-product-id'));
//         const svg = btn.querySelector('svg');
//         if (svg) {
//             if (wishlistIds.includes(productId)) {
//                 svg.classList.add('fill-red-500', 'text-red-500');
//                 svg.setAttribute('fill', 'currentColor');
//             } else {
//                 svg.classList.remove('fill-red-500', 'text-red-500');
//                 svg.removeAttribute('fill');
//             }
//         }
//     });
// }
// // Wishlist click handler for myntra cards
// function toggleWishlistItem(id) {
//     const product = [...productsData, ...medicinesData].find(p => p.id === id);
//     if (product) {
//         toggleWishlist(product);
//         const btn = document.querySelector(`.myntra-wishlist[data-id="${id}"]`);
//         if (btn) {
//             btn.classList.toggle('active', isInWishlist(id));
//         }
//     }
// }
// // Initialize on page load
// document.addEventListener('DOMContentLoaded', () => {
//     updateWishlistCount();
//     updateAllWishlistIcons();
//     // Re-check after dynamic content loads
//     setTimeout(() => {
//         updateAllWishlistIcons();
//         updateWishlistCount();
//     }, 800);
// });
// // Sync wishlist across tabs
// window.addEventListener('storage', (e) => {
//     if (e.key === 'wishlist') {
//         updateWishlistCount();
//         updateAllWishlistIcons();
//     }
// });
// // Make functions globally accessible
// window.getWishlist = getWishlist;
// window.toggleWishlist = toggleWishlist;
// window.isInWishlist = isInWishlist;
// window.toggleWishlistItem = toggleWishlistItem;
// function openProductDetails(id) {
//     const all = [...productsData, ...medicinesData];
//     const p = all.find(item => item.id === id);
//     if (!p) return alert("Product not found");
//     const params = new URLSearchParams({
//         id: p.id,
//         name: p.name || p.title,
//         price: p.price,
//         originalPrice: p.originalPrice || '',
//         discount: p.discount || '',
//         image: p.image || p.mainImageUrl,
//         description: 'Premium quality healthcare product.'
//     });
//     window.location.href = `productdetails.html?${params.toString()}`;
// }
// window.openProductDetails = openProductDetails;
// // Sync across tabs
// window.addEventListener('storage', (e) => {
//     if (e.key === 'cart') updateCartCount();
// });
// // Make functions global if needed elsewhere
// window.openProductDetails = openProductDetails;
// window.updateCartCount = updateCartCount;
// // Smooth scroll
// function scrollSection(containerId, amount) {
//     const container = document.getElementById(containerId);
//     container.scrollBy({ left: amount, behavior: 'smooth' });
// }
// // NEW: Dynamic data for Articles (can be fetched from backend)
// let articlesData = [
//     {
//         title: "Tips for a Balanced Diet",
//         image: "https://i.pinimg.com/736x/9d/22/4a/9d224aeb2f9d4a66d048b5d4d4802cd3.jpg",
//         description: "Learn how to maintain a balanced diet with our expert tips on nutrition and meal planning.",
//         link: "#"
//     },
//     {
//         title: "Mental Health Matters",
//         image: "https://i.pinimg.com/736x/95/50/7b/95507ba220ef508566c715ed9a6e13b1.jpg",
//         description: "Explore strategies to support your mental health and reduce stress in daily life.",
//         link: "#"
//     },
//     {
//         title: "Benefits of Regular Exercise",
//         image: "https://i.pinimg.com/736x/8f/8f/57/8f8f570f1021bff9305fc72ec3be82e5.jpg",
//         description: "Discover how regular physical activity can improve your health and well-being.",
//         link: "#"
//     }
//     // Add more articles if needed
// ];
// // NEW: Dynamic data for Footer (can be fetched from backend)
// let footerData = {
//     company: {
//         name: "MediCare Pharmacy",
//         description: "Your trusted source for quality medications and health products."
//     },
//     quickLinks: [
//         { text: "Home", link: "#" },
//         { text: "Shop", link: "#" },
//         { text: "About Us", link: "#" },
//         { text: "Contact", link: "#" }
//     ],
//     contact: {
//         email: "support@medicarepharmacy.com",
//         phone: "(123) 456-7890",
//         social: [
//             { icon: "fab fa-facebook-f", link: "#" },
//             { icon: "fab fa-twitter", link: "#" },
//             { icon: "fab fa-instagram", link: "#" }
//         ]
//     },
//     copyright: "&copy; 2025 MediCare Pharmacy. All rights reserved."
// };
// // Function to show product details by redirecting to productDetails.html
// function showProductDetails(product) {
//     // Encode product data to pass as query parameters
//     const queryParams = new URLSearchParams({
//         id: product.id,
//         name: product.name,
//         image: product.image,
//         price: product.price,
//         originalPrice: product.originalPrice,
//         discount: product.discount,
//         description: product.description
//     }).toString();
//     // Redirect to productDetails.html with query parameters
//     window.location.href = `productdetails.html?${queryParams}`;
// }
// // Function to add product to cart
// function addToCart(product, button) {
//     // Show success feedback
//     const originalText = button.innerHTML;
//     button.innerHTML = '<i class="fas fa-check mr-2"></i>Added';
//     button.classList.add('added');
   
//     // Reset button after animation
//     setTimeout(() => {
//         button.innerHTML = originalText;
//         button.classList.remove('added');
//     }, 1500);
//     // In a real app, you would add to cart logic here
//     console.log(`Added to cart: ${product.name}`);
// }
// // DOM elements
// const categoryContainer = document.getElementById('categoryContainer');
// const scrollIndicator = document.getElementById('scrollIndicator');
// // Function to render categories dynamically
// function renderCategories(categories) {
//     if (!categoryContainer) return;
  
//     categoryContainer.innerHTML = ''; // Clear existing content
   
//     categories.forEach((category, index) => {
//         const card = document.createElement('div');
//         card.className = 'flex-shrink-0 w-40 h-40 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110 hover:shadow-xl bg-white shadow-md overflow-hidden group animate-fade-in';
//         card.style.animationDelay = `${index * 0.1}s`;
//         card.innerHTML = `
//             <div class="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-blue-50">
//                 <img src="${category.image}" alt="${category.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
//             </div>
//             <div class="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 <p class="text-white font-semibold text-center text-sm px-2">${category.name}</p>
//             </div>
//         `;
       
//         // Add click event to redirect to category page
//         card.addEventListener('click', (event) => {
//             redirectToCategory(category, event);
//         });
//         // Add active class to clicked category
//         card.classList.add('category-item');
//         categoryContainer.appendChild(card);
       
//         console.log(`Selected category: ${category.name}`);
//     });
   
//     // Add indicator dots
//     addScrollIndicators();
// }
// // Function to handle category redirection
// function redirectToCategory(category, event) {
//     const card = event.currentTarget;
//     // Optional: Add loading state or animation
//     card.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50');
   
//     // Optional: Add a small delay for better UX
//     setTimeout(() => {
//         if(category.url) {
//             window.location.href = category.url;
//         } else {
//             console.warn(`No URL defined for category: ${category.name}`);
//         }
//     }, 300);
// }
// // For Single Page Applications (SPA approach)
// function navigateToCategory(category) {
//     // Update browser history
//     history.pushState({}, '', category.url);
   
//     // Update page content dynamically
//     loadCategoryContent(category);
// }
// // Function to load category content (for SPAs)
// function loadCategoryContent(category) {
//     // This would typically make an API call or load content dynamically
//     console.log(`Loading content for: ${category.name}`);
   
//     // Example: Update page title and content
//     document.title = `${category.name} - Health Store`;
   
//     // You would update the main content area here
//     const mainContent = document.getElementById('main-content');
//     if (mainContent) {
//         mainContent.innerHTML = `
//             <div class="container mx-auto px-4 py-8">
//                 <h1 class="text-3xl font-bold mb-6">${category.name}</h1>
//                 <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <!-- Category products would be loaded here -->
//                     <div class="bg-white p-4 rounded-lg shadow">
//                         <p>Products for ${category.name} would appear here</p>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }
// }
// // Add scroll indicators
// function addScrollIndicators() {
//     if (!scrollIndicator) return;
   
//     scrollIndicator.innerHTML = '';
//     const dotsCount = Math.ceil(categoriesData.length / 4);
   
//     for (let i = 0; i < dotsCount; i++) {
//         const dot = document.createElement('div');
//         dot.className = `w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${i === 0 ? 'bg-blue-500' : 'bg-gray-300'}`;
       
//         dot.addEventListener('click', () => {
//             scrollToSection(i);
//         });
       
//         scrollIndicator.appendChild(dot);
//     }
// }
// // Scroll to specific section
// function scrollToSection(sectionIndex) {
//     if (!categoryContainer) return;
   
//     const scrollWidth = categoryContainer.scrollWidth;
//     const sectionWidth = scrollWidth / Math.ceil(categoriesData.length / 4);
//     categoryContainer.scrollTo({
//         left: sectionWidth * sectionIndex,
//         behavior: 'smooth'
//     });
   
//     updateActiveIndicator();
// }
// // Auto-scroll functionality
// let autoScrollInterval;
// function startAutoScroll() {
//     if (!categoryContainer) return;
   
//     autoScrollInterval = setInterval(() => {
//         const scrollLeft = categoryContainer.scrollLeft;
//         const scrollWidth = categoryContainer.scrollWidth - categoryContainer.clientWidth;
       
//         if (scrollLeft >= scrollWidth - 10) {
//             categoryContainer.scrollTo({
//                 left: 0,
//                 behavior: 'smooth'
//             });
//         } else {
//             categoryContainer.scrollBy({
//                 left: 300,
//                 behavior: 'smooth'
//             });
//         }
//     }, 4000);
// }
// function stopAutoScroll() {
//     clearInterval(autoScrollInterval);
// }
// // Update active indicator based on scroll position
// function updateActiveIndicator() {
//     if (!categoryContainer || !scrollIndicator) return;
   
//     const scrollLeft = categoryContainer.scrollLeft;
//     const scrollWidth = categoryContainer.scrollWidth;
//     const sectionWidth = scrollWidth / Math.ceil(categoriesData.length / 4);
//     const activeSection = Math.floor(scrollLeft / sectionWidth);
   
//     document.querySelectorAll('#scrollIndicator > div').forEach((dot, index) => {
//         if (index === activeSection) {
//             dot.classList.remove('bg-gray-300');
//             dot.classList.add('bg-blue-500');
//         } else {
//             dot.classList.remove('bg-blue-500');
//             dot.classList.add('bg-gray-300');
//         }
//     });
// }
// // Event listeners for category container
// if (categoryContainer) {
//     categoryContainer.addEventListener('mouseenter', stopAutoScroll);
//     categoryContainer.addEventListener('mouseleave', startAutoScroll);
//     categoryContainer.addEventListener('scroll', updateActiveIndicator);
// }
// // Initialize
// renderCategories(categoriesData);
// startAutoScroll();
// // ===========================================
// // FINAL WORKING CODE – NO MORE ERRORS!
// // ===========================================
// // ALL PRODUCTS DATA (Combined)
// const allProducts = [...productsData, ...medicinesData];
// // GLOBAL: Render any product grid (used by both sections)
// function renderProductGrid(containerId, productsArray) {
//     const container = document.getElementById(containerId);
//     if (!container) {
//         console.warn(`Container #${containerId} not found!`);
//         return;
//     }
//     container.innerHTML = ''; // Clear
//     productsArray.forEach(product => {
//         const card = document.createElement('div');
//         card.className = 'bg-red rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300';
//         card.innerHTML = `
//             <div class="relative group">
//                 <div class="absolute top-2 left-2 bg-red-500 text-white text-xs px-1 py-1 rounded z-10">
//                     ${product.discount}
//                 </div>
//                 <img src="${product.image}" alt="${product.name}"
//                      class="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500">
//                 <div class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
//                     <!-- Quick view button removed for simplicity -->
//                 </div>
//             </div>
//             <div class="p-5">
//                 <h3 class="font-semibold text-md text-center mb-2 line-clamp-2">${product.name}</h3>
//                 <div class="flex items-center justify-center gap-3 mb-2">
//                     <span class="text-xl font-bold text-green-600">${product.price}</span>
//                     <span class="text-gray-500 line-through">${product.originalPrice}</span>
//                 </div>
//                 <div class="flex gap-3">
//                     <button onclick="openProductDetails(${product.id})"
//                             class="flex-1 bg-blue-600 text-white py-1 rounded-lg hover:bg-blue-700 transition font-medium">
//                         View Details
//                     </button>
//                     <button class="add-to-cart-btn bg-teal-600 text-white px-6 py-1 rounded-lg hover:bg-teal-700 transition font-bold"
//                             data-product-id="${product.id}"
//                             data-product-name="${product.name}"
//                             data-product-price="${product.price.replace('₹', '')}"
//                             data-product-image="${product.image}">
//                         Add
//                     </button>
//                 </div>
//             </div>
//         `;
//         container.appendChild(card);
//     });
// }
// // Setup scroll buttons - FIXED VERSION
// function setupScrollButtons() {
//     const scrollContainer = document.getElementById('productGrid');
//     const scrollLeft = document.getElementById('scrollLeft');
//     const scrollRight = document.getElementById('scrollRight');
   
//     if (scrollLeft && scrollRight && scrollContainer) {
//         scrollLeft.addEventListener('click', () => {
//             scrollContainer.scrollBy({ left: -300, behavior: 'smooth' });
//         });
       
//         scrollRight.addEventListener('click', () => {
//             scrollContainer.scrollBy({ left: 300, behavior: 'smooth' });
//         });
       
//         // Show/hide scroll buttons based on scroll position
//         const updateScrollButtons = () => {
//             const isAtStart = scrollContainer.scrollLeft <= 10;
//             const isAtEnd = scrollContainer.scrollLeft >=
//                 scrollContainer.scrollWidth - scrollContainer.clientWidth - 10;
           
//             scrollLeft.style.opacity = isAtStart ? '0.5' : '1';
//             scrollLeft.style.pointerEvents = isAtStart ? 'none' : 'auto';
           
//             scrollRight.style.opacity = isAtEnd ? '0.5' : '1';
//             scrollRight.style.pointerEvents = isAtEnd ? 'none' : 'auto';
//         };
       
//         scrollContainer.addEventListener('scroll', updateScrollButtons);
//         updateScrollButtons();
//     }
// }
// function renderMedicines(medicines) {
//     const grid = document.getElementById('medicineGrid');
//     if (!grid) return;
  
//     grid.innerHTML = ''; // Clear existing content
  
//     medicines.forEach(product => {
//         const card = document.createElement('div');
//         card.className = 'product-card bg-white rounded-lg p-4 text-center shadow-md hover:shadow-lg transition-all duration-300 min-w-[250px] flex flex-col';
      
//         card.innerHTML = `
//             <div class="relative mb-3">
//                 <div class="absolute top-2 right-2 z-10">
//                     <button class="wishlist-icon bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500">
//                         <i class="fas fa-heart"></i>
//                     </button>
//                 </div>
//                 <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-contain rounded-md mb-2">
//             </div>
//             <div class="flex-1 flex flex-col">
//                 <h3 class="text-sm font-semibold text-gray-800 mb-2">${product.name}</h3>
//                 <div class="mt-auto">
//                     <div class="flex items-center justify-center mb-2">
//                         <span class="text-lg font-bold text-gray-900">${product.price}</span>
//                         <span class="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
//                         <span class="text-sm font-semibold text-green-600 ml-2">${product.discount}</span>
//                     </div>
//                     <button class="view-details-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
//                         <i class="fas fa-info-circle mr-2"></i>View Details
//                     </button>
//                 </div>
//             </div>
//         `;
      
//         card.addEventListener('click', (e) => {
//             // Prevent opening details if clicking on wishlist button
//             if (e.target.closest('.wishlist-icon')) {
//                 return;
//             }
//             showProductDetails(product);
//         });
      
//         grid.appendChild(card);
//     });
   
//     // Scroll functionality for medicines
//     const scrollContainer = document.getElementById('medicineGrid');
//     const scrollLeft = document.getElementById('medScrollLeft');
//     const scrollRight = document.getElementById('medScrollRight');
   
//     if (scrollLeft && scrollRight && scrollContainer) {
//         scrollLeft.addEventListener('click', () => {
//             scrollContainer.scrollLeft -= 300;
//         });
//         scrollRight.addEventListener('click', () => {
//             scrollContainer.scrollLeft += 300;
//         });
//     }
// }
// // NEW: Function to render Doctor Section dynamically
// const doctorData = [
//     {
//         name: "Dr. Rahul Gandhi",
//         title: "MBBS, MD - Obstetrics & Gynaecology",
//         description: "With over 15 years of experience in Obstetrics & Gynaecology, Dr. Rahul Gandhi specializes in high-risk pregnancies, infertility treatments, and minimally invasive gynecological surgeries. He is known for his compassionate approach and commitment to patient-centered care.",
//         image: "https://i.pinimg.com/1200x/5b/43/51/5b4351ad9cbfb15fe0e586f4df121e6.jpg",
//         backgroundImage: "https://i.pinimg.com/1200x/61/6c/88/616c8812ef9bfb6f9d2ba5d759543396.jpg",
//         achievements: "National Excellence Award, Best Doctor Award",
//         association: "Indian Medical Association (IMA)"
//     }
// ];
// function renderDoctorSection(doctors) {
//     const section = document.getElementById('doctorSection');
//     if (!section || doctors.length === 0) return;
//     const doctor = doctors[0]; // Render first doctor; extend for multiple if needed
//     section.innerHTML = `
//         <div class="absolute inset-0">
//             <img src="${doctor.backgroundImage}"
//                  alt="Background"
//                  class="w-full h-[620px] object-cover">
//             <div class="absolute inset-0 bg-white/10"></div> <!-- Light overlay -->
//         </div>
//         <!-- Merged Card -->
//         <div class="relative w-full py-8 px-8 lg:px-12">
//             <div class="max-w-8xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
//                 <!-- Doctor Image (Left side) -->
//                 <div class="h-[550px]">
//                     <img src="${doctor.image}"
//                          alt="${doctor.name}"
//                          class="w-full h-full object-cover">
//                 </div>
//                 <!-- About Content (Right side) -->
//                 <div class="p-8 flex flex-col justify-between">
//                     <div>
//                         <h1 class="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
//                             Meet ${doctor.name}
//                         </h1>
                      
//                         <h2 class="text-2xl font-semibold text-gray-800 mb-3">
//                             ${doctor.title}
//                         </h2>
                      
//                         <p class="text-[17px] text-gray-800 mb-4 leading-relaxed">
//                             ${doctor.description.split('.')[0]} <!-- First sentence for experience -->
//                         </p>
                      
//                         <p class="text-[17px] text-gray-800 mb-4 leading-relaxed">
//                             Recipient of <span class="font-semibold">${doctor.achievements.split(',')[1]}</span> for excellence in infertility management, Dr. Gandhi combines advanced medical expertise with compassion, ensuring safe and personalized care for every patient.
//                         </p>
                      
//                         <p class="text-[17px] text-gray-700 mb-4 leading-relaxed">
//                             An active member of the <span class="font-semibold">${doctor.association}</span>, he regularly updates his knowledge through seminars, workshops, and conferences. Dr. Gandhi's patient-centered approach helps individuals navigate complex pregnancies with confidence and peace of mind.
//                         </p>
//                     </div>
//                     <div class="mt-6 w-20 h-1 bg-pink-500"></div>
//                 </div>
//             </div>
//         </div>
//     `;
// }
// // NEW: Function to render Articles Section dynamically
// function renderArticlesSection(articles) {
//     const section = document.getElementById('articlesSection');
//     if (!section) return;
//     section.innerHTML = `
//         <h2 class="text-2xl font-bold text-center mb-6">Health & Wellness Articles</h2>
//         <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             ${articles.map(article => `
//                 <div class="article-card bg-white rounded-lg shadow-md overflow-hidden">
//                     <img src="${article.image}" alt="${article.title}" class="w-full h-48 object-cover">
//                     <div class="p-6">
//                         <h3 class="text-xl font-semibold mb-2">${article.title}</h3>
//                         <p class="text-gray-600 mb-4">${article.description}</p>
//                         <a href="${article.link}" class="text-primary hover:text-secondary font-medium">Read More</a>
//                     </div>
//                 </div>
//             `).join('')}
//         </div>
//     `;
// }
// // NEW: Function to render Footer dynamically
// function renderFooter(footer) {
//     const section = document.getElementById('footerSection');
//     if (!section) return;
//     const { company, quickLinks, contact, copyright } = footer;
//     section.innerHTML = `
//         <div class="container mx-auto px-4">
//             <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
//                 <div>
//                     <h3 class="text-lg font-semibold mb-4">${company.name}</h3>
//                     <p class="text-gray-300">${company.description}</p>
//                 </div>
//                 <div>
//                     <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
//                     <ul class="space-y-2">
//                         ${quickLinks.map(link => `<li><a href="${link.link}" class="text-gray-300 hover:text-primary">${link.text}</a></li>`).join('')}
//                     </ul>
//                 </div>
//                 <div>
//                     <h3 class="text-lg font-semibold mb-4">Contact Us</h3>
//                     <p class="text-gray-300">Email: ${contact.email}</p>
//                     <p class="text-gray-300">Phone: ${contact.phone}</p>
//                     <div class="flex space-x-4 mt-4">
//                         ${contact.social.map(social => `<a href="${social.link}" class="text-gray-300 hover:text-primary"><i class="${social.icon}"></i></a>`).join('')}
//                     </div>
//                 </div>
//             </div>
//             <div class="mt-8 text-center text-gray-400">
//                 <p>${copyright}</p>
//             </div>
//         </div>
//     `;
// }
// // Open Upload Prescription modal
// document.querySelectorAll('a[href="#upload-prescription"]').forEach(btn => {
//     btn.addEventListener('click', function(e) {
//         e.preventDefault();
//         document.getElementById('uploadModal').classList.remove('hidden');
//     });
// });
// // Close Upload modal when clicking backdrop
// const uploadModal = document.getElementById('uploadModal');
// if (uploadModal) {
//     uploadModal.addEventListener('click', function(e) {
//         if (e.target === this) {
//             this.classList.add('hidden');
//         }
//     });
// }
// // NEW: Function to render main background banner dynamically
// function renderMainBanner() {
//     const bgImage = document.getElementById('mainBackgroundImage');
//     if (bgImage) {
//         bgImage.src = mainBackgroundBanner;
//     }
// }
// // NEW: Function to render secondary banner dynamically
// function renderSecondaryBanner() {
//     const secondaryImage = document.getElementById('secondaryBannerImage');
//     if (secondaryImage) {
//         secondaryImage.src = secondaryBanner;
//     }
// }
// // NEW: Function to render carousel dynamically
// function renderCarousel() {
//     const carousel = document.getElementById("carousel");
//     const dotsContainer = document.getElementById("dotsContainer");
//     if (!carousel || !dotsContainer) return;
//     // Render slides
//     carousel.innerHTML = carouselBanners.map((src, idx) => `
//         <img src="${src}" class="carousel-image w-full flex-shrink-0 rounded-xl" alt="Featured Product ${idx + 1}">
//     `).join('');
//     // Render dots
//     dotsContainer.innerHTML = carouselBanners.map(() => `
//         <button class="dot w-3 h-3 bg-white rounded-full opacity-50 hover:opacity-100 transition-opacity"></button>
//     `).join('');
// }
// // Carousel functionality (moved to a separate function to call after rendering)
// function initializeCarousel() {
//     const carousel = document.getElementById("carousel");
//     if (!carousel) return;
   
//     const slides = carousel.children.length;
//     const dots = document.querySelectorAll(".dot");
//     let index = 0;
   
//     function showSlide(i) {
//         index = (i + slides) % slides; // loop around
//         carousel.style.transform = `translateX(-${index * 100}%)`;
//         // Update dots
//         dots.forEach((dot, idx) => {
//             dot.classList.toggle("opacity-100", idx === index);
//             dot.classList.toggle("opacity-50", idx !== index);
//         });
//     }
   
//     // Buttons
//     const prevBtn = document.getElementById("prev");
//     const nextBtn = document.getElementById("next");
   
//     if (prevBtn) {
//         prevBtn.onclick = () => showSlide(index - 1);
//     }
   
//     if (nextBtn) {
//         nextBtn.onclick = () => showSlide(index + 1);
//     }
   
//     // Dots click
//     dots.forEach((dot, idx) => {
//         dot.addEventListener("click", () => showSlide(idx));
//     });
   
//     // Auto play every 4s
//     setInterval(() => showSlide(index + 1), 4000);
//     // Init
//     showSlide(0);
// }
// // =============== CRITICAL FIX: RENDER PRODUCT SECTIONS ===============
// function renderProductSections() {
//     console.log('Rendering Feminine Hygiene...');
//     renderMyntraSection('feminine-track', productsData);
//     console.log('Rendering Medicines & Healthcare...');
//     renderMyntraSection('medicine-track', medicinesData);
   
//     // Re-apply cart count after products are rendered
//     setTimeout(() => {
//         if (typeof updateCartCount === 'function') updateCartCount();
//         if (typeof restoreQuantitySelectors === 'function') restoreQuantitySelectors();
//     }, 800);
// }
// // ========== FIXED PRESCRIPTION UPLOAD LOGIC ==========
// function initializePrescriptionUpload() {
//     if (window.prescriptionUploadInitialized) {
//         console.warn('⚠️ Prescription upload already initialized. Skipping.');
//         return;
//     }
//     window.prescriptionUploadInitialized = true;
//     console.log('🚀 Initializing prescription upload module...');
   
//     // Get elements
//     const doctorNameInput = document.getElementById('doctorName');
//     const fileInput = document.getElementById('prescriptionFileInput');
//     const fileNameDisplay = document.getElementById('selectedFileName');
//     const fileNameText = document.getElementById('fileNameText');
//     const submitBtn = document.getElementById('submitPrescriptionBtn');
//     const uploadModal = document.getElementById('uploadModal');
//     const uploadFileArea = document.getElementById('uploadFileArea');
//     const closeUploadModalBtn = document.getElementById('closeUploadModal');
   
//     // Check if elements exist
//     if (!doctorNameInput || !fileInput || !submitBtn || !uploadModal) {
//         console.warn('Prescription upload elements not found');
//         return;
//     }
   
//     console.log('✅ Found all prescription upload elements');
   
//     // Backend API configuration
//     const API_BASE_URL = 'http://localhost:8083';
//     const CREATE_ORDER_ENDPOINT = `${API_BASE_URL}/api/prescriptions/create-order`;
   
//     // Create a separate state object to track form values
//     let formState = {
//         doctorName: '',
//         hasFile: false,
//         file: null
//     };
//     // 1. Enable/disable the submit button - FIXED: Use actual state
//     function updateSubmitButton() {
//         const hasName = formState.doctorName.trim().length > 0;
//         const hasFile = formState.hasFile;
       
//         submitBtn.disabled = !(hasName && hasFile);
       
//         console.log('📝 Submit button validation:', {
//             doctorName: hasName ? '✓' : '✗',
//             file: hasFile ? '✓' : '✗',
//             buttonEnabled: !submitBtn.disabled ? '✅' : '❌'
//         });
//     }
//     // 2. Update state when doctor name changes - FIXED: Direct state update
//     doctorNameInput.addEventListener('input', function(e) {
//         formState.doctorName = e.target.value;
//         console.log('👨‍⚕️ Doctor name changed:', formState.doctorName);
//         updateSubmitButton();
//     });
//     // 3. Handle file selection - FIXED: Direct state update
//     function handleFileSelect() {
//         if (fileInput.files && fileInput.files.length > 0) {
//             const file = fileInput.files[0];
//             formState.hasFile = true;
//             formState.file = file;
           
//             if (fileNameText && fileNameDisplay) {
//                 fileNameText.textContent = file.name;
//                 fileNameDisplay.classList.remove('hidden');
//                 console.log('📎 File selected:', {
//                     name: file.name,
//                     size: `${(file.size / 1024).toFixed(2)} KB`,
//                     type: file.type,
//                     lastModified: new Date(file.lastModified).toLocaleString()
//                 });
//             }
//         } else {
//             formState.hasFile = false;
//             formState.file = null;
//             if (fileNameDisplay) {
//                 fileNameDisplay.classList.add('hidden');
//             }
//             console.log('📎 No file selected');
//         }
//         updateSubmitButton();
//     }
//     fileInput.addEventListener('change', handleFileSelect);
//     // 4. Form validation - FIXED: Use actual state
//     function validateForm() {
//         const errors = [];
       
//         console.log('🔍 Validating form - Current values:', formState);
       
//         if (!formState.doctorName.trim()) {
//             errors.push('Doctor name is required');
//             console.log('❌ Doctor name validation failed');
//         } else {
//             console.log('✅ Doctor name validation passed');
//         }
       
//         if (!formState.hasFile || !formState.file) {
//             errors.push('Prescription image is required');
//             console.log('❌ File validation failed');
//         } else {
//             console.log('✅ File validation passed');
//             const file = formState.file;
//             const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
//             const maxSize = 10 * 1024 * 1024; // 10MB
           
//             if (!validTypes.includes(file.type)) {
//                 errors.push('Please upload only JPG, PNG, or PDF files');
//                 console.log('❌ File type validation failed:', file.type);
//             }
           
//             if (file.size > maxSize) {
//                 errors.push('File size must be less than 10MB');
//                 console.log('❌ File size validation failed:', file.size);
//             }
//         }
       
//         if (errors.length === 0) {
//             console.log('✅ All form validations passed');
//         } else {
//             console.log(`❌ Form has ${errors.length} validation error(s):`, errors);
//         }
       
//         return errors;
//     }
//     // 5. Show loading state
//     function showLoading() {
//         submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Submitting...';
//         submitBtn.disabled = true;
//         submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
//         console.log('⏳ Showing loading state...');
//     }
//     // 6. Reset button state
//     function resetButtonState() {
//         submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Submit Prescription';
//         updateSubmitButton();
//         submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
//         console.log('🔄 Button state reset');
//     }
//     // 7. Show success toast
//     function showSuccessToast(message) {
//         const toast = document.createElement('div');
//         toast.textContent = message;
//         toast.className = 'fixed top-20 right-5 z-50 px-8 py-4 rounded-xl text-white font-bold shadow-2xl transition-all bg-green-600 transform translate-x-full';
//         document.body.appendChild(toast);
//         setTimeout(() => toast.classList.remove('translate-x-full'), 100);
//         setTimeout(() => toast.remove(), 5000);
//         console.log('✅ Success toast:', message);
//     }
//     // 8. Show error toast
//     function showErrorToast(message) {
//         const toast = document.createElement('div');
//         toast.textContent = message;
//         toast.className = 'fixed top-20 right-5 z-50 px-8 py-4 rounded-xl text-white font-bold shadow-2xl transition-all bg-red-600 transform translate-x-full';
//         document.body.appendChild(toast);
//         setTimeout(() => toast.classList.remove('translate-x-full'), 100);
//         setTimeout(() => toast.remove(), 5000);
//         console.log('❌ Error toast:', message);
//     }
//     // 9. Show success modal
//     function showSuccessModal() {
//         const successModal = document.getElementById('successModal');
//         const successModalContent = document.getElementById('successModalContent');
       
//         if (successModal && successModalContent) {
//             successModal.classList.remove('hidden');
//             setTimeout(() => {
//                 successModalContent.classList.remove('scale-95', 'opacity-0');
//                 successModalContent.classList.add('scale-100', 'opacity-100');
//             }, 10);
//             console.log('✅ Success modal shown');
//         }
//     }
//     // 10. Reset form to its initial state
//     function resetForm() {
//         doctorNameInput.value = '';
//         fileInput.value = '';
//         formState = {
//             doctorName: '',
//             hasFile: false,
//             file: null
//         };
       
//         if (fileNameDisplay) {
//             fileNameDisplay.classList.add('hidden');
//         }
       
//         resetButtonState();
//         console.log('♻️ Form reset to initial state');
//     }
//    // 11. Form submission handler - FIXED: Correct data format for backend
// async function handleSubmit(event) {
//     if (event) {
//         event.preventDefault();
//         event.stopPropagation();
//     }
   
//     // ADD THIS CHECK
//     if (!checkIfUserLoggedIn()) {
//         showLoginRequiredMessage();
//         console.log('❌ Submission blocked: User not logged in');
//         return;
//     }
   
//     console.log('🚀 ========== STARTING PRESCRIPTION SUBMISSION ==========');
//     console.log('📅 Time:', new Date().toLocaleTimeString());
   
//     // Validate form with current values
//     const errors = validateForm();
//     if (errors.length > 0) {
//         showErrorToast(errors[0]);
//         console.error('❌ Form validation failed:', errors);
//         return;
//     }
   
//     console.log('✅ Step 1: Form validation passed');
   
//     // Show loading state
//     showLoading();
   
//     try {
//         const file = formState.file;
//         const doctorName = formState.doctorName.trim();
       
//         console.log('📦 Step 2: Preparing data for submission');
//         console.log(' Doctor Name:', doctorName);
//         console.log(' File Name:', file.name);
//         console.log(' File Size:', `${(file.size / 1024).toFixed(2)} KB`);
       
//         // Get user data from session storage - FIX: Use 'currentUser'
//         let userData = null;
//         let userId = 1; // Default fallback
//         let firstName = 'Patient';
//         let lastName = 'Name';
//         let email = 'patient@example.com';
//         let mobileNumber = '0000000000'; // CHANGED from phone to mobileNumber
//         let address = 'Not provided';
       
//         try {
//             // FIX: Changed from 'userData' to 'currentUser'
//             const userDataString = sessionStorage.getItem('currentUser');
//             if (userDataString) {
//                 userData = JSON.parse(userDataString);
//                 if (userData) {
//                     userId = userData.userId || 1;
//                     firstName = userData.firstName || 'Patient';
//                     lastName = userData.lastName || 'Name';
//                     email = userData.email || 'patient@example.com';
//                     // CHANGED: Use mobileNumber instead of phone
//                     mobileNumber = userData.phone || userData.mobileNumber || '0000000000';
                   
//                     // Build address from components
//                     if (userData.addressArea && userData.addressCity && userData.addressPincode && userData.addressState) {
//                         address = `${userData.addressArea}, ${userData.addressCity}, ${userData.addressPincode}, ${userData.addressState}`;
//                         if (userData.addressLandmark) {
//                             address += ` (Near ${userData.addressLandmark})`;
//                         }
//                     }
                   
//                     console.log('👤 Using logged-in user data from currentUser:', {
//                         userId,
//                         firstName,
//                         lastName,
//                         email,
//                         mobileNumber // CHANGED
//                     });
//                 }
//             }
//         } catch (userDataError) {
//             console.log('⚠️ Could not parse user data from currentUser, using defaults:', userDataError);
//         }
       
//         // Create FormData as expected by backend
//         const formData = new FormData();
       
//         // Create orderData object with REAL user data from session storage
//         const orderData = {
//             doctorName: doctorName,
//             email: email,
//             // CHANGED: Use mobileNumber instead of phone to match backend
//             mobileNumber: mobileNumber,
//             firstName: firstName, // Use actual first name from user data
//             lastName: lastName, // Use actual last name from user data
//             userId: userId, // Use actual user ID
//             // Optional fields with defaults
//             address: address || 'Not provided',
//             notes: 'Uploaded via web portal',
//             orderStatus: 'PENDING',
//             prescriptionType: 'UPLOADED',
//             timestamp: new Date().toISOString()
//         };
       
//         console.log('📄 Order Data (with user info from currentUser):', orderData);
       
//         // Append as Blob for JSON
//         formData.append('orderData', new Blob([JSON.stringify(orderData)], {
//             type: 'application/json'
//         }));
       
//         // Append file
//         formData.append('prescriptionImg', file);
       
//         console.log('🌐 Step 3: Sending request to backend');
//         console.log(' Endpoint:', CREATE_ORDER_ENDPOINT);
//         console.log(' Method: POST');
       
//         // Send to backend
//         const response = await fetch(CREATE_ORDER_ENDPOINT, {
//             method: 'POST',
//             body: formData,
//         });
       
//         console.log('📡 Step 4: Received response');
//         console.log(' Status:', response.status);
//         console.log(' OK:', response.ok);
       
//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`HTTP ${response.status}: ${errorText}`);
//         }
       
//         const result = await response.json();
//         console.log('🎉 Step 5: Backend response received');
//         console.log(' Result:', result);
       
//         // Show success message
//         if (result.prescriptionId) {
//             showSuccessModal();
//             console.log(`✅ Prescription created with ID: ${result.prescriptionId}`);
//         } else {
//             showSuccessToast('Prescription submitted successfully!');
//             console.log('✅ Prescription submitted successfully');
//         }
       
//         // Reset form and close modal
//         setTimeout(() => {
//             resetForm();
//             uploadModal.classList.add('hidden');
//             console.log('✅ Modal closed, form reset');
//             console.log('🎊 ========== PRESCRIPTION SUBMISSION COMPLETE ==========');
//         }, 2000);
       
//     } catch (error) {
//         console.error('❌ ========== SUBMISSION FAILED ==========');
//         console.error('💥 Error details:', error);
       
//         let errorMessage = 'Failed to submit prescription. ';
       
//         if (error.message.includes('Failed to fetch')) {
//             errorMessage += 'Cannot connect to server. Please check if backend is running on port 8083.';
//             console.log('🔌 Network error - Backend might be down');
//         } else if (error.message.includes('HTTP 400')) {
//             errorMessage += 'Invalid data sent to server.';
//             console.log('🔍 Bad request - Check data format');
//         } else if (error.message.includes('HTTP 500')) {
//             errorMessage += 'Server error. Please try again later.';
//             console.log('⚡ Server error - Backend issue');
//         } else {
//             errorMessage += error.message;
//             console.log('❓ Unknown error');
//         }
       
//         showErrorToast(errorMessage);
//         resetButtonState();
//     }
// }
//     // 12. Attach event listeners
//     console.log('🔗 Step: Attaching event listeners...');
   
//     // Submit button click - FIXED: Use proper event handling
//     submitBtn.addEventListener('click', function(e) {
//         console.log('🖱️ Submit button clicked');
//         handleSubmit(e);
//     });
   
//     // Make upload area clickable
//     if (uploadFileArea) {
//         uploadFileArea.addEventListener('click', function(e) {
//             console.log('📎 Upload area clicked');
//             fileInput.click();
//         });
//         console.log('✅ File upload area click handler attached');
//     }
//     // Close modal button
//     if (closeUploadModalBtn) {
//         closeUploadModalBtn.addEventListener('click', function(e) {
//             e.preventDefault();
//             e.stopPropagation();
//             console.log('❌ Close modal button clicked');
//             resetForm();
//             uploadModal.classList.add('hidden');
//         });
//         console.log('✅ Modal close button handler attached');
//     }
//     // 13. Initial state: button disabled
//     updateSubmitButton();
   
//     console.log('✅ Prescription upload module initialized successfully!');
//     console.log('🎯 API Endpoint:', CREATE_ORDER_ENDPOINT);
//     console.log('📊 Ready to accept prescriptions');
//     console.log('=============================================');
// }
// // Initialize success modal
// function initializeSuccessModal() {
//     const successCloseBtn = document.getElementById('successCloseBtn');
//     if (successCloseBtn) {
//         successCloseBtn.addEventListener('click', function() {
//             const successModal = document.getElementById('successModal');
//             const successModalContent = document.getElementById('successModalContent');
//             if (successModal && successModalContent) {
//                 successModalContent.classList.remove('scale-100', 'opacity-100');
//                 successModalContent.classList.add('scale-95', 'opacity-0');
//                 setTimeout(() => {
//                     successModal.classList.add('hidden');
//                 }, 300);
//             }
//         });
//     }
// }
// // Fix for upload buttons to open modal - MODIFIED VERSION
// function fixUploadModalOpeners() {
//     document.querySelectorAll('a[href="#upload-prescription"]').forEach(btn => {
//         btn.addEventListener('click', function(e) {
//             e.preventDefault();
//             e.stopPropagation();
           
//             // Check if user is logged in
//             const isLoggedIn = checkIfUserLoggedIn();
           
//             if (!isLoggedIn) {
//                 // Redirect to login page or show login modal
//                 console.log('⚠️ User not logged in. Redirecting to login...');
//                 showLoginRequiredMessage();
//                 return;
//             }
           
//             // User is logged in, open upload modal
//             const uploadModal = document.getElementById('uploadModal');
//             if (uploadModal) {
//                 uploadModal.classList.remove('hidden');
//                 console.log('📋 Upload modal opened via button click');
//             }
//         });
//     });
// }

// // NEW: Function to check if user is logged in - FIXED FOR currentUser
// function checkIfUserLoggedIn() {
//     // Check for the specific structure from your session storage
//     try {
//         // FIX: Changed from 'userData' to 'currentUser'
//         const userDataString = sessionStorage.getItem('currentUser');
       
//         if (userDataString) {
//             const userData = JSON.parse(userDataString);
//             // Check if userData has the expected structure from your example
//             if (userData && userData.userId) {
//                 console.log('✅ User logged in with ID:', userData.userId);
//                 return true;
//             }
//         }
       
//         console.log('❌ User not logged in - no valid user data found in currentUser');
//         return false;
       
//     } catch (error) {
//         console.log('❌ Error checking login status:', error);
//         return false;
//     }
// }
// // NEW: Function to show login required message
// function showLoginRequiredMessage() {
//     // You can customize this to show a modal, redirect to login page, or show toast
//     const toast = document.createElement('div');
//     toast.textContent = 'Please login to upload prescription';
//     toast.className = 'fixed top-20 right-5 z-50 px-8 py-4 rounded-xl text-white font-bold shadow-2xl transition-all bg-yellow-600 transform translate-x-full';
//     document.body.appendChild(toast);
//     setTimeout(() => toast.classList.remove('translate-x-full'), 100);
//     setTimeout(() => toast.remove(), 3000);
   
//     // Optional: Redirect to login page after a delay
//     setTimeout(() => {
//         // Change this to your login page URL
//         // window.location.href = '/login.html';
//         console.log('Redirecting to login page...');
//     }, 2000);
// }
// // FIXED: Add missing functions that were called in initialization
// function updateAllWishlistIcons() {
//     const wishlist = getWishlist();
//     const wishlistIds = wishlist.map(item => item.id);
   
//     document.querySelectorAll('.wishlist-btn').forEach(btn => {
//         const productId = parseInt(btn.dataset.productId || btn.getAttribute('data-product-id'));
//         const svg = btn.querySelector('svg');
       
//         if (svg && wishlistIds.includes(productId)) {
//             svg.classList.add('fill-red-500', 'text-red-500');
//             svg.setAttribute('fill', 'currentColor');
//         } else if (svg) {
//             svg.classList.remove('fill-red-500', 'text-red-500');
//             svg.removeAttribute('fill');
//         }
//     });
// }
// // FIXED: Add proper event listener for the close modal button
// document.addEventListener('DOMContentLoaded', function() {
//     // Fix for the close modal button error
//     const closeModalBtn = document.querySelector('#uploadModal button.absolute.top-3.right-3');
//     if (closeModalBtn) {
//         closeModalBtn.addEventListener('click', function() {
//             const uploadModal = document.getElementById('uploadModal');
//             if (uploadModal) {
//                 uploadModal.classList.add('hidden');
//             }
//         });
//     }
   
//     // Also fix success modal close button
//     const successCloseBtn = document.getElementById('successCloseBtn');
//     if (successCloseBtn) {
//         successCloseBtn.addEventListener('click', function() {
//             const successModal = document.getElementById('successModal');
//             const successModalContent = document.getElementById('successModalContent');
//             if (successModal && successModalContent) {
//                 successModalContent.classList.remove('scale-100', 'opacity-100');
//                 successModalContent.classList.add('scale-95', 'opacity-0');
//                 setTimeout(() => {
//                     successModal.classList.add('hidden');
//                 }, 300);
//             }
//         });
//     }
// });
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('🚀 ========== INITIALIZING APPLICATION ==========');
   
//     // Fix modal openers FIRST
//     fixUploadModalOpeners();
   
//     // Initialize success modal
//     initializeSuccessModal();
   
//     // Initialize prescription upload
//     initializePrescriptionUpload();
   
//     // Initialize cart count (if function exists)
//     if (typeof updateCartCount === 'function') {
//         updateCartCount();
//     }
   
//     // Restore quantity selectors (if function exists)
//     if (typeof restoreQuantitySelectors === 'function') {
//         restoreQuantitySelectors();
//     }
   
//     console.log('🎉 ========== APPLICATION INITIALIZED SUCCESSFULLY! ==========');
// });
// // FINAL INITIALIZATION - Everything runs after DOM is ready
// document.addEventListener('DOMContentLoaded', function() {
//     console.log('🚀 ========== INITIALIZING GOODNEEWZ APPLICATION ==========');
//     console.log('📅 Date:', new Date().toLocaleString());
//     console.log('🌐 Backend configured for port 8083');
   
//     // 1. Setup scroll buttons FIRST (before any other operations)
//     const scrollLeftBtn = document.getElementById('scrollLeft');
//     const scrollRightBtn = document.getElementById('scrollRight');
//     const categoryContainer = document.getElementById('categoryContainer');
   
//     console.log('🔧 Step 1: Setting up scroll buttons...');
//     if (scrollLeftBtn && scrollRightBtn && categoryContainer) {
//         scrollLeftBtn.addEventListener('click', () => {
//             categoryContainer.scrollBy({
//                 left: -300,
//                 behavior: 'smooth'
//             });
//             console.log('⬅️ Scrolling left');
//         });
       
//         scrollRightBtn.addEventListener('click', () => {
//             categoryContainer.scrollBy({
//                 left: 300,
//                 behavior: 'smooth'
//             });
//             console.log('➡️ Scrolling right');
//         });
       
//         console.log('✅ Scroll buttons initialized');
//     } else {
//         console.warn('⚠️ Scroll buttons or category container not found');
//     }
   
//     // 2. Load content
//     console.log('🔧 Step 2: Loading categories...');
//     if (typeof renderCategories === 'function' && categoriesData) {
//         renderCategories(categoriesData);
//         console.log(`✅ Loaded ${categoriesData.length} categories`);
//     }
   
//     // 3. CRITICAL: Render product sections
//     console.log('🔧 Step 3: Rendering product sections...');
//     renderProductSections();
//     console.log('✅ Product sections rendered');
   
//     // 4. Other initializations
//     console.log('🔧 Step 4: Initializing other components...');
//     if (typeof renderMainBanner === 'function') {
//         renderMainBanner();
//         console.log('✅ Main banner rendered');
//     }
//     if (typeof renderCarousel === 'function') {
//         renderCarousel();
//         console.log('✅ Carousel rendered');
//     }
//     if (typeof initializeCarousel === 'function') {
//         initializeCarousel();
//         console.log('✅ Carousel initialized');
//     }
//     if (typeof renderDoctorSection === 'function') {
//         renderDoctorSection(doctorData);
//         console.log('✅ Doctor section rendered');
//     }
//     if (typeof renderArticlesSection === 'function') {
//         renderArticlesSection(articlesData);
//         console.log('✅ Articles section rendered');
//     }
//     if (typeof renderFooter === 'function') {
//         renderFooter(footerData);
//         console.log('✅ Footer rendered');
//     }
//     if (typeof renderSecondaryBanner === 'function') {
//         renderSecondaryBanner();
//         console.log('✅ Secondary banner rendered');
//     }
   
//     // 5. Initialize prescription upload module
//     console.log('🔧 Step 5: Initializing prescription upload module...');
//     initializePrescriptionUpload();
   
//     // 6. Cart system updates
//     console.log('🔧 Step 6: Updating cart system...');
//     if (typeof updateCartCount === 'function') {
//         updateCartCount();
//         console.log('✅ Cart count updated');
//     }
//     if (typeof restoreQuantitySelectors === 'function') {
//         restoreQuantitySelectors();
//         setTimeout(restoreQuantitySelectors, 600);
//         console.log('✅ Quantity selectors restored');
//     }
   
//     console.log('🎉 ========== GOODNEEWZ APPLICATION INITIALIZED SUCCESSFULLY! ==========');
//     console.log('📡 Backend API: http://localhost:8083');
//     console.log('📊 Prescription upload module: READY');
//     console.log('🛒 Cart system: READY');
//     console.log('❤️ Wishlist system: READY');
//     console.log('=============================================');
// });