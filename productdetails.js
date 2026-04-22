// ==================== productdetails.js ====================
// Complete product details page - Add to Cart fully functional

// ========== DUMMY PRODUCT DATABASE (Matches home.html products IDs 40-55) ==========
const PRODUCTS_DB = [
    // Indoor Plants (IDs 40-47)
    { 
        id: 40, name: "Monstera Deliciosa", brand: "GreenNest", category: "Indoor Plants", subCategory: "Foliage Plants",
        description: "The Monstera Deliciosa, also known as the Swiss Cheese Plant, features iconic split leaves that bring a tropical vibe to any space. Easy to care for and fast-growing, it's a favorite among plant enthusiasts.",
        mainImage: "https://picsum.photos/id/117/600/600", subImages: ["https://picsum.photos/id/116/200/200", "https://picsum.photos/id/115/200/200"],
        sizes: ["Small (4\")", "Medium (6\")", "Large (8\")"], prices: [549, 849, 1299], oldPrices: [699, 1099, 1699],
        stock: "In-Stock", quantity: 45, mfgDate: "2024-12-01", batchNo: "GN-MON-001",
        dynamicFields: { form: "Potted Plant", strength: "Rooted Cutting", countryOfOrigin: "India", storage: "Bright indirect light, water weekly", suitableFor: "Living rooms, Offices" },
        benefits: ["Large dramatic leaves create stunning visual impact", "Easy to care for and forgiving of occasional missed watering", "Fast-growing and rewarding to watch new leaves unfurl", "Excellent air-purifying qualities", "Each leaf develops unique hole patterns"],
        ingredients: ["Monstera deliciosa", "Premium potting mix with perlite", "Slow-release fertilizer", "Nursery pot included"]
    },
    { 
        id: 41, name: "Peace Lily Plant", brand: "GreenNest", category: "Indoor Plants", subCategory: "Flowering Plants",
        description: "Peace Lily is a graceful flowering plant that thrives indoors. With its elegant white blooms and glossy dark-green leaves, it adds a calming touch to any space while effectively purifying the air.",
        mainImage: "https://picsum.photos/id/15/600/600", subImages: ["https://picsum.photos/id/14/200/200"],
        sizes: ["Small (4\")", "Medium (6\")"], prices: [349, 549], oldPrices: [449, 699],
        stock: "In-Stock", quantity: 30, mfgDate: "2024-12-05", batchNo: "GN-PL-002",
        dynamicFields: { form: "Potted Plant", strength: "Blooming Stage", countryOfOrigin: "India", storage: "Low to medium indirect light, moist soil", suitableFor: "Bedrooms, Living rooms" },
        benefits: ["One of NASA's top air-purifying plants", "Produces beautiful white flowers throughout the year", "Thrives in low-light conditions", "Reduces humidity and mold spores", "Perfect gift plant for all occasions"],
        ingredients: ["Spathiphyllum wallisii", "Peat moss and perlite potting mix", "Balanced NPK slow-release fertilizer"]
    },
    { 
        id: 42, name: "Golden Pothos Vine", brand: "GreenNest", category: "Indoor Plants", subCategory: "Trailing Plants",
        description: "Golden Pothos is a classic trailing vine with heart-shaped golden-green leaves. It's virtually unkillable and looks stunning in hanging baskets or climbing up a moss pole.",
        mainImage: "https://picsum.photos/id/127/600/600", subImages: [],
        sizes: ["Small (4\")", "Medium (6\")"], prices: [199, 349], oldPrices: [249, 449],
        stock: "In-Stock", quantity: 80, mfgDate: "2024-12-10", batchNo: "GN-PO-003",
        dynamicFields: { form: "Trailing Vine", strength: "Rooted Cutting", countryOfOrigin: "India", storage: "Low to bright indirect light", suitableFor: "Hanging baskets, Shelves" },
        benefits: ["Extremely low maintenance — perfect for beginners", "Grows beautifully in both soil and water", "Trailing habit creates lush green waterfalls", "Survives in low light conditions", "Propagates easily from cuttings"],
        ingredients: ["Epipremnum aureum", "Well-draining potting mix", "Organic fertilizer"]
    },
    { 
        id: 43, name: "Snake Plant (Sansevieria)", brand: "GreenNest", category: "Indoor Plants", subCategory: "Succulents",
        description: "The Snake Plant is virtually indestructible. It releases oxygen at night, making it the perfect bedroom companion. Its striking upright leaves add a modern architectural element.",
        mainImage: "https://picsum.photos/id/100/600/600", subImages: [],
        sizes: ["Small (4\")", "Medium (6\")", "Large (10\")"], prices: [299, 449, 699], oldPrices: [379, 599, 899],
        stock: "In-Stock", quantity: 65, mfgDate: "2024-11-20", batchNo: "GN-SN-004",
        dynamicFields: { form: "Potted Succulent", strength: "Mature Plant", countryOfOrigin: "India", storage: "Any light, water once in 10 days", suitableFor: "Bedrooms, Offices" },
        benefits: ["Releases oxygen at night — ideal for bedrooms", "Extremely drought tolerant", "Filters air pollutants including CO2", "Grows in any light condition", "Long-lived plant"],
        ingredients: ["Sansevieria trifasciata", "Well-draining sandy loam mix", "Slow-release fertilizer"]
    },
    { 
        id: 44, name: "Fiddle Leaf Fig", brand: "GreenNest", category: "Indoor Plants", subCategory: "Statement Plants",
        description: "The Fiddle Leaf Fig is a showstopper with its large, violin-shaped leaves. It's the ultimate statement plant for modern interiors and can grow into an impressive indoor tree.",
        mainImage: "https://picsum.photos/id/125/600/600", subImages: [],
        sizes: ["Medium (8\")", "Large (12\")"], prices: [799, 1299], oldPrices: [999, 1699],
        stock: "In-Stock", quantity: 20, mfgDate: "2024-11-15", batchNo: "GN-FL-005",
        dynamicFields: { form: "Indoor Tree", strength: "Young Plant", countryOfOrigin: "India", storage: "Bright indirect light, consistent watering", suitableFor: "Living rooms, Entryways" },
        benefits: ["Dramatic large leaves create instant focal point", "Adds height and structure to any room", "Known to boost mood and productivity", "Long-lasting with proper care", "Makes for an impressive housewarming gift"],
        ingredients: ["Ficus lyrata", "Rich organic potting mix", "Controlled-release fertilizer"]
    },
    { 
        id: 45, name: "ZZ Plant", brand: "GreenNest", category: "Indoor Plants", subCategory: "Air Purifying",
        description: "The ZZ Plant is the ultimate low-maintenance houseplant. Its waxy, dark-green leaves shine beautifully and it can survive weeks without water or sunlight.",
        mainImage: "https://picsum.photos/id/92/600/600", subImages: [],
        sizes: ["Small (4\")", "Medium (6\")"], prices: [399, 599], oldPrices: [499, 799],
        stock: "In-Stock", quantity: 40, mfgDate: "2024-12-01", batchNo: "GN-ZZ-006",
        dynamicFields: { form: "Potted Plant", strength: "Established Rhizome", countryOfOrigin: "India", storage: "Low to bright indirect light, drought tolerant", suitableFor: "Offices, Dark corners" },
        benefits: ["Virtually indestructible — survives neglect", "Glossy leaves stay dust-free naturally", "Stores water in rhizomes", "Proven air purifier", "Slow-growing and compact"],
        ingredients: ["Zamioculcas zamiifolia", "Well-aerated cocopeat blend", "Slow-release fertilizer"]
    },
    { 
        id: 46, name: "Spider Plant", brand: "GreenNest", category: "Indoor Plants", subCategory: "Hanging Plants",
        description: "The Spider Plant is one of the easiest houseplants to grow. Its arching leaves and baby plantlets make it a charming addition to any room.",
        mainImage: "https://picsum.photos/id/104/600/600", subImages: [],
        sizes: ["Small (4\")", "Medium (6\")"], prices: [179, 299], oldPrices: [229, 379],
        stock: "In-Stock", quantity: 55, mfgDate: "2024-12-05", batchNo: "GN-SP-007",
        dynamicFields: { form: "Potted Plant", strength: "Mature with Babies", countryOfOrigin: "India", storage: "Bright indirect light", suitableFor: "Hanging baskets" },
        benefits: ["Produces adorable baby plantlets", "Excellent air purifier", "Very easy to propagate", "Pet-friendly plant", "Thrives with neglect"],
        ingredients: ["Chlorophytum comosum", "Well-draining potting mix", "Slow-release fertilizer"]
    },
    { 
        id: 47, name: "Rubber Plant (Ficus)", brand: "GreenNest", category: "Indoor Plants", subCategory: "Foliage Plants",
        description: "The Rubber Plant is a bold, statement-making houseplant with its large, glossy dark-green leaves. It's a fast grower and can become a stunning indoor tree.",
        mainImage: "https://picsum.photos/id/98/600/600", subImages: [],
        sizes: ["Small (4\")", "Medium (8\")"], prices: [449, 799], oldPrices: [549, 999],
        stock: "In-Stock", quantity: 25, mfgDate: "2024-11-20", batchNo: "GN-RB-008",
        dynamicFields: { form: "Indoor Tree", strength: "Young Plant", countryOfOrigin: "India", storage: "Bright indirect light", suitableFor: "Living rooms" },
        benefits: ["Bold tropical foliage", "Efficient air purifier", "Fast growing", "Low water requirement", "Available in burgundy variety"],
        ingredients: ["Ficus elastica", "Nutrient-rich loam mix", "Mycorrhizal fungi"]
    },
    // Garden Essentials (IDs 48-55)
    { 
        id: 48, name: "Terracotta Pot Set (3pcs)", brand: "GreenNest Essentials", category: "Garden Essentials", subCategory: "Planters",
        description: "Classic terracotta pots that are perfect for all plants. The porous clay allows roots to breathe and prevents overwatering. Set includes 3 sizes: 4\", 6\", and 8\".",
        mainImage: "https://picsum.photos/id/96/600/600", subImages: [],
        sizes: ["Set of 3"], prices: [349], oldPrices: [449],
        stock: "In-Stock", quantity: 100, mfgDate: "2024-12-01", batchNo: "GN-POT-001",
        dynamicFields: { form: "Pot Set", strength: "Premium Quality", countryOfOrigin: "India", storage: "Store in dry place", suitableFor: "All plant types" },
        benefits: ["Breathable clay prevents root rot", "Classic aesthetic suits any decor", "Includes matching saucers", "Durable and long-lasting", "Eco-friendly natural material"],
        ingredients: ["Natural terracotta clay", "Fired at high temperature", "Drainage hole included"]
    },
    { 
        id: 49, name: "Ceramic Self-Watering Pot", brand: "GreenNest Essentials", category: "Garden Essentials", subCategory: "Planters",
        description: "Modern self-watering ceramic pot with water reservoir. Keeps plants hydrated for up to 2 weeks. Perfect for busy plant parents.",
        mainImage: "https://picsum.photos/id/20/600/600", subImages: [],
        sizes: ["Medium (6\")", "Large (8\")"], prices: [599, 899], oldPrices: [749, 1099],
        stock: "In-Stock", quantity: 50, mfgDate: "2024-12-10", batchNo: "GN-POT-002",
        dynamicFields: { form: "Self-Watering Pot", strength: "Premium Ceramic", countryOfOrigin: "India", storage: "Indoor use", suitableFor: "Busy plant owners" },
        benefits: ["Water reservoir lasts 2 weeks", "Prevents overwatering", "Modern design", "Glazed finish easy to clean", "Comes with water level indicator"],
        ingredients: ["Ceramic", "Cotton wick", "Plastic reservoir"]
    },
    { 
        id: 50, name: "Premium Potting Mix (5kg)", brand: "GreenNest Essentials", category: "Garden Essentials", subCategory: "Soil",
        description: "Our premium potting mix is specially formulated for indoor and outdoor plants. Contains cocopeat, perlite, vermicompost, and neem cake for optimal plant growth.",
        mainImage: "https://picsum.photos/id/104/600/600", subImages: [],
        sizes: ["5kg Bag"], prices: [249], oldPrices: [319],
        stock: "In-Stock", quantity: 200, mfgDate: "2024-12-10", batchNo: "GN-SOIL-001",
        dynamicFields: { form: "Potting Mix", strength: "Premium Grade", countryOfOrigin: "India", storage: "Cool dry place", suitableFor: "All indoor and outdoor plants" },
        benefits: ["Lightweight and well-draining", "Enriched with essential nutrients", "pH balanced for optimal growth", "Contains neem cake for pest control", "Ready to use straight from bag"],
        ingredients: ["Cocopeat", "Perlite", "Vermicompost", "Neem cake", "Slow-release fertilizers"]
    },
    { 
        id: 51, name: "Organic Fertilizer Granules", brand: "GreenNest Essentials", category: "Garden Essentials", subCategory: "Fertilizers",
        description: "100% organic fertilizer granules made from neem cake, bone meal, and seaweed extract. Promotes healthy root development and lush foliage.",
        mainImage: "https://picsum.photos/id/97/600/600", subImages: [],
        sizes: ["1kg Pack"], prices: [199], oldPrices: [249],
        stock: "In-Stock", quantity: 150, mfgDate: "2024-11-25", batchNo: "GN-FERT-001",
        dynamicFields: { form: "Granules", strength: "Organic", countryOfOrigin: "India", storage: "Keep sealed in cool place", suitableFor: "All plants" },
        benefits: ["100% organic and chemical-free", "Slow-release formula feeds for months", "Improves soil structure", "Promotes flowering and fruiting", "Safe for pets and children"],
        ingredients: ["Neem cake powder", "Bone meal", "Seaweed extract", "Humic acid"]
    },
    { 
        id: 52, name: "Garden Hand Tool Set", brand: "GreenNest Essentials", category: "Garden Essentials", subCategory: "Tools",
        description: "Complete 5-piece garden tool set including trowel, transplanting trowel, cultivator, weeder, and pruning shears. Ergonomic handles with rust-resistant steel.",
        mainImage: "https://picsum.photos/id/26/600/600", subImages: [],
        sizes: ["5-Piece Set"], prices: [449], oldPrices: [599],
        stock: "In-Stock", quantity: 75, mfgDate: "2024-12-01", batchNo: "GN-TOOL-001",
        dynamicFields: { form: "Tool Set", strength: "Heavy Duty", countryOfOrigin: "India", storage: "Store in dry place", suitableFor: "All gardening tasks" },
        benefits: ["Complete set for all gardening needs", "Ergonomic non-slip handles", "Rust-resistant stainless steel", "Includes storage bag", "Lifetime warranty"],
        ingredients: ["Stainless steel", "Rubber grip", "Oxford cloth bag"]
    },
    { 
        id: 53, name: "Hanging Macramé Planter", brand: "GreenNest Essentials", category: "Garden Essentials", subCategory: "Planters",
        description: "Beautiful handcrafted macramé plant hanger. Perfect for displaying trailing plants like pothos, string of pearls, or ferns. Fits standard 6-inch pots.",
        mainImage: "https://picsum.photos/id/30/600/600", subImages: [],
        sizes: ["One Size"], prices: [299], oldPrices: [399],
        stock: "In-Stock", quantity: 60, mfgDate: "2024-12-05", batchNo: "GN-MAC-001",
        dynamicFields: { form: "Hanging Planter", strength: "Handmade", countryOfOrigin: "India", storage: "Indoor/Outdoor use", suitableFor: "Hanging plants" },
        benefits: ["Handcrafted by local artisans", "Supports up to 5kg weight", "Bohemian style decor", "Adjustable hanging length", "Comes with wooden ring"],
        ingredients: ["Cotton cord", "Wooden beads", "Metal ring"]
    },
    { 
        id: 54, name: "Plant Grow Light LED", brand: "GreenNest Essentials", category: "Garden Essentials", subCategory: "Accessories",
        description: "Full spectrum LED grow light with adjustable gooseneck. Perfect for indoor plants in low-light conditions. Promotes healthy growth and flowering.",
        mainImage: "https://picsum.photos/id/13/600/600", subImages: [],
        sizes: ["15W", "30W"], prices: [899, 1299], oldPrices: [1199, 1699],
        stock: "In-Stock", quantity: 40, mfgDate: "2024-11-20", batchNo: "GN-LIGHT-001",
        dynamicFields: { form: "Grow Light", strength: "Full Spectrum", countryOfOrigin: "China", storage: "Indoor use", suitableFor: "Low light areas" },
        benefits: ["Full spectrum mimics natural sunlight", "Adjustable gooseneck for perfect positioning", "Energy-efficient LED", "Timer function available", "Clamp-on design no drilling needed"],
        ingredients: ["LED chips", "Aluminum body", "Plastic clamp"]
    },
    { 
        id: 55, name: "Succulent & Cactus Mix Kit", brand: "GreenNest Essentials", category: "Garden Essentials", subCategory: "Starter Kits",
        description: "Complete starter kit for succulent lovers. Includes 1kg fast-draining soil mix, 3 terracotta pots, decorative pebbles, and care guide.",
        mainImage: "https://picsum.photos/id/88/600/600", subImages: [],
        sizes: ["Complete Kit"], prices: [349], oldPrices: [449],
        stock: "In-Stock", quantity: 85, mfgDate: "2024-12-01", batchNo: "GN-KIT-001",
        dynamicFields: { form: "Starter Kit", strength: "Complete Set", countryOfOrigin: "India", storage: "Ready to use", suitableFor: "Succulent beginners" },
        benefits: ["Everything you need in one box", "Perfect for beginners", "Includes decorative pebbles", "Detailed care instructions", "Makes a great gift"],
        ingredients: ["Cactus soil mix", "Terracotta pots", "Decorative stones", "Care booklet"]
    }
];

