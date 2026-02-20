// src/pages/StorePage.js
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { getProducts, getCategories, placeOrder } from "../services/api";
import Toast from "../components/Toast";

export default function StorePage({ navigate }) {
  const { theme } = useTheme();
  const { cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal, showToast } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceMax, setPriceMax] = useState(2000);
  const [sort, setSort] = useState("default");
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [wishlist, setWishlist] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const [prods, cats] = await Promise.all([getProducts(true), getCategories()]);
        setProducts(prods);
        setCategories(cats);
        if (prods.length) {
          const max = Math.max(...prods.map((p) => p.price));
          setPriceMax(Math.ceil((max + 50) / 100) * 100);
        }
      } catch {
        showToast("Could not load products. Check your API config.", "error");
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "all") list = list.filter((p) => p.category === activeCategory);
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    list = list.filter((p) => p.price <= priceMax);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [products, activeCategory, search, priceMax, sort]);

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      await placeOrder(cart);
      clearCart();
      setCartOpen(false);
      showToast("Order placed! 🎉");
    } catch (e) {
      showToast("Checkout failed: " + e.message, "error");
    } finally {
      setCheckingOut(false);
    }
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const shipping = cartTotal > 100 ? 0 : 9.99;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Promo Banner */}
      <div style={{ background: "linear-gradient(90deg,var(--accent),#d4943a)", color: "#0a0a0a", textAlign: "center", padding: "10px 20px", fontSize: 13, fontWeight: 600 }}>
        <i className="fas fa-bolt" style={{ marginRight: 8 }} />{theme.promoBanner}
      </div>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)", padding: "0 40px", height: 70, display: "flex", alignItems: "center", gap: 20 }}>
        <button onClick={() => navigate("landing")} style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, letterSpacing: 2, background: "linear-gradient(135deg,var(--accent),#f5d38a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", border: "none", cursor: "pointer", backgroundColor: "transparent", padding: 0, flexShrink: 0 }}>
          {theme.storeName}
        </button>
        <div style={{ flex: 1, maxWidth: 480, position: "relative" }}>
          <i className="fas fa-search" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", fontSize: 13, pointerEvents: "none" }} />
          <input style={{ width: "100%", padding: "10px 16px 10px 44px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 50, color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }}
            placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          <Btn icon="fa-gear" title="Admin" onClick={() => navigate("admin")} />
          <Btn icon="fa-shopping-bag" title="Cart" badge={cartCount} onClick={() => setCartOpen(true)} accent={theme.accent} />
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: "60px 40px", maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, overflow: "hidden" }}>
        <div style={{ maxWidth: 520 }}>
          <div style={{ display: "inline-block", background: "var(--accent-glow)", border: "1px solid rgba(232,168,56,0.3)", color: "var(--accent)", padding: "6px 16px", borderRadius: 50, fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>
            <i className="fas fa-fire" style={{ marginRight: 6 }} /> Trending Now
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px,5vw,52px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
            Discover{" "}<em style={{ fontStyle: "italic", background: "linear-gradient(135deg,var(--accent),#f5d38a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Premium</em>{" "}Style,<br />Unmatched Quality
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.7, marginBottom: 30 }}>{theme.heroSubtitle}</p>
          <button style={{ padding: "13px 32px", background: "var(--accent)", color: "#0a0a0a", border: "none", borderRadius: 50, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
            onClick={() => document.getElementById("prods")?.scrollIntoView({ behavior: "smooth" })}>
            <i className="fas fa-arrow-down" style={{ marginRight: 8 }} /> Shop Now
          </button>
        </div>
        <div style={{ position: "relative", width: 360, height: 280, flexShrink: 0 }}>
          <div style={{ position: "absolute", width: 300, height: 300, background: "var(--accent)", borderRadius: "50%", filter: "blur(90px)", opacity: 0.25, top: 0, right: 0, animation: "float 8s ease-in-out infinite" }} />
          <div style={{ position: "absolute", width: 200, height: 200, background: "#e85454", borderRadius: "50%", filter: "blur(80px)", opacity: 0.15, bottom: 0, left: 20, animation: "float 10s ease-in-out infinite 2s" }} />
        </div>
      </section>

      {/* Main */}
      <div id="prods" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, maxWidth: 1400, margin: "0 auto", padding: "0 40px 80px" }}>
        {/* Sidebar */}
        <aside style={{ position: "sticky", top: 86, alignSelf: "start" }}>
          <SideCard title="Categories">
            <ul style={{ listStyle: "none" }}>
              {[{ id: "all", name: "All Products", icon: "fa-grid-2" }, ...categories.map((c) => ({ ...c }))].map((cat) => (
                <li key={cat.id}
                  style={{ padding: "9px 14px", borderRadius: 10, cursor: "pointer", fontSize: 14, marginBottom: 2, transition: "all var(--transition)", color: activeCategory === cat.name || (cat.id === "all" && activeCategory === "all") ? "var(--accent)" : "var(--text-muted)", background: activeCategory === cat.name || (cat.id === "all" && activeCategory === "all") ? "var(--accent-glow)" : "transparent", fontWeight: activeCategory === cat.name || (cat.id === "all" && activeCategory === "all") ? 600 : 400 }}
                  onClick={() => setActiveCategory(cat.id === "all" ? "all" : cat.name)}>
                  <i className={`fas ${cat.icon || "fa-tag"}`} style={{ marginRight: 8 }} />{cat.name}
                </li>
              ))}
            </ul>
          </SideCard>
          <SideCard title="Price Range">
            <div style={{ fontSize: 14, marginBottom: 10, color: "var(--text-muted)" }}>Up to <strong style={{ color: "var(--accent)" }}>${priceMax}</strong></div>
            <input type="range" min={10} max={5000} value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--accent)" }} />
          </SideCard>
        </aside>

        {/* Products */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>
              Deals of the Day{" "}<span style={{ fontSize: 15, color: "var(--text-muted)", fontFamily: "inherit", fontWeight: 400 }}>({filtered.length})</span>
            </h2>
            <select style={{ padding: "8px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)", fontSize: 13, fontFamily: "inherit", cursor: "pointer", outline: "none" }}
              value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">Sort by</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name">Name: A → Z</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ height: 340, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", opacity: 0.4 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "80px 20px" }}>
              <i className="fas fa-search" style={{ fontSize: 48, opacity: 0.13, display: "block", marginBottom: 12 }} />
              No products found. Try adjusting your filters.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i}
                  wished={wishlist.has(p.id)} onWish={() => toggleWishlist(p.id)}
                  onQuickView={() => setQuickView(p)} onAddToCart={() => addToCart(p)}
                  accentColor={theme.accent} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Cart Overlay */}
      {cartOpen && (
        <>
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", zIndex: 200 }} onClick={() => setCartOpen(false)} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, maxWidth: "100vw", background: "var(--surface)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", zIndex: 201 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                <i className="fas fa-shopping-bag" style={{ marginRight: 10 }} />Cart{" "}
                {cartCount > 0 && <span style={{ background: "var(--accent)", color: "#0a0a0a", borderRadius: 50, padding: "2px 8px", fontSize: 12, fontWeight: 700, marginLeft: 4 }}>{cartCount}</span>}
              </h3>
              <button style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }} onClick={clearCart}>Clear all</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "60px 0" }}>
                  <i className="fas fa-shopping-bag" style={{ fontSize: 40, opacity: 0.12, display: "block", marginBottom: 12 }} />
                  Your cart is empty
                </div>
              ) : cart.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <img src={item.image} alt={item.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: 13, color: "var(--accent)" }}>${item.price}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button style={{ width: 28, height: 28, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", fontSize: 15 }} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                    <button style={{ width: 28, height: 28, borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)", cursor: "pointer", fontSize: 15 }} onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }} onClick={() => removeFromCart(item.id)}><i className="fas fa-xmark" /></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--text-muted)", marginBottom: 6 }}><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--text-muted)", marginBottom: 10 }}>
                  <span>Shipping</span>
                  <span style={{ color: shipping === 0 ? "var(--success)" : "inherit" }}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, borderTop: "1px solid var(--border)", paddingTop: 10, marginBottom: 16 }}>
                  <span>Total</span><strong>${(cartTotal + shipping).toFixed(2)}</strong>
                </div>
                <button style={{ width: "100%", padding: 14, background: "var(--accent)", color: "#0a0a0a", border: "none", borderRadius: "var(--radius)", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: checkingOut ? 0.7 : 1 }}
                  onClick={handleCheckout} disabled={checkingOut}>
                  {checkingOut ? <><span className="spinner spinner-sm" style={{ marginRight: 8 }} />Processing…</> : <><i className="fas fa-lock" style={{ marginRight: 8 }} />Checkout</>}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick View */}
      {quickView && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setQuickView(null)}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, maxWidth: 760, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden", position: "relative", animation: "scaleIn 0.3s ease" }}
            onClick={(e) => e.stopPropagation()}>
            <button style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", fontSize: 16, zIndex: 1 }}
              onClick={() => setQuickView(null)}><i className="fas fa-xmark" /></button>
            <img src={quickView.image} alt={quickView.name} style={{ width: "100%", minHeight: 380, objectFit: "cover" }} />
            <div style={{ padding: 36, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--accent)", fontWeight: 600, marginBottom: 8 }}>{quickView.category}</div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, marginBottom: 12 }}>{quickView.name}</h2>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                {Array(5).fill(0).map((_, i) => <i key={i} className="fas fa-star" style={{ color: i < Math.round(quickView.rating || 0) ? "var(--accent)" : "#333", fontSize: 13, marginRight: 2 }} />)}
                <span style={{ color: "var(--text-muted)", fontSize: 13, marginLeft: 6 }}>({quickView.reviews || 0})</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)", marginRight: 10 }}>${quickView.price}</span>
                {quickView.originalPrice && <span style={{ fontSize: 16, textDecoration: "line-through", color: "var(--text-muted)" }}>${quickView.originalPrice}</span>}
              </div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>{quickView.desc}</p>
              <button style={{ padding: "14px 28px", background: "var(--accent)", color: "#0a0a0a", border: "none", borderRadius: 50, fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={() => { addToCart(quickView); setQuickView(null); }}>
                <i className="fas fa-shopping-bag" style={{ marginRight: 8 }} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast />
    </div>
  );
}

