// Translation dictionary
const translations = {
  english: {
    enterPinCode: "Select Pincode:",
    about: "About Us",
    chevron: "▼",
    contact: "Contact Us",
    wishlist: "Wishlist",
    cart: "Cart",
    profile: "Account",
    signupLogin: "Sign Up / Login",
    orders: "Orders",
    logout: "Logout",
    home: "Home",
    indoorPlants: "Indoor Plants",
    lowLight: "Low Light",
    airPurifying: "Air Purifying",
    desk: "Desk Plants",
    hanging: "Hanging Plants",
    outdoorPlants: "Outdoor Plants",
    flowering: "Flowering",
    fruit: "Fruit Plants",
    trees: "Trees",
    hedges: "Hedges",
    herbsVeg: "Herbs & Vegetables",
    culinary: "Culinary Herbs",
    medicinal: "Medicinal",
    saplings: "Veg Saplings",
    succulents: "Succulents & Cacti",
    indoorSucc: "Indoor",
    outdoorSucc: "Outdoor",
    rare: "Rare",
    seeds: "Seeds & Bulbs",
    flowerSeeds: "Flower Seeds",
    vegSeeds: "Veg Seeds",
    herbSeeds: "Herb Seeds",
    bulbs: "Bulbs",
    pots: "Planters & Pots",
    plastic: "Plastic",
    ceramic: "Ceramic",
    hangingPots: "Hanging",
    selfWatering: "Self-Watering",
    tools: "Tools & Fertilizers",
    toolsItem: "Tools",
    soil: "Soil & Compost",
    fertilizers: "Fertilizers",
    giftHampers: "Gift Hampers",
    combos: "Combos",
    office: "Office Plants",
    terrace: "Terrace Garden",
    lowMaintenance: "Low Maintenance",
    pincodeSuccess: "Pin Code selected:",
    invalidPincode: "Please enter a valid 6-digit pin code."
  },
  hindi: {
    enterPinCode: "पिनकोड चुनें:",
    about: "हमारे बारे में",
    chevron: "▼",
    contact: "संपर्क करें",
    wishlist: "इच्छा सूची",
    cart: "कार्ट",
    profile: "खाता",
    signupLogin: "साइन अप / लॉगिन",
    orders: "ऑर्डर",
    logout: "लॉगआउट",
    home: "होम",
    indoorPlants: "इनडोर पौधे",
    lowLight: "कम रोशनी वाले",
    airPurifying: "वायु शुद्ध करने वाले",
    desk: "डेस्क पौधे",
    hanging: "लटकते पौधे",
    outdoorPlants: "आउटडोर पौधे",
    flowering: "फूलदार",
    fruit: "फलदार पौधे",
    trees: "पेड़",
    hedges: "झाड़ियाँ",
    herbsVeg: "जड़ी-बूटियाँ और सब्जियाँ",
    culinary: "पाक जड़ी-बूटियाँ",
    medicinal: "औषधीय",
    saplings: "सब्जी के पौधे",
    succulents: "रसीले पौधे और कैक्टस",
    indoorSucc: "इनडोर",
    outdoorSucc: "आउटडोर",
    rare: "दुर्लभ",
    seeds: "बीज और कंद",
    flowerSeeds: "फूलों के बीज",
    vegSeeds: "सब्जियों के बीज",
    herbSeeds: "जड़ी-बूटी के बीज",
    bulbs: "कंद",
    pots: "गमले और प्लांटर",
    plastic: "प्लास्टिक",
    ceramic: "सिरेमिक",
    hangingPots: "लटकते",
    selfWatering: "स्वयं सिंचाई",
    tools: "उपकरण और खाद",
    toolsItem: "उपकरण",
    soil: "मिट्टी और कम्पोस्ट",
    fertilizers: "उर्वरक",
    giftHampers: "उपहार हैम्पर",
    combos: "कॉम्बो",
    office: "ऑफिस पौधे",
    terrace: "छत बगीचा",
    lowMaintenance: "कम देखभाल",
    pincodeSuccess: "पिनकोड चुना गया:",
    invalidPincode: "कृपया 6 अंकों का वैध पिनकोड डालें।"
  },
  marathi: {
    enterPinCode: "पिनकोड निवडा:",
    about: "आमच्याबद्दल",
    chevron: "▼",
    contact: "संपर्क करा",
    wishlist: "इच्छा यादी",
    cart: "कार्ट",
    profile: "खाते",
    signupLogin: "साइन अप / लॉगिन",
    orders: "ऑर्डर",
    logout: "लॉगआउट",
    home: "होम",
    indoorPlants: "इनडोर वनस्पती",
    lowLight: "कम प्रकाश",
    airPurifying: "हवा शुद्ध करणारे",
    desk: "डेस्क वनस्पती",
    hanging: "लटकणारी",
    outdoorPlants: "आउटडोर वनस्पती",
    flowering: "फुलझाडे",
    fruit: "फळझाडे",
    trees: "झाडे",
    hedges: "हिरव्या कुंपणासाठी",
    herbsVeg: "औषधी वनस्पती आणि भाज्या",
    culinary: "स्वयंपाकघरातील वनस्पती",
    medicinal: "औषधी",
    saplings: "भाजीपाला रोपे",
    succulents: "रसाळ वनस्पती आणि कॅक्टस",
    indoorSucc: "इनडोर",
    outdoorSucc: "आउटडोर",
    rare: "दुर्मिळ",
    seeds: "बिया आणि कंद",
    flowerSeeds: "फुलांच्या बिया",
    vegSeeds: "भाजीपाला बिया",
    herbSeeds: "औषधी वनस्पती बिया",
    bulbs: "कंद",
    pots: "कुंडी आणि प्लांटर",
    plastic: "प्लास्टिक",
    ceramic: "सिरेमिक",
    hangingPots: "लटकणारी",
    selfWatering: "स्वतः पाणी देणारी",
    tools: "साधने आणि खते",
    toolsItem: "साधने",
    soil: "माती आणि कम्पोस्ट",
    fertilizers: "खते",
    giftHampers: "गिफ्ट हैम्पर",
    combos: "कॉम्बो",
    office: "ऑफिस वनस्पती",
    terrace: "टेरेस गार्डन",
    lowMaintenance: "कमी काळजी",
    pincodeSuccess: "पिनकोड निवडला:",
    invalidPincode: "कृपया 6 अंकांचा वैध पिनकोड टाका."
  }
};

