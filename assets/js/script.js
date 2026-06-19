'use strict';

let state = {
  products: [],
  config: {},
  cart: JSON.parse(localStorage.getItem('shopCart')) || [],
  currentCategory: 'All',
  searchQuery: '',
  viewMode: localStorage.getItem('shopViewMode') || 'grid',
  carouselIndex: 0,
  carouselTimer: null
};

const CONFIG_DATA = {
  storeName: 'Naiwrist Watches',
  storeTagline: 'Premium Timepieces for both Men and Women',
  currency: 'Ksh',
  currencyCode: 'KES',
  whatsappNumber: '0728580415',
  whatsappPrefix: '254',
  whatsappMessage: "Hi! I'd like to place an order:",
  shippingPromo: 'Free Delivery This Week Orders Over Ksh 5,000',
  email: 'naiwristwatches@gmail.com',
  phone: '(+254) 712 345 678',
  address: 'Magic Business Center, 1st Floor, Shop M18, Nairobi CBD',
  social: { facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
  banners: [
    { image: "./assets/images/products/A Curren 8455 Gent's watch/rn-image_picker_lib_temp_01b428e0-3f2b-460d-b232-530757c699cc.webp", subtitle: 'Latest Collection', title: 'Premium Curren Watches', text: 'starting from Ksh 3,500', btnText: 'Shop now' },
    { image: './assets/images/products/Forsining Automatic - watch/IMG-20240828-WA0213.webp', subtitle: 'Automatic Movement', title: 'Forsining Timepieces', text: 'starting from Ksh 6,499', btnText: 'Shop now' },
    { image: './assets/images/products/Poedagar 984 Chronograph watch/rn-image_picker_lib_temp_ec387dd2-7934-4661-bb1e-50d74af39ba9.webp', subtitle: 'Chronograph Collection', title: 'Poedagar Luxury', text: 'starting from Ksh 3,800', btnText: 'Shop now' }
  ],
  categories: [
    { name: 'All', icon: '' },
    { name: 'Curren', icon: '' },
    { name: 'Forsining', icon: '' },
    { name: 'Poedagar', icon: '' }
  ]
};

const PRODUCTS_DATA = [
  { id: 1, name: "A Curren 8455 Gent's watch", category: 'Curren', price: 3500.00, comparePrice: 4500.00, images: ['./assets/images/products/A Curren 8455 Gent\'s watch/rn-image_picker_lib_temp_01b428e0-3f2b-460d-b232-530757c699cc.webp', './assets/images/products/A Curren 8455 Gent\'s watch/rn-image_picker_lib_temp_1a8e9be8-c63f-482d-b810-2dedf2041384.webp', './assets/images/products/A Curren 8455 Gent\'s watch/rn-image_picker_lib_temp_3db28ce5-9086-4612-8b72-3f9dd4db244c.webp', './assets/images/products/A Curren 8455 Gent\'s watch/rn-image_picker_lib_temp_68c69f6d-5e10-4efb-99d3-f1fa14e80dfc.webp'], description: 'Stainless steel construction with sleek design. Water-resistant, battery powered. Perfect for any occasion.' },
  { id: 2, name: 'CURREN Gents 8444 Ultra Slim Watch', category: 'Curren', price: 3500.00, comparePrice: 4000.00, images: ['./assets/images/products/CURREN Gents 8444 Ultra Slim Watch/rn-image_picker_lib_temp_26f8b2fa-7337-41cc-b5a9-dd874a201bd4.webp', './assets/images/products/CURREN Gents 8444 Ultra Slim Watch/rn-image_picker_lib_temp_85481717-8ced-4a17-a1f8-b2927e3b9baf.webp', './assets/images/products/CURREN Gents 8444 Ultra Slim Watch/rn-image_picker_lib_temp_cfb7d3fb-bdc2-4163-ab01-e59cb6eafdf1.webp', './assets/images/products/CURREN Gents 8444 Ultra Slim Watch/rn-image_picker_lib_temp_da5d679a-2a5d-4a4e-b061-862cf7db240f.webp'], description: 'Ultra-slim profile with high-quality stainless steel case. Quartz movement, water-resistant, fully boxed. Ideal gift option.' },
  { id: 3, name: 'Forsining Automatic - watch', category: 'Forsining', price: 7000.00, comparePrice: 7400.00, images: ['./assets/images/products/Forsining Automatic - watch/IMG-20240828-WA0213.webp', './assets/images/products/Forsining Automatic - watch/IMG-20240828-WA0213_888a7e84-621c-4c52-9e0d-4a485dc9b169.webp'], description: 'Golden-toned automatic movement watch with luminous arms. Stainless steel construction, water-resistant. Elegant and reliable.' },
  { id: 4, name: 'Forsining automatic Gents watch', category: 'Forsining', price: 6499.00, comparePrice: 6900.00, images: ['./assets/images/products/Forsining automatic Gents watch/rn-image_picker_lib_temp_0aa37922-d741-47ab-8260-6d9c6d351682.webp', './assets/images/products/Forsining automatic Gents watch/rn-image_picker_lib_temp_21cdd01f-ffda-4103-85d7-64d9d6b46562.webp', './assets/images/products/Forsining automatic Gents watch/rn-image_picker_lib_temp_37a15047-3fe2-4be2-8a2b-bf3d8231708a.webp', './assets/images/products/Forsining automatic Gents watch/rn-image_picker_lib_temp_68ca60bf-69a5-44e7-9619-539f06dac7ad.jpg'], description: 'Skeletonized dial showcasing automatic movement. Genuine leather strap, stainless steel case. Classic and elegant design.' },
  { id: 5, name: 'Forsining automatic watch', category: 'Forsining', price: 7000.00, comparePrice: 7500.00, images: ['./assets/images/products/Forsining automatic watch/2CF2B2D2-FF04-449E-A313-CFB66577D6E8.webp', './assets/images/products/Forsining automatic watch/3613F2AD-487F-490B-BBC7-44A397E97E42.webp', './assets/images/products/Forsining automatic watch/49594E59-0353-4559-8D33-C4AE5498C6C2.webp', './assets/images/products/Forsining automatic watch/C7748F9B-6B17-4DE8-A759-5CC92332EA5E.webp'], description: 'Automatic movement with luminous arms. Stainless steel and leather strap. Water-resistant, presented in Forsining branded box.' },
  { id: 6, name: 'GENTS CURREN 8514 LUXURIOUS BUSINESS WATCH', category: 'Curren', price: 4850.00, comparePrice: 5500.00, images: ['./assets/images/products/GENTS CURREN 8514 LUXURIOUS BUSINESS WATCH/IMG-20231120-WA0699.webp', './assets/images/products/GENTS CURREN 8514 LUXURIOUS BUSINESS WATCH/IMG-20231120-WA0701.webp', './assets/images/products/GENTS CURREN 8514 LUXURIOUS BUSINESS WATCH/IMG-20231120-WA0702.webp', './assets/images/products/GENTS CURREN 8514 LUXURIOUS BUSINESS WATCH/IMG-20231120-WA0703.webp'], description: 'Chronograph movement with date display and luminous elements. Water-resistant. Available in black and blue color options.' },
  { id: 7, name: 'Gents Poedagar 910 watch', category: 'Poedagar', price: 3800.00, comparePrice: 4800.00, images: ['./assets/images/products/Gents Poedagar 910 watch/IMG-20240430-WA0082.webp', './assets/images/products/Gents Poedagar 910 watch/rn-image_picker_lib_temp_5c3bd414-d0e5-45af-b090-23f5e7fad6e3.webp', './assets/images/products/Gents Poedagar 910 watch/rn-image_picker_lib_temp_a01f7b79-39b9-4dc0-80a0-4c61c2b17f56.webp'], description: 'Reliable timepiece with date display. Strong luminous feature for low-light readability. Water-resistant with sleek metallic strap.' },
  { id: 8, name: 'POEDAGAR 615 CLASSIC WATCH', category: 'Poedagar', price: 4300.00, comparePrice: 4800.00, images: ['./assets/images/products/POEDAGAR 615 CLASSIC WATCH/B8C09991-CCC3-48B4-8F74-4E60A70A7415.webp', './assets/images/products/POEDAGAR 615 CLASSIC WATCH/BC5C9C67-9BF6-42AA-9384-54407D97F877.webp', './assets/images/products/POEDAGAR 615 CLASSIC WATCH/rn-image_picker_lib_temp_15238799-a464-4e50-b201-b6cddd20cc46.webp', './assets/images/products/POEDAGAR 615 CLASSIC WATCH/rn-image_picker_lib_temp_70e78aa8-0a86-4d11-ab09-2deac0cabd82.webp'], description: 'Timeless design with stainless steel case and quartz movement. Luminous hands, water-resistant. Perfect for casual or business attire.' },
  { id: 9, name: 'Poedagar 853 Analogue Quartz Watch Men', category: 'Poedagar', price: 3999.00, comparePrice: 4500.00, images: ['./assets/images/products/Poedagar 853 Analogue Quartz Watch Men/rn-image_picker_lib_temp_38b53b43-bc28-4789-b315-435a613ed749.webp', './assets/images/products/Poedagar 853 Analogue Quartz Watch Men/rn-image_picker_lib_temp_66b07f9c-93b3-498f-8b58-6dd17a226fae.webp', './assets/images/products/Poedagar 853 Analogue Quartz Watch Men/rn-image_picker_lib_temp_aee9efb4-1c02-481c-9973-c96c5baddaae.webp'], description: 'Sophisticated square alloy case with stainless steel bracelet. Quartz movement, luminous hands, 3ATM water-resistant. Modern luxury.' },
  { id: 10, name: 'Poedagar 921 Chronograph Business watch', category: 'Poedagar', price: 5200.00, comparePrice: 6500.00, images: ['./assets/images/products/Poedagar 921 Chronograph Business watch/rn-image_picker_lib_temp_38c2fa8a-6236-4889-a6ae-9d795810f349.webp', './assets/images/products/Poedagar 921 Chronograph Business watch/rn-image_picker_lib_temp_6a526874-a508-4971-a486-b7209c4ca8b1.webp', './assets/images/products/Poedagar 921 Chronograph Business watch/rn-image_picker_lib_temp_9eb51941-938d-4811-bcf6-d0f9492959ce.webp', './assets/images/products/Poedagar 921 Chronograph Business watch/rn-image_picker_lib_temp_e1fd8ce7-4aeb-4179-9b8b-c97c7be43763.webp'], description: 'Sophisticated chronograph with precise functionality. Water-resistant, date display. Battery-powered for long-lasting performance.' },
  { id: 11, name: 'Poedagar 984 Chronograph watch', category: 'Poedagar', price: 4999.00, comparePrice: 5500.00, images: ['./assets/images/products/Poedagar 984 Chronograph watch/rn-image_picker_lib_temp_2e408659-bb76-44de-84ce-ed30c0d89144.webp', './assets/images/products/Poedagar 984 Chronograph watch/rn-image_picker_lib_temp_3b9cef4a-db8b-43f3-9ca2-715d2ffae942.webp', './assets/images/products/Poedagar 984 Chronograph watch/rn-image_picker_lib_temp_75b324bc-61c5-4758-bb46-6961ed224e7d.webp', './assets/images/products/Poedagar 984 Chronograph watch/rn-image_picker_lib_temp_8df013f3-2913-4b06-8c68-e9d0cbe3786a.webp'], description: 'Skeleton dial with chronograph function. Stainless steel construction, water-resistant. Unique modern aesthetic with reliable performance.' },
  { id: 12, name: 'Poedagar E108 Dual time watch', category: 'Poedagar', price: 4500.00, comparePrice: 5500.00, images: ['./assets/images/products/Poedagar E108 Dual time watch/rn-image_picker_lib_temp_816a1161-7960-4a96-9de7-bdced3d14e2f.webp', './assets/images/products/Poedagar E108 Dual time watch/rn-image_picker_lib_temp_976c6a71-f160-4142-9d87-e0872a65e9fe.webp', './assets/images/products/Poedagar E108 Dual time watch/rn-image_picker_lib_temp_aa6b2023-8700-4cb9-bb71-b903e48167a4.webp', './assets/images/products/Poedagar E108 Dual time watch/rn-image_picker_lib_temp_bc97076b-3548-4e82-a315-7d5e57e3a065.webp'], description: 'Dual time zone functionality with solid stainless-steel finish. Clear dial layout, dependable battery movement. Sharp and reliable.' },
  { id: 13, name: 'Poedagar Gents Chronograph watch', category: 'Poedagar', price: 4999.00, comparePrice: 6000.00, images: ['./assets/images/products/Poedagar Gents Chronograph watch/rn-image_picker_lib_temp_26ff2949-2f2c-4223-835a-f70affa7725b.webp', './assets/images/products/Poedagar Gents Chronograph watch/rn-image_picker_lib_temp_324ce141-f833-4f8d-9742-8deff13c6edc.webp', './assets/images/products/Poedagar Gents Chronograph watch/rn-image_picker_lib_temp_67f71c74-8c08-4eb5-8f26-cb0d9ece641d.webp', './assets/images/products/Poedagar Gents Chronograph watch/rn-image_picker_lib_temp_c9e08f4d-23a7-470c-b65b-43845d78ea0e.webp'], description: 'Chronograph movement with date display. Water-resistant, strong luminous. Genuine leather suede straps for comfort and style.' },
  { id: 14, name: "Poedagar Gent's watch AP design", category: 'Poedagar', price: 4200.00, comparePrice: 5000.00, images: ['./assets/images/products/Poedagar Gent\'s watch AP design/rn-image_picker_lib_temp_79b928f4-0edb-4859-ac31-1a00177a7975.webp', './assets/images/products/Poedagar Gent\'s watch AP design/rn-image_picker_lib_temp_86c94db7-404c-4071-9be4-fef5e2cbda89.webp', './assets/images/products/Poedagar Gent\'s watch AP design/rn-image_picker_lib_temp_b3293932-6afb-4951-a69b-e27aca5cdd01.webp', './assets/images/products/Poedagar Gent\'s watch AP design/rn-image_picker_lib_temp_c312cd5f-96ce-4853-b300-5ddbf1dd2deb.webp'], description: 'AP-inspired octagonal bezel design with date display. Water-resistant, stainless steel. Quartz movement, premium look at an affordable price.' }
];

const modal = document.querySelector('[data-modal]');
const modalCloseBtn = document.querySelector('[data-modal-close]');
const modalCloseOverlay = document.querySelector('[data-modal-overlay]');
const modalCloseFunc = function () { if (modal) modal.classList.add('closed'); }
if (modalCloseOverlay) modalCloseOverlay.addEventListener('click', modalCloseFunc);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', modalCloseFunc);

const notificationToast = document.querySelector('[data-toast]');
const toastCloseBtn = document.querySelector('[data-toast-close]');
if (toastCloseBtn) {
  toastCloseBtn.addEventListener('click', function () {
    if (notificationToast) notificationToast.classList.add('closed');
  });
}

const mobileMenuOpenBtn = document.querySelectorAll('[data-mobile-menu-open-btn]');
const mobileMenu = document.querySelectorAll('[data-mobile-menu]');
const mobileMenuCloseBtn = document.querySelectorAll('[data-mobile-menu-close-btn]');
const overlay = document.querySelector('[data-overlay]');

for (let i = 0; i < mobileMenuOpenBtn.length; i++) {
  const mobileMenuCloseFunc = function () {
    if (mobileMenu[i]) mobileMenu[i].classList.remove('active');
    if (overlay) overlay.classList.remove('active');
  }
  mobileMenuOpenBtn[i].addEventListener('click', function () {
    if (mobileMenu[i]) mobileMenu[i].classList.add('active');
    if (overlay) overlay.classList.add('active');
  });
  if (mobileMenuCloseBtn[i]) mobileMenuCloseBtn[i].addEventListener('click', mobileMenuCloseFunc);
  if (overlay) overlay.addEventListener('click', mobileMenuCloseFunc);
}

const accordionBtn = document.querySelectorAll('[data-accordion-btn]');
const accordion = document.querySelectorAll('[data-accordion]');
for (let i = 0; i < accordionBtn.length; i++) {
  accordionBtn[i].addEventListener('click', function () {
    const clickedBtn = this.nextElementSibling && this.nextElementSibling.classList.contains('active');
    for (let j = 0; j < accordion.length; j++) {
      if (clickedBtn) break;
      if (accordion[j].classList.contains('active')) {
        accordion[j].classList.remove('active');
        accordionBtn[j].classList.remove('active');
      }
    }
    if (this.nextElementSibling) {
      this.nextElementSibling.classList.toggle('active');
      this.classList.toggle('active');
    }
  });
}

async function loadConfig() {
  state.config = CONFIG_DATA;
  return CONFIG_DATA;
}

async function loadProducts() {
  state.products = PRODUCTS_DATA;
  return PRODUCTS_DATA;
}

function formatPrice(amount) {
  const cur = state.config.currency || 'Ksh';
  return cur + ' ' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function renderPrice(price, comparePrice) {
  const p = formatPrice(price);
  if (comparePrice && comparePrice > price) {
    return `<p class="price">${p}</p><del>${formatPrice(comparePrice)}</del>`;
  }
  return `<p class="price">${p}</p>`;
}

function renderProductCard(product) {
  const defaultImg = product.images && product.images[0] ? product.images[0] : 'https://picsum.photos/seed/default/400/400';
  const hoverImg = product.images && product.images[1] ? product.images[1] : defaultImg;

  return `
    <div class="showcase" data-product-id="${product.id}">
      <div class="showcase-banner">
        <img src="${defaultImg}" alt="${product.name}" class="product-img default" width="300" loading="lazy">
        <img src="${hoverImg}" alt="${product.name}" class="product-img hover" width="300" loading="lazy">
        <div class="showcase-actions">
          <button class="btn-action" data-addcart="${product.id}">
            <ion-icon name="bag-add-outline"></ion-icon>
          </button>
        </div>
      </div>
      <div class="showcase-content">
        <p class="showcase-category">${product.category}</p>
        <h3><span class="showcase-title">${product.name}</span></h3>
        <div class="price-box">${renderPrice(product.price, product.comparePrice)}</div>
      </div>
    </div>`;
}

function renderProducts() {
  const grid = document.querySelector('.product-grid');
  if (!grid) return;
  let filtered = [...state.products];
  if (state.currentCategory !== 'All') {
    filtered = filtered.filter(p => p.category === state.currentCategory);
  }
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }
  if (filtered.length === 0) {
    grid.innerHTML = `<p class="no-products">No products found matching your criteria.</p>`;
    return;
  }
  grid.innerHTML = filtered.map(p => renderProductCard(p)).join('');
  grid.classList.toggle('list-view', state.viewMode === 'list');
}

function renderCategories() {
  const cats = state.config.categories || [{ name: 'All', icon: '' }];
  const sidebar = document.querySelector('.sidebar-menu-category-list');
  if (!sidebar) return;

  sidebar.innerHTML = cats.map((cat) => {
    const activeClass = cat.name === state.currentCategory ? 'active' : '';
    const iconHtml = cat.icon
      ? `<img src="${cat.icon}" alt="${cat.name}" width="20" height="20" class="menu-title-img">`
      : '';
    return `
      <li class="sidebar-menu-category">
        <button class="sidebar-accordion-menu ${activeClass}" data-cat-btn="${cat.name}">
          <div class="menu-title-flex">
            ${iconHtml}
            <p class="menu-title">${cat.name}</p>
          </div>
        </button>
      </li>`;
  }).join('');

  const mobileMenuCats = document.querySelector('.mobile-menu-category-list');
  if (mobileMenuCats) {
    const catLinks = cats.map(cat =>
      `<li class="menu-category"><a href="#" class="menu-title" data-mobile-cat="${cat.name}">${cat.name}</a></li>`
    ).join('');
    mobileMenuCats.innerHTML = catLinks;
  }
}

function renderBanners() {
  const container = document.querySelector('.slider-container');
  if (!container) return;
  const banners = state.config.banners || [];
  if (banners.length === 0) return;

  container.innerHTML = banners.map(b => `
    <div class="slider-item" data-slide="${banners.indexOf(b)}">
      <img src="${b.image}" alt="${b.title}" class="banner-img">
      <div class="banner-content">
        <p class="banner-subtitle">${b.subtitle}</p>
        <h2 class="banner-title">${b.title}</h2>
        <p class="banner-text">${b.text}</p>
        <a href="#" class="banner-btn">${b.btnText}</a>
      </div>
    </div>`).join('');

  const wrapper = container.parentElement;
  let dotsContainer = wrapper.querySelector('.carousel-dots');
  if (!dotsContainer) {
    dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    wrapper.appendChild(dotsContainer);
  }
  dotsContainer.innerHTML = banners.map((_, i) =>
    `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-dot="${i}"></button>`
  ).join('');
}

function initCarousel() {
  const slides = document.querySelectorAll('.slider-item');
  const dots = document.querySelectorAll('.carousel-dot');
  const container = document.querySelector('.slider-container');
  if (!slides.length) return;

  state.carouselIndex = 0;

  function goToSlide(idx) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[idx].classList.add('active');
    dots[idx].classList.add('active');
    state.carouselIndex = idx;
  }

  function nextSlide() {
    const next = (state.carouselIndex + 1) % slides.length;
    goToSlide(next);
  }

  slides[0].classList.add('active');

  dots.forEach(d => {
    d.addEventListener('click', () => {
      goToSlide(parseInt(d.dataset.dot));
      startCarousel();
    });
  });

  startCarousel();

  function startCarousel() {
    if (state.carouselTimer) clearInterval(state.carouselTimer);
    state.carouselTimer = setInterval(nextSlide, 5000);
  }

  function stopCarousel() {
    if (state.carouselTimer) {
      clearInterval(state.carouselTimer);
      state.carouselTimer = null;
    }
  }

  const bannerEl = document.querySelector('.banner');
  if (bannerEl) {
    bannerEl.addEventListener('mouseenter', stopCarousel);
    bannerEl.addEventListener('mouseleave', startCarousel);
  }
}

