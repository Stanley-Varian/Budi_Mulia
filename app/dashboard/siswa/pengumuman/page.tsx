"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./pengumuman.module.css";

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
};

const MOCK_DATA: Pengumuman[] = [
  {
    id: 1,
    judul: "Libur Nasional Hari Buruh",
    isi: "Diberitahukan kepada seluruh siswa bahwa pada tanggal 1 Mei 2025 sekolah diliburkan dalam rangka peringatan Hari Buruh Nasional. Kegiatan belajar mengajar kembali normal pada tanggal 2 Mei 2025.",
    penulis: "Tata Usaha",
    tanggal: "Hari ini",
    tag: "Umum",
    tagColor: "#dbeafe",
    tagText: "#1e40af",
    penting: true,
  },
  {
    id: 2,
    judul: "Ulangan Harian Matematika Kelas 10",
    isi: "Ulangan harian Matematika untuk kelas 10 A dan 10 B akan dilaksanakan pada hari Rabu, 7 Mei 2025 pada jam pelajaran ke-1 dan ke-2. Materi yang diujikan adalah Bab 3: Sistem Persamaan Linear.",
    penulis: "Bpk. Andi Saputra",
    tanggal: "Hari ini",
    tag: "Matematika",
    tagColor: "#dbeafe",
    tagText: "#1e40af",
    penting: false,
  },
  {
    id: 3,
    judul: "Pengumpulan Tugas Bahasa Indonesia",
    isi: "Tugas makalah Bahasa Indonesia dikumpulkan paling lambat Jumat, 9 Mei 2025. Pengumpulan dilakukan melalui sistem ini di menu Materi > Bahasa Indonesia > Tugas.",
    penulis: "Ibu Sari Dewi",
    tanggal: "Kemarin",
    tag: "B. Indo",
    tagColor: "#fce7f3",
    tagText: "#9d174d",
    penting: false,
  },
  {
    id: 4,
    judul: "Jadwal Remedial Ujian Tengah Semester",
    isi: "Siswa yang belum mencapai KKM pada Ujian Tengah Semester wajib mengikuti remedial yang dijadwalkan pada tanggal 12–14 Mei 2025. Daftar nama siswa dan jadwal lengkap dapat dilihat di papan pengumuman sekolah.",
    penulis: "Wakil Kurikulum",
    tanggal: "2 hari lalu",
    tag: "Akademik",
    tagColor: "#f0fdf4",
    tagText: "#14532d",
    penting: true,
  },
  {
    id: 5,
    judul: "Praktikum Kimia Minggu Depan",
    isi: "Praktikum Kimia untuk kelas 10 B akan dilaksanakan pada hari Kamis, 15 Mei 2025 di Lab IPA. Siswa diwajibkan memakai jas lab dan membawa alat tulis.",
    penulis: "Ibu Wulandari",
    tanggal: "3 hari lalu",
    tag: "Kimia",
    tagColor: "#ede9fe",
    tagText: "#6d28d9",
    penting: false,
  },
];

const TABS = ["Baru", "Terbaru", "Minggu Ini", "Bulan Ini"];

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
    active: true,
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

export default function PengumumanSiswa() {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [selected, setSelected] = useState<Pengumuman | null>(null);
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

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
          <div className={styles.tabs}>
            {TABS.map((tab, i) => (
              <button
                key={i}
                className={`${styles.tab} ${activeTab === i ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(i)}
              >
                {activeTab === i && (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {tab}
              </button>
            ))}
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

        {/* List */}
        <div className={styles.content}>
          <div className={styles.list}>
            {MOCK_DATA.map((item) => (
              <div
                key={item.id}
                className={`${styles.card} ${item.penting ? styles.cardPenting : ""}`}
                onClick={() => setSelected(item)}
              >
                <div className={styles.cardMain}>
                  {item.penting && (
                    <span className={styles.pentingBadge}>
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Penting
                    </span>
                  )}
                  <div className={styles.cardTitle}>{item.judul}</div>
                  <div className={styles.cardIsi}>{item.isi}</div>
                </div>
                <div className={styles.cardMeta}>
                  <div className={styles.cardMetaLeft}>
                    <span
                      className={styles.tagChip}
                      style={{ background: item.tagColor, color: item.tagText }}
                    >
                      {item.tag}
                    </span>
                    <span className={styles.penulis}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {item.penulis}
                    </span>
                  </div>
                  <span className={styles.tanggal}>{item.tanggal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTags}>
                <span
                  className={styles.tagChip}
                  style={{
                    background: selected.tagColor,
                    color: selected.tagText,
                  }}
                >
                  {selected.tag}
                </span>
                {selected.penting && (
                  <span className={styles.pentingBadge}>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    Penting
                  </span>
                )}
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setSelected(null)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <h2 className={styles.modalTitle}>{selected.judul}</h2>
            <div className={styles.modalMeta}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {selected.penulis} · {selected.tanggal}
            </div>
            <p className={styles.modalIsi}>{selected.isi}</p>
          </div>
        </div>
      )}

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
