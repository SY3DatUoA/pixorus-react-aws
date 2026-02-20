// src/pages/LandingPage.js
import { useTheme } from "../context/ThemeContext";

export default function LandingPage({ navigate }) {
  const { theme } = useTheme();

  return (
    <div style={styles.page}>
      {/* Background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}>{theme.storeName}</div>
        <div style={styles.tagline}>Premium eCommerce Experience</div>

        {/* Hero cards */}
        <div style={styles.cards}>
          {/* Customer Card */}
          <div
            style={styles.card}
            onClick={() => navigate("store")}
            className="landing-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.borderColor = theme.accent;
              e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px ${theme.accent}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
            }}
          >
            <div style={{ ...styles.cardIcon, background: `${theme.accent}20`, border: `1px solid ${theme.accent}40` }}>
              <i className="fas fa-bag-shopping" style={{ color: theme.accent, fontSize: 32 }} />
            </div>
            <h2 style={styles.cardTitle}>Shop Now</h2>
            <p style={styles.cardDesc}>
              Browse our curated collection of premium products. Add items to your cart and place orders instantly.
            </p>
            <div style={{ ...styles.cardBtn, background: theme.accent, color: "#0a0a0a" }}>
              <i className="fas fa-arrow-right" style={{ marginRight: 8 }} />
              Enter Store
            </div>
            <div style={styles.cardFeatures}>
              <span style={styles.feature}><i className="fas fa-check" /> Browse Products</span>
              <span style={styles.feature}><i className="fas fa-check" /> Add to Cart</span>
              <span style={styles.feature}><i className="fas fa-check" /> Place Orders</span>
            </div>
          </div>

          {/* Admin Card */}
          <div
            style={styles.card}
            onClick={() => navigate("admin")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
            }}
          >
            <div style={{ ...styles.cardIcon, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
              <i className="fas fa-shield-halved" style={{ color: "#60a5fa", fontSize: 32 }} />
            </div>
            <h2 style={styles.cardTitle}>Admin Panel</h2>
            <p style={styles.cardDesc}>
              Manage products, categories, and orders. Upload photos, track sales, and customize your store.
            </p>
            <div style={{ ...styles.cardBtn, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: theme.text }}>
              <i className="fas fa-lock" style={{ marginRight: 8 }} />
              Admin Login
            </div>
            <div style={styles.cardFeatures}>
              <span style={styles.feature}><i className="fas fa-check" /> CRUD Products</span>
              <span style={styles.feature}><i className="fas fa-check" /> Upload Photos</span>
              <span style={styles.feature}><i className="fas fa-check" /> View Orders</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          {[
            { icon: "fa-box", label: "Products", val: "Unlimited" },
            { icon: "fa-cloud", label: "Powered by", val: "AWS" },
            { icon: "fa-lock", label: "Auth by", val: "Cognito" },
            { icon: "fa-database", label: "Database", val: "DynamoDB" },
          ].map((s) => (
            <div key={s.label} style={styles.stat}>
              <i className={`fas ${s.icon}`} style={{ color: theme.accent, fontSize: 20, marginBottom: 6 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg)",
    position: "relative",
    overflow: "hidden",
    padding: "40px 20px",
  },
  orb1: {
    position: "absolute", borderRadius: "50%",
    width: 500, height: 500,
    background: "var(--accent)",
    filter: "blur(120px)",
    opacity: 0.06,
    top: "-10%", right: "-5%",
    animation: "float 10s ease-in-out infinite",
  },
  orb2: {
    position: "absolute", borderRadius: "50%",
    width: 400, height: 400,
    background: "#e85454",
    filter: "blur(120px)",
    opacity: 0.05,
    bottom: "-10%", left: "-5%",
    animation: "float 14s ease-in-out infinite 3s",
  },
  orb3: {
    position: "absolute", borderRadius: "50%",
    width: 300, height: 300,
    background: "#60a5fa",
    filter: "blur(100px)",
    opacity: 0.04,
    top: "40%", left: "30%",
    animation: "float 12s ease-in-out infinite 6s",
  },
  container: {
    width: "100%",
    maxWidth: 860,
    textAlign: "center",
    zIndex: 2,
    animation: "fadeInUp 0.7s ease both",
  },
  logo: {
    fontFamily: "var(--font-display)",
    fontSize: "clamp(48px, 8vw, 80px)",
    fontWeight: 700,
    letterSpacing: 6,
    background: "linear-gradient(135deg, var(--accent), #f5d38a, var(--accent))",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: "var(--text-muted)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 56,
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 24,
    marginBottom: 48,
  },
  card: {
    background: "var(--surface)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "40px 36px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    textAlign: "left",
  },
  cardIcon: {
    width: 72, height: 72,
    borderRadius: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: "var(--font-display)",
    fontSize: 26, fontWeight: 700,
    color: "var(--text)",
    marginBottom: 12,
  },
  cardDesc: {
    fontSize: 14, lineHeight: 1.7,
    color: "var(--text-muted)",
    marginBottom: 28,
  },
  cardBtn: {
    display: "inline-flex", alignItems: "center",
    padding: "12px 28px",
    borderRadius: 50, fontSize: 14, fontWeight: 600,
    marginBottom: 24, cursor: "pointer",
    border: "none", fontFamily: "inherit",
    transition: "all 0.25s ease",
  },
  cardFeatures: {
    display: "flex", flexDirection: "column", gap: 8,
  },
  feature: {
    fontSize: 13, color: "var(--text-muted)",
    display: "flex", alignItems: "center", gap: 8,
  },
  statsRow: {
    display: "flex", justifyContent: "center",
    gap: 40, flexWrap: "wrap",
  },
  stat: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 4, minWidth: 90,
  },
};