function SideCard({ title, children }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, marginBottom: 16 }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: "var(--text-muted)", marginBottom: 14 }}>{title}</h3>
      {children}
    </div>
  );
}

function Btn({ icon, title, badge, onClick, accent }) {
  return (
    <button title={title} onClick={onClick}
      style={{ width: 42, height: 42, borderRadius: "50%", background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <i className={`fas ${icon}`} />
      {badge > 0 && <span style={{ position: "absolute", top: -2, right: -2, background: accent || "var(--accent)", color: "#0a0a0a", fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>}
    </button>
  );
}

function ProductCard({ product, index, wished, onWish, onQuickView, onAddToCart, accentColor }) {
  const [hovered, setHovered] = useState(false);
  const badgeLabel = product.badge === "sale" && product.originalPrice
    ? `${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`
    : (product.badge || "").toUpperCase();

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", cursor: "pointer", transition: "all 0.3s ease", transform: hovered ? "translateY(-6px)" : "none", boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.4)" : "none", animation: `fadeInUp 0.5s ease ${index * 0.04}s both` }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ position: "relative", paddingTop: "75%", overflow: "hidden" }} onClick={onQuickView}>
        <img src={product.image} alt={product.name}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease", transform: hovered ? "scale(1.07)" : "scale(1)" }}
          loading="lazy" />
        {product.badge && (
          <span style={{ position: "absolute", top: 12, left: 12, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", background: product.badge === "sale" ? accentColor : product.badge === "new" ? "#4ade80" : "#e85454", color: "#0a0a0a" }}>{badgeLabel}</span>
        )}
        <button style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: wished ? "#e85454" : "#aaa" }}
          onClick={(e) => { e.stopPropagation(); onWish(); }}>
          <i className={wished ? "fas fa-heart" : "far fa-heart"} />
        </button>
        {hovered && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.7)", color: "#fff", textAlign: "center", padding: 10, fontSize: 13, fontWeight: 600 }}>
            Quick View
          </div>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: accentColor, fontWeight: 600, marginBottom: 6 }}>{product.category}</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{product.name}</div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          {Array(5).fill(0).map((_, i) => <i key={i} className="fas fa-star" style={{ color: i < Math.round(product.rating || 0) ? "#e8a838" : "#2a2a2a", fontSize: 11, marginRight: 2 }} />)}
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>({product.reviews || 0})</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, color: accentColor }}>${product.price}</span>
            {product.originalPrice && <span style={{ fontSize: 12, textDecoration: "line-through", color: "var(--text-muted)", marginLeft: 6 }}>${product.originalPrice}</span>}
          </div>
          <button style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: accentColor, color: "#0a0a0a", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}
            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}>
            <i className="fas fa-plus" />
          </button>
        </div>
      </div>
    </div>
  );
}
