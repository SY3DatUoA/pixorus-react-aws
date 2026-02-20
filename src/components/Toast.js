// src/components/Toast.js
import { useCart } from "../context/CartContext";

export default function Toast() {
  const { toasts } = useCart();
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 9999,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: "var(--surface-3)",
          border: `1px solid ${t.type === "error" ? "var(--danger)" : "var(--border-light)"}`,
          borderRadius: 10, padding: "12px 18px",
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 13, maxWidth: 320,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "toastIn 0.3s ease",
        }}>
          <i className={`fas ${t.type === "error" ? "fa-exclamation-circle" : "fa-check-circle"}`}
            style={{ color: t.type === "error" ? "var(--danger)" : "var(--success)", flexShrink: 0 }} />
          {t.msg}
        </div>
      ))}
    </div>
  );
}
