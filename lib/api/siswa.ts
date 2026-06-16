const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

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

export const login = async (username: string, password: string) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login gagal.");

  localStorage.setItem("token", data.data.token);
  localStorage.setItem("user", JSON.stringify(data.data));

  return data.data; 
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// ── Profil ───────────────────────────────────────────────────────────────────


export const getProfil = async () => {
  const data = await fetchWithAuth("/api/siswa/profil");
  return data.data;
};

// ── Jadwal ───────────────────────────────────────────────────────────────────
export const getJadwal = async (tahunAjaran?: string) => {
  const query = tahunAjaran ? `?tahunAjaran=${tahunAjaran}` : "";
  const data = await fetchWithAuth(`/api/siswa/jadwal${query}`);
  return data.data;
};

// ── Materi ───────────────────────────────────────────────────────────────────

export const getMapelList = async () => {
  const data = await fetchWithAuth("/api/siswa/materi");
  return data.data;
};

export const getMateriByMapel = async (mapel: string, pertemuan?: number) => {
  const query = pertemuan ? `?pertemuan=${pertemuan}` : "";
  const data = await fetchWithAuth(
    `/api/siswa/materi/${encodeURIComponent(mapel)}${query}`
  );
  return data.data;
};

// ── Pengumuman ────────────────────────────────────────────────────────────────
export const getPengumuman = async (page = 1, limit = 20) => {
  const data = await fetchWithAuth(
    `/api/siswa/pengumuman?page=${page}&limit=${limit}`
  );
  return data.data;
};
export const getPengumumanDetail = async (id: string) => {
  const data = await fetchWithAuth(`/api/siswa/pengumuman/${id}`);
  return data.data;
};

// ── Kelas ─────────────────────────────────────────────────────────────────────
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

export const getKelasSiswa = async () => {
  const data = await fetchWithAuth("/api/siswa/kelas");
  return data.data;
};

// ── Ekskul ────────────────────────────────────────────────────────────────────

export const getEkskul = async () => {
  const data = await fetchWithAuth("/api/siswa/ekskul");
  return data.data;
};

export async function leaveKelas(id: string) {
  const token = getToken();

  const res = await fetch(
    `${BASE_URL}/api/siswa/kelas/${id}/leave`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
}