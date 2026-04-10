"use client";

import { GraduationCap, Users, BookOpen, Settings, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export function Sidebar({ user }: { user?: { username: string; role: string } }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navLinks = [
    { name: "Data Santri", href: "/", icon: Users },
    { name: "Halqoh", href: "/#generate-halqoh", icon: BookOpen },
    { name: "Pengaturan", href: "/pengaturan", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 hidden md:flex flex-col h-screen sticky top-0 no-print">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-gray-100 text-sm tracking-tight">
          Manajemen Santri
        </span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          // Because href="/" also matches "/pengaturan" if we just do startsWith,
          // we do exact match for /, and exact match for /pengaturan
          const isActive = pathname === link.href.split('#')[0];
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isActive 
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase">
            {user?.username ? user.username.charAt(0) : "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate capitalize">{user?.username || "Admin"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role === "ADMIN" ? "Administrator" : "Guest"}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition">
          <LogOut className="w-3.5 h-3.5" /> Keluar
        </button>
      </div>
    </aside>
  );
}
