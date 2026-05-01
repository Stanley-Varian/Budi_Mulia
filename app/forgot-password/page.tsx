"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./forgot-password.module.css";

function BgBlobs() {
  return (
    <svg className={styles.bgSvg} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <path d="M-180 900 C-100 780, 60 820, 80 720 C100 620, -20 580, 40 480 C100 380, 220 400, 200 300 C180 200, 60 180, 100 80 C120 20, 0 0, -180 0 Z" fill="rgba(255,255,255,0.07)"/>
      <path d="M-120 900 C-40 800, 100 830, 130 730 C160 630, 30 590, 90 490 C150 390, 260 410, 240 310 C220 210, 100 190, 140 90 C160 30, 40 0, -120 0 Z" fill="rgba(255,255,255,0.05)"/>
      <path d="M0 900 C80 860, 160 800, 120 700 C80 600, -40 580, 20 460 C80 340, 220 360, 180 240 C140 140, 0 120, 0 0" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="60"/>
      <path d="M-60 900 C40 850, 140 790, 100 680 C60 570, -60 550, 0 430 C60 310, 200 330, 160 210 C120 110, -20 100, -20 0" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="50"/>
      <path d="M1620 0 C1540 120, 1380 80, 1360 180 C1340 280, 1460 320, 1400 420 C1340 520, 1220 500, 1240 600 C1260 700, 1380 720, 1340 820 C1320 880, 1440 900, 1620 900 Z" fill="rgba(255,255,255,0.07)"/>
      <path d="M1560 0 C1480 100, 1340 70, 1300 170 C1260 270, 1400 310, 1340 410 C1280 510, 1160 490, 1180 590 C1200 690, 1320 710, 1280 810 C1260 870, 1380 900, 1560 900 Z" fill="rgba(255,255,255,0.05)"/>
      <path d="M1440 0 C1360 40, 1280 100, 1320 200 C1360 300, 1480 320, 1420 440 C1360 560, 1220 540, 1260 660 C1300 760, 1440 780, 1440 900" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="60"/>
      <path d="M1500 0 C1420 50, 1320 110, 1360 220 C1400 330, 1520 350, 1460 470 C1400 590, 1260 570, 1300 690 C1340 790, 1480 810, 1480 900" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="50"/>
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username) { setError("Username wajib diisi."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Username tidak ditemukan."); setLoading(false); return; }
      setSent(true);
    } catch {
      setError("Terjadi kesalahan. Coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <BgBlobs />
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="#2952cc"/>
            <path d="M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="#4a72e8"/>
          </svg>
        </div>

        {!sent ? (
          <>
            <div className={styles.iconWrap}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 className={styles.title}>Lupa Password?</h2>
            <p className={styles.subtitle}>Masukkan username kamu. Admin sekolah akan mereset password kamu.</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input className={styles.inp} type="text" placeholder="USERNAME"
                  value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
              </div>
              {error && <p className={styles.errorMsg}>{error}</p>}
              <button className={styles.btnSubmit} type="submit" disabled={loading}>
                {loading ? "MENGIRIM..." : "KIRIM PERMINTAAN"}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.successWrap}>
            <div className={styles.successIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className={styles.title}>Permintaan Terkirim!</h2>
            <p className={styles.subtitle}>Hubungi admin sekolah untuk mendapatkan password baru kamu.</p>
          </div>
        )}

        <button className={styles.backBtn} onClick={() => router.push("/")}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}
