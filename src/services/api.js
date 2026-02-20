// src/services/api.js
import { getValidToken } from "./auth";
import awsExports from "../aws-exports";

const API_BASE = awsExports.aws_cloud_logic_custom[0].endpoint;

async function request(path, method = "GET", body = null, requireAuth = false) {
  const headers = { "Content-Type": "application/json" };

  if (requireAuth) {
    const token = await getValidToken();
    if (!token) throw new Error("Not authenticated — please log in again");
    headers["Authorization"] = token;
  }

  const opts = { method, headers };
  if (body !== null) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const getProducts = (activeOnly = false) =>
  request(`/products${activeOnly ? "?activeOnly=true" : ""}`);
export const addProduct = (data) => request("/products", "POST", data, true);
export const updateProduct = (id, data) => request(`/products/${id}`, "PUT", data, true);
export const deleteProduct = (id) => request(`/products/${id}`, "DELETE", null, true);

export const getCategories = () => request("/categories");
export const addCategory = (name, icon) => request("/categories", "POST", { name, icon }, true);
export const updateCategory = (id, name, icon) => request(`/categories/${id}`, "PUT", { name, icon }, true);
export const deleteCategory = (id) => request(`/categories/${id}`, "DELETE", null, true);

export const placeOrder = (cartItems) => request("/orders", "POST", { cartItems });
export const getOrders = () => request("/orders", "GET", null, true);

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

export async function getSalesStats() {
  const orders = await getOrders();
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalItemsSold = orders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.qty, 0), 0);
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
