// lib/api/guru.ts
// Fungsi fetch ke backend untuk role guru

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const fetchWithAuth = async (endpoint: string, options?: RequestInit) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan.");
  return data;
};

// ── Pengumuman ────────────────────────────────────────────────────────────────

// GET /api/guru/pengumuman
// Return: { total, page, limit, list: [...] }
export const getPengumuman = async (page = 1, limit = 20) => {
  const data = await fetchWithAuth(
    `/api/guru/pengumuman?page=${page}&limit=${limit}`
  );
  return data.data;
};

// GET /api/guru/pengumuman/:id
export const getPengumumanDetail = async (id: string) => {
  const data = await fetchWithAuth(`/api/guru/pengumuman/${id}`);
  return data.data;
};

// POST /api/guru/pengumuman
export const createPengumuman = async (payload: {
  judul: string;
  isi: string;
  tag: string;
  target: "semua" | "siswa" | "guru";
  penting: boolean;
}) => {
  const data = await fetchWithAuth("/api/guru/pengumuman", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data;
};

// PUT /api/guru/pengumuman/:id
export const updatePengumuman = async (
  id: string,
  payload: {
    judul?: string;
    isi?: string;
    tag?: string;
    target?: "semua" | "siswa" | "guru";
    penting?: boolean;
  }
) => {
  const data = await fetchWithAuth(`/api/guru/pengumuman/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.data;
};

// DELETE /api/guru/pengumuman/:id
export const deletePengumuman = async (id: string) => {
  await fetchWithAuth(`/api/guru/pengumuman/${id}`, { method: "DELETE" });
};
