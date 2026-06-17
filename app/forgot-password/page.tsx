"use client";

import { useState, useRef } from "react";
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

// ── Komponen OTP Input (6 kotak) ─────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const arr = value.padEnd(6, " ").split("");
    arr[i] = v.slice(-1) || " ";
    const next = arr.join("").replace(/ /g, "");
    onChange(arr.join("").replace(/ +$/, ""));
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted); refs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className={styles.otpWrap}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className={styles.otpBox}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type Step = "email" | "otp" | "password" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1
  const [email, setEmail] = useState("");
  // Step 2
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  // Step 3
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // ── Step 1: Kirim OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Email wajib diisi."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Terjadi kesalahan."); return; }
      setStep("otp");
    } catch {
      setError("Terjadi kesalahan. Coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verif OTP ───────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) { setError("Masukkan 6 digit OTP."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "OTP salah."); return; }
      setResetToken(data.resetToken);
      setStep("password");
    } catch {
      setError("Terjadi kesalahan. Coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ──────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { setError("Password minimal 6 karakter."); return; }
    if (newPassword !== confirmPassword) { setError("Konfirmasi password tidak cocok."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Gagal reset password."); return; }
      setStep("done");
    } catch {
      setError("Terjadi kesalahan. Coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  const stepNumber = step === "email" ? 1 : step === "otp" ? 2 : step === "password" ? 3 : 3;

  return (
    <div className={styles.page}>
      <BgBlobs />
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logo}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3Z" fill="#2952cc"/>
            <path d="M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="#4a72e8"/>
          </svg>
        </div>

        {/* Step indicator */}
        {step !== "done" && (
          <div className={styles.stepIndicator}>
            {[1, 2, 3].map((s) => (
              <div key={s} className={styles.stepItem}>
                <div className={`${styles.stepDot} ${stepNumber >= s ? styles.stepDotActive : ""}`}>
                  {stepNumber > s ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : s}
                </div>
                {s < 3 && <div className={`${styles.stepLine} ${stepNumber > s ? styles.stepLineActive : ""}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1: Input Email ────────────────────────────────────────────── */}
        {step === "email" && (
          <>
            <div className={styles.iconWrap}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 className={styles.title}>Lupa Password?</h2>
            <p className={styles.subtitle}>Masukkan email kamu. Kami akan mengirimkan kode OTP untuk reset password.</p>
            <form className={styles.form} onSubmit={handleSendOtp}>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input className={styles.inp} type="email" placeholder="EMAIL KAMU"
                  value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              {error && <p className={styles.errorMsg}>{error}</p>}
              <button className={styles.btnSubmit} type="submit" disabled={loading}>
                {loading ? "MENGIRIM OTP..." : "KIRIM OTP"}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2: Verif OTP ─────────────────────────────────────────────── */}
        {step === "otp" && (
          <>
            <div className={styles.iconWrap}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 className={styles.title}>Cek Email Kamu</h2>
            <p className={styles.subtitle}>
              Kode OTP sudah dikirim ke<br />
              <strong style={{ color: "white" }}>{email}</strong><br />
              Berlaku selama 10 menit.
            </p>
            <form className={styles.form} onSubmit={handleVerifyOtp}>
              <OtpInput value={otp} onChange={setOtp} />
              {error && <p className={styles.errorMsg}>{error}</p>}
              <button className={styles.btnSubmit} type="submit" disabled={loading || otp.length < 6}>
                {loading ? "MEMVERIFIKASI..." : "VERIFIKASI OTP"}
              </button>
            </form>
            <button className={styles.resendBtn} onClick={() => { setStep("email"); setOtp(""); setError(""); }}>
              Tidak terima email? Kirim ulang
            </button>
          </>
        )}

        {/* ── Step 3: Password Baru ─────────────────────────────────────────── */}
        {step === "password" && (
          <>
            <div className={styles.iconWrap}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h2 className={styles.title}>Password Baru</h2>
            <p className={styles.subtitle}>Buat password baru yang kuat untuk akunmu.</p>
            <form className={styles.form} onSubmit={handleResetPassword}>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input className={styles.inp} type={showPass ? "text" : "password"} placeholder="PASSWORD BARU"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input className={styles.inp} type={showPass ? "text" : "password"} placeholder="KONFIRMASI PASSWORD"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              {error && <p className={styles.errorMsg}>{error}</p>}
              <button className={styles.btnSubmit} type="submit" disabled={loading}>
                {loading ? "MENYIMPAN..." : "SIMPAN PASSWORD"}
              </button>
            </form>
          </>
        )}

        {/* ── Step Done ─────────────────────────────────────────────────────── */}
        {step === "done" && (
          <div className={styles.successWrap}>
            <div className={styles.successIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className={styles.title}>Password Berhasil Direset!</h2>
            <p className={styles.subtitle}>Silakan login menggunakan password barumu.</p>
            <button className={styles.btnSubmit} style={{ marginTop: 8 }} onClick={() => router.push("/")}>
              KEMBALI KE LOGIN
            </button>
          </div>
        )}

        {/* Back button */}
        {step !== "done" && (
          <button className={styles.backBtn} onClick={() => step === "email" ? router.push("/") : setStep(step === "otp" ? "email" : "otp")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {step === "email" ? "Kembali ke Login" : "Kembali"}
          </button>
        )}
      </div>
    </div>
  );
}