"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { login } from "@/lib/api/siswa";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="#2952cc" />
            <path
              d="M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"
              fill="#4a72e8"
            />
          </svg>
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
            <input
              className={styles.inp}
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button className={styles.btnLogin} type="submit" disabled={loading}>
            {loading ? "LOADING..." : "LOGIN"}
          </button>
        </form>

        <div className={styles.forgotWrap}>
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