// ========== GLOBAL VARIABLES ==========
let currentProduct = null;
let selectedVariantIndex = 0;

// ========== UTILITY FUNCTIONS ==========
function showToast(message, type = "success") {
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type === 'success' ? 'bg-green-700' : 'bg-red-600'} text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-leaf' : 'fa-times-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 2500);
}

function updateCartCount() {
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch(e) { cart = []; }
    const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    ['desktop-cart-count', 'mobile-cart-count'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = total; el.style.display = total > 0 ? 'flex' : 'none'; }
    });
}

// ========== ADD TO CART FUNCTION - FULLY WORKING ==========
function addToCartLocal(product, qty = 1) {
    console.log('[DEBUG] Adding to cart:', product.name, 'Quantity:', qty, 'Size:', product.selectedSize);
    
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('cart') || '[]');
    } catch(e) {
        cart = [];
    }
    
    const existingIndex = cart.findIndex(item => item.id === product.id && item.selectedSize === (product.selectedSize || ''));
    
    if (existingIndex !== -1) {
        const newQty = cart[existingIndex].quantity + qty;
        if (newQty > 10) {
            showToast('Max 10 items allowed per product!', 'error');
            return false;
        }
        cart[existingIndex].quantity = newQty;
        console.log('[DEBUG] Updated existing item quantity to:', newQty);
    } else {
        const cartItem = { 
            id: product.id, 
            name: product.name, 
            price: Number(product.selectedPrice), 
            image: product.mainImage, 
            quantity: qty, 
            brand: product.brand || 'GreenNest', 
            selectedSize: product.selectedSize || '',
            originalPrice: product.oldPrices ? product.oldPrices[selectedVariantIndex] : null
        };
        cart.push(cartItem);
        console.log('[DEBUG] Added new item:', cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`🌿 ${qty} ${product.name} added to basket!`, 'success');
    return true;
}

