"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard-admin.module.css";

// ── Mock stats — ganti dengan fetch GET /api/admin/stats ────────────────────
const STATS = [
  { label:"Total Siswa",     value:420, icon:"siswa",  color:"#dbeafe", iconColor:"#2952cc" },
  { label:"Total Guru",      value:32,  icon:"guru",   color:"#d1fae5", iconColor:"#065f46" },
  { label:"Total Kelas",     value:21,  icon:"kelas",  color:"#ede9fe", iconColor:"#6d28d9" },
  { label:"Pengumuman Aktif",value:8,   icon:"notif",  color:"#fef9c3", iconColor:"#854d0e" },
];

// ── Mock recent activity ─────────────────────────────────────────────────────
const AKTIVITAS = [
  { id:1, aksi:"Jadwal kelas 10 A - 10 G berhasil digenerate", waktu:"Hari ini, 09.14", tipe:"jadwal" },
  { id:2, aksi:"Guru baru ditambahkan: Ibu Kartika, S.Pd (Biologi)", waktu:"Hari ini, 08.30", tipe:"user" },
  { id:3, aksi:"Pengumuman 'Libur Akhir Semester' dipublikasikan", waktu:"Kemarin, 14.20", tipe:"pengumuman" },
  { id:4, aksi:"Siswa baru ditambahkan: 32 siswa kelas 10 B", waktu:"Kemarin, 11.00", tipe:"user" },
  { id:5, aksi:"Jadwal kelas 11 A - 11 E berhasil digenerate", waktu:"2 hari lalu, 10.45", tipe:"jadwal" },
];

const NAV = [
  { label:"Dashboard",    href:"/dashboard/admin",              active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"Generate Jadwal", href:"/dashboard/admin/jadwal",    active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label:"Manajemen User", href:"/dashboard/admin/users",      active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label:"Pengumuman",    href:"/dashboard/admin/pengumuman",  active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label:"Pengaturan",    href:"/dashboard/admin/settings",    active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

function StatIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "siswa": return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "guru":  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case "kelas": return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
    case "notif": return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    default: return null;
  }
}

function AktivitasIcon({ tipe }: { tipe: string }) {
  switch (tipe) {
    case "jadwal": return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "user":   return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    default:       return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
  }
}

const AKTIVITAS_COLOR: Record<string, { bg: string; color: string }> = {
  jadwal:     { bg:"#dbeafe", color:"#2952cc" },
  user:       { bg:"#d1fae5", color:"#065f46" },
  pengumuman: { bg:"#fef9c3", color:"#854d0e" },
};

export default function DashboardAdmin() {
  const router = useRouter();
  const [expanded, setExpanded]     = useState(false);
  const [showLogout, setShowLogout] = useState(false);

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
          <h1 className={styles.pageTitle}>Dashboard</h1>
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

          {/* Stats */}
          <div className={styles.statsGrid}>
            {STATS.map((s, i) => (
              <div key={i} className={styles.statCard}>
                <div className={styles.statIconWrap} style={{ background: s.color }}>
                  <span style={{ color: s.iconColor }}><StatIcon icon={s.icon} /></span>
                </div>
                <div className={styles.statInfo}>
                  <div className={styles.statValue}>{s.value.toLocaleString("id-ID")}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className={styles.sectionTitle}>Aksi Cepat</div>
          <div className={styles.quickActions}>
            <a href="/dashboard/admin/jadwal" className={styles.qaCard}>
              <div className={styles.qaIcon} style={{ background:"#dbeafe" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2952cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                </svg>
              </div>
              <div className={styles.qaInfo}>
                <span className={styles.qaLabel}>Generate Jadwal</span>
                <span className={styles.qaDesc}>Buat jadwal otomatis anti-tabrakan</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </a>

            <a href="/dashboard/admin/users" className={styles.qaCard}>
              <div className={styles.qaIcon} style={{ background:"#d1fae5" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className={styles.qaInfo}>
                <span className={styles.qaLabel}>Manajemen User</span>
                <span className={styles.qaDesc}>Kelola data siswa dan guru</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </a>

            <a href="/dashboard/admin/pengumuman" className={styles.qaCard}>
              <div className={styles.qaIcon} style={{ background:"#fef9c3" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#854d0e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <div className={styles.qaInfo}>
                <span className={styles.qaLabel}>Buat Pengumuman</span>
                <span className={styles.qaDesc}>Publikasikan info ke seluruh sekolah</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </div>

          {/* Aktivitas Terbaru */}
          <div className={styles.sectionTitle} style={{ marginTop:28 }}>Aktivitas Terbaru</div>
          <div className={styles.aktivitasList}>
            {AKTIVITAS.map((a) => {
              const c = AKTIVITAS_COLOR[a.tipe] ?? { bg:"#f1f5f9", color:"#475569" };
              return (
                <div key={a.id} className={styles.aktivitasItem}>
                  <div className={styles.aktivitasIcon} style={{ background: c.bg, color: c.color }}>
                    <AktivitasIcon tipe={a.tipe} />
                  </div>
                  <div className={styles.aktivitasInfo}>
                    <span className={styles.aktivitasAksi}>{a.aksi}</span>
                    <span className={styles.aktivitasWaktu}>{a.waktu}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Logout Modal */}
      {showLogout && (
        <div className={styles.modalOverlay} onClick={() => setShowLogout(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
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