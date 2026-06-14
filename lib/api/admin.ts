// lib/api/admin.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan.");
  return data;
};

// ── Stats ────────────────────────────────────────────────────────────────────
export const getStats = async () => {
  const data = await fetchWithAuth("/api/admin/stats");
  return data.data;
};

// ── User CRUD ────────────────────────────────────────────────────────────────
export const getUsers = async (params?: {
  role?: "siswa" | "guru";
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.role)   query.set("role",   params.role);
  if (params?.search) query.set("search", params.search);
  if (params?.page)   query.set("page",   String(params.page));
  if (params?.limit)  query.set("limit",  String(params.limit));
  return await fetchWithAuth(`/api/admin/users?${query.toString()}`);
};

export const getUserById = async (id: string) => {
  const data = await fetchWithAuth(`/api/admin/users/${id}`);
  return data.data;
};

export const createUser = async (payload: {
  nama: string;
  username: string;
  password: string;
  role: "siswa" | "guru";
  nisn?: string;
  kelas?: string;
  nip?: string;
  mapel?: string;
}) => {
  const data = await fetchWithAuth("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
};

export const updateUser = async (
  id: string,
  payload: Partial<{
    nama: string;
    username: string;
    password: string;
    role: "siswa" | "guru";
    nisn: string;
    kelas: string;
    nip: string;
    mapel: string;
  }>,
) => {
  const data = await fetchWithAuth(`/api/admin/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
};

export const deleteUser = async (id: string) => {
  return await fetchWithAuth(`/api/admin/users/${id}`, { method: "DELETE" });
};

// ← BARU: Reset password user ke "sekolah123"
export const resetPassword = async (id: string) => {
  const data = await fetchWithAuth(`/api/admin/users/${id}/reset-password`, {
    method: "PUT",
    body: JSON.stringify({ password: "sekolah123" }),
  });
  return data;
};

// ── Jadwal ───────────────────────────────────────────────────────────────────
export const getJadwal = async (params?: { kelas?: string; tahunAjaran?: string }) => {
  const query = new URLSearchParams();
  if (params?.kelas)       query.set("kelas",       params.kelas);
  if (params?.tahunAjaran) query.set("tahunAjaran", params.tahunAjaran);
  const data = await fetchWithAuth(`/api/admin/jadwal?${query.toString()}`);
  return data.data;
};

export const saveJadwal = async (payload: {
  kelas: string;
  tahunAjaran: string;
  durasi?: number;
  jadwal: Record<string, Record<string, { mapel: string; guru: string } | null>>;
}) => {
  const data = await fetchWithAuth("/api/admin/jadwal/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
};

// ── Pengumuman ────────────────────────────────────────────────────────────────
export const getPengumuman = async (params?: {
  target?: "semua" | "siswa" | "guru";
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.target) query.set("target", params.target);
  if (params?.page)   query.set("page",   String(params.page));
  if (params?.limit)  query.set("limit",  String(params.limit));
  return await fetchWithAuth(`/api/admin/pengumuman?${query.toString()}`);
};

export const createPengumuman = async (payload: {
  judul: string;
  isi: string;
  tag?: string;
  target?: "semua" | "siswa" | "guru";
  penting?: boolean;
}) => {
  const data = await fetchWithAuth("/api/admin/pengumuman", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
};

export const updatePengumuman = async (
  id: string,
  payload: Partial<{ judul: string; isi: string; tag: string; target: "semua" | "siswa" | "guru"; penting: boolean }>,
) => {
  const data = await fetchWithAuth(`/api/admin/pengumuman/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
};

export const deletePengumuman = async (id: string) => {
  return await fetchWithAuth(`/api/admin/pengumuman/${id}`, { method: "DELETE" });
};