function updateStoreInfo() {
  const c = state.config;
  document.title = c.storeName + ' - Premium Timepieces';
  const nd = document.querySelector('.newsletter-desc');
  if (nd) nd.innerHTML = `Subscribe the <b>${c.storeName}</b> to get latest products and discount update.`;
  const alertNews = document.querySelector('.header-alert-news p');
  if (alertNews) alertNews.innerHTML = `Magic Business Center, 1st Floor, Shop M18, Nairobi CBD`;
  const copyright = document.querySelector('.copyright');
  if (copyright) copyright.innerHTML = `Copyright &copy; <a href="#">${c.storeName}</a> all rights reserved.`;
}

function saveCart() {
  localStorage.setItem('shopCart', JSON.stringify(state.cart));
}

function getCartCount() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => {
    const p = state.products.find(pr => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function addToCart(productId) {
  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ id: productId, qty: 1 });
  }
  saveCart();
  updateBadgeCounts();
  renderCartItems();
  showToast('Added to cart', 'success');
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  saveCart();
  updateBadgeCounts();
  renderCartItems();
  showToast('Removed from cart', 'info');
}

function updateCartQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  updateBadgeCounts();
  renderCartItems();
}

function renderCartItems() {
  const body = document.querySelector('[data-cart-body]');
  const totalEl = document.querySelector('[data-cart-total]');
  if (!body) return;
  if (state.cart.length === 0) {
    body.innerHTML = `<div class="cart-empty"><ion-icon name="cart-outline"></ion-icon><p>Your cart is empty</p></div>`;
    if (totalEl) totalEl.textContent = 'Ksh 0.00';
    return;
  }
  body.innerHTML = state.cart.map(item => {
    const p = state.products.find(pr => pr.id === item.id);
    if (!p) return '';
    const img = p.images && p.images[0] ? p.images[0] : '';
    return `
      <div class="cart-item">
        <img src="${img}" alt="${p.name}" class="cart-item-img" width="60" height="60" loading="lazy">
        <div class="cart-item-details">
          <p class="cart-item-name">${p.name}</p>
          <p class="cart-item-price">${formatPrice(p.price * item.qty)}</p>
          <div class="cart-item-qty">
            <button class="qty-btn" data-qty-minus="${item.id}">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-qty-plus="${item.id}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-cart-remove="${item.id}">
          <ion-icon name="close-outline"></ion-icon>
        </button>
      </div>`;
  }).join('');
  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
}

