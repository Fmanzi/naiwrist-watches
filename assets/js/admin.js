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

document.addEventListener('click', function(e) {
  var closeBtn = e.target.closest('[data-modal-close]');
  if (closeBtn) {
    var modalId = closeBtn.dataset.modalClose;
    document.getElementById(modalId).classList.remove('active');
    return;
  }
  var overlay = e.target.closest('.modal-overlay.active');
  if (overlay && e.target === overlay) {
    overlay.classList.remove('active');
  }
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(function(m) {
      m.classList.remove('active');
    });
  }
});

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

document.getElementById('exportBtn').addEventListener('click', function() {
  db.collection('products').get().then(function(snapshot) {
    var headers = ['name', 'category', 'price', 'comparePrice', 'description', 'images'];
    var csvRows = [headers.join(',')];

    snapshot.docs.forEach(function(d) {
      var p = d.data();
      var images = (p.images || []).join('|');
      var row = [
        '"' + (p.name || '').replace(/"/g, '""') + '"',
        '"' + (p.category || '').replace(/"/g, '""') + '"',
        p.price || 0,
        p.comparePrice || 0,
        '"' + (p.description || '').replace(/"/g, '""') + '"',
        '"' + images.replace(/"/g, '""') + '"'
      ];
      csvRows.push(row.join(','));
    });

    var csv = csvRows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'naiwrist-watches-' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  }).catch(function(err) {
    alert('Error exporting: ' + err.message);
  });
});

var importMode = 'csv';
var parsedProducts = [];

document.getElementById('bulkImportBtn').addEventListener('click', function() {
  parsedProducts = [];
  importMode = 'csv';
  document.getElementById('csvSection').style.display = 'block';
  document.getElementById('jsonSection').style.display = 'none';
  document.getElementById('importPreview').style.display = 'none';
  document.getElementById('importProgress').style.display = 'none';
  document.getElementById('bulkImportBtnAction').disabled = true;
  document.getElementById('csvFileInput').value = '';
  document.getElementById('jsonFileInput').value = '';
  document.getElementById('csvTab').style.borderColor = '#1a73e8';
  document.getElementById('jsonTab').style.borderColor = '#ddd';
  document.getElementById('bulkImportModal').classList.add('active');
});

document.getElementById('csvTab').addEventListener('click', function() {
  importMode = 'csv';
  document.getElementById('csvSection').style.display = 'block';
  document.getElementById('jsonSection').style.display = 'none';
  document.getElementById('csvTab').style.borderColor = '#1a73e8';
  document.getElementById('jsonTab').style.borderColor = '#ddd';
  document.getElementById('csvFileInput').value = '';
  document.getElementById('jsonFileInput').value = '';
  parsedProducts = [];
  document.getElementById('importPreview').style.display = 'none';
  document.getElementById('bulkImportBtnAction').disabled = true;
});

document.getElementById('jsonTab').addEventListener('click', function() {
  importMode = 'json';
  document.getElementById('csvSection').style.display = 'none';
  document.getElementById('jsonSection').style.display = 'block';
  document.getElementById('csvTab').style.borderColor = '#ddd';
  document.getElementById('jsonTab').style.borderColor = '#1a73e8';
  document.getElementById('csvFileInput').value = '';
  document.getElementById('jsonFileInput').value = '';
  parsedProducts = [];
  document.getElementById('importPreview').style.display = 'none';
  document.getElementById('bulkImportBtnAction').disabled = true;
});

document.getElementById('csvFileInput').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    var text = ev.target.result;
    var lines = text.split('\n').filter(function(l) { return l.trim(); });
    if (lines.length < 2) { alert('CSV must have a header row and at least one product.'); return; }

    var headers = parseCSVLine(lines[0]);
    var required = ['name', 'category', 'price'];
    var missing = required.filter(function(r) { return headers.indexOf(r) === -1; });
    if (missing.length) { alert('Missing required columns: ' + missing.join(', ')); return; }

    parsedProducts = [];
    for (var i = 1; i < lines.length; i++) {
      var vals = parseCSVLine(lines[i]);
      var product = {};
      headers.forEach(function(h, idx) { product[h.trim().toLowerCase()] = (vals[idx] || '').trim(); });
      if (!product.name) continue;
      product.price = parseFloat(product.price) || 0;
      product.comparePrice = parseFloat(product.comparePrice) || 0;
      if (product.images) {
        product.images = product.images.split('|').map(function(u) { return u.trim(); }).filter(function(u) { return u; });
      } else {
        product.images = [];
      }
      parsedProducts.push(product);
    }
    showPreview();
  };
  reader.readAsText(file);
});

document.getElementById('jsonFileInput').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) { alert('JSON must be an array of products.'); return; }
      parsedProducts = data.map(function(p) {
        return {
          name: (p.name || '').trim(),
          category: (p.category || '').trim(),
          price: parseFloat(p.price) || 0,
          comparePrice: parseFloat(p.comparePrice) || 0,
          description: (p.description || '').trim(),
          images: Array.isArray(p.images) ? p.images : []
        };
      }).filter(function(p) { return p.name; });
      if (!parsedProducts.length) { alert('No valid products found.'); return; }
      showPreview();
    } catch(e) {
      alert('Invalid JSON: ' + e.message);
    }
  };
  reader.readAsText(file);
});

