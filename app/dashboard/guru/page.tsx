"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard-guru.module.css";
import NotifBell from "@/components/NotifBell";

// ── Tipe ────────────────────────────────────────────────────────────────────
type Kelas = {
  id: number;
  mapel: string;
  kelas: string;
  jumlahSiswa: number;
  updatedAt: string;
  warna: string;
  icon: string;
};

// ── Mock data — ganti dengan fetch GET /api/guru/kelas ───────────────────────
const INIT_KELAS: Kelas[] = [
  { id:1, mapel:"Matematika", kelas:"10 A", jumlahSiswa:32, updatedAt:"Hari ini",    warna:"#dbeafe", icon:"math"  },
  { id:2, mapel:"Matematika", kelas:"10 B", jumlahSiswa:30, updatedAt:"Hari ini",    warna:"#dbeafe", icon:"math"  },
  { id:3, mapel:"Matematika", kelas:"11 A", jumlahSiswa:28, updatedAt:"Kemarin",     warna:"#dbeafe", icon:"math"  },
  { id:4, mapel:"Matematika", kelas:"11 B", jumlahSiswa:31, updatedAt:"Kemarin",     warna:"#dbeafe", icon:"math"  },
  { id:5, mapel:"Matematika", kelas:"12 A", jumlahSiswa:29, updatedAt:"3 hari lalu", warna:"#dbeafe", icon:"math"  },
  { id:6, mapel:"Matematika", kelas:"12 B", jumlahSiswa:27, updatedAt:"3 hari lalu", warna:"#dbeafe", icon:"math"  },
];

const MAPEL_OPTIONS = [
  { label:"Matematika",       warna:"#dbeafe", icon:"math"  },
  { label:"Bahasa Indonesia", warna:"#fce7f3", icon:"book"  },
  { label:"Bahasa Inggris",   warna:"#d1fae5", icon:"book"  },
  { label:"Fisika",           warna:"#fef9c3", icon:"atom"  },
  { label:"Kimia",            warna:"#ede9fe", icon:"flask" },
  { label:"Biologi",          warna:"#ffedd5", icon:"leaf"  },
  { label:"Sejarah",          warna:"#f0fdf4", icon:"clock" },
  { label:"Ekonomi",          warna:"#fdf2f8", icon:"chart" },
  { label:"PJOK",             warna:"#dcfce7", icon:"sport" },
  { label:"Agama",            warna:"#fff7ed", icon:"book"  },
];

const KELAS_OPTIONS = [
  "10 A","10 B","10 C","10 D",
  "11 A","11 B","11 C","11 D",
  "12 A","12 B","12 C","12 D",
];

const TABS = ["Baru","Terbaru","Minggu Ini","Bulan Ini"];

const NAV = [
  { label:"Dashboard",   href:"/dashboard/guru",            active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"Jadwal",      href:"/dashboard/guru/jadwal",     active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label:"Pengumuman",  href:"/dashboard/guru/pengumuman", active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label:"Pengaturan",  href:"/dashboard/guru/settings",   active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
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

export default function DashboardGuru() {
  const router = useRouter();
  const [expanded, setExpanded]     = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [activeTab, setActiveTab]   = useState(1);
  const [kelasList, setKelasList]   = useState<Kelas[]>(INIT_KELAS);

  // Form tambah kelas
  const [showForm, setShowForm]     = useState(false);
  const [fMapel, setFMapel]         = useState(MAPEL_OPTIONS[0].label);
  const [fKelas, setFKelas]         = useState(KELAS_OPTIONS[0]);
  const [fJumlah, setFJumlah]       = useState("");
  const [fError, setFError]         = useState("");

  const handleTambahKelas = () => {
    if (!fJumlah || isNaN(Number(fJumlah)) || Number(fJumlah) <= 0) {
      setFError("Jumlah siswa harus diisi dengan angka yang valid.");
      return;
    }
    // Cek duplikat
    const duplikat = kelasList.find(k => k.mapel === fMapel && k.kelas === fKelas);
    if (duplikat) {
      setFError(`${fMapel} kelas ${fKelas} sudah ada.`);
      return;
    }
    const opt = MAPEL_OPTIONS.find(m => m.label === fMapel)!;
    const newKelas: Kelas = {
      id: Date.now(),
      mapel: fMapel,
      kelas: fKelas,
      jumlahSiswa: Number(fJumlah),
      updatedAt: "Baru saja",
      warna: opt.warna,
      icon: opt.icon,
    };
    setKelasList([...kelasList, newKelas]);
    setFMapel(MAPEL_OPTIONS[0].label);
    setFKelas(KELAS_OPTIONS[0]);
    setFJumlah("");
    setFError("");
    setShowForm(false);
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

        {/* Grid */}
        <div className={styles.content}>
          <div className={styles.grid}>
            {kelasList.map((kelas) => (
              <a key={kelas.id} href={`/dashboard/guru/materi/${kelas.id}`} className={styles.card}>
                <div className={styles.cardTop} style={{ background: kelas.warna }}>
                  <div className={styles.cardIconWrap}>
                    <MapelIcon icon={kelas.icon} />
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.cardBtn} title="Upload Materi" onClick={(e) => { e.preventDefault(); router.push(`/dashboard/guru/materi/${kelas.id}`); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </button>
                    <button className={styles.cardBtn} title="Info" onClick={(e) => e.preventDefault()}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className={styles.cardBottom}>
                  <div className={styles.cardInfo}>
                    <span className={styles.cardMapel}>{kelas.mapel}</span>
                    <span className={styles.cardKelas}>Kelas {kelas.kelas}</span>
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardSiswa}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      {kelas.jumlahSiswa} siswa
                    </span>
                    <span className={styles.cardUpdated}>Updated {kelas.updatedAt}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* FAB Tambah Kelas */}
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
                {MAPEL_OPTIONS.map(m => <option key={m.label}>{m.label}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Kelas</label>
              <select className={styles.formSelect} value={fKelas} onChange={(e) => setFKelas(e.target.value)}>
                {KELAS_OPTIONS.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Jumlah Siswa</label>
              <input
                className={styles.formInput}
                type="number"
                placeholder="contoh: 32"
                value={fJumlah}
                onChange={(e) => setFJumlah(e.target.value)}
                min="1"
              />
            </div>

            {fError && <p className={styles.formError}>{fError}</p>}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setFError(""); }}>Batal</button>
              <button className={styles.submitBtn} onClick={handleTambahKelas}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Tambah Kelas
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