function updateBadgeCounts() {
  const count = getCartCount();
  document.querySelectorAll('.count').forEach(el => {
    el.textContent = count;
  });
}

window.showToast = function (message, type) {
  const existing = document.querySelector('.dynamic-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `dynamic-toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="toast-close-btn" data-dynamic-toast-close>
      <ion-icon name="close-outline"></ion-icon>
    </button>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('active'));
  const closeBtn = toast.querySelector('[data-dynamic-toast-close]');
  closeBtn.addEventListener('click', () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 300);
  });
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 300);
    }
  }, 3000);
};

function openCartSidebar() {
  const sidebar = document.querySelector('[data-cart-sidebar]');
  const o = document.querySelector('[data-overlay]');
  if (sidebar) { sidebar.classList.add('active'); if (o) o.classList.add('active'); }
  renderCartItems();
}

function closeCartSidebar() {
  const sidebar = document.querySelector('[data-cart-sidebar]');
  const o = document.querySelector('[data-overlay]');
  if (sidebar) sidebar.classList.remove('active');
  if (o) o.classList.remove('active');
}

function openQuickView(productId) {
  const p = state.products.find(pr => pr.id === productId);
  if (!p) return;
  const modalEl = document.querySelector('[data-quickview-modal]');
  const o = document.querySelector('[data-overlay]');
  if (!modalEl) return;

  const images = p.images && p.images.length ? p.images : ['https://picsum.photos/seed/default/400/400'];
  let currentImg = 0;

  function renderGallery() {
    const dots = images.map((_, i) =>
      `<span class="gallery-dot ${i === currentImg ? 'active' : ''}"></span>`
    ).join('');

    modalEl.innerHTML = `
      <div class="modal-content quickview-content">
        <button class="modal-close-btn" data-quickview-close>
          <ion-icon name="close-outline"></ion-icon>
        </button>
        <div class="quickview-body">
          <div class="quickview-gallery" data-gallery>
            <div class="gallery-main" data-gallery-main>
              <img src="${images[currentImg]}" alt="${p.name}" class="gallery-img" data-gallery-img>
              ${images.length > 1 ? `
                <button class="gallery-nav gallery-prev" data-gallery-prev><ion-icon name="chevron-back-outline"></ion-icon></button>
                <button class="gallery-nav gallery-next" data-gallery-next><ion-icon name="chevron-forward-outline"></ion-icon></button>
              ` : ''}
            </div>
            ${images.length > 1 ? `<div class="gallery-dots">${dots}</div>` : ''}
          </div>
          <div class="quickview-info">
            <p class="quickview-category">${p.category}</p>
            <h2 class="quickview-title">${p.name}</h2>
            <div class="price-box quickview-price">${renderPrice(p.price, p.comparePrice)}</div>
            <p class="quickview-desc">${p.description || ''}</p>
            <button class="btn-add-cart" data-addcart="${p.id}">
              <ion-icon name="bag-add-outline"></ion-icon> Add to Cart
            </button>
          </div>
        </div>
      </div>`;

    const imgEl = modalEl.querySelector('[data-gallery-img]');
    let touchStartX = 0;
    let touchEndX = 0;

    function goToImage(idx) {
      if (idx < 0) idx = images.length - 1;
      if (idx >= images.length) idx = 0;
      currentImg = idx;
      imgEl.src = images[currentImg];
      const dots = modalEl.querySelectorAll('.gallery-dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === currentImg));
    }

    if (images.length > 1) {
      modalEl.querySelector('[data-gallery-prev]').addEventListener('click', () => goToImage(currentImg - 1));
      modalEl.querySelector('[data-gallery-next]').addEventListener('click', () => goToImage(currentImg + 1));

      const main = modalEl.querySelector('[data-gallery-main]');
      main.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
      main.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) goToImage(currentImg + 1);
          else goToImage(currentImg - 1);
        }
      }, { passive: true });
    }
  }

  renderGallery();
  modalEl.classList.add('active');
  if (o) o.classList.add('active');

  modalEl.querySelector('[data-quickview-close]').addEventListener('click', closeQuickView);
}

