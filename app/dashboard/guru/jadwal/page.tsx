"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./jadwal-guru.module.css";

// ── Tipe ────────────────────────────────────────────────────────────────────
type Slot = { kelas: string; ruang: string } | "istirahat" | null;
type JadwalData = Record<string, Slot[]>;

// ── Konstanta ────────────────────────────────────────────────────────────────
const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const JAM_WAKTU = ["06.45","07.30","08.15","09.00","","09.45","10.30","11.15","12.00","","12.45","13.30","14.15"];
const JAM_NO    = ["1","2","3","4","Istirahat","5","6","7","8","Istirahat","9","10","11"];

// ── Mock data — ganti dengan fetch GET /api/guru/jadwal?guruId=xxx ─────────────
function s(kelas: string, ruang: string): Slot { return { kelas, ruang }; }

const JADWAL: JadwalData = {
  Senin:  [null, s("10 A","Ruang 1"), s("10 A","Ruang 1"), s("10 A","Ruang 1"), "istirahat", s("10 B","Ruang 3"), s("10 B","Ruang 3"), null, null, "istirahat", null, null, null],
  Selasa: [null, s("11 A","Ruang 5"), s("11 A","Ruang 5"), null, "istirahat", null, s("11 B","Ruang 6"), s("11 B","Ruang 6"), s("11 B","Ruang 6"), "istirahat", null, null, null],
  Rabu:   [null, null, s("12 A","Ruang 8"), s("12 A","Ruang 8"), "istirahat", s("10 A","Ruang 1"), s("10 A","Ruang 1"), null, null, "istirahat", s("10 B","Ruang 3"), s("10 B","Ruang 3"), null],
  Kamis:  [null, s("12 B","Ruang 9"), s("12 B","Ruang 9"), s("12 B","Ruang 9"), "istirahat", null, null, s("11 A","Ruang 5"), s("11 A","Ruang 5"), "istirahat", null, s("12 A","Ruang 8"), s("12 A","Ruang 8")],
  Jumat:  [null, s("10 B","Ruang 3"), s("10 B","Ruang 3"), null, "istirahat", s("11 B","Ruang 6"), null, null, null, "istirahat", s("12 B","Ruang 9"), s("12 B","Ruang 9"), s("12 B","Ruang 9")],
};

// Warna per kelas
const KELAS_WARNA: Record<string, { bg: string; text: string }> = {
  "10 A": { bg:"#dbeafe", text:"#1e40af" },
  "10 B": { bg:"#d1fae5", text:"#065f46" },
  "11 A": { bg:"#fce7f3", text:"#9d174d" },
  "11 B": { bg:"#fef9c3", text:"#854d0e" },
  "12 A": { bg:"#ede9fe", text:"#6d28d9" },
  "12 B": { bg:"#ffedd5", text:"#9a3412" },
};

const NAV = [
  { label:"Dashboard",  href:"/dashboard/guru",            active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"Jadwal",     href:"/dashboard/guru/jadwal",     active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label:"Pengumuman", href:"/dashboard/guru/pengumuman", active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label:"Pengaturan", href:"/dashboard/guru/settings",   active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

function getHariIni() {
  return ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][new Date().getDay()];
}

// Hitung total jam ngajar per hari
function hitungJamNgajar(hari: string): number {
  return JADWAL[hari]?.filter(s => s && s !== "istirahat").length ?? 0;
}

export default function JadwalGuru() {
  const router = useRouter();
  const hariIni = getHariIni();
  const [expanded, setExpanded]       = useState(false);
  const [showLogout, setShowLogout]   = useState(false);
  const [activeHari, setActiveHari]   = useState(HARI.includes(hariIni) ? hariIni : "Senin");

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
            <h1 className={styles.pageTitle}>Jadwal Mengajar</h1>
            <span className={styles.mapelTag}>Matematika</span>
          </div>
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
        </header>

        <div className={styles.content}>

          {/* Summary card per hari */}
          <div className={styles.summaryRow}>
            {HARI.map((hari) => {
              const jam = hitungJamNgajar(hari);
              const isToday = hari === hariIni;
              const isActive = hari === activeHari;
              return (
                <button
                  key={hari}
                  className={`${styles.summaryCard} ${isActive ? styles.summaryCardActive : ""} ${isToday ? styles.summaryCardToday : ""}`}
                  onClick={() => setActiveHari(hari)}
                >
                  <span className={styles.summaryHari}>
                    {hari}
                    {isToday && <span className={styles.todayDot} />}
                  </span>
                  <span className={styles.summaryJam}>{jam} jam</span>
                </button>
              );
            })}
          </div>

          {/* Tabel jadwal */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thJam}>Jam</th>
                  <th className={styles.thWaktu}>Waktu</th>
                  {HARI.map((h) => (
                    <th key={h} className={`${styles.thHari} ${h === hariIni ? styles.thToday : ""} ${h === activeHari ? styles.thActive : ""}`}>
                      {h}
                      {h === hariIni && <span className={styles.todayBadge}>Hari ini</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JAM_NO.map((label, ri) => {
                  const isIst = label === "Istirahat";
                  return (
                    <tr key={ri} className={isIst ? styles.trIst : styles.trNormal}>
                      <td className={styles.tdJam}>{isIst ? "" : label}</td>
                      <td className={styles.tdWaktu}>{isIst ? "Istirahat" : JAM_WAKTU[ri]}</td>
                      {HARI.map((h) => {
                        if (isIst) return <td key={h} className={styles.tdIst}>Istirahat</td>;
                        const cell = JADWAL[h]?.[ri];
                        const isActive = h === activeHari;
                        if (!cell || cell === "istirahat") {
                          return <td key={h} className={`${styles.tdEmpty} ${isActive ? styles.tdActiveBg : ""}`}>—</td>;
                        }
                        const p = cell as { kelas: string; ruang: string };
                        const w = KELAS_WARNA[p.kelas] ?? { bg:"#f1f5f9", text:"#475569" };
                        return (
                          <td key={h} className={`${styles.tdCell} ${isActive ? styles.tdActiveBg : ""}`}>
                            <div className={styles.chip} style={{ background: w.bg, color: w.text }}>
                              <span className={styles.chipKelas}>{p.kelas}</span>
                              <span className={styles.chipRuang}>{p.ruang}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend kelas */}
          <div className={styles.legend}>
            <span className={styles.legendTitle}>Kelas yang diajar:</span>
            <div className={styles.legendList}>
              {Object.entries(KELAS_WARNA).map(([kelas, w]) => (
                <div key={kelas} className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: w.bg, border: `1.5px solid ${w.text}` }} />
                  <span>Kelas {kelas}</span>
                </div>
              ))}
            </div>
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