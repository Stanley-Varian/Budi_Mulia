"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./jadwal-guru.module.css";
import { useTranslation } from "@/lib/api/UseTranslation";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function authHeader(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type SlotApi = { jamKe: number; kelas: string; mapel: string };
type JadwalApi = Record<string, SlotApi[]>;
type SlotRow = { kelas: string; mapel: string } | "istirahat" | null;
type JadwalTable = Record<string, SlotRow[]>;

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
const ROW_TO_JAM: (number | null)[] = [1,2,3,4,null,5,6,7,8,null,9,10,11];
const JAM_WAKTU = ["06.45","07.30","08.15","09.00","","09.45","10.30","11.15","12.00","","12.45","13.30","14.15"];
const JAM_NO    = ["1","2","3","4","Istirahat","5","6","7","8","Istirahat","9","10","11"];

const WARNA_POOL = [
  { bg:"#dbeafe", text:"#1e40af" },
  { bg:"#d1fae5", text:"#065f46" },
  { bg:"#fce7f3", text:"#9d174d" },
  { bg:"#fef9c3", text:"#854d0e" },
  { bg:"#ede9fe", text:"#6d28d9" },
  { bg:"#ffedd5", text:"#9a3412" },
  { bg:"#dcfce7", text:"#166534" },
  { bg:"#fdf2f8", text:"#701a75" },
];

function buildKelasWarna(jadwalTable: JadwalTable): Record<string, { bg: string; text: string }> {
  const kelasList = new Set<string>();
  for (const hari of HARI) {
    for (const slot of jadwalTable[hari] ?? []) {
      if (slot && slot !== "istirahat") kelasList.add(slot.kelas);
    }
  }
  const result: Record<string, { bg: string; text: string }> = {};
  [...kelasList].forEach((kelas, i) => { result[kelas] = WARNA_POOL[i % WARNA_POOL.length]; });
  return result;
}

function apiToTable(data: JadwalApi): JadwalTable {
  const table: JadwalTable = {};
  for (const hari of HARI) {
    const slots = data[hari] ?? [];
    const byJam: Record<number, SlotApi> = {};
    for (const s of slots) byJam[s.jamKe] = s;
    table[hari] = ROW_TO_JAM.map((jamKe) => {
      if (jamKe === null) return "istirahat";
      const s = byJam[jamKe];
      if (!s) return null;
      return { kelas: s.kelas, mapel: s.mapel };
    });
  }
  return table;
}

function getHariIni() {
  return ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"][new Date().getDay()];
}

function hitungJamNgajar(hari: string, jadwalTable: JadwalTable): number {
  return jadwalTable[hari]?.filter(s => s && s !== "istirahat").length ?? 0;
}

export default function JadwalGuru() {
  const router = useRouter();
  const { t } = useTranslation();
  const hariIni = getHariIni();
  const [expanded, setExpanded]     = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [activeHari, setActiveHari] = useState(HARI.includes(hariIni) ? hariIni : "Senin");
  const [jadwalTable, setJadwalTable] = useState<JadwalTable>(() => {
    const empty: JadwalTable = {};
    for (const h of HARI) empty[h] = ROW_TO_JAM.map(j => j === null ? "istirahat" : null);
    return empty;
  });
  const [kelasWarna, setKelasWarna] = useState<Record<string, { bg: string; text: string }>>({});
  const [loading, setLoading]       = useState(true);
  const [namaGuru, setNamaGuru]     = useState("Guru");
  const [mapelGuru, setMapelGuru]   = useState("");

  useEffect(() => {
    const fetchJadwal = async () => {
      setLoading(true);
      try {
        const headers = authHeader();
        const profilRes = await fetch(`${BACKEND}/api/guru/profil`, { headers });
        const profilJson = await profilRes.json();
        if (profilJson.success) {
          setNamaGuru(profilJson.data.nama ?? "Guru");
          setMapelGuru(profilJson.data.mapel ?? "");
        }
        const res = await fetch(`${BACKEND}/api/guru/jadwal`, { headers });
        const json = await res.json();
        if (json.success) {
          const table = apiToTable(json.data as JadwalApi);
          setJadwalTable(table);
          setKelasWarna(buildKelasWarna(table));
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    };
    fetchJadwal();
  }, []);

  const NAV = [
    { label: t("nav.dashboard"),  href:"/dashboard/guru",            active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
    { label: t("nav.jadwal"),     href:"/dashboard/guru/jadwal",     active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { label: t("nav.pengumuman"), href:"/dashboard/guru/pengumuman", active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { label: t("nav.pengaturan"), href:"/dashboard/guru/settings",   active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
  ];

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
          {NAV.map((item, i) => (
            <a key={i} href={item.href} className={`${styles.navItem} ${item.active ? styles.navActive : ""}`} title={!expanded ? item.label : undefined}>
              <span className={styles.navIcon}>{item.icon}</span>
              {expanded && <span className={styles.navLabel}>{item.label}</span>}
            </a>
          ))}
          <button className={`${styles.navItem} ${styles.navLogout}`} onClick={() => setShowLogout(true)} title={!expanded ? t("nav.keluar") : undefined}>
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
          <div className={styles.topbarLeft}>
            <h1 className={styles.pageTitle}>{t("guru.jadwalMengajar")}</h1>
            {mapelGuru && <span className={styles.mapelTag}>{mapelGuru}</span>}
          </div>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>{namaGuru}</span>
              <span className={styles.userSub}>{mapelGuru ? `Guru ${mapelGuru}` : "Guru"}</span>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {loading ? (
            <p style={{ color:"#64748b", padding:"2rem", textAlign:"center" }}>{t("guru.memuatJadwal")}</p>
          ) : (
            <>
              <div className={styles.summaryRow}>
                {HARI.map((hari) => {
                  const jam = hitungJamNgajar(hari, jadwalTable);
                  const isToday = hari === hariIni;
                  const isActive = hari === activeHari;
                  return (
                    <button key={hari} className={`${styles.summaryCard} ${isActive ? styles.summaryCardActive : ""} ${isToday ? styles.summaryCardToday : ""}`} onClick={() => setActiveHari(hari)}>
                      <span className={styles.summaryHari}>
                        {hari}
                        {isToday && <span className={styles.todayDot} />}
                      </span>
                      <span className={styles.summaryJam}>{jam} jam</span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.thJam}>{t("guru.jam")}</th>
                      <th className={styles.thWaktu}>{t("guru.waktu")}</th>
                      {HARI.map((h) => (
                        <th key={h} className={`${styles.thHari} ${h === hariIni ? styles.thToday : ""} ${h === activeHari ? styles.thActive : ""}`}>
                          {h}
                          {h === hariIni && <span className={styles.todayBadge}>{t("guru.hariIni")}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {JAM_NO.map((label, ri) => {
                      const isIst = label === "Istirahat";
                      return (
                        <tr key={ri} className={isIst ? styles.trIst : styles.trNormal}>
                          <td className={styles.tdJam}>{isIst ? "" : label}</td>
                          <td className={styles.tdWaktu}>{isIst ? t("guru.istirahat") : JAM_WAKTU[ri]}</td>
                          {HARI.map((h) => {
                            if (isIst) return <td key={h} className={styles.tdIst}>{t("guru.istirahat")}</td>;
                            const cell = jadwalTable[h]?.[ri];
                            const isActive = h === activeHari;
                            if (!cell || cell === "istirahat") {
                              return <td key={h} className={`${styles.tdEmpty} ${isActive ? styles.tdActiveBg : ""}`}>—</td>;
                            }
                            const p = cell as { kelas: string; mapel: string };
                            const w = kelasWarna[p.kelas] ?? { bg:"#f1f5f9", text:"#475569" };
                            return (
                              <td key={h} className={`${styles.tdCell} ${isActive ? styles.tdActiveBg : ""}`}>
                                <div className={styles.chip} style={{ background: w.bg, color: w.text }}>
                                  <span className={styles.chipKelas}>{p.kelas}</span>
                                  <span className={styles.chipRuang}>{p.mapel}</span>
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

              {Object.keys(kelasWarna).length > 0 && (
                <div className={styles.legend}>
                  <span className={styles.legendTitle}>{t("guru.kelasYangDiajar")}</span>
                  <div className={styles.legendList}>
                    {Object.entries(kelasWarna).map(([kelas, w]) => (
                      <div key={kelas} className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ background: w.bg, border: `1.5px solid ${w.text}` }} />
                        <span>Kelas {kelas}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
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
            <p className={styles.modalDesc}>{t("logout.desc")} {namaGuru}.</p>
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