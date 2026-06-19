'use strict';

const GSHEET_URL = 'https://script.google.com/macros/s/AKfycby2MG6DxL8qDKlZ6WeKEwvJHNs7gXEpRmfjXPiPkv_rKXWI9gXt1CCJ-YpQVd5ucNz6Bw/exec';

function submitOrderDirect(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const name = formData.get('name') || '';
  const phone = formData.get('phone') || '';
  const address = formData.get('address') || '';

  if (!phone.trim()) {
    showToast('Please enter your phone number', 'error');
    return;
  }

  const cart = JSON.parse(localStorage.getItem('shopCart')) || [];
  if (cart.length === 0) {
    showToast('Your cart is empty', 'info');
    return;
  }

  const config = JSON.parse(localStorage.getItem('shopConfig') || '{}');
  const currency = config.currency || 'Ksh';
  const storeName = config.storeName || 'Naiwrist Watches';
  const products = window.__products || [];

  let itemsList = '';
  let total = 0;
  cart.forEach(item => {
    const p = products.find(pr => pr.id === item.id);
    if (p) {
      itemsList += `${p.name} x${item.qty}, `;
      total += p.price * item.qty;
    }
  });
  itemsList = itemsList.replace(/, $/, '');
  const totalStr = currency + ' ' + total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }

  const fd = new FormData();
  fd.append('name', name);
  fd.append('phone', phone);
  fd.append('address', address);
  fd.append('items', itemsList);
  fd.append('total', totalStr);
  fd.append('storeName', storeName);

  fetch(GSHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: fd
  })
    .then(() => {
      localStorage.removeItem('shopCart');
      window.__cart = [];
      window.dispatchEvent(new CustomEvent('cart-cleared'));
      closeCheckoutModal();
      form.reset();
      showToast('Order placed successfully!', 'success');
    })
    .catch(() => {
      showToast('Failed to place order. Please try again.', 'error');
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<ion-icon name="checkmark-circle-outline"></ion-icon> Place Order via website';
      }
    });
}

function submitOrderWhatsApp() {
  const cart = JSON.parse(localStorage.getItem('shopCart')) || [];
  if (cart.length === 0) {
    showToast('Your cart is empty', 'info');
    return;
  }

  const form = document.getElementById('checkoutForm');
  const formData = form ? new FormData(form) : new FormData();
  const name = formData.get('name') || '';
  const phone = formData.get('phone') || '';
  const address = formData.get('address') || '';

  if (!phone.trim()) {
    showToast('Please enter your phone number', 'error');
    return;
  }

  const config = JSON.parse(localStorage.getItem('shopConfig') || '{}');
  const currency = config.currency || 'Ksh';
  const products = window.__products || [];

  let itemsText = '';
  let total = 0;
  cart.forEach(item => {
    const p = products.find(pr => pr.id === item.id);
    if (p) {
      const lineTotal = p.price * item.qty;
      itemsText += ` • ${p.name} × ${item.qty} = ${currency} ${lineTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\n`;
      total += lineTotal;
    }
  });

  const orderMsg = encodeURIComponent(
    `🛒 *New Order - ${config.storeName || 'Naiwrist Watches'}*\n\n` +
    `*Items:*\n${itemsText}\n` +
    `*Total:* ${currency} ${total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}\n\n` +
    `*Customer Details:*\n` +
    `Name: ${name}\n` +
    `Phone: ${phone}\n` +
    `Address: ${address}`
  );

  const whatsappNum = config.whatsappNumber || '1234567890';
  const prefix = config.whatsappPrefix || '';
  const fullNum = prefix ? prefix + whatsappNum : whatsappNum;
  const waUrl = `https://wa.me/${fullNum}?text=${orderMsg}`;

  localStorage.removeItem('shopCart');
  window.__cart = [];
  window.dispatchEvent(new CustomEvent('cart-cleared'));
  closeCheckoutModal();
  if (form) form.reset();
  window.open(waUrl, '_blank');
  showToast('Order sent via WhatsApp!', 'success');
}

function closeCheckoutModal() {
  const modal = document.querySelector('[data-checkout-modal]');
  const overlay = document.querySelector('[data-overlay]');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('checkoutForm');
  if (form) {
    form.addEventListener('submit', submitOrderDirect);
  }

  const waBtn = document.querySelector('[data-whatsapp-order]');
  if (waBtn) {
    waBtn.addEventListener('click', submitOrderWhatsApp);
  }

  const config = JSON.parse(localStorage.getItem('shopConfig') || '{}');
  const whatsappLink = document.querySelector('.whatsapp-link');
  if (whatsappLink && config.whatsappNumber) {
    const prefix = config.whatsappPrefix || '';
    whatsappLink.href = `https://wa.me/${prefix}${config.whatsappNumber}`;
  }
});
