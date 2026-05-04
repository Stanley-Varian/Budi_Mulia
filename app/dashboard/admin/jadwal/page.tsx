"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./generate-jadwal.module.css";

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
  pertemuanPerMinggu: number; // berapa kali pertemuan per minggu per kelas
  jamPerPertemuan: number;    // berapa jam pelajaran per pertemuan (konsekutif)
};

type HariConfig = {
  hari: Hari;
  maxJam: number;
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
const JAM_SLOTS = [1,2,3,4,"IST",5,6,7,8,"IST",9,10,11] as const;
const JAM_WAKTU = ["06.45","07.30","08.15","09.00","","09.45","10.30","11.15","12.00","","12.45","13.30","14.15"];

// Jam real (bukan istirahat), berurutan
const JAM_REAL = [1,2,3,4,5,6,7,8,9,10,11];

// Cek apakah jam j dan j+n-1 semua konsekutif (tidak melintasi istirahat)
// Istirahat ada setelah jam 4 (5 langsung) dan setelah jam 8 (9 langsung)
// Jadi blok konsekutif yang boleh: 1-4, 5-8, 9-11
function isKonsekutif(startJam: number, panjang: number): boolean {
  const end = startJam + panjang - 1;
  // Tidak boleh melewati batas istirahat
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
  const aktifKelas = kelasList.filter(k => k.aktif).map(k => k.nama);
  const konflik: string[] = [];

  // Inisialisasi jadwal
  const jadwal: HasilJadwal = {};
  HARI_LIST.forEach(h => {
    jadwal[h] = {};
    JAM_REAL.forEach(j => {
      jadwal[h][j] = {};
      aktifKelas.forEach(k => { jadwal[h][j][k] = null; });
    });
  });

  // Tracking guru busy: guruBusy[hari][jam] = Set<namaGuru>
  const guruBusy: Record<string, Record<number, Set<string>>> = {};
  HARI_LIST.forEach(h => {
    guruBusy[h] = {};
    JAM_REAL.forEach(j => { guruBusy[h][j] = new Set(); });
  });

  // Buat daftar tugas: setiap mapel × kelas × pertemuan
  // Tiap tugas = 1 blok pertemuan (jamPerPertemuan jam konsekutif)
  type Tugas = {
    mapel: string;
    guru: string;
    kelas: string;
    panjang: number; // jamPerPertemuan
  };

  const tugasList: Tugas[] = [];
  mapelList.forEach(m => {
    aktifKelas.forEach(kelas => {
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

  // Shuffle tugas untuk variasi
  for (let i = tugasList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tugasList[i], tugasList[j]] = [tugasList[j], tugasList[i]];
  }

  const maxJamMap: Record<string, number> = {};
  hariConfig.forEach(h => { maxJamMap[h.hari] = h.maxJam; });

  // Assign tiap tugas ke blok konsekutif
  tugasList.forEach(tugas => {
    let assigned = false;

    for (const hari of HARI_LIST) {
      if (assigned) break;
      const maxJ = maxJamMap[hari] ?? 11;

      // Cari slot awal yang memungkinkan blok konsekutif
      for (let startJam = 1; startJam <= maxJ && !assigned; startJam++) {
        // Cek apakah blok startJam..startJam+panjang-1 valid
        if (!isKonsekutif(startJam, tugas.panjang)) continue;
        if (startJam + tugas.panjang - 1 > maxJ) continue;

        // Cek semua jam dalam blok: guru tidak busy & kelas tidak busy
        let bisaAssign = true;
        for (let j = startJam; j < startJam + tugas.panjang; j++) {
          if (guruBusy[hari][j]?.has(tugas.guru)) { bisaAssign = false; break; }
          if (jadwal[hari][j]?.[tugas.kelas] !== null) { bisaAssign = false; break; }
        }

        if (bisaAssign) {
          // Assign blok
          for (let j = startJam; j < startJam + tugas.panjang; j++) {
            jadwal[hari][j][tugas.kelas] = { mapel: tugas.mapel, guru: tugas.guru };
            guruBusy[hari][j].add(tugas.guru);
          }
          assigned = true;
        }
      }
    }

    if (!assigned) {
      konflik.push(`${tugas.mapel} (${tugas.guru}) untuk kelas ${tugas.kelas}: tidak bisa dialokasikan`);
    }
  });

  return { hasil: jadwal, konflik };
}

// ── Warna mapel ──────────────────────────────────────────────────────────────
const WARNA_MAPEL: Record<string, { bg: string; text: string }> = {
  "Matematika":       { bg:"#dbeafe", text:"#1e40af" },
  "Bahasa Indonesia": { bg:"#fce7f3", text:"#9d174d" },
  "Bahasa Inggris":   { bg:"#d1fae5", text:"#065f46" },
  "Fisika":           { bg:"#fef9c3", text:"#854d0e" },
  "Kimia":            { bg:"#ede9fe", text:"#6d28d9" },
  "Biologi":          { bg:"#ffedd5", text:"#9a3412" },
  "Sejarah":          { bg:"#f0fdf4", text:"#14532d" },
  "Ekonomi":          { bg:"#fdf2f8", text:"#701a75" },
  "PJOK":             { bg:"#dcfce7", text:"#166534" },
  "Agama":            { bg:"#fff7ed", text:"#9a3412" },
  "PKN":              { bg:"#e0f2fe", text:"#0369a1" },
  "BK":               { bg:"#f1f5f9", text:"#475569" },
};

function getWarna(mapel: string) {
  return WARNA_MAPEL[mapel] ?? { bg:"#f8fafc", text:"#374151" };
}

const NAV = [
  { label:"Dashboard",      href:"/dashboard/admin",            active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"Generate Jadwal",href:"/dashboard/admin/jadwal",     active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label:"Manajemen User", href:"/dashboard/admin/users",      active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label:"Pengumuman",     href:"/dashboard/admin/pengumuman", active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label:"Pengaturan",     href:"/dashboard/admin/settings",   active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

export default function GenerateJadwal() {
  const router = useRouter();
  const [expanded, setExpanded]       = useState(false);
  const [showLogout, setShowLogout]   = useState(false);
  const [step, setStep]               = useState<1|2|3>(1);
  const [loading, setLoading]         = useState(false);
  const [hasil, setHasil]             = useState<HasilJadwal | null>(null);
  const [konflikList, setKonflikList] = useState<string[]>([]);
  const [activeHari, setActiveHari]   = useState<Hari>("Senin");
  const [activeKelas, setActiveKelas] = useState("");
  const [durasi, setDurasi]           = useState(45);

  // Step 1: Kelas & Hari config
  const [kelasList, setKelasList] = useState<KelasConfig[]>([
    { id:"k1", nama:"10 A", aktif:true },{ id:"k2", nama:"10 B", aktif:true },
    { id:"k3", nama:"10 C", aktif:true },{ id:"k4", nama:"10 D", aktif:true },
    { id:"k5", nama:"10 E", aktif:false },{ id:"k6", nama:"11 A", aktif:true },
    { id:"k7", nama:"11 B", aktif:true },{ id:"k8", nama:"11 C", aktif:false },
    { id:"k9", nama:"12 A", aktif:true },{ id:"k10", nama:"12 B", aktif:true },
  ]);
  const [hariConfig, setHariConfig] = useState<HariConfig[]>([
    { hari:"Senin", maxJam:11 },{ hari:"Selasa", maxJam:11 },
    { hari:"Rabu",  maxJam:11 },{ hari:"Kamis",  maxJam:11 },
    { hari:"Jumat", maxJam:8  },
  ]);
  const [newKelas, setNewKelas] = useState("");

  // Step 2: Mapel config — input pertemuan/minggu & jam/pertemuan
  const [mapelList, setMapelList] = useState<MapelConfig[]>([
    { id:"m1",  namaMapel:"Matematika",       namaGuru:"Bpk. Andi Saputra",   pertemuanPerMinggu:3, jamPerPertemuan:2 },
    { id:"m2",  namaMapel:"Bahasa Indonesia", namaGuru:"Ibu Sari Dewi",        pertemuanPerMinggu:3, jamPerPertemuan:2 },
    { id:"m3",  namaMapel:"Bahasa Inggris",   namaGuru:"Ibu Rina Marlina",     pertemuanPerMinggu:2, jamPerPertemuan:2 },
    { id:"m4",  namaMapel:"Fisika",           namaGuru:"Bpk. Dedi Kurniawan",  pertemuanPerMinggu:2, jamPerPertemuan:2 },
    { id:"m5",  namaMapel:"Kimia",            namaGuru:"Ibu Wulandari",        pertemuanPerMinggu:2, jamPerPertemuan:2 },
    { id:"m6",  namaMapel:"Biologi",          namaGuru:"Bpk. Hendra",          pertemuanPerMinggu:2, jamPerPertemuan:2 },
    { id:"m7",  namaMapel:"Sejarah",          namaGuru:"Ibu Kartini",          pertemuanPerMinggu:2, jamPerPertemuan:2 },
    { id:"m8",  namaMapel:"Ekonomi",          namaGuru:"Bpk. Budi",            pertemuanPerMinggu:2, jamPerPertemuan:2 },
    { id:"m9",  namaMapel:"PJOK",             namaGuru:"Bpk. Reza",            pertemuanPerMinggu:1, jamPerPertemuan:3 },
    { id:"m10", namaMapel:"Agama",            namaGuru:"Bpk. Fauzi",           pertemuanPerMinggu:2, jamPerPertemuan:2 },
    { id:"m11", namaMapel:"PKN",              namaGuru:"Bpk. Hadi",            pertemuanPerMinggu:2, jamPerPertemuan:2 },
    { id:"m12", namaMapel:"BK",               namaGuru:"Ibu Ratna",            pertemuanPerMinggu:1, jamPerPertemuan:1 },
  ]);
  const [newMapel, setNewMapel]   = useState("");
  const [newGuru, setNewGuru]     = useState("");
  const [newPertemuan, setNewPertemuan] = useState("2");
  const [newJamPertemuan, setNewJamPertemuan] = useState("2");

  const aktifKelas = kelasList.filter(k => k.aktif);

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

  // Hitung total menit per kelas per minggu untuk mapel
  const totalMenitPerKelas = (m: MapelConfig) =>
    m.pertemuanPerMinggu * m.jamPerPertemuan * durasi;

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
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>Generate Jadwal</h1>
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
          {/* Stepper */}
          <div className={styles.stepper}>
            {[{n:1,label:"Konfigurasi Kelas"},{n:2,label:"Mata Pelajaran"},{n:3,label:"Hasil Jadwal"}].map((s,i) => (
              <div key={s.n} className={styles.stepperItem}>
                <div className={`${styles.stepCircle} ${step===s.n?styles.stepActive:""} ${step>s.n?styles.stepDone:""}`}>
                  {step>s.n?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>:s.n}
                </div>
                <span className={`${styles.stepLabel} ${step===s.n?styles.stepLabelActive:""}`}>{s.label}</span>
                {i<2 && <div className={`${styles.stepLine} ${step>s.n?styles.stepLineDone:""}`}/>}
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

                {/* Max jam per hari */}
                <div className={styles.card}>
                  <div className={styles.cardTitle}>Maksimal Jam Per Hari</div>
                  <div className={styles.cardDesc}>Atur jumlah jam pelajaran tiap hari. Jumat biasanya lebih pendek.</div>
                  <div className={styles.hariConfigList}>
                    {hariConfig.map((h) => (
                      <div key={h.hari} className={styles.hariConfigRow}>
                        <span className={styles.hariConfigNama}>{h.hari}</span>
                        <div className={styles.hariConfigControl}>
                          <button className={styles.counterBtn} onClick={() => setHariConfig(hariConfig.map(hc => hc.hari===h.hari?{...hc,maxJam:Math.max(1,hc.maxJam-1)}:hc))}>−</button>
                          <span className={styles.counterVal}>{h.maxJam} jam</span>
                          <span className={styles.counterMenit}>({h.maxJam * durasi} menit)</span>
                          <button className={styles.counterBtn} onClick={() => setHariConfig(hariConfig.map(hc => hc.hari===h.hari?{...hc,maxJam:Math.min(11,hc.maxJam+1)}:hc))}>+</button>
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
                      <button key={k.id} className={`${styles.kelasChip} ${k.aktif?styles.kelasChipAktif:""}`} onClick={() => setKelasList(kelasList.map(kl => kl.id===k.id?{...kl,aktif:!kl.aktif}:kl))}>
                        {k.aktif && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        {k.nama}
                      </button>
                    ))}
                  </div>
                  <div className={styles.addKelasRow}>
                    <input className={styles.addInput} placeholder="Tambah kelas, misal: 10 G" value={newKelas} onChange={(e) => setNewKelas(e.target.value)} onKeyDown={(e) => { if(e.key==="Enter"&&newKelas.trim()){setKelasList([...kelasList,{id:`k${Date.now()}`,nama:newKelas.trim(),aktif:true}]);setNewKelas("");}}} />
                    <button className={styles.addBtn} onClick={() => { if(newKelas.trim()){setKelasList([...kelasList,{id:`k${Date.now()}`,nama:newKelas.trim(),aktif:true}]);setNewKelas("");}}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Tambah
                    </button>
                  </div>
                  <div className={styles.kelasInfo}>{aktifKelas.length} kelas aktif dari {kelasList.length} total</div>
                </div>
              </div>

              <div className={styles.stepActions}>
                <button className={styles.nextBtn} onClick={() => setStep(2)} disabled={aktifKelas.length===0}>
                  Lanjut ke Mata Pelajaran
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
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
                  Jadwal akan diisi blok jam konsekutif, tidak akan terpotong istirahat.
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
                              <div className={styles.mapelDot} style={{ background:getWarna(m.namaMapel).bg, border:`2px solid ${getWarna(m.namaMapel).text}` }}/>
                              {m.namaMapel}
                            </div>
                          </td>
                          <td className={styles.mtd}>{m.namaGuru}</td>
                          <td className={styles.mtd}>
                            <div className={styles.jamControl}>
                              <button className={styles.counterBtn} onClick={() => setMapelList(mapelList.map(ml => ml.id===m.id?{...ml,pertemuanPerMinggu:Math.max(1,ml.pertemuanPerMinggu-1)}:ml))}>−</button>
                              <span className={styles.counterVal}>{m.pertemuanPerMinggu}x</span>
                              <button className={styles.counterBtn} onClick={() => setMapelList(mapelList.map(ml => ml.id===m.id?{...ml,pertemuanPerMinggu:ml.pertemuanPerMinggu+1}:ml))}>+</button>
                            </div>
                          </td>
                          <td className={styles.mtd}>
                            <div className={styles.jamControl}>
                              <button className={styles.counterBtn} onClick={() => setMapelList(mapelList.map(ml => ml.id===m.id?{...ml,jamPerPertemuan:Math.max(1,ml.jamPerPertemuan-1)}:ml))}>−</button>
                              <span className={styles.counterVal}>{m.jamPerPertemuan} jam</span>
                              <button className={styles.counterBtn} onClick={() => setMapelList(mapelList.map(ml => ml.id===m.id?{...ml,jamPerPertemuan:Math.min(4,ml.jamPerPertemuan+1)}:ml))}>+</button>
                            </div>
                          </td>
                          <td className={styles.mtd}>
                            <span className={styles.jamPerKelas}>
                              {m.pertemuanPerMinggu * m.jamPerPertemuan} jam · {totalMenitPerKelas(m)} menit
                            </span>
                          </td>
                          <td className={styles.mtdAct}>
                            <button className={styles.delMapelBtn} onClick={() => setMapelList(mapelList.filter(ml => ml.id!==m.id))}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tambah mapel */}
                <div className={styles.addMapelRow}>
                  <input className={styles.addInput} placeholder="Nama mata pelajaran" value={newMapel} onChange={(e) => setNewMapel(e.target.value)} />
                  <input className={styles.addInput} placeholder="Nama guru" value={newGuru} onChange={(e) => setNewGuru(e.target.value)} />
                  <div className={styles.addInputGroup}>
                    <label className={styles.addInputLabel}>Pertemuan</label>
                    <input className={styles.addInputSmall} type="number" min="1" max="5" value={newPertemuan} onChange={(e) => setNewPertemuan(e.target.value)} />
                  </div>
                  <div className={styles.addInputGroup}>
                    <label className={styles.addInputLabel}>Jam/Pertemuan</label>
                    <input className={styles.addInputSmall} type="number" min="1" max="4" value={newJamPertemuan} onChange={(e) => setNewJamPertemuan(e.target.value)} />
                  </div>
                  <button className={styles.addBtn} onClick={() => {
                    if(newMapel.trim()&&newGuru.trim()){
                      setMapelList([...mapelList,{id:`m${Date.now()}`,namaMapel:newMapel.trim(),namaGuru:newGuru.trim(),pertemuanPerMinggu:Number(newPertemuan)||2,jamPerPertemuan:Number(newJamPertemuan)||2}]);
                      setNewMapel("");setNewGuru("");setNewPertemuan("2");setNewJamPertemuan("2");
                    }
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Tambah
                  </button>
                </div>
              </div>

              <div className={styles.stepActions}>
                <button className={styles.backBtn} onClick={() => setStep(1)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Kembali
                </button>
                <button className={styles.generateBtn} onClick={handleGenerate} disabled={loading||mapelList.length===0}>
                  {loading ? (
                    <><span className={styles.spinner}/>Sedang Generate...</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>Generate Jadwal</>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {konflikList.length} pertemuan tidak bisa dialokasikan:
                  </div>
                  {konflikList.map((k,i) => <div key={i} className={styles.konflikItem}>• {k}</div>)}
                </div>
              ) : (
                <div className={styles.successBox}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Jadwal berhasil digenerate tanpa konflik!
                </div>
              )}

              {/* Filter */}
              <div className={styles.filterWrap}>
                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Kelas:</span>
                  <div className={styles.filterBtns}>
                    {aktifKelas.map(k => (
                      <button key={k.nama} className={`${styles.filterBtn} ${activeKelas===k.nama?styles.filterBtnActive:""}`} onClick={() => setActiveKelas(k.nama)}>{k.nama}</button>
                    ))}
                  </div>
                </div>
                <div className={styles.filterGroup}>
                  <span className={styles.filterLabel}>Hari:</span>
                  <div className={styles.filterBtns}>
                    {HARI_LIST.map(h => (
                      <button key={h} className={`${styles.filterBtn} ${activeHari===h?styles.filterBtnActive:""}`} onClick={() => setActiveHari(h)}>{h}</button>
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
                      {aktifKelas.map(k => (
                        <th key={k.nama} className={`${styles.hth} ${k.nama===activeKelas?styles.hthActive:""}`}>{k.nama}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {JAM_SLOTS.map((slot, idx) => {
                      const isIst = slot === "IST";
                      return (
                        <tr key={idx} className={isIst?styles.htrIst:styles.htr}>
                          <td className={styles.htdJam}>{isIst?"":slot}</td>
                          <td className={styles.htdWaktu}>{isIst?"Istirahat":JAM_WAKTU[idx]}</td>
                          {aktifKelas.map(k => {
                            if(isIst) return <td key={k.nama} className={styles.htdIst}>Istirahat</td>;
                            const jamNum = slot as number;
                            const cell = hasil[activeHari]?.[jamNum]?.[k.nama];
                            const isAktif = k.nama === activeKelas;
                            if(!cell) return <td key={k.nama} className={`${styles.htdEmpty} ${isAktif?styles.htdAktif:""}`}>—</td>;
                            const w = getWarna(cell.mapel);
                            return (
                              <td key={k.nama} className={`${styles.htdCell} ${isAktif?styles.htdAktif:""}`}>
                                <div className={styles.htdChip} style={{background:w.bg,color:w.text}}>
                                  <span className={styles.htdMapel}>{cell.mapel}</span>
                                  <span className={styles.htdGuru}>{cell.guru.split(" ").slice(-2).join(" ")}</span>
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Ubah Konfigurasi
                </button>
                <button className={styles.generateBtn} onClick={handleGenerate}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  Generate Ulang
                </button>
                <button className={styles.saveBtn} onClick={() => alert("Jadwal disimpan! (Hubungkan ke API)")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Simpan Jadwal
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