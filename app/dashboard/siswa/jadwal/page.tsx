"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./jadwal-siswa.module.css";

// ── Tipe ────────────────────────────────────────────────────────────────────
type Slot = { mapel: string; guru: string } | "istirahat" | null;
type JadwalData = Record<string, Slot[]>;

// ── Warna ───────────────────────────────────────────────────────────────────
const BG: Record<string, string> = {
  "Matematika":"#dbeafe","B. Indo":"#fce7f3","B. Ing":"#d1fae5",
  "Fisika":"#fef9c3","Kimia":"#ede9fe","Biologi":"#ffedd5",
  "Sejarah":"#f0fdf4","Ekonomi":"#fdf2f8","PJOK":"#dcfce7",
  "Agama":"#fff7ed","PKN":"#e0f2fe","BK":"#f1f5f9",
  "MAT. W":"#dbeafe","Sejarah W":"#f0fdf4","KIMIA":"#ede9fe","Doa":"#f8fafc",
};
const TC: Record<string, string> = {
  "Matematika":"#1e40af","B. Indo":"#9d174d","B. Ing":"#065f46",
  "Fisika":"#854d0e","Kimia":"#6d28d9","Biologi":"#9a3412",
  "Sejarah":"#14532d","Ekonomi":"#701a75","PJOK":"#166534",
  "Agama":"#9a3412","PKN":"#0369a1","BK":"#475569",
  "MAT. W":"#1e40af","Sejarah W":"#14532d","KIMIA":"#6d28d9","Doa":"#94a3b8",
};

// ── Mock jadwal pelajaran (Senin–Jumat) ──────────────────────────────────────
// Ganti dengan fetch GET /api/jadwal?kelas=10B
const HARI = ["Senin","Selasa","Rabu","Kamis","Jumat"];
const JAM_WAKTU = ["06.45","07.30","08.15","09.00","","09.45","10.30","11.15","12.00","","12.45","13.30","14.15"];
const JAM_NO    = ["1","2","3","4","Istirahat","5","6","7","8","Istirahat","9","10","11"];

function s(m: string, g: string): Slot { return { mapel: m, guru: g }; }

const JADWAL: JadwalData = {
  Senin:  [s("Doa",""),s("MAT. W","Bpk. Andi"),s("MAT. W","Bpk. Andi"),s("B. Indo","Ibu Sari"),"istirahat",s("B. Indo","Ibu Sari"),s("PJOK","Bpk. Reza"),s("PJOK","Bpk. Reza"),s("PJOK","Bpk. Reza"),"istirahat",s("Sejarah","Ibu Kartini"),s("Sejarah","Ibu Kartini"),s("Sejarah","Ibu Kartini")],
  Selasa: [s("Doa",""),s("PJOK","Bpk. Reza"),s("PJOK","Bpk. Reza"),s("PJOK","Bpk. Reza"),"istirahat",s("Sejarah","Ibu Kartini"),s("Sejarah","Ibu Kartini"),s("Sejarah","Ibu Kartini"),s("BK","Ibu Ratna"),"istirahat",s("Kimia","Ibu Wulan"),s("Kimia","Ibu Wulan"),s("Kimia","Ibu Wulan")],
  Rabu:   [s("Doa",""),s("Sejarah","Ibu Kartini"),s("Sejarah","Ibu Kartini"),s("Sejarah","Ibu Kartini"),"istirahat",s("B. Ing","Ibu Rina"),s("B. Ing","Ibu Rina"),s("B. Ing","Ibu Rina"),s("PKN","Bpk. Hadi"),"istirahat",s("PKN","Bpk. Hadi"),s("MAT. W","Bpk. Andi"),s("MAT. W","Bpk. Andi")],
  Kamis:  [s("Doa",""),s("Agama","Bpk. Fauzi"),s("Agama","Bpk. Fauzi"),s("Agama","Bpk. Fauzi"),"istirahat",s("Kimia","Ibu Wulan"),s("Kimia","Ibu Wulan"),s("Kimia","Ibu Wulan"),s("MAT. W","Bpk. Andi"),"istirahat",s("B. Indo","Ibu Sari"),s("B. Indo","Ibu Sari"),s("PKN","Bpk. Hadi")],
  Jumat:  [s("Doa",""),s("B. Ing","Ibu Rina"),s("B. Ing","Ibu Rina"),s("B. Ing","Ibu Rina"),"istirahat",s("Agama","Bpk. Fauzi"),s("Agama","Bpk. Fauzi"),s("B. Indo","Ibu Sari"),s("B. Indo","Ibu Sari"),"istirahat",s("KIMIA","Ibu Wulan"),s("KIMIA","Ibu Wulan"),s("KIMIA","Ibu Wulan")],
};