// List of invalid pincodes (common patterns that aren't real pincodes)
const invalidPincodes = [
  '000000', '111111', '222222', '333333', '444444', '555555',
  '666666', '777777', '888888', '999999', '123456', '654321',
  '012345', '543210', '111222', '222333', '333444', '444555',
  '555666', '666777', '777888', '888999', '999000', '000111'
];

// PINCODE VALIDATION FUNCTIONS
function isValidPincode(pin) {
  if (!/^\d{6}$/.test(pin)) {
    return { valid: false, message: "Please enter exactly 6 digits" };
  }
  if (invalidPincodes.includes(pin)) {
    return { valid: false, message: "This is not a valid Indian pincode" };
  }
  if (/^(\d)\1{5}$/.test(pin)) {
    return { valid: false, message: "Invalid pincode pattern" };
  }
  const isSequential = (str) => {
    const nums = str.split('').map(Number);
    const ascending  = nums.every((num, i) => i === 0 || num === nums[i-1] + 1);
    const descending = nums.every((num, i) => i === 0 || num === nums[i-1] - 1);
    return ascending || descending;
  };
  if (isSequential(pin)) {
    return { valid: false, message: "Invalid pincode pattern" };
  }
  const firstDigit = parseInt(pin[0]);
  if (firstDigit < 1 || firstDigit > 8) {
    return { valid: false, message: "Invalid Indian pincode. First digit should be 1-8" };
  }
  return { valid: true, message: "Valid pincode" };
}

// PINCODE FUNCTIONS
function openPincodeModal() {
  const modal = document.getElementById('pincode-modal');
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('show'), 10);
  document.getElementById('modal-pincode-input').focus();
}

function closePincodeModal() {
  const modal = document.getElementById('pincode-modal');
  modal.classList.remove('show');
  setTimeout(() => modal.classList.add('hidden'), 300);
}

function validateAndSavePincode() {
  const input     = document.getElementById('modal-pincode-input');
  const pin       = input.value.trim();
  const error     = document.getElementById('pincode-error');
  const success   = document.getElementById('pincode-success');
  const successPin = document.getElementById('success-pin');
  const checkBtn  = document.getElementById('check-pincode-btn');
  const displayPins = document.querySelectorAll('#display-pincode, #mobile-display-pincode');

  error.classList.add('hidden');
  success.classList.add('hidden');
  input.classList.remove('pincode-validating', 'pincode-invalid');

  input.classList.add('pincode-validating');
  checkBtn.disabled = true;
  checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Checking...';

  setTimeout(() => {
    input.classList.remove('pincode-validating');
    checkBtn.disabled = false;
    checkBtn.textContent = 'Check';

    const validation = isValidPincode(pin);

    if (!validation.valid) {
      error.textContent = validation.message;
      error.classList.remove('hidden');
      input.classList.add('pincode-invalid');
      input.focus();
      input.select();
      return;
    }

    localStorage.setItem('savedPincode', pin);
    displayPins.forEach(el => el.textContent = pin);
    successPin.textContent = pin;
    success.classList.remove('hidden');
    document.getElementById('delivery-info').classList.remove('hidden');
    input.classList.remove('pincode-invalid');

    setTimeout(() => {
      closePincodeModal();
      showNotification(`🌱 Delivery available in ${pin}! Plants arrive in 3-5 days.`);
    }, 1500);

  }, 800);
}