function parseCSVLine(line) {
  var result = [];
  var current = '';
  var inQuotes = false;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function showPreview() {
  var updateMode = document.getElementById('updateMode').checked;
  document.getElementById('previewCount').textContent = parsedProducts.length;

  if (updateMode) {
    db.collection('products').get().then(function(snapshot) {
      var nameMap = {};
      snapshot.docs.forEach(function(d) {
        var data = d.data();
        if (data.name) nameMap[data.name.toLowerCase().trim()] = d.id;
      });

      var updated = 0, created = 0;
      var list = document.getElementById('previewList');
      list.innerHTML = parsedProducts.map(function(p, i) {
        var key = p.name.toLowerCase().trim();
        var exists = nameMap[key] ? true : false;
        if (exists) updated++; else created++;
        return '<div style="padding:4px 0;border-bottom:1px solid #eee;">' +
          '<strong>#' + (i + 1) + '</strong> ' + escapeHtml(p.name) +
          ' — <em>' + escapeHtml(p.category) + '</em> — Ksh ' + (p.price || 0).toLocaleString() +
          (p.images.length ? ' — <span style="color:#2e7d32;">' + p.images.length + ' images</span>' : '') +
          ' — <span style="font-size:11px;font-weight:500;color:' + (exists ? '#e65100' : '#2e7d32') + ';">' + (exists ? 'WILL UPDATE' : 'NEW') + '</span>' +
        '</div>';
      }).join('');

      document.getElementById('updatePreviewText').textContent =
        ' (' + updated + ' will update, ' + created + ' will be created)';
      document.getElementById('importPreview').style.display = 'block';
      document.getElementById('bulkImportBtnAction').disabled = false;
    });
  } else {
    document.getElementById('updatePreviewText').textContent = ' (all will be created as new)';
    var list = document.getElementById('previewList');
    list.innerHTML = parsedProducts.map(function(p, i) {
      return '<div style="padding:4px 0;border-bottom:1px solid #eee;">' +
        '<strong>#' + (i + 1) + '</strong> ' + escapeHtml(p.name) +
        ' — <em>' + escapeHtml(p.category) + '</em> — Ksh ' + (p.price || 0).toLocaleString() +
        (p.images.length ? ' — <span style="color:#2e7d32;">' + p.images.length + ' images</span>' : '') +
        ' — <span style="font-size:11px;font-weight:500;color:#2e7d32;">NEW</span>' +
      '</div>';
    }).join('');
    document.getElementById('importPreview').style.display = 'block';
    document.getElementById('bulkImportBtnAction').disabled = false;
  }
}

document.getElementById('bulkCancelBtn').addEventListener('click', function() {
  document.getElementById('bulkImportModal').classList.remove('active');
  parsedProducts = [];
});

document.getElementById('bulkImportBtnAction').addEventListener('click', function() {
  if (!parsedProducts.length) { alert('No products to import.'); return; }

  var updateMode = document.getElementById('updateMode').checked;

  function runImport(nameMap) {
    var createdCount = 0, updatedCount = 0;
    var total = parsedProducts.length;
    var btn = document.getElementById('bulkImportBtnAction');
    btn.disabled = true;
    btn.textContent = 'Importing...';
    document.getElementById('importProgress').style.display = 'block';

    var imported = 0;
    var bar = document.getElementById('importProgressBar');
    var text = document.getElementById('importProgressText');
    var errors = [];

    function importBatch(start) {
      var batchSize = 20;
      var slice = parsedProducts.slice(start, start + batchSize);
      if (!slice.length) {
        btn.textContent = 'Import Products';
        btn.disabled = false;
        var msg = 'Done! Created: ' + createdCount + ', Updated: ' + updatedCount + ' of ' + total + '.';
        if (errors.length) msg += ' Errors: ' + errors.join('; ');
        alert(msg);
        document.getElementById('bulkImportModal').classList.remove('active');
        parsedProducts = [];
        return;
      }

      var batch = db.batch();
      var now = firebase.firestore.FieldValue.serverTimestamp();

      slice.forEach(function(p) {
        var matchKey = p.name.toLowerCase().trim();
        var existingId = nameMap ? nameMap[matchKey] : null;
        var ref = existingId ? db.collection('products').doc(existingId) : db.collection('products').doc();

        var data = {
          name: p.name,
          category: p.category,
          price: p.price,
          comparePrice: p.comparePrice || 0,
          description: p.description || '',
          images: p.images || [],
          updatedAt: now
        };

        if (existingId) {
          batch.set(ref, data, { merge: true });
          updatedCount++;
        } else {
          data.createdAt = now;
          batch.set(ref, data);
          createdCount++;
        }
      });

      batch.commit().then(function() {
        imported += slice.length;
        bar.value = (imported / total) * 100;
        text.textContent = imported + ' / ' + total + ' products processed...';
        importBatch(start + batchSize);
      }).catch(function(err) {
        errors.push('Batch ' + (start / batchSize + 1) + ': ' + err.message);
        imported += slice.length;
        importBatch(start + batchSize);
      });
    }

    importBatch(0);
  }

  if (updateMode) {
    db.collection('products').get().then(function(snapshot) {
      var nameMap = {};
      snapshot.docs.forEach(function(d) {
        var data = d.data();
        if (data.name) nameMap[data.name.toLowerCase().trim()] = d.id;
      });
      runImport(nameMap);
    });
  } else {
    runImport(null);
  }
});