function closeQuickView() {
  const modalEl = document.querySelector('[data-quickview-modal]');
  const o = document.querySelector('[data-overlay]');
  if (modalEl) { modalEl.classList.remove('active'); modalEl.innerHTML = ''; }
  if (o) o.classList.remove('active');
}

function openCheckout() {
  if (state.cart.length === 0) { showToast('Your cart is empty', 'info'); return; }
  const modalEl = document.querySelector('[data-checkout-modal]');
  const o = document.querySelector('[data-overlay]');
  if (!modalEl) return;
  let itemsHtml = state.cart.map(item => {
    const p = state.products.find(pr => pr.id === item.id);
    if (!p) return '';
    return `<div class="checkout-item"><span>${p.name} × ${item.qty}</span><span>${formatPrice(p.price * item.qty)}</span></div>`;
  }).join('');
  const total = formatPrice(getCartTotal());
  modalEl.querySelector('[data-checkout-summary]').innerHTML = itemsHtml + `<div class="checkout-total"><strong>Total: ${total}</strong></div>`;
  modalEl.classList.add('active');
  if (o) o.classList.add('active');
}

function closeCheckout() {
  const modalEl = document.querySelector('[data-checkout-modal]');
  const o = document.querySelector('[data-overlay]');
  if (modalEl) modalEl.classList.remove('active');
  if (o) o.classList.remove('active');
}

