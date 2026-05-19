"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./jadwal-siswa.module.css";
import { getJadwal, getEkskul, getUser } from "@/lib/api/siswa";

// ── Tipe ─────────────────────────────────────────────────────────────────────
type Slot = { mapel: string; guru: string } | "istirahat" | null;
type JadwalData = Record<string, (Slot)[]>;
type EkskulItem = {
  id: string;
  nama: string;
  pembina: string;
  hari: string;
  jam: string;
  tempat: string;
  warna: string;
  warnaText: string;
};

// ── Warna chips mapel ─────────────────────────────────────────────────────────
const BG: Record<string, string> = {
  Matematika: "#dbeafe", "MAT. W": "#dbeafe",
  "B. Indo": "#fce7f3", "Bahasa Indonesia": "#fce7f3",
  "B. Ing": "#d1fae5", "Bahasa Inggris": "#d1fae5",
  Fisika: "#fef9c3", Kimia: "#ede9fe", KIMIA: "#ede9fe",
  Biologi: "#ffedd5", Sejarah: "#f0fdf4", "Sejarah W": "#f0fdf4",
  Ekonomi: "#fdf2f8", PJOK: "#dcfce7", Agama: "#fff7ed",
  PKN: "#e0f2fe", BK: "#f1f5f9", Doa: "#f8fafc",
};
const TC: Record<string, string> = {
  Matematika: "#1e40af", "MAT. W": "#1e40af",
  "B. Indo": "#9d174d", "Bahasa Indonesia": "#9d174d",
  "B. Ing": "#065f46", "Bahasa Inggris": "#065f46",
  Fisika: "#854d0e", Kimia: "#6d28d9", KIMIA: "#6d28d9",
  Biologi: "#9a3412", Sejarah: "#14532d", "Sejarah W": "#14532d",
  Ekonomi: "#701a75", PJOK: "#166534", Agama: "#9a3412",
  PKN: "#0369a1", BK: "#475569", Doa: "#94a3b8",
};

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

// Slot ke-4 dan ke-7 adalah istirahat (setelah jam 4 dan jam 7)
// Sesuaikan dengan jadwal sekolah lo
const ISTIRAHAT_SETELAH = [4, 7]; // jam ke-4 dan ke-7 diikuti istirahat

function getHariIni() {
  return ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][new Date().getDay()];
}

// ── Convert data backend → format array yang dipakai frontend ─────────────────
// Backend: { Senin: { "1": {mapel,guru}, "2": null, ... } }  (object, 11 slot)
// Frontend: array dengan sisipan "istirahat" di posisi yang tepat
function convertJadwal(
  raw: Record<string, Record<string, { mapel: string; guru: string } | null>>,
  durasi: number
): { jadwal: JadwalData; jamNo: string[]; jamWaktu: string[] } {
  const JAM_TOTAL = 11; // backend punya 11 slot
  const jamNo: string[] = [];
  const jamWaktu: string[] = [];
  const jadwal: JadwalData = {};

  // Bangun urutan slot: [ 1, 2, 3, 4, "ist", 5, 6, 7, "ist", 8, 9, 10, 11 ]
  const urutan: (number | "ist")[] = [];
  let jamKe = 1;
  while (jamKe <= JAM_TOTAL) {
    urutan.push(jamKe);
    if (ISTIRAHAT_SETELAH.includes(jamKe)) urutan.push("ist");
    jamKe++;
  }

  // Generate label jam & waktu
  let currentMin = 6 * 60 + 45; // 06:45
  let nomor = 1;
  for (const u of urutan) {
    if (u === "ist") {
      jamNo.push("Istirahat");
      jamWaktu.push("");
      currentMin += 15;
    } else {
      const h = Math.floor(currentMin / 60).toString().padStart(2, "0");
      const m = (currentMin % 60).toString().padStart(2, "0");
      jamNo.push(String(nomor++));
      jamWaktu.push(`${h}.${m}`);
      currentMin += durasi;
    }
  }

  // Convert tiap hari
  for (const hari of HARI) {
    const hariRaw = raw[hari] ?? {};
    const arr: Slot[] = [];
    for (const u of urutan) {
      if (u === "ist") {
        arr.push("istirahat");
      } else {
        const slot = hariRaw[String(u)];
        arr.push(slot ?? null);
      }
    }
    jadwal[hari] = arr;
  }

  return { jadwal, jamNo, jamWaktu };
}

