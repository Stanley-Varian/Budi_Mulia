import { useState, useEffect, useCallback } from "react";
import { getPengumuman } from "@/lib/api/siswa";

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
 
export function useNotif() {
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setReadIds(getReadIds());
    getPengumuman()
      .then((data) => setNotifs(data.list ?? []))
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

  return { notifs, unreadCount, readIds, markRead, markAllRead, loading };
}