// ========== WISHLIST FUNCTIONS ==========
function getWishlistFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch(e) {
        return [];
    }
}

function isInWishlistLocal(productId) { 
    return getWishlistFromStorage().some(p => p.id === productId); 
}

function toggleWishlistLocal(product) {
    let wishlist = getWishlistFromStorage();
    const exists = wishlist.some(p => p.id === product.id);
    
    if (exists) { 
        wishlist = wishlist.filter(p => p.id !== product.id); 
        showToast('💔 Removed from wishlist', 'error'); 
    } else { 
        wishlist.push({ 
            id: product.id, 
            name: product.name, 
            price: product.selectedPrice, 
            originalPrice: product.oldPrices ? product.oldPrices[selectedVariantIndex] : null,
            image: product.mainImage,
            brand: product.brand,
            selectedSize: product.selectedSize
        }); 
        showToast('💚 Added to wishlist!', 'success'); 
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistButton();
}

function updateWishlistButton() {
    const btn = document.getElementById('wishlist-btn'); 
    if (!btn || !currentProduct) return;
    const icon = btn.querySelector('i');
    const isWished = isInWishlistLocal(currentProduct.id);
    icon.className = isWished ? 'fas fa-heart text-xl text-red-500' : 'far fa-heart text-xl';
    btn.title = isWished ? 'Remove from wishlist' : 'Add to wishlist';
    btn.onclick = (e) => {
        e.preventDefault();
        btn.classList.add('heart-pop'); 
        setTimeout(() => btn.classList.remove('heart-pop'), 300); 
        toggleWishlistLocal(currentProduct); 
    };
}

// ========== PRICE & VARIANT FUNCTIONS ==========
function updatePriceDisplay() {
    const variant = currentProduct.variants[selectedVariantIndex];
    document.getElementById('selling-price').textContent = `₹${variant.price}`;
    document.getElementById('mrp-price').textContent = `₹${variant.oldPrice}`;
    const discountBadge = document.getElementById('discount-badge');
    const lineThrough = document.querySelector('.line-through');
    if (variant.oldPrice > variant.price) { 
        discountBadge.classList.remove('hidden'); 
        discountBadge.textContent = `${variant.discount}% OFF`; 
        lineThrough?.classList.remove('hidden'); 
    } else { 
        discountBadge.classList.add('hidden'); 
        lineThrough?.classList.add('hidden'); 
    }
    document.getElementById('product-unit').textContent = variant.size;
    currentProduct.selectedPrice = variant.price; 
    currentProduct.selectedSize = variant.size;
}

window.selectVariant = function(index) {
    selectedVariantIndex = index; 
    updatePriceDisplay();
    document.querySelectorAll('#variant-selector-container button').forEach((btn, i) => { 
        btn.style.borderColor = i === index ? '#40916c' : '#d1d5db'; 
        btn.style.background = i === index ? '#d8f3dc' : 'white'; 
    });
};

function renderVariantSelector() {
    if (!currentProduct.variants || currentProduct.variants.length <= 1) return;
    let html = `<label class="block text-sm font-semibold mb-2" style="color:var(--green-dark);"><i class="fas fa-ruler mr-1"></i> Select Size:</label><div class="flex flex-wrap gap-3">`;
    currentProduct.variants.forEach((v, i) => { 
        html += `<button class="px-4 py-2 border-2 rounded-lg text-sm font-semibold transition" onclick="selectVariant(${i})" style="color:var(--green-dark);border-color:${i === 0 ? '#40916c' : '#d1d5db'};background:${i === 0 ? '#d8f3dc' : 'white'};">${v.size} <span style="color:var(--green-mid);font-weight:800;">₹${v.price}</span></button>`; 
    });
    html += `</div>`;
    document.getElementById('variant-selector-container').innerHTML = html;
}

// ========== THUMBNAIL RENDER ==========
function renderThumbnails(mainImage, subImages = []) {
    const container = document.getElementById('thumbnail-container');
    if (!container) return;
    container.innerHTML = '';
    const allImages = [mainImage, ...subImages].filter(Boolean);
    allImages.forEach((src, i) => { 
        const img = document.createElement('img'); 
        img.src = src; 
        img.className = 'w-20 h-20 object-cover border-2 rounded-lg cursor-pointer transition hover:scale-105'; 
        img.style.borderColor = i === 0 ? '#40916c' : '#b7e4c7'; 
        img.onerror = () => img.src = 'https://picsum.photos/id/116/200/200'; 
        img.onclick = () => { 
            document.getElementById('main-product-image').src = src; 
            container.querySelectorAll('img').forEach(t => t.style.borderColor = '#b7e4c7'); 
            img.style.borderColor = '#40916c'; 
        }; 
        container.appendChild(img); 
    });
}

// ========== TAB RENDERERS ==========
function renderSpecsTab() {
    const tbody = document.getElementById('specifications-table-body'); 
    if (!tbody || !currentProduct) return;
    tbody.innerHTML = '';
    const rows = [
        { label: '🌿 Plant Description', value: currentProduct.description },
        { label: '🏷️ Brand', value: currentProduct.brand },
        { label: '🪴 Category', value: currentProduct.subCategory || currentProduct.category },
        { label: '📅 Packed Date', value: currentProduct.mfgDate },
        { label: '📦 Available Stock', value: currentProduct.quantity + ' units' },
        { label: '🔖 Batch No.', value: currentProduct.batchNo },
        { label: '🌱 Plant Form', value: currentProduct.dynamicFields?.form },
        { label: '📏 Size/Stage', value: currentProduct.dynamicFields?.strength },
        { label: '🌍 Country of Origin', value: currentProduct.dynamicFields?.countryOfOrigin || 'India' },
        { label: '☀️ Care Instructions', value: currentProduct.dynamicFields?.storage },
        { label: '👤 Suitable For', value: currentProduct.dynamicFields?.suitableFor }
    ];
    rows.forEach((r) => { 
        if (r.value && String(r.value).trim()) { 
            tbody.innerHTML += `<tr><td class="spec-label py-3 px-6 border-b" style="border-color:#d8f3dc;"><span style="color:#2d6a4f;font-weight:600;">${r.label}</span></td><td class="spec-value py-3 px-6 border-b text-gray-600" style="border-color:#d8f3dc;">${r.value}</td></tr>`; 
        } 
    });
}

function renderBenefitsTab() {
    const el = document.getElementById('benefits-content'); 
    if (!el || !currentProduct) return;
    const list = currentProduct.benefits || [];
    el.innerHTML = `<div class="py-8"><h3 class="text-xl font-bold mb-6" style="font-family:'Playfair Display',serif;color:#1b3a2d;">🌟 Key Benefits</h3><div class="rounded-xl p-6" style="background:#f7fdf9;border:1px solid #b7e4c7;"><ul class="space-y-4">${list.map(b => `<li class="flex items-start gap-3"><span class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style="background:#d8f3dc;"><i class="fas fa-leaf text-sm" style="color:#2d6a4f;"></i></span><span class="text-gray-700">${b}</span></li>`).join('')}</ul></div></div>`;
}

function renderIngredientsTab() {
    const el = document.getElementById('ingredients-content'); 
    if (!el || !currentProduct) return;
    const list = currentProduct.ingredients || [];
    el.innerHTML = `<div class="py-8"><h3 class="text-xl font-bold mb-6" style="font-family:'Playfair Display',serif;color:#1b3a2d;">🌱 Plant Composition</h3><div class="rounded-xl p-6" style="background:#f7fdf9;border:1px solid #b7e4c7;"><ul class="space-y-3">${list.map((ing, i) => `<li class="flex items-start gap-3"><span class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold" style="background:#d8f3dc;color:#2d6a4f;">${i + 1}</span><span class="text-gray-700">${ing}</span></li>`).join('')}</ul></div></div>`;
}

// ========== RELATED PRODUCTS ==========
function renderRelatedProducts() {
    const container = document.getElementById('related-products-container'); 
    if (!container || !currentProduct) return;
    let related = PRODUCTS_DB.filter(p => p.id !== currentProduct.id && p.category === currentProduct.category).slice(0, 4);
    if (related.length < 4) { 
        related.push(...PRODUCTS_DB.filter(p => p.id !== currentProduct.id && p.category !== currentProduct.category).slice(0, 4 - related.length)); 
    }
    container.innerHTML = related.map(p => `<div class="related-card bg-white rounded-2xl p-4 cursor-pointer" onclick="window.location.href='productdetails.html?id=${p.id}'"><div class="overflow-hidden rounded-xl mb-3" style="background:#f7fdf9;"><img src="${p.mainImage}" onerror="this.src='https://picsum.photos/id/116/400/400'" class="w-full h-36 object-cover transition hover:scale-105"></div><h4 class="font-semibold text-sm line-clamp-2 mb-1" style="color:#1b3a2d;">${p.name}</h4><p class="text-xs mb-2" style="color:#40916c;">${p.brand}</p><div class="flex items-center gap-2 mt-1 mb-3"><span class="text-base font-bold" style="color:#2d6a4f;">₹${p.prices[0]}</span>${p.oldPrices[0] > p.prices[0] ? `<span class="text-xs text-gray-400 line-through">₹${p.oldPrices[0]}</span><span class="text-xs font-bold" style="color:#c0392b;">${Math.round(((p.oldPrices[0]-p.prices[0])/p.oldPrices[0])*100)}% OFF</span>` : ''}</div><button class="w-full text-white py-2 rounded-lg text-sm font-semibold transition" style="background:linear-gradient(135deg,#1b3a2d,#2d6a4f);">🪴 View Plant</button></div>`).join('');
}

// ========== PINCODE CHECKER ==========
function setupPincodeChecker() {
    const pincodeInput = document.getElementById('pincodeInput'), checkBtn = document.getElementById('checkPincodeBtn');
    if (!pincodeInput || !checkBtn) return;
    const allowedAreas = ['415523', '415528', '415537'];
    checkBtn.onclick = () => {
        const pincode = pincodeInput.value.trim();
        const resultDiv = document.getElementById('deliveryResult'), successDiv = document.getElementById('deliverySuccess'), errorDiv = document.getElementById('deliveryError'), locationText = document.getElementById('deliveryLocation');
        resultDiv.classList.remove('hidden');
        if (allowedAreas.includes(pincode)) { 
            successDiv.classList.remove('hidden'); 
            errorDiv.classList.add('hidden'); 
            locationText.textContent = `Phaltan, Satara - ${pincode}`; 
            showToast('🌿 Delivery available! Free Delivery', 'success'); 
        } else { 
            successDiv.classList.add('hidden'); 
            errorDiv.classList.remove('hidden'); 
            showToast('Delivery not available for this pincode', 'error'); 
        }
    };
}

// ========== SHARE FUNCTIONS ==========
function setupShareButtons() {
    const shareBtn = document.getElementById('share-btn');
    const overlay = document.getElementById('share-overlay');
    if (shareBtn) { shareBtn.onclick = () => overlay.classList.remove('hidden'); }
    document.getElementById('share-wa')?.addEventListener('click', () => {
        const name = document.getElementById('product-name').textContent, price = document.getElementById('selling-price').textContent, url = window.location.href;
        window.open(`https://wa.me/?text=${encodeURIComponent(`🌿 ${name}\n${price}\n\nCheck out this plant!\n🔗 ${url}`)}`, '_blank');
    });
    document.getElementById('share-email')?.addEventListener('click', () => {
        const name = document.getElementById('product-name').textContent, price = document.getElementById('selling-price').textContent, url = window.location.href;
        window.location.href = `mailto:?subject=${encodeURIComponent(`${name} - Only ${price} on GreenNest!`)}&body=${encodeURIComponent(`Check out this plant: ${url}`)}`;
    });
    document.getElementById('share-copy')?.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        const fb = document.getElementById('copy-feedback');
        fb.classList.remove('hidden');
        setTimeout(() => fb.classList.add('hidden'), 2000);
    });
}

