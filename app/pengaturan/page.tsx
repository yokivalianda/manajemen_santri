"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Loader2, Check, AlertTriangle, User, Lock, Save, ShieldCheck } from "lucide-react";

type Toast = { id: string; message: string; type: "success" | "error" };

export default function PengaturanPage() {
  const router = useRouter();
  
  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLight, setIsLight] = useState(true);
  const [currentUser, setCurrentUser] = useState<{username: string, role: string} | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Forms
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passConfirm, setPassConfirm] = useState("");

  const [searchQuery, setSearchQuery] = useState(""); // Buat header prop filler

  useEffect(() => {
    if (localStorage.getItem("spTheme") === "dark") {
      setIsLight(false);
      document.documentElement.classList.add("dark");
    } else {
      setIsLight(true);
      document.documentElement.classList.remove("dark");
    }

    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.success) {
        setCurrentUser(data.user);
        setUsername(data.user.username);
      } else {
        router.push("/login");
      }
    }).finally(() => setLoading(false));
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
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== passConfirm) {
      addToast("Konfirmasi password tidak cocok!", "error");
      return;
    }
    if (password && password.length < 6) {
      addToast("Password minimal 6 karakter!", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUsername: username,
          newPassword: password || undefined,
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(data.message);
        setPassword("");
        setPassConfirm("");
        // Reload user info on sidebar
        setCurrentUser(prev => prev ? { ...prev, username: data.user.username } : prev);
      } else {
        addToast(data.message, "error");
      }
    } catch {
      addToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setSaving(false);
    }
  };

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

        <main className="flex-1 overflow-y-auto w-full relative">
          
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

          <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 lg:space-y-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 lg:py-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-indigo-500" />
                 <div>
                   <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Pengaturan Keamanan Akun</h2>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Pembaruan nama pengguna atau atur ulang kata sandi.</p>
                 </div>
              </div>

              {loading ? (
                 <div className="p-12 flex items-center justify-center">
                   <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                 </div>
              ) : (
                <div className="p-5 md:p-6">
                  <form onSubmit={handleUpdateProfile} className="max-w-xl space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Username Publik</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input type="text" required value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\\s/g,''))} className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Pastikan nama pengguna mudah diingat tanpa karakter khusus maupun spasi.</p>
                      </div>

                      <div className="py-2"><div className="border-t border-gray-100 dark:border-gray-800"></div></div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Password Baru (Opsional)</label>
                        <div className="relative mb-3">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Biarkan kosong jika tidak diubah" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition" />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                          <input type="password" value={passConfirm} onChange={(e) => setPassConfirm(e.target.value)} placeholder="Ulangi password baru" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition" />
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={saving || (!password && username === currentUser?.username)} className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Simpan Perubahan
                    </button>
                    
                  </form>
                </div>
              )}
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}
