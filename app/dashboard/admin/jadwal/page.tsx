"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./generate-jadwal.module.css";
import { saveJadwal } from "@/lib/api/admin";

// ── Tipe ────────────────────────────────────────────────────────────────────
type Hari = "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat";

type KelasConfig = {
  id: string;
  nama: string;
  aktif: boolean;
};

type MapelConfig = {
  id: string;
  namaMapel: string;
  namaGuru: string;
  pertemuanPerMinggu: number;
  jamPerPertemuan: number;
};

type HariConfig = {
  hari: Hari;
  maxJamSiswa: number; // max jam belajar siswa per hari
  maxJamGuru: number;  // max jam ngajar guru per hari
};

type SlotJadwal = {
  mapel: string;
  guru: string;
} | null;

type HasilJadwal = {
  [hari: string]: { [jam: number]: { [kelas: string]: SlotJadwal } };
};

// ── Konstanta ────────────────────────────────────────────────────────────────
const HARI_LIST: Hari[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const JAM_SLOTS = [1, 2, 3, 4, "IST", 5, 6, 7, 8, "IST", 9, 10, 11] as const;
const JAM_WAKTU = [
  "06.45", "07.30", "08.15", "09.00", "",
  "09.45", "10.30", "11.15", "12.00", "",
  "12.45", "13.30", "14.15",
];

const JAM_REAL = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function isKonsekutif(startJam: number, panjang: number): boolean {
  const end = startJam + panjang - 1;
  if (startJam <= 4 && end > 4) return false;
  if (startJam <= 8 && end > 8) return false;
  if (end > 11) return false;
  return true;
}

// ── Algoritma generate jadwal ────────────────────────────────────────────────
function generateJadwal(
  kelasList: KelasConfig[],
  mapelList: MapelConfig[],
  hariConfig: HariConfig[],
): { hasil: HasilJadwal; konflik: string[] } {
  const aktifKelas = kelasList.filter((k) => k.aktif).map((k) => k.nama);
  const konflik: string[] = [];

  const jadwal: HasilJadwal = {};
  HARI_LIST.forEach((h) => {
    jadwal[h] = {};
    JAM_REAL.forEach((j) => {
      jadwal[h][j] = {};
      aktifKelas.forEach((k) => { jadwal[h][j][k] = null; });
    });
  });

  // guruBusy[hari][jam] = Set<namaGuru>
  const guruBusy: Record<string, Record<number, Set<string>>> = {};
  // guruJamPerHari[hari][guru] = total jam sudah dialokasikan
  const guruJamPerHari: Record<string, Record<string, number>> = {};

  HARI_LIST.forEach((h) => {
    guruBusy[h] = {};
    guruJamPerHari[h] = {};
    JAM_REAL.forEach((j) => { guruBusy[h][j] = new Set(); });
  });

  type Tugas = {
    mapel: string;
    guru: string;
    kelas: string;
    panjang: number;
  };

  const tugasList: Tugas[] = [];
  mapelList.forEach((m) => {
    aktifKelas.forEach((kelas) => {
      for (let p = 0; p < m.pertemuanPerMinggu; p++) {
        tugasList.push({
          mapel: m.namaMapel,
          guru: m.namaGuru,
          kelas,
          panjang: m.jamPerPertemuan,
        });
      }
    });
  });

  // Shuffle
  for (let i = tugasList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tugasList[i], tugasList[j]] = [tugasList[j], tugasList[i]];
  }

  const maxJamSiswaMap: Record<string, number> = {};
  const maxJamGuruMap: Record<string, number> = {};
  hariConfig.forEach((h) => {
    maxJamSiswaMap[h.hari] = h.maxJamSiswa;
    maxJamGuruMap[h.hari] = h.maxJamGuru;
  });

  tugasList.forEach((tugas) => {
    let assigned = false;

    for (const hari of HARI_LIST) {
      if (assigned) break;
      const maxJamSiswa = maxJamSiswaMap[hari] ?? 11;
      const maxJamGuru = maxJamGuruMap[hari] ?? 8;

      // Cek apakah guru masih bisa ngajar di hari ini (limit harian)
      const jamGuruHariIni = guruJamPerHari[hari][tugas.guru] ?? 0;
      if (jamGuruHariIni + tugas.panjang > maxJamGuru) continue;

      for (let startJam = 1; startJam <= maxJamSiswa && !assigned; startJam++) {
        if (!isKonsekutif(startJam, tugas.panjang)) continue;
        if (startJam + tugas.panjang - 1 > maxJamSiswa) continue;

        let bisaAssign = true;
        for (let j = startJam; j < startJam + tugas.panjang; j++) {
          if (guruBusy[hari][j]?.has(tugas.guru)) { bisaAssign = false; break; }
          if (jadwal[hari][j]?.[tugas.kelas] !== null) { bisaAssign = false; break; }
        }

        if (bisaAssign) {
          for (let j = startJam; j < startJam + tugas.panjang; j++) {
            jadwal[hari][j][tugas.kelas] = { mapel: tugas.mapel, guru: tugas.guru };
            guruBusy[hari][j].add(tugas.guru);
          }
          guruJamPerHari[hari][tugas.guru] = jamGuruHariIni + tugas.panjang;
          assigned = true;
        }
      }
    }

    if (!assigned) {
      konflik.push(
        `${tugas.mapel} (${tugas.guru}) untuk kelas ${tugas.kelas}: tidak bisa dialokasikan`,
      );
    }
  });

  return { hasil: jadwal, konflik };
}

