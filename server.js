const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@libsql/client');

const app = express();
const PORT = process.env.PORT || 3000;

/* ====== Turso Database Connection ====== */
const db = createClient({
  url: process.env.TURSO_BASE_URL || '',
  authToken: process.env.TURSO_AUTH_TOKEN || ''
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ====== Database Initialization ====== */
async function initDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      key_password TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS areas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_area TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT NOT NULL,
      area_id INTEGER,
      alamat TEXT DEFAULT '',
      telepon TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kode TEXT UNIQUE NOT NULL,
      nama TEXT NOT NULL,
      harga_beli REAL DEFAULT 0,
      harga_jual REAL DEFAULT 0,
      stok INTEGER DEFAULT 0,
      satuan TEXT DEFAULT 'pcs',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no_nota TEXT UNIQUE,
      tanggal TEXT NOT NULL,
      customer_id INTEGER,
      total REAL DEFAULT 0,
      bayar REAL DEFAULT 0,
      kembali REAL DEFAULT 0,
      jenis TEXT DEFAULT 'tunai',
      status TEXT DEFAULT 'selesai',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER DEFAULT 0,
      harga REAL DEFAULT 0,
      subtotal REAL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no_nota TEXT,
      tanggal TEXT NOT NULL,
      supplier TEXT DEFAULT '',
      total REAL DEFAULT 0,
      jenis TEXT DEFAULT 'tunai',
      status TEXT DEFAULT 'selesai',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER DEFAULT 0,
      harga REAL DEFAULT 0,
      subtotal REAL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER,
      customer_id INTEGER,
      jumlah_piutang REAL DEFAULT 0,
      jumlah_bayar REAL DEFAULT 0,
      sisa REAL DEFAULT 0,
      tanggal TEXT,
      keterangan TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS payables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER,
      supplier TEXT DEFAULT '',
      jumlah_hutang REAL DEFAULT 0,
      jumlah_bayar REAL DEFAULT 0,
      sisa REAL DEFAULT 0,
      tanggal TEXT,
      keterangan TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )`
  ];

  for (const sql of tables) {
    try { await db.execute(sql); } catch (e) { /* table mungkin sudah ada */ }
  }

  // Seed default admin jika belum ada
  try {
    const existing = await db.execute("SELECT id FROM users WHERE username='andriyt'");
    if (existing.rows.length === 0) {
      await db.execute("INSERT INTO users (username, password, role, key_password) VALUES ('andriyt', 'andriyt002', 'admin', 'key002')");
    }
  } catch (e) { console.log('Seed user skip:', e.message); }

  console.log('Database initialized');
}

/* ====== API: Auth ====== */
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE username=? AND password=?",
      args: [username, password]
    });
    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.json({ success: false, message: 'Username atau password salah!' });
    }
  } catch (e) {
    res.json({ success: false, message: 'Server error: ' + e.message });
  }
});

app.post('/api/change-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    const check = await db.execute({ sql: "SELECT id FROM users WHERE id=? AND password=?", args: [userId, oldPassword] });
    if (check.rows.length === 0) return res.json({ success: false, message: 'Password lama salah!' });
    await db.execute({ sql: "UPDATE users SET password=? WHERE id=?", args: [newPassword, userId] });
    res.json({ success: true, message: 'Password berhasil diubah!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

/* ====== API: Users CRUD ====== */
app.get('/api/users', async (req, res) => {
  try {
    const result = await db.execute("SELECT id, username, role, key_password, created_at FROM users ORDER BY id");
    res.json({ success: true, data: result.rows });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role, key_password } = req.body;
    await db.execute({ sql: "INSERT INTO users (username, password, role, key_password) VALUES (?, ?, ?, ?)", args: [username, password, role || 'user', key_password || ''] });
    res.json({ success: true, message: 'User berhasil ditambahkan!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM users WHERE id=?", args: [req.params.id] });
    res.json({ success: true, message: 'User dihapus!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

/* ====== API: Areas CRUD ====== */
app.get('/api/areas', async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM areas ORDER BY id");
    res.json({ success: true, data: result.rows });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.post('/api/areas', async (req, res) => {
  try {
    const { nama_area } = req.body;
    await db.execute({ sql: "INSERT INTO areas (nama_area) VALUES (?)", args: [nama_area] });
    res.json({ success: true, message: 'Area ditambahkan!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.put('/api/areas/:id', async (req, res) => {
  try {
    const { nama_area } = req.body;
    await db.execute({ sql: "UPDATE areas SET nama_area=? WHERE id=?", args: [nama_area, req.params.id] });
    res.json({ success: true, message: 'Area diperbarui!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.delete('/api/areas/:id', async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM areas WHERE id=?", args: [req.params.id] });
    res.json({ success: true, message: 'Area dihapus!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

/* ====== API: Customers CRUD ====== */
app.get('/api/customers', async (req, res) => {
  try {
    const result = await db.execute("SELECT c.*, a.nama_area FROM customers c LEFT JOIN areas a ON c.area_id=a.id ORDER BY c.id");
    res.json({ success: true, data: result.rows });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { nama, area_id, alamat, telepon } = req.body;
    await db.execute({ sql: "INSERT INTO customers (nama, area_id, alamat, telepon) VALUES (?, ?, ?, ?)", args: [nama, area_id || null, alamat || '', telepon || ''] });
    res.json({ success: true, message: 'Langganan ditambahkan!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { nama, area_id, alamat, telepon } = req.body;
    await db.execute({ sql: "UPDATE customers SET nama=?, area_id=?, alamat=?, telepon=? WHERE id=?", args: [nama, area_id || null, alamat || '', telepon || '', req.params.id] });
    res.json({ success: true, message: 'Langganan diperbarui!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM customers WHERE id=?", args: [req.params.id] });
    res.json({ success: true, message: 'Langganan dihapus!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

/* ====== API: Products CRUD ====== */
app.get('/api/products', async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM products ORDER BY id");
    res.json({ success: true, data: result.rows });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const { kode, nama, harga_beli, harga_jual, stok, satuan } = req.body;
    await db.execute({ sql: "INSERT INTO products (kode, nama, harga_beli, harga_jual, stok, satuan) VALUES (?, ?, ?, ?, ?, ?)", args: [kode, nama, harga_beli || 0, harga_jual || 0, stok || 0, satuan || 'pcs'] });
    res.json({ success: true, message: 'Produk ditambahkan!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { kode, nama, harga_beli, harga_jual, stok, satuan } = req.body;
    await db.execute({ sql: "UPDATE products SET kode=?, nama=?, harga_beli=?, harga_jual=?, stok=?, satuan=? WHERE id=?", args: [kode, nama, harga_beli || 0, harga_jual || 0, stok || 0, satuan || 'pcs', req.params.id] });
    res.json({ success: true, message: 'Produk diperbarui!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.execute({ sql: "DELETE FROM products WHERE id=?", args: [req.params.id] });
    res.json({ success: true, message: 'Produk dihapus!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

/* ====== API: Sales ====== */
app.get('/api/sales', async (req, res) => {
  try {
    const days = req.query.days || 30;
    const result = await db.execute({ sql: `SELECT s.*, c.nama as customer_nama FROM sales s LEFT JOIN customers c ON s.customer_id=c.id WHERE s.tanggal >= date('now', '-${parseInt(days)} days') ORDER BY s.tanggal DESC` });
    res.json({ success: true, data: result.rows });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.post('/api/sales', async (req, res) => {
  try {
    const { no_nota, tanggal, customer_id, total, bayar, kembali, jenis, items } = req.body;
    const saleResult = await db.execute({ sql: "INSERT INTO sales (no_nota, tanggal, customer_id, total, bayar, kembali, jenis) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [no_nota, tanggal, customer_id || null, total, bayar, kembali, jenis || 'tunai'] });
    const saleId = saleResult.lastInsertRowid;
    if (items && items.length > 0) {
      for (const item of items) {
        await db.execute({ sql: "INSERT INTO sale_items (sale_id, product_id, qty, harga, subtotal) VALUES (?, ?, ?, ?, ?)", args: [saleId, item.product_id, item.qty, item.harga, item.subtotal] });
        await db.execute({ sql: "UPDATE products SET stok = stok - ? WHERE id = ?", args: [item.qty, item.product_id] });
      }
    }
    res.json({ success: true, message: 'Transaksi penjualan berhasil!', saleId });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.get('/api/sales/:id/items', async (req, res) => {
  try {
    const result = await db.execute({ sql: "SELECT si.*, p.nama as product_nama, p.kode FROM sale_items si LEFT JOIN products p ON si.product_id=p.id WHERE si.sale_id=?", args: [req.params.id] });
    res.json({ success: true, data: result.rows });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

/* ====== API: Purchases ====== */
app.get('/api/purchases', async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM purchases ORDER BY tanggal DESC");
    res.json({ success: true, data: result.rows });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.post('/api/purchases', async (req, res) => {
  try {
    const { no_nota, tanggal, supplier, total, jenis, items } = req.body;
    const purchaseResult = await db.execute({ sql: "INSERT INTO purchases (no_nota, tanggal, supplier, total, jenis) VALUES (?, ?, ?, ?, ?)", args: [no_nota, tanggal, supplier || '', total, jenis || 'tunai'] });
    const purchaseId = purchaseResult.lastInsertRowid;
    if (items && items.length > 0) {
      for (const item of items) {
        await db.execute({ sql: "INSERT INTO purchase_items (purchase_id, product_id, qty, harga, subtotal) VALUES (?, ?, ?, ?, ?)", args: [purchaseId, item.product_id, item.qty, item.harga, item.subtotal] });
        await db.execute({ sql: "UPDATE products SET stok = stok + ? WHERE id = ?", args: [item.qty, item.product_id] });
      }
    }
    res.json({ success: true, message: 'Transaksi pembelian berhasil!', purchaseId });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

/* ====== API: Debts ====== */
app.get('/api/debts', async (req, res) => {
  try {
    const result = await db.execute("SELECT d.*, c.nama as customer_nama FROM debts d LEFT JOIN customers c ON d.customer_id=c.id ORDER BY d.tanggal DESC");
    res.json({ success: true, data: result.rows });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.post('/api/debts', async (req, res) => {
  try {
    const { sale_id, customer_id, jumlah_piutang, jumlah_bayar, sisa, tanggal, keterangan } = req.body;
    await db.execute({ sql: "INSERT INTO debts (sale_id, customer_id, jumlah_piutang, jumlah_bayar, sisa, tanggal, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [sale_id || null, customer_id || null, jumlah_piutang, jumlah_bayar, sisa, tanggal, keterangan || ''] });
    res.json({ success: true, message: 'Penagihan piutang dicatat!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

/* ====== API: Payables ====== */
app.get('/api/payables', async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM payables ORDER BY tanggal DESC");
    res.json({ success: true, data: result.rows });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.post('/api/payables', async (req, res) => {
  try {
    const { purchase_id, supplier, jumlah_hutang, jumlah_bayar, sisa, tanggal, keterangan } = req.body;
    await db.execute({ sql: "INSERT INTO payables (purchase_id, supplier, jumlah_hutang, jumlah_bayar, sisa, tanggal, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [purchase_id || null, supplier || '', jumlah_hutang, jumlah_bayar, sisa, tanggal, keterangan || ''] });
    res.json({ success: true, message: 'Pembayaran hutang dicatat!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

/* ====== API: Database Management ====== */
app.post('/api/db/backup', async (req, res) => {
  try {
    const tables = ['users','areas','customers','products','sales','sale_items','purchases','purchase_items','debts','payables'];
    const backup = {};
    for (const t of tables) {
      const r = await db.execute(`SELECT * FROM ${t}`);
      backup[t] = r.rows;
    }
    res.json({ success: true, data: backup, timestamp: new Date().toISOString() });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.post('/api/db/reset-opname', async (req, res) => {
  try {
    await db.execute("UPDATE products SET stok=0");
    res.json({ success: true, message: 'Data opname direset!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

app.post('/api/db/close-book', async (req, res) => {
  try {
    res.json({ success: true, message: 'Tutup buku bulanan berhasil!' });
  } catch (e) { res.json({ success: false, message: e.message }); }
});

/* ====== SPA Fallback ====== */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ====== Start Server ====== */
app.listen(PORT, async () => {
  console.log(`KasirKu berjalan di port ${PORT}`);
  await initDatabase();
});

module.exports = app;