function toggleViewMode(mode) {
  state.viewMode = mode;
  localStorage.setItem('shopViewMode', mode);
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === mode);
  });
  renderProducts();
}

function bindEvents() {
  const o = document.querySelector('[data-overlay]');

  document.addEventListener('click', e => {
    const addBtn = e.target.closest('[data-addcart]');
    if (addBtn) {
      e.preventDefault();
      e.stopPropagation();
      addToCart(parseInt(addBtn.dataset.addcart));
      const qvModal = document.querySelector('[data-quickview-modal]');
      if (qvModal && qvModal.classList.contains('active')) closeQuickView();
      return;
    }
    const card = e.target.closest('.showcase[data-product-id]');
    if (card && !e.target.closest('.btn-action')) {
      e.preventDefault();
      openQuickView(parseInt(card.dataset.productId));
      return;
    }
  });

  document.querySelectorAll('[data-cart-open]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); openCartSidebar(); });
  });
  const cartClose = document.querySelector('[data-cart-close]');
  if (cartClose) cartClose.addEventListener('click', closeCartSidebar);
  const checkoutBtn = document.querySelector('[data-checkout-btn]');
  if (checkoutBtn) checkoutBtn.addEventListener('click', e => { e.preventDefault(); closeCartSidebar(); openCheckout(); });
  const checkoutClose = document.querySelector('[data-checkout-close]');
  if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);

  const cartBody = document.querySelector('[data-cart-body]');
  if (cartBody) {
    cartBody.addEventListener('click', e => {
      const minus = e.target.closest('[data-qty-minus]');
      const plus = e.target.closest('[data-qty-plus]');
      const remove = e.target.closest('[data-cart-remove]');
      if (minus) updateCartQty(parseInt(minus.dataset.qtyMinus), -1);
      if (plus) updateCartQty(parseInt(plus.dataset.qtyPlus), 1);
      if (remove) removeFromCart(parseInt(remove.dataset.cartRemove));
    });
  }

  const sidebarList = document.querySelector('.sidebar-menu-category-list');
  if (sidebarList) {
    sidebarList.addEventListener('click', e => {
      const btn = e.target.closest('[data-cat-btn]');
      if (!btn) return;
      e.preventDefault();
      state.currentCategory = btn.dataset.catBtn;
      document.querySelectorAll('[data-cat-btn]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts();
      if (window.innerWidth < 1024) {
        const sb = document.querySelector('.sidebar');
        if (sb) sb.classList.remove('active');
        if (o) o.classList.remove('active');
      }
    });
  }

  document.addEventListener('click', e => {
    const catLink = e.target.closest('[data-cat]');
    if (catLink) {
      e.preventDefault();
      state.currentCategory = catLink.dataset.cat;
      document.querySelectorAll('[data-cat-btn]').forEach(b => {
        b.classList.toggle('active', b.dataset.catBtn === state.currentCategory);
      });
      renderProducts();
    }
    const mobileCat = e.target.closest('[data-mobile-cat]');
    if (mobileCat) {
      e.preventDefault();
      state.currentCategory = mobileCat.dataset.mobileCat;
      renderProducts();
      const mm = document.querySelector('[data-mobile-menu]');
      if (mm) mm.classList.remove('active');
      if (o) o.classList.remove('active');
    }
  });

  const searchField = document.querySelector('.search-field');
  if (searchField) {
    searchField.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      renderProducts();
    });
  }

  const newsletterForm = document.querySelector('.newsletter form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = newsletterForm.querySelector('.email-field').value;
      if (email) {
        showToast('Subscribed successfully!', 'success');
        newsletterForm.reset();
        const m = document.querySelector('[data-modal]');
        if (m) m.classList.add('closed');
      }
    });
  }

  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => toggleViewMode(btn.dataset.view));
  });

  const homeBtn = document.querySelector('[data-home]');
  if (homeBtn) {
    homeBtn.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (o) {
    o.addEventListener('click', () => {
      closeCartSidebar();
      closeQuickView();
      closeCheckout();
    });
  }
}

