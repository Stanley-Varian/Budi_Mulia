"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";
import { getProfil, getUser } from "@/lib/api/siswa";
import { useTranslation } from "@/lib/api/UseTranslation";
import NotifBell from "@/components/NotifBell";
import { useNotif } from "@/lib/api/useNotif";

type Profil = {
  nama: string;
  username: string;
  nisn: string;
  kelas: string;
  role: string;
};

const NAV_KEYS = ["dashboard", "jadwal", "pengumuman", "pengaturan"] as const;
const NAV_HREFS = ["/dashboard/siswa", "/dashboard/siswa/jadwal", "/dashboard/siswa/pengumuman", "/dashboard/siswa/settings"];
const NAV_ACTIVE = [false, false, false, true];

function NavNotifIcon({ unreadCount }: { unreadCount: number }) {
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      {unreadCount > 0 && (
        <span style={{
          position: "absolute", top: -4, right: -4, minWidth: 14, height: 14,
          borderRadius: 99, background: "#ef4444", color: "white", fontSize: 8,
          fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 3px", border: "1.5px solid white", lineHeight: 1,
        }}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </span>
  );
}

export default function SettingsSiswa() {
  const { t, lang, changeLang } = useTranslation();
  const { unreadCount } = useNotif();
  const [expanded, setExpanded] = useState(false);
  const [notifPengumuman, setNotifPengumuman] = useState(true);
  const [notifMateri, setNotifMateri] = useState(true);
  const [notifJadwal, setNotifJadwal] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const router = useRouter();

  const [profil, setProfil] = useState<Profil | null>(null);
  const [userLocal, setUserLocal] = useState<Profil | null>(null);
  const [profilLoading, setProfilLoading] = useState(true);

  const NAV_ICONS = [
    <svg key="d" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
    <svg key="j" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    <NavNotifIcon key="p" unreadCount={unreadCount} />,
    <svg key="s" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ];

  useEffect(() => {
    const u = getUser();
    setUserLocal(u);
    getProfil()
      .then((data) => setProfil(data))
      .catch(() => {
        if (u) setProfil({ ...u, role: "siswa" } as Profil);
      })
      .finally(() => setProfilLoading(false));
  }, []);

  const nama     = profil?.nama     ?? userLocal?.nama     ?? "—";
  const kelas    = profil?.kelas    ?? userLocal?.kelas    ?? "—";
  const username = profil?.username ?? userLocal?.username ?? "—";
  const nisn     = profil?.nisn     ?? "—";

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${expanded ? styles.sidebarExpanded : ""}`}>
        <button className={styles.hamburger} onClick={() => setExpanded(!expanded)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          {expanded && <span className={styles.brandName}>{t("brand")}</span>}
        </button>
        <nav className={styles.nav}>
          {NAV_KEYS.map((key, i) => (
            <a key={key} href={NAV_HREFS[i]} className={`${styles.navItem} ${NAV_ACTIVE[i] ? styles.navActive : ""}`} title={!expanded ? t(`nav.${key}`) : undefined}>
              <span className={styles.navIcon}>{NAV_ICONS[i]}</span>
              {expanded && <span className={styles.navLabel}>{t(`nav.${key}`)}</span>}
            </a>
          ))}
          <button className={`${styles.navItem} ${styles.navLogout}`} onClick={() => setShowLogout(true)} title={!expanded ? t("nav.keluar") : undefined} style={{ marginTop: "auto" }}>
            <span className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {expanded && <span className={styles.navLabel}>{t("nav.keluar")}</span>}
          </button>
        </nav>
      </aside>
      {expanded && <div className={styles.overlay} onClick={() => setExpanded(false)} />}

      <div className={`${styles.main} ${expanded ? styles.mainShifted : ""}`}>
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>{t("settings.title")}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <NotifBell />
            <div className={styles.userChip}>
              <div className={styles.userAvatar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className={styles.userText}>
                <span className={styles.userName}>{nama}</span>
                <span className={styles.userSub}>{t("user.kelas")}: {kelas}</span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.sections}>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>{t("settings.profil")}</div>
              <div className={styles.sectionDesc}>{t("settings.profilDesc")}</div>
              <div className={styles.profileCard}>
                <div className={styles.avatarWrap}>
                  <div className={styles.avatar}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className={styles.avatarInfo}>
                    <div className={styles.avatarName}>
                      {profilLoading ? <span className={styles.skeleton} style={{ width: 140, height: 16, display: "inline-block" }}/> : nama}
                    </div>
                    <div className={styles.avatarRole}>{t("settings.siswa")} · {t("settings.kelas")} {kelas}</div>
                  </div>
                </div>
              </div>
              <div className={styles.fieldGroup}>
                {([
                  { label: t("settings.namaLengkap"), value: nama },
                  { label: t("settings.nisn"),        value: nisn },
                  { label: t("settings.kelas"),       value: kelas },
                  { label: t("settings.username"),    value: username },
                ] as { label: string; value: string }[]).map(({ label, value }) => (
                  <div key={label} className={styles.field}>
                    <span className={styles.fieldLabel}>{label}</span>
                    <span className={styles.fieldValue}>
                      {profilLoading ? <span className={styles.skeleton} style={{ width: 120, height: 14, display: "inline-block" }}/> : value}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.infoNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {t("settings.infoNote")}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>{t("settings.notifikasi")}</div>
              <div className={styles.sectionDesc}>{t("settings.notifikasiDesc")}</div>
              <div className={styles.toggleList}>
                {([
                  { label: t("settings.notifPengumuman"), desc: t("settings.notifPengumumanDesc"), val: notifPengumuman, set: setNotifPengumuman },
                  { label: t("settings.notifMateri"),     desc: t("settings.notifMateriDesc"),     val: notifMateri,     set: setNotifMateri },
                  { label: t("settings.notifJadwal"),     desc: t("settings.notifJadwalDesc"),     val: notifJadwal,     set: setNotifJadwal },
                ] as { label: string; desc: string; val: boolean; set: (v: boolean) => void }[]).map(({ label, desc, val, set }) => (
                  <div key={label} className={styles.toggleRow}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>{label}</span>
                      <span className={styles.toggleDesc}>{desc}</span>
                    </div>
                    <Toggle value={val} onChange={set} />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>{t("settings.bahasa")}</div>
              <div className={styles.sectionDesc}>{t("settings.bahasaDesc")}</div>
              <div className={styles.bahasaGroup}>
                {[
                  { val: "id" as const, label: "Bahasa Indonesia", flag: "🇮🇩" },
                  { val: "en" as const, label: "English",          flag: "🇬🇧" },
                ].map((b) => (
                  <button key={b.val} className={`${styles.bahasaBtn} ${lang === b.val ? styles.bahasaBtnActive : ""}`} onClick={() => changeLang(b.val)}>
                    <span className={styles.bahasaFlag}>{b.flag}</span>
                    <span>{b.label}</span>
                    {lang === b.val && (
                      <svg className={styles.bahasaCheck} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
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
        <div className={styles.modalOverlay} onClick={() => setShowLogout(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <h3 className={styles.modalTitle}>{t("logout.title")}</h3>
            <p className={styles.modalDesc}>{t("logout.desc")} {nama}.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowLogout(false)}>{t("logout.batal")}</button>
              <button className={styles.confirmBtn} onClick={() => router.push("/")}>{t("logout.konfirmasi")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className={`${styles.toggle} ${value ? styles.toggleOn : ""}`} onClick={() => onChange(!value)} role="switch" aria-checked={value}>
      <span className={styles.toggleThumb} />
    </button>
  );
}