// ── Warna mapel ──────────────────────────────────────────────────────────────
const WARNA_MAPEL: Record<string, { bg: string; text: string }> = {
  Matematika: { bg: "#dbeafe", text: "#1e40af" },
  "Bahasa Indonesia": { bg: "#fce7f3", text: "#9d174d" },
  "Bahasa Inggris": { bg: "#d1fae5", text: "#065f46" },
  Fisika: { bg: "#fef9c3", text: "#854d0e" },
  Kimia: { bg: "#ede9fe", text: "#6d28d9" },
  Biologi: { bg: "#ffedd5", text: "#9a3412" },
  Sejarah: { bg: "#f0fdf4", text: "#14532d" },
  Ekonomi: { bg: "#fdf2f8", text: "#701a75" },
  PJOK: { bg: "#dcfce7", text: "#166534" },
  Agama: { bg: "#fff7ed", text: "#9a3412" },
  PKN: { bg: "#e0f2fe", text: "#0369a1" },
  BK: { bg: "#f1f5f9", text: "#475569" },
};

function getWarna(mapel: string) {
  return WARNA_MAPEL[mapel] ?? { bg: "#f8fafc", text: "#374151" };
}

const NAV = [
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    active: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Generate Jadwal",
    href: "/dashboard/admin/jadwal",
    active: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Manajemen User",
    href: "/dashboard/admin/users",
    active: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Pengumuman",
    href: "/dashboard/admin/pengumuman",
    active: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    label: "Pengaturan",
    href: "/dashboard/admin/settings",
    active: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function GenerateJadwal() {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState<HasilJadwal | null>(null);
  const [konflikList, setKonflikList] = useState<string[]>([]);
  const [activeHari, setActiveHari] = useState<Hari>("Senin");
  const [activeKelas, setActiveKelas] = useState("");
  const [durasi, setDurasi] = useState(45);
  const [saveModal, setSaveModal] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [kelasList, setKelasList] = useState<KelasConfig[]>([]);
  const [hariConfig, setHariConfig] = useState<HariConfig[]>([
    { hari: "Senin",  maxJamSiswa: 11, maxJamGuru: 6 },
    { hari: "Selasa", maxJamSiswa: 11, maxJamGuru: 6 },
    { hari: "Rabu",   maxJamSiswa: 11, maxJamGuru: 6 },
    { hari: "Kamis",  maxJamSiswa: 11, maxJamGuru: 6 },
    { hari: "Jumat",  maxJamSiswa: 8,  maxJamGuru: 4 },
  ]);
  const [newKelas, setNewKelas] = useState("");

  // Step 2
  const [mapelList, setMapelList] = useState<MapelConfig[]>([]);
  const [newMapel, setNewMapel] = useState("");
  const [newGuru, setNewGuru] = useState("");
  const [newPertemuan, setNewPertemuan] = useState("2");
  const [newJamPertemuan, setNewJamPertemuan] = useState("2");

  const aktifKelas = kelasList.filter((k) => k.aktif);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const { hasil: h, konflik: k } = generateJadwal(kelasList, mapelList, hariConfig);
      setHasil(h);
      setKonflikList(k);
      if (aktifKelas.length > 0) setActiveKelas(aktifKelas[0].nama);
      setStep(3);
      setLoading(false);
    }, 1500);
  };

  const totalMenitPerKelas = (m: MapelConfig) =>
    m.pertemuanPerMinggu * m.jamPerPertemuan * durasi;

  // Helper update hariConfig
  const updateHari = (hari: Hari, field: "maxJamSiswa" | "maxJamGuru", delta: number) => {
    setHariConfig(hariConfig.map((hc) => {
      if (hc.hari !== hari) return hc;
      const max = field === "maxJamSiswa" ? 11 : 11;
      const min = 1;
      return { ...hc, [field]: Math.min(max, Math.max(min, hc[field] + delta)) };
    }));
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${expanded ? styles.sidebarExpanded : ""}`}>
        <button className={styles.hamburger} onClick={() => setExpanded(!expanded)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            {expanded && <span className={styles.navLabel}>Keluar</span>}
          </button>
        </nav>
      </aside>
      {expanded && <div className={styles.overlay} onClick={() => setExpanded(false)} />}

      {/* Main */}
      <div className={`${styles.main} ${expanded ? styles.mainShifted : ""}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>Generate Jadwal</h1>
          </div>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>Administrator</span>
              <span className={styles.userSub}>Super Admin</span>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {/* Stepper */}
          <div className={styles.stepper}>
            {[
              { n: 1, label: "Konfigurasi Kelas" },
              { n: 2, label: "Mata Pelajaran" },
              { n: 3, label: "Hasil Jadwal" },
            ].map((s, i) => (
              <div key={s.n} className={styles.stepperItem}>
                <div className={`${styles.stepCircle} ${step === s.n ? styles.stepActive : ""} ${step > s.n ? styles.stepDone : ""}`}>
                  {step > s.n ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : s.n}
                </div>
                <span className={`${styles.stepLabel} ${step === s.n ? styles.stepLabelActive : ""}`}>{s.label}</span>
                {i < 2 && <div className={`${styles.stepLine} ${step > s.n ? styles.stepLineDone : ""}`} />}
              </div>
            ))}
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.stepGrid}>
                {/* Durasi */}
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Durasi 1 Jam Pelajaran</div>
                  <div className={styles.cardDesc}>Durasi satu jam pelajaran dalam menit.</div>
                  <div className={styles.durasiWrap}>
                    <input className={styles.durasiInput} type="number" min="30" max="60" value={durasi} onChange={(e) => setDurasi(Number(e.target.value))} />
                    <span className={styles.durasiUnit}>menit</span>
                  </div>
                </div>

                {/* Max jam per hari — DIPISAH SISWA & GURU */}
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Batas Jam Per Hari</div>
                  <div className={styles.cardDesc}>
                    Atur batas jam belajar <strong>siswa</strong> dan batas jam ngajar <strong>guru</strong> per hari secara terpisah.
                    Ini mencegah guru terlalu banyak mengajar dalam satu hari.
                  </div>
                  <div className={styles.hariConfigList}>
                    {/* Header */}
                    <div className={styles.hariConfigRow} style={{ fontWeight: 600, fontSize: "0.75rem", color: "#64748b" }}>
                      <span className={styles.hariConfigNama}>Hari</span>
                      <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                        <span style={{ flex: 1, textAlign: "center" }}>📚 Siswa (jam belajar)</span>
                        <span style={{ flex: 1, textAlign: "center" }}>👨‍🏫 Guru (jam ngajar)</span>
                      </div>
                    </div>

                    {hariConfig.map((h) => (
                      <div key={h.hari} className={styles.hariConfigRow}>
                        <span className={styles.hariConfigNama}>{h.hari}</span>
                        <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                          {/* Siswa */}
                          <div className={styles.hariConfigControl} style={{ flex: 1 }}>
                            <button className={styles.counterBtn} onClick={() => updateHari(h.hari, "maxJamSiswa", -1)}>−</button>
                            <span className={styles.counterVal}>{h.maxJamSiswa} jam</span>
                            <button className={styles.counterBtn} onClick={() => updateHari(h.hari, "maxJamSiswa", 1)}>+</button>
                          </div>
                          {/* Guru */}
                          <div className={styles.hariConfigControl} style={{ flex: 1 }}>
                            <button className={styles.counterBtn} onClick={() => updateHari(h.hari, "maxJamGuru", -1)}>−</button>
                            <span className={styles.counterVal} style={{ color: "#7c3aed" }}>{h.maxJamGuru} jam</span>
                            <button className={styles.counterBtn} onClick={() => updateHari(h.hari, "maxJamGuru", 1)}>+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daftar kelas */}
                <div className={`${styles.card} ${styles.cardFull}`}>
                  <div className={styles.cardTitle}>Daftar Kelas Aktif</div>
                  <div className={styles.cardDesc}>Klik kelas untuk aktifkan/nonaktifkan. Kelas aktif yang akan dibuatkan jadwal.</div>
                  <div className={styles.kelasList}>
                    {kelasList.map((k) => (
                      <button
                        key={k.id}
                        className={`${styles.kelasChip} ${k.aktif ? styles.kelasChipAktif : ""}`}
                        onClick={() => setKelasList(kelasList.map((kl) => kl.id === k.id ? { ...kl, aktif: !kl.aktif } : kl))}
                      >
                        {k.aktif && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {k.nama}
                      </button>
                    ))}
                  </div>
                  <div className={styles.addKelasRow}>
                    <input
                      className={styles.addInput}
                      placeholder="Tambah kelas, misal: 10 G"
                      value={newKelas}
                      onChange={(e) => setNewKelas(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newKelas.trim()) {
                          setKelasList([...kelasList, { id: `k${Date.now()}`, nama: newKelas.trim(), aktif: true }]);
                          setNewKelas("");
                        }
                      }}
                    />
                    <button className={styles.addBtn} onClick={() => {
                      if (newKelas.trim()) {
                        setKelasList([...kelasList, { id: `k${Date.now()}`, nama: newKelas.trim(), aktif: true }]);
                        setNewKelas("");
                      }
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Tambah
                    </button>
                  </div>
                  <div className={styles.kelasInfo}>{aktifKelas.length} kelas aktif dari {kelasList.length} total</div>
                </div>
              </div>

              <div className={styles.stepActions}>
                <button className={styles.nextBtn} onClick={() => setStep(2)} disabled={aktifKelas.length === 0}>
                  Lanjut ke Mata Pelajaran
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>Daftar Mata Pelajaran & Guru</div>
                <div className={styles.cardDesc}>
                  <strong>Pertemuan/minggu</strong> = berapa kali tatap muka per minggu per kelas. &nbsp;
                  <strong>Jam/pertemuan</strong> = berapa jam pelajaran berturut-turut tiap pertemuan ({durasi} menit/jam).
                  Nama guru otomatis tersimpan dalam <strong>huruf kapital semua</strong>.
                </div>

                <div className={styles.mapelTableWrap}>
                  <table className={styles.mapelTable}>
                    <thead>
                      <tr>
                        <th className={styles.mth}>Mata Pelajaran</th>
                        <th className={styles.mth}>Guru</th>
                        <th className={styles.mth}>Pertemuan/minggu</th>
                        <th className={styles.mth}>Jam/pertemuan</th>
                        <th className={styles.mth}>Total/kelas</th>
                        <th className={styles.mthAct}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mapelList.map((m) => (
                        <tr key={m.id} className={styles.mtr}>
                          <td className={styles.mtd}>
                            <div className={styles.mapelDotRow}>
                              <div className={styles.mapelDot} style={{ background: getWarna(m.namaMapel).bg, border: `2px solid ${getWarna(m.namaMapel).text}` }} />
                              {m.namaMapel}
                            </div>
                          </td>
                          {/* Nama guru → uppercase di display */}
                          <td className={styles.mtd} style={{ fontWeight: 600, letterSpacing: "0.03em" }}>{m.namaGuru}</td>
                          <td className={styles.mtd}>
                            <div className={styles.jamControl}>
                              <button className={styles.counterBtn} onClick={() => setMapelList(mapelList.map((ml) => ml.id === m.id ? { ...ml, pertemuanPerMinggu: Math.max(1, ml.pertemuanPerMinggu - 1) } : ml))}>−</button>
                              <span className={styles.counterVal}>{m.pertemuanPerMinggu}x</span>
                              <button className={styles.counterBtn} onClick={() => setMapelList(mapelList.map((ml) => ml.id === m.id ? { ...ml, pertemuanPerMinggu: ml.pertemuanPerMinggu + 1 } : ml))}>+</button>
                            </div>
                          </td>
                          <td className={styles.mtd}>
                            <div className={styles.jamControl}>
                              <button className={styles.counterBtn} onClick={() => setMapelList(mapelList.map((ml) => ml.id === m.id ? { ...ml, jamPerPertemuan: Math.max(1, ml.jamPerPertemuan - 1) } : ml))}>−</button>
                              <span className={styles.counterVal}>{m.jamPerPertemuan} jam</span>
                              <button className={styles.counterBtn} onClick={() => setMapelList(mapelList.map((ml) => ml.id === m.id ? { ...ml, jamPerPertemuan: Math.min(4, ml.jamPerPertemuan + 1) } : ml))}>+</button>
                            </div>
                          </td>
                          <td className={styles.mtd}>
                            <span className={styles.jamPerKelas}>{m.pertemuanPerMinggu * m.jamPerPertemuan} jam · {totalMenitPerKelas(m)} menit</span>
                          </td>
                          <td className={styles.mtdAct}>
                            <button className={styles.delMapelBtn} onClick={() => setMapelList(mapelList.filter((ml) => ml.id !== m.id))}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tambah mapel — guru input auto uppercase */}
                <div className={styles.addMapelRow}>
                  <input className={styles.addInput} placeholder="Nama mata pelajaran" value={newMapel} onChange={(e) => setNewMapel(e.target.value)} />
                  <input
                    className={styles.addInput}
                    placeholder="Nama guru (otomatis kapital)"
                    value={newGuru}
                    onChange={(e) => setNewGuru(e.target.value.toUpperCase())}
                  />
                  <div className={styles.addInputGroup}>
                    <label className={styles.addInputLabel}>Pertemuan</label>
                    <input className={styles.addInputSmall} type="number" min="1" max="5" value={newPertemuan} onChange={(e) => setNewPertemuan(e.target.value)} />
                  </div>
                  <div className={styles.addInputGroup}>
                    <label className={styles.addInputLabel}>Jam/Pertemuan</label>
                    <input className={styles.addInputSmall} type="number" min="1" max="4" value={newJamPertemuan} onChange={(e) => setNewJamPertemuan(e.target.value)} />
                  </div>
                  <button className={styles.addBtn} onClick={() => {
                    if (newMapel.trim() && newGuru.trim()) {
                      setMapelList([...mapelList, {
                        id: `m${Date.now()}`,
                        namaMapel: newMapel.trim(),
                        namaGuru: newGuru.trim().toUpperCase(), // ← pastikan uppercase saat disimpan
                        pertemuanPerMinggu: Number(newPertemuan) || 2,
                        jamPerPertemuan: Number(newJamPertemuan) || 2,
                      }]);
                      setNewMapel("");
                      setNewGuru("");
                      setNewPertemuan("2");
                      setNewJamPertemuan("2");
                    }
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Tambah
                  </button>
                </div>
              </div>

              <div className={styles.stepActions}>
                <button className={styles.backBtn} onClick={() => setStep(1)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Kembali
                </button>
                <button className={styles.generateBtn} onClick={handleGenerate} disabled={loading || mapelList.length === 0}>
                  {loading ? (
                    <><span className={styles.spinner} />Sedang Generate...</>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                      Generate Jadwal
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && hasil && (
            <div className={styles.stepContent}>
              {konflikList.length > 0 ? (
                <div className={styles.konflikBox}>
                  <div className={styles.konflikTitle}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {konflikList.length} pertemuan tidak bisa dialokasikan:
                  </div>
                  {konflikList.map((k, i) => (
                    <div key={i} className={styles.konflikItem}>• {k}</div>
                  ))}
                </div>
              ) : (
                <div className={styles.successBox}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Jadwal berhasil digenerate tanpa konflik!
                </div>
              )}

              {/* Filter */}
              <div className={styles.filterWrap}>
                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Kelas:</span>
                  <div className={styles.filterBtns}>
                    {aktifKelas.map((k) => (
                      <button key={k.nama} className={`${styles.filterBtn} ${activeKelas === k.nama ? styles.filterBtnActive : ""}`} onClick={() => setActiveKelas(k.nama)}>
                        {k.nama}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Hari:</span>
                  <div className={styles.filterBtns}>
                    {HARI_LIST.map((h) => (
                      <button key={h} className={`${styles.filterBtn} ${activeHari === h ? styles.filterBtnActive : ""}`} onClick={() => setActiveHari(h)}>
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabel hasil */}
              <div className={styles.hasilTableWrap}>
                <table className={styles.hasilTable}>
                  <thead>
                    <tr>
                      <th className={styles.hth}>Jam</th>
                      <th className={styles.hth}>Waktu</th>
                      {aktifKelas.map((k) => (
                        <th key={k.nama} className={`${styles.hth} ${k.nama === activeKelas ? styles.hthActive : ""}`}>{k.nama}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {JAM_SLOTS.map((slot, idx) => {
                      const isIst = slot === "IST";
                      return (
                        <tr key={idx} className={isIst ? styles.htrIst : styles.htr}>
                          <td className={styles.htdJam}>{isIst ? "" : slot}</td>
                          <td className={styles.htdWaktu}>{isIst ? "Istirahat" : JAM_WAKTU[idx]}</td>
                          {aktifKelas.map((k) => {
                            if (isIst) return <td key={k.nama} className={styles.htdIst}>Istirahat</td>;
                            const jamNum = slot as number;
                            const cell = hasil[activeHari]?.[jamNum]?.[k.nama];
                            const isAktif = k.nama === activeKelas;
                            if (!cell) return <td key={k.nama} className={`${styles.htdEmpty} ${isAktif ? styles.htdAktif : ""}`}>—</td>;
                            const w = getWarna(cell.mapel);
                            return (
                              <td key={k.nama} className={`${styles.htdCell} ${isAktif ? styles.htdAktif : ""}`}>
                                <div className={styles.htdChip} style={{ background: w.bg, color: w.text }}>
                                  <span className={styles.htdMapel}>{cell.mapel}</span>
                                  <span className={styles.htdGuru}>{cell.guru}</span>
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

              <div className={styles.stepActions}>
                <button className={styles.backBtn} onClick={() => setStep(2)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Ubah Konfigurasi
                </button>
                <button className={styles.generateBtn} onClick={handleGenerate}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Generate Ulang
                </button>
                <button
                  className={styles.saveBtn}
                  disabled={saving}
                  onClick={async () => {
                    if (!hasil) return;
                    setSaving(true);
                    try {
                      const tahunAjaran = "2024/2025";
                      const kelasAktif = kelasList.filter((k) => k.aktif);
                      await Promise.all(
                        kelasAktif.map((kelas) => {
                          const jadwalKelas: Record<string, Record<string, { mapel: string; guru: string } | null>> = {};
                          Object.keys(hasil).forEach((hari) => {
                            jadwalKelas[hari] = {};
                            Object.keys(hasil[hari]).forEach((jam) => {
                              jadwalKelas[hari][jam] = hasil[hari][Number(jam)][kelas.nama] ?? null;
                            });
                          });
                          return saveJadwal({ kelas: kelas.nama, tahunAjaran, durasi, jadwal: jadwalKelas });
                        }),
                      );
                      setSaveModal({ type: "success", message: `Jadwal untuk ${kelasList.filter((k) => k.aktif).length} kelas berhasil disimpan ke database.` });
                    } catch (err) {
                      setSaveModal({ type: "error", message: "Gagal simpan: " + (err instanceof Error ? err.message : "Terjadi kesalahan") });
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  {saving ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Logout */}
      {showLogout && (
        <div className={styles.modalOverlay} onClick={() => setShowLogout(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
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

      {/* Modal Save Result */}
      {saveModal && (
        <div className={styles.modalOverlay} onClick={() => setSaveModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon} style={{ background: saveModal.type === "success" ? "#f0fdf4" : "#fef2f2" }}>
              {saveModal.type === "success" ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
            </div>
            <h3 className={styles.modalTitle} style={{ color: saveModal.type === "success" ? "#16a34a" : "#ef4444" }}>
              {saveModal.type === "success" ? "Jadwal Tersimpan!" : "Gagal Menyimpan"}
            </h3>
            <p className={styles.modalDesc}>{saveModal.message}</p>
            <div className={styles.modalActions}>
              <button
                className={styles.confirmBtn}
                style={{ background: saveModal.type === "success" ? "#16a34a" : "#ef4444" }}
                onClick={() => setSaveModal(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
