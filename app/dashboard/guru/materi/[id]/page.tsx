"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./materi-guru.module.css";
import NotifBell from "@/components/NotifBell";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function authHeader(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Tipe ─────────────────────────────────────────────────────────────────────
type Materi = {
  id: string;
  judul: string;
  deskripsi: string;
  tipe: "pdf" | "video" | "doc" | "link";
  ukuran?: string;
  tanggal: string;
  pertemuan: number;
  url?: string; // ← TAMBAH: URL Cloudinary
};

type MateriApi = {
  _id: string;
  judul: string;
  deskripsi?: string;
  tipe?: "pdf" | "video" | "doc" | "link";
  ukuran?: string;
  createdAt: string;
  pertemuan: number;
  url?: string; // ← TAMBAH
};

type KelasData = {
  _id: string;
  nama: string;
  mapel: string;
  kodeKelas: string;
};

const TIPE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pdf:   { bg:"#fef2f2", color:"#dc2626", label:"PDF"     },
  video: { bg:"#eff6ff", color:"#2563eb", label:"Video"   },
  doc:   { bg:"#f0fdf4", color:"#16a34a", label:"Dokumen" },
  link:  { bg:"#fdf4ff", color:"#9333ea", label:"Link"    },
};

const NAV = [
  { label:"Dashboard",  href:"/dashboard/guru",            active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"Jadwal",     href:"/dashboard/guru/jadwal",     active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label:"Pengumuman", href:"/dashboard/guru/pengumuman", active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label:"Pengaturan", href:"/dashboard/guru/settings",   active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

function TipeIcon({ tipe }: { tipe: string }) {
  switch (tipe) {
    case "pdf":   return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
    case "video": return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
    case "doc":   return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
    case "link":  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
    default: return null;
  }
}

function formatTanggal(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function MateriGuru({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [expanded, setExpanded]      = useState(false);
  const [showLogout, setShowLogout]  = useState(false);
  const [filterPertemuan, setFilter] = useState<number | "semua">("semua");
  const [showForm, setShowForm]      = useState(false);
  const [showDelete, setShowDelete]  = useState<Materi | null>(null);
  const [editItem, setEditItem]      = useState<Materi | null>(null);
  const [kelasData, setKelasData]    = useState<KelasData | null>(null);
  const [materiList, setMateriList]  = useState<Materi[]>([]);
  const [loading, setLoading]        = useState(true);
  const [loadError, setLoadError]    = useState("");

  // Form state
  const [fJudul, setFJudul]         = useState("");
  const [fDeskripsi, setFDeskripsi] = useState("");
  const [fTipe, setFTipe]           = useState<"pdf"|"video"|"doc"|"link">("pdf");
  const [fPertemuan, setFPertemuan] = useState("1");
  const [fFile, setFFile]           = useState<File | null>(null);
  const [fLink, setFLink]           = useState("");
  const [fError, setFError]         = useState("");
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setLoadError("");
      try {
        const headers = authHeader();
        const kelasRes  = await fetch(`${BACKEND}/api/guru/kelas/${params.id}`, { headers });
        const kelasJson = await kelasRes.json();
        if (!kelasJson.success) { setLoadError("Kelas tidak ditemukan."); setLoading(false); return; }
        setKelasData(kelasJson.data);

        const materiRes  = await fetch(`${BACKEND}/api/guru/materi/${params.id}`, { headers });
        const materiJson = await materiRes.json();
        if (materiJson.success) {
          setMateriList(materiJson.data.map((m: MateriApi) => ({
            id: m._id,
            judul: m.judul,
            deskripsi: m.deskripsi ?? "",
            tipe: m.tipe ?? "doc",
            ukuran: m.ukuran,
            tanggal: formatTanggal(m.createdAt),
            pertemuan: m.pertemuan,
            url: m.url, // ← TAMBAH
          })));
        }
      } catch { setLoadError("Gagal memuat data. Periksa koneksi."); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [params.id]);

  // ── Aksi file ─────────────────────────────────────────────────────────────
  const handleBuka = (item: Materi) => {
    if (!item.url) { alert("File tidak tersedia."); return; }
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (item: Materi) => {
    if (!item.url) { alert("File tidak tersedia."); return; }
    try {
      const res  = await fetch(item.url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      const ext = item.tipe === "pdf" ? ".pdf" : item.tipe === "video" ? ".mp4" : ".docx";
      a.download = `${item.judul}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleShare = async (item: Materi) => {
    if (!item.url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.judul, text: item.deskripsi || `Materi: ${item.judul}`, url: item.url });
        return;
      } catch { /* fallback */ }
    }
    try {
      await navigator.clipboard.writeText(item.url);
      alert("Link materi berhasil disalin!");
    } catch { alert(`Link: ${item.url}`); }
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <p style={{ color:"#64748b" }}>Memuat data...</p>
    </div>
  );

  if (loadError || !kelasData) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <div style={{ textAlign:"center" }}>
        <p style={{ fontSize:16, color:"#64748b" }}>{loadError || "Kelas tidak ditemukan."}</p>
        <button onClick={() => router.push("/dashboard/guru")} style={{ marginTop:16, padding:"10px 20px", background:"#2952cc", color:"white", border:"none", borderRadius:8, cursor:"pointer" }}>
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );

  const pertemuanList = [...new Set(materiList.map(m => m.pertemuan))].sort((a,b) => a-b);
  const filtered = filterPertemuan === "semua" ? materiList : materiList.filter(m => m.pertemuan === filterPertemuan);

  const openForm = (item?: Materi) => {
    if (item) {
      setEditItem(item);
      setFJudul(item.judul); setFDeskripsi(item.deskripsi);
      setFTipe(item.tipe); setFPertemuan(String(item.pertemuan));
      setFLink(item.url && item.tipe === "link" ? item.url : ""); setFFile(null);
    } else {
      setEditItem(null);
      setFJudul(""); setFDeskripsi(""); setFTipe("pdf"); setFPertemuan("1");
      setFLink(""); setFFile(null);
    }
    setFError(""); setShowForm(true);
  };

  const handleSave = async () => {
    if (!fJudul.trim()) { setFError("Judul wajib diisi."); return; }
    if (fTipe === "link" && !fLink.trim()) { setFError("URL link wajib diisi."); return; }
    if (fTipe !== "link" && !editItem && !fFile) { setFError("File wajib dipilih."); return; }
    setSaving(true); setFError("");
    try {
      const formData = new FormData();
      formData.append("judul", fJudul);
      formData.append("deskripsi", fDeskripsi);
      formData.append("tipe", fTipe);
      formData.append("pertemuan", fPertemuan);
      formData.append("url", fTipe === "link" ? fLink : "");
      if (fFile) formData.append("file", fFile);
      const headers = authHeader();

      if (editItem) {
        const res  = await fetch(`${BACKEND}/api/guru/materi/${editItem.id}`, { method:"PUT", headers, body:formData });
        const json = await res.json();
        if (!json.success) { setFError(json.message || "Gagal menyimpan."); setSaving(false); return; }
        setMateriList(prev => prev.map(m =>
          m.id === editItem.id
            ? { ...m, judul:fJudul, deskripsi:fDeskripsi, tipe:fTipe, pertemuan:Number(fPertemuan), url: json.data?.url ?? m.url }
            : m
        ));
      } else {
        formData.append("kelasId", params.id);
        formData.append("mapel", kelasData.mapel);
        formData.append("kelas", kelasData.nama);
        const res  = await fetch(`${BACKEND}/api/guru/materi`, { method:"POST", headers, body:formData });
        const json = await res.json();
        if (!json.success) { setFError(json.message || "Gagal menyimpan."); setSaving(false); return; }
        const m = json.data;
        setMateriList(prev => [{
          id: m._id, judul: m.judul, deskripsi: m.deskripsi ?? "",
          tipe: m.tipe ?? fTipe, ukuran: m.ukuran ?? undefined,
          tanggal: "Baru saja", pertemuan: m.pertemuan,
          url: m.url, // ← TAMBAH
        }, ...prev]);
      }
      setShowForm(false);
    } catch { setFError("Gagal menyimpan. Coba lagi."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (item: Materi) => {
    try {
      const res  = await fetch(`${BACKEND}/api/guru/materi/${item.id}`, { method:"DELETE", headers:authHeader() });
      const json = await res.json();
      if (!json.success) { alert(json.message || "Gagal menghapus."); return; }
      setMateriList(prev => prev.filter(m => m.id !== item.id));
      setShowDelete(null);
    } catch { alert("Gagal menghapus. Periksa koneksi."); }
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
          <div className={styles.topbarLeft}>
            <button className={styles.backBtn} onClick={() => router.push("/dashboard/guru")}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className={styles.mapelInfo}>
              <div className={styles.mapelDot} style={{ background: "#dbeafe" }} />
              <h1 className={styles.pageTitle}>{kelasData.mapel}</h1>
            </div>
            <span className={styles.kelasTag}>Kelas {kelasData.nama}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
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
          <div className={styles.filterRow}>
            <button className={`${styles.filterBtn} ${filterPertemuan === "semua" ? styles.filterBtnActive : ""}`} onClick={() => setFilter("semua")}>Semua</button>
            {pertemuanList.map((p) => (
              <button key={p} className={`${styles.filterBtn} ${filterPertemuan === p ? styles.filterBtnActive : ""}`} onClick={() => setFilter(p)}>
                Pertemuan {p}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <p className={styles.emptyText}>Belum ada materi untuk kelas ini.</p>
              <button className={styles.emptyBtn} onClick={() => openForm()}>Upload Materi Sekarang</button>
            </div>
          )}

          <div className={styles.materiList}>
            {filtered.map((item) => {
              const ts = TIPE_STYLE[item.tipe];
              return (
                <div key={item.id} className={styles.materiCard}>
                  <div className={styles.materiIcon} style={{ background: ts.bg }}>
                    <span style={{ color: ts.color }}><TipeIcon tipe={item.tipe} /></span>
                  </div>
                  <div className={styles.materiBody}>
                    <div className={styles.materiTop}>
                      <span className={styles.tipeChip} style={{ background: ts.bg, color: ts.color }}>{ts.label}</span>
                      <span className={styles.pertemuanChip}>Pertemuan {item.pertemuan}</span>
                    </div>
                    <div className={styles.materiJudul}>{item.judul}</div>
                    <div className={styles.materiDeskripsi}>{item.deskripsi}</div>
                    <div className={styles.materiFoot}>
                      {item.ukuran && <span className={styles.materiUkuran}>{item.ukuran}</span>}
                      <span className={styles.materiTanggal}>{item.tanggal}</span>
                    </div>
                  </div>

                  {/* ── Aksi card ── */}
                  <div className={styles.materiActions}>
                    {/* Buka file */}
                    {item.url && (
                      <button className={styles.openBtn} title="Buka File" onClick={() => handleBuka(item)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/>
                          <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </button>
                    )}
                    {/* Download (bukan link) */}
                    {item.url && item.tipe !== "link" && (
                      <button className={styles.downloadBtn} title="Download" onClick={() => handleDownload(item)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                    )}
                    {/* Share */}
                    {item.url && (
                      <button className={styles.shareBtn} title="Bagikan" onClick={() => handleShare(item)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                      </button>
                    )}
                    {/* Edit */}
                    <button className={styles.editBtn} title="Edit" onClick={() => openForm(item)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    {/* Hapus */}
                    <button className={styles.deleteBtn} title="Hapus" onClick={() => setShowDelete(item)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button className={styles.fab} onClick={() => openForm()} title="Upload Materi">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Modal Upload/Edit */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editItem ? "Edit Materi" : "Upload Materi"}</h3>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ flex:1 }}>
                <label className={styles.formLabel}>Tipe Materi</label>
                <select className={styles.formSelect} value={fTipe} onChange={(e) => setFTipe(e.target.value as "pdf"|"video"|"doc"|"link")}>
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="doc">Dokumen</option>
                  <option value="link">Link</option>
                </select>
              </div>
              <div className={styles.formGroup} style={{ flex:1 }}>
                <label className={styles.formLabel}>Pertemuan ke-</label>
                <input className={styles.formInput} type="number" min="1" value={fPertemuan} onChange={(e) => setFPertemuan(e.target.value)} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Judul</label>
              <input className={styles.formInput} placeholder="Judul materi..." value={fJudul} onChange={(e) => setFJudul(e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Deskripsi</label>
              <textarea className={styles.formTextarea} placeholder="Deskripsi singkat..." value={fDeskripsi} onChange={(e) => setFDeskripsi(e.target.value)} rows={3} />
            </div>
            {fTipe === "link" ? (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>URL Link</label>
                <input className={styles.formInput} placeholder="https://..." value={fLink} onChange={(e) => setFLink(e.target.value)} />
              </div>
            ) : (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{editItem ? "Ganti File (opsional)" : "Upload File"}</label>
                <label className={styles.fileUpload}>
                  <input type="file" style={{ display:"none" }} accept={fTipe === "pdf" ? ".pdf" : fTipe === "video" ? "video/*" : ".doc,.docx"} onChange={(e) => setFFile(e.target.files?.[0] ?? null)} />
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>{fFile ? fFile.name : "Klik untuk pilih file"}</span>
                </label>
              </div>
            )}
            {fError && <p className={styles.formError}>{fError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)} disabled={saving}>Batal</button>
              <button className={styles.submitBtn} onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>{editItem ? "Simpan Perubahan" : "Upload"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {showDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowDelete(null)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Hapus Materi?</h3>
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