function loadSavedPincode() {
  const saved = localStorage.getItem('savedPincode');
  if (saved) {
    const validation = isValidPincode(saved);
    if (validation.valid) {
      document.querySelectorAll('#display-pincode, #mobile-display-pincode').forEach(el => el.textContent = saved);
      document.getElementById('delivery-info').classList.remove('hidden');
    } else {
      localStorage.removeItem('savedPincode');
    }
  }
}

function setupPincodeInputValidation() {
  const input = document.getElementById('modal-pincode-input');
  if (input) {
    input.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 6);
      e.target.value = value;

      e.target.classList.remove('pincode-validating', 'pincode-invalid');
      document.getElementById('pincode-error').classList.add('hidden');
      document.getElementById('pincode-success').classList.add('hidden');

      if (value.length === 6) {
        const validation = isValidPincode(value);
        if (!validation.valid) {
          e.target.classList.add('pincode-invalid');
          document.getElementById('pincode-error').textContent = validation.message;
          document.getElementById('pincode-error').classList.remove('hidden');
        }
      }
    });
  }
}

// LANGUAGE FUNCTIONS
function openLanguageModal() {
  const modal = document.getElementById('language-modal');
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('show'), 10);
  updateLanguageCheckmark();
}

function closeLanguageModal() {
  const modal = document.getElementById('language-modal');
  modal.classList.remove('show');
  setTimeout(() => modal.classList.add('hidden'), 300);
}

function updateLanguageCheckmark() {
  const current = localStorage.getItem('selectedLanguage') || 'english';
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const lang = btn.getAttribute('onclick').match(/'(\w+)'/)[1];
    btn.querySelector('i.fa-check').classList.toggle('hidden', lang !== current);
  });
}

function changeLanguage(lang) {
  localStorage.setItem('selectedLanguage', lang);
  translatePage(lang);
  document.getElementById('current-lang').textContent = lang.charAt(0).toUpperCase() + lang.slice(1);
  updateLanguageCheckmark();
  closeLanguageModal();
  showNotification('Language changed');
}

function translatePage(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang]?.[key]) {
      el.textContent = translations[lang][key];
    }
  });
}

// UTILITY FUNCTIONS
function showNotification(msg) {
  const n = document.createElement('div');
  n.textContent = msg;
  n.className = 'fixed top-20 right-4 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse';
  n.style.background = '#40916c';
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

function highlightActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (!href || href.includes('javascript')) return;
    if (path.includes(href.replace(/^\//, ''))) link.classList.add('active');
  });
}

// MAIN INITIALIZATION FUNCTION
function initializeHeader() {
  loadSavedPincode();
  setupPincodeInputValidation();

  const savedLang = localStorage.getItem('selectedLanguage') || 'english';
  document.getElementById('current-lang').textContent = savedLang.charAt(0).toUpperCase() + savedLang.slice(1);
  translatePage(savedLang);

  document.getElementById('pincode-trigger')?.addEventListener('click', openPincodeModal);
  document.getElementById('mobile-pincode-trigger')?.addEventListener('click', openPincodeModal);

  document.getElementById('language-trigger')?.addEventListener('click', openLanguageModal);
  document.getElementById('mobile-language-trigger')?.addEventListener('click', openLanguageModal);

  document.getElementById('check-pincode-btn')?.addEventListener('click', validateAndSavePincode);
  document.getElementById('modal-pincode-input')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') validateAndSavePincode();
  });

  document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
  });

  document.getElementById('mobile-profile-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('mobile-profile-menu').classList.toggle('hidden');
  });

  // Desktop profile dropdown
  const profileBtn  = document.getElementById('profile-btn');
  const profileMenu = document.getElementById('profile-menu');

  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      profileMenu.classList.toggle('show');
    });
    document.addEventListener('click', function() {
      profileMenu.classList.remove('show');
    });
    profileMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  // Mobile dropdowns
  document.querySelectorAll('.mobile-dropdown button').forEach(btn => {
    btn.addEventListener('click', function() {
      this.parentElement.querySelector('.mobile-dropdown-content').classList.toggle('hidden');
    });
  });

  highlightActiveNav();
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', initializeHeader);
if (document.readyState !== 'loading') initializeHeader();

// Close modals on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closePincodeModal();
    closeLanguageModal();
  }
});

// Initialize cart count
function updateHeaderCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll('#desktop-cart-count, #mobile-cart-count, #cart-count, #cartItemsCount, .cart-count').forEach(el => {
    if (el) {
      el.textContent = totalItems;
      el.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }
  });
}

// Initialize wishlist count
function updateHeaderWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const count = wishlist.length;
  document.querySelectorAll('#desktop-wishlist-count, #mobile-wishlist-count, .wishlist-count').forEach(el => {
    if (el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    }
  });
}

// Run on load
updateHeaderCartCount();
updateHeaderWishlistCount();

// Listen for storage changes
window.addEventListener('storage', function(e) {
  if (e.key === 'cart') {
    updateHeaderCartCount();
  }
  if (e.key === 'wishlist') {
    updateHeaderWishlistCount();
  }
});