function initNotificationToast() {
  const toastEl = document.querySelector('[data-toast]');
  const img = toastEl ? toastEl.querySelector('[data-toast-img]') : null;
  const title = toastEl ? toastEl.querySelector('[data-toast-title]') : null;
  if (!toastEl || !img || !title || state.products.length === 0) return;

  function setRandomProduct() {
    const p = state.products[Math.floor(Math.random() * state.products.length)];
    const defaultImg = p.images && p.images[0] ? p.images[0] : '';
    img.src = defaultImg;
    img.alt = p.name;
    title.textContent = p.name;
  }

  setRandomProduct();

  toastEl.addEventListener('animationiteration', setRandomProduct);
}

function initShopModal() {
  const c = state.config;
  const addrEl = document.querySelector('[data-modal-address]');
  const phoneEl = document.querySelector('[data-modal-phone]');
  const emailEl = document.querySelector('[data-modal-email]');
  const socialRow = document.querySelector('[data-modal-social]');
  if (!socialRow) return;

  if (addrEl && c.address) addrEl.innerHTML = 'Located at <b>' + c.address + '</b>';
  if (phoneEl && c.phone) phoneEl.innerHTML = '<ion-icon name="call-outline"></ion-icon> ' + c.phone;
  if (emailEl && c.email) emailEl.innerHTML = '<ion-icon name="mail-outline"></ion-icon> ' + c.email;

  if (c.social) {
    const links = socialRow.querySelectorAll('.social-link');
    if (links[0] && c.social.facebook) links[0].href = c.social.facebook;
    if (links[1] && c.social.twitter) links[1].href = c.social.twitter;
    if (links[2] && c.social.instagram) links[2].href = c.social.instagram;
    if (links[3] && c.social.linkedin) links[3].href = c.social.linkedin;
  }
}

function init() {
  Promise.all([loadConfig(), loadProducts()]).then(() => {
    const c = state.config;
    window.__products = state.products;
    localStorage.setItem('shopConfig', JSON.stringify(state.config));

    window.addEventListener('cart-cleared', function () {
      state.cart = [];
      saveCart();
      updateBadgeCounts();
      renderCartItems();
    });

    if (c.storeName) document.title = c.storeName + ' - Premium Timepieces';
    if (c.banners) { renderBanners(); setTimeout(initCarousel, 50); }
    if (c.categories) renderCategories();
    renderProducts();
    updateBadgeCounts();
    updateStoreInfo();
    toggleViewMode(state.viewMode);
    initNotificationToast();
    initShopModal();
    bindEvents();
  });
}

document.addEventListener('DOMContentLoaded', init);
