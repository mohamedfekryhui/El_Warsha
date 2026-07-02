"use client";
import React, { useState } from "react";
import { Lock, User, Building2, MapPin, ArrowRight, Search, LogOut } from "lucide-react";
import { useAuth } from "../AuthContext";
import { loginUser } from "../services/authService";
import logoImg from "@/Logo.png";

export default function AuthScreen() {
  const { user, login, selectBranch, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(username, password);
      // Data expected: { token, username, branches: [{ id, name }, ...] }
      login(data);
      localStorage.setItem("elwarsha_auth", JSON.stringify(data));
      
      // If only one branch, select it automatically
      if (data.branches && data.branches.length === 1) {
        const singleBranch = data.branches[0];
        const branchId = singleBranch.id || 1;
        selectBranch(branchId);
        localStorage.setItem("elwarsha_current_branch", String(branchId));
      }
    } catch (err) {
      setError(err.message || "فشل تسجيل الدخول ⛔");
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = (branchId) => {
    selectBranch(branchId);
    localStorage.setItem("elwarsha_current_branch", String(branchId));
  };

  // Safe checks for branches list
  const branchesList = user?.branches || [];
  const filteredBranches = branchesList.filter((b) => {
    const name = typeof b === "string" ? b : b.name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120] px-4 font-sans text-right transition-colors duration-300"
      dir="rtl"
    >
      {/* 1. Login Card */}
      {!user ? (
        <div className="max-w-md w-full bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300 transform hover:scale-[1.01]">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-3xl flex items-center justify-center shadow-lg p-2 border border-gray-100 dark:border-gray-800 select-none">
              <img src={logoImg.src} alt="الورشة" className="w-full h-full object-contain" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-2">
            سيستم الورشة
          </h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            الرجاء إدخال بيانات الاعتماد للمتابعة
          </p>

          {error && (
            <div className="mb-4 p-4 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/50">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username input */}
            <div className="relative">
              <User
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-left"
                placeholder="اسم المستخدم"
                dir="ltr"
              />
            </div>

            {/* Password input */}
            <div className="relative">
              <Lock
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 pr-12 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-left"
                placeholder="كلمة المرور"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-lg shadow-indigo-500/30 cursor-pointer disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>
      ) : (
        /* 2. Branch Selection Card (Select Beautiful UI List) */
        <div className="max-w-lg w-full bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-2xl flex items-center justify-center shadow-md p-1.5 border border-gray-100 dark:border-gray-800 shrink-0 select-none">
                <img src={logoImg.src} alt="الورشة" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  اختر الفرع
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  مرحباً {user.username || "بالمستخدم"}، يرجى اختيار الفرع لمتابعة العمل
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                localStorage.removeItem("elwarsha_auth");
                logout();
              }}
              className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>

          {/* Search bar inside the beautiful select UI */}
          {branchesList.length > 4 && (
            <div className="relative mb-4">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="ابحث عن فرع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pr-10 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 outline-none text-xs text-right"
              />
            </div>
          )}

          {/* Beautiful Selection List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {filteredBranches.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                لا توجد فروع متطابقة أو لم يتم تعيين فروع لك بعد ⚠️
              </div>
            ) : (
              filteredBranches.map((branch) => {
                const branchId = typeof branch === "string" ? branch : branch.id;
                const branchName = typeof branch === "string" ? branch : branch.name;

                return (
                  <button
                    key={branchId}
                    onClick={() => handleBranchSelect(branchId)}
                    className="w-full group p-4 bg-gray-50 dark:bg-gray-900/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/10 border border-gray-100 dark:border-gray-800/80 hover:border-indigo-500/50 rounded-2xl transition-all duration-200 flex items-center justify-between text-right cursor-pointer shadow-sm hover:shadow"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-800 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shadow-sm">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                          {branchName}
                        </span>
                        <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          كود الفرع: {branchId}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 flex items-center justify-center transition-all">
                      <ArrowRight size={16} className="transform rotate-180" />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
