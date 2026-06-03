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
      <div className={styles.card}>
        {/* Logo Sekolah */}
        <div className={styles.logo}>
          <Image 
            src="/logo.png" 
            alt="Logo SMA Budi Mulia" 
            width={80} 
            height={80} 
            priority
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

        <div className={styles.forgotWrap}>
          <span className={styles.forgotIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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