const NAV = [
  {
    label: "Dashboard", href: "/dashboard/siswa", active: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    label: "Jadwal", href: "/dashboard/siswa/jadwal", active: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    label: "Pengumuman", href: "/dashboard/siswa/pengumuman", active: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  },
  {
    label: "Pengaturan", href: "/dashboard/siswa/settings", active: false,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function JadwalSiswa() {
  const hariIni = getHariIni();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"jadwal" | "ekskul">("jadwal");
  const [activeHari, setActiveHari] = useState(HARI.includes(hariIni) ? hariIni : "Senin");
  const [showLogout, setShowLogout] = useState(false);

  const [jadwalData, setJadwalData] = useState<JadwalData | null>(null);
  const [jamWaktu, setJamWaktu] = useState<string[]>([]);
  const [jamNo, setJamNo] = useState<string[]>([]);
  const [ekskulList, setEkskulList] = useState<EkskulItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = getUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jadwalRes, ekskulRes] = await Promise.all([getJadwal(), getEkskul()]);

        // Convert struktur backend (object key angka) → array dengan sisipan istirahat
        const { jadwal, jamNo, jamWaktu } = convertJadwal(
          jadwalRes.jadwal,
          jadwalRes.durasi || 45
        );
        setJadwalData(jadwal);
        setJamNo(jamNo);
        setJamWaktu(jamWaktu);

        // Ekskul sudah return array langsung
        setEkskulList(ekskulRes);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
          <button className={`${styles.navItem} ${styles.navLogout}`} onClick={() => setShowLogout(true)} style={{ marginTop: "auto" }} title={!expanded ? "Keluar" : undefined}>
            <span className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
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
            <h1 className={styles.pageTitle}>Jadwal</h1>
            <span className={styles.kelasTag}>Kelas {user?.kelas || "—"}</span>
          </div>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>{user?.nama || "Siswa"}</span>
              <span className={styles.userSub}>Kelas: {user?.kelas || "—"}</span>
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

          {/* Loading / Error */}
          {loading && (
            <div className={styles.loadingWrap}>
              <span className={styles.loadingSpinner}/>
              <span className={styles.loadingText}>Memuat data...</span>
            </div>
          )}
          {!loading && error && (
            <div className={styles.errorWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
              {error}
            </div>
          )}

          {/* ── JADWAL PELAJARAN ── */}
          {!loading && !error && mode === "jadwal" && jadwalData && (
            <>
              <div className={styles.hariTabs}>
                {HARI.map((hari) => (
                  <button key={hari} className={`${styles.hariTab} ${activeHari === hari ? styles.hariTabActive : ""} ${hariIni === hari ? styles.hariTabToday : ""}`} onClick={() => setActiveHari(hari)}>
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
                    {jamNo.map((label, ri) => {
                      const isIst = label === "Istirahat";
                      return (
                        <tr key={ri} className={isIst ? styles.trIstirahat : styles.trNormal}>
                          <td className={styles.tdJam}>{isIst ? "" : label}</td>
                          <td className={styles.tdWaktu}>{isIst ? "Istirahat" : jamWaktu[ri]}</td>
                          {HARI.map((h) => {
                            if (isIst) return <td key={h} className={styles.tdIstirahat}>Istirahat</td>;
                            const cell = jadwalData[h]?.[ri];
                            if (!cell || cell === "istirahat") return <td key={h} className={styles.tdEmpty}>—</td>;
                            const p = cell as { mapel: string; guru: string };
                            return (
                              <td key={h} className={`${styles.tdMapel} ${h === activeHari ? styles.tdActive : ""}`}>
                                <div className={styles.mapelChip} style={{ background: BG[p.mapel] || "#f1f5f9", color: TC[p.mapel] || "#374151" }}>
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
                  {Object.entries(BG).filter(([m]) => !["Doa", "MAT. W", "Sejarah W", "KIMIA", "Bahasa Indonesia", "Bahasa Inggris"].includes(m)).map(([m, c]) => (
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
          {!loading && !error && mode === "ekskul" && (
            ekskulList.length === 0 ? (
              <div className={styles.emptyWrap}>Belum ada data ekstrakurikuler.</div>
            ) : (
              <div className={styles.ekskulGrid}>
                {HARI.map((hari) => {
                  const list = ekskulList.filter((e) => e.hari === hari);
                  if (!list.length) return null;
                  return (
                    <div key={hari} className={styles.ekskulGroup}>
                      <div className={styles.ekskulHari}>
                        {hari}
                        {hari === hariIni && <span className={styles.todayBadge2}>Hari ini</span>}
                      </div>
                      {list.map((e) => (
                        <div key={e.id} className={styles.ekskulCard} style={{ borderLeft: `4px solid ${e.warnaText}`, background: e.warna }}>
                          <div className={styles.ekskulNama} style={{ color: e.warnaText }}>{e.nama}</div>
                          <div className={styles.ekskulDetail}>
                            <span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {e.jam}
                            </span>
                            <span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                              {e.tempat}
                            </span>
                            <span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              {e.pembina}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )
          )}
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
            <p className={styles.modalDesc}>Kamu akan keluar dari akun {user?.nama || "ini"}.</p>
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