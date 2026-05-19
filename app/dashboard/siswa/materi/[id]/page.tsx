"use client";

import { useState, useEffect } from "react"; // CHANGED
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

type DataMapel = {
  mapel: string;
  guru: string;
  warna: string;
  list: Materi[];
};

export default function MateriSiswa({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [filterPertemuan, setFilterPertemuan] = useState<number | "semua">("semua");

  // 🔥 CHANGED: state buat data dari backend
  const [data, setData] = useState<DataMapel | null>(null);

  // 🔥 CHANGED: fetch dari backend
  useEffect(() => {
    const fetchMateri = async () => {
      try {
        const res = await fetch(
          `/api/materi?mapelId=${params.id}`
        );

        const json = await res.json();

        setData(json);
      } catch (err) {
        console.error("Gagal fetch materi:", err);
      }
    };

    fetchMateri();
  }, [params.id]);

  // Kalau belum ada data (loading state)
  if (!data) {
    return (
      <div style={{ padding: 20, fontFamily: "Poppins" }}>
        Loading materi...
      </div>
    );
  }

  const pertemuanList = [...new Set(data.list.map((m) => m.pertemuan))].sort(
    (a, b) => a - b
  );

  const filtered =
    filterPertemuan === "semua"
      ? data.list
      : data.list.filter((m) => m.pertemuan === filterPertemuan);

  return (
    <div className={styles.layout}>
      {/* ─────── SEMUA UI LO TETEP ─────── */}

      <aside
        className={`${styles.sidebar} ${expanded ? styles.sidebarExpanded : ""}`}
      >
        <button
          className={styles.hamburger}
          onClick={() => setExpanded(!expanded)}
        >
          ...
        </button>

        <nav className={styles.nav}>
          {/* NAV TETEP */}
        </nav>
      </aside>

      <div className={`${styles.main} ${expanded ? styles.mainShifted : ""}`}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.backBtn}
              onClick={() => router.push("/dashboard/siswa")}
            >
              ←
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
        </header>

        {/* CONTENT */}
        <div className={styles.content}>
          <div className={styles.filterRow}>
            <button onClick={() => setFilterPertemuan("semua")}>
              Semua
            </button>

            {pertemuanList.map((p) => (
              <button
                key={p}
                onClick={() => setFilterPertemuan(p)}
              >
                Pertemuan {p}
              </button>
            ))}
          </div>

          <div className={styles.materiList}>
            {filtered.map((item) => (
              <div key={item.id} className={styles.materiCard}>
                <div className={styles.materiBody}>
                  <div>{item.judul}</div>
                  <div>{item.deskripsi}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* logout tetap */}
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