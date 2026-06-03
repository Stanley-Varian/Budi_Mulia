"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./forgot-password.module.css";
import Image from "next/image";

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
      <div className={styles.card}>
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