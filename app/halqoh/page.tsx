"use client";

import { useEffect, useState, useRef } from "react";
import { BookOpen, Zap, Loader2, RefreshCw, Printer, AlertTriangle, Check } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";

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

export default function HalqohPage() {
  const router = useRouter();
  const [halqohs, setHalqohs] = useState<Halqoh[]>([]);
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [currentUser, setCurrentUser] = useState<{username: string, role: string} | null>(null);
  const [isLight, setIsLight] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [generateLoading, setGenerateLoading] = useState(false);
  const [kapasitas, setKapasitas] = useState(10);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Restore theme
    if (localStorage.getItem("spTheme") === "dark") {
      setIsLight(false);
      document.documentElement.classList.add("dark");
    } else {
      setIsLight(true);
      document.documentElement.classList.remove("dark");
    }
    
    Promise.all([
      fetch("/api/santri").then((r) => r.json()),
      fetch("/api/generate-halqoh").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ])
      .then(([santriData, halqohData, authData]) => {
        setSantriList(santriData.santris || []);
        setHalqohs(halqohData.halqohs || []);
        if(authData.success) {
          setCurrentUser(authData.user);
        } else {
          router.push("/login");
        }
      })
      .catch(console.error);
  }, [router]);

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

  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

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

  const handlePrint = () => window.print();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 font-sans">
      <Sidebar user={currentUser || undefined} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          isLight={isLight} 
          toggleTheme={toggleTheme} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />

        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 lg:space-y-8">

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

            {/* ── Header Title ── */}
            <div className="flex flex-col gap-1 no-print">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Manajemen Halqoh</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pusat pengaturan kelompok tadarus dengan algoritma penyebaran merata.</p>
            </div>

            {/* ── Generate Section ── */}
            {currentUser?.role === 'ADMIN' ? (
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
                    <span>Prioritas Algoritma: <strong>Jilid → Halaman → Kecepatan Santri</strong></span>
                  </div>
                </div>

                <button onClick={handleGenerate} disabled={generateLoading || santriList.length === 0} className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50">
                  {generateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                  {generateLoading ? "Mengkalkulasi Pembagian Berkeadilan..." : "Generate Kelompok Sekarang"}
                </button>
              </div>
            ) : null}

            {/* ── Results ── */}
            {halqohs.length > 0 && (
              <div ref={resultsRef} className="pt-4">
                <div className="print-title p-8 bg-white border border-gray-200 rounded-t-2xl mb-[-1px] hidden print:block">
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
                    const BORDERS = ["border-t-emerald-500", "border-t-indigo-500", "border-t-rose-500", "border-t-amber-500", "border-t-violet-500", "border-t-sky-500"];
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
