"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";

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
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function SettingsSiswa() {
  const [expanded, setExpanded] = useState(false);
  const [notifPengumuman, setNotifPengumuman] = useState(true);
  const [notifMateri, setNotifMateri] = useState(true);
  const [notifJadwal, setNotifJadwal] = useState(false);
  const [bahasa, setBahasa] = useState("id");
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
          <h1 className={styles.pageTitle}>Pengaturan</h1>
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

        <div className={styles.content}>
          <div className={styles.sections}>
            {/* ── Profil ── */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Profil</div>
              <div className={styles.sectionDesc}>
                Informasi ini dikelola oleh admin sekolah.
              </div>

              <div className={styles.profileCard}>
                <div className={styles.avatarWrap}>
                  <div className={styles.avatar}>
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className={styles.avatarInfo}>
                    <div className={styles.avatarName}>Stanley Varian Rasa</div>
                    <div className={styles.avatarRole}>Siswa · Kelas 10 B</div>
                  </div>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Nama Lengkap</span>
                  <span className={styles.fieldValue}>Stanley Varian Rasa</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>NISN</span>
                  <span className={styles.fieldValue}>0012345678</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Kelas</span>
                  <span className={styles.fieldValue}>10 B</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Tahun Ajaran</span>
                  <span className={styles.fieldValue}>2024 / 2025</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Username</span>
                  <span className={styles.fieldValue}>stanley.varian</span>
                </div>
              </div>

              <div className={styles.infoNote}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Untuk mengubah data profil atau password, hubungi admin sekolah.
              </div>
            </div>

            {/* ── Notifikasi ── */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Notifikasi</div>
              <div className={styles.sectionDesc}>
                Atur notifikasi yang ingin kamu terima.
              </div>

              <div className={styles.toggleList}>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Pengumuman Baru</span>
                    <span className={styles.toggleDesc}>
                      Notifikasi saat ada pengumuman dari guru atau admin
                    </span>
                  </div>
                  <Toggle
                    value={notifPengumuman}
                    onChange={setNotifPengumuman}
                  />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Materi Baru</span>
                    <span className={styles.toggleDesc}>
                      Notifikasi saat guru mengupload materi baru
                    </span>
                  </div>
                  <Toggle value={notifMateri} onChange={setNotifMateri} />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Perubahan Jadwal</span>
                    <span className={styles.toggleDesc}>
                      Notifikasi saat ada perubahan jadwal pelajaran
                    </span>
                  </div>
                  <Toggle value={notifJadwal} onChange={setNotifJadwal} />
                </div>
              </div>
            </div>

            {/* ── Bahasa ── */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Bahasa</div>
              <div className={styles.sectionDesc}>
                Pilih bahasa tampilan aplikasi.
              </div>

              <div className={styles.bahasaGroup}>
                {[
                  { val: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
                  { val: "en", label: "English", flag: "🇬🇧" },
                ].map((b) => (
                  <button
                    key={b.val}
                    className={`${styles.bahasaBtn} ${bahasa === b.val ? styles.bahasaBtnActive : ""}`}
                    onClick={() => setBahasa(b.val)}
                  >
                    <span className={styles.bahasaFlag}>{b.flag}</span>
                    <span>{b.label}</span>
                    {bahasa === b.val && (
                      <svg
                        className={styles.bahasaCheck}
                        width="14"
                        height="14"
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
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

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

// ── Toggle Component ─────────────────────────────────────────────────────────
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      className={`${styles.toggle} ${value ? styles.toggleOn : ""}`}
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}
