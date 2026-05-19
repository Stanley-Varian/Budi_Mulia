// lib/api/siswa.ts
// Semua fungsi fetch ke backend untuk role siswa
// Pemakaian: import { getJadwal, getMateriList, ... } from "@/lib/api/siswa"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Helper: ambil token dari localStorage ────────────────────────────────────
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// ── Helper: fetch dengan auth header ────────────────────────────────────────
const fetchWithAuth = async (endpoint: string) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Terjadi kesalahan.");
  return data;
};

// ── Auth ─────────────────────────────────────────────────────────────────────

// POST /api/auth/login
export const login = async (username: string, password: string) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login gagal.");

  // Simpan token & data user ke localStorage
  localStorage.setItem("token", data.data.token);
  localStorage.setItem("user", JSON.stringify(data.data));

  return data.data; // { _id, nama, username, role, kelas, mapel, token }
};

// Logout — hapus localStorage
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Ambil data user dari localStorage
export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// ── Profil ───────────────────────────────────────────────────────────────────

// GET /api/siswa/profil
export const getProfil = async () => {
  const data = await fetchWithAuth("/api/siswa/profil");
  return data.data;
};

// ── Jadwal ───────────────────────────────────────────────────────────────────

// GET /api/siswa/jadwal
// Return: { kelas, tahunAjaran, durasi, jadwal: { Senin: { 1: {mapel,guru}, ... }, ... } }
export const getJadwal = async (tahunAjaran?: string) => {
  const query = tahunAjaran ? `?tahunAjaran=${tahunAjaran}` : "";
  const data = await fetchWithAuth(`/api/siswa/jadwal${query}`);
  return data.data;
};

// ── Materi ───────────────────────────────────────────────────────────────────

// GET /api/siswa/materi
// Return: [{ mapel, guru, jumlahMateri, updatedAt }]
// Dipake di: dashboard-siswa-page.tsx (grid card mapel)
export const getMapelList = async () => {
  const data = await fetchWithAuth("/api/siswa/materi");
  return data.data;
};

// GET /api/siswa/materi/:mapel
// Return: { mapel, kelas, guru, list: [{ id, judul, deskripsi, tipe, url, ukuran, pertemuan, tanggal }] }
// Dipake di: materi-siswa-page.tsx
export const getMateriByMapel = async (mapel: string, pertemuan?: number) => {
  const query = pertemuan ? `?pertemuan=${pertemuan}` : "";
  const data = await fetchWithAuth(
    `/api/siswa/materi/${encodeURIComponent(mapel)}${query}`
  );
  return data.data;
};

// ── Pengumuman ────────────────────────────────────────────────────────────────

// GET /api/siswa/pengumuman
// Return: { total, page, limit, list: [...] }
// Dipake di: pengumuman-page.tsx
export const getPengumuman = async (page = 1, limit = 20) => {
  const data = await fetchWithAuth(
    `/api/siswa/pengumuman?page=${page}&limit=${limit}`
  );
  return data.data;
};

// GET /api/siswa/pengumuman/:id
export const getPengumumanDetail = async (id: string) => {
  const data = await fetchWithAuth(`/api/siswa/pengumuman/${id}`);
  return data.data;
};

// ── Kelas ─────────────────────────────────────────────────────────────────────

// POST /api/siswa/kelas/join
// Body  : { kodeKelas: string }
// Return: { message, data: { id, nama, mapel, guru, kodeKelas } }
// Dipake di: dashboard-siswa-page.tsx (modal join kelas)
export const joinKelas = async (kodeKelas: string) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/siswa/kelas/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ kodeKelas: kodeKelas.trim().toUpperCase() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal bergabung ke kelas.");
  return data.data; // { id, nama, mapel, guru, kodeKelas }
};

// GET /api/siswa/kelas
// Return: [{ id, nama, mapel, guru, kodeKelas }]
// Dipake di: dashboard-siswa-page.tsx (daftar kelas yang sudah diikuti)
export const getKelasSiswa = async () => {
  const data = await fetchWithAuth("/api/siswa/kelas");
  return data.data;
};

// ── Ekskul ────────────────────────────────────────────────────────────────────

// GET /api/siswa/ekskul
// Return: [{ id, nama, pembina, hari, jam, tempat, warna, warnaText }]
// Dipake di: jadwal-siswa-page.tsx (tab Ekskul)
export const getEkskul = async () => {
  const data = await fetchWithAuth("/api/siswa/ekskul");
  return data.data;
};