// ========== REMOVE SKELETON ==========
function removeSkeleton() {
    document.querySelectorAll('.skeleton').forEach(el => {
        el.classList.remove('skeleton');
        el.style.background = '';
        el.style.animation = '';
    });
}

// ========== MAIN LOAD FUNCTION ==========
function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));
    const product = PRODUCTS_DB.find(p => p.id === productId);
    
    if (!product) { 
        document.getElementById('product-name').textContent = 'Plant Not Found'; 
        document.getElementById('main-product-image').src = 'https://picsum.photos/id/20/600/600';
        removeSkeleton();
        return; 
    }
    
    // Build variants array
    product.variants = product.sizes.map((size, i) => ({ 
        size, price: product.prices[i] || 0, oldPrice: product.oldPrices[i] || 0, 
        discount: product.oldPrices[i] > product.prices[i] ? Math.round(((product.oldPrices[i] - product.prices[i]) / product.oldPrices[i]) * 100) : 0 
    }));
    product.selectedPrice = product.variants[0]?.price || 0;
    product.selectedSize = product.variants[0]?.size || '';
    currentProduct = product;
    
    // Populate DOM
    document.getElementById('product-name').textContent = product.name;
    document.title = `${product.name} — GreenNest Nursery`;
    const mainImg = document.getElementById('main-product-image');
    mainImg.src = product.mainImage;
    mainImg.onerror = () => mainImg.src = 'https://picsum.photos/id/116/600/600';
    
    renderThumbnails(product.mainImage, product.subImages || []);
    renderVariantSelector();
    updatePriceDisplay();
    renderSpecsTab();
    renderBenefitsTab();
    renderIngredientsTab();
    updateWishlistButton();
    renderRelatedProducts();
    setupPincodeChecker();
    setupShareButtons();
    
    // Setup Add to Cart button
    const addBtn = document.getElementById('add-to-cart-btn');
    const buyBtn = document.getElementById('buy-now-btn');
    const qtyInput = document.getElementById('quantity-input');
    
    if (addBtn) {
        addBtn.onclick = function(e) {
            e.preventDefault();
            const qty = parseInt(qtyInput?.value) || 1;
            addToCartLocal(currentProduct, qty);
        };
    }
    
    if (buyBtn) {
        buyBtn.onclick = function(e) {
            e.preventDefault();
            const qty = parseInt(qtyInput?.value) || 1;
            addToCartLocal(currentProduct, qty);
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 500);
        };
    }
    
    updateCartCount();
    removeSkeleton();
}

// ========== TAB SWITCHER ==========
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

// ========== QUANTITY CONTROLS ==========
function initQuantitySelector() {
    const dec = document.getElementById('decrease-qty');
    const inc = document.getElementById('increase-qty');
    const input = document.getElementById('quantity-input');
    
    if (!dec || !inc || !input) return;
    
    dec.onclick = function() { 
        let val = parseInt(input.value);
        if (val > 1) input.value = val - 1;
    };
    
    inc.onclick = function() { 
        let val = parseInt(input.value);
        if (val < 10) input.value = val + 1;
    };
    
    input.onchange = function() { 
        let v = parseInt(input.value); 
        if (isNaN(v) || v < 1) v = 1; 
        if (v > 10) v = 10; 
        input.value = v; 
    };
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => { 
    initTabs(); 
    initQuantitySelector(); 
    loadProduct(); 
});

// Listen for storage events to sync cart across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        updateCartCount();
    }
    if (e.key === 'wishlist') {
        updateWishlistButton();
    }
});

// Global helper for navigation
window.viewPlant = (id) => window.location.href = `productdetails.html?id=${id}`;

console.log('[DEBUG] productdetails.js loaded - Add to Cart is FULLY WORKING!');