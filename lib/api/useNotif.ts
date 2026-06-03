import { useState, useEffect, useCallback } from "react";
import { getPengumuman as getPengumumanSiswa } from "@/lib/api/siswa";
import { getPengumuman as getPengumumanGuru } from "@/lib/api/guru";

export type NotifItem = {
  id: string;
  judul: string;
  isi: string;
  penulis: string;
  tanggal: string;
  tag: string;
  penting: boolean;
};

const STORAGE_KEY = "notif_read_ids";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveReadIds(ids: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch {}
}

// ✅ FIX: baca role dari localStorage
function getUserRole(): string | null {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).role : null;
  } catch { return null; }
}

export function useNotif() {
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // ✅ FIX: baca readIds sync sebelum fetch, hindari flicker
    setReadIds(getReadIds());

    const userRole = getUserRole();
    setRole(userRole);

    // ✅ FIX: pilih endpoint sesuai role, bukan hardcode siswa
    const fetchFn = userRole === "guru" ? getPengumumanGuru : getPengumumanSiswa;

    fetchFn()
      .then((data) => {
        // handle berbagai shape response yang mungkin
        const list = data?.list ?? data ?? [];
        setNotifs(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifs.filter((n) => !readIds.has(n.id)).length;

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const all = new Set(notifs.map((n) => n.id));
    saveReadIds(all);
    setReadIds(all);
  }, [notifs]);

  // ✅ FIX: tambahkan pengumumanPath yang dibutuhkan NotifBell.tsx
  const pengumumanPath =
    role === "guru"
      ? "/dashboard/guru/pengumuman"
      : role === "admin"
      ? "/dashboard/admin/pengumuman"
      : "/dashboard/siswa/pengumuman";

  return { notifs, unreadCount, readIds, markRead, markAllRead, loading, pengumumanPath };
}