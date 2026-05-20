"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotif, NotifItem } from "@/lib/api/useNotif";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "Baru saja";
  if (diff < 60) return `${diff} menit lalu`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function NotifBell() {
  const { notifs, unreadCount, readIds, markRead, markAllRead, loading } = useNotif();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleClickNotif(item: NotifItem) {
    markRead(item.id);
    setOpen(false);
    router.push("/dashboard/siswa/pengumuman");
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          background: open ? "#e0e7ff" : "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={open ? "#4f46e5" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#ef4444",
            color: "white",
            fontSize: 9,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid white",
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 320,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          border: "1px solid #e2e8f0",
          zIndex: 1000,
          overflow: "hidden",
        }}>
          {/* Header dropdown */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid #f1f5f9",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>Notifikasi</span>
              {unreadCount > 0 && (
                <span style={{
                  background: "#ef4444",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 99,
                }}>
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontSize: 12,
                  color: "#4f46e5",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                  padding: 0,
                }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                Memuat...
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px" }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>Belum ada pengumuman</p>
              </div>
            ) : (
              notifs.map((item) => {
                const isUnread = !readIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleClickNotif(item)}
                    style={{
                      width: "100%",
                      display: "flex",
                      gap: 10,
                      padding: "12px 16px",
                      background: isUnread ? "#f8faff" : "white",
                      border: "none",
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = isUnread ? "#f8faff" : "white")}
                  >
                    {/* Dot unread */}
                    <div style={{ paddingTop: 4, flexShrink: 0 }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: isUnread ? "#4f46e5" : "transparent",
                        border: isUnread ? "none" : "1.5px solid #e2e8f0",
                        marginTop: 2,
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        {item.penting && (
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            background: "#fef2f2",
                            color: "#ef4444",
                            padding: "1px 5px",
                            borderRadius: 4,
                            flexShrink: 0,
                          }}>
                            PENTING
                          </span>
                        )}
                        <span style={{
                          fontSize: 13,
                          fontWeight: isUnread ? 600 : 400,
                          color: "#0f172a",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {item.judul}
                        </span>
                      </div>
                      <p style={{
                        fontSize: 12,
                        color: "#64748b",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {item.isi}
                      </p>
                      <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, display: "block" }}>
                        {item.penulis} · {timeAgo(item.tanggal)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <button
              onClick={() => { setOpen(false); router.push("/dashboard/siswa/pengumuman"); }}
              style={{
                width: "100%",
                padding: "11px 16px",
                background: "#fafafa",
                border: "none",
                borderTop: "1px solid #f1f5f9",
                color: "#4f46e5",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Lihat semua pengumuman →
            </button>
          )}
        </div>
      )}
    </div>
  );
}