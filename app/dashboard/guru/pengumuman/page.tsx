"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./pengumuman.module.css";
import {
  getPengumuman as fetchPengumuman,
  createPengumuman,
  updatePengumuman,
  deletePengumuman,
} from "@/lib/api/guru";

// ── Tipe ────────────────────────────────────────────────────────────────────
type Pengumuman = {
  id: string;
  judul: string;
  isi: string;
  penulis: string;
  tanggal: string;
  tag: string;
  tagColor: string;
  tagText: string;
  target: "semua" | "siswa" | "guru";
  penting: boolean;
  milik: boolean;
};

// helper: warna per tag
const tagStyle = (tag: string): { color: string; text: string } => {
  const map: Record<string, { color: string; text: string }> = {
    Matematika: { color: "#dbeafe", text: "#1e40af" },
    Umum:       { color: "#dbeafe", text: "#1e40af" },
    Akademik:   { color: "#f0fdf4", text: "#14532d" },
    Ujian:      { color: "#fef9c3", text: "#854d0e" },
    Tugas:      { color: "#ede9fe", text: "#6d28d9" },
  };
  return map[tag] ?? { color: "#f1f5f9", text: "#475569" };
};

// helper: format tanggal relatif
const formatTanggal = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

// helper: map API response → Pengumuman type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapItem = (p: any, currentUserId?: string): Pengumuman => {
  const ts = tagStyle(p.tag || "Umum");
  return {
    id: p.id || p._id,
    judul: p.judul,
    isi: p.isi,
    penulis: p.penulis,
    tanggal: formatTanggal(p.tanggal || p.createdAt),
    tag: p.tag || "Umum",
    tagColor: ts.color,
    tagText: ts.text,
    target: p.target || "semua",
    penting: p.penting ?? false,
    // milik = true jika pengumuman punya rolePenulis "guru" dan penulis cocok dengan user saat ini
    // Karena endpoint GET hanya mengembalikan pengumuman target guru/semua, kita tandai milik
    // berdasarkan penulisId jika tersedia, atau fallback ke nama penulis
    milik: currentUserId
      ? p.penulisId === currentUserId
      : false,
  };
};

const TAG_OPTIONS = [
  { label: "Umum",       color: "#dbeafe", text: "#1e40af" },
  { label: "Matematika", color: "#dbeafe", text: "#1e40af" },
  { label: "Akademik",   color: "#f0fdf4", text: "#14532d" },
  { label: "Ujian",      color: "#fef9c3", text: "#854d0e" },
  { label: "Tugas",      color: "#ede9fe", text: "#6d28d9" },
];

const TARGET_OPTIONS: { value: "semua" | "siswa" | "guru"; label: string }[] = [
  { value: "semua",  label: "Semua (Siswa & Guru)" },
  { value: "siswa",  label: "Siswa saja" },
  { value: "guru",   label: "Guru saja" },
];

const TABS = ["Baru", "Terbaru", "Minggu Ini", "Bulan Ini"];

