"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard-guru.module.css";
import NotifBell from "@/components/NotifBell";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function authHeader(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type Kelas = {
  _id: string;
  mapel: string;
  nama: string;
  kodeKelas: string;
  namaGuru: string;
  anggota: string[];
  createdAt: string;
  updatedAt: string;
};

const MAPEL_META: Record<string, { warna: string; icon: string }> = {
"Matematika Wajib":                { warna: "#dbeafe", icon: "math"   },
"Bahasa Indonesia":          { warna: "#fce7f3", icon: "book"   },
"Bahasa Inggris":            { warna: "#d1fae5", icon: "book"   },
"Fisika":                    { warna: "#fef9c3", icon: "atom"   },
"Kimia":                     { warna: "#ede9fe", icon: "flask"  },
"Biologi":                   { warna: "#ffedd5", icon: "leaf"   },
"Sejarah":                   { warna: "#f0fdf4", icon: "clock"  },
"Ekonomi":                   { warna: "#fdf2f8", icon: "chart"  },
"PJOK":                      { warna: "#dcfce7", icon: "sport"  },
"Agama":          { warna: "#fff7ed", icon: "book"   },
"PKN":                       { warna: "#e0f2fe", icon: "flag"   },
"Sosiologi":                 { warna: "#fdf4ff", icon: "people" },
"Geografi":                  { warna: "#f0fdf4", icon: "map"    },
"Seni Budaya":               { warna: "#fff1f2", icon: "art"    },
"Informatika":               { warna: "#f0f9ff", icon: "code"   },
"Prakarya & Kewirausahaan":  { warna: "#fffbeb", icon: "tool"   },
"BK":                        { warna: "#f5f3ff", icon: "heart"  },
};

function getMapelMeta(mapel: string) {
  return MAPEL_META[mapel] ?? { warna: "#f1f5f9", icon: "book" };
}

const MAPEL_OPTIONS = Object.keys(MAPEL_META);
const KELAS_OPTIONS = [
  "10 I","10 II","10 III","10 IV",
  "10 V","10 VI","10 VII",
];
const TABS = ["Baru","Terbaru","Minggu Ini","Bulan Ini"];
const NAV = [
  { label:"Dashboard",  href:"/dashboard/guru",            active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"Jadwal",     href:"/dashboard/guru/jadwal",     active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label:"Pengumuman", href:"/dashboard/guru/pengumuman", active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label:"Pengaturan", href:"/dashboard/guru/settings",   active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

function MapelIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "math":  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/><circle cx="12" cy="12" r="9"/></svg>;
    case "book":  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
    case "atom":  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>;
    case "flask": return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6l1 9H8L9 3z"/><path d="M8 12l-4 8h16l-4-8"/></svg>;
    case "leaf":  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.67L2 21l1-2C4.53 15.67 8 9 17 8z"/><path d="M6 21c0-3.5 2-6 6-9"/></svg>;
    case "clock": return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "sport": return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>;
    default:      return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0",
      background: copied ? "#f0fdf4" : "white", color: copied ? "#16a34a" : "#475569",
      fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s",
    }}>
      {copied ? (
        <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Tersalin!</>
      ) : (
        <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Salin</>
      )}
    </button>
  );
}

