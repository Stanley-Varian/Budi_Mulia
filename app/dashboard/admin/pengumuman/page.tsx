"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./pengumuman-admin.module.css";
import { getPengumuman, createPengumuman, updatePengumuman, deletePengumuman } from "@/lib/api/admin";

// ── Tipe ────────────────────────────────────────────────────────────────────
type Pengumuman = {
  id: number;
  judul: string;
  isi: string;
  penulis: string;
  tanggal: string;
  tag: string;
  tagColor: string;
  tagText: string;
  penting: boolean;
  target: "semua" | "siswa" | "guru";
};

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_DATA: Pengumuman[] = [
  { id:1, judul:"Libur Nasional Hari Buruh", isi:"Diberitahukan kepada seluruh warga sekolah bahwa pada tanggal 1 Mei 2025 sekolah diliburkan dalam rangka peringatan Hari Buruh Nasional. Kegiatan belajar mengajar kembali normal pada tanggal 2 Mei 2025.", penulis:"Administrator", tanggal:"Hari ini", tag:"Umum", tagColor:"#dbeafe", tagText:"#1e40af", penting:true, target:"semua" },
  { id:2, judul:"Jadwal Remedial Ujian Tengah Semester", isi:"Siswa yang belum mencapai KKM pada Ujian Tengah Semester wajib mengikuti remedial yang dijadwalkan pada tanggal 12–14 Mei 2025.", penulis:"Administrator", tanggal:"Kemarin", tag:"Akademik", tagColor:"#f0fdf4", tagText:"#14532d", penting:true, target:"siswa" },
  { id:3, judul:"Rapat Koordinasi Guru", isi:"Seluruh guru wajib hadir dalam rapat koordinasi yang akan dilaksanakan pada Sabtu, 10 Mei 2025 pukul 08.00 WIB di Ruang Rapat.", penulis:"Administrator", tanggal:"2 hari lalu", tag:"Internal", tagColor:"#ede9fe", tagText:"#6d28d9", penting:false, target:"guru" },
  { id:4, judul:"Pengumpulan Laporan Nilai Semester", isi:"Seluruh guru wajib mengumpulkan laporan nilai semester paling lambat tanggal 20 Mei 2025 kepada Wakil Kurikulum.", penulis:"Administrator", tanggal:"3 hari lalu", tag:"Internal", tagColor:"#ede9fe", tagText:"#6d28d9", penting:false, target:"guru" },
  { id:5, judul:"Jadwal Penerimaan Rapor", isi:"Penerimaan rapor semester genap akan dilaksanakan pada tanggal 30 Mei 2025. Orang tua/wali siswa wajib hadir.", penulis:"Administrator", tanggal:"1 minggu lalu", tag:"Akademik", tagColor:"#f0fdf4", tagText:"#14532d", penting:true, target:"semua" },
];

const TAG_OPTIONS = [
  { label:"Umum",     color:"#dbeafe", text:"#1e40af" },
  { label:"Akademik", color:"#f0fdf4", text:"#14532d" },
  { label:"Internal", color:"#ede9fe", text:"#6d28d9" },
  { label:"Kegiatan", color:"#fef9c3", text:"#854d0e" },
  { label:"Darurat",  color:"#fef2f2", text:"#dc2626" },
];

const TARGET_OPTIONS = [
  { value:"semua",  label:"Semua (Siswa & Guru)" },
  { value:"siswa",  label:"Siswa saja" },
  { value:"guru",   label:"Guru saja" },
];

const TARGET_STYLE: Record<string, { bg: string; color: string }> = {
  semua: { bg:"#f0fdf4", color:"#16a34a" },
  siswa: { bg:"#dbeafe", color:"#1e40af" },
  guru:  { bg:"#fef9c3", color:"#854d0e" },
};

const TABS = ["Baru", "Terbaru", "Minggu Ini", "Bulan Ini"];

const NAV = [
  { label:"Dashboard",      href:"/dashboard/admin",            active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"Generate Jadwal",href:"/dashboard/admin/jadwal",     active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label:"Manajemen User", href:"/dashboard/admin/users",      active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label:"Pengumuman",     href:"/dashboard/admin/pengumuman", active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label:"Pengaturan",     href:"/dashboard/admin/settings",   active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

export default function PengumumanAdmin() {
  const router = useRouter();
  const [expanded, setExpanded]     = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [activeTab, setActiveTab]   = useState(1);
  const [filterTarget, setFilterTarget] = useState<"semua"|"siswa"|"guru"|"all">("all");
  const [data, setData]             = useState<Pengumuman[]>([]);
  const [selected, setSelected]     = useState<Pengumuman | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [editItem, setEditItem]     = useState<Pengumuman | null>(null);
  const [showDelete, setShowDelete] = useState<Pengumuman | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form state
  const [fJudul, setFJudul]         = useState("");
  const [fIsi, setFIsi]             = useState("");
  const [fTag, setFTag]             = useState(TAG_OPTIONS[0].label);
  const [fTarget, setFTarget]       = useState<"semua"|"siswa"|"guru">("semua");
  const [fPenting, setFPenting]     = useState(false);
  const [fError, setFError]         = useState("");

  const fetchData = async () => {
    try {
      const res = await getPengumuman({ limit: 50 });
      const mapped = res.data.map((d: any) => {
        const tagOpt = TAG_OPTIONS.find(t => t.label === d.tag) ?? TAG_OPTIONS[0];
        return { ...d, id: d._id, tanggal: new Date(d.createdAt).toLocaleDateString("id-ID"), tagColor: tagOpt.color, tagText: tagOpt.text };
      });
      setData(mapped);
    } catch (err) { console.error("Gagal fetch pengumuman:", err); }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = filterTarget === "all" ? data : data.filter(d => d.target === filterTarget || d.target === "semua");

  const openForm = (item?: Pengumuman) => {
    if (item) {
      setEditItem(item);
      setFJudul(item.judul); setFIsi(item.isi);
      setFTag(item.tag); setFTarget(item.target); setFPenting(item.penting);
    } else {
      setEditItem(null);
      setFJudul(""); setFIsi(""); setFTag(TAG_OPTIONS[0].label);
      setFTarget("semua"); setFPenting(false);
    }
    setFError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!fJudul.trim() || !fIsi.trim()) { setFError("Judul dan isi wajib diisi."); return; }
    setSaveLoading(true);
    try {
      if (editItem) {
        await updatePengumuman(String(editItem.id), { judul: fJudul, isi: fIsi, tag: fTag, target: fTarget, penting: fPenting });
      } else {
        await createPengumuman({ judul: fJudul, isi: fIsi, tag: fTag, target: fTarget, penting: fPenting });
      }
      await fetchData();
      setShowForm(false);
    } catch (err: any) {
      setFError(err.message || "Gagal menyimpan.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (item: Pengumuman) => {
    try {
      await deletePengumuman(String(item.id));
      await fetchData();
      if (selected?.id === item.id) setSelected(null);
    } catch (err) { console.error("Gagal hapus:", err); }
    setShowDelete(null);
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
              <span className={styles.userName}>Administrator</span>
              <span className={styles.userSub}>Super Admin</span>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {/* Filter target */}
          <div className={styles.filterRow}>
            {[
              { val:"all",   label:"Semua" },
              { val:"semua", label:"Semua Warga" },
              { val:"siswa", label:"Siswa" },
              { val:"guru",  label:"Guru" },
            ].map((f) => (
              <button key={f.val} className={`${styles.filterBtn} ${filterTarget === f.val ? styles.filterBtnActive : ""}`} onClick={() => setFilterTarget(f.val as "all" | "semua" | "siswa" | "guru")}>
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className={styles.list}>
            {filtered.map((item) => (
              <div key={item.id} className={`${styles.card} ${item.penting ? styles.cardPenting : ""}`} onClick={() => setSelected(item)}>
                <div className={styles.cardMain}>
                  <div className={styles.cardTopRow}>
                    <div className={styles.cardBadges}>
                      {item.penting && (
                        <span className={styles.pentingBadge}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          Penting
                        </span>
                      )}
                      <span className={styles.targetBadge} style={{ background: TARGET_STYLE[item.target].bg, color: TARGET_STYLE[item.target].color }}>
                        → {item.target === "semua" ? "Semua" : item.target === "siswa" ? "Siswa" : "Guru"}
                      </span>
                    </div>
                    <div className={styles.cardActionsTop}>
                      <button className={styles.editBtn} title="Edit" onClick={(e) => { e.stopPropagation(); openForm(item); }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className={styles.deleteBtn} title="Hapus" onClick={(e) => { e.stopPropagation(); setShowDelete(item); }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                      </button>
                    </div>
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
                <span className={styles.targetBadge} style={{ background: TARGET_STYLE[selected.target].bg, color: TARGET_STYLE[selected.target].color }}>
                  → {selected.target === "semua" ? "Semua" : selected.target === "siswa" ? "Siswa" : "Guru"}
                </span>
                {selected.penting && <span className={styles.pentingBadge}><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Penting</span>}
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

      {/* Modal Form */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ marginBottom:0 }}>{editItem ? "Edit Pengumuman" : "Buat Pengumuman"}</h2>
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
              <div className={styles.formGroup} style={{ flex:1 }}>
                <label className={styles.formLabel}>Kategori</label>
                <select className={styles.formSelect} value={fTag} onChange={(e) => setFTag(e.target.value)}>
                  {TAG_OPTIONS.map(t => <option key={t.label}>{t.label}</option>)}
                </select>
              </div>
              <div className={styles.formGroup} style={{ flex:1 }}>
                <label className={styles.formLabel}>Ditujukan Ke</label>
                <select className={styles.formSelect} value={fTarget} onChange={(e) => setFTarget(e.target.value as "semua" | "siswa" | "guru")}>
                  {TARGET_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tandai Penting?</label>
              <div className={styles.toggleWrap}>
                <button className={`${styles.toggle} ${fPenting ? styles.toggleOn : ""}`} onClick={() => setFPenting(!fPenting)}>
                  <span className={styles.toggleThumb} />
                </button>
                <span className={styles.toggleLabel}>{fPenting ? "Ya, tandai sebagai penting" : "Tidak"}</span>
              </div>
            </div>
            {fError && <p className={styles.formError}>{fError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Batal</button>
              <button className={styles.submitBtn} onClick={handleSave}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                {editItem ? "Simpan" : "Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {showDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowDelete(null)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></div>
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
            <div className={styles.modalIcon}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
            <h3 className={styles.modalTitle}>Keluar dari Akun?</h3>
            <p className={styles.modalDesc}>Kamu akan keluar dari akun Administrator.</p>
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