const NAV = [
  { label: "Dashboard",  href: "/dashboard/guru",            active: false, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label: "Jadwal",     href: "/dashboard/guru/jadwal",     active: false, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: "Pengumuman", href: "/dashboard/guru/pengumuman", active: true,  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label: "Pengaturan", href: "/dashboard/guru/settings",   active: false, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

export default function PengumumanGuru() {
  const router = useRouter();
  const [expanded, setExpanded]     = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [activeTab, setActiveTab]   = useState(1);
  const [data, setData]             = useState<Pengumuman[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState("");
  const [selected, setSelected]     = useState<Pengumuman | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [editItem, setEditItem]     = useState<Pengumuman | null>(null);
  const [showDelete, setShowDelete] = useState<Pengumuman | null>(null);
  const [saving, setSaving]         = useState(false);

  // Form state
  const [fJudul,   setFJudul]   = useState("");
  const [fIsi,     setFIsi]     = useState("");
  const [fTag,     setFTag]     = useState(TAG_OPTIONS[0].label);
  const [fTarget,  setFTarget]  = useState<"semua" | "siswa" | "guru">("semua");
  const [fPenting, setFPenting] = useState(false);
  const [fError,   setFError]   = useState("");

  // ── Ambil pengumuman dari API ───────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      // Ambil userId dari localStorage (disimpan saat login)
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") ?? undefined : undefined;
      const res = await fetchPengumuman(1, 50);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setData((res.list || []).map((p: any) => mapItem(p, userId)));
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat pengumuman.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Buka form buat/edit ─────────────────────────────────────────────────
  const openForm = (item?: Pengumuman) => {
    if (item) {
      setEditItem(item);
      setFJudul(item.judul);
      setFIsi(item.isi);
      setFTag(item.tag);
      setFTarget(item.target);
      setFPenting(item.penting);
    } else {
      setEditItem(null);
      setFJudul(""); setFIsi(""); setFTag(TAG_OPTIONS[0].label); setFTarget("semua"); setFPenting(false);
    }
    setFError("");
    setShowForm(true);
  };

  // ── Simpan (create atau update) ─────────────────────────────────────────
  const handleSave = async () => {
    if (!fJudul.trim() || !fIsi.trim()) { setFError("Judul dan isi wajib diisi."); return; }
    setSaving(true);
    setFError("");
    try {
      if (editItem) {
        await updatePengumuman(editItem.id, { judul: fJudul, isi: fIsi, tag: fTag, target: fTarget, penting: fPenting });
      } else {
        await createPengumuman({ judul: fJudul, isi: fIsi, tag: fTag, target: fTarget, penting: fPenting });
      }
      setShowForm(false);
      await loadData();
    } catch (err: unknown) {
      setFError(err instanceof Error ? err.message : "Gagal menyimpan pengumuman.");
    } finally {
      setSaving(false);
    }
  };

  // ── Hapus ───────────────────────────────────────────────────────────────
  const handleDelete = async (item: Pengumuman) => {
    try {
      await deletePengumuman(item.id);
      setShowDelete(null);
      if (selected?.id === item.id) setSelected(null);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus pengumuman.");
    }
  };

  // ── Label target ────────────────────────────────────────────────────────
  const targetLabel = (t: string) => {
    if (t === "siswa") return "Siswa";
    if (t === "guru") return "Guru";
    return "Semua";
  };

  return (
    <div className={styles.layout}>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${expanded ? styles.sidebarExpanded : ""}`}>
        <button className={styles.hamburger} onClick={() => setExpanded(!expanded)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          {expanded && <span className={styles.brandName}>SMA Budi Mulia</span>}
        </button>
        <nav className={styles.nav}>
          {NAV.map((item, i) => (
            <a key={i} href={item.href} className={`${styles.navItem} ${item.active ? styles.navActive : ""}`} title={!expanded ? item.label : undefined}>
              <span className={styles.navIcon}>{item.icon}</span>
              {expanded && <span className={styles.navLabel}>{item.label}</span>}
            </a>
          ))}
          <button className={`${styles.navItem} ${styles.navLogout}`} onClick={() => setShowLogout(true)} title={!expanded ? "Keluar" : undefined}>
            <span className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {expanded && <span className={styles.navLabel}>Keluar</span>}
          </button>
        </nav>
      </aside>
      {expanded && <div className={styles.overlay} onClick={() => setExpanded(false)} />}

      {/* Main */}
      <div className={`${styles.main} ${expanded ? styles.mainShifted : ""}`}>

        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.tabs}>
            {TABS.map((tab, i) => (
              <button key={i} className={`${styles.tab} ${activeTab === i ? styles.tabActive : ""}`} onClick={() => setActiveTab(i)}>
                {activeTab === i && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {tab}
              </button>
            ))}
          </div>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>Guru</span>
              <span className={styles.userSub}>Pengumuman</span>
            </div>
          </div>
        </header>

        {/* List */}
        <div className={styles.content}>
          {loading && <p style={{ padding: "2rem", color: "#64748b" }}>Memuat pengumuman...</p>}
          {loadError && <p style={{ padding: "2rem", color: "#ef4444" }}>{loadError}</p>}
          {!loading && !loadError && data.length === 0 && (
            <p style={{ padding: "2rem", color: "#64748b" }}>Belum ada pengumuman. Klik tombol + untuk membuat.</p>
          )}
          <div className={styles.list}>
            {data.map((item) => (
              <div key={item.id} className={`${styles.card} ${item.penting ? styles.cardPenting : ""}`} onClick={() => setSelected(item)}>
                <div className={styles.cardMain}>
                  <div className={styles.cardTopRow}>
                    {item.penting && (
                      <span className={styles.pentingBadge}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        Penting
                      </span>
                    )}
                    {/* Badge target */}
                    <span style={{ fontSize: "11px", background: "#f0fdf4", color: "#15803d", borderRadius: "4px", padding: "2px 6px", fontWeight: 500 }}>
                      → {targetLabel(item.target)}
                    </span>
                    {/* Edit & Delete — hanya untuk pengumuman milik guru ini */}
                    {item.milik && (
                      <div className={styles.cardActionsTop}>
                        <button className={styles.editBtn} title="Edit" onClick={(e) => { e.stopPropagation(); openForm(item); }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className={styles.deleteBtn} title="Hapus" onClick={(e) => { e.stopPropagation(); setShowDelete(item); }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardTitle}>{item.judul}</div>
                  <div className={styles.cardIsi}>{item.isi}</div>
                </div>
                <div className={styles.cardMeta}>
                  <div className={styles.cardMetaLeft}>
                    <span className={styles.tagChip} style={{ background: item.tagColor, color: item.tagText }}>{item.tag}</span>
                    <span className={styles.penulis}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {item.penulis}
                      {item.milik && <span className={styles.milikBadge}>Saya</span>}
                    </span>
                  </div>
                  <span className={styles.tanggal}>{item.tanggal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAB */}
        <button className={styles.fab} onClick={() => openForm()} title="Buat Pengumuman">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Modal Detail */}
      {selected && !showForm && !showDelete && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTags}>
                <span className={styles.tagChip} style={{ background: selected.tagColor, color: selected.tagText }}>{selected.tag}</span>
                {selected.penting && <span className={styles.pentingBadge}><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Penting</span>}
                <span style={{ fontSize: "11px", background: "#f0fdf4", color: "#15803d", borderRadius: "4px", padding: "2px 6px", fontWeight: 500 }}>→ {targetLabel(selected.target)}</span>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelected(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <h2 className={styles.modalTitle}>{selected.judul}</h2>
            <div className={styles.modalMeta}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {selected.penulis} · {selected.tanggal}
            </div>
            <p className={styles.modalIsi}>{selected.isi}</p>
          </div>
        </div>
      )}

      {/* Modal Form Buat/Edit */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ marginBottom: 0 }}>
                {editItem ? "Edit Pengumuman" : "Buat Pengumuman"}
              </h2>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Judul</label>
              <input className={styles.formInput} placeholder="Judul pengumuman..." value={fJudul} onChange={(e) => setFJudul(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Isi</label>
              <textarea className={styles.formTextarea} placeholder="Tulis isi pengumuman..." value={fIsi} onChange={(e) => setFIsi(e.target.value)} rows={5} />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.formLabel}>Kategori</label>
                <select className={styles.formSelect} value={fTag} onChange={(e) => setFTag(e.target.value)}>
                  {TAG_OPTIONS.map(t => <option key={t.label}>{t.label}</option>)}
                </select>
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.formLabel}>Ditujukan untuk</label>
                <select
                  className={styles.formSelect}
                  value={fTarget}
                  onChange={(e) => setFTarget(e.target.value as "semua" | "siswa" | "guru")}
                >
                  {TARGET_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Penting?</label>
                <div className={styles.toggleWrap}>
                  <button className={`${styles.toggle} ${fPenting ? styles.toggleOn : ""}`} onClick={() => setFPenting(!fPenting)}>
                    <span className={styles.toggleThumb} />
                  </button>
                  <span className={styles.toggleLabel}>{fPenting ? "Ya" : "Tidak"}</span>
                </div>
              </div>
            </div>
            {fError && <p className={styles.formError}>{fError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)} disabled={saving}>Batal</button>
              <button className={styles.submitBtn} onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    {editItem ? "Simpan Perubahan" : "Kirim Pengumuman"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowDelete(null)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Hapus Pengumuman?</h3>
            <p className={styles.modalDesc}>{showDelete.judul} akan dihapus permanen.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowDelete(null)}>Batal</button>
              <button className={styles.confirmBtn} onClick={() => handleDelete(showDelete)}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Logout */}
      {showLogout && (
        <div className={styles.modalOverlay} onClick={() => setShowLogout(false)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Keluar dari Akun?</h3>
            <p className={styles.modalDesc}>Kamu akan keluar dari akun ini.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowLogout(false)}>Batal</button>
              <button className={styles.confirmBtn} onClick={() => router.push("/")}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