export default function DashboardGuru() {
  const router = useRouter();
  const [expanded, setExpanded]     = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [activeTab, setActiveTab]   = useState(1);
  const [kelasList, setKelasList]   = useState<Kelas[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [fMapel, setFMapel]         = useState(MAPEL_OPTIONS[0]);
  const [fKelas, setFKelas]         = useState(KELAS_OPTIONS[0]);
  const [fKode, setFKode]           = useState("");
  const [fError, setFError]         = useState("");
  const [saving, setSaving]         = useState(false);
  const [infoKelas, setInfoKelas]   = useState<Kelas | null>(null);
  const [showHapus, setShowHapus]   = useState(false);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    const fetchKelas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND}/api/guru/kelas`, { headers: authHeader() });
        const json = await res.json();
        if (json.success) setKelasList(json.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchKelas();
  }, []);

  const handleTambahKelas = async () => {
    if (!fKode.trim()) { setFError("Kode kelas wajib diisi."); return; }
    setSaving(true); setFError("");
    try {
      const res = await fetch(`${BACKEND}/api/guru/kelas`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ mapel: fMapel, nama: fKelas, kodeKelas: fKode.trim() }),
      });
      const json = await res.json();
      if (!json.success) { setFError(json.message || "Gagal membuat kelas."); return; }
      setKelasList((prev) => [json.data, ...prev]);
      setShowForm(false); setFKode(""); setFMapel(MAPEL_OPTIONS[0]); setFKelas(KELAS_OPTIONS[0]);
    } catch { setFError("Gagal terhubung ke server."); }
    finally { setSaving(false); }
  };

  const handleHapusKelas = async () => {
    if (!infoKelas) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BACKEND}/api/guru/kelas/${infoKelas._id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const json = await res.json();
      if (json.success) {
        setKelasList((prev) => prev.filter((k) => k._id !== infoKelas._id));
        setShowHapus(false);
        setInfoKelas(null);
      }
    } catch { /* silent */ }
    finally { setDeleting(false); }
  };

  return (
    <div className={styles.layout}>
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

      <div className={`${styles.main} ${expanded ? styles.mainShifted : ""}`}>
        <header className={styles.topbar}>
          <div className={styles.tabs}>
            {TABS.map((tab, i) => (
              <button key={i} className={`${styles.tab} ${activeTab === i ? styles.tabActive : ""}`} onClick={() => setActiveTab(i)}>
                {activeTab === i && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {tab}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NotifBell />
            <div className={styles.userChip}>
              <div className={styles.userAvatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className={styles.userText}>
                <span className={styles.userName}>Bpk. Andi Saputra</span>
                <span className={styles.userSub}>Guru Matematika</span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {loading ? (
            <p style={{ color: "#64748b", padding: "2rem", textAlign: "center" }}>Memuat kelas...</p>
          ) : kelasList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
              <p style={{ fontSize: 15, marginBottom: 12 }}>Belum ada kelas. Tambah kelas baru!</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {kelasList.map((kelas) => {
                const meta = getMapelMeta(kelas.mapel);
                return (
                  <a key={kelas._id} href={`/dashboard/guru/materi/${kelas._id}`} className={styles.card}>
                    <div className={styles.cardTop} style={{ background: meta.warna }}>
                      <div className={styles.cardIconWrap}>
                        <MapelIcon icon={meta.icon} />
                      </div>
                      <div className={styles.cardActions}>
                        <button className={styles.cardBtn} title="Upload Materi" onClick={(e) => { e.preventDefault(); router.push(`/dashboard/guru/materi/${kelas._id}`); }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                        </button>
                        <button className={styles.cardBtn} title="Info & Keluar Kelas" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setInfoKelas(kelas); }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className={styles.cardBottom}>
                      <div className={styles.cardInfo}>
                        <span className={styles.cardMapel}>{kelas.mapel}</span>
                        <span className={styles.cardKelas}>Kelas {kelas.nama}</span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardSiswa}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                          {kelas.anggota.length} siswa
                        </span>
                        <span className={styles.cardUpdated}>Kode: {kelas.kodeKelas}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <button className={styles.fab} onClick={() => setShowForm(true)} title="Tambah Kelas">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Modal Tambah Kelas */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tambah Kelas Baru</h3>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Mata Pelajaran</label>
              <select className={styles.formSelect} value={fMapel} onChange={(e) => setFMapel(e.target.value)}>
                {MAPEL_OPTIONS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kelas</label>
              <select className={styles.formSelect} value={fKelas} onChange={(e) => setFKelas(e.target.value)}>
                {KELAS_OPTIONS.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kode Kelas</label>
              <input className={styles.formInput} type="text" placeholder="contoh: MTK10A"
                value={fKode} onChange={(e) => setFKode(e.target.value)} />
            </div>
            {fError && <p className={styles.formError}>{fError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setFError(""); }} disabled={saving}>Batal</button>
              <button className={styles.submitBtn} onClick={handleTambahKelas} disabled={saving}>
                {saving ? "Menyimpan..." : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Tambah Kelas</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Info Kelas */}
      {infoKelas && !showHapus && (
        <div className={styles.modalOverlay} onClick={() => setInfoKelas(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Info Kelas</h3>
              <button className={styles.closeBtn} onClick={() => setInfoKelas(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: getMapelMeta(infoKelas.mapel).warna,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#334155", flexShrink: 0,
              }}>
                <MapelIcon icon={getMapelMeta(infoKelas.mapel).icon} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{infoKelas.mapel}</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Kelas {infoKelas.nama}</div>
              </div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 20 }}>
              {[
                { label: "Guru",           value: infoKelas.namaGuru },
                { label: "Mata Pelajaran", value: infoKelas.mapel },
                { label: "Kelas",          value: infoKelas.nama },
                { label: "Jumlah Siswa",   value: `${infoKelas.anggota.length} siswa` },
                { label: "Dibuat",         value: new Date(infoKelas.createdAt).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" }) },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: i < 4 ? "1px solid #e2e8f0" : "none" }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#0369a1", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Kode Bergabung</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.2em", color: "#0c4a6e", fontFamily: "monospace" }}>{infoKelas.kodeKelas}</span>
                <CopyButton text={infoKelas.kodeKelas} />
              </div>
              <div style={{ fontSize: 11, color: "#0369a1", marginTop: 6 }}>Bagikan kode ini ke siswa untuk bergabung ke kelas.</div>
            </div>
            <button
              onClick={() => setShowHapus(true)}
              style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "1.5px solid #fecaca", background: "#fff5f5", color: "#dc2626", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.borderColor = "#f87171"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.borderColor = "#fecaca"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Hapus / Keluar dari Kelas
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showHapus && infoKelas && (
        <div className={styles.modalOverlay} onClick={() => setShowHapus(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>Hapus Kelas Ini?</h3>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
                Kelas <strong>{infoKelas.mapel} — {infoKelas.nama}</strong> akan dihapus permanen.<br/>
                Semua data siswa dan materi di kelas ini ikut terhapus.
              </p>
            </div>
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: 12, color: "#dc2626", lineHeight: 1.5 }}>
                Tindakan ini tidak bisa dibatalkan. Kode <strong>{infoKelas.kodeKelas}</strong> akan hangus dan siswa tidak bisa menggunakannya lagi.
              </span>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowHapus(false)} disabled={deleting}>Batal, Kembali</button>
              <button onClick={handleHapusKelas} disabled={deleting} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: deleting ? "#f87171" : "#dc2626", color: "white", fontSize: 14, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {deleting ? "Menghapus..." : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>Ya, Hapus Kelas</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Logout */}
      {showLogout && (
        <div className={styles.modalOverlay} onClick={() => setShowLogout(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Keluar dari Akun?</h3>
            <p className={styles.modalDesc}>Kamu akan keluar dari akun Bpk. Andi Saputra.</p>
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