// ── Mock ekstrakurikuler ─────────────────────────────────────────────────────
// Ganti dengan fetch GET /api/ekskul?siswaId=xxx
type Ekskul = { nama: string; pembina: string; hari: string; jam: string; tempat: string; warna: string; warnaText: string; };
const EKSKUL: Ekskul[] = [
  { nama: "Paskibra",       pembina: "Bpk. Doni",    hari: "Senin",  jam: "15.00 – 17.00", tempat: "Lapangan Upacara", warna: "#dbeafe", warnaText: "#1e40af" },
  { nama: "Basket",         pembina: "Bpk. Reza",    hari: "Selasa", jam: "15.00 – 17.00", tempat: "Lapangan Basket",  warna: "#dcfce7", warnaText: "#166534" },
  { nama: "PMR",            pembina: "Ibu Ratna",    hari: "Rabu",   jam: "14.30 – 16.30", tempat: "Ruang PMR",        warna: "#fce7f3", warnaText: "#9d174d" },
  { nama: "Rohis",          pembina: "Bpk. Fauzi",   hari: "Kamis",  jam: "14.00 – 15.30", tempat: "Mushola",          warna: "#fff7ed", warnaText: "#9a3412" },
  { nama: "English Club",   pembina: "Ibu Rina",     hari: "Jumat",  jam: "14.30 – 16.00", tempat: "Ruang 12",         warna: "#d1fae5", warnaText: "#065f46" },
  { nama: "KIR",            pembina: "Ibu Wulan",    hari: "Jumat",  jam: "14.30 – 16.30", tempat: "Lab IPA",          warna: "#ede9fe", warnaText: "#6d28d9" },
];

// ── Nav ──────────────────────────────────────────────────────────────────────
const NAV = [
  { label:"Dashboard",  href:"/dashboard/siswa",            active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"Jadwal",     href:"/dashboard/siswa/jadwal",     active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label:"Pengumuman", href:"/dashboard/siswa/pengumuman", active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label:"Pengaturan", href:"/dashboard/siswa/settings",   active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

function getHariIni() {
  return ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][new Date().getDay()];
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function JadwalSiswa() {
  const hariIni = getHariIni();
  const [expanded, setExpanded]   = useState(false);
  const [mode, setMode]           = useState<"jadwal"|"ekskul">("jadwal");
  const [activeHari, setActiveHari] = useState(HARI.includes(hariIni) ? hariIni : "Senin");
  const [showLogout, setShowLogout] = useState(false);
  const router = useRouter();

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
        </nav>
        <button
  className={`${styles.navItem} ${styles.navLogout}`}
  onClick={() => setShowLogout(true)}
  style={{ marginTop: "auto" }}
  title={!expanded ? "Keluar" : undefined}
>
  <span className={styles.navIcon}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  </span>
  {expanded && <span className={styles.navLabel}>Keluar</span>}
</button>
      </aside>
      {expanded && <div className={styles.overlay} onClick={() => setExpanded(false)} />}
      
      

      {/* Main */}
      <div className={`${styles.main} ${expanded ? styles.mainShifted : ""}`}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>Jadwal</h1>
            <span className={styles.kelasTag}>Kelas 10 B</span>
          </div>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>Stanley Varian Rasa</span>
              <span className={styles.userSub}>Kelas: 10 B</span>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {/* Mode switcher */}
          <div className={styles.modeSwitcher}>
            <button className={`${styles.modeBtn} ${mode === "jadwal" ? styles.modeBtnActive : ""}`} onClick={() => setMode("jadwal")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Jadwal Pelajaran
            </button>
            <button className={`${styles.modeBtn} ${mode === "ekskul" ? styles.modeBtnActive : ""}`} onClick={() => setMode("ekskul")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Ekstrakurikuler
            </button>
          </div>

          {/* ── JADWAL PELAJARAN ── */}
          {mode === "jadwal" && (
            <>
              <div className={styles.hariTabs}>
                {HARI.map((hari) => (
                  <button
                    key={hari}
                    className={`${styles.hariTab} ${activeHari === hari ? styles.hariTabActive : ""} ${hariIni === hari ? styles.hariTabToday : ""}`}
                    onClick={() => setActiveHari(hari)}
                  >
                    {hari}
                    {hariIni === hari && <span className={styles.todayDot} />}
                  </button>
                ))}
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.thJam}>Jam</th>
                      <th className={styles.thWaktu}>Waktu</th>
                      {HARI.map((h) => (
                        <th key={h} className={`${styles.thHari} ${h === hariIni ? styles.thHariToday : ""} ${h === activeHari ? styles.thHariActive : ""}`}>
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
                        <tr key={ri} className={isIst ? styles.trIstirahat : styles.trNormal}>
                          <td className={styles.tdJam}>{isIst ? "" : label}</td>
                          <td className={styles.tdWaktu}>{isIst ? "Istirahat" : JAM_WAKTU[ri]}</td>
                          {HARI.map((h) => {
                            if (isIst) return <td key={h} className={styles.tdIstirahat}>Istirahat</td>;
                            const cell = JADWAL[h]?.[ri];
                            if (!cell || cell === "istirahat") return <td key={h} className={styles.tdEmpty}>—</td>;
                            const p = cell as { mapel: string; guru: string };
                            return (
                              <td key={h} className={`${styles.tdMapel} ${h === activeHari ? styles.tdActive : ""}`}>
                                <div className={styles.mapelChip} style={{ background: BG[p.mapel] || "#f8fafc", color: TC[p.mapel] || "#374151" }}>
                                  <span className={styles.mapelNama}>{p.mapel}</span>
                                  {p.guru && p.mapel !== "Doa" && <span className={styles.mapelGuru}>{p.guru}</span>}
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

              <div className={styles.legend}>
                <span className={styles.legendTitle}>Keterangan:</span>
                <div className={styles.legendList}>
                  {[["Matematika","#dbeafe"],["B. Indo","#fce7f3"],["B. Ing","#d1fae5"],["Fisika","#fef9c3"],["Kimia","#ede9fe"],["PJOK","#dcfce7"],["PKN","#e0f2fe"],["Agama","#fff7ed"]].map(([m, c]) => (
                    <div key={m} className={styles.legendItem}>
                      <div className={styles.legendDot} style={{ background: c, border: `1.5px solid ${TC[m] || "#ccc"}` }} />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── EKSTRAKURIKULER ── */}
          {mode === "ekskul" && (
            <div className={styles.ekskulGrid}>
              {HARI.map((hari) => {
                const list = EKSKUL.filter(e => e.hari === hari);
                if (!list.length) return null;
                return (
                  <div key={hari} className={styles.ekskulGroup}>
                    <div className={styles.ekskulHari}>
                      {hari}
                      {hari === hariIni && <span className={styles.todayBadge2}>Hari ini</span>}
                    </div>
                    {list.map((e, i) => (
                      <div key={i} className={styles.ekskulCard} style={{ borderLeft: `4px solid ${e.warnaText}`, background: e.warna }}>
                        <div className={styles.ekskulNama} style={{ color: e.warnaText }}>{e.nama}</div>
                        <div className={styles.ekskulDetail}>
                          <span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {e.jam}
                          </span>
                          <span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            {e.tempat}
                          </span>
                          <span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                            {e.pembina}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
       {showLogout && (
        <div className={styles.modalOverlay} onClick={() => setShowLogout(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Keluar dari Akun?</h3>
            <p className={styles.modalDesc}>Kamu akan keluar dari akun Stanley Varian Rasa.</p>
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