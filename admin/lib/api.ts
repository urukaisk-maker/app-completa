import { AuthResponse } from "@/types/auth";
import { Category, Product, ProductsResponse } from "@/types/catalog";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}`);
  }

  return data as T;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ firstName, lastName, email, password }),
  });
}

/* ─── Categories ─── */
export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/categories");
}

export async function createCategory(body: { name: string; slug: string; imageUrl?: string }): Promise<Category> {
  return apiFetch<Category>("/categories", { method: "POST", body: JSON.stringify(body) });
}

export async function updateCategory(id: string, body: Partial<Category>): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteCategory(id: string): Promise<void> {
  return apiFetch<void>(`/categories/${id}`, { method: "DELETE" });
}

/* ─── Products ─── */
export async function getProducts(params?: Record<string, string>): Promise<ProductsResponse> {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<ProductsResponse>(`/products${query}`);
}

export async function getProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export async function createProduct(body: Partial<Product>): Promise<Product> {
  return apiFetch<Product>("/products", { method: "POST", body: JSON.stringify(body) });
}

export async function updateProduct(id: string, body: Partial<Product>): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteProduct(id: string): Promise<void> {
  return apiFetch<void>(`/products/${id}`, { method: "DELETE" });
}

export async function uploadProductImage(productId: string, file: File, order = 0): Promise<any> {
  const token = localStorage.getItem("accessToken");
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_URL}/products/${productId}/images?order=${order}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return data;
}

export async function deleteProductImage(imageId: string): Promise<void> {
  return apiFetch<void>(`/products/images/${imageId}`, { method: "DELETE" });
}
