"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./manajemen-user.module.css";

// ── Tipe ────────────────────────────────────────────────────────────────────
type Role = "siswa" | "guru";

type User = {
  id: number;
  nama: string;
  username: string;
  role: Role;
  // siswa
  nisn?: string;
  kelas?: string;
  // guru
  nip?: string;
  mapel?: string;
};

// ── Mock data ────────────────────────────────────────────────────────────────
const INIT_SISWA: User[] = [
  { id:1,  role:"siswa", nama:"Stanley Varian Rasa",  username:"stanley.varian",  nisn:"0012345678", kelas:"10 B" },
  { id:2,  role:"siswa", nama:"Rina Anggraini",        username:"rina.anggraini",  nisn:"0012345679", kelas:"10 A" },
  { id:3,  role:"siswa", nama:"Budi Santoso",          username:"budi.santoso",    nisn:"0012345680", kelas:"10 C" },
  { id:4,  role:"siswa", nama:"Dewi Kusuma",           username:"dewi.kusuma",     nisn:"0012345681", kelas:"11 A" },
  { id:5,  role:"siswa", nama:"Fajar Ramadhan",        username:"fajar.ramadhan",  nisn:"0012345682", kelas:"11 B" },
  { id:6,  role:"siswa", nama:"Gita Permata",          username:"gita.permata",    nisn:"0012345683", kelas:"12 A" },
];

const INIT_GURU: User[] = [
  { id:101, role:"guru", nama:"Bpk. Andi Saputra",   username:"andi.saputra",   nip:"198501012010011001", mapel:"Matematika"       },
  { id:102, role:"guru", nama:"Ibu Sari Dewi",        username:"sari.dewi",      nip:"198602022011012001", mapel:"Bahasa Indonesia" },
  { id:103, role:"guru", nama:"Ibu Rina Marlina",     username:"rina.marlina",   nip:"198703032012013001", mapel:"Bahasa Inggris"   },
  { id:104, role:"guru", nama:"Bpk. Dedi Kurniawan",  username:"dedi.kurniawan", nip:"198804042013014001", mapel:"Fisika"           },
  { id:105, role:"guru", nama:"Ibu Wulandari",        username:"wulandari",      nip:"198905052014015001", mapel:"Kimia"            },
  { id:106, role:"guru", nama:"Bpk. Hendra Gunawan",  username:"hendra.gunawan", nip:"199006062015016001", mapel:"Biologi"          },
];

const KELAS_OPTIONS = ["10 A","10 B","10 C","10 D","10 E","10 F","10 G","11 A","11 B","11 C","11 D","11 E","12 A","12 B","12 C","12 D","12 E"];
const MAPEL_OPTIONS = ["Matematika","Bahasa Indonesia","Bahasa Inggris","Fisika","Kimia","Biologi","Sejarah","Ekonomi","PJOK","Agama","PKN","BK"];

