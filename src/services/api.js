// src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// All API Gateway calls go through here.
// Public endpoints use fetch directly.
// Admin endpoints attach the Cognito JWT via Authorization header.
// ─────────────────────────────────────────────────────────────────────────────

import { fetchAuthSession } from "aws-amplify/auth";
import awsExports from "../aws-exports";

const API_BASE = awsExports.aws_cloud_logic_custom[0].endpoint;

// ── Get JWT token for admin requests ────────────────────────────────────────
async function getToken() {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString() || null;
  } catch {
    return null;
  }
}

// ── Core request helper ──────────────────────────────────────────────────────
async function request(path, method = "GET", body = null, requireAuth = false) {
  const headers = { "Content-Type": "application/json" };
  if (requireAuth) {
    const token = await getToken();
    if (token) headers["Authorization"] = token;
  }
  const opts = { method, headers };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Products ─────────────────────────────────────────────────────────────────
export const getProducts = (activeOnly = false) =>
  request(`/products${activeOnly ? "?activeOnly=true" : ""}`);

export const addProduct = (data) => request("/products", "POST", data, true);

export const updateProduct = (id, data) =>
  request(`/products/${id}`, "PUT", data, true);

export const deleteProduct = (id) =>
  request(`/products/${id}`, "DELETE", null, true);

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = () => request("/categories");

export const addCategory = (name, icon) =>
  request("/categories", "POST", { name, icon }, true);

export const updateCategory = (id, name, icon) =>
  request(`/categories/${id}`, "PUT", { name, icon }, true);

export const deleteCategory = (id) =>
  request(`/categories/${id}`, "DELETE", null, true);

// ── Orders ────────────────────────────────────────────────────────────────────
export const placeOrder = (cartItems) =>
  request("/orders", "POST", { cartItems }); // public

export const getOrders = () => request("/orders", "GET", null, true); // admin only

// ── Image Upload (presigned S3 URL) ───────────────────────────────────────────
export const getUploadUrl = (fileName, fileType) =>
  request("/upload-url", "POST", { fileName, fileType }, true);

export async function uploadImage(file) {
  const { uploadUrl, publicUrl } = await getUploadUrl(file.name, file.type);
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!res.ok) throw new Error("S3 upload failed");
  return publicUrl;
}

// ── Sales Stats ───────────────────────────────────────────────────────────────
export async function getSalesStats() {
  const orders = await getOrders();
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalItemsSold = orders.reduce(
    (s, o) => s + o.items.reduce((ss, i) => ss + i.qty, 0),
    0
  );
  const productSales = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.name, qty: 0, revenue: 0 };
      }
      productSales[item.productId].qty += item.qty;
      productSales[item.productId].revenue += item.price * item.qty;
    });
  });
  return { totalOrders, totalRevenue, totalItemsSold, productSales, orders };
}
