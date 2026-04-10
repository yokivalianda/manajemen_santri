"use client";

import { useEffect, useState, useRef } from "react";
import {
  Users, BookOpen, Zap, Loader2, RefreshCw, ChevronUp, ChevronDown,
  Plus, Pencil, Trash2, Search, Printer, X,
  Check, AlertTriangle
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

// ─── Types ───────────────────────────────────────────────────────────────────

type Santri = {
  id: string;
  nama: string;
  kelas: string;
  jilid: number;
  halaman: number;
  hafalan: string;
  status: string;
  kategori: string;
};

type HalqohSantri = Santri & { sorting_score: number };

type Halqoh = {
  id: string;
  nama_kelompok: string;
  kapasitas: number;
  santris: HalqohSantri[];
};

type Toast = { id: string; message: string; type: "success" | "error" };
type ModalMode = "add" | "edit" | null;
type FormData = { nama: string; kelas: string; jilid: string; halaman: string; hafalan: string; status: string; kategori: string; };

// ─── Constants ────────────────────────────────────────────────────────────────

const JILID_COLORS: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-300 dark:ring-emerald-800",
  2: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-800",
  3: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 ring-1 ring-violet-300 dark:ring-violet-800",
  4: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-800",
  5: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 ring-1 ring-rose-300 dark:ring-rose-800",
  6: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 ring-1 ring-purple-300 dark:ring-purple-800",
};

const EMPTY_FORM: FormData = { nama: "", kelas: "SD", jilid: "1", halaman: "", hafalan: "", status: "Sedang Belajar", kategori: "sedang" };

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  // Core data
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [halqohs, setHalqohs] = useState<Halqoh[]>([]);

  // Loading
  const [initialLoading, setInitialLoading] = useState(true);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Table controls
  const [sortField, setSortField] = useState<keyof Santri>("nama");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJilid, setFilterJilid] = useState(0);
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [filterKategori, setFilterKategori] = useState("Semua");

  // Halqoh config
  const [kapasitas, setKapasitas] = useState(10);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Santri | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Theme
  const [isLight, setIsLight] = useState(false);

  // Refs
  const csvInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [showKelola, setShowKelola] = useState(false);

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Restore theme
    if (localStorage.getItem("spTheme") === "light") {
      setIsLight(true);
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    
    Promise.all([
      fetch("/api/santri").then((r) => r.json()),
      fetch("/api/generate-halqoh").then((r) => r.json()),
    ])
      .then(([santriData, halqohData]) => {
        setSantriList(santriData.santris || []);
        setHalqohs(halqohData.halqohs || []);
      })
      .catch(console.error)
      .finally(() => setInitialLoading(false));
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    localStorage.setItem("spTheme", next ? "light" : "dark");
  };

  // ─── Toast ──────────────────────────────────────────────────────────────────

  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  // ─── Table Controls ─────────────────────────────────────────────────────────

  const handleSort = (field: keyof Santri) => {
    if (field === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const displayedSantri = [...santriList]
    .filter((s) => {
      const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase());
      const matchJilid = filterJilid === 0 || s.jilid === filterJilid;
      const matchKelas = filterKelas === "Semua" || s.kelas === filterKelas;
      const matchKategori = filterKategori === "Semua" || s.kategori === filterKategori;
      return matchSearch && matchJilid && matchKelas && matchKategori;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp =
        typeof aVal === "string"
          ? aVal.localeCompare(bVal as string)
          : (aVal as number) - (bVal as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

  // ─── Generate ───────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setGenerateLoading(true);
    try {
      const res = await fetch("/api/generate-halqoh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kapasitas }),
      });
      const data = await res.json();
      if (data.success) {
        setHalqohs(data.halqohs);
        addToast(`Berhasil membuat ${data.halqohs.length} kelompok halqoh!`);
        setTimeout(
          () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
          300
        );
      } else {
        addToast(data.message || "Gagal generate halqoh.", "error");
      }
    } catch {
      addToast("Terjadi kesalahan saat generate.", "error");
    } finally {
      setGenerateLoading(false);
    }
  };

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setFormData(EMPTY_FORM);
    setEditTarget(null);
    setModalMode("add");
  };

  const openEditModal = (s: Santri) => {
    setFormData({
      nama: s.nama,
      kelas: s.kelas,
      jilid: String(s.jilid),
      halaman: String(s.halaman),
      hafalan: s.hafalan,
      status: s.status,
      kategori: s.kategori,
    });
    setEditTarget(s);
    setModalMode("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const payload = {
      nama: formData.nama.trim(),
      kelas: formData.kelas.trim(),
      jilid: Number(formData.jilid),
      halaman: Number(formData.halaman),
      hafalan: formData.hafalan.trim(),
      status: formData.status.trim(),
      kategori: formData.kategori.trim(),
    };
    try {
      if (modalMode === "add") {
        const res = await fetch("/api/santri", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setSantriList((prev) =>
            [...prev, data.santri].sort((a, b) => a.nama.localeCompare(b.nama))
          );
          addToast("Santri berhasil ditambahkan!");
          setModalMode(null);
        } else {
          addToast(data.message || "Gagal menambah santri.", "error");
        }
      } else if (modalMode === "edit" && editTarget) {
        const res = await fetch(`/api/santri/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setSantriList((prev) =>
            prev.map((s) => (s.id === editTarget.id ? data.santri : s))
          );
          addToast("Data santri berhasil diperbarui!");
          setModalMode(null);
        } else {
          addToast(data.message || "Gagal memperbarui santri.", "error");
        }
      }
    } catch {
      addToast("Terjadi kesalahan.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/santri/${deleteTarget}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSantriList((prev) => prev.filter((s) => s.id !== deleteTarget));
        addToast("Santri berhasil dihapus!");
      } else {
        addToast(data.message || "Gagal menghapus santri.", "error");
      }
    } catch {
      addToast("Terjadi kesalahan saat menghapus.", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  // ─── CSV Import ─────────────────────────────────────────────────────────────

  const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = (evt.target?.result as string) || "";
      const lines = text.trim().split(/\r?\n/);
      const records = lines
        .slice(1) // skip header
        .map((line) => {
          const parts = line.split(",").map((s) => s.trim());
          return {
            nama: parts[0] || "",
            kelas: parts[1] || "SD",
            jilid: Number(parts[2]) || 1,
            halaman: Number(parts[3]) || 1,
            hafalan: parts[4] || "-",
            status: parts[5] || "Sedang Belajar",
            kategori: parts[6] || "sedang",
          };
        })
        .filter((r) => r.nama && r.jilid > 0 && r.halaman > 0);

      if (records.length === 0) {
        addToast("Format CSV tidak valid atau tidak ada data.", "error");
        e.target.value = "";
        return;
      }
      setImportLoading(true);
      try {
        const res = await fetch("/api/santri/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records }),
        });
        const data = await res.json();
        if (data.success) {
          setSantriList(data.santris);
          addToast(`Berhasil import ${data.imported} santri!`);
        } else {
          addToast(data.message || "Gagal import.", "error");
        }
      } catch {
        addToast("Gagal import CSV.", "error");
      } finally {
        setImportLoading(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // ─── Print ──────────────────────────────────────────────────────────────────

  const handlePrint = () => window.print();

  // ─── Sort Icon ──────────────────────────────────────────────────────────────

  const SortIcon = ({ field }: { field: keyof Santri }) => {
    if (field !== sortField) return <ChevronUp className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-indigo-500" />
    ) : (
      <ChevronDown className="w-3 h-3 text-indigo-500" />
    );
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          isLight={isLight} 
          toggleTheme={toggleTheme} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">

            {/* ── Hidden CSV Input ── */}
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCSVFile}
            />

            {/* ── Toast ── */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 no-print pointer-events-none">
              {toasts.map((t) => (
                <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold pointer-events-auto ${
                  t.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                }`}>
                  {t.type === "success" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {t.message}
                </div>
              ))}
            </div>

            {/* ── Delete Modal ── */}
            {deleteTarget && (
              <div className="fixed inset-0 z-40 bg-gray-900/40 dark:bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Hapus Santri</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => setDeleteTarget(null)}>Batal</button>
                    <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed">
                      {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Hapus
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Add/Edit Modal ── */}
            {modalMode && (
              <div className="fixed inset-0 z-40 bg-gray-900/40 dark:bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden font-sans">
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">
                      {modalMode === "add" ? "Tambah Santri Baru" : "Edit Data Santri"}
                    </h3>
                    <button onClick={() => setModalMode(null)} className="w-8 h-8 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleFormSubmit} className="p-5 flex flex-col gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
                      <input type="text" required value={formData.nama} onChange={(e) => setFormData((p) => ({ ...p, nama: e.target.value }))} placeholder="Masukkan nama lengkap" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Kelas</label>
                        <select value={formData.kelas} onChange={(e) => setFormData((p) => ({ ...p, kelas: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 cursor-pointer">
                          {["Pra Sekolah", "SD", "SMP", "SMA", "Kuliah"].map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Status</label>
                        <select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 cursor-pointer">
                          {["Sedang Belajar", "Lulus Jilid", "Lulus Khatam"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Kategori Kecepatan</label>
                      <select value={formData.kategori} onChange={(e) => setFormData((p) => ({ ...p, kategori: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 cursor-pointer">
                        {["lambat", "sedang", "cepat"].map((k) => <option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1)}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Jilid</label>
                        <select value={formData.jilid} onChange={(e) => setFormData((p) => ({ ...p, jilid: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 cursor-pointer">
                          {[1,2,3,4,5,6].map((j) => <option key={j} value={j}>Jilid {j}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Halaman</label>
                        <input type="number" required min={1} max={100} value={formData.halaman} onChange={(e) => setFormData((p) => ({ ...p, halaman: e.target.value }))} placeholder="Hal" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Hafalan</label>
                        <input type="text" required value={formData.hafalan} onChange={(e) => setFormData((p) => ({ ...p, hafalan: e.target.value }))} placeholder="Juz 30" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 transition" />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button type="button" onClick={() => setModalMode(null)} className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        Batal
                      </button>
                      <button type="submit" disabled={formLoading} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                        {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {modalMode === "add" ? "Tambah" : "Simpan"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 no-print">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Santri</h4>
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{santriList.length}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Halqoh</h4>
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{halqohs.length || 0}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {halqohs.filter(h => h.santris.length >= kapasitas).length} Kelas Terisi Penuh
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Kapasitas Avg</h4>
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{kapasitas}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Data Santri ── */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm no-print overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Daftar Santri</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{displayedSantri.length} murid terdaftar</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <select value={filterJilid} onChange={(e) => setFilterJilid(Number(e.target.value))} className="h-9 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500">
                    <option value={0}>Semua Jilid</option>
                    {[1,2,3,4,5,6].map(j=><option key={j} value={j}>Jilid {j}</option>)}
                  </select>
                  
                  <select value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)} className="h-9 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-indigo-500">
                    <option value="Semua">Semua Kelas</option>
                    {["Pra Sekolah", "SD", "SMP", "SMA", "Kuliah"].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>

                   <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="h-9 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer focus:ring-2 focus:ring-indigo-500">
                    <option value="Semua">Semua Kemampuan</option>
                    {["lambat", "sedang", "cepat"].map(k=><option key={k} value={k}>{k.charAt(0).toUpperCase()+k.slice(1)}</option>)}
                  </select>

                  <div className="relative">
                    <button onClick={() => setShowKelola(!showKelola)} className="h-9 px-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                      Aksi Lainnya...
                    </button>
                    {showKelola && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-30">
                        <button onClick={() => { csvInputRef.current?.click(); setShowKelola(false); }} disabled={importLoading} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                          {importLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Import CSV
                        </button>
                        <button onClick={() => { handlePrint(); setShowKelola(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          Cetak Tabel (PDF)
                        </button>
                      </div>
                    )}
                  </div>

                  <button onClick={openAddModal} className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition shadow-sm">
                    <Plus className="w-4 h-4" /> Tambah Baru
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-5 py-3 w-12 font-semibold">No</th>
                      {([
                        { key: "nama", label: "Nama Santri" },
                        { key: "kelas", label: "Kelas" },
                        { key: "jilid", label: "Jilid" },
                        { key: "halaman", label: "Halaman" },
                        { key: "hafalan", label: "Hafalan" },
                        { key: "status", label: "Status" },
                        { key: "kategori", label: "Kecepatan" }
                      ] as { key: keyof Santri; label: string }[]).map(({ key, label }) => (
                        <th key={key} onClick={() => handleSort(key)} className="px-5 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                          <div className="flex items-center gap-1">
                            {label}
                            <SortIcon field={key} />
                          </div>
                        </th>
                      ))}
                      <th className="px-5 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                    {initialLoading ? (
                      <tr>
                        <td colSpan={10} className="px-5 py-12 text-center text-gray-500">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                          Memuat data..
                        </td>
                      </tr>
                    ) : displayedSantri.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-5 py-12 text-center text-gray-500">
                          <p>Data tidak ditemukan.</p>
                        </td>
                      </tr>
                    ) : (
                      displayedSantri.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition group">
                          <td className="px-5 py-3 md:py-4 text-gray-400 tabular-nums">{idx + 1}</td>
                          <td className="px-5 py-3 md:py-4 font-semibold text-gray-900 dark:text-gray-100">{s.nama}</td>
                          <td className="px-5 py-3 md:py-4 text-gray-600 dark:text-gray-400">{s.kelas}</td>
                          <td className="px-5 py-3 md:py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${JILID_COLORS[s.jilid] ?? "bg-gray-100 text-gray-800"}`}>
                              Jilid {s.jilid}
                            </span>
                          </td>
                          <td className="px-5 py-3 md:py-4 text-gray-600 dark:text-gray-400 tabular-nums">Hal. {s.halaman}</td>
                          <td className="px-5 py-3 md:py-4 text-gray-600 dark:text-gray-400">{s.hafalan}</td>
                          <td className="px-5 py-3 md:py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase ${
                              (s.status==="Sedang Belajar"||s.status.includes("Belajar")) 
                              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800" 
                              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800"
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 md:py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              s.kategori==="cepat" ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" :
                              s.kategori==="lambat" ? "text-rose-700 bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400" :
                              "text-amber-700 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400"
                            }`}>
                              {s.kategori ? s.kategori.charAt(0).toUpperCase() + s.kategori.slice(1) : "Sedang"}
                            </span>
                          </td>
                          <td className="px-5 py-3 md:py-4">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={() => openEditModal(s)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => setDeleteTarget(s.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Generate Section ── */}
            <div id="generate-halqoh" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm no-print p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1">Generate Halqoh Cerdas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Konfigurasi parameter untuk membagi kelompok secara otomatis berdasarkan kedekatan Jilid & Halaman.</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Santri per Halqoh:</span>
                  <select value={kapasitas} onChange={(e) => setKapasitas(Math.max(1, Number(e.target.value)))} className="bg-transparent text-gray-900 dark:text-white font-bold text-base focus:outline-none cursor-pointer">
                    <option value={10}>10 Anak</option>
                    <option value={15}>15 Anak</option>
                    <option value={20}>20 Anak</option>
                  </select>
                </div>
                
                <div className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 px-4 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/30 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                  <span>Prioritas Algoritma: <strong>Jilid → Halaman → Kelas</strong></span>
                </div>
              </div>

              <button onClick={handleGenerate} disabled={generateLoading || santriList.length === 0} className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50">
                {generateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                {generateLoading ? "Mengkalkulasi Pembagian Berkeadilan..." : "Generate Kelompok Sekarang"}
              </button>
            </div>

            {/* ── Results ── */}
            {halqohs.length > 0 && (
              <div ref={resultsRef} className="pt-4">
                <div className="print-title p-8 bg-white border border-gray-200 rounded-t-2xl mb-[-1px]">
                  <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wider">Laporan Daftar Halqoh</h1>
                  <p className="text-sm text-gray-500 mt-1">Dicetak pada: {new Date().toLocaleDateString("id-ID",{dateStyle:"long"})}</p>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-t-2xl shadow-sm no-print">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hasil Kelompok ({halqohs.length})</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Berhasil membagi {halqohs.reduce((a,h)=>a+h.santris.length,0)} santri.</p>
                  </div>
                  <button onClick={handlePrint} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2">
                    <Printer className="w-4 h-4" /> Cetak PDF
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 border-t-0 rounded-b-2xl shadow-sm">
                  {halqohs.map((halqoh, gi) => {
                    const BORDERS = ["border-t-emerald-500", "border-t-indigo-500", "border-t-rose-500", "border-t-amber-500", "border-t-voilet-500", "border-t-sky-500"];
                    const BG = ["bg-emerald-50 dark:bg-emerald-900/10", "bg-indigo-50 dark:bg-indigo-900/10", "bg-rose-50 dark:bg-rose-900/10", "bg-amber-50 dark:bg-amber-900/10", "bg-violet-50 dark:bg-violet-900/10", "bg-sky-50 dark:bg-sky-900/10"];
                    const TEXT = ["text-emerald-700 dark:text-emerald-400", "text-indigo-700 dark:text-indigo-400", "text-rose-700 dark:text-rose-400", "text-amber-700 dark:text-amber-400", "text-violet-700 dark:text-violet-400", "text-sky-700 dark:text-sky-400"];
                    
                    const borderClass = BORDERS[gi % BORDERS.length];
                    const bgClass = BG[gi % BG.length];
                    const textClass = TEXT[gi % TEXT.length];

                    return (
                      <div key={halqoh.id} className={`border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-gray-900 flex flex-col border-t-4 hover:shadow-md transition ${borderClass}`}>
                        <div className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between ${bgClass}`}>
                          <span className="font-bold text-gray-900 dark:text-white">{halqoh.nama_kelompok}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 ${textClass}`}>
                            {halqoh.santris.length} Anak
                          </span>
                        </div>
                        <ul className="flex-1 overflow-y-auto max-h-96 divide-y divide-gray-50 dark:divide-gray-800/50 p-2">
                          {[...halqoh.santris].sort((a,b)=>a.sorting_score-b.sorting_score).map((s,si)=>(
                            <li key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg group">
                              <span className="text-xs font-bold text-gray-400 w-5">{si+1}.</span>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${bgClass} ${textClass}`}>
                                {s.nama.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                              </div>
                              <span className="flex-1 text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{s.nama}</span>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">J{s.jilid}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">H.{s.halaman}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}
