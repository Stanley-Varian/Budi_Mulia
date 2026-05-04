"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./materi-siswa.module.css";

// ── Tipe ────────────────────────────────────────────────────────────────────
type Materi = {
  id: number;
  judul: string;
  deskripsi: string;
  tipe: "pdf" | "video" | "doc" | "link";
  ukuran?: string;
  tanggal: string;
  pertemuan: number;
};

// ── Mock data — ganti dengan fetch GET /api/materi?mapelId=[id] ──────────────
const MATERI_DATA: Record<
  string,
  { mapel: string; guru: string; warna: string; list: Materi[] }
> = {
  "1": {
    mapel: "Matematika",
    guru: "Bpk. Andi Saputra",
    warna: "#dbeafe",
    list: [
      {
        id: 1,
        judul: "Pengantar Sistem Persamaan Linear",
        deskripsi: "Materi pembuka tentang konsep dasar SPLDV dan SPLTV",
        tipe: "pdf",
        ukuran: "2.4 MB",
        tanggal: "Hari ini",
        pertemuan: 1,
      },
      {
        id: 2,
        judul: "Video Penjelasan SPLDV",
        deskripsi:
          "Video penjelasan lengkap cara menyelesaikan SPLDV metode substitusi dan eliminasi",
        tipe: "video",
        ukuran: "45 menit",
        tanggal: "Hari ini",
        pertemuan: 1,
      },
      {
        id: 3,
        judul: "Latihan Soal Bab 3",
        deskripsi: "Kumpulan soal latihan untuk pertemuan ke-2",
        tipe: "doc",
        ukuran: "1.1 MB",
        tanggal: "Kemarin",
        pertemuan: 2,
      },
      {
        id: 4,
        judul: "Rumus-Rumus Penting",
        deskripsi: "Rangkuman rumus yang perlu dihafalkan untuk ujian",
        tipe: "pdf",
        ukuran: "800 KB",
        tanggal: "3 hari lalu",
        pertemuan: 2,
      },
      {
        id: 5,
        judul: "Link Referensi Khan Academy",
        deskripsi:
          "Materi tambahan dari Khan Academy untuk pemahaman lebih dalam",
        tipe: "link",
        tanggal: "1 minggu lalu",
        pertemuan: 3,
      },
    ],
  },
  "2": {
    mapel: "Bahasa Indonesia",
    guru: "Ibu Sari Dewi",
    warna: "#fce7f3",
    list: [
      {
        id: 1,
        judul: "Teks Eksposisi - Pengertian dan Struktur",
        deskripsi:
          "Materi lengkap tentang teks eksposisi beserta contoh-contohnya",
        tipe: "pdf",
        ukuran: "3.1 MB",
        tanggal: "Hari ini",
        pertemuan: 1,
      },
      {
        id: 2,
        judul: "Contoh Teks Eksposisi",
        deskripsi: "Kumpulan contoh teks eksposisi dari berbagai sumber",
        tipe: "doc",
        ukuran: "1.5 MB",
        tanggal: "Kemarin",
        pertemuan: 1,
      },
      {
        id: 3,
        judul: "Video: Cara Menulis Teks Eksposisi",
        deskripsi:
          "Panduan langkah demi langkah menulis teks eksposisi yang baik",
        tipe: "video",
        ukuran: "30 menit",
        tanggal: "3 hari lalu",
        pertemuan: 2,
      },
    ],
  },
  "3": {
    mapel: "Bahasa Inggris",
    guru: "Ibu Rina Marlina",
    warna: "#d1fae5",
    list: [
      {
        id: 1,
        judul: "Narrative Text - Theory",
        deskripsi:
          "Complete guide to narrative text structure and language features",
        tipe: "pdf",
        ukuran: "2.8 MB",
        tanggal: "Hari ini",
        pertemuan: 1,
      },
      {
        id: 2,
        judul: "Example of Narrative Texts",
        deskripsi: "Collection of narrative text examples for reading practice",
        tipe: "doc",
        ukuran: "1.2 MB",
        tanggal: "Kemarin",
        pertemuan: 1,
      },
    ],
  },
  "4": {
    mapel: "Fisika",
    guru: "Bpk. Dedi Kurniawan",
    warna: "#fef9c3",
    list: [
      {
        id: 1,
        judul: "Hukum Newton I, II, III",
        deskripsi:
          "Penjelasan lengkap ketiga hukum Newton beserta contoh penerapan dalam kehidupan",
        tipe: "pdf",
        ukuran: "3.5 MB",
        tanggal: "Hari ini",
        pertemuan: 1,
      },
      {
        id: 2,
        judul: "Animasi Hukum Newton",
        deskripsi:
          "Visualisasi hukum Newton menggunakan simulasi fisika interaktif",
        tipe: "link",
        tanggal: "Kemarin",
        pertemuan: 1,
      },
      {
        id: 3,
        judul: "Soal Dinamika Partikel",
        deskripsi: "Latihan soal dinamika partikel untuk ujian tengah semester",
        tipe: "pdf",
        ukuran: "1.8 MB",
        tanggal: "4 hari lalu",
        pertemuan: 2,
      },
    ],
  },
  "5": {
    mapel: "Kimia",
    guru: "Ibu Wulandari",
    warna: "#ede9fe",
    list: [
      {
        id: 1,
        judul: "Tabel Periodik Unsur",
        deskripsi: "Penjelasan lengkap tabel periodik dan cara membacanya",
        tipe: "pdf",
        ukuran: "4.2 MB",
        tanggal: "Hari ini",
        pertemuan: 1,
      },
      {
        id: 2,
        judul: "Video Praktikum Titrasi",
        deskripsi: "Rekaman video praktikum titrasi asam basa di laboratorium",
        tipe: "video",
        ukuran: "25 menit",
        tanggal: "2 hari lalu",
        pertemuan: 2,
      },
    ],
  },
  "6": {
    mapel: "Biologi",
    guru: "Bpk. Hendra Gunawan",
    warna: "#ffedd5",
    list: [
      {
        id: 1,
        judul: "Sel: Unit Terkecil Kehidupan",
        deskripsi: "Materi tentang struktur dan fungsi sel hewan dan tumbuhan",
        tipe: "pdf",
        ukuran: "5.1 MB",
        tanggal: "3 hari lalu",
        pertemuan: 1,
      },
    ],
  },
  "7": {
    mapel: "Sejarah",
    guru: "Ibu Kartini",
    warna: "#f0fdf4",
    list: [
      {
        id: 1,
        judul: "Proklamasi Kemerdekaan Indonesia",
        deskripsi:
          "Latar belakang, proses, dan dampak proklamasi kemerdekaan 17 Agustus 1945",
        tipe: "pdf",
        ukuran: "2.9 MB",
        tanggal: "Hari ini",
        pertemuan: 1,
      },
      {
        id: 2,
        judul: "Dokumentasi Sejarah",
        deskripsi: "Kumpulan foto dan dokumen bersejarah terkait proklamasi",
        tipe: "link",
        tanggal: "Kemarin",
        pertemuan: 1,
      },
    ],
  },
  "8": {
    mapel: "Ekonomi",
    guru: "Bpk. Budi Santoso",
    warna: "#fdf2f8",
    list: [
      {
        id: 1,
        judul: "Permintaan dan Penawaran",
        deskripsi: "Konsep dasar permintaan, penawaran, dan keseimbangan pasar",
        tipe: "pdf",
        ukuran: "2.2 MB",
        tanggal: "2 hari lalu",
        pertemuan: 1,
      },
      {
        id: 2,
        judul: "Grafik Keseimbangan Pasar",
        deskripsi:
          "Panduan membaca dan menganalisis grafik permintaan-penawaran",
        tipe: "doc",
        ukuran: "1.3 MB",
        tanggal: "3 hari lalu",
        pertemuan: 1,
      },
    ],
  },
};

const NAV = [
  {
    label: "Dashboard",
    href: "/dashboard/siswa",
    active: false,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Jadwal",
    href: "/dashboard/siswa/jadwal",
    active: false,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Pengumuman",
    href: "/dashboard/siswa/pengumuman",
    active: false,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    label: "Pengaturan",
    href: "/dashboard/siswa/settings",
    active: false,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function TipeIcon({ tipe }: { tipe: string }) {
  switch (tipe) {
    case "pdf":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "video":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    case "doc":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case "link":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    default:
      return null;
  }
}

const TIPE_STYLE: Record<string, { bg: string; color: string; label: string }> =
  {
    pdf: { bg: "#fef2f2", color: "#dc2626", label: "PDF" },
    video: { bg: "#eff6ff", color: "#2563eb", label: "Video" },
    doc: { bg: "#f0fdf4", color: "#16a34a", label: "Dokumen" },
    link: { bg: "#fdf4ff", color: "#9333ea", label: "Link" },
  };

// ── Komponen utama ───────────────────────────────────────────────────────────
export default function MateriSiswa({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [filterPertemuan, setFilterPertemuan] = useState<number | "semua">(
    "semua",
  );

  const data = MATERI_DATA[params.id];

  // Kalau id tidak ditemukan
  if (!data) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 16, color: "#64748b" }}>
            Mata pelajaran tidak ditemukan.
          </p>
          <button
            onClick={() => router.push("/dashboard/siswa")}
            style={{
              marginTop: 16,
              padding: "10px 20px",
              background: "#2952cc",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pertemuanList = [...new Set(data.list.map((m) => m.pertemuan))].sort(
    (a, b) => a - b,
  );
  const filtered =
    filterPertemuan === "semua"
      ? data.list
      : data.list.filter((m) => m.pertemuan === filterPertemuan);

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${expanded ? styles.sidebarExpanded : ""}`}
      >
        <button
          className={styles.hamburger}
          onClick={() => setExpanded(!expanded)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          {expanded && <span className={styles.brandName}>SMA Budi Mulia</span>}
        </button>
        <nav className={styles.nav}>
          {NAV.map((item, i) => (
            <a
              key={i}
              href={item.href}
              className={`${styles.navItem} ${item.active ? styles.navActive : ""}`}
              title={!expanded ? item.label : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {expanded && (
                <span className={styles.navLabel}>{item.label}</span>
              )}
            </a>
          ))}

          <button
            className={`${styles.navItem} ${styles.navLogout}`}
            onClick={() => setShowLogout(true)}
            title={!expanded ? "Keluar" : undefined}
            style={{ marginTop: "auto" }}
          >
            <span className={styles.navIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            {expanded && <span className={styles.navLabel}>Keluar</span>}
          </button>
        </nav>
      </aside>
      {expanded && (
        <div className={styles.overlay} onClick={() => setExpanded(false)} />
      )}

      {/* Main */}
      <div className={`${styles.main} ${expanded ? styles.mainShifted : ""}`}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            {/* Tombol back ke dashboard */}
            <button
              className={styles.backBtn}
              onClick={() => router.push("/dashboard/siswa")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className={styles.mapelInfo}>
              <div
                className={styles.mapelDot}
                style={{ background: data.warna }}
              />
              <h1 className={styles.pageTitle}>{data.mapel}</h1>
            </div>
            <span className={styles.guruTag}>{data.guru}</span>
          </div>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>Stanley Varian Rasa</span>
              <span className={styles.userSub}>Kelas: 10 B</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {/* Filter pertemuan */}
          <div className={styles.filterRow}>
            <button
              className={`${styles.filterBtn} ${filterPertemuan === "semua" ? styles.filterBtnActive : ""}`}
              onClick={() => setFilterPertemuan("semua")}
            >
              Semua
            </button>
            {pertemuanList.map((p) => (
              <button
                key={p}
                className={`${styles.filterBtn} ${filterPertemuan === p ? styles.filterBtnActive : ""}`}
                onClick={() => setFilterPertemuan(p)}
              >
                Pertemuan {p}
              </button>
            ))}
          </div>

          {/* List materi */}
          <div className={styles.materiList}>
            {filtered.map((item) => {
              const tipeStyle = TIPE_STYLE[item.tipe];
              return (
                <div key={item.id} className={styles.materiCard}>
                  <div
                    className={styles.materiIcon}
                    style={{ background: tipeStyle.bg }}
                  >
                    <span style={{ color: tipeStyle.color }}>
                      <TipeIcon tipe={item.tipe} />
                    </span>
                  </div>
                  <div className={styles.materiBody}>
                    <div className={styles.materiTop}>
                      <span
                        className={styles.tipeChip}
                        style={{
                          background: tipeStyle.bg,
                          color: tipeStyle.color,
                        }}
                      >
                        {tipeStyle.label}
                      </span>
                      <span className={styles.pertemuanChip}>
                        Pertemuan {item.pertemuan}
                      </span>
                    </div>
                    <div className={styles.materiJudul}>{item.judul}</div>
                    <div className={styles.materiDeskripsi}>
                      {item.deskripsi}
                    </div>
                    <div className={styles.materiFoot}>
                      {item.ukuran && (
                        <span className={styles.materiUkuran}>
                          {item.ukuran}
                        </span>
                      )}
                      <span className={styles.materiTanggal}>
                        {item.tanggal}
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.downloadBtn}
                    title={item.tipe === "link" ? "Buka Link" : "Unduh"}
                  >
                    {item.tipe === "link" ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogout && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowLogout(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Keluar dari Akun?</h3>
            <p className={styles.modalDesc}>
              Kamu akan keluar dari akun Stanley Varian Rasa.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowLogout(false)}
              >
                Batal
              </button>
              <button
                className={styles.confirmBtn}
                onClick={() => router.push("/")}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
