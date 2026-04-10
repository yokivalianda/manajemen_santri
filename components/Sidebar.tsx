import { GraduationCap, Users, BookOpen, Settings } from "lucide-react";

export function Sidebar() {
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
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-medium text-sm transition-colors">
          <Users className="w-5 h-5" />
          Data Santri
        </a>
        <a href="#generate-halqoh" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 rounded-xl font-medium text-sm transition-colors">
          <BookOpen className="w-5 h-5" />
          Halqoh
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 rounded-xl font-medium text-sm transition-colors">
          <Settings className="w-5 h-5" />
          Pengaturan
        </a>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            M
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Mudir / Admin</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@ponpes.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
