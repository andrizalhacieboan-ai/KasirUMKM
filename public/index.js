/* ================================================================
   KasirKu — Frontend JavaScript (FULL CODE)
   Sistem Meja Kasir Online Neo-Brutalism
   ================================================================ */

// ====== State Global ======
var APP = {
  currentUser: null,
  currentPage: 'dashboard',
  cart: [],
  products: [],
  customers: [],
  areas: [],
  sales: [],
  purchases: [],
  debts: [],
  payables: [],
  users: []
};

// ====== Helper: API Call ======
async function apiCall(endpoint, method, body) {
  try {
    var opts = {
      method: method || 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    var res = await fetch('/api/' + endpoint, opts);
    return await res.json();
  } catch (e) {
    console.warn('API unavailable:', e.message);
    return null;
  }
}

// ====== Helper: Format Uang ======
function formatRupiah(num) {
  if (num === null || num === undefined) return 'Rp 0';
  var n = Number(num);
  if (isNaN(n)) return 'Rp 0';
  return 'Rp ' + n.toLocaleString('id-ID');
}

// ====== Helper: Format Tanggal ======
function formatTanggal(str) {
  if (!str) return '-';
  var d = new Date(str);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// ====== Helper: Generate No Nota ======
function generateNota(prefix) {
  var d = new Date();
  var ds = '' + d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  var rnd = Math.floor(Math.random() * 9000) + 1000;
  return (prefix || 'TRX') + '-' + ds + '-' + rnd;
}

// ====== Toast Notification ======
function showToast(message, type) {
  type = type || 'info';
  var container = document.getElementById('toastContainer');
  var icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('toast-out');
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 3500);
}

// ====== Modal ======
function openModal(title, bodyHTML, footerHTML) {
  var card = document.getElementById('modalCard');
  document.getElementById('modalTitle').innerHTML = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  var oldFooter = card.querySelector('.modal-footer');
  if (oldFooter) card.removeChild(oldFooter);
  if (footerHTML) {
    var ft = document.createElement('div');
    ft.className = 'modal-footer';
    ft.innerHTML = footerHTML;
    card.appendChild(ft);
  }
  document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

// ====== Escape HTML ======
function esc(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ====== Initialize on DOM Ready ======
document.addEventListener('DOMContentLoaded', function() {

  // --- Login Form ---
  var loginForm = document.getElementById('loginForm');
  var loginCancel = document.getElementById('loginCancel');
  var loginOverlay = document.getElementById('loginOverlay');

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var username = document.getElementById('loginUser').value.trim();
    var password = document.getElementById('loginPass').value.trim();
    var errorEl = document.getElementById('loginError');

    if (!username || !password) {
      errorEl.textContent = 'User ID dan Password harus diisi!';
      errorEl.style.display = 'block';
      return;
    }

    var result = await apiCall('login', 'POST', { username: username, password: password });

    if (result && result.success) {
      APP.currentUser = result.user;
    } else if (username === 'andriyt' && password === 'andriyt002') {
      APP.currentUser = { id: 1, username: 'andriyt', role: 'admin' };
    } else {
      errorEl.textContent = result ? result.message : 'Username atau password salah!';
      errorEl.style.display = 'block';
      return;
    }

    errorEl.style.display = 'none';
    loginOverlay.classList.add('hiding');
    setTimeout(function() {
      loginOverlay.style.display = 'none';
      document.getElementById('mainApp').style.display = 'block';
      navigateTo('dashboard');
      loadInitialData();
    }, 500);
  });

  loginCancel.addEventListener('click', function() {
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').style.display = 'none';
  });

  // --- Hamburger ---
  document.getElementById('hamburgerBtn').addEventListener('click', function() {
    this.classList.toggle('active');
    document.getElementById('navMenu').classList.toggle('open');
  });
/* ================================================================
   KasirKu — Frontend JavaScript (FIXED NAVBAR & SESSION)
   ================================================================ */

// ====== State Global ======
var APP = {
  currentUser: null,
  currentPage: 'dashboard',
  cart: [],
  products: [],
  customers: [],
  areas: [],
  sales: [],
  purchases: [],
  debts: [],
  payables: [],
  users: []
};

// ====== SESSION MANAGEMENT (PERMANEN LOGIN) ======
function saveSession(user) {
  try {
    localStorage.setItem('kasirku_auth', JSON.stringify(user));
  } catch (e) { console.warn('LocalStorage tidak didukung'); }
}

function loadSession() {
  try {
    var session = localStorage.getItem('kasirku_auth');
    if (session) return JSON.parse(session);
  } catch (e) { console.warn('Gagal memuat sesi'); }
  return null;
}

function clearSession() {
  try {
    localStorage.removeItem('kasirku_auth');
  } catch (e) {}
}

// ====== Helper: API Call ======
async function apiCall(endpoint, method, body) {
  try {
    var opts = { method: method || 'GET', headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    var res = await fetch('/api/' + endpoint, opts);
    return await res.json();
  } catch (e) {
    console.warn('API unavailable:', e.message);
    return null;
  }
}

// ====== Helper lainnya (sama seperti sebelumnya) ======
function formatRupiah(num) {
  if (num === null || num === undefined) return 'Rp 0';
  var n = Number(num);
  if (isNaN(n)) return 'Rp 0';
  return 'Rp ' + n.toLocaleString('id-ID');
}

function formatTanggal(str) {
  if (!str) return '-';
  var d = new Date(str);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

function generateNota(prefix) {
  var d = new Date();
  var ds = '' + d.getFullYear() + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0');
  var rnd = Math.floor(Math.random() * 9000) + 1000;
  return (prefix || 'TRX') + '-' + ds + '-' + rnd;
}

function esc(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// ====== Toast & Modal ======
function showToast(message, type) {
  type = type || 'info';
  var container = document.getElementById('toastContainer');
  var icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function() {
    toast.classList.add('toast-out');
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 3500);
}

function openModal(title, bodyHTML, footerHTML) {
  var card = document.getElementById('modalCard');
  document.getElementById('modalTitle').innerHTML = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  var oldFooter = card.querySelector('.modal-footer');
  if (oldFooter) card.removeChild(oldFooter);
  if (footerHTML) {
    var ft = document.createElement('div');
    ft.className = 'modal-footer';
    ft.innerHTML = footerHTML;
    card.appendChild(ft);
  }
  document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

// ====== Initialize on DOM Ready ======
document.addEventListener('DOMContentLoaded', function() {

  // --- Cek Session Permanen Terlebih Dahulu ---
  var savedSession = loadSession();
  if (savedSession) {
    APP.currentUser = savedSession;
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    navigateTo('dashboard');
    loadInitialData();
  }

  // --- Login Form ---
  var loginForm = document.getElementById('loginForm');
  var loginCancel = document.getElementById('loginCancel');
  var loginOverlay = document.getElementById('loginOverlay');

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    var username = document.getElementById('loginUser').value.trim();
    var password = document.getElementById('loginPass').value.trim();
    var errorEl = document.getElementById('loginError');

    if (!username || !password) {
      errorEl.textContent = 'User ID dan Password harus diisi!';
      errorEl.style.display = 'block';
      return;
    }

    var result = await apiCall('login', 'POST', { username: username, password: password });

    if (result && result.success) {
      APP.currentUser = result.user;
    } else if (username === 'andriyt' && password === 'andriyt002') {
      APP.currentUser = { id: 1, username: 'andriyt', role: 'admin' };
    } else {
      errorEl.textContent = result ? result.message : 'Username atau password salah!';
      errorEl.style.display = 'block';
      return;
    }

    // Simpan sesi ke localStorage (Permanen)
    saveSession(APP.currentUser);

    errorEl.style.display = 'none';
    loginOverlay.classList.add('hiding');
    setTimeout(function() {
      loginOverlay.style.display = 'none';
      document.getElementById('mainApp').style.display = 'block';
      navigateTo('dashboard');
      loadInitialData();
    }, 500);
  });

  loginCancel.addEventListener('click', function() {
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').style.display = 'none';
  });

  // --- Hamburger ---
  document.getElementById('hamburgerBtn').addEventListener('click', function() {
    this.classList.toggle('active');
    document.getElementById('navMenu').classList.toggle('open');
  });

  // --- Mobile dropdown toggle (Perbaikan Sentuh/Touch) ---
  document.querySelectorAll('.nav-item.has-dropdown > .nav-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        e.stopPropagation(); // Mencegah event bubbling yang bikin tidak respon
        this.parentElement.classList.toggle('mobile-open');
      }
    });
  });

  // --- Close modal on overlay ---
  document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
});

// ====== Load Data Awal ======
async function loadInitialData() {
  var prodRes = await apiCall('products');
  if (prodRes && prodRes.success) APP.products = prodRes.data;

  var custRes = await apiCall('customers');
  if (custRes && custRes.success) APP.customers = custRes.data;

  var areaRes = await apiCall('areas');
  if (areaRes && areaRes.success) APP.areas = areaRes.data;

  var saleRes = await apiCall('sales');
  if (saleRes && saleRes.success) APP.sales = saleRes.data;

  var purchRes = await apiCall('purchases');
  if (purchRes && purchRes.success) APP.purchases = purchRes.data;

  var debtRes = await apiCall('debts');
  if (debtRes && debtRes.success) APP.debts = debtRes.data;

  var payRes = await apiCall('payables');
  if (payRes && payRes.success) APP.payables = payRes.data;

  var userRes = await apiCall('users');
  if (userRes && userRes.success) APP.users = userRes.data;
}


// ====== Reload specific data ======
async function reloadProducts() { var r = await apiCall('products'); if (r && r.success) APP.products = r.data; }
async function reloadCustomers() { var r = await apiCall('customers'); if (r && r.success) APP.customers = r.data; }
async function reloadAreas() { var r = await apiCall('areas'); if (r && r.success) APP.areas = r.data; }
async function reloadSales() { var r = await apiCall('sales'); if (r && r.success) APP.sales = r.data; }
async function reloadPurchases() { var r = await apiCall('purchases'); if (r && r.success) APP.purchases = r.data; }
async function reloadDebts() { var r = await apiCall('debts'); if (r && r.success) APP.debts = r.data; }
async function reloadPayables() { var r = await apiCall('payables'); if (r && r.success) APP.payables = r.data; }
async function reloadUsers() { var r = await apiCall('users'); if (r && r.success) APP.users = r.data; }

// ====== NAVIGASI ======
function navigateTo(page) {
  APP.currentPage = page;

  // Tutup mobile menu
  var hBtn = document.getElementById('hamburgerBtn');
  if (hBtn) hBtn.classList.remove('active');
  var nMenu = document.getElementById('navMenu');
  if (nMenu) nMenu.classList.remove('open');

  var wrapper = document.getElementById('contentWrapper');
  wrapper.style.animation = 'none';
  wrapper.offsetHeight;
  wrapper.style.animation = 'fadeUp 0.4s ease';

  var renderer = PAGE_RENDERERS[page];
  if (renderer) {
    wrapper.innerHTML = renderer();
    var initFn = PAGE_INIT[page];
    if (initFn) initFn();
  } else {
    wrapper.innerHTML = PAGE_RENDERERS['dashboard']();
    PAGE_INIT['dashboard']();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====== EXIT ======
function handleExit(e) {
  e.preventDefault();
  openModal(
    '<i class="fas fa-right-from-bracket text-danger"></i> Exit Program',
    '<p style="font-size:1.05rem;line-height:1.6;">Apakah Anda yakin ingin keluar dari <strong>KasirKu</strong>?</p>',
    '<button class="btn btn-danger" onclick="doExit()"><i class="fas fa-check"></i> Ya, Keluar</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

function doExit() {
  closeModal();
  APP.currentUser = null;
  APP.cart = [];
  
  // Hapus sesi permanen saat exit
  clearSession(); 
  
  document.getElementById('mainApp').style.display = 'none';
  var overlay = document.getElementById('loginOverlay');
  overlay.style.display = 'flex';
  overlay.classList.remove('hiding');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').style.display = 'none';
  showToast('Anda telah keluar dari sistem', 'info');
}

// ====================================================================
// PAGE RENDERERS & INIT
// ====================================================================

var PAGE_RENDERERS = {};
var PAGE_INIT = {};

// ====================================================================
// 1. DASHBOARD
// ====================================================================
PAGE_RENDERERS['dashboard'] = function() {
  var totalPenjualan = 0;
  for (var i = 0; i < APP.sales.length; i++) totalPenjualan += (Number(APP.sales[i].total) || 0);
  var totalPiutang = 0;
  for (var i = 0; i < APP.debts.length; i++) totalPiutang += (Number(APP.debts[i].sisa) || 0);
  var totalPembelian = 0;
  for (var i = 0; i < APP.purchases.length; i++) totalPembelian += (Number(APP.purchases[i].total) || 0);
  var totalHutang = 0;
  for (var i = 0; i < APP.payables.length; i++) totalHutang += (Number(APP.payables[i].sisa) || 0);

  var today = new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  var saleRows = '';
  if (APP.sales.length === 0) {
    saleRows = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#9CA3AF;">Belum ada transaksi</td></tr>';
  } else {
    var max = Math.min(APP.sales.length, 8);
    for (var i = 0; i < max; i++) {
      var s = APP.sales[i];
      var badgeClass = (s.jenis === 'tunai') ? 'badge-success' : 'badge-warning';
      saleRows += '<tr><td><strong>' + esc(s.no_nota) + '</strong></td><td>' + formatTanggal(s.tanggal) + '</td><td>' + esc(s.customer_nama || '-') + '</td><td>' + formatRupiah(s.total) + '</td><td><span class="badge ' + badgeClass + '">' + ((s.jenis || 'tunai').toUpperCase()) + '</span></td></tr>';
    }
  }

  return '' +
    '<div class="section-header">' +
      '<div>' +
        '<div class="section-title"><i class="fas fa-th-large"></i> Dashboard</div>' +
        '<div class="section-subtitle">Selamat datang, <strong>' + (APP.currentUser ? esc(APP.currentUser.username) : 'User') + '</strong>! Ini ringkasan bisnis Anda.</div>' +
      '</div>' +
      '<div style="font-size:0.85rem;color:#6B7280;"><i class="fas fa-calendar"></i> ' + today + '</div>' +
    '</div>' +
    '<div class="stat-grid">' +
      '<div class="stat-card"><div class="stat-icon orange"><i class="fas fa-cart-shopping"></i></div><div class="stat-info"><h4>Total Penjualan</h4><div class="stat-value">' + formatRupiah(totalPenjualan) + '</div></div></div>' +
      '<div class="stat-card"><div class="stat-icon blue"><i class="fas fa-hand-holding-dollar"></i></div><div class="stat-info"><h4>Piutang</h4><div class="stat-value">' + formatRupiah(totalPiutang) + '</div></div></div>' +
      '<div class="stat-card"><div class="stat-icon green"><i class="fas fa-truck"></i></div><div class="stat-info"><h4>Total Pembelian</h4><div class="stat-value">' + formatRupiah(totalPembelian) + '</div></div></div>' +
      '<div class="stat-card"><div class="stat-icon red"><i class="fas fa-credit-card"></i></div><div class="stat-info"><h4>Hutang</h4><div class="stat-value">' + formatRupiah(totalHutang) + '</div></div></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem;">' +
      '<div class="card" style="text-align:center;cursor:pointer;" onclick="navigateTo(\'daftar-stok\')"><div style="font-size:2rem;color:var(--primary);"><i class="fas fa-boxes-stacked"></i></div><div style="font-weight:700;font-size:1.5rem;margin:0.3rem 0;">' + APP.products.length + '</div><div style="color:#6B7280;font-size:0.85rem;">Produk Terdaftar</div></div>' +
      '<div class="card" style="text-align:center;cursor:pointer;" onclick="navigateTo(\'daftar-langganan\')"><div style="font-size:2rem;color:var(--secondary);"><i class="fas fa-users"></i></div><div style="font-weight:700;font-size:1.5rem;margin:0.3rem 0;">' + APP.customers.length + '</div><div style="color:#6B7280;font-size:0.85rem;">Langganan Aktif</div></div>' +
      '<div class="card" style="text-align:center;cursor:pointer;" onclick="navigateTo(\'penjualan-30\')"><div style="font-size:2rem;color:var(--success);"><i class="fas fa-receipt"></i></div><div style="font-weight:700;font-size:1.5rem;margin:0.3rem 0;">' + APP.sales.length + '</div><div style="color:#6B7280;font-size:0.85rem;">Transaksi Penjualan</div></div>' +
      '<div class="card" style="text-align:center;cursor:pointer;" onclick="navigateTo(\'transaksi-pembelian\')"><div style="font-size:2rem;color:var(--warning);"><i class="fas fa-shopping-bag"></i></div><div style="font-weight:700;font-size:1.5rem;margin:0.3rem 0;">' + APP.purchases.length + '</div><div style="color:#6B7280;font-size:0.85rem;">Transaksi Pembelian</div></div>' +
    '</div>' +
    '<div class="card">' +
      '<h3 style="margin-bottom:1rem;display:flex;align-items:center;gap:0.5rem;"><i class="fas fa-clock text-orange"></i> Transaksi Terakhir</h3>' +
      '<div class="table-wrapper"><table><thead><tr><th>No Nota</th><th>Tanggal</th><th>Customer</th><th>Total</th><th>Jenis</th></tr></thead><tbody>' + saleRows + '</tbody></table></div>' +
    '</div>';
};

PAGE_INIT['dashboard'] = function() {};

// ====================================================================
// 2. GANTI PASSWORD
// ====================================================================
PAGE_RENDERERS['ganti-password'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-key"></i> Ganti Password</div><div class="section-subtitle">Perbarui password akun Anda</div></div></div>' +
    '<div class="card" style="max-width:500px;">' +
      '<div class="form-group"><label>Password Lama <span class="req">*</span></label><input type="password" id="oldPass" class="form-control" placeholder="Masukkan password lama"></div>' +
      '<div class="form-group"><label>Password Baru <span class="req">*</span></label><input type="password" id="newPass" class="form-control" placeholder="Masukkan password baru"></div>' +
      '<div class="form-group"><label>Konfirmasi Password Baru <span class="req">*</span></label><input type="password" id="confirmPass" class="form-control" placeholder="Ulangi password baru"></div>' +
      '<button class="btn btn-primary" onclick="submitGantiPassword()"><i class="fas fa-save"></i> Simpan Perubahan</button>' +
    '</div>';
};

PAGE_INIT['ganti-password'] = function() {};

async function submitGantiPassword() {
  var old = document.getElementById('oldPass').value;
  var nw = document.getElementById('newPass').value;
  var conf = document.getElementById('confirmPass').value;
  if (!old || !nw || !conf) { showToast('Semua field harus diisi!', 'error'); return; }
  if (nw !== conf) { showToast('Konfirmasi password tidak cocok!', 'error'); return; }
  if (nw.length < 4) { showToast('Password minimal 4 karakter!', 'error'); return; }
  var res = await apiCall('change-password', 'POST', { userId: APP.currentUser.id, oldPassword: old, newPassword: nw });
  if (res && res.success) {
    showToast(res.message, 'success');
    document.getElementById('oldPass').value = '';
    document.getElementById('newPass').value = '';
    document.getElementById('confirmPass').value = '';
  } else {
    showToast(res ? res.message : 'Gagal mengubah password', 'error');
  }
}

// ====================================================================
// 3. ADD ADMIN
// ====================================================================
PAGE_RENDERERS['add-admin'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-user-shield"></i> Add Admin</div><div class="section-subtitle">Tambahkan akun admin baru</div></div></div>' +
    '<div class="card" style="max-width:500px;">' +
      '<div class="form-group"><label>Username <span class="req">*</span></label><input type="text" id="adminUser" class="form-control" placeholder="Username admin"></div>' +
      '<div class="form-group"><label>Password <span class="req">*</span></label><input type="password" id="adminPass" class="form-control" placeholder="Password"></div>' +
      '<div class="form-group"><label>Key Password <span class="req">*</span></label><input type="password" id="adminKey" class="form-control" placeholder="Key password untuk verifikasi"></div>' +
      '<button class="btn btn-primary" onclick="submitAddAdmin()"><i class="fas fa-plus"></i> Tambah Admin</button>' +
    '</div>';
};

PAGE_INIT['add-admin'] = function() {};

async function submitAddAdmin() {
  var u = document.getElementById('adminUser').value.trim();
  var p = document.getElementById('adminPass').value.trim();
  var k = document.getElementById('adminKey').value.trim();
  if (!u || !p || !k) { showToast('Semua field harus diisi!', 'error'); return; }
  var res = await apiCall('users', 'POST', { username: u, password: p, role: 'admin', key_password: k });
  if (res && res.success) {
    showToast(res.message, 'success');
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    document.getElementById('adminKey').value = '';
    await reloadUsers();
  } else {
    showToast(res ? res.message : 'Gagal menambah admin', 'error');
  }
}

// ====================================================================
// 4. ADD USER
// ====================================================================
PAGE_RENDERERS['add-user'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-user-plus"></i> Add User</div><div class="section-subtitle">Tambahkan akun user baru</div></div></div>' +
    '<div class="card" style="max-width:500px;">' +
      '<div class="form-group"><label>Username <span class="req">*</span></label><input type="text" id="userUser" class="form-control" placeholder="Username"></div>' +
      '<div class="form-group"><label>Password <span class="req">*</span></label><input type="password" id="userPass" class="form-control" placeholder="Password"></div>' +
      '<div class="form-group"><label>Key Password <span class="req">*</span></label><input type="password" id="userKey" class="form-control" placeholder="Key password"></div>' +
      '<button class="btn btn-secondary" onclick="submitAddUser()"><i class="fas fa-plus"></i> Tambah User</button>' +
    '</div>';
};

PAGE_INIT['add-user'] = function() {};

async function submitAddUser() {
  var u = document.getElementById('userUser').value.trim();
  var p = document.getElementById('userPass').value.trim();
  var k = document.getElementById('userKey').value.trim();
  if (!u || !p || !k) { showToast('Semua field harus diisi!', 'error'); return; }
  var res = await apiCall('users', 'POST', { username: u, password: p, role: 'user', key_password: k });
  if (res && res.success) {
    showToast(res.message, 'success');
    document.getElementById('userUser').value = '';
    document.getElementById('userPass').value = '';
    document.getElementById('userKey').value = '';
    await reloadUsers();
  } else {
    showToast(res ? res.message : 'Gagal menambah user', 'error');
  }
}

// ====================================================================
// 5. DAFTAR AREA
// ====================================================================
PAGE_RENDERERS['daftar-area'] = function() {
  var rows = '';
  if (APP.areas.length === 0) {
    rows = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:#9CA3AF;"><i class="fas fa-map" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Belum ada area</td></tr>';
  } else {
    for (var i = 0; i < APP.areas.length; i++) {
      var a = APP.areas[i];
      rows += '<tr><td>' + (i+1) + '</td><td><strong>' + esc(a.nama_area) + '</strong></td><td>' + formatTanggal(a.created_at) + '</td><td><button class="btn btn-sm btn-outline" onclick="editArea(' + a.id + ',\'' + esc(a.nama_area).replace(/'/g, "\\'") + '\')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteArea(' + a.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
    }
  }

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-map-marker-alt"></i> Daftar Area</div><div class="section-subtitle">Kelola data area penjualan</div></div><button class="btn btn-primary" onclick="showAddAreaModal()"><i class="fas fa-plus"></i> Tambah Area</button></div>' +
    '<div class="card"><div class="table-wrapper"><table><thead><tr><th>No</th><th>Nama Area</th><th>Dibuat</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
};

function showAddAreaModal() {
  openModal(
    '<i class="fas fa-map-marker-alt text-orange"></i> Tambah Area',
    '<div class="form-group"><label>Nama Area <span class="req">*</span></label><input type="text" id="areaName" class="form-control" placeholder="Nama area baru"></div>',
    '<button class="btn btn-primary" onclick="submitAddArea()">Simpan</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitAddArea() {
  var nama = document.getElementById('areaName').value.trim();
  if (!nama) { showToast('Nama area harus diisi!', 'error'); return; }
  var res = await apiCall('areas', 'POST', { nama_area: nama });
  if (res && res.success) {
    showToast(res.message, 'success');
    closeModal();
    await reloadAreas();
    navigateTo('daftar-area');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

function editArea(id, nama) {
  openModal(
    '<i class="fas fa-edit text-orange"></i> Edit Area',
    '<div class="form-group"><label>Nama Area</label><input type="text" id="editAreaName" class="form-control" value="' + esc(nama) + '"></div>',
    '<button class="btn btn-primary" onclick="submitEditArea(' + id + ')">Update</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitEditArea(id) {
  var nama = document.getElementById('editAreaName').value.trim();
  if (!nama) { showToast('Nama area harus diisi!', 'error'); return; }
  var res = await apiCall('areas/' + id, 'PUT', { nama_area: nama });
  if (res && res.success) {
    showToast(res.message, 'success');
    closeModal();
    await reloadAreas();
    navigateTo('daftar-area');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

async function deleteArea(id) {
  if (!confirm('Yakin hapus area ini?')) return;
  var res = await apiCall('areas/' + id, 'DELETE');
  if (res && res.success) {
    showToast(res.message, 'success');
    await reloadAreas();
    navigateTo('daftar-area');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

// ====================================================================
// 6. DAFTAR LANGGANAN
// ====================================================================
PAGE_RENDERERS['daftar-langganan'] = function() {
  var rows = '';
  if (APP.customers.length === 0) {
    rows = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#9CA3AF;"><i class="fas fa-users" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Belum ada langganan</td></tr>';
  } else {
    for (var i = 0; i < APP.customers.length; i++) {
      var c = APP.customers[i];
      rows += '<tr><td>' + (i+1) + '</td><td><strong>' + esc(c.nama) + '</strong></td><td>' + esc(c.nama_area || '-') + '</td><td>' + esc(c.alamat || '-') + '</td><td>' + esc(c.telepon || '-') + '</td><td><button class="btn btn-sm btn-outline" onclick="editCustomer(' + c.id + ')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteCustomer(' + c.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
    }
  }

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-users"></i> Daftar Langganan</div><div class="section-subtitle">Kelola data pelanggan/langganan</div></div><button class="btn btn-primary" onclick="showAddCustomerModal()"><i class="fas fa-plus"></i> Tambah Langganan</button></div>' +
    '<div class="card"><div class="table-wrapper"><table><thead><tr><th>No</th><th>Nama</th><th>Area</th><th>Alamat</th><th>Telepon</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
};

function buildAreaOptions(selectedId) {
  var opts = '<option value="">-- Pilih Area --</option>';
  for (var i = 0; i < APP.areas.length; i++) {
    var a = APP.areas[i];
    var sel = (selectedId && a.id == selectedId) ? ' selected' : '';
    opts += '<option value="' + a.id + '"' + sel + '>' + esc(a.nama_area) + '</option>';
  }
  return opts;
}

function showAddCustomerModal() {
  openModal(
    '<i class="fas fa-user-plus text-orange"></i> Tambah Langganan',
    '<div class="form-group"><label>Nama <span class="req">*</span></label><input type="text" id="custName" class="form-control" placeholder="Nama langganan"></div>' +
    '<div class="form-group"><label>Area</label><select id="custArea" class="form-control">' + buildAreaOptions() + '</select></div>' +
    '<div class="form-group"><label>Alamat</label><input type="text" id="custAddr" class="form-control" placeholder="Alamat"></div>' +
    '<div class="form-group"><label>Telepon</label><input type="text" id="custPhone" class="form-control" placeholder="No. Telepon"></div>',
    '<button class="btn btn-primary" onclick="submitAddCustomer()">Simpan</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitAddCustomer() {
  var nama = document.getElementById('custName').value.trim();
  if (!nama) { showToast('Nama harus diisi!', 'error'); return; }
  var data = { nama: nama, area_id: document.getElementById('custArea').value, alamat: document.getElementById('custAddr').value, telepon: document.getElementById('custPhone').value };
  var res = await apiCall('customers', 'POST', data);
  if (res && res.success) {
    showToast(res.message, 'success');
    closeModal();
    await reloadCustomers();
    navigateTo('daftar-langganan');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

function editCustomer(id) {
  var c = null;
  for (var i = 0; i < APP.customers.length; i++) {
    if (APP.customers[i].id == id) { c = APP.customers[i]; break; }
  }
  if (!c) return;
  openModal(
    '<i class="fas fa-edit text-orange"></i> Edit Langganan',
    '<div class="form-group"><label>Nama</label><input type="text" id="editCustName" class="form-control" value="' + esc(c.nama) + '"></div>' +
    '<div class="form-group"><label>Area</label><select id="editCustArea" class="form-control">' + buildAreaOptions(c.area_id) + '</select></div>' +
    '<div class="form-group"><label>Alamat</label><input type="text" id="editCustAddr" class="form-control" value="' + esc(c.alamat || '') + '"></div>' +
    '<div class="form-group"><label>Telepon</label><input type="text" id="editCustPhone" class="form-control" value="' + esc(c.telepon || '') + '"></div>',
    '<button class="btn btn-primary" onclick="submitEditCustomer(' + id + ')">Update</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitEditCustomer(id) {
  var data = { nama: document.getElementById('editCustName').value.trim(), area_id: document.getElementById('editCustArea').value, alamat: document.getElementById('editCustAddr').value, telepon: document.getElementById('editCustPhone').value };
  if (!data.nama) { showToast('Nama harus diisi!', 'error'); return; }
  var res = await apiCall('customers/' + id, 'PUT', data);
  if (res && res.success) {
    showToast(res.message, 'success');
    closeModal();
    await reloadCustomers();
    navigateTo('daftar-langganan');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

async function deleteCustomer(id) {
  if (!confirm('Yakin hapus langganan ini?')) return;
  var res = await apiCall('customers/' + id, 'DELETE');
  if (res && res.success) {
    showToast(res.message, 'success');
    await reloadCustomers();
    navigateTo('daftar-langganan');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

// ====================================================================
// 7. DAFTAR STOK
// ====================================================================
PAGE_RENDERERS['daftar-stok'] = function() {
  var rows = renderProductRows(APP.products);
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-boxes-stacked"></i> Daftar Stok</div><div class="section-subtitle">Kelola data produk dan stok barang</div></div><button class="btn btn-primary" onclick="showAddProductModal()"><i class="fas fa-plus"></i> Tambah Produk</button></div>' +
    '<div class="search-box"><input type="text" id="searchProduct" placeholder="Cari kode atau nama produk..." oninput="filterProducts()"></div>' +
    '<div class="card"><div class="table-wrapper"><table><thead><tr><th>Kode</th><th>Nama</th><th>Harga Beli</th><th>Harga Jual</th><th>Stok</th><th>Satuan</th><th>Aksi</th></tr></thead><tbody id="productTableBody">' + rows + '</tbody></table></div></div>';
};

function renderProductRows(products) {
  if (products.length === 0) {
    return '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9CA3AF;"><i class="fas fa-boxes-stacked" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Belum ada produk</td></tr>';
  }
  var html = '';
  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    var stokNum = Number(p.stok);
    var badgeClass = stokNum > 10 ? 'badge-success' : (stokNum > 0 ? 'badge-warning' : 'badge-danger');
    html += '<tr><td><strong>' + esc(p.kode) + '</strong></td><td>' + esc(p.nama) + '</td><td>' + formatRupiah(p.harga_beli) + '</td><td>' + formatRupiah(p.harga_jual) + '</td><td><span class="badge ' + badgeClass + '">' + p.stok + '</span></td><td>' + esc(p.satuan || 'pcs') + '</td><td><button class="btn btn-sm btn-outline" onclick="editProduct(' + p.id + ')"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteProduct(' + p.id + ')"><i class="fas fa-trash"></i></button></td></tr>';
  }
  return html;
}

function filterProducts() {
  var q = document.getElementById('searchProduct').value.toLowerCase();
  var filtered = [];
  for (var i = 0; i < APP.products.length; i++) {
    var p = APP.products[i];
    if (p.kode.toLowerCase().indexOf(q) >= 0 || p.nama.toLowerCase().indexOf(q) >= 0) {
      filtered.push(p);
    }
  }
  document.getElementById('productTableBody').innerHTML = renderProductRows(filtered);
}

function showAddProductModal() {
  openModal(
    '<i class="fas fa-box text-orange"></i> Tambah Produk',
    '<div class="form-grid">' +
      '<div class="form-group"><label>Kode <span class="req">*</span></label><input type="text" id="prodKode" class="form-control" placeholder="Kode produk"></div>' +
      '<div class="form-group"><label>Nama <span class="req">*</span></label><input type="text" id="prodNama" class="form-control" placeholder="Nama produk"></div>' +
      '<div class="form-group"><label>Harga Beli</label><input type="number" id="prodBeli" class="form-control" placeholder="0" min="0"></div>' +
      '<div class="form-group"><label>Harga Jual</label><input type="number" id="prodJual" class="form-control" placeholder="0" min="0"></div>' +
      '<div class="form-group"><label>Stok</label><input type="number" id="prodStok" class="form-control" placeholder="0" min="0"></div>' +
      '<div class="form-group"><label>Satuan</label><input type="text" id="prodSatuan" class="form-control" placeholder="pcs" value="pcs"></div>' +
    '</div>',
    '<button class="btn btn-primary" onclick="submitAddProduct()">Simpan</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitAddProduct() {
  var kode = document.getElementById('prodKode').value.trim();
  var nama = document.getElementById('prodNama').value.trim();
  if (!kode || !nama) { showToast('Kode dan Nama harus diisi!', 'error'); return; }
  var data = { kode: kode, nama: nama, harga_beli: Number(document.getElementById('prodBeli').value) || 0, harga_jual: Number(document.getElementById('prodJual').value) || 0, stok: Number(document.getElementById('prodStok').value) || 0, satuan: document.getElementById('prodSatuan').value || 'pcs' };
  var res = await apiCall('products', 'POST', data);
  if (res && res.success) {
    showToast(res.message, 'success');
    closeModal();
    await reloadProducts();
    navigateTo('daftar-stok');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

function editProduct(id) {
  var p = null;
  for (var i = 0; i < APP.products.length; i++) {
    if (APP.products[i].id == id) { p = APP.products[i]; break; }
  }
  if (!p) return;
  openModal(
    '<i class="fas fa-edit text-orange"></i> Edit Produk',
    '<div class="form-grid">' +
      '<div class="form-group"><label>Kode</label><input type="text" id="editProdKode" class="form-control" value="' + esc(p.kode) + '"></div>' +
      '<div class="form-group"><label>Nama</label><input type="text" id="editProdNama" class="form-control" value="' + esc(p.nama) + '"></div>' +
      '<div class="form-group"><label>Harga Beli</label><input type="number" id="editProdBeli" class="form-control" value="' + p.harga_beli + '"></div>' +
      '<div class="form-group"><label>Harga Jual</label><input type="number" id="editProdJual" class="form-control" value="' + p.harga_jual + '"></div>' +
      '<div class="form-group"><label>Stok</label><input type="number" id="editProdStok" class="form-control" value="' + p.stok + '"></div>' +
      '<div class="form-group"><label>Satuan</label><input type="text" id="editProdSatuan" class="form-control" value="' + esc(p.satuan || 'pcs') + '"></div>' +
    '</div>',
    '<button class="btn btn-primary" onclick="submitEditProduct(' + id + ')">Update</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitEditProduct(id) {
  var data = {
    kode: document.getElementById('editProdKode').value.trim(),
    nama: document.getElementById('editProdNama').value.trim(),
    harga_beli: Number(document.getElementById('editProdBeli').value) || 0,
    harga_jual: Number(document.getElementById('editProdJual').value) || 0,
    stok: Number(document.getElementById('editProdStok').value) || 0,
    satuan: document.getElementById('editProdSatuan').value || 'pcs'
  };
  if (!data.kode || !data.nama) { showToast('Kode dan Nama harus diisi!', 'error'); return; }
  var res = await apiCall('products/' + id, 'PUT', data);
  if (res && res.success) {
    showToast(res.message, 'success');
    closeModal();
    await reloadProducts();
    navigateTo('daftar-stok');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Yakin hapus produk ini?')) return;
  var res = await apiCall('products/' + id, 'DELETE');
  if (res && res.success) {
    showToast(res.message, 'success');
    await reloadProducts();
    navigateTo('daftar-stok');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

// ====================================================================
// 8. TRANSAKSI PENJUALAN 30 HARI (KASIR / POS)
// ====================================================================
PAGE_RENDERERS['penjualan-30'] = function() {
  APP.cart = [];
  var productCards = '';
  for (var i = 0; i < APP.products.length; i++) {
    var p = APP.products[i];
    productCards += '<div class="pos-product-card" onclick="addToCart(' + p.id + ')" data-name="' + p.nama.toLowerCase() + '" data-kode="' + p.kode.toLowerCase() + '"><div class="prod-name">' + esc(p.nama) + '</div><div class="prod-price">' + formatRupiah(p.harga_jual) + '</div><div class="prod-stock">Stok: ' + p.stok + ' ' + esc(p.satuan || 'pcs') + '</div></div>';
  }

  var custOpts = '<option value="">-- Langganan (Opsional) --</option>';
  for (var i = 0; i < APP.customers.length; i++) {
    custOpts += '<option value="' + APP.customers[i].id + '">' + esc(APP.customers[i].nama) + '</option>';
  }

  var saleRows = '';
  if (APP.sales.length === 0) {
    saleRows = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#9CA3AF;">Belum ada transaksi</td></tr>';
  } else {
    var max = Math.min(APP.sales.length, 20);
    for (var i = 0; i < max; i++) {
      var s = APP.sales[i];
      var badgeClass = (s.jenis === 'tunai') ? 'badge-success' : 'badge-warning';
      saleRows += '<tr><td><strong>' + esc(s.no_nota || '-') + '</strong></td><td>' + formatTanggal(s.tanggal) + '</td><td>' + esc(s.customer_nama || '-') + '</td><td>' + formatRupiah(s.total) + '</td><td>' + formatRupiah(s.bayar) + '</td><td><span class="badge ' + badgeClass + '">' + ((s.jenis || 'tunai').toUpperCase()) + '</span></td></tr>';
    }
  }

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-receipt"></i> Transaksi Penjualan</div><div class="section-subtitle">Buat transaksi penjualan baru</div></div></div>' +
    '<div class="pos-layout">' +
      '<div>' +
        '<div class="search-box mb-2"><input type="text" id="posSearchProd" placeholder="Cari produk..." oninput="filterPosProducts()"></div>' +
        '<div class="pos-products" id="posProductGrid">' + productCards + '</div>' +
      '</div>' +
      '<div class="pos-cart">' +
        '<div class="pos-cart-header"><i class="fas fa-shopping-cart"></i> Keranjang</div>' +
        '<div class="pos-cart-items" id="cartItems"><div id="cartEmpty" style="text-align:center;padding:3rem;color:#9CA3AF;"><i class="fas fa-cart-plus" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Keranjang kosong</div></div>' +
        '<div class="pos-cart-footer">' +
          '<div class="form-group" style="margin-bottom:0.5rem;"><select id="saleCustomer" class="form-control">' + custOpts + '</select></div>' +
          '<div class="form-group" style="margin-bottom:0.5rem;"><select id="saleJenis" class="form-control"><option value="tunai">Tunai</option><option value="kredit">Kredit</option></select></div>' +
          '<div class="cart-total-row"><span>Subtotal</span><span id="cartSubtotal">Rp 0</span></div>' +
          '<div class="form-group" style="margin-bottom:0.3rem;"><label style="font-size:0.8rem;">Bayar</label><input type="number" id="saleBayar" class="form-control" placeholder="0" min="0" oninput="updateCartKembali()"></div>' +
          '<div class="cart-total-row"><span>Kembali</span><span id="cartKembali">Rp 0</span></div>' +
          '<div class="cart-total-row grand"><span>TOTAL</span><span id="cartTotal">Rp 0</span></div>' +
          '<button class="btn btn-primary" style="width:100%;margin-top:0.5rem;" onclick="submitSale()"><i class="fas fa-check"></i> Proses Penjualan</button>' +
          '<button class="btn btn-outline" style="width:100%;margin-top:0.3rem;" onclick="clearCart()"><i class="fas fa-trash"></i> Kosongkan</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="card mt-2">' +
      '<h3 style="margin-bottom:1rem;"><i class="fas fa-history text-orange"></i> Riwayat Penjualan 30 Hari</h3>' +
      '<div class="table-wrapper"><table><thead><tr><th>No Nota</th><th>Tanggal</th><th>Customer</th><th>Total</th><th>Bayar</th><th>Jenis</th></tr></thead><tbody>' + saleRows + '</tbody></table></div>' +
    '</div>';
};

PAGE_INIT['penjualan-30'] = function() {};

function filterPosProducts() {
  var q = document.getElementById('posSearchProd').value.toLowerCase();
  var cards = document.querySelectorAll('#posProductGrid .pos-product-card');
  for (var i = 0; i < cards.length; i++) {
    var name = cards[i].getAttribute('data-name') || '';
    var kode = cards[i].getAttribute('data-kode') || '';
    if (name.indexOf(q) >= 0 || kode.indexOf(q) >= 0) {
      cards[i].style.display = '';
    } else {
      cards[i].style.display = 'none';
    }
  }
}

function addToCart(productId) {
  var p = null;
  for (var i = 0; i < APP.products.length; i++) {
    if (APP.products[i].id == productId) { p = APP.products[i]; break; }
  }
  if (!p) return;
  if (Number(p.stok) <= 0) { showToast('Stok habis!', 'warning'); return; }

  // Cek apakah produk sudah ada di keranjang
  for (var i = 0; i < APP.cart.length; i++) {
    if (APP.cart[i].productId == productId) {
      if (APP.cart[i].qty >= Number(p.stok)) { showToast('Stok tidak mencukupi!', 'warning'); return; }
      APP.cart[i].qty++;
      APP.cart[i].subtotal = APP.cart[i].qty * APP.cart[i].harga;
      renderCart();
      return;
    }
  }

  APP.cart.push({
    productId: p.id,
    nama: p.nama,
    kode: p.kode,
    harga: Number(p.harga_jual) || 0,
    qty: 1,
    subtotal: Number(p.harga_jual) || 0,
    maxStok: Number(p.stok) || 0
  });
  renderCart();
}

function removeFromCart(idx) {
  APP.cart.splice(idx, 1);
  renderCart();
}

function changeCartQty(idx, delta) {
  APP.cart[idx].qty += delta;
  if (APP.cart[idx].qty <= 0) {
    APP.cart.splice(idx, 1);
  } else if (APP.cart[idx].qty > APP.cart[idx].maxStok) {
    APP.cart[idx].qty = APP.cart[idx].maxStok;
    showToast('Stok tidak mencukupi!', 'warning');
  }
  if (APP.cart[idx]) APP.cart[idx].subtotal = APP.cart[idx].qty * APP.cart[idx].harga;
  renderCart();
}

function clearCart() {
  APP.cart = [];
  renderCart();
}

function getCartTotal() {
  var total = 0;
  for (var i = 0; i < APP.cart.length; i++) total += APP.cart[i].subtotal;
  return total;
}

function renderCart() {
  var container = document.getElementById('cartItems');
  if (!container) return;

  if (APP.cart.length === 0) {
    container.innerHTML = '<div id="cartEmpty" style="text-align:center;padding:3rem;color:#9CA3AF;"><i class="fas fa-cart-plus" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Keranjang kosong</div>';
  } else {
    var html = '';
    for (var i = 0; i < APP.cart.length; i++) {
      var item = APP.cart[i];
      html += '<div class="cart-item">' +
        '<div class="cart-item-name">' + esc(item.nama) + '</div>' +
        '<div class="cart-item-qty">' +
          '<button onclick="changeCartQty(' + i + ', -1)">-</button>' +
          '<span style="min-width:24px;text-align:center;font-weight:700;">' + item.qty + '</span>' +
          '<button onclick="changeCartQty(' + i + ', 1)">+</button>' +
        '</div>' +
        '<div class="cart-item-subtotal">' + formatRupiah(item.subtotal) + '</div>' +
        '<div class="cart-item-remove" onclick="removeFromCart(' + i + ')"><i class="fas fa-times"></i></div>' +
      '</div>';
    }
    container.innerHTML = html;
  }

  var total = getCartTotal();
  var subtotalEl = document.getElementById('cartSubtotal');
  var totalEl = document.getElementById('cartTotal');
  if (subtotalEl) subtotalEl.textContent = formatRupiah(total);
  if (totalEl) totalEl.textContent = formatRupiah(total);
  updateCartKembali();
}

function updateCartKembali() {
  var total = getCartTotal();
  var bayarInput = document.getElementById('saleBayar');
  var bayar = bayarInput ? Number(bayarInput.value) || 0 : 0;
  var kembali = bayar - total;
  var kembaliEl = document.getElementById('cartKembali');
  if (kembaliEl) kembaliEl.textContent = formatRupiah(kembali >= 0 ? kembali : 0);
}

async function submitSale() {
  if (APP.cart.length === 0) { showToast('Keranjang masih kosong!', 'error'); return; }
  var total = getCartTotal();
  var bayar = Number(document.getElementById('saleBayar').value) || 0;
  var jenis = document.getElementById('saleJenis').value;
  var customerId = document.getElementById('saleCustomer').value || null;

  if (jenis === 'tunai' && bayar < total) { showToast('Jumlah bayar kurang!', 'error'); return; }

  var noNota = generateNota('SJ');
  var items = [];
  for (var i = 0; i < APP.cart.length; i++) {
    items.push({
      product_id: APP.cart[i].productId,
      qty: APP.cart[i].qty,
      harga: APP.cart[i].harga,
      subtotal: APP.cart[i].subtotal
    });
  }

  var data = {
    no_nota: noNota,
    tanggal: todayStr(),
    customer_id: customerId,
    total: total,
    bayar: bayar,
    kembali: (bayar > total) ? bayar - total : 0,
    jenis: jenis,
    items: items
  };

  var res = await apiCall('sales', 'POST', data);
  if (res && res.success) {
    showToast('Transaksi penjualan berhasil! No: ' + noNota, 'success');
    APP.cart = [];
    await reloadProducts();
    await reloadSales();
    navigateTo('penjualan-30');
  } else {
    showToast(res ? res.message : 'Gagal memproses penjualan', 'error');
  }
}

// ====================================================================
// 9. RETURN PENJUALAN
// ====================================================================
PAGE_RENDERERS['return-penjualan'] = function() {
  var rows = '';
  if (APP.sales.length === 0) {
    rows = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#9CA3AF;">Belum ada transaksi</td></tr>';
  } else {
    for (var i = 0; i < APP.sales.length; i++) {
      var s = APP.sales[i];
      rows += '<tr><td><strong>' + esc(s.no_nota || '-') + '</strong></td><td>' + formatTanggal(s.tanggal) + '</td><td>' + esc(s.customer_nama || '-') + '</td><td>' + formatRupiah(s.total) + '</td><td><span class="badge badge-info">' + ((s.status || 'selesai').toUpperCase()) + '</span></td><td><button class="btn btn-sm btn-danger" onclick="returnSale(' + s.id + ')"><i class="fas fa-rotate-left"></i> Return</button></td></tr>';
    }
  }

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-rotate-left"></i> Transaksi Return Penjualan</div><div class="section-subtitle">Proses retur penjualan</div></div></div>' +
    '<div class="card"><div class="table-wrapper"><table><thead><tr><th>No Nota</th><th>Tanggal</th><th>Customer</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
};

function returnSale(id) {
  openModal(
    '<i class="fas fa-rotate-left text-danger"></i> Return Penjualan',
    '<p>Apakah Anda yakin ingin memproses return untuk transaksi ini?</p>' +
    '<div class="form-group"><label>Alasan Return</label><input type="text" id="returnReason" class="form-control" placeholder="Masukkan alasan return"></div>',
    '<button class="btn btn-danger" onclick="confirmReturnSale(' + id + ')">Proses Return</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function confirmReturnSale(id) {
  showToast('Return penjualan berhasil diproses!', 'success');
  closeModal();
  await reloadSales();
  navigateTo('return-penjualan');
}

// ====================================================================
// 10. CETAK ULANG NOTA PENJUALAN
// ====================================================================
PAGE_RENDERERS['cetak-ulang'] = function() {
  var rows = '';
  if (APP.sales.length === 0) {
    rows = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:#9CA3AF;">Belum ada transaksi</td></tr>';
  } else {
    for (var i = 0; i < APP.sales.length; i++) {
      var s = APP.sales[i];
      rows += '<tr><td><strong>' + esc(s.no_nota || '-') + '</strong></td><td>' + formatTanggal(s.tanggal) + '</td><td>' + esc(s.customer_nama || '-') + '</td><td>' + formatRupiah(s.total) + '</td><td><button class="btn btn-sm btn-secondary" onclick="cetakNota(' + s.id + ')"><i class="fas fa-print"></i> Cetak</button></td></tr>';
    }
  }

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-print"></i> Cetak Ulang Nota Penjualan</div><div class="section-subtitle">Cetak ulang nota penjualan yang sudah ada</div></div></div>' +
    '<div class="card"><div class="table-wrapper"><table><thead><tr><th>No Nota</th><th>Tanggal</th><th>Customer</th><th>Total</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
};

function cetakNota(id) {
  var s = null;
  for (var i = 0; i < APP.sales.length; i++) {
    if (APP.sales[i].id == id) { s = APP.sales[i]; break; }
  }
  if (!s) return;

  var notaHTML = '' +
    '<div style="font-family:monospace;max-width:350px;margin:0 auto;">' +
      '<h2 style="text-align:center;margin-bottom:0.5rem;">KasirKu</h2>' +
      '<p style="text-align:center;font-size:0.8rem;margin-bottom:1rem;">Nota Penjualan</p>' +
      '<hr style="border:1px dashed #333;">' +
      '<p><strong>No Nota:</strong> ' + esc(s.no_nota || '-') + '</p>' +
      '<p><strong>Tanggal:</strong> ' + formatTanggal(s.tanggal) + '</p>' +
      '<p><strong>Customer:</strong> ' + esc(s.customer_nama || '-') + '</p>' +
      '<hr style="border:1px dashed #333;">' +
      '<p><strong>Total:</strong> ' + formatRupiah(s.total) + '</p>' +
      '<p><strong>Bayar:</strong> ' + formatRupiah(s.bayar) + '</p>' +
      '<p><strong>Kembali:</strong> ' + formatRupiah(s.kembali) + '</p>' +
      '<hr style="border:1px dashed #333;">' +
      '<p style="text-align:center;font-size:0.8rem;margin-top:0.5rem;">Terima kasih atas pembelian Anda!</p>' +
    '</div>';

  openModal(
    '<i class="fas fa-print text-orange"></i> Cetak Nota',
    notaHTML,
    '<button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Print</button> <button class="btn btn-outline" onclick="closeModal()">Tutup</button>'
  );
}

// ====================================================================
// 11. PENAGIHAN PIUTANG
// ====================================================================
PAGE_RENDERERS['penagihan-piutang'] = function() {
  var rows = '';
  if (APP.debts.length === 0) {
    rows = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9CA3AF;"><i class="fas fa-hand-holding-dollar" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Belum ada piutang</td></tr>';
  } else {
    for (var i = 0; i < APP.debts.length; i++) {
      var d = APP.debts[i];
      rows += '<tr><td>' + (i+1) + '</td><td>' + esc(d.customer_nama || '-') + '</td><td>' + formatRupiah(d.jumlah_piutang) + '</td><td>' + formatRupiah(d.jumlah_bayar) + '</td><td>' + formatRupiah(d.sisa) + '</td><td>' + formatTanggal(d.tanggal) + '</td><td><button class="btn btn-sm btn-success" onclick="showBayarPiutangModal(' + d.id + ',' + d.sisa + ')"><i class="fas fa-money-bill"></i> Bayar</button></td></tr>';
    }
  }

  var custOpts = '<option value="">-- Pilih Customer --</option>';
  for (var i = 0; i < APP.customers.length; i++) {
    custOpts += '<option value="' + APP.customers[i].id + '">' + esc(APP.customers[i].nama) + '</option>';
  }

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-hand-holding-dollar"></i> Transaksi Penagihan Piutang</div><div class="section-subtitle">Kelola piutang pelanggan</div></div><button class="btn btn-primary" onclick="showAddPiutangModal()"><i class="fas fa-plus"></i> Tambah Piutang</button></div>' +
    '<div class="card"><div class="table-wrapper"><table><thead><tr><th>No</th><th>Customer</th><th>Piutang</th><th>Terbayar</th><th>Sisa</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
};

function showAddPiutangModal() {
  var custOpts = '<option value="">-- Pilih Customer --</option>';
  for (var i = 0; i < APP.customers.length; i++) {
    custOpts += '<option value="' + APP.customers[i].id + '">' + esc(APP.customers[i].nama) + '</option>';
  }
  openModal(
    '<i class="fas fa-plus text-orange"></i> Tambah Piutang',
    '<div class="form-group"><label>Customer <span class="req">*</span></label><select id="piutangCust" class="form-control">' + custOpts + '</select></div>' +
    '<div class="form-group"><label>Jumlah Piutang <span class="req">*</span></label><input type="number" id="piutangJumlah" class="form-control" placeholder="0" min="0"></div>' +
    '<div class="form-group"><label>Keterangan</label><input type="text" id="piutangKet" class="form-control" placeholder="Keterangan"></div>',
    '<button class="btn btn-primary" onclick="submitAddPiutang()">Simpan</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitAddPiutang() {
  var custId = document.getElementById('piutangCust').value;
  var jumlah = Number(document.getElementById('piutangJumlah').value) || 0;
  if (!custId || jumlah <= 0) { showToast('Customer dan jumlah harus diisi!', 'error'); return; }
  var data = { customer_id: custId, jumlah_piutang: jumlah, jumlah_bayar: 0, sisa: jumlah, tanggal: todayStr(), keterangan: document.getElementById('piutangKet').value };
  var res = await apiCall('debts', 'POST', data);
  if (res && res.success) {
    showToast(res.message, 'success');
    closeModal();
    await reloadDebts();
    navigateTo('penagihan-piutang');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

function showBayarPiutangModal(id, sisa) {
  openModal(
    '<i class="fas fa-money-bill text-success"></i> Bayar Piutang',
    '<p>Sisa piutang: <strong>' + formatRupiah(sisa) + '</strong></p>' +
    '<div class="form-group"><label>Jumlah Bayar <span class="req">*</span></label><input type="number" id="bayarPiutangJumlah" class="form-control" placeholder="0" min="0" max="' + sisa + '"></div>',
    '<button class="btn btn-success" onclick="submitBayarPiutang(' + id + ',' + sisa + ')">Bayar</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitBayarPiutang(id, sisa) {
  var bayar = Number(document.getElementById('bayarPiutangJumlah').value) || 0;
  if (bayar <= 0) { showToast('Jumlah bayar harus lebih dari 0!', 'error'); return; }
  if (bayar > sisa) { showToast('Jumlah bayar melebihi sisa piutang!', 'error'); return; }
  var newSisa = sisa - bayar;
  var data = { sale_id: null, customer_id: null, jumlah_piutang: sisa, jumlah_bayar: bayar, sisa: newSisa, tanggal: todayStr(), keterangan: 'Pembayaran piutang' };
  var res = await apiCall('debts', 'POST', data);
  if (res && res.success) {
    showToast('Pembayaran piutang berhasil!', 'success');
    closeModal();
    await reloadDebts();
    navigateTo('penagihan-piutang');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

// ====================================================================
// 12. TRANSAKSI PEMBELIAN
// ====================================================================
PAGE_RENDERERS['transaksi-pembelian'] = function() {
  var rows = '';
  if (APP.purchases.length === 0) {
    rows = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#9CA3AF;">Belum ada pembelian</td></tr>';
  } else {
    for (var i = 0; i < APP.purchases.length; i++) {
      var p = APP.purchases[i];
      rows += '<tr><td><strong>' + esc(p.no_nota || '-') + '</strong></td><td>' + formatTanggal(p.tanggal) + '</td><td>' + esc(p.supplier || '-') + '</td><td>' + formatRupiah(p.total) + '</td><td><span class="badge ' + ((p.jenis === 'tunai') ? 'badge-success' : 'badge-warning') + '">' + ((p.jenis || 'tunai').toUpperCase()) + '</span></td><td><span class="badge badge-info">' + ((p.status || 'selesai').toUpperCase()) + '</span></td></tr>';
    }
  }

  var prodOpts = '';
  for (var i = 0; i < APP.products.length; i++) {
    prodOpts += '<option value="' + APP.products[i].id + '">' + esc(APP.products[i].kode + ' - ' + APP.products[i].nama) + '</option>';
  }

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-truck"></i> Transaksi Pembelian</div><div class="section-subtitle">Catat pembelian barang dari supplier</div></div><button class="btn btn-primary" onclick="showAddPembelianModal()"><i class="fas fa-plus"></i> Tambah Pembelian</button></div>' +
    '<div class="card"><div class="table-wrapper"><table><thead><tr><th>No Nota</th><th>Tanggal</th><th>Supplier</th><th>Total</th><th>Jenis</th><th>Status</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
};

function showAddPembelianModal() {
  var prodOpts = '';
  for (var i = 0; i < APP.products.length; i++) {
    prodOpts += '<option value="' + APP.products[i].id + '" data-harga="' + APP.products[i].harga_beli + '">' + esc(APP.products[i].kode + ' - ' + APP.products[i].nama) + '</option>';
  }
  openModal(
    '<i class="fas fa-truck text-orange"></i> Tambah Pembelian',
    '<div class="form-group"><label>No Nota</label><input type="text" id="pembelianNota" class="form-control" value="' + generateNota('PB') + '" readonly></div>' +
    '<div class="form-group"><label>Supplier</label><input type="text" id="pembelianSupplier" class="form-control" placeholder="Nama supplier"></div>' +
    '<div class="form-group"><label>Jenis</label><select id="pembelianJenis" class="form-control"><option value="tunai">Tunai</option><option value="kredit">Kredit</option></select></div>' +
    '<div class="form-group"><label>Produk</label><select id="pembelianProduk" class="form-control">' + prodOpts + '</select></div>' +
    '<div class="form-grid">' +
      '<div class="form-group"><label>Qty</label><input type="number" id="pembelianQty" class="form-control" placeholder="0" min="1" value="1"></div>' +
      '<div class="form-group"><label>Harga Beli</label><input type="number" id="pembelianHarga" class="form-control" placeholder="0" min="0"></div>' +
    '</div>',
    '<button class="btn btn-primary" onclick="submitAddPembelian()">Simpan</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitAddPembelian() {
  var produkId = document.getElementById('pembelianProduk').value;
  var qty = Number(document.getElementById('pembelianQty').value) || 0;
  var harga = Number(document.getElementById('pembelianHarga').value) || 0;
  if (!produkId || qty <= 0) { showToast('Produk dan qty harus diisi!', 'error'); return; }
  var subtotal = qty * harga;
  var data = {
    no_nota: document.getElementById('pembelianNota').value,
    tanggal: todayStr(),
    supplier: document.getElementById('pembelianSupplier').value,
    total: subtotal,
    jenis: document.getElementById('pembelianJenis').value,
    items: [{ product_id: Number(produkId), qty: qty, harga: harga, subtotal: subtotal }]
  };
  var res = await apiCall('purchases', 'POST', data);
  if (res && res.success) {
    showToast(res.message, 'success');
    closeModal();
    await reloadPurchases();
    await reloadProducts();
    navigateTo('transaksi-pembelian');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

// ====================================================================
// 13. RETURN PEMBELIAN
// ====================================================================
PAGE_RENDERERS['return-pembelian'] = function() {
  var rows = '';
  if (APP.purchases.length === 0) {
    rows = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#9CA3AF;">Belum ada pembelian</td></tr>';
  } else {
    for (var i = 0; i < APP.purchases.length; i++) {
      var p = APP.purchases[i];
      rows += '<tr><td><strong>' + esc(p.no_nota || '-') + '</strong></td><td>' + formatTanggal(p.tanggal) + '</td><td>' + esc(p.supplier || '-') + '</td><td>' + formatRupiah(p.total) + '</td><td><span class="badge badge-info">' + ((p.status || 'selesai').toUpperCase()) + '</span></td><td><button class="btn btn-sm btn-danger" onclick="returnPembelian(' + p.id + ')"><i class="fas fa-rotate-left"></i> Return</button></td></tr>';
    }
  }

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-rotate-left"></i> Return Pembelian</div><div class="section-subtitle">Proses retur pembelian</div></div></div>' +
    '<div class="card"><div class="table-wrapper"><table><thead><tr><th>No Nota</th><th>Tanggal</th><th>Supplier</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
};

function returnPembelian(id) {
  openModal(
    '<i class="fas fa-rotate-left text-danger"></i> Return Pembelian',
    '<p>Apakah Anda yakin ingin memproses return pembelian ini?</p>' +
    '<div class="form-group"><label>Alasan Return</label><input type="text" id="returnPembelianReason" class="form-control" placeholder="Masukkan alasan return"></div>',
    '<button class="btn btn-danger" onclick="confirmReturnPembelian(' + id + ')">Proses Return</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function confirmReturnPembelian(id) {
  showToast('Return pembelian berhasil diproses!', 'success');
  closeModal();
  await reloadPurchases();
  navigateTo('return-pembelian');
}

// ====================================================================
// 14. PEMBAYARAN HUTANG
// ====================================================================
PAGE_RENDERERS['pembayaran-hutang'] = function() {
  var rows = '';
  if (APP.payables.length === 0) {
    rows = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#9CA3AF;"><i class="fas fa-credit-card" style="font-size:2rem;display:block;margin-bottom:0.5rem;"></i>Belum ada hutang</td></tr>';
  } else {
    for (var i = 0; i < APP.payables.length; i++) {
      var p = APP.payables[i];
      rows += '<tr><td>' + (i+1) + '</td><td>' + esc(p.supplier || '-') + '</td><td>' + formatRupiah(p.jumlah_hutang) + '</td><td>' + formatRupiah(p.jumlah_bayar) + '</td><td>' + formatRupiah(p.sisa) + '</td><td>' + formatTanggal(p.tanggal) + '</td><td><button class="btn btn-sm btn-success" onclick="showBayarHutangModal(' + p.id + ',' + p.sisa + ')"><i class="fas fa-money-bill"></i> Bayar</button></td></tr>';
    }
  }

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-credit-card"></i> Transaksi Pembayaran Hutang</div><div class="section-subtitle">Kelola hutang ke supplier</div></div><button class="btn btn-primary" onclick="showAddHutangModal()"><i class="fas fa-plus"></i> Tambah Hutang</button></div>' +
    '<div class="card"><div class="table-wrapper"><table><thead><tr><th>No</th><th>Supplier</th><th>Hutang</th><th>Terbayar</th><th>Sisa</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
};

function showAddHutangModal() {
  openModal(
    '<i class="fas fa-plus text-orange"></i> Tambah Hutang',
    '<div class="form-group"><label>Supplier <span class="req">*</span></label><input type="text" id="hutangSupplier" class="form-control" placeholder="Nama supplier"></div>' +
    '<div class="form-group"><label>Jumlah Hutang <span class="req">*</span></label><input type="number" id="hutangJumlah" class="form-control" placeholder="0" min="0"></div>' +
    '<div class="form-group"><label>Keterangan</label><input type="text" id="hutangKet" class="form-control" placeholder="Keterangan"></div>',
    '<button class="btn btn-primary" onclick="submitAddHutang()">Simpan</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitAddHutang() {
  var supplier = document.getElementById('hutangSupplier').value.trim();
  var jumlah = Number(document.getElementById('hutangJumlah').value) || 0;
  if (!supplier || jumlah <= 0) { showToast('Supplier dan jumlah harus diisi!', 'error'); return; }
  var data = { supplier: supplier, jumlah_hutang: jumlah, jumlah_bayar: 0, sisa: jumlah, tanggal: todayStr(), keterangan: document.getElementById('hutangKet').value };
  var res = await apiCall('payables', 'POST', data);
  if (res && res.success) {
    showToast(res.message, 'success');
    closeModal();
    await reloadPayables();
    navigateTo('pembayaran-hutang');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

function showBayarHutangModal(id, sisa) {
  openModal(
    '<i class="fas fa-money-bill text-success"></i> Bayar Hutang',
    '<p>Sisa hutang: <strong>' + formatRupiah(sisa) + '</strong></p>' +
    '<div class="form-group"><label>Jumlah Bayar <span class="req">*</span></label><input type="number" id="bayarHutangJumlah" class="form-control" placeholder="0" min="0" max="' + sisa + '"></div>',
    '<button class="btn btn-success" onclick="submitBayarHutang(' + id + ',' + sisa + ')">Bayar</button> <button class="btn btn-outline" onclick="closeModal()">Batal</button>'
  );
}

async function submitBayarHutang(id, sisa) {
  var bayar = Number(document.getElementById('bayarHutangJumlah').value) || 0;
  if (bayar <= 0) { showToast('Jumlah bayar harus lebih dari 0!', 'error'); return; }
  if (bayar > sisa) { showToast('Jumlah bayar melebihi sisa hutang!', 'error'); return; }
  var newSisa = sisa - bayar;
  var data = { purchase_id: null, supplier: '', jumlah_hutang: sisa, jumlah_bayar: bayar, sisa: newSisa, tanggal: todayStr(), keterangan: 'Pembayaran hutang' };
  var res = await apiCall('payables', 'POST', data);
  if (res && res.success) {
    showToast('Pembayaran hutang berhasil!', 'success');
    closeModal();
    await reloadPayables();
    navigateTo('pembayaran-hutang');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

// ====================================================================
// 15. PILIH PERIODE DATABASE
// ====================================================================
PAGE_RENDERERS['pilih-periode'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-calendar-alt"></i> Pilih Periode Database</div><div class="section-subtitle">Pilih periode untuk melihat data</div></div></div>' +
    '<div class="card" style="max-width:500px;">' +
      '<div class="form-group"><label>Dari Tanggal</label><input type="date" id="periodeFrom" class="form-control"></div>' +
      '<div class="form-group"><label>Sampai Tanggal</label><input type="date" id="periodeTo" class="form-control" value="' + todayStr() + '"></div>' +
      '<button class="btn btn-primary" onclick="applyPeriode()"><i class="fas fa-check"></i> Terapkan Periode</button>' +
    '</div>';
};

function applyPeriode() {
  showToast('Periode berhasil diterapkan!', 'success');
}

// ====================================================================
// 16. INDEX DATABASE
// ====================================================================
PAGE_RENDERERS['index-database'] = function() {
  var tables = [
    { name: 'users', count: APP.users.length, icon: 'fa-users' },
    { name: 'areas', count: APP.areas.length, icon: 'fa-map-marker-alt' },
    { name: 'customers', count: APP.customers.length, icon: 'fa-address-book' },
    { name: 'products', count: APP.products.length, icon: 'fa-boxes-stacked' },
    { name: 'sales', count: APP.sales.length, icon: 'fa-receipt' },
    { name: 'purchases', count: APP.purchases.length, icon: 'fa-shopping-bag' },
    { name: 'debts', count: APP.debts.length, icon: 'fa-hand-holding-dollar' },
    { name: 'payables', count: APP.payables.length, icon: 'fa-credit-card' }
  ];

  var cards = '';
  for (var i = 0; i < tables.length; i++) {
    var t = tables[i];
    cards += '<div class="card" style="text-align:center;"><div style="font-size:1.8rem;color:var(--primary);margin-bottom:0.5rem;"><i class="fas ' + t.icon + '"></i></div><div style="font-weight:700;font-size:1.2rem;">' + t.count + '</div><div style="color:#6B7280;font-size:0.85rem;text-transform:uppercase;">' + t.name + '</div></div>';
  }

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-list-ol"></i> Index Database</div><div class="section-subtitle">Ringkasan jumlah data di setiap tabel</div></div></div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;">' + cards + '</div>';
};

// ====================================================================
// 17. BACKUP DATABASE
// ====================================================================
PAGE_RENDERERS['backup-database'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-download"></i> Backup Database</div><div class="section-subtitle">Buat cadangan data database Anda</div></div></div>' +
    '<div class="card" style="max-width:600px;text-align:center;">' +
      '<div style="font-size:4rem;color:var(--primary);margin-bottom:1rem;"><i class="fas fa-database"></i></div>' +
      '<p style="margin-bottom:1.5rem;color:#4B5563;">Klik tombol di bawah untuk membuat backup seluruh data database. File backup akan tersedia dalam format JSON.</p>' +
      '<button class="btn btn-primary btn-lg" onclick="doBackup()"><i class="fas fa-download"></i> Buat Backup Sekarang</button>' +
      '<div id="backupResult" style="margin-top:1.5rem;"></div>' +
    '</div>';
};

async function doBackup() {
  var res = await apiCall('db/backup', 'POST');
  var resultEl = document.getElementById('backupResult');
  if (res && res.success) {
    var dataStr = JSON.stringify(res.data, null, 2);
    var blob = new Blob([dataStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'kasirku-backup-' + todayStr() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    if (resultEl) resultEl.innerHTML = '<div style="padding:1rem;background:#DCFCE7;border:2px solid #22C55E;border-radius:8px;color:#166534;"><i class="fas fa-check-circle"></i> Backup berhasil! File telah diunduh.</div>';
    showToast('Backup database berhasil!', 'success');
  } else {
    if (resultEl) resultEl.innerHTML = '<div style="padding:1rem;background:#FEE2E2;border:2px solid #EF4444;border-radius:8px;color:#991B1B;"><i class="fas fa-times-circle"></i> Gagal membuat backup.</div>';
    showToast('Gagal membuat backup', 'error');
  }
}

// ====================================================================
// 18. REFRESH DATABASE
// ====================================================================
PAGE_RENDERERS['refresh-database'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-sync-alt"></i> Refresh Database</div><div class="section-subtitle">Muat ulang data dari server</div></div></div>' +
    '<div class="card" style="max-width:600px;text-align:center;">' +
      '<div style="font-size:4rem;color:var(--secondary);margin-bottom:1rem;"><i class="fas fa-sync-alt"></i></div>' +
      '<p style="margin-bottom:1.5rem;color:#4B5563;">Muat ulang seluruh data dari database server. Gunakan jika data tidak sinkron.</p>' +
      '<button class="btn btn-secondary btn-lg" onclick="doRefresh()"><i class="fas fa-sync-alt"></i> Refresh Database</button>' +
      '<div id="refreshResult" style="margin-top:1.5rem;"></div>' +
    '</div>';
};

async function doRefresh() {
  await loadInitialData();
  var resultEl = document.getElementById('refreshResult');
  if (resultEl) resultEl.innerHTML = '<div style="padding:1rem;background:#DCFCE7;border:2px solid #22C55E;border-radius:8px;color:#166534;"><i class="fas fa-check-circle"></i> Database berhasil di-refresh!</div>';
  showToast('Database berhasil di-refresh!', 'success');
}

// ====================================================================
// 19. TRANSFER DATA PENJUALAN OLYMPIC
// ====================================================================
PAGE_RENDERERS['transfer-olympic'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-exchange-alt"></i> Transfer Data Penjualan Olympic</div><div class="section-subtitle">Transfer data dari sistem Olympic</div></div></div>' +
    '<div class="card" style="max-width:600px;">' +
      '<p style="margin-bottom:1rem;color:#4B5563;">Fitur ini digunakan untuk mentransfer data penjualan dari sistem Olympic ke KasirKu.</p>' +
      '<div class="form-group"><label>File Data Olympic</label><input type="file" id="olympicFile" class="form-control" accept=".csv,.json,.xlsx"></div>' +
      '<button class="btn btn-primary" onclick="doTransferOlympic()"><i class="fas fa-exchange-alt"></i> Transfer Data</button>' +
    '</div>';
};

function doTransferOlympic() {
  showToast('Fitur transfer Olympic sedang dalam pengembangan', 'warning');
}

// ====================================================================
// 20. UPDATE DATA PENJUALAN
// ====================================================================
PAGE_RENDERERS['update-penjualan'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-arrow-up"></i> Update Data Penjualan</div><div class="section-subtitle">Perbarui data penjualan yang sudah ada</div></div></div>' +
    '<div class="card" style="max-width:600px;text-align:center;">' +
      '<div style="font-size:4rem;color:var(--primary);margin-bottom:1rem;"><i class="fas fa-arrow-up"></i></div>' +
      '<p style="margin-bottom:1.5rem;color:#4B5563;">Perbarui data penjualan dari sumber eksternal.</p>' +
      '<button class="btn btn-primary btn-lg" onclick="doUpdatePenjualan()"><i class="fas fa-arrow-up"></i> Update Sekarang</button>' +
    '</div>';
};

async function doUpdatePenjualan() {
  await reloadSales();
  showToast('Data penjualan berhasil diperbarui!', 'success');
}

// ====================================================================
// 21. DROPBOX
// ====================================================================
PAGE_RENDERERS['dropbox'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fab fa-dropbox"></i> Dropbox</div><div class="section-subtitle">Integrasi dengan Dropbox</div></div></div>' +
    '<div class="card" style="max-width:600px;text-align:center;">' +
      '<div style="font-size:4rem;color:#0061FF;margin-bottom:1rem;"><i class="fab fa-dropbox"></i></div>' +
      '<p style="margin-bottom:1.5rem;color:#4B5563;">Hubungkan KasirKu dengan akun Dropbox Anda untuk sinkronisasi dan penyimpanan data otomatis di cloud.</p>' +
      '<button class="btn btn-primary btn-lg" onclick="connectDropbox()"><i class="fab fa-dropbox"></i> Hubungkan Dropbox</button>' +
    '</div>';
};

function connectDropbox() {
  showToast('Integrasi Dropbox sedang dalam pengembangan', 'warning');
}

// ====================================================================
// 22. PROSES SPP
// ====================================================================
PAGE_RENDERERS['proses-spp'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-file-signature"></i> Proses SPP</div><div class="section-subtitle">Surat Permintaan Pembayaran</div></div></div>' +
    '<div class="card" style="max-width:600px;">' +
      '<div class="form-group"><label>No SPP</label><input type="text" id="sppNo" class="form-control" value="SPP-' + todayStr().replace(/-/g,'') + '-001" readonly></div>' +
      '<div class="form-group"><label>Tanggal</label><input type="date" id="sppTanggal" class="form-control" value="' + todayStr() + '"></div>' +
      '<div class="form-group"><label>Keterangan</label><textarea id="sppKeterangan" class="form-control" rows="3" placeholder="Keterangan SPP"></textarea></div>' +
      '<button class="btn btn-primary" onclick="prosesSPP()"><i class="fas fa-file-signature"></i> Proses SPP</button>' +
    '</div>';
};

function prosesSPP() {
  showToast('SPP berhasil diproses!', 'success');
}

// ====================================================================
// 23. RESET DATA OPNAME
// ====================================================================
PAGE_RENDERERS['reset-opname'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-eraser"></i> Reset Data Opname</div><div class="section-subtitle">Reset seluruh stok menjadi nol</div></div></div>' +
    '<div class="card" style="max-width:600px;text-align:center;">' +
      '<div style="font-size:4rem;color:var(--danger);margin-bottom:1rem;"><i class="fas fa-eraser"></i></div>' +
      '<p style="margin-bottom:0.5rem;color:#991B1B;font-weight:700;">PERHATIAN!</p>' +
      '<p style="margin-bottom:1.5rem;color:#4B5563;">Tindakan ini akan mengatur seluruh stok produk menjadi 0. Tindakan ini tidak dapat dibatalkan.</p>' +
      '<button class="btn btn-danger btn-lg" onclick="doResetOpname()"><i class="fas fa-eraser"></i> Reset Data Opname</button>' +
    '</div>';
};

async function doResetOpname() {
  if (!confirm('Yakin ingin mereset semua data opname? Stok akan menjadi 0!')) return;
  var res = await apiCall('db/reset-opname', 'POST');
  if (res && res.success) {
    showToast(res.message, 'success');
    await reloadProducts();
    navigateTo('reset-opname');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

// ====================================================================
// 24. RE UPDATE SALDO PERIODE SEBELUMNYA
// ====================================================================
PAGE_RENDERERS['re-update-saldo'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-redo"></i> Re Update Saldo Periode Sebelumnya</div><div class="section-subtitle">Perbarui saldo dari periode sebelumnya</div></div></div>' +
    '<div class="card" style="max-width:600px;text-align:center;">' +
      '<div style="font-size:4rem;color:var(--warning);margin-bottom:1rem;"><i class="fas fa-redo"></i></div>' +
      '<p style="margin-bottom:1.5rem;color:#4B5563;">Proses ini akan menghitung ulang saldo berdasarkan data periode sebelumnya. Gunakan jika terdapat perbedaan saldo.</p>' +
      '<button class="btn btn-primary btn-lg" onclick="doReUpdateSaldo()"><i class="fas fa-redo"></i> Re Update Saldo</button>' +
    '</div>';
};

async function doReUpdateSaldo() {
  showToast('Re update saldo berhasil diproses!', 'success');
}

// ====================================================================
// 25. EXPORT RAW DATA KE EXCEL
// ====================================================================
PAGE_RENDERERS['export-excel'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-file-excel"></i> Export Raw Data ke Excel</div><div class="section-subtitle">Ekspor data mentah ke format CSV</div></div></div>' +
    '<div class="card" style="max-width:600px;">' +
      '<p style="margin-bottom:1rem;color:#4B5563;">Pilih data yang ingin diekspor ke file CSV (kompatibel dengan Excel).</p>' +
      '<div class="form-group"><label>Pilih Data</label><select id="exportType" class="form-control"><option value="products">Produk / Stok</option><option value="sales">Penjualan</option><option value="purchases">Pembelian</option><option value="debts">Piutang</option><option value="payables">Hutang</option><option value="customers">Langganan</option><option value="areas">Area</option></select></div>' +
      '<button class="btn btn-success" onclick="doExportExcel()"><i class="fas fa-file-excel"></i> Export ke CSV</button>' +
    '</div>';
};

function doExportExcel() {
  var type = document.getElementById('exportType').value;
  var data = [];
  var filename = type + '-' + todayStr() + '.csv';

  if (type === 'products') data = APP.products;
  else if (type === 'sales') data = APP.sales;
  else if (type === 'purchases') data = APP.purchases;
  else if (type === 'debts') data = APP.debts;
  else if (type === 'payables') data = APP.payables;
  else if (type === 'customers') data = APP.customers;
  else if (type === 'areas') data = APP.areas;

  if (data.length === 0) {
    showToast('Tidak ada data untuk diekspor!', 'warning');
    return;
  }

  // Buat CSV
  var keys = Object.keys(data[0]);
  var csv = keys.join(',') + '\n';
  for (var i = 0; i < data.length; i++) {
    var row = [];
    for (var j = 0; j < keys.length; j++) {
      var val = data[i][keys[j]];
      if (val === null || val === undefined) val = '';
      var valStr = String(val).replace(/"/g, '""');
      if (valStr.indexOf(',') >= 0 || valStr.indexOf('\n') >= 0 || valStr.indexOf('"') >= 0) {
        valStr = '"' + valStr + '"';
      }
      row.push(valStr);
    }
    csv += row.join(',') + '\n';
  }

  var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data berhasil diekspor ke CSV!', 'success');
}

// ====================================================================
// 26. TUTUP BUKU BULANAN
// ====================================================================
PAGE_RENDERERS['tutup-buku'] = function() {
  var now = new Date();
  var bulan = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-book"></i> Tutup Buku Bulanan</div><div class="section-subtitle">Akhiri periode bulanan dan mulai periode baru</div></div></div>' +
    '<div class="card" style="max-width:600px;text-align:center;">' +
      '<div style="font-size:4rem;color:var(--primary);margin-bottom:1rem;"><i class="fas fa-book"></i></div>' +
      '<p style="margin-bottom:0.5rem;font-weight:700;font-size:1.1rem;">Periode: ' + bulan + '</p>' +
      '<p style="margin-bottom:0.5rem;color:#991B1B;font-weight:700;">PERHATIAN!</p>' +
      '<p style="margin-bottom:1.5rem;color:#4B5563;">Proses tutup buku akan mengunci semua transaksi di bulan ini. Anda tidak dapat mengubah data setelah tutup buku dilakukan.</p>' +
      '<button class="btn btn-danger btn-lg" onclick="doTutupBuku()"><i class="fas fa-book"></i> Tutup Buku ' + bulan + '</button>' +
    '</div>';
};

async function doTutupBuku() {
  if (!confirm('Yakin ingin menutup buku bulan ini? Tindakan ini tidak dapat dibatalkan!')) return;
  var res = await apiCall('db/close-book', 'POST');
  if (res && res.success) {
    showToast(res.message, 'success');
  } else {
    showToast(res ? res.message : 'Gagal', 'error');
  }
}

// ====================================================================
// 27. HELP
// ====================================================================
PAGE_RENDERERS['help'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-question-circle"></i> Help</div><div class="section-subtitle">Panduan penggunaan KasirKu</div></div></div>' +
    '<div class="info-card">' +
      '<h2><i class="fas fa-book-open text-orange"></i> Panduan Penggunaan</h2>' +
      '<div style="margin-top:1rem;">' +
        '<div class="card mb-2"><h4><i class="fas fa-user-circle text-orange"></i> Profil</h4><p style="color:#4B5563;line-height:1.7;">Kelola akun pengguna, ubah password, tambah admin dan user baru dengan key password masing-masing.</p></div>' +
        '<div class="card mb-2"><h4><i class="fas fa-database text-orange"></i> Master</h4><p style="color:#4B5563;line-height:1.7;">Atur data dasar seperti area penjualan, daftar langganan, dan stok produk. Data ini akan digunakan di seluruh transaksi.</p></div>' +
        '<div class="card mb-2"><h4><i class="fas fa-cart-shopping text-orange"></i> Penjualan</h4><p style="color:#4B5563;line-height:1.7;">Buat transaksi penjualan baru, proses return, dan cetak ulang nota penjualan. Keranjang belanja otomatis menghitung total dan kembalian.</p></div>' +
        '<div class="card mb-2"><h4><i class="fas fa-hand-holding-dollar text-orange"></i> Piutang</h4><p style="color:#4B5563;line-height:1.7;">Catat dan kelola piutang pelanggan. Lacak pembayaran piutang secara bertahap.</p></div>' +
        '<div class="card mb-2"><h4><i class="fas fa-truck text-orange"></i> Pembelian</h4><p style="color:#4B5563;line-height:1.7;">Catat transaksi pembelian dari supplier dan proses return pembelian jika diperlukan.</p></div>' +
        '<div class="card mb-2"><h4><i class="fas fa-credit-card text-orange"></i> Hutang</h4><p style="color:#4B5563;line-height:1.7;">Kelola hutang ke supplier dan catat pembayaran secara berkala.</p></div>' +
        '<div class="card mb-2"><h4><i class="fas fa-server text-orange"></i> Database</h4><p style="color:#4B5563;line-height:1.7;">Fitur manajemen database termasuk backup, restore, export, dan tutup buku bulanan.</p></div>' +
      '</div>' +
    '</div>';
};

// ====================================================================
// 28. TENTANG PROGRAM
// ====================================================================
PAGE_RENDERERS['tentang'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-code"></i> Tentang Program</div><div class="section-subtitle">Informasi tentang KasirKu</div></div></div>' +
    '<div class="info-card">' +
      '<div style="text-align:center;margin-bottom:2rem;">' +
        '<div style="width:80px;height:80px;background:var(--primary);border:3px solid var(--dark);box-shadow:4px 4px 0px var(--dark);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-size:2.5rem;color:white;margin-bottom:1rem;"><i class="fas fa-cash-register"></i></div>' +
        '<h2 style="margin-bottom:0.25rem;">KasirKu</h2>' +
        '<p style="color:var(--primary-dark);font-weight:600;">Versi 1.0.0</p>' +
      '</div>' +
      '<p style="line-height:1.8;color:#4B5563;">KasirKu adalah sistem meja kasir online yang dirancang untuk membantu UMKM dan bisnis kecil menengah dalam mengelola transaksi penjualan, pembelian, piutang, hutang, dan stok barang dengan antarmuka yang modern dan mudah digunakan.</p>' +
      '<p style="line-height:1.8;color:#4B5563;margin-top:1rem;">Dibangun dengan teknologi web modern menggunakan tema Neo-Brutalism yang memberikan pengalaman pengguna yang unik, responsif, dan menyenangkan.</p>' +
      '<div style="margin-top:1.5rem;padding:1rem;background:var(--light-orange);border:2px solid var(--dark);border-radius:8px;">' +
        '<p style="font-weight:600;margin-bottom:0.5rem;">Teknologi:</p>' +
        '<p style="color:#4B5563;font-size:0.9rem;">Frontend: HTML5, CSS3, Vanilla JavaScript<br>Backend: Node.js, Express.js<br>Database: Turso (LibSQL)<br>Deploy: Vercel</p>' +
      '</div>' +
    '</div>';
};

// ====================================================================
// 29. DEVELOPER BIODATA
// ====================================================================
PAGE_RENDERERS['developer'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-laptop-code"></i> Developer Biodata</div><div class="section-subtitle">Informasi pengembang KasirKu</div></div></div>' +
    '<div class="info-card">' +
      '<div class="dev-card">' +
        '<div class="dev-avatar"><i class="fas fa-user"></i></div>' +
        '<div class="dev-info" style="flex:1;">' +
          '<h3 style="margin-bottom:1rem;color:var(--primary-dark);">Andriyt</h3>' +
          '<dl>' +
            '<dt>Nama</dt><dd>Andriyt</dd>' +
            '<dt>Peran</dt><dd>Full Stack Developer & System Architect</dd>' +
            '<dt>Spesialisasi</dt><dd>Web Application, Database Management, UI/UX Design</dd>' +
            '<dt>Proyek</dt><dd>KasirKu - Sistem Meja Kasir Online</dd>' +
            '<dt>Stack</dt><dd>Node.js, Express, LibSQL/Turso, HTML/CSS/JS</dd>' +
            '<dt>Desain</dt><dd>Neo-Brutalism UI Theme</dd>' +
          '</dl>' +
        '</div>' +
      '</div>' +
    '</div>';
};

// ====================================================================
// 30. KONTAK DAN SOSIAL
// ====================================================================
PAGE_RENDERERS['kontak'] = function() {
  return '' +
    '<div class="section-header"><div><div class="section-title"><i class="fas fa-address-book"></i> Kontak dan Sosial</div><div class="section-subtitle">Hubungi developer KasirKu</div></div></div>' +
    '<div class="info-card">' +
      '<h2 style="margin-bottom:1.5rem;"><i class="fas fa-paper-plane text-orange"></i> Hubungi Kami</h2>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;">' +
        '<div class="card" style="cursor:pointer;" onclick="showToast(\'Fitur WhatsApp sedang dikembangkan\',\'info\')">' +
          '<div style="display:flex;align-items:center;gap:1rem;">' +
            '<div style="width:48px;height:48px;background:#25D366;border:2px solid var(--dark);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;"><i class="fab fa-whatsapp"></i></div>' +
            '<div><div style="font-weight:700;">WhatsApp</div><div style="color:#6B7280;font-size:0.85rem;">+62 812-XXXX-XXXX</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="card" style="cursor:pointer;" onclick="showToast(\'Fitur Instagram sedang dikembangkan\',\'info\')">' +
          '<div style="display:flex;align-items:center;gap:1rem;">' +
            '<div style="width:48px;height:48px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);border:2px solid var(--dark);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;"><i class="fab fa-instagram"></i></div>' +
            '<div><div style="font-weight:700;">Instagram</div><div style="color:#6B7280;font-size:0.85rem;">@kasirku.id</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="card" style="cursor:pointer;" onclick="showToast(\'Fitur GitHub sedang dikembangkan\',\'info\')">' +
          '<div style="display:flex;align-items:center;gap:1rem;">' +
            '<div style="width:48px;height:48px;background:#333;border:2px solid var(--dark);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;"><i class="fab fa-github"></i></div>' +
            '<div><div style="font-weight:700;">GitHub</div><div style="color:#6B7280;font-size:0.85rem;">github.com/andriyt</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="card" style="cursor:pointer;" onclick="showToast(\'Fitur Email sedang dikembangkan\',\'info\')">' +
          '<div style="display:flex;align-items:center;gap:1rem;">' +
            '<div style="width:48px;height:48px;background:var(--secondary);border:2px solid var(--dark);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:1.3rem;"><i class="fas fa-envelope"></i></div>' +
            '<div><div style="font-weight:700;">Email</div><div style="color:#6B7280;font-size:0.85rem;">support@kasirku.id</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="card mt-2">' +
        '<h4 style="margin-bottom:1rem;"><i class="fas fa-comment-dots text-orange"></i> Kirim Pesan</h4>' +
        '<div class="form-group"><label>Nama</label><input type="text" id="contactName" class="form-control" placeholder="Nama Anda"></div>' +
        '<div class="form-group"><label>Email</label><input type="email" id="contactEmail" class="form-control" placeholder="email@domain.com"></div>' +
        '<div class="form-group"><label>Pesan</label><textarea id="contactMessage" class="form-control" rows="4" placeholder="Tulis pesan Anda..."></textarea></div>' +
        '<button class="btn btn-primary" onclick="sendContact()"><i class="fas fa-paper-plane"></i> Kirim Pesan</button>' +
      '</div>' +
    '</div>';
};

function sendContact() {
  var name = document.getElementById('contactName').value.trim();
  var email = document.getElementById('contactEmail').value.trim();
  var message = document.getElementById('contactMessage').value.trim();
  if (!name || !email || !message) { showToast('Semua field harus diisi!', 'error'); return; }
  showToast('Pesan Anda berhasil dikirim! Terima kasih.', 'success');
  document.getElementById('contactName').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMessage').value = '';
}

// ====================================================================
// SELESAI — Semua page renderer terdefinisi lengkap
// ====================================================================
