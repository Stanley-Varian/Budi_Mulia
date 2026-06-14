"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./pengumuman.module.css";
import { getPengumuman, getUser } from "@/lib/api/siswa";
import { useTranslation } from "@/lib/api/UseTranslation";
import NotifBell from "@/components/NotifBell";
import { useNotif } from "@/lib/api/useNotif";

type Pengumuman = { id: string; judul: string; isi: string; penulis: string; tanggal: string; tag: string; penting: boolean; };

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Umum: { bg: "#dbeafe", text: "#1e40af" }, Akademik: { bg: "#f0fdf4", text: "#14532d" },
  Matematika: { bg: "#dbeafe", text: "#1e40af" }, Fisika: { bg: "#fef9c3", text: "#854d0e" },
  Kimia: { bg: "#ede9fe", text: "#6d28d9" }, Biologi: { bg: "#ffedd5", text: "#9a3412" },
  Sejarah: { bg: "#f0fdf4", text: "#14532d" }, Ekonomi: { bg: "#fdf2f8", text: "#701a75" },
  "B. Indo": { bg: "#fce7f3", text: "#9d174d" }, "B. Ing": { bg: "#d1fae5", text: "#065f46" },
  OSIS: { bg: "#fef9c3", text: "#854d0e" }, default: { bg: "#f1f5f9", text: "#475569" },
};
function getTagColor(tag: string) { return TAG_COLORS[tag] ?? TAG_COLORS.default; }

function formatTanggal(iso: string): string {
  const date = new Date(iso);
  const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  if (diff < 7) return `${diff} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
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

const NAV_KEYS = ["dashboard","jadwal","pengumuman","pengaturan"] as const;
const NAV_HREFS = ["/dashboard/siswa","/dashboard/siswa/jadwal","/dashboard/siswa/pengumuman","/dashboard/siswa/settings"];
const NAV_ACTIVE = [false,false,true,false];

export default function PengumumanSiswa() {
  const { t } = useTranslation();
  const { unreadCount } = useNotif();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [selected, setSelected] = useState<Pengumuman | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [list, setList] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<{ nama: string; kelas: string } | null>(null);

  const NAV_ICONS = [
    <svg key="d" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
    <svg key="j" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    <NavNotifIcon key="p" unreadCount={unreadCount} />,
    <svg key="s" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ];

  useEffect(() => { setUser(getUser()); }, []);

  useEffect(() => {
    getPengumuman()
      .then((data) => setList(data.list.map((p: { id: string; judul: string; isi: string; penulis: string; tanggal: string; tag: string; penting: boolean }) => ({ ...p, tanggal: formatTanggal(p.tanggal) }))))
      .catch((err) => setError(err.message || t("state.gagal")))
      .finally(() => setLoading(false));
  }, []);

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
          <button className={`${styles.navItem} ${styles.navLogout}`} onClick={() => setShowLogout(true)} style={{ marginTop: "auto" }} title={!expanded ? t("nav.keluar") : undefined}>
            <span className={styles.navIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg></span>
            {expanded && <span className={styles.navLabel}>{t("nav.keluar")}</span>}
          </button>
        </nav>
      </aside>
      {expanded && (
        <div className={styles.overlay} onClick={() => setExpanded(false)} />
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
          {loading ? (
            <div className={styles.loadingWrap}><span className={styles.loadingSpinner}/><span className={styles.loadingText}>{t("pengumuman.memuat")}</span></div>
          ) : error ? (
            <div className={styles.errorWrap}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>{error}</div>
          ) : list.length === 0 ? (
            <div className={styles.emptyWrap}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span>{t("pengumuman.belumAda")}</span></div>
          ) : (
            <div className={styles.list}>
              {list.map((item) => {
                const { bg, text } = getTagColor(item.tag);
                return (
                  <div key={item.id} className={`${styles.card} ${item.penting ? styles.cardPenting : ""}`} onClick={() => setSelected(item)}>
                    <div className={styles.cardMain}>
                      {item.penting && <span className={styles.pentingBadge}><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>{t("pengumuman.penting")}</span>}
                      <div className={styles.cardTitle}>{item.judul}</div>
                      <div className={styles.cardIsi}>{item.isi}</div>
                    </div>
                    <div className={styles.cardMeta}>
                      <div className={styles.cardMetaLeft}>
                        <span className={styles.tagChip} style={{ background: bg, color: text }}>{item.tag}</span>
                        <span className={styles.penulis}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{item.penulis}</span>
                      </div>
                      <span className={styles.tanggal}>{item.tanggal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selected && (() => {
        const { bg, text } = getTagColor(selected.tag);
        return (
          <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTags}>
                  <span className={styles.tagChip} style={{ background: bg, color: text }}>{selected.tag}</span>
                  {selected.penting && <span className={styles.pentingBadge}><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>{t("pengumuman.penting")}</span>}
                </div>
                <button className={styles.closeBtn} onClick={() => setSelected(null)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <h2 className={styles.modalTitle}>{selected.judul}</h2>
              <div className={styles.modalMeta}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{selected.penulis} · {selected.tanggal}</div>
              <p className={styles.modalIsi}>{selected.isi}</p>
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
