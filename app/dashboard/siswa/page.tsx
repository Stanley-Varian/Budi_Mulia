"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard-siswa.module.css";
import { joinKelas, getMapelList, getUser } from "@/lib/api/siswa";
import { useTranslation } from "@/lib/api/UseTranslation";
import NotifBell from "@/components/NotifBell";
import { useNotif } from "@/lib/api/useNotif";

type Mapel = { id: string | number; mapel: string; guru: string; updatedAt: string; };

function MapelIcon({ icon }: { icon: string }) {
  const n = icon.toLowerCase();
  if (n.includes("mat")) return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><line x1="12" y1="5" x2="12" y2="19"/><circle cx="12" cy="12" r="9"/></svg>;
  if (n.includes("indo")||n.includes("ingg")||n.includes("bhs")||n.includes("bah")) return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
  if (n.includes("fis")) return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/></svg>;
  if (n.includes("kim")) return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6l1 9H8L9 3z"/><path d="M8 12l-4 8h16l-4-8"/></svg>;
  if (n.includes("bio")) return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 19.67L2 21l1-2C4.53 15.67 8 9 17 8z"/><path d="M6 21c0-3.5 2-6 6-9"/></svg>;
  if (n.includes("sej")||n.includes("his")) return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  if (n.includes("eko")||n.includes("aku")) return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}

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
const NAV_ACTIVE = [true, false, false, false];

