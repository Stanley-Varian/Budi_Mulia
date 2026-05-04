"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./setting.module.css";

const NAV = [
  { label:"Dashboard",      href:"/dashboard/admin",            active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"Generate Jadwal",href:"/dashboard/admin/jadwal",     active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label:"Manajemen User", href:"/dashboard/admin/users",      active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label:"Pengumuman",     href:"/dashboard/admin/pengumuman", active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label:"Pengaturan",     href:"/dashboard/admin/settings",   active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={`${styles.toggle} ${value ? styles.toggleOn : ""}`} onClick={() => onChange(!value)} role="switch" aria-checked={value}>
      <span className={styles.toggleThumb} />
    </button>
  );
}

export default function SettingsAdmin() {
  const router = useRouter();
  const [expanded, setExpanded]         = useState(false);
  const [showLogout, setShowLogout]     = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);

  // Notifikasi
  const [notifLogin, setNotifLogin]     = useState(true);
  const [notifUser, setNotifUser]       = useState(true);
  const [notifJadwal, setNotifJadwal]   = useState(true);

  // Sekolah info
  const [namaSekolah, setNamaSekolah]   = useState("SMA Budi Mulia");
  const [tahunAjaran, setTahunAjaran]   = useState("2024 / 2025");
  const [editSekolah, setEditSekolah]   = useState(false);

  // Change password
  const [oldPass, setOldPass]           = useState("");
  const [newPass, setNewPass]           = useState("");
  const [confPass, setConfPass]         = useState("");
  const [passError, setPassError]       = useState("");
  const [passDone, setPassDone]         = useState(false);

  const handleChangePass = () => {
    if (!oldPass || !newPass || !confPass) { setPassError("Semua field wajib diisi."); return; }
    if (newPass.length < 8) { setPassError("Password baru minimal 8 karakter."); return; }
    if (newPass !== confPass) { setPassError("Konfirmasi password tidak cocok."); return; }
    setPassError("");
    setPassDone(true);
    setTimeout(() => { setShowChangePass(false); setOldPass(""); setNewPass(""); setConfPass(""); setPassDone(false); }, 1500);
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
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>Pengaturan</h1>
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
          <div className={styles.sections}>

            {/* ── Profil Admin ── */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Profil Admin</div>
              <div className={styles.sectionDesc}>Informasi akun administrator sistem.</div>
              <div className={styles.profileCard}>
                <div className={styles.avatar}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.avatarName}>Administrator</div>
                  <div className={styles.avatarRole}>Super Admin · SMA Budi Mulia</div>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Username</span>
                  <span className={styles.fieldValue}>admin</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Role</span>
                  <span className={styles.fieldValue}>Administrator</span>
                </div>
              </div>
              <button className={styles.changePassBtn} onClick={() => setShowChangePass(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Ganti Password
              </button>
            </div>

            {/* ── Info Sekolah ── */}
            <div className={styles.section}>
              <div className={styles.sectionTitleRow}>
                <div>
                  <div className={styles.sectionTitle}>Informasi Sekolah</div>
                  <div className={styles.sectionDesc}>Data umum sekolah yang ditampilkan di sistem.</div>
                </div>
                <button className={styles.editBtn} onClick={() => setEditSekolah(!editSekolah)}>
                  {editSekolah ? "Simpan" : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </>
                  )}
                </button>
              </div>
              <div className={styles.fieldGroup}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Nama Sekolah</span>
                  {editSekolah ? (
                    <input className={styles.inlineInput} value={namaSekolah} onChange={(e) => setNamaSekolah(e.target.value)} />
                  ) : (
                    <span className={styles.fieldValue}>{namaSekolah}</span>
                  )}
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Tahun Ajaran</span>
                  {editSekolah ? (
                    <input className={styles.inlineInput} value={tahunAjaran} onChange={(e) => setTahunAjaran(e.target.value)} />
                  ) : (
                    <span className={styles.fieldValue}>{tahunAjaran}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Notifikasi ── */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Notifikasi Sistem</div>
              <div className={styles.sectionDesc}>Atur notifikasi yang ingin diterima admin.</div>
              <div className={styles.toggleList}>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Login Baru</span>
                    <span className={styles.toggleDesc}>Notifikasi saat ada user yang login ke sistem</span>
                  </div>
                  <Toggle value={notifLogin} onChange={setNotifLogin} />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Perubahan Data User</span>
                    <span className={styles.toggleDesc}>Notifikasi saat data siswa atau guru diubah</span>
                  </div>
                  <Toggle value={notifUser} onChange={setNotifUser} />
                </div>
                <div className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>Generate Jadwal</span>
                    <span className={styles.toggleDesc}>Notifikasi saat jadwal berhasil digenerate</span>
                  </div>
                  <Toggle value={notifJadwal} onChange={setNotifJadwal} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal Ganti Password */}
      {showChangePass && (
        <div className={styles.modalOverlay} onClick={() => setShowChangePass(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Ganti Password</h3>
              <button className={styles.closeBtn} onClick={() => setShowChangePass(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {passDone ? (
              <div className={styles.successBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Password berhasil diganti!
              </div>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Password Lama</label>
                  <input className={styles.formInput} type="password" placeholder="••••••••" value={oldPass} onChange={(e) => setOldPass(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Password Baru</label>
                  <input className={styles.formInput} type="password" placeholder="Min. 8 karakter" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Konfirmasi Password Baru</label>
                  <input className={styles.formInput} type="password" placeholder="Ulangi password baru" value={confPass} onChange={(e) => setConfPass(e.target.value)} />
                </div>
                {passError && <p className={styles.formError}>{passError}</p>}
                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={() => setShowChangePass(false)}>Batal</button>
                  <button className={styles.submitBtn} onClick={handleChangePass}>Simpan</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Logout */}
      {showLogout && (
        <div className={styles.modalOverlay} onClick={() => setShowLogout(false)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
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