const NAV = [
  { label:"Dashboard",      href:"/dashboard/admin",             active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
  { label:"Generate Jadwal",href:"/dashboard/admin/jadwal",      active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label:"Manajemen User", href:"/dashboard/admin/users",       active:true,  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label:"Pengumuman",     href:"/dashboard/admin/pengumuman",  active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
  { label:"Pengaturan",     href:"/dashboard/admin/settings",    active:false, icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

export default function ManajemenUser() {
  const router = useRouter();
  const [expanded, setExpanded]       = useState(false);
  const [showLogout, setShowLogout]   = useState(false);
  const [activeTab, setActiveTab]     = useState<Role>("siswa");
  const [search, setSearch]           = useState("");
  const [siswaList, setSiswaList]     = useState<User[]>(INIT_SISWA);
  const [guruList, setGuruList]       = useState<User[]>(INIT_GURU);
  const [showForm, setShowForm]       = useState(false);
  const [editItem, setEditItem]       = useState<User | null>(null);
  const [showDelete, setShowDelete]   = useState<User | null>(null);
  const [showReset, setShowReset]     = useState<User | null>(null);

  // Form state
  const [fNama, setFNama]       = useState("");
  const [fUsername, setFUsername] = useState("");
  const [fNisn, setFNisn]       = useState("");
  const [fKelas, setFKelas]     = useState(KELAS_OPTIONS[0]);
  const [fNip, setFNip]         = useState("");
  const [fMapel, setFMapel]     = useState(MAPEL_OPTIONS[0]);
  const [fError, setFError]     = useState("");

  const list = activeTab === "siswa" ? siswaList : guruList;
  const filtered = list.filter(u =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.kelas ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (u.mapel ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const openForm = (item?: User) => {
    if (item) {
      setEditItem(item);
      setFNama(item.nama); setFUsername(item.username);
      setFNisn(item.nisn ?? ""); setFKelas(item.kelas ?? KELAS_OPTIONS[0]);
      setFNip(item.nip ?? ""); setFMapel(item.mapel ?? MAPEL_OPTIONS[0]);
    } else {
      setEditItem(null);
      setFNama(""); setFUsername(""); setFNisn("");
      setFKelas(KELAS_OPTIONS[0]); setFNip(""); setFMapel(MAPEL_OPTIONS[0]);
    }
    setFError("");
    setShowForm(true);
  };

  const handleSave = () => {
    if (!fNama.trim() || !fUsername.trim()) { setFError("Nama dan username wajib diisi."); return; }
    if (activeTab === "siswa" && !fNisn.trim()) { setFError("NISN wajib diisi."); return; }
    if (activeTab === "guru" && !fNip.trim()) { setFError("NIP wajib diisi."); return; }

    if (editItem) {
      const updated: User = { ...editItem, nama:fNama, username:fUsername,
        nisn:fNisn, kelas:fKelas, nip:fNip, mapel:fMapel };
      if (activeTab === "siswa") setSiswaList(siswaList.map(u => u.id === editItem.id ? updated : u));
      else setGuruList(guruList.map(u => u.id === editItem.id ? updated : u));
    } else {
      const newUser: User = {
        id: Date.now(), role: activeTab, nama:fNama, username:fUsername,
        ...(activeTab === "siswa" ? { nisn:fNisn, kelas:fKelas } : { nip:fNip, mapel:fMapel }),
      };
      if (activeTab === "siswa") setSiswaList([...siswaList, newUser]);
      else setGuruList([...guruList, newUser]);
    }
    setShowForm(false);
  };

  const handleDelete = (u: User) => {
    if (activeTab === "siswa") setSiswaList(siswaList.filter(s => s.id !== u.id));
    else setGuruList(guruList.filter(g => g.id !== u.id));
    setShowDelete(null);
  };

  return (
    <div className={styles.layout}>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${expanded ? styles.sidebarExpanded : ""}`}>
        <button className={styles.hamburger} onClick={() => setExpanded(!expanded)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          {expanded && <span className={styles.brandName}>SMA Budi Mulia</span>}
        </button>
        <nav className={styles.nav}>
          {NAV.map((item, i) => (
            <a key={i} href={item.href} className={`${styles.navItem} ${item.active ? styles.navActive : ""}`} title={!expanded ? item.label : undefined}>
              <span className={styles.navIcon}>{item.icon}</span>
              {expanded && <span className={styles.navLabel}>{item.label}</span>}
            </a>
          ))}
          <button className={`${styles.navItem} ${styles.navLogout}`} onClick={() => setShowLogout(true)} title={!expanded ? "Keluar" : undefined}>
            <span className={styles.navIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {expanded && <span className={styles.navLabel}>Keluar</span>}
          </button>
        </nav>
      </aside>
      {expanded && <div className={styles.overlay} onClick={() => setExpanded(false)} />}

      {/* Main */}
      <div className={`${styles.main} ${expanded ? styles.mainShifted : ""}`}>

        {/* Topbar */}
        <header className={styles.topbar}>
          <h1 className={styles.pageTitle}>Manajemen User</h1>
          <div className={styles.userChip}>
            <div className={styles.userAvatar}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className={styles.userText}>
              <span className={styles.userName}>Administrator</span>
              <span className={styles.userSub}>Super Admin</span>
            </div>
          </div>
        </header>

        <div className={styles.content}>

          {/* Tab + Search + Tambah */}
          <div className={styles.toolbar}>
            <div className={styles.tabGroup}>
              <button className={`${styles.tabBtn} ${activeTab === "siswa" ? styles.tabBtnActive : ""}`} onClick={() => { setActiveTab("siswa"); setSearch(""); }}>
                Siswa
                <span className={styles.tabCount}>{siswaList.length}</span>
              </button>
              <button className={`${styles.tabBtn} ${activeTab === "guru" ? styles.tabBtnActive : ""}`} onClick={() => { setActiveTab("guru"); setSearch(""); }}>
                Guru
                <span className={styles.tabCount}>{guruList.length}</span>
              </button>
            </div>

            <div className={styles.toolbarRight}>
              <div className={styles.searchWrap}>
                <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input className={styles.searchInput} placeholder={`Cari ${activeTab}...`} value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button className={styles.addBtn} onClick={() => openForm()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Tambah {activeTab === "siswa" ? "Siswa" : "Guru"}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Nama</th>
                  <th className={styles.th}>Username</th>
                  {activeTab === "siswa" ? (
                    <>
                      <th className={styles.th}>NISN</th>
                      <th className={styles.th}>Kelas</th>
                    </>
                  ) : (
                    <>
                      <th className={styles.th}>NIP</th>
                      <th className={styles.th}>Mata Pelajaran</th>
                    </>
                  )}
                  <th className={styles.thAction}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyRow}>
                      {search ? `Tidak ada hasil untuk "${search}"` : `Belum ada data ${activeTab}.`}
                    </td>
                  </tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.userCell}>
                        <div className={styles.userInitial} style={{ background: activeTab === "siswa" ? "#dbeafe" : "#d1fae5", color: activeTab === "siswa" ? "#1e40af" : "#065f46" }}>
                          {u.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.userNama}>{u.nama}</span>
                      </div>
                    </td>
                    <td className={styles.td}><span className={styles.mono}>{u.username}</span></td>
                    {activeTab === "siswa" ? (
                      <>
                        <td className={styles.td}><span className={styles.mono}>{u.nisn}</span></td>
                        <td className={styles.td}><span className={styles.kelasChip}>{u.kelas}</span></td>
                      </>
                    ) : (
                      <>
                        <td className={styles.td}><span className={styles.mono}>{u.nip}</span></td>
                        <td className={styles.td}><span className={styles.mapelChip}>{u.mapel}</span></td>
                      </>
                    )}
                    <td className={styles.tdAction}>
                      <div className={styles.actionBtns}>
                        <button className={styles.resetBtn} title="Reset Password" onClick={() => setShowReset(u)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                        </button>
                        <button className={styles.editBtn} title="Edit" onClick={() => openForm(u)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className={styles.deleteBtn} title="Hapus" onClick={() => setShowDelete(u)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.tableFooter}>
            Menampilkan {filtered.length} dari {list.length} {activeTab}
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{editItem ? `Edit ${activeTab === "siswa" ? "Siswa" : "Guru"}` : `Tambah ${activeTab === "siswa" ? "Siswa" : "Guru"}`}</h3>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nama Lengkap</label>
              <input className={styles.formInput} placeholder="Nama lengkap..." value={fNama} onChange={(e) => setFNama(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Username</label>
              <input className={styles.formInput} placeholder="username..." value={fUsername} onChange={(e) => setFUsername(e.target.value)} />
            </div>

            {activeTab === "siswa" ? (
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex:1 }}>
                  <label className={styles.formLabel}>NISN</label>
                  <input className={styles.formInput} placeholder="10 digit NISN..." value={fNisn} onChange={(e) => setFNisn(e.target.value)} maxLength={10} />
                </div>
                <div className={styles.formGroup} style={{ flex:1 }}>
                  <label className={styles.formLabel}>Kelas</label>
                  <select className={styles.formSelect} value={fKelas} onChange={(e) => setFKelas(e.target.value)}>
                    {KELAS_OPTIONS.map(k => <option key={k}>{k}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex:1 }}>
                  <label className={styles.formLabel}>NIP</label>
                  <input className={styles.formInput} placeholder="18 digit NIP..." value={fNip} onChange={(e) => setFNip(e.target.value)} maxLength={18} />
                </div>
                <div className={styles.formGroup} style={{ flex:1 }}>
                  <label className={styles.formLabel}>Mata Pelajaran</label>
                  <select className={styles.formSelect} value={fMapel} onChange={(e) => setFMapel(e.target.value)}>
                    {MAPEL_OPTIONS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            )}

            {!editItem && (
              <div className={styles.passwordNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Password default: <strong>sekolah123</strong>. User dapat meminta reset password ke admin.
              </div>
            )}

            {fError && <p className={styles.formError}>{fError}</p>}

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Batal</button>
              <button className={styles.submitBtn} onClick={handleSave}>
                {editItem ? "Simpan Perubahan" : `Tambah ${activeTab === "siswa" ? "Siswa" : "Guru"}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {showReset && (
        <div className={styles.modalOverlay} onClick={() => setShowReset(null)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap} style={{ background:"#eff6ff" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2952cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Reset Password?</h3>
            <p className={styles.modalDesc}>Password <strong>{showReset.nama}</strong> akan direset ke <strong>sekolah123</strong>.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowReset(null)}>Batal</button>
              <button className={styles.submitBtn} onClick={() => setShowReset(null)}>Ya, Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {showDelete && (
        <div className={styles.modalOverlay} onClick={() => setShowDelete(null)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap} style={{ background:"#fef2f2" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Hapus User?</h3>
            <p className={styles.modalDesc}><strong>{showDelete.nama}</strong> akan dihapus secara permanen.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowDelete(null)}>Batal</button>
              <button className={styles.confirmBtn} onClick={() => handleDelete(showDelete)}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Logout */}
      {showLogout && (
        <div className={styles.modalOverlay} onClick={() => setShowLogout(false)}>
          <div className={styles.modalSmall} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap} style={{ background:"#fef2f2" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Keluar dari Akun?</h3>
            <p className={styles.modalDesc}>Kamu akan keluar dari akun Administrator.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setShowLogout(false)}>Batal</button>
              <button className={styles.confirmBtn} onClick={() => router.push("/")}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}