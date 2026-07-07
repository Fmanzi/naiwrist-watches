'use strict';

var CLOUDINARY_CLOUD = 'jiahzlc4';
var CLOUDINARY_PRESET = 'naiwrist_watches';
var currentImages = [];
var unsubscribeProducts = null;

auth.onAuthStateChanged(function(user) {
  if (user) {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('dashboardView').classList.remove('hidden');
    document.getElementById('userInfo').textContent = 'Logged in as ' + user.email;
    loadDashboard();
  } else {
    document.getElementById('loginView').classList.remove('hidden');
    document.getElementById('dashboardView').classList.add('hidden');
    if (unsubscribeProducts) { unsubscribeProducts(); unsubscribeProducts = null; }
  }
});

document.getElementById('loginBtn').addEventListener('click', function() {
  var email = document.getElementById('loginEmail').value;
  var pass = document.getElementById('loginPassword').value;
  document.getElementById('loginError').textContent = '';
  auth.signInWithEmailAndPassword(email, pass).catch(function(err) {
    document.getElementById('loginError').textContent = err.message;
  });
});

document.getElementById('loginEmail').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});
document.getElementById('loginPassword').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

document.getElementById('logoutBtn').addEventListener('click', function() {
  auth.signOut();
  currentImages = [];
});

document.getElementById('searchInput').addEventListener('input', loadDashboard);

function loadDashboard() {
  var q = document.getElementById('searchInput').value.trim().toLowerCase();
  if (unsubscribeProducts) unsubscribeProducts();

  unsubscribeProducts = db.collection('products').onSnapshot(function(snapshot) {
    var products = snapshot.docs.map(function(d) {
      var data = d.data();
      data._id = d.id;
      return data;
    });

    if (q) {
      products = products.filter(function(p) {
        return p.name.toLowerCase().includes(q) ||
               (p.category && p.category.toLowerCase().includes(q));
      });
    }

    document.getElementById('statProducts').textContent = products.length;

    var tbody = document.getElementById('productList');
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="no-products">' +
        (q ? 'No products match your search.' : 'No products yet. Click "Add Product" to get started.') +
        '</td></tr>';
      return;
    }

    var catSet = {};
    products.forEach(function(p) { if (p.category) catSet[p.category] = true; });
    document.getElementById('statCategories').textContent = Object.keys(catSet).length;

    tbody.innerHTML = products.map(function(p) {
      var img = p.images && p.images[0] ? p.images[0] : '';
      var price = (p.price || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
      return '<tr>' +
        '<td><img class="thumb" src="' + img + '" alt="' + escapeHtml(p.name) + '" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><rect fill=%22%23eee%22 width=%2248%22 height=%2248%22/><text x=%2224%22 y=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2210%22>No img</text></svg>\'"></td>' +
        '<td><strong>' + escapeHtml(p.name) + '</strong></td>' +
        '<td>' + escapeHtml(p.category || '') + '</td>' +
        '<td>Ksh ' + price + '</td>' +
        '<td class="actions">' +
          '<button class="btn btn-sm btn-primary" onclick="editProduct(\'' + p._id + '\')">Edit</button>' +
          '<button class="btn btn-sm btn-danger" onclick="deleteProduct(\'' + p._id + '\')">Delete</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }, function(err) {
    console.error('Firestore error:', err);
  });
}

function escapeHtml(text) {
  if (!text) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

document.getElementById('addProductBtn').addEventListener('click', function() {
  currentImages = [];
  document.getElementById('modalTitle').textContent = 'Add Product';
  document.getElementById('editProductId').value = '';
  document.getElementById('productName').value = '';
  document.getElementById('productCategory').value = 'Curren';
  document.getElementById('productPrice').value = '';
  document.getElementById('productComparePrice').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('imagePreview').innerHTML = '';
  document.getElementById('productModal').classList.add('active');
});

window.editProduct = function(docId) {
  db.collection('products').doc(docId).get().then(function(doc) {
    if (!doc.exists) return;
    var p = doc.data();
    currentImages = p.images || [];
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('editProductId').value = docId;
    document.getElementById('productName').value = p.name || '';
    document.getElementById('productCategory').value = p.category || 'Curren';
    document.getElementById('productPrice').value = p.price || '';
    document.getElementById('productComparePrice').value = p.comparePrice || '';
    document.getElementById('productDescription').value = p.description || '';
    renderImagePreviews();
    document.getElementById('productModal').classList.add('active');
  });
};

document.getElementById('cancelBtn').addEventListener('click', function() {
  document.getElementById('productModal').classList.remove('active');
});

document.getElementById('saveBtn').addEventListener('click', function() {
  var docId = document.getElementById('editProductId').value;
  var name = document.getElementById('productName').value.trim();
  var category = document.getElementById('productCategory').value;
  var price = parseFloat(document.getElementById('productPrice').value);
  var comparePrice = parseFloat(document.getElementById('productComparePrice').value) || 0;
  var description = document.getElementById('productDescription').value.trim();

  if (!name || isNaN(price)) {
    alert('Please fill in name and price.');
    return;
  }

  var data = {
    name: name,
    category: category,
    price: price,
    comparePrice: comparePrice,
    description: description,
    images: currentImages,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  var promise;
  if (docId) {
    promise = db.collection('products').doc(docId).update(data);
  } else {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    promise = db.collection('products').add(data);
  }

  promise.then(function() {
    document.getElementById('productModal').classList.remove('active');
  }).catch(function(err) {
    alert('Error saving product: ' + err.message);
  });
});

window.deleteProduct = function(docId) {
  if (!confirm('Delete this product?')) return;
  db.collection('products').doc(docId).delete().catch(function(err) {
    alert('Error deleting: ' + err.message);
  });
};

document.getElementById('uploadBtn').addEventListener('click', function() {
  var widget = cloudinary.createUploadWidget({
    cloudName: CLOUDINARY_CLOUD,
    uploadPreset: CLOUDINARY_PRESET,
    sources: ['local', 'camera', 'url'],
    multiple: true,
    maxFiles: 10,
    clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
    maxFileSize: 5000000
  }, function(err, result) {
    if (!err && result && result.event === 'success') {
      currentImages.push(result.info.secure_url);
      renderImagePreviews();
    }
  });
  widget.open();
});

function renderImagePreviews() {
  var container = document.getElementById('imagePreview');
  container.innerHTML = currentImages.map(function(url, i) {
    return '<div style="position:relative;display:inline-block;">' +
      '<img src="' + url + '" style="width:72px;height:72px;object-fit:cover;border-radius:4px;border:1px solid #eee;">' +
      '<button type="button" onclick="removeImage(' + i + ')" style="position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:none;background:#d32f2f;color:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;">×</button>' +
    '</div>';
  }).join('');
}

window.removeImage = function(index) {
  currentImages.splice(index, 1);
  renderImagePreviews();
};

document.getElementById('configBtn').addEventListener('click', function() {
  db.collection('config').doc('store').get().then(function(doc) {
    var d = doc.exists ? doc.data() : {};
    document.getElementById('configStoreName').value = d.storeName || 'Naiwrist Watches';
    document.getElementById('configCurrency').value = d.currency || 'Ksh';
    document.getElementById('configWhatsApp').value = d.whatsappNumber || '';
    document.getElementById('configPrefix').value = d.whatsappPrefix || '';
    var cats = d.categories || [];
    if (cats.length && typeof cats[0] === 'object') {
      cats = cats.map(function(c) { return c.name; });
    }
    document.getElementById('configCategories').value = cats.join(', ');
    document.getElementById('configBanners').value = JSON.stringify(d.banners || [], null, 2);
    document.getElementById('configModal').classList.add('active');
  });
});

document.getElementById('configCancelBtn').addEventListener('click', function() {
  document.getElementById('configModal').classList.remove('active');
});

document.getElementById('configSaveBtn').addEventListener('click', function() {
  var categories = document.getElementById('configCategories').value
    .split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; })
    .map(function(name) { return { name: name, icon: '' }; });

  var banners = [];
  try {
    banners = JSON.parse(document.getElementById('configBanners').value || '[]');
  } catch(e) {
    alert('Invalid banners JSON. Please fix it.');
    return;
  }

  var data = {
    storeName: document.getElementById('configStoreName').value.trim(),
    currency: document.getElementById('configCurrency').value.trim(),
    whatsappNumber: document.getElementById('configWhatsApp').value.trim(),
    whatsappPrefix: document.getElementById('configPrefix').value.trim(),
    categories: categories,
    banners: banners,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection('config').doc('store').set(data, { merge: true }).then(function() {
    document.getElementById('configModal').classList.remove('active');
  }).catch(function(err) {
    alert('Error saving settings: ' + err.message);
  });
});

document.getElementById('seedBtn').addEventListener('click', function() {
  if (!confirm('This will add the 14 default products to Firestore if they don\'t exist. Continue?')) return;

  var defaultProducts = [
    { name: "A Curren 8455 Gent's watch", category: "Curren", price: 3500.00, comparePrice: 4500.00, images: ["./assets/images/products/A Curren 8455 Gent's watch/rn-image_picker_lib_temp_01b428e0-3f2b-460d-b232-530757c699cc.webp", "./assets/images/products/A Curren 8455 Gent's watch/rn-image_picker_lib_temp_1a8e9be8-c63f-482d-b810-2dedf2041384.webp", "./assets/images/products/A Curren 8455 Gent's watch/rn-image_picker_lib_temp_3db28ce5-9086-4612-8b72-3f9dd4db244c.webp", "./assets/images/products/A Curren 8455 Gent's watch/rn-image_picker_lib_temp_68c69f6d-5e10-4efb-99d3-f1fa14e80dfc.webp"], description: 'Stainless steel construction with sleek design. Water-resistant, battery powered. Perfect for any occasion.' },
    { name: 'CURREN Gents 8444 Ultra Slim Watch', category: 'Curren', price: 3500.00, comparePrice: 4000.00, images: ["./assets/images/products/CURREN Gents 8444 Ultra Slim Watch/rn-image_picker_lib_temp_26f8b2fa-7337-41cc-b5a9-dd874a201bd4.webp", "./assets/images/products/CURREN Gents 8444 Ultra Slim Watch/rn-image_picker_lib_temp_85481717-8ced-4a17-a1f8-b2927e3b9baf.webp", "./assets/images/products/CURREN Gents 8444 Ultra Slim Watch/rn-image_picker_lib_temp_cfb7d3fb-bdc2-4163-ab01-e59cb6eafdf1.webp", "./assets/images/products/CURREN Gents 8444 Ultra Slim Watch/rn-image_picker_lib_temp_da5d679a-2a5d-4a4e-b061-862cf7db240f.webp"], description: 'Ultra-slim profile with high-quality stainless steel case. Quartz movement, water-resistant, fully boxed. Ideal gift option.' },
    { name: 'Forsining Automatic - watch', category: 'Forsining', price: 7000.00, comparePrice: 7400.00, images: ["./assets/images/products/Forsining Automatic - watch/IMG-20240828-WA0213.webp", "./assets/images/products/Forsining Automatic - watch/IMG-20240828-WA0213_888a7e84-621c-4c52-9e0d-4a485dc9b169.webp"], description: 'Golden-toned automatic movement watch with luminous arms. Stainless steel construction, water-resistant.' },
    { name: 'Forsining automatic Gents watch', category: 'Forsining', price: 6499.00, comparePrice: 6900.00, images: ["./assets/images/products/Forsining automatic Gents watch/rn-image_picker_lib_temp_0aa37922-d741-47ab-8260-6d9c6d351682.webp", "./assets/images/products/Forsining automatic Gents watch/rn-image_picker_lib_temp_21cdd01f-ffda-4103-85d7-64d9d6b46562.webp", "./assets/images/products/Forsining automatic Gents watch/rn-image_picker_lib_temp_37a15047-3fe2-4be2-8a2b-bf3d8231708a.webp", "./assets/images/products/Forsining automatic Gents watch/rn-image_picker_lib_temp_68ca60bf-69a5-44e7-9619-539f06dac7ad.jpg"], description: 'Skeletonized dial showing automatic movement. Genuine leather strap, stainless steel case.' },
    { name: 'Forsining automatic watch', category: 'Forsining', price: 7000.00, comparePrice: 7500.00, images: ["./assets/images/products/Forsining automatic watch/2CF2B2D2-FF04-449E-A313-CFB66577D6E8.webp", "./assets/images/products/Forsining automatic watch/3613F2AD-487F-490B-BBC7-44A397E97E42.webp", "./assets/images/products/Forsining automatic watch/49594E59-0353-4559-8D33-C4AE5498C6C2.webp", "./assets/images/products/Forsining automatic watch/C7748F9B-6B17-4DE8-A759-5CC92332EA5E.webp"], description: 'Automatic movement with luminous arms. Stainless steel and leather strap.' },
    { name: 'GENTS CURREN 8514 LUXURIOUS BUSINESS WATCH', category: 'Curren', price: 4850.00, comparePrice: 5500.00, images: ["./assets/images/products/GENTS CURREN 8514 LUXURIOUS BUSINESS WATCH/IMG-20231120-WA0699.webp", "./assets/images/products/GENTS CURREN 8514 LUXURIOUS BUSINESS WATCH/IMG-20231120-WA0701.webp", "./assets/images/products/GENTS CURREN 8514 LUXURIOUS BUSINESS WATCH/IMG-20231120-WA0702.webp", "./assets/images/products/GENTS CURREN 8514 LUXURIOUS BUSINESS WATCH/IMG-20231120-WA0703.webp"], description: 'Chronograph movement with date display and luminous elements. Water-resistant.' },
    { name: 'Gents Poedagar 910 watch', category: 'Poedagar', price: 3800.00, comparePrice: 4800.00, images: ["./assets/images/products/Gents Poedagar 910 watch/IMG-20240430-WA0082.webp", "./assets/images/products/Gents Poedagar 910 watch/rn-image_picker_lib_temp_5c3bd414-d0e5-45af-b090-23f5e7fad6e3.webp", "./assets/images/products/Gents Poedagar 910 watch/rn-image_picker_lib_temp_a01f7b79-39b9-4dc0-80a0-4c61c2b17f56.webp"], description: 'Reliable timepiece with date display. Strong luminous feature for low-light readability.' },
    { name: 'POEDAGAR 615 CLASSIC WATCH', category: 'Poedagar', price: 4300.00, comparePrice: 4800.00, images: ["./assets/images/products/POEDAGAR 615 CLASSIC WATCH/B8C09991-CCC3-48B4-8F74-4E60A70A7415.webp", "./assets/images/products/POEDAGAR 615 CLASSIC WATCH/BC5C9C67-9BF6-42AA-9384-54407D97F877.webp", "./assets/images/products/POEDAGAR 615 CLASSIC WATCH/rn-image_picker_lib_temp_15238799-a464-4e50-b201-b6cddd20cc46.webp", "./assets/images/products/POEDAGAR 615 CLASSIC WATCH/rn-image_picker_lib_temp_70e78aa8-0a86-4d11-ab09-2deac0cabd82.webp"], description: 'Timeless design with stainless steel case and quartz movement.' },
    { name: 'Poedagar 853 Analogue Quartz Watch Men', category: 'Poedagar', price: 3999.00, comparePrice: 4500.00, images: ["./assets/images/products/Poedagar 853 Analogue Quartz Watch Men/rn-image_picker_lib_temp_38b53b43-bc28-4789-b315-435a613ed749.webp", "./assets/images/products/Poedagar 853 Analogue Quartz Watch Men/rn-image_picker_lib_temp_66b07f9c-93b3-498f-8b58-6dd17a226fae.webp", "./assets/images/products/Poedagar 853 Analogue Quartz Watch Men/rn-image_picker_lib_temp_aee9efb4-1c02-481c-9973-c96c5baddaae.webp"], description: 'Sophisticated square alloy case with stainless steel bracelet.' },
    { name: 'Poedagar 921 Chronograph Business watch', category: 'Poedagar', price: 5200.00, comparePrice: 6500.00, images: ["./assets/images/products/Poedagar 921 Chronograph Business watch/rn-image_picker_lib_temp_38c2fa8a-6236-4889-a6ae-9d795810f349.webp", "./assets/images/products/Poedagar 921 Chronograph Business watch/rn-image_picker_lib_temp_6a526874-a508-4971-a486-b7209c4ca8b1.webp", "./assets/images/products/Poedagar 921 Chronograph Business watch/rn-image_picker_lib_temp_9eb51941-938d-4811-bcf6-d0f9492959ce.webp", "./assets/images/products/Poedagar 921 Chronograph Business watch/rn-image_picker_lib_temp_e1fd8ce7-4aeb-4179-9b8b-c97c7be43763.webp"], description: 'Sophisticated chronograph with precise functionality.' },
    { name: 'Poedagar 984 Chronograph watch', category: 'Poedagar', price: 4999.00, comparePrice: 5500.00, images: ["./assets/images/products/Poedagar 984 Chronograph watch/rn-image_picker_lib_temp_2e408659-bb76-44de-84ce-ed30c0d89144.webp", "./assets/images/products/Poedagar 984 Chronograph watch/rn-image_picker_lib_temp_3b9cef4a-db8b-43f3-9ca2-715d2ffae942.webp", "./assets/images/products/Poedagar 984 Chronograph watch/rn-image_picker_lib_temp_75b324bc-61c5-4758-bb46-6961ed224e7d.webp", "./assets/images/products/Poedagar 984 Chronograph watch/rn-image_picker_lib_temp_8df013f3-2913-4b06-8c68-e9d0cbe3786a.webp"], description: 'Skeleton dial with chronograph function. Stainless steel construction.' },
    { name: 'Poedagar E108 Dual time watch', category: 'Poedagar', price: 4500.00, comparePrice: 5500.00, images: ["./assets/images/products/Poedagar E108 Dual time watch/rn-image_picker_lib_temp_816a1161-7960-4a96-9de7-bdced3d14e2f.webp", "./assets/images/products/Poedagar E108 Dual time watch/rn-image_picker_lib_temp_976c6a71-f160-4142-9d87-e0872a65e9fe.webp", "./assets/images/products/Poedagar E108 Dual time watch/rn-image_picker_lib_temp_aa6b2023-8700-4cb9-bb71-b903e48167a4.webp", "./assets/images/products/Poedagar E108 Dual time watch/rn-image_picker_lib_temp_bc97076b-3548-4e82-a315-7d5e57e3a065.webp"], description: 'Dual time zone functionality with solid stainless-steel finish.' },
    { name: 'Poedagar Gents Chronograph watch', category: 'Poedagar', price: 4999.00, comparePrice: 6000.00, images: ["./assets/images/products/Poedagar Gents Chronograph watch/rn-image_picker_lib_temp_26ff2949-2f2c-4223-835a-f70affa7725b.webp", "./assets/images/products/Poedagar Gents Chronograph watch/rn-image_picker_lib_temp_324ce141-f833-4f8d-9742-8deff13c6edc.webp", "./assets/images/products/Poedagar Gents Chronograph watch/rn-image_picker_lib_temp_67f71c74-8c08-4eb5-8f26-cb0d9ece641d.webp", "./assets/images/products/Poedagar Gents Chronograph watch/rn-image_picker_lib_temp_c9e08f4d-23a7-470c-b65b-43845d78ea0e.webp"], description: 'Chronograph movement with date display. Water-resistant, strong luminous.' },
    { name: "Poedagar Gent's watch AP design", category: 'Poedagar', price: 4200.00, comparePrice: 5000.00, images: ["./assets/images/products/Poedagar Gent's watch AP design/rn-image_picker_lib_temp_79b928f4-0edb-4859-ac31-1a00177a7975.webp", "./assets/images/products/Poedagar Gent's watch AP design/rn-image_picker_lib_temp_86c94db7-404c-4071-9be4-fef5e2cbda89.webp", "./assets/images/products/Poedagar Gent's watch AP design/rn-image_picker_lib_temp_b3293932-6afb-4951-a69b-e27aca5cdd01.webp", "./assets/images/products/Poedagar Gent's watch AP design/rn-image_picker_lib_temp_c312cd5f-96ce-4853-b300-5ddbf1dd2deb.webp"], description: 'AP-inspired octagonal bezel design with date display. Water-resistant.' }
  ];

  db.collection('products').get().then(function(snapshot) {
    var existing = snapshot.docs.length;
    if (existing >= 14) {
      if (!confirm('Products already exist. Add them anyway (may create duplicates)?')) return;
    }

    var batch = db.batch();
    defaultProducts.forEach(function(p) {
      var ref = db.collection('products').doc();
      batch.set(ref, {
        name: p.name,
        category: p.category,
        price: p.price,
        comparePrice: p.comparePrice,
        images: p.images,
        description: p.description,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    return batch.commit();
  }).then(function() {
    alert('Seed data added! ' + defaultProducts.length + ' products created.');
  }).catch(function(err) {
    alert('Error: ' + err.message);
  });
});
