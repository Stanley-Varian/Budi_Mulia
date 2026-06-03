"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { login } from "@/lib/api/siswa";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === "admin") router.push("/dashboard/admin");
      else if (user.role === "guru") router.push("/dashboard/guru");
      else router.push("/dashboard/siswa");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan. Coba beberapa saat lagi.");
      }
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <BgBlobs />
      <div className={styles.card}>
        {/* Logo — ganti SVG dengan Image next/image + logo asli */}
        <div className={styles.logo}>
          <Image 
            src="/logo.png" 
            alt="Logo SMA Budi Mulia" 
            width={80} 
            height={80} 
            priority // Memastikan logo cepat dimuat
            style={{ objectFit: "contain" }} 
          />
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputWrap}>
            <input
              className={styles.inp}
              type="text"
              placeholder="USERNAME"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className={styles.inputWrap}>
            {/* Input Password (Gembok sudah dihapus) */}
            <input 
              className={styles.inp} 
              type={showPassword ? "text" : "password"} 
              placeholder="PASSWORD"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              autoComplete="current-password"
              style={{ 
                paddingRight: "40px", 
                paddingLeft: "14px" 
              }} 
            />

            {/* Tombol Show/Hide Password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%", 
                transform: "translateY(-50%)", 
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(100,116,139,0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                outline: "none"
              }}
              title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              )}
            </button>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button className={styles.btnLogin} type="submit" disabled={loading}>
            {loading ? "LOADING..." : "LOGIN"}
          </button>
        </form>

        <div className={styles.forgotWrapper}>
          <span className={styles.forgotIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <a className={styles.forgotLink} href="/forgot-password">
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}

function BgBlobs() {
  return (
    <svg
      className={styles.bgSvg}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blob kiri bawah — bentuk organik besar */}
      <path
        d="M-180 900 C-100 780, 60 820, 80 720 C100 620, -20 580, 40 480 C100 380, 220 400, 200 300 C180 200, 60 180, 100 80 C120 20, 0 0, -180 0 Z"
        fill="rgba(255,255,255,0.07)"
      />
      <path
        d="M-120 900 C-40 800, 100 830, 130 730 C160 630, 30 590, 90 490 C150 390, 260 410, 240 310 C220 210, 100 190, 140 90 C160 30, 40 0, -120 0 Z"
        fill="rgba(255,255,255,0.05)"
      />
      {/* Gelombang lengkung kiri bawah */}
      <path
        d="M0 900 C80 860, 160 800, 120 700 C80 600, -40 580, 20 460 C80 340, 220 360, 180 240 C140 140, 0 120, 0 0"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="60"
      />
      <path
        d="M-60 900 C40 850, 140 790, 100 680 C60 570, -60 550, 0 430 C60 310, 200 330, 160 210 C120 110, -20 100, -20 0"
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="50"
      />

      {/* Blob kanan atas — bentuk organik besar */}
      <path
        d="M1620 0 C1540 120, 1380 80, 1360 180 C1340 280, 1460 320, 1400 420 C1340 520, 1220 500, 1240 600 C1260 700, 1380 720, 1340 820 C1320 880, 1440 900, 1620 900 Z"
        fill="rgba(255,255,255,0.07)"
      />
      <path
        d="M1560 0 C1480 100, 1340 70, 1300 170 C1260 270, 1400 310, 1340 410 C1280 510, 1160 490, 1180 590 C1200 690, 1320 710, 1280 810 C1260 870, 1380 900, 1560 900 Z"
        fill="rgba(255,255,255,0.05)"
      />
      {/* Gelombang lengkung kanan atas */}
      <path
        d="M1440 0 C1360 40, 1280 100, 1320 200 C1360 300, 1480 320, 1420 440 C1360 560, 1220 540, 1260 660 C1300 760, 1440 780, 1440 900"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="60"
      />
      <path
        d="M1500 0 C1420 50, 1320 110, 1360 220 C1400 330, 1520 350, 1460 470 C1400 590, 1260 570, 1300 690 C1340 790, 1480 810, 1480 900"
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="50"
      />
    </svg>
  );
}
