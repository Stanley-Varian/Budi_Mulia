"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./materi-siswa.module.css";
import { getMateriByMapel, getUser } from "@/lib/api/siswa";
import { useTranslation } from "@/lib/api/UseTranslation";
import NotifBell from "@/components/NotifBell";
import { useNotif } from "@/lib/api/useNotif";

type Materi = {
  id: string;
  judul: string;
  deskripsi: string;
  tipe: "pdf" | "video" | "doc" | "link";
  url: string;
  ukuran?: string;
  tanggal: string;
  pertemuan: number;
};
type DataMapel = { mapel: string; guru: string; kelas: string; list: Materi[]; };

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

const NAV_KEYS = ["dashboard", "jadwal", "pengumuman", "pengaturan"] as const;
const NAV_HREFS = ["/dashboard/siswa", "/dashboard/siswa/jadwal", "/dashboard/siswa/pengumuman", "/dashboard/siswa/settings"];

export default function MateriSiswa({ params }: { params: { id: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { unreadCount } = useNotif();
  const [user, setUser] = useState<{ nama: string; kelas: string } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [filterPertemuan, setFilterPertemuan] = useState<number | "semua">("semua");
  const [data, setData] = useState<DataMapel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const NAV_ICONS = [
    <svg key="d" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
    <svg key="j" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    <NavNotifIcon key="p" unreadCount={unreadCount} />,
    <svg key="s" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ];

  useEffect(() => { setUser(getUser()); }, []);

  useEffect(() => {
    getMateriByMapel(decodeURIComponent(params.id))
      .then((d) => setData(d))
      .catch((err) => setError(err.message || t("state.gagal")))
      .finally(() => setLoading(false));
  }, [params.id]);

  const pertemuanList = data ? [...new Set(data.list.map((m) => m.pertemuan))].sort((a, b) => a - b) : [];
  const filtered = !data ? [] : filterPertemuan === "semua" ? data.list : data.list.filter((m) => m.pertemuan === filterPertemuan);

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${expanded ? styles.sidebarExpanded : ""}`}>
        <button className={styles.hamburger} onClick={() => setExpanded(!expanded)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          {expanded && <span className={styles.brandName}>{t("brand")}</span>}
        </button>
        <nav className={styles.nav}>
          {NAV_KEYS.map((key, i) => (
            <a key={key} href={NAV_HREFS[i]} className={styles.navItem} title={!expanded ? t(`nav.${key}`) : undefined}>
              <span className={styles.navIcon}>{NAV_ICONS[i]}</span>
              {expanded && <span className={styles.navLabel}>{t(`nav.${key}`)}</span>}
            </a>
          ))}
          <button className={`${styles.navItem} ${styles.navLogout}`} onClick={() => setShowLogout(true)} style={{ marginTop: "auto" }} title={!expanded ? t("nav.keluar") : undefined}>
            <span className={styles.navIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
            {expanded && <span className={styles.navLabel}>{t("nav.keluar")}</span>}
          </button>
        </nav>
      </aside>
      {expanded && <div className={styles.overlay} onClick={() => setExpanded(false)} />}

      <div className={`${styles.main} ${expanded ? styles.mainShifted : ""}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.backBtn} onClick={() => router.push("/dashboard/siswa")}>←</button>
            {data && (
              <div className={styles.mapelInfo}>
                <h1 className={styles.pageTitle}>{data.mapel}</h1>
                <span className={styles.guruTag}>{data.guru}</span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <NotifBell />
            <div className={styles.userChip}>
              <div className={styles.userAvatar}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
              <div className={styles.userText}>
                <span className={styles.userName}>{user?.nama ?? "—"}</span>
                <span className={styles.userSub}>{t("user.kelas")}: {user?.kelas ?? "—"}</span>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {loading && <div className={styles.loadingWrap}><span className={styles.loadingSpinner}/><span className={styles.loadingText}>{t("materi.loading")}</span></div>}
          {!loading && error && <div className={styles.errorWrap}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>{error}</div>}
          {!loading && data && (
            <>
              <div className={styles.filterRow}>
                <button className={`${styles.filterBtn} ${filterPertemuan === "semua" ? styles.filterBtnActive : ""}`} onClick={() => setFilterPertemuan("semua")}>{t("materi.semua")}</button>
                {pertemuanList.map((p) => (
                  <button key={p} className={`${styles.filterBtn} ${filterPertemuan === p ? styles.filterBtnActive : ""}`} onClick={() => setFilterPertemuan(p)}>
                    {t("materi.pertemuan")} {p}
                  </button>
                ))}
              </div>
              {filtered.length === 0 ? (
                <div className={styles.emptyWrap}>{t("materi.belumAda")}</div>
              ) : (
                <div className={styles.materiList}>
                  {filtered.map((item) => (
                    <div key={item.id} className={styles.materiCard}>
                      <div className={styles.materiIcon}>
                        {item.tipe === "pdf" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                        {item.tipe === "video" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>}
                        {item.tipe === "link" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
                        {item.tipe === "doc" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
                      </div>
                      <div className={styles.materiBody}>
                        <div className={styles.materiJudul}>{item.judul}</div>
                        {item.deskripsi && <div className={styles.materiDesc}>{item.deskripsi}</div>}
                        <div className={styles.materiMeta}>
                          <span>{t("materi.pertemuan")} {item.pertemuan}</span>
                          {item.ukuran && <span>{item.ukuran}</span>}
                          <span>{new Date(item.tanggal).toLocaleDateString("id-ID")}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          {item.tipe === "link" ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 4,
                                fontSize: 12, fontWeight: 500, color: "#4f46e5",
                                background: "#eef2ff", borderRadius: 6,
                                padding: "5px 10px", textDecoration: "none",
                              }}>
                            
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                              Buka Link
                            </a>
                          ) : (
                            <>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 4,
                                  fontSize: 12, fontWeight: 500, color: "#4f46e5",
                                  background: "#eef2ff", borderRadius: 6,
                                  padding: "5px 10px", textDecoration: "none",
                                }}
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                Lihat
                              </a>
                              <a
                                href={item.url}
                                download
                                style={{
                                  display: "inline-flex", alignItems: "center", gap: 4,
                                  fontSize: 12, fontWeight: 500, color: "#059669",
                                  background: "#ecfdf5", borderRadius: 6,
                                  padding: "5px 10px", textDecoration: "none",
                                }}
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Download
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showLogout && (
        <div className={styles.modalOverlay} onClick={() => setShowLogout(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></div>
            <h3 className={styles.modalTitle}>{t("logout.title")}</h3>
            <p className={styles.modalDesc}>{t("logout.desc")} {user?.nama ?? ""}.</p>
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