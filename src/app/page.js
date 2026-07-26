"use client";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";
import {
  TrendingUp,
  Users,
  Wrench,
  Wallet,
  Package,
  Activity,
  Sparkles,
  Calendar,
  CheckSquare,
  Plus,
  Trash2,
  Clock,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Award,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/Toast";




export default function Home() {
  const router = useRouter();
  const { user, currentBranchId } = useAuth();
  const [stats, setStats] = useState({ doctorsCount: 0, activeOrdersCount: 0 });

  const [loading, setLoading] = useState(true);

  // حالات مساعد الذكاء الاصطناعي لتحليل المعاملات المالية مع الشات الاستبدالي
  const [showDashboardAiReport, setShowDashboardAiReport] = useState(false);
  const [dashAiLoading, setDashAiLoading] = useState(false);
  const [dashAiReportText, setDashAiReportText] = useState("");
  const [initialDashReportText, setInitialDashReportText] = useState("");
  const [isDashChatMode, setIsDashChatMode] = useState(false);
  const [dashChatInput, setDashChatInput] = useState("");
  const { toastMessage, copyToClipboard } = useToast();

  const handleAnalyzeDashboard = async () => {
    setShowDashboardAiReport(true);
    setDashAiLoading(true);
    setIsDashChatMode(false);

    const doctorsCount = stats.doctorsCount || 0;
    const activeCount = stats.activeOrdersCount || 0;
    const msg = `قم بإنشاء تقرير تحليل ذكي للوحة التحكم. عدد الأطباء المسجلين: ${doctorsCount}، عدد الأجهزة قيد الصيانة: ${activeCount}.`;

    try {
      const res = await fetch(API_ENDPOINTS.aiChat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      if (res.ok) {
        const reply = await res.text();
        setDashAiReportText(reply);
        setInitialDashReportText(reply);
      } else {
        setDashAiReportText("عذراً، حدث خطأ أثناء التواصل.");
      }
    } catch (e) {
      setDashAiReportText("حدث خطأ فني.");
    } finally {
      setDashAiLoading(false);
    }
  };

  const handleSendDashChat = async (e) => {
    e.preventDefault();
    if (!dashChatInput.trim()) return;

    const userText = dashChatInput.trim();
    setDashChatInput("");
    setDashAiLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.aiChat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const reply = await res.text();
        setDashAiReportText(reply);
      } else {
        setDashAiReportText("عذراً، حدث خطأ أثناء التواصل.");
      }
    } catch (e) {
      setDashAiReportText("حدث خطأ فني.");
    } finally {
      setDashAiLoading(false);
    }
  };

  // جلب البيانات من الـ Backend
  useEffect(() => {
    if (!currentBranchId) return;
    const fetchData = async () => {
      try {
        const branchIdStr = String(currentBranchId);
        const [docRes, ordRes] = await Promise.all([
          fetch(API_ENDPOINTS.doctorsByBranch(branchIdStr)).catch(() => ({ json: async () => [] })),
          fetch(API_ENDPOINTS.ordersByBranch(branchIdStr)).catch(() => ({ json: async () => [] }))
        ]);

        const docs = await docRes.json();
        const ords = await ordRes.json();
        
        const docsCount = Array.isArray(docs) ? docs.length : 0;
        const ordsList = Array.isArray(ords) ? ords : [];
        const activeOrdsCount = ordsList.filter(o => o.status !== "تم التوصيل" && o.status !== "تم التسليم").length;

        setStats({ doctorsCount: docsCount, activeOrdersCount: activeOrdsCount });

      } catch (e) {
        console.error("Dashboard fetching error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentBranchId]);



  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 font-sans transition-colors duration-300 relative">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-250/20 dark:border-gray-800/40 pb-6 mb-10" dir="rtl">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
             نظرة عامة <Sparkles className="text-amber-500 animate-pulse" size={24} />
            </h1>
            <p className="text-xs font-semibold text-gray-400 mt-1">الخلاصة الإحصائية والتحليل الذكي لبيانات الورشة والأرباح.</p>
          </div>
          
          {/* زر حلِّل لي المعاملات وولد لي تقرير بالتصميم الجديد وشاين أنيميشن */}
          <button
            type="button"
            onClick={handleAnalyzeDashboard}
            className="relative overflow-hidden group px-7 py-3.5 bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#2563EB] hover:from-[#8B5CF6] hover:to-[#1D4ED8] text-white rounded-full text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98]"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
              initial={{ x: "-100%" }} 
              whileHover={{ x: "100%", transition: { duration: 0.75, ease: "easeInOut" } }} 
            />
            <span>حلِّل لي المعاملات وولد لي تقرير</span> 
            <Sparkles size={15} className="text-amber-300 animate-pulse shrink-0" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-650 border-r-indigo-650 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500 animate-spin [animation-duration:1.5s]"></div>
              <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">جاري التحميل لوحة التحكم الذكية...</span>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {/* 1. الكروت العلوية */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="اجمالى الدكاترة"
                  value={stats.doctorsCount}
                  icon={<Users size={22} />}
                  color="indigo"
                  onClick={() => router.push("/doctors")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="تحت الصيانة"
                  value={stats.activeOrdersCount}
                  icon={<Wrench size={22} />}
                  color="amber"
                  onClick={() => router.push("/maintenance")}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="نظرة عامة"
                  value={`الرئيسية`}
                  icon={<Wallet size={22} />}
                  color="blue"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="الذكاء الاصطناعي"
                  value={`نشط`}
                  icon={<Sparkles size={22} />}
                  color="emerald"
                />
              </motion.div>
            </div>

          </motion.div>
        )}
      </main>

      {/* مودال تقرير شات المساعد الذكي للتحليل العام للمعاملات والورشة (Replaced Chat Popup) */}
      <AnimatePresence>
        {showDashboardAiReport && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowDashboardAiReport(false)}
            dir="rtl"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-gray-150 dark:border-gray-800 shadow-2xl max-w-lg w-full text-right relative overflow-hidden cursor-default space-y-6"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-emerald-500"></div>

              <button
                type="button"
                onClick={() => setShowDashboardAiReport(false)}
                className="absolute top-5 left-5 p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-250 rounded-xl transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                ✨ {isDashChatMode ? "محادثة التحليل العام للورشة" : "تقرير التحليل العام للمعاملات"}
              </h3>

              {dashAiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-650 border-r-indigo-650 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500 animate-spin [animation-duration:1.5s]"></div>
                    <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                    {isDashChatMode ? "جاري توليد الرد الجديد..." : "يقوم المساعد الذكي بتحليل المعاملات وحساب نسب الأرباح..."}
                  </span>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100/50 dark:border-gray-800/30">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-gray-800/30 mb-3">
                      <span className="font-black text-emerald-600 dark:text-emerald-455">
                        {isDashChatMode ? "💡 رد المساعد العام" : "التقرير العام للورشة"}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(dashAiReportText)}
                        className="text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        📋 نسخ النص
                      </button>
                    </div>
                    <p className="text-xs text-gray-750 dark:text-gray-300 leading-relaxed font-semibold whitespace-pre-line text-right" dir="rtl">
                      {dashAiReportText}
                    </p>
                  </div>

                  {/* حقل إدخال شات لوحة التحكم */}
                  {isDashChatMode && (
                    <form onSubmit={handleSendDashChat} className="flex gap-2 border-t border-gray-150/40 dark:border-gray-800/40 pt-4">
                      <input
                        type="text"
                        value={dashChatInput}
                        onChange={(e) => setDashChatInput(e.target.value)}
                        placeholder="اسأل عن سبل زيادة الأرباح، تسليم الصيانات، أو نمو الورشة..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-right font-bold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/10 shrink-0"
                      >
                        إرسال
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-gray-150/40 dark:border-gray-800/40 flex justify-between items-center">
                {!isDashChatMode ? (
                  <button
                    type="button"
                    onClick={() => setIsDashChatMode(true)}
                    className="relative overflow-hidden group px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-full text-xs font-black transition-all shadow-md hover:scale-105 active:scale-95 duration-200 cursor-pointer"
                  >
                    <span>متابعة الدردشة ✨</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDashAiReportText(initialDashReportText);
                      setIsDashChatMode(false);
                    }}
                    className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-150/50 dark:border-emerald-900/40 rounded-full text-xs font-black hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <span>العودة للتقرير الرئيسي 📋</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowDashboardAiReport(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-250 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إغلاق التقرير
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* توست الإشعار العائم للنسخ الناجح */}
      <Toast message={toastMessage} />
    </div>
  );
}

function MetricCard({ title, value, icon, color, onClick }) {
  const themes = {
    indigo: {
      card: "from-indigo-500 via-indigo-600 to-violet-700",
      glow: "bg-violet-400/30",
      shadow: "shadow-indigo-500/40",
    },
    amber: {
      card: "from-amber-400 via-orange-500 to-red-500",
      glow: "bg-orange-300/30",
      shadow: "shadow-amber-500/40",
    },
    blue: {
      card: "from-sky-400 via-blue-500 to-indigo-600",
      glow: "bg-sky-300/30",
      shadow: "shadow-blue-500/40",
    },
    emerald: {
      card: "from-emerald-400 via-teal-500 to-cyan-600",
      glow: "bg-teal-300/30",
      shadow: "shadow-emerald-500/40",
    },
    rose: {
      card: "from-rose-400 via-pink-500 to-fuchsia-600",
      glow: "bg-pink-300/30",
      shadow: "shadow-rose-500/40",
    },
  };
  const t = themes[color] || themes.indigo;
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-gradient-to-br ${t.card} p-6 rounded-3xl shadow-xl ${t.shadow} flex justify-between items-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      {/* Decorative blurred circle */}
      <div className={`absolute -top-6 -left-6 w-28 h-28 rounded-full blur-2xl ${t.glow}`} />
      {/* Shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/20" />

      <div className="relative z-10">
        <p className="text-sm font-bold text-white/75 mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
      </div>
      <div className="relative z-10 p-3.5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20 text-white shrink-0">
        {icon}
      </div>
    </div>
  );
}