export default function DashboardSiswa() {
  const { t } = useTranslation();
  const router = useRouter();
  const { unreadCount } = useNotif();
  const [user, setUser] = useState<{ nama: string; kelas: string } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [showLogout, setShowLogout] = useState(false);
  const [mapelList, setMapelList] = useState<Mapel[]>([]);
  const [mapelLoading, setMapelLoading] = useState(true);
  const [mapelError, setMapelError] = useState<string | null>(null);
  const [showJoin, setShowJoin] = useState(false);
  const [kodeInput, setKodeInput] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  useEffect(() => { setUser(getUser()); }, []);
  useEffect(() => {
    getMapelList()
      .then((data) => setMapelList(data))
      .catch((err) => setMapelError(err.message || t("state.gagal")))
      .finally(() => setMapelLoading(false));
  }, []);

  const NAV_ICONS = [
    <svg key="d" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
    <svg key="j" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    <NavNotifIcon key="p" unreadCount={unreadCount} />,
    <svg key="s" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ];

  const handleJoinKelas = async () => {
    if (!kodeInput.trim()) { setJoinError("Kode kelas tidak boleh kosong."); return; }
    setJoinLoading(true); setJoinError(null); setJoinSuccess(null);
    try {
      const kelas = await joinKelas(kodeInput);
      setJoinSuccess(`Berhasil bergabung ke kelas ${kelas.nama || kelas.mapel}!`);
      setKodeInput("");
      getMapelList().then((data) => setMapelList(data)).catch(() => null);
    } catch (err: unknown) {
      setJoinError(err instanceof Error ? err.message : "Gagal bergabung. Coba lagi.");
    } finally { setJoinLoading(false); }
  };

  const handleCloseJoin = () => { setShowJoin(false); setKodeInput(""); setJoinError(null); setJoinSuccess(null); };
  const TABS = [t("tabs.baru"), t("tabs.terbaru"), t("tabs.mingguIni"), t("tabs.bulanIni")];

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${expanded ? styles.sidebarExpanded : ""}`}>
        <button className={styles.hamburger} onClick={() => setExpanded(!expanded)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          {expanded && <span className={styles.brandName}>{t("brand")}</span>}
        </button>
        <nav className={styles.nav}>
          {NAV_KEYS.map((key, i) => (
            <a key={key} href={NAV_HREFS[i]} className={`${styles.navItem} ${NAV_ACTIVE[i] ? styles.navActive : ""}`} title={!expanded ? t(`nav.${key}`) : undefined}>
              <span className={styles.navIcon}>{NAV_ICONS[i]}</span>
              {expanded && <span className={styles.navLabel}>{t(`nav.${key}`)}</span>}
            </a>
          ))}
          <button className={`${styles.navItem} ${styles.navLogout}`} onClick={() => setShowLogout(true)} title={!expanded ? t("nav.keluar") : undefined}>
            <span className={styles.navIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
            {expanded && <span className={styles.navLabel}>{t("nav.keluar")}</span>}
          </button>
        </nav>
      </aside>
      {expanded && <div className={styles.overlay} onClick={() => setExpanded(false)} />}

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

      {showJoin && (
        <div className={styles.modalOverlay} onClick={handleCloseJoin}>
          <div className={styles.joinModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.joinModalHeader}>
              <div className={styles.joinModalIconWrap}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg></div>
              <div>
                <h3 className={styles.joinModalTitle}>{t("joinModal.title")}</h3>
                <p className={styles.joinModalSubtitle}>{t("joinModal.subtitle")}</p>
              </div>
              <button className={styles.joinModalClose} onClick={handleCloseJoin}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className={styles.joinModalBody}>
              <div className={styles.joinHint}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2952cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>{t("joinModal.hint")}</span></div>
              <div className={styles.joinInputWrap}>
                <label className={styles.joinLabel}>{t("joinModal.label")}</label>
                <input className={`${styles.joinInput} ${joinError ? styles.joinInputError : ""} ${joinSuccess ? styles.joinInputSuccess : ""}`} type="text" placeholder={t("joinModal.placeholder")} value={kodeInput} onChange={(e) => { setKodeInput(e.target.value.toUpperCase()); setJoinError(null); setJoinSuccess(null); }} onKeyDown={(e) => e.key === "Enter" && !joinLoading && handleJoinKelas()} maxLength={20} autoFocus disabled={joinLoading || !!joinSuccess}/>
                {joinError && <div className={styles.joinFeedbackError}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/></svg>{joinError}</div>}
                {joinSuccess && <div className={styles.joinFeedbackSuccess}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{joinSuccess}</div>}
              </div>
              {!joinSuccess ? (
                <div className={styles.joinActions}>
                  <button className={styles.cancelBtn} onClick={handleCloseJoin} disabled={joinLoading}>{t("joinModal.batal")}</button>
                  <button className={styles.joinBtn} onClick={handleJoinKelas} disabled={joinLoading || !kodeInput.trim()}>
                    {joinLoading ? <span className={styles.joinSpinner}/> : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    {joinLoading ? t("joinModal.memproses") : t("joinModal.gabung")}
                  </button>
                </div>
              ) : (
                <button className={styles.joinBtn} style={{ width: "100%" }} onClick={handleCloseJoin}>{t("joinModal.tutup")}</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`${styles.main} ${expanded ? styles.mainShifted : ""}`}>
        <header className={styles.topbar}>
          <div className={styles.tabs}>
            {TABS.map((tab, i) => (
              <button key={i} className={`${styles.tab} ${activeTab === i ? styles.tabActive : ""}`} onClick={() => setActiveTab(i)}>
                {activeTab === i && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                {tab}
              </button>
            ))}
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
          {mapelLoading ? (
            <div className={styles.loadingWrap}><span className={styles.loadingSpinner}/><span className={styles.loadingText}>{t("state.memuat")}</span></div>
          ) : mapelError ? (
            <div className={styles.errorWrap}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg><span>{mapelError}</span></div>
          ) : (
            <div className={styles.grid}>
              {mapelList.map((mapel) => (
                <a key={mapel.id} href={`/dashboard/siswa/materi/${encodeURIComponent(mapel.mapel)}`} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardIconWrap}><MapelIcon icon={mapel.mapel} /></div>
                    <div className={styles.cardActions}>
                      <button className={styles.cardBtn} onClick={(e) => e.preventDefault()}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>
                      <button className={styles.cardBtn} onClick={(e) => e.preventDefault()}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></button>
                    </div>
                  </div>
                  <div className={styles.cardBottom}>
                    <span className={styles.cardName}>{mapel.mapel}</span>
                    <span className={styles.cardUpdated}>{mapel.guru}</span>
                  </div>
                </a>
              ))}
              <button className={styles.cardJoin} onClick={() => setShowJoin(true)}>
                <div className={styles.cardJoinInner}>
                  <div className={styles.cardJoinIconWrap}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2952cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg></div>
                  <span className={styles.cardJoinLabel}>{t("dashboard.gabungKelas")}</span>
                  <span className={styles.cardJoinSub}>{t("dashboard.gabungKelasSub")}</span>
                </div>
                <div className={styles.cardJoinPlus}>+</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}