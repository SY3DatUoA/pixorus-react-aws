// src/pages/AdminPage.js
import { useState, useEffect, useRef } from "react";
import { signIn, signOut, getCurrentUser } from "aws-amplify/auth";
import { useTheme } from "../context/ThemeContext";
import {
  getProducts, addProduct, updateProduct, deleteProduct,
  getCategories, addCategory, updateCategory, deleteCategory,
  getOrders, getSalesStats, uploadImage,
} from "../services/api";

// ─── Toast ───────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };
  return { toasts, toast };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AdminPage({ navigate }) {
  const { theme, updateTheme, resetTheme, defaultTheme } = useTheme();
  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [page, setPage] = useState("dashboard");
  const { toasts, toast } = useToast();

  useEffect(() => {
    getCurrentUser()
      .then(() => { setAuthed(true); setCheckingAuth(false); })
      .catch(() => setCheckingAuth(false));
  }, []);

  const handleLogin = () => { setAuthed(true); };
  const handleLogout = async () => {
    try { await signOut(); } catch { /* ignore */ }
    setAuthed(false);
  };

  if (checkingAuth) return <FullCenter><span className="spinner spinner-lg" /></FullCenter>;
  if (!authed) return <LoginScreen onLogin={handleLogin} navigate={navigate} />;

  const pages = {
    dashboard: <DashboardPage toast={toast} />,
    products: <ProductsPage toast={toast} />,
    categories: <CategoriesPage toast={toast} />,
    orders: <OrdersPage toast={toast} />,
    analytics: <AnalyticsPage toast={toast} />,
    theme: <ThemeEditorPage theme={theme} updateTheme={updateTheme} resetTheme={resetTheme} defaultTheme={defaultTheme} toast={toast} />,
  };

  const navItems = [
    { group: "Overview", items: [{ key: "dashboard", icon: "fa-chart-pie", label: "Dashboard" }] },
    { group: "Management", items: [{ key: "products", icon: "fa-box", label: "Products" }, { key: "categories", icon: "fa-tags", label: "Categories" }] },
    { group: "Sales", items: [{ key: "orders", icon: "fa-receipt", label: "Orders" }, { key: "analytics", icon: "fa-chart-bar", label: "Analytics" }] },
    { group: "Store", items: [{ key: "theme", icon: "fa-palette", label: "Customize" }] },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-body)" }}>
      {/* Sidebar */}
      <nav style={{ width: 250, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg,var(--accent),#f5d38a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {theme.storeName}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1.5 }}>Admin Panel</div>
        </div>

        <div style={{ flex: 1, padding: "12px 12px" }}>
          {navItems.map(({ group, items }) => (
            <div key={group} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--text-dim)", padding: "8px 12px", fontWeight: 600 }}>{group}</div>
              {items.map(({ key, icon, label }) => (
                <button key={key} onClick={() => setPage(key)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", marginBottom: 2, borderRadius: 10, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all var(--transition)", background: page === key ? "var(--accent-glow)" : "transparent", color: page === key ? "var(--accent)" : "var(--text-muted)", fontWeight: page === key ? 600 : 400, textAlign: "left" }}>
                  <i className={`fas ${icon}`} style={{ width: 20, textAlign: "center", fontSize: 15 }} />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: "12px", borderTop: "1px solid var(--border)" }}>
          <button onClick={() => navigate("store")}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", marginBottom: 4, borderRadius: 10, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit", background: "transparent", color: "var(--text-muted)", textAlign: "left" }}>
            <i className="fas fa-store" style={{ width: 20, textAlign: "center" }} /> View Store
          </button>
          <button onClick={handleLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 10, fontSize: 14, border: "none", cursor: "pointer", fontFamily: "inherit", background: "transparent", color: "var(--text-muted)", textAlign: "left" }}>
            <i className="fas fa-right-from-bracket" style={{ width: 20, textAlign: "center" }} /> Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        {pages[page]}
      </main>

      {/* Toasts */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: "var(--surface-3)", border: `1px solid ${t.type === "error" ? "var(--danger)" : "var(--border-light)"}`, borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "toastIn 0.3s ease", maxWidth: 320 }}>
            <i className={`fas ${t.type === "error" ? "fa-exclamation-circle" : "fa-check-circle"}`} style={{ color: t.type === "error" ? "var(--danger)" : "var(--success)", flexShrink: 0 }} />
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true); setError("");
    try {
      await signIn({ username: email, password });
      onLogin();
    } catch (e) {
      setError(e.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 400, height: 400, background: "var(--accent)", borderRadius: "50%", filter: "blur(120px)", opacity: 0.06, top: "10%", right: "10%", animation: "float 10s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 300, height: 300, background: "#60a5fa", borderRadius: "50%", filter: "blur(100px)", opacity: 0.04, bottom: "10%", left: "10%", animation: "float 14s ease-in-out infinite 3s" }} />

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "48px 40px", width: 400, maxWidth: "90vw", textAlign: "center", zIndex: 2, animation: "fadeInUp 0.5s ease both" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 24, color: "#60a5fa" }}>
          <i className="fas fa-shield-halved" />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, background: "linear-gradient(135deg,var(--accent),#f5d38a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 8 }}>PIXORUS</div>
        <div style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 32 }}>Admin Panel — Authorized Access Only</div>

        <div style={{ position: "relative", marginBottom: 14, textAlign: "left" }}>
          <i className="fas fa-envelope" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", fontSize: 13 }} />
          <input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "14px 16px 14px 44px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
        </div>
        <div style={{ position: "relative", marginBottom: 20, textAlign: "left" }}>
          <i className="fas fa-lock" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", fontSize: 13 }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ width: "100%", padding: "14px 16px 14px 44px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
        </div>

        {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <button onClick={handleLogin} disabled={loading}
          style={{ width: "100%", padding: 14, background: "var(--accent)", color: "#0a0a0a", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, opacity: loading ? 0.7 : 1 }}>
          {loading ? <span className="spinner spinner-sm" style={{ marginRight: 8 }} /> : <i className="fas fa-arrow-right-to-bracket" style={{ marginRight: 8 }} />}
          {loading ? "Signing in…" : "Unlock Panel"}
        </button>

        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
          Admin accounts are created via <strong>AWS Cognito Console</strong>
        </div>
        <button onClick={() => navigate("landing")}
          style={{ marginTop: 20, background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          ← Back to Landing
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ toast }) {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([getSalesStats(), getProducts()]);
        setStats(s); setProducts(p);
      } catch (e) { toast("Failed to load dashboard: " + e.message, "error"); }
      finally { setLoading(false); }
    })();
  // eslint-disable-next-line
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" sub="Store performance overview" />
      {loading ? <Center><span className="spinner spinner-lg" /></Center> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
            <StatCard icon="fa-box" color="orange" value={products.length} label="Products" />
            <StatCard icon="fa-receipt" color="blue" value={stats?.totalOrders || 0} label="Total Orders" />
            <StatCard icon="fa-cubes" color="green" value={stats?.totalItemsSold || 0} label="Items Sold" />
            <StatCard icon="fa-dollar-sign" color="red" value={`$${(stats?.totalRevenue || 0).toFixed(2)}`} label="Revenue" />
          </div>
          <Panel title="Recent Orders">
            {(stats?.orders || []).slice(0, 5).length === 0 ? (
              <Empty icon="fa-receipt" msg="No orders yet." />
            ) : (stats?.orders || []).slice(0, 5).map((o) => (
              <div key={o.id} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, color: "var(--accent)" }}>Order #{o.id}</span>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{new Date(o.date).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</div>
                <div style={{ fontWeight: 700, marginTop: 8 }}>${Number(o.total).toFixed(2)}</div>
              </div>
            ))}
          </Panel>
        </>
      )}
    </div>
  );
}

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
function ProductsPage({ toast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", price: "", originalPrice: "", category: "", badge: "", image: "", desc: "", rating: "", reviews: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([getProducts(), getCategories()]);
      setProducts(p); setCategories(c);
    } catch (e) { toast("Load failed: " + e.message, "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);// eslint-disable-line

  const openAdd = () => { setEditing(null); setForm({ name: "", price: "", originalPrice: "", category: categories[0]?.name || "", badge: "", image: "", desc: "", rating: "4.5", reviews: "0" }); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, price: p.price, originalPrice: p.originalPrice || "", category: p.category, badge: p.badge || "", image: p.image || "", desc: p.desc || "", rating: p.rating || "", reviews: p.reviews || "" }); setModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast("Name and price are required.", "error"); return; }
    setSaving(true);
    try {
      const data = { name: form.name, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : null, category: form.category, badge: form.badge || null, image: form.image, desc: form.desc, rating: Number(form.rating) || 0, reviews: Number(form.reviews) || 0 };
      if (editing) { await updateProduct(editing.id, data); toast(`"${form.name}" updated`); }
      else { await addProduct(data); toast(`"${form.name}" added`); }
      setModal(false); await load();
    } catch (e) { toast("Save failed: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await deleteProduct(p.id); toast(`"${p.name}" deleted`); await load(); }
    catch (e) { toast("Delete failed: " + e.message, "error"); }
  };

  const handleToggle = async (p) => {
    try { await updateProduct(p.id, { active: !p.active }); toast(`"${p.name}" ${p.active ? "hidden" : "activated"}`); await load(); }
    catch (e) { toast("Update failed: " + e.message, "error"); }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true); setUploadProgress(10);
    try {
      // Show a local preview first
      const reader = new FileReader();
      reader.onload = (e) => setForm((f) => ({ ...f, image: e.target.result }));
      reader.readAsDataURL(file);
      setUploadProgress(40);
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, image: url }));
      setUploadProgress(100);
      toast("Image uploaded to S3!");
    } catch (e) {
      toast("Upload failed: " + e.message + " (local preview kept)", "error");
    } finally {
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 1000);
    }
  };

  const f = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <div>
      <PageHeader title="Products" sub={`${products.length} product${products.length !== 1 ? "s" : ""} in catalog`}>
        <Btn onClick={openAdd} accent><i className="fas fa-plus" style={{ marginRight: 8 }} />Add Product</Btn>
      </PageHeader>

      <Panel>
        {loading ? <Center><span className="spinner" /></Center> : products.length === 0 ? <Empty icon="fa-box" msg="No products yet." /> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Product", "Category", "Price", "Badge", "Status", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-dim)", padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {p.image ? <img src={p.image} alt="" style={{ width: 42, height: 42, borderRadius: 8, objectFit: "cover" }} onError={(e) => { e.target.style.visibility = "hidden"; }} /> : <div style={{ width: 42, height: 42, borderRadius: 8, background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}><i className="fas fa-image" style={{ color: "var(--text-dim)" }} /></div>}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-dim)" }}>ID: {p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14 }}>{p.category || "—"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14 }}>
                    ${Number(p.price).toFixed(2)}
                    {p.originalPrice && <span style={{ textDecoration: "line-through", color: "var(--text-dim)", fontSize: 12, marginLeft: 6 }}>${Number(p.originalPrice).toFixed(2)}</span>}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {p.badge ? <Badge color="orange">{p.badge}</Badge> : "—"}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <Badge color={p.active !== false ? "green" : "red"}>{p.active !== false ? "Active" : "Hidden"}</Badge>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn sm ghost onClick={() => openEdit(p)}><i className="fas fa-pen" /></Btn>
                      <Btn sm ghost onClick={() => handleToggle(p)}><i className={`fas ${p.active !== false ? "fa-eye-slash" : "fa-eye"}`} /></Btn>
                      <Btn sm danger onClick={() => handleDelete(p)}><i className="fas fa-trash" /></Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* Product Modal */}
      {modal && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          <FormGroup label="Product Name">
            <Input value={form.name} onChange={f("name")} placeholder="e.g. Leather Wallet" />
          </FormGroup>
          <FormRow>
            <FormGroup label="Price ($)"><Input type="number" value={form.price} onChange={f("price")} placeholder="0.00" /></FormGroup>
            <FormGroup label="Original Price ($)"><Input type="number" value={form.originalPrice} onChange={f("originalPrice")} placeholder="Optional" /></FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Category">
              <Select value={form.category} onChange={f("category")}>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                {categories.length === 0 && <option value="">No categories</option>}
              </Select>
            </FormGroup>
            <FormGroup label="Badge">
              <Select value={form.badge} onChange={f("badge")}>
                <option value="">None</option>
                <option value="sale">Sale</option>
                <option value="new">New</option>
                <option value="hot">Hot</option>
              </Select>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Rating (0-5)"><Input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={f("rating")} placeholder="4.5" /></FormGroup>
            <FormGroup label="Reviews Count"><Input type="number" value={form.reviews} onChange={f("reviews")} placeholder="0" /></FormGroup>
          </FormRow>

          {/* Image Upload */}
          <FormGroup label="Product Image">
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ width: 90, height: 90, borderRadius: 12, background: "var(--surface-3)", border: "2px solid var(--border)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {form.image ? <img src={form.image} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="fas fa-image" style={{ color: "var(--text-dim)", fontSize: 28 }} />}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <Input value={form.image} onChange={f("image")} placeholder="Paste image URL…" style={{ marginBottom: 10 }} />
                <div style={{ border: "2px dashed var(--border)", borderRadius: 10, padding: 14, textAlign: "center", position: "relative", cursor: "pointer", transition: "all var(--transition)" }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file?.type.startsWith("image/")) handleFileUpload(file); }}>
                  <input ref={fileRef} type="file" accept="image/*" style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                    onChange={(e) => handleFileUpload(e.target.files[0])} />
                  <i className="fas fa-cloud-arrow-up" style={{ fontSize: 22, color: "var(--text-dim)", display: "block", marginBottom: 4, pointerEvents: "none" }} />
                  <div style={{ fontSize: 12, color: "var(--text-dim)", pointerEvents: "none" }}>Click or drag & drop image</div>
                </div>
                {uploading && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "var(--accent)", width: `${uploadProgress}%`, transition: "width 0.3s", borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Uploading to S3…</div>
                  </div>
                )}
              </div>
            </div>
          </FormGroup>

          <FormGroup label="Description">
            <textarea value={form.desc} onChange={f("desc")} placeholder="Short product description…"
              style={{ width: "100%", padding: "12px 16px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", minHeight: 80, resize: "vertical" }} />
          </FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
// ─── ICON PARSER ─────────────────────────────────────────────────────────────
// Accepts ANY of these formats and returns { prefix, iconName }:
//   <i class="fa-solid fa-house"></i>
//   <i class="fas fa-house"></i>
//   fa-house
//   fa-solid fa-house
function parseIconInput(raw) {
  if (!raw) return { prefix: "fas", iconName: "fa-tag" };
  const str = raw.trim();

  // Format: <i class="fa-solid fa-house"></i>  or  <i class="fas fa-wallet">
  const classMatch = str.match(/class=["']([^"']+)["']/);
  if (classMatch) {
    const parts = classMatch[1].trim().split(/\s+/);
    const prefix = parts.find(p => ["fas","far","fab","fa-solid","fa-regular","fa-brands"].includes(p)) || "fas";
    const iconName = parts.find(p => p.startsWith("fa-") && p !== prefix && p !== "fa-solid" && p !== "fa-regular" && p !== "fa-brands") || "fa-tag";
    return { prefix: prefix === "fa-solid" ? "fas" : prefix === "fa-regular" ? "far" : prefix === "fa-brands" ? "fab" : prefix, iconName };
  }

  // Format: fa-solid fa-house  or  fas fa-house
  const spaceMatch = str.match(/(fa-solid|fa-regular|fa-brands|fas|far|fab)\s+(fa-[\w-]+)/);
  if (spaceMatch) {
    const prefix = spaceMatch[1] === "fa-solid" ? "fas" : spaceMatch[1] === "fa-regular" ? "far" : spaceMatch[1] === "fa-brands" ? "fab" : spaceMatch[1];
    return { prefix, iconName: spaceMatch[2] };
  }

  // Format: fa-house  (just the icon name)
  if (str.startsWith("fa-")) return { prefix: "fas", iconName: str };

  return { prefix: "fas", iconName: "fa-tag" };
}

// Popular icons for quick selection
const POPULAR_ICONS = [
  { label: "Tag", code: "fa-tag" },
  { label: "Shirt", code: "fa-shirt" },
  { label: "Gem", code: "fa-gem" },
  { label: "Wallet", code: "fa-wallet" },
  { label: "Laptop", code: "fa-laptop" },
  { label: "Phone", code: "fa-mobile-screen" },
  { label: "House", code: "fa-house" },
  { label: "Car", code: "fa-car" },
  { label: "Game", code: "fa-gamepad" },
  { label: "Book", code: "fa-book" },
  { label: "Camera", code: "fa-camera" },
  { label: "Music", code: "fa-music" },
  { label: "Sport", code: "fa-dumbbell" },
  { label: "Baby", code: "fa-baby" },
  { label: "Ring", code: "fa-ring" },
  { label: "Couch", code: "fa-couch" },
  { label: "Spa", code: "fa-spa" },
  { label: "Chip", code: "fa-microchip" },
  { label: "Shoes", code: "fa-shoe-prints" },
  { label: "Clock", code: "fa-clock" },
];

function CategoriesPage({ toast }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", iconRaw: "fa-tag" });

  const load = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([getCategories(), getProducts()]);
      setCategories(c); setProducts(p);
    } catch (e) { toast("Load failed: " + e.message, "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);// eslint-disable-line

  const openAdd = () => { setEditing(null); setForm({ name: "", iconRaw: "fa-tag" }); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, iconRaw: c.icon }); setModal(true); };

  const getIconClass = () => {
    const { prefix, iconName } = parseIconInput(form.iconRaw);
    return `${prefix} ${iconName}`;
  };

  const getSavedIconName = () => {
    const { iconName } = parseIconInput(form.iconRaw);
    return iconName;
  };

  const handleSave = async () => {
    if (!form.name) { toast("Category name is required.", "error"); return; }
    setSaving(true);
    try {
      const iconName = getSavedIconName();
      if (editing) { await updateCategory(editing.id, form.name, iconName); toast(`"${form.name}" updated`); }
      else { await addCategory(form.name, iconName); toast(`"${form.name}" created`); }
      setModal(false); await load();
    } catch (e) { toast("Save failed: " + e.message, "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try { await deleteCategory(c.id); toast(`"${c.name}" deleted`); await load(); }
    catch (e) { toast("Delete failed: " + e.message, "error"); }
  };

  return (
    <div>
      <PageHeader title="Categories" sub="Organize your product catalog">
        <Btn onClick={openAdd} accent><i className="fas fa-plus" style={{ marginRight: 8 }} />Add Category</Btn>
      </PageHeader>
      <Panel>
        {loading ? <Center><span className="spinner" /></Center> : categories.length === 0 ? <Empty icon="fa-tags" msg="No categories yet." /> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Icon", "Name", "Products", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-dim)", padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.name).length;
                return (
                  <tr key={cat.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 16px" }}><i className={`fas ${cat.icon}`} style={{ fontSize: 22, color: "var(--accent)" }} /></td>
                    <td style={{ padding: "14px 16px", fontWeight: 600, fontSize: 14 }}>{cat.name}</td>
                    <td style={{ padding: "14px 16px", fontSize: 14, color: "var(--text-muted)" }}>{count} product{count !== 1 ? "s" : ""}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn sm ghost onClick={() => openEdit(cat)}><i className="fas fa-pen" /></Btn>
                        <Btn sm danger onClick={() => handleDelete(cat)}><i className="fas fa-trash" /></Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      {modal && (
        <Modal title={editing ? "Edit Category" : "Add Category"} onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          {/* Category Name */}
          <FormGroup label="Category Name">
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Home & Living" />
          </FormGroup>

          {/* Icon Input — accepts ANY format */}
          <FormGroup label="Icon">
            <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>

              {/* Live Preview */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, padding: 16, background: "var(--surface-3)", borderRadius: 10 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--accent-glow)", border: "1px solid rgba(232,168,56,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className={getIconClass()} style={{ fontSize: 26, color: "var(--accent)" }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Live Preview</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "monospace" }}>{getIconClass()}</div>
                </div>
              </div>

              {/* Input field */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 8 }}>
                  Paste Font Awesome code or type icon name
                </div>
                <Input
                  value={form.iconRaw}
                  onChange={(e) => setForm((f) => ({ ...f, iconRaw: e.target.value }))}
                  placeholder='e.g. fa-house  or  <i class="fa-solid fa-house"></i>'
                />
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 6 }}>
                  ✅ Accepts: <code style={{ background: "var(--surface-3)", padding: "1px 6px", borderRadius: 4 }}>fa-house</code>
                  {" "}<code style={{ background: "var(--surface-3)", padding: "1px 6px", borderRadius: 4 }}>fas fa-house</code>
                  {" "}<code style={{ background: "var(--surface-3)", padding: "1px 6px", borderRadius: 4 }}>{`<i class="fa-solid fa-house"></i>`}</code>
                </div>
              </div>

              {/* Quick pick icons */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 10 }}>
                  Quick Pick
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))", gap: 8 }}>
                  {POPULAR_ICONS.map((ic) => (
                    <button key={ic.code}
                      onClick={() => setForm((f) => ({ ...f, iconRaw: ic.code }))}
                      title={ic.label}
                      style={{
                        padding: "10px 6px", borderRadius: 10, border: `1px solid ${getSavedIconName() === ic.code ? "var(--accent)" : "var(--border)"}`,
                        background: getSavedIconName() === ic.code ? "var(--accent-glow)" : "var(--surface-3)",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        transition: "all var(--transition)",
                      }}>
                      <i className={`fas ${ic.code}`} style={{ fontSize: 18, color: getSavedIconName() === ic.code ? "var(--accent)" : "var(--text-muted)" }} />
                      <span style={{ fontSize: 9, color: "var(--text-dim)", textAlign: "center" }}>{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse link */}
              <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                Need more icons?{" "}
                <a href="https://fontawesome.com/icons" target="_blank" rel="noreferrer"
                  style={{ color: "var(--accent)", fontWeight: 600 }}>
                  Browse all Font Awesome icons →
                </a>
              </div>
            </div>
          </FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────
function OrdersPage({ toast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setOrders(await getOrders()); }
      catch (e) { toast("Failed to load orders: " + e.message, "error"); }
      finally { setLoading(false); }
    })();
  }, []);// eslint-disable-line

  return (
    <div>
      <PageHeader title="Orders" sub={loading ? "Loading…" : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`} />
      {loading ? <Center><span className="spinner spinner-lg" /></Center> : orders.length === 0 ? <Empty icon="fa-receipt" msg="No orders yet." /> : (
        <div>
          {orders.map((o) => (
            <div key={o.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 22px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontWeight: 700, color: "var(--accent)", display: "flex", alignItems: "center", gap: 8 }}><i className="fas fa-receipt" />Order #{o.id}</span>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{new Date(o.date).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8 }}>
                {o.items.map((item) => (
                  <div key={item.productId}>• {item.name} × {item.qty} — <strong>${(item.price * item.qty).toFixed(2)}</strong></div>
                ))}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginTop: 10 }}>Total: ${Number(o.total).toFixed(2)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsPage({ toast }) {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([getSalesStats(), getProducts()]);
        setStats(s); setProducts(p);
      } catch (e) { toast("Failed: " + e.message, "error"); }
      finally { setLoading(false); }
    })();
  }, []);// eslint-disable-line

  return (
    <div>
      <PageHeader title="Product Sales" sub="Units sold and revenue per product" />
      <Panel>
        {loading ? <Center><span className="spinner" /></Center> : !stats || Object.keys(stats.productSales || {}).length === 0 ? <Empty icon="fa-chart-bar" msg="No sales data yet." /> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>{["Product", "Units Sold", "Revenue"].map((h) => (
                <th key={h} style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-dim)", padding: "12px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {Object.entries(stats.productSales).sort((a, b) => b[1].qty - a[1].qty).map(([id, d]) => {
                const p = products.find((x) => x.id === parseInt(id));
                return (
                  <tr key={id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {p?.image && <img src={p.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />}
                        <div>
                          <div style={{ fontWeight: 600 }}>{d.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-dim)" }}>ID: {id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>{d.qty} units</td>
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--success)", fontSize: 15 }}>${d.revenue.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}

// ─── THEME EDITOR ─────────────────────────────────────────────────────────────
function ThemeEditorPage({ theme, updateTheme, resetTheme, defaultTheme, toast }) {
  const colorFields = [
    { key: "accent", label: "Accent Color" },
    { key: "accentHover", label: "Accent Hover" },
    { key: "bg", label: "Background" },
    { key: "surface", label: "Surface" },
    { key: "surface2", label: "Surface 2" },
    { key: "border", label: "Border Color" },
    { key: "text", label: "Text Color" },
    { key: "textMuted", label: "Text Muted" },
    { key: "danger", label: "Danger Color" },
    { key: "success", label: "Success Color" },
  ];

  const textFields = [
    { key: "storeName", label: "Store Name" },
    { key: "promoBanner", label: "Promo Banner Text" },
    { key: "heroTitle", label: "Hero Title" },
    { key: "heroSubtitle", label: "Hero Subtitle" },
  ];

  const fontOptions = [
    { label: "DM Sans (Default)", value: "'DM Sans', sans-serif" },
    { label: "Inter", value: "'Inter', sans-serif" },
    { label: "Lato", value: "'Lato', sans-serif" },
    { label: "Open Sans", value: "'Open Sans', sans-serif" },
    { label: "Roboto", value: "'Roboto', sans-serif" },
  ];
  const displayFontOptions = [
    { label: "Playfair Display (Default)", value: "'Playfair Display', serif" },
    { label: "Georgia", value: "'Georgia', serif" },
    { label: "Merriweather", value: "'Merriweather', serif" },
  ];

  return (
    <div>
      <PageHeader title="Customize Store" sub="Every element is customizable">
        <Btn ghost onClick={() => { resetTheme(); toast("Theme reset to defaults"); }}>
          <i className="fas fa-rotate-left" style={{ marginRight: 8 }} />Reset
        </Btn>
      </PageHeader>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Colors */}
        <Panel title="Colors">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {colorFields.map(({ key, label }) => (
              <div key={key}>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="color" value={theme[key] || "#000000"} onChange={(e) => updateTheme({ [key]: e.target.value })}
                    style={{ width: 36, height: 36, border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", background: "none", padding: 2 }} />
                  <input value={theme[key] || ""} onChange={(e) => updateTheme({ [key]: e.target.value })}
                    style={{ flex: 1, padding: "8px 12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, fontFamily: "monospace", outline: "none" }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Text content */}
        <div>
          <Panel title="Store Content">
            {textFields.map(({ key, label }) => (
              <FormGroup key={key} label={label}>
                <Input value={theme[key] || ""} onChange={(e) => updateTheme({ [key]: e.target.value })} />
              </FormGroup>
            ))}
          </Panel>

          <Panel title="Typography">
            <FormGroup label="Body Font">
              <Select value={theme.fontBody} onChange={(e) => updateTheme({ fontBody: e.target.value })}>
                {fontOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Display Font">
              <Select value={theme.fontDisplay} onChange={(e) => updateTheme({ fontDisplay: e.target.value })}>
                {displayFontOptions.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Border Radius">
              <Select value={theme.borderRadius} onChange={(e) => updateTheme({ borderRadius: e.target.value })}>
                <option value="6px">Small (6px)</option>
                <option value="12px">Medium (12px)</option>
                <option value="18px">Large (18px)</option>
                <option value="24px">Extra Large (24px)</option>
              </Select>
            </FormGroup>
          </Panel>
        </div>
      </div>

      {/* Live Preview */}
      <Panel title="Live Preview">
        <div style={{ background: theme.bg, border: "1px solid var(--border)", borderRadius: 16, padding: 32, marginTop: 8 }}>
          <div style={{ fontFamily: theme.fontDisplay, fontSize: 36, fontWeight: 700, background: `linear-gradient(135deg,${theme.accent},#f5d38a)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 8 }}>{theme.storeName}</div>
          <p style={{ color: theme.textMuted, fontFamily: theme.fontBody, marginBottom: 20 }}>{theme.heroSubtitle}</p>
          <button style={{ padding: "12px 28px", background: theme.accent, color: "#0a0a0a", border: "none", borderRadius: theme.borderRadius, fontFamily: theme.fontBody, fontWeight: 600, cursor: "pointer" }}>Shop Now</button>
        </div>
      </Panel>
    </div>
  );
}

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
function PageHeader({ title, sub, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600 }}>{title}</h1>
        {sub && <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{sub}</div>}
      </div>
      {children && <div style={{ display: "flex", gap: 10 }}>{children}</div>}
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, marginBottom: 24, overflow: "hidden" }}>
      {title && (
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
        </div>
      )}
      <div style={{ padding: title ? "0" : "20px 24px" }}>{children}</div>
    </div>
  );
}

function StatCard({ icon, color, value, label }) {
  const colors = { orange: ["var(--accent-glow)", "var(--accent)"], blue: ["var(--info-glow)", "var(--info)"], green: ["var(--success-glow)", "var(--success)"], red: ["var(--danger-glow)", "var(--danger)"] };
  const [bg, fg] = colors[color] || colors.orange;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: fg, marginBottom: 16 }}>
        <i className={`fas ${icon}`} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

function Modal({ title, children, onClose, onSave, saving }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, width: 560, maxWidth: "93vw", maxHeight: "90vh", overflowY: "auto", transform: "scale(1)", animation: "scaleIn 0.25s ease" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}><i className="fas fa-xmark" /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
          <Btn ghost onClick={onClose}>Cancel</Btn>
          <Btn accent onClick={onSave} disabled={saving}>
            {saving ? <><span className="spinner spinner-sm" style={{ marginRight: 8 }} />Saving…</> : <><i className="fas fa-check" style={{ marginRight: 8 }} />Save</>}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, accent, ghost, danger, sm, disabled }) {
  const styles = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: sm ? "6px 12px" : "10px 20px",
    borderRadius: sm ? 8 : 10, fontSize: sm ? 12 : 13,
    fontWeight: 600, fontFamily: "inherit", border: "none", cursor: disabled ? "not-allowed" : "pointer",
    transition: "all var(--transition)", opacity: disabled ? 0.6 : 1,
    background: accent ? "var(--accent)" : danger ? "var(--danger-glow)" : ghost ? "transparent" : "var(--surface-2)",
    color: accent ? "#0a0a0a" : danger ? "var(--danger)" : "var(--text-muted)",
    ...(ghost ? { border: "1px solid var(--border)" } : {}),
  };
  return <button style={styles} onClick={onClick} disabled={disabled}>{children}</button>;
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-muted)", marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

function FormRow({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}

function Input({ value, onChange, type = "text", placeholder, min, max, step, style }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      min={min} max={max} step={step}
      style={{ width: "100%", padding: "12px 16px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", ...style }} />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange}
      style={{ width: "100%", padding: "12px 16px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
      {children}
    </select>
  );
}

function Badge({ children, color }) {
  const map = { orange: ["var(--accent-glow)", "var(--accent)"], green: ["var(--success-glow)", "var(--success)"], red: ["var(--danger-glow)", "var(--danger)"], blue: ["var(--info-glow)", "var(--info)"] };
  const [bg, fg] = map[color] || map.orange;
  return <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", background: bg, color: fg }}>{children}</span>;
}

function Empty({ icon, msg }) {
  return <div style={{ textAlign: "center", color: "var(--text-dim)", padding: "48px 24px" }}><i className={`fas ${icon}`} style={{ fontSize: 40, opacity: 0.18, display: "block", marginBottom: 12 }} />{msg}</div>;
}

function Center({ children }) {
  return <div style={{ textAlign: "center", padding: 48 }}>{children}</div>;
}

function FullCenter({ children }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg)" }}>{children}</div>;
}
