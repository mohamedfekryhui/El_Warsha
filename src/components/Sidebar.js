"use client";
import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  Sun,
  Moon,
  MapPin,
  ArrowRightLeft,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/AuthContext";
import Link from "next/link";
import logoImg from "@/Logo.png";

export default function Sidebar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, currentBranchId, selectBranch, logout } = useAuth();

  const activeBranchName = user?.branches?.find(b => b.id == currentBranchId)?.name || user?.branches?.find(b => b == currentBranchId) || "الفرع الحالي";
  const currentBranch = currentBranchId ? activeBranchName : null;

  const clearBranch = () => {
    localStorage.removeItem("elwarsha_current_branch");
    selectBranch(null);
  };

  useEffect(() => {
    // التأكد من حالة الثيم عند التحميل
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);

    // التأكد من حالة تصغير القائمة
    const stored = localStorage.getItem("elwarsha_sidebar_collapsed");
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("elwarsha_sidebar_collapsed", String(nextState));
  };

  const menuItems = [
    {
      id: "dashboard",
      name: "نظرة عامة",
      icon: <LayoutDashboard size={20} />,
      path: "/",
    },
    {
      id: "doctors",
      name: "الأطباء والعيادات",
      icon: <Users size={20} />,
      path: "/doctors",
    },
    {
      id: "maintenance",
      name: "الصيانة والرف",
      icon: <Wrench size={20} />,
      path: "/maintenance",
    },
    {
      id: "reports",
      name: "التقارير والمالية",
      icon: <FileText size={20} />,
      path: "/reports",
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? "w-20 p-4 items-center" : "w-72 p-6"
      } bg-white dark:bg-[#1E293B] border-l border-gray-100 dark:border-gray-800/60 flex flex-col justify-between min-h-screen transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.02)] dark:shadow-none z-20`}
    >
      <div>
        {/* هيدر السايدبار وزرار الثيم وزرار التصغير */}
        <div className={`flex ${isCollapsed ? "flex-col gap-4 items-center" : "items-center justify-between"} mb-10`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-2xl flex items-center justify-center shadow-md p-1 border border-gray-100 dark:border-gray-800 shrink-0 select-none">
              <img src={logoImg.src} alt="الورشة" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="transition-all duration-300">
                <h2 className="font-black text-xl text-gray-900 dark:text-white tracking-tight">
                  الورشة
                </h2>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  نظام الإدارة المتكامل
                </p>
              </div>
            )}
          </div>

          <div className={`flex ${isCollapsed ? "flex-col gap-2" : "gap-2"}`}>
            {/* زرار تبديل المظهر */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 cursor-pointer"
              aria-label="تبديل المظهر"
            >
              {darkMode ? (
                <Sun size={18} className="text-amber-500 hover:text-amber-400" />
              ) : (
                <Moon
                  size={18}
                  className="text-indigo-500 hover:text-indigo-600"
                />
              )}
            </button>

            {/* زرار تصغير/تكبير القائمة الجانبية */}
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200 cursor-pointer"
              title={isCollapsed ? "توسيع القائمة" : "تصغير القائمة"}
              aria-label="تبديل القائمة الجانبية"
            >
              {isCollapsed ? (
                <PanelRightOpen size={18} className="text-indigo-500" />
              ) : (
                <PanelRightClose size={18} className="text-indigo-500" />
              )}
            </button>
          </div>
        </div>

        {/* معلومات الفرع الحالي */}
        {currentBranch && (
          isCollapsed ? (
            <button
              onClick={clearBranch}
              className="mb-8 p-3 bg-gray-50 dark:bg-gray-800/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-2xl border border-gray-100 dark:border-gray-800/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-colors cursor-pointer w-full"
              title={`الفرع الحالي: ${currentBranch} (اضغط للتبديل)`}
            >
              <MapPin size={18} className="shrink-0" />
            </button>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500">
                    الفرع الحالي
                  </span>
                  <span className="block text-xs font-bold text-gray-900 dark:text-white truncate">
                    {currentBranch}
                  </span>
                </div>
              </div>
              <button
                onClick={clearBranch}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
                title="تبديل الفرع"
              >
                <ArrowRightLeft size={14} />
              </button>
            </div>
          )
        )}

        {/* روابط التنقل */}
        <nav className="space-y-2 w-full">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center p-3.5" : "justify-start gap-4 px-4 py-3.5"
                } text-sm font-bold rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 hover:-translate-x-1"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                {/* 1. منع الأيقونة من الانضغاط */}
                <div className={`shrink-0 ${isActive ? "drop-shadow-sm" : ""}`}>
                  {item.icon}
                </div>

                {/* 2. إجبار النص على الظهور وعدم النزول لسطر جديد عند توسعه */}
                {!isCollapsed && (
                  <span className="whitespace-nowrap inline-block text-right">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* فوتر السايدبار */}
      <div className="pt-6 border-t border-gray-100 dark:border-gray-800/60 w-full">
        <div className={`flex ${isCollapsed ? "flex-col gap-4 items-center" : "items-center justify-between"} px-2`}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center border-2 border-white dark:border-[#1E293B] shadow-sm shrink-0"
              title="السيستم نشط - إصدار 2026.1"
            >
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            {!isCollapsed && (
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  السيستم نشط
                </p>
                <p className="text-[10px] font-medium text-gray-400">
                  إصدار 2026.1
                </p>
              </div>
            )}
          </div>
          {logout && (
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer shrink-0"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
