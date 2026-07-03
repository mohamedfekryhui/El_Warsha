"use client";
import React, { useState, useEffect } from "react";
import { Lock, User, Building2, MapPin, ArrowRight, Search, LogOut, Sun, Moon } from "lucide-react";
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
  const [darkMode, setDarkMode] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);

    // Generate stars only on the client side
    const generatedStars = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 1.8 + 0.6,
      delay: `${Math.random() * 6}s`,
      duration: `${Math.random() * 4 + 3}s`,
      opacity: Math.random() * 0.7 + 0.3,
    }));
    setStars(generatedStars);
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
      className={`relative min-h-screen flex items-center justify-center bg-gradient-to-b ${
        darkMode
          ? "from-[#090b11] via-[#0f1322] to-[#1a1525]"
          : "from-[#a9cbf7] via-[#d2e5fc] to-[#f4f8ff]"
      } px-4 font-sans text-right transition-all duration-1000 overflow-hidden`}
      dir="rtl"
    >
      {/* Dynamic Background Art: Starry Night / Daylight Sky & Layered Clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Grid Overlay for subtle tech texture */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        {/* Twinkling Star Field (Fades out dynamically in light mode) */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${darkMode ? "opacity-100" : "opacity-0"}`}>
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
        </div>

        {/* Ambient Colored Glows (Dark Mode: indigo/purple, Light Mode: warm gold/pink) */}
        <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] animate-blob transition-all duration-1000 ${
          darkMode ? "bg-gradient-to-br from-indigo-500/15 to-purple-500/15" : "bg-gradient-to-br from-amber-200/20 to-yellow-100/30"
        }`}></div>
        <div className={`absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] animate-blob animation-delay-2000 transition-all duration-1000 ${
          darkMode ? "bg-gradient-to-tr from-blue-500/15 to-teal-500/15" : "bg-gradient-to-tr from-pink-200/20 to-purple-100/20"
        }`}></div>

        {/* Bottom Left Cloud Cluster */}
        <svg className="absolute bottom-[-8%] left-[-10%] w-[55%] h-[45%] min-w-[320px] fill-current filter blur-[1px] animate-drift-left" viewBox="0 0 500 300">
          {/* Layer 1 (Back) */}
          <path d="M-50,350 C30,220 120,200 180,240 C240,160 350,180 390,270 C440,250 490,290 520,350 Z" className={`opacity-35 fill-current transition-colors duration-1000 ${darkMode ? "text-[#221a30]" : "text-[#ffffff]"}`} />
          {/* Layer 2 (Middle) */}
          <path d="M-50,350 C50,250 110,240 160,280 C210,210 300,220 340,300 C390,280 430,320 460,350 Z" className={`opacity-60 fill-current transition-colors duration-1000 ${darkMode ? "text-[#161021]" : "text-[#fdf2f8]"}`} />
          {/* Layer 3 (Front) */}
          <path d="M-50,350 C60,280 100,270 140,310 C180,240 260,250 290,320 C340,310 370,340 390,350 Z" className={`opacity-85 fill-current transition-colors duration-1000 ${darkMode ? "text-[#0c0814]" : "text-[#f1f5f9]"}`} />
        </svg>

        {/* Bottom Right Cloud Cluster */}
        <svg className="absolute bottom-[-8%] right-[-10%] w-[55%] h-[45%] min-w-[320px] fill-current filter blur-[1px] animate-drift-right" viewBox="0 0 500 300">
          {/* Layer 1 (Back) */}
          <path d="M550,350 C470,220 380,200 320,240 C260,160 150,180 110,270 C60,250 10,290 -20,350 Z" className={`opacity-35 fill-current transition-colors duration-1000 ${darkMode ? "text-[#221a30]" : "text-[#ffffff]"}`} />
          {/* Layer 2 (Middle) */}
          <path d="M550,350 C450,250 390,240 340,280 C290,210 200,220 160,300 C110,280 70,320 40,350 Z" className={`opacity-60 fill-current transition-colors duration-1000 ${darkMode ? "text-[#161021]" : "text-[#fdf2f8]"}`} />
          {/* Layer 3 (Front) */}
          <path d="M550,350 C440,280 400,270 360,310 C320,240 240,250 210,320 C160,310 130,340 110,350 Z" className={`opacity-85 fill-current transition-colors duration-1000 ${darkMode ? "text-[#0c0814]" : "text-[#f1f5f9]"}`} />
        </svg>

        {/* Top Left Cloud Cluster */}
        <svg className="absolute top-[-5%] left-[-8%] w-[45%] h-[35%] min-w-[250px] fill-current filter blur-[2px] animate-drift-left" viewBox="0 0 400 200">
          <path d="M-50,-50 C30,70 120,50 160,10 C210,80 300,50 320,-10 C360,10 390,-20 410,-50 Z" className={`opacity-35 fill-current transition-colors duration-1000 ${darkMode ? "text-[#221a30]" : "text-[#ffffff]"}`} />
          <path d="M-50,-50 C20,50 90,40 130,0 C170,60 250,40 270,-20 C310,0 330,-20 350,-50 Z" className={`opacity-65 fill-current transition-colors duration-1000 ${darkMode ? "text-[#161021]" : "text-[#fdf2f8]"}`} />
        </svg>

        {/* Top Right Cloud Cluster */}
        <svg className="absolute top-[-5%] right-[-8%] w-[45%] h-[35%] min-w-[250px] fill-current filter blur-[2px] animate-drift-right" viewBox="0 0 400 200">
          <path d="M450,-50 C370,70 280,50 240,10 C190,80 100,50 80,-10 C40,10 10,-20 -10,-50 Z" className={`opacity-35 fill-current transition-colors duration-1000 ${darkMode ? "text-[#221a30]" : "text-[#ffffff]"}`} />
          <path d="M450,-50 C380,50 310,40 270,0 C230,60 150,40 130,-20 C90,0 70,-20 50,-50 Z" className={`opacity-65 fill-current transition-colors duration-1000 ${darkMode ? "text-[#161021]" : "text-[#fdf2f8]"}`} />
        </svg>
      </div>

      {/* Floating Glassmorphic Theme Toggle */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={toggleTheme}
          className={`p-3.5 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
            darkMode 
              ? "bg-slate-900/75 text-slate-400 border-slate-800 hover:text-indigo-400 hover:shadow-[0_8px_30px_rgb(99,102,241,0.1)]" 
              : "bg-white/80 text-slate-500 border-slate-200 hover:text-indigo-600 hover:shadow-[0_8px_30px_rgb(99,102,241,0.08)]"
          }`}
          title={darkMode ? "الوضع المضيء" : "الوضع المظلم"}
        >
          {darkMode ? (
            <Sun size={20} className="text-amber-500 hover:text-amber-400 transition-transform hover:rotate-45 duration-300" />
          ) : (
            <Moon size={20} className="text-indigo-500 hover:text-indigo-600 transition-transform hover:-rotate-12 duration-300" />
          )}
        </button>
      </div>

      {/* 1. Login Card */}
      {!user ? (
        <div className={`relative z-10 max-w-md w-full backdrop-blur-xl p-8 rounded-[2.5rem] transition-all duration-500 transform hover:scale-[1.01] border ${
          darkMode 
            ? "bg-slate-950/40 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-white" 
            : "bg-white/40 border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-indigo-950"
        }`}>
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center shadow-lg p-2 border select-none transition-all duration-500 ${
              darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/80"
            }`}>
              <img src={logoImg.src} alt="الورشة" className="w-full h-full object-contain" />
            </div>
          </div>
          <h2 className={`text-2xl font-black text-center mb-2 transition-colors duration-500 ${darkMode ? "text-white" : "text-indigo-950"}`}>
            سيستم الورشة
          </h2>
          <p className={`text-center text-sm mb-8 transition-colors duration-500 ${darkMode ? "text-slate-300" : "text-indigo-900/70"}`}>
            الرجاء إدخال بيانات الاعتماد للمتابعة
          </p>

          {error && (
            <div className={`mb-4 p-4 text-xs font-bold rounded-2xl border transition-all duration-500 ${
              darkMode ? "text-rose-400 bg-rose-950/20 border-rose-900/50" : "text-rose-600 bg-rose-50 border-rose-100"
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username input */}
            <div className="relative">
              <User
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-500 ${darkMode ? "text-slate-400" : "text-indigo-900/40"}`}
                size={18}
              />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full p-4 pr-12 rounded-2xl outline-none text-left transition-all duration-500 border focus:ring-4 ${
                  darkMode 
                    ? "bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10" 
                    : "bg-white/60 border-white/60 text-indigo-950 placeholder-indigo-900/35 focus:border-indigo-500 focus:ring-indigo-500/10"
                }`}
                placeholder="اسم المستخدم"
                dir="ltr"
              />
            </div>

            {/* Password input */}
            <div className="relative">
              <Lock
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-500 ${darkMode ? "text-slate-400" : "text-indigo-900/40"}`}
                size={18}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-4 pr-12 rounded-2xl outline-none text-left transition-all duration-500 border focus:ring-4 ${
                  darkMode 
                    ? "bg-white/5 border-white/10 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500/10" 
                    : "bg-white/60 border-white/60 text-indigo-950 placeholder-indigo-900/35 focus:border-indigo-500 focus:ring-indigo-500/10"
                }`}
                placeholder="كلمة المرور"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white p-4 rounded-2xl font-bold transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 cursor-pointer border-0 shadow-md"
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
        <div className={`relative z-10 max-w-lg w-full backdrop-blur-xl p-8 rounded-[2.5rem] transition-all duration-500 border ${
          darkMode 
            ? "bg-slate-950/40 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-white" 
            : "bg-white/40 border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-indigo-950"
        }`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md p-1.5 border shrink-0 select-none transition-all duration-500 ${
                darkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-white/80"
              }`}>
                <img src={logoImg.src} alt="الورشة" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className={`text-2xl font-black transition-colors duration-500 ${darkMode ? "text-white" : "text-indigo-950"}`}>
                  اختر الفرع
                </h2>
                <p className={`text-xs transition-colors duration-500 ${darkMode ? "text-slate-300" : "text-indigo-900/70"}`}>
                  مرحباً {user.username || "بالمستخدم"}، يرجى اختيار الفرع لمتابعة العمل
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                localStorage.removeItem("elwarsha_auth");
                logout();
              }}
              className={`p-2.5 rounded-xl transition-all duration-500 flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                darkMode 
                  ? "bg-rose-950/30 text-rose-400 hover:bg-rose-900/50" 
                  : "bg-rose-50 text-rose-600 hover:bg-rose-100"
              }`}
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>

          {/* Search bar inside the beautiful select UI */}
          {branchesList.length > 4 && (
            <div className="relative mb-4">
              <Search className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors duration-500 ${darkMode ? "text-slate-400" : "text-indigo-900/40"}`} size={16} />
              <input
                type="text"
                placeholder="ابحث عن فرع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-3 pr-10 rounded-xl outline-none text-xs text-right transition-all duration-500 border ${
                  darkMode 
                    ? "bg-white/5 border-white/10 text-white placeholder-slate-400" 
                    : "bg-white/60 border-white/60 text-indigo-950 placeholder-indigo-900/35"
                }`}
              />
            </div>
          )}

          {/* Beautiful Selection List */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {filteredBranches.length === 0 ? (
              <div className={`text-center py-8 text-sm transition-colors duration-500 ${darkMode ? "text-slate-400" : "text-indigo-900/50"}`}>
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
                    className={`w-full group p-4 border rounded-2xl transition-all duration-300 flex items-center justify-between text-right cursor-pointer shadow-sm hover:shadow ${
                      darkMode 
                        ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-indigo-500/50" 
                        : "bg-white/60 border-white/50 hover:bg-indigo-50/50 hover:border-indigo-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                        darkMode 
                          ? "bg-white/5 border-white/5 text-indigo-400 group-hover:scale-105" 
                          : "bg-white/80 border-white/80 text-indigo-600 group-hover:scale-105"
                      }`}>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <span className={`block font-bold transition-colors duration-500 text-sm ${
                          darkMode ? "text-white group-hover:text-indigo-400" : "text-indigo-950 group-hover:text-indigo-600"
                        }`}>
                          {branchName}
                        </span>
                        <span className={`block text-[10px] mt-0.5 transition-colors duration-500 ${
                          darkMode ? "text-slate-400" : "text-indigo-900/50"
                        }`}>
                          كود الفرع: {branchId}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      darkMode 
                        ? "bg-white/5 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/20" 
                        : "bg-white/80 text-indigo-900/40 group-hover:text-indigo-600 group-hover:bg-indigo-50"
                    }`}>
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
