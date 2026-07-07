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

var DEFAULT_CONFIG = {
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
  banners: [],
  categories: [
    { name: 'All', icon: '' },
    { name: 'Curren', icon: '' },
    { name: 'Forsining', icon: '' },
    { name: 'Poedagar', icon: '' }
  ]
};



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
  try {
    var docSnap = await db.collection('config').doc('store').get();
    if (docSnap.exists) {
      state.config = docSnap.data();
    } else {
      state.config = DEFAULT_CONFIG;
    }
  } catch (e) {
    console.warn('Firestore unavailable, using defaults:', e);
    state.config = DEFAULT_CONFIG;
  }
  localStorage.setItem('shopConfig', JSON.stringify(state.config));
  return state.config;
}

async function loadProducts() {
  try {
    var snapshot = await db.collection('products').get();
    state.products = snapshot.docs.map(function(d) { return d.data(); });
  } catch (e) {
    console.warn('Firestore unavailable, no products loaded:', e);
    state.products = [];
  }
  window.__products = state.products;
  return state.products;
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
  const catsRaw = state.config.categories || [{ name: 'All', icon: '' }];
  const cats = Array.isArray(catsRaw) && typeof catsRaw[0] === 'string'
    ? catsRaw.map(function(name) { return { name: name, icon: '' }; })
    : catsRaw;
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
