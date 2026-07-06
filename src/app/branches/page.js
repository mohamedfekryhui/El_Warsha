"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  MapPin,
  TrendingUp,
  Users,
  Wrench,
  Wallet,
  Activity,
  BarChart2,
  RefreshCw,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  LineChart,
  Line,
} from "recharts";

// ============================================================
// Mock data — wire to real API when backend is ready
// ============================================================
const BRANCH_DATA = [
  {
    id: "main",
    name: "الفرع الرئيسي",
    location: "المقر الرئيسي",
    status: "active",
    color: "#f59e0b",
    gradient: "from-amber-500 to-orange-500",
    kpis: { revenue: 62000, expenses: 27500, net: 34500, doctors: 25, activeOrders: 18, deliveredThisMonth: 52 },
    trend: +18,
    monthly: [
      { month: "يناير", revenue: 42000, expenses: 19000 },
      { month: "فبراير", revenue: 48000, expenses: 21000 },
      { month: "مارس",  revenue: 54000, expenses: 23000 },
      { month: "أبريل", revenue: 57000, expenses: 24500 },
      { month: "مايو",  revenue: 60000, expenses: 26000 },
      { month: "يونيو", revenue: 62000, expenses: 27500 },
    ],
  },
  {
    id: "serw",
    name: "فرع السرو",
    location: "السرو، دمياط",
    status: "active",
    color: "#6366f1",
    gradient: "from-indigo-500 to-violet-600",
    kpis: { revenue: 48200, expenses: 21000, net: 27200, doctors: 18, activeOrders: 12, deliveredThisMonth: 34 },
    trend: +12,
    monthly: [
      { month: "يناير", revenue: 32000, expenses: 15000 },
      { month: "فبراير", revenue: 38000, expenses: 17000 },
      { month: "مارس",  revenue: 41000, expenses: 18500 },
      { month: "أبريل", revenue: 44000, expenses: 19000 },
      { month: "مايو",  revenue: 46000, expenses: 20000 },
      { month: "يونيو", revenue: 48200, expenses: 21000 },
    ],
  },
  {
    id: "newdamietta",
    name: "فرع دمياط الجديدة",
    location: "دمياط الجديدة",
    status: "active",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-600",
    kpis: { revenue: 31500, expenses: 14200, net: 17300, doctors: 11, activeOrders: 7, deliveredThisMonth: 21 },
    trend: +5,
    monthly: [
      { month: "يناير", revenue: 22000, expenses: 10500 },
      { month: "فبراير", revenue: 25000, expenses: 11000 },
      { month: "مارس",  revenue: 27000, expenses: 12000 },
      { month: "أبريل", revenue: 29000, expenses: 13000 },
      { month: "مايو",  revenue: 30500, expenses: 13800 },
      { month: "يونيو", revenue: 31500, expenses: 14200 },
    ],
  },
];

const comparisonData = BRANCH_DATA.map((b) => ({
  name: b.name.replace("فرع ", ""),
  الإيرادات: b.kpis.revenue,
  المصاريف: b.kpis.expenses,
  الصافي: b.kpis.net,
}));

const radarData = [
  { metric: "الإيرادات",   "الرئيسي": 100, "السرو": 78, "دمياط الجديدة": 51 },
  { metric: "الأطباء",     "الرئيسي": 100, "السرو": 72, "دمياط الجديدة": 44 },
  { metric: "الصيانات",    "الرئيسي": 100, "السرو": 67, "دمياط الجديدة": 39 },
  { metric: "التسليمات",   "الرئيسي": 100, "السرو": 65, "دمياط الجديدة": 40 },
  { metric: "الصافي",      "الرئيسي": 100, "السرو": 79, "دمياط الجديدة": 50 },
];

// ── animation variants ──────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const darkTooltip = {
  contentStyle: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 12,
    color: "#f1f5f9",
    fontSize: 12,
  },
  labelStyle: { color: "#94a3b8", fontWeight: 700 },
};

// ── sub-components ──────────────────────────────────────────
function TrendBadge({ value }) {
  const pos = value > 0;
  const zero = value === 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
      zero  ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            : pos ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
    }`}>
      {pos ? <ArrowUpRight size={12} /> : zero ? <Minus size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value)}%
    </span>
  );
}

function MiniKpi({ icon, label, value, sub, color }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/60">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "22", color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold truncate">{label}</p>
        <p className="text-base font-black text-gray-900 dark:text-white leading-tight truncate">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function BranchCard({ branch }) {
  const [expanded, setExpanded] = useState(false);
  const margin = Math.round((branch.kpis.net / branch.kpis.revenue) * 100);

  return (
    <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${branch.gradient} px-6 py-5 flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-black text-white text-base leading-tight">{branch.name}</h3>
            <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={11} /> {branch.location}
            </p>
          </div>
        </div>
        <div className="text-left shrink-0">
          <TrendBadge value={branch.trend} />
          <p className="text-white/60 text-[10px] mt-1 text-left">vs الشهر الماضي</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-3 flex-1">
          <MiniKpi icon={<Wallet size={17} />}    label="الإيرادات"       value={`${branch.kpis.revenue.toLocaleString()} ج.م`}  color={branch.color} />
          <MiniKpi icon={<TrendingUp size={17} />} label="الصافي"          value={`${branch.kpis.net.toLocaleString()} ج.م`}      sub={`هامش ${margin}%`} color="#10b981" />
          <MiniKpi icon={<Users size={17} />}      label="الأطباء"         value={branch.kpis.doctors}                            color="#6366f1" />
          <MiniKpi icon={<Wrench size={17} />}     label="قيد الصيانة"    value={branch.kpis.activeOrders}                       sub={`تم تسليم ${branch.kpis.deliveredThisMonth} هذا الشهر`} color="#f59e0b" />
        </div>

        {/* Margin bar */}
        <div>
          <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
            <span>هامش الربح الصافي</span>
            <span style={{ color: branch.color }}>{margin}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${margin}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: branch.color }}
            />
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors pt-3 border-t border-gray-100 dark:border-gray-800 cursor-pointer"
        >
          <span>📈 الأداء الشهري</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={branch.monthly} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip {...darkTooltip} formatter={(v) => [`${v.toLocaleString()} ج.م`]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="revenue" stroke={branch.color} strokeWidth={2} dot={false} name="الإيرادات" />
                  <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} dot={false} name="المصاريف" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main page ───────────────────────────────────────────────
export default function BranchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("cards");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");

  const handleAiAnalyze = () => {
    setShowAiModal(true);
    setAiLoading(true);
    setAiReport("");
    setTimeout(() => {
      const best = BRANCH_DATA.reduce((a, b) => b.kpis.net > a.kpis.net ? b : a);
      const worst = BRANCH_DATA.reduce((a, b) => b.kpis.net < a.kpis.net ? b : a);
      const totalRev = BRANCH_DATA.reduce((s, b) => s + b.kpis.revenue, 0);
      const totalNet = BRANCH_DATA.reduce((s, b) => s + b.kpis.net, 0);
      const margin = Math.round((totalNet / totalRev) * 100);
      setAiReport(
`🏢 تحليل ذكي شامل للفروع:

🏆 أفضل فرع (صافي): ${best.name} — ${best.kpis.net.toLocaleString()} ج.م
📋 فرع يحتاج متابعة: ${worst.name} — ${worst.kpis.net.toLocaleString()} ج.م
💰 إجمالي إيرادات الفروع: ${totalRev.toLocaleString()} ج.م
📈 إجمالي الصافي: ${totalNet.toLocaleString()} ج.م (هامش ${margin}%)

💡 توصيات استراتيجية:
• تحليل أسباب تفوق ${best.name} وتطبيق نفس الإجراءات على باقي الفروع.
• دعم ${worst.name} بخطة تسويقية مكثفة وزيادة عدد الأطباء فيه.
• هامش الربح ${margin}% مقبول — يمكن تحسينه بتخفيض تكلفة قطع الغيار بالشراء بالجملة.`
      );
      setAiLoading(false);
    }, 1200);
  };

  const isAdmin = Boolean(user?.role && user.role.toLowerCase().includes("admin"));

  useEffect(() => {
    if (user !== undefined && !isAdmin) router.push("/");
  }, [user, isAdmin, router]);

  const totalRevenue = BRANCH_DATA.reduce((s, b) => s + b.kpis.revenue, 0);
  const totalNet     = BRANCH_DATA.reduce((s, b) => s + b.kpis.net, 0);
  const totalDoctors = BRANCH_DATA.reduce((s, b) => s + b.kpis.doctors, 0);
  const totalOrders  = BRANCH_DATA.reduce((s, b) => s + b.kpis.activeOrders, 0);

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0F172A] font-[var(--font-geist-sans)] text-gray-900 dark:text-white" dir="rtl">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 max-w-7xl mx-auto">

          {/* ── Header ── */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Building2 size={20} className="text-white" />
                </div>
                نظرة عامة على الفروع
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">مقارنة الأداء والإحصائيات لجميع الفروع — للمدير فقط</p>
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 shadow-sm self-start gap-3">
              <button
                onClick={handleAiAnalyze}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-300 animate-pulse" />
                تحليل الفروع ذكياً
              </button>
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900/30 rounded-xl p-1">
              {[
                { id: "cards",   label: "بطاقات",  icon: <Package size={14} /> },
                { id: "compare", label: "مقارنة",   icon: <BarChart2 size={14} /> },
                { id: "radar",   label: "رادار",    icon: <Activity size={14} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
              </div>
            </div>
          </motion.div>

          {/* ── Summary KPI strip ── */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Wallet size={20} />,    label: "إجمالي الإيرادات",    value: `${totalRevenue.toLocaleString()} ج.م`, color: "#6366f1" },
              { icon: <TrendingUp size={20} />, label: "إجمالي الصافي",       value: `${totalNet.toLocaleString()} ج.م`,     color: "#10b981" },
              { icon: <Users size={20} />,      label: "إجمالي الدكاترة",      value: totalDoctors,                           color: "#f59e0b" },
              { icon: <Wrench size={20} />,     label: "معدات قيد الصيانة",   value: totalOrders,                            color: "#f43f5e" },
            ].map((item, i) => (
              <motion.div key={i} variants={itemVariants}
                className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 flex items-center gap-4 shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: item.color + "20", color: item.color }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{item.label}</p>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{item.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Tab Content ── */}
          <AnimatePresence mode="wait">

            {/* CARDS */}
            {activeTab === "cards" && (
              <motion.div key="cards" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {BRANCH_DATA.map((branch) => <BranchCard key={branch.id} branch={branch} />)}
              </motion.div>
            )}

            {/* COMPARE */}
            {activeTab === "compare" && (
              <motion.div key="compare" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Bar chart */}
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-4 flex items-center gap-2">
                    <BarChart2 size={18} className="text-white" />
                    <h3 className="text-sm font-bold text-white">مقارنة الإيرادات والمصاريف والصافي — جميع الفروع</h3>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={360}>
                      <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                        <RechartsTooltip {...darkTooltip} formatter={(v) => [`${v.toLocaleString()} ج.م`]} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                        <Bar dataKey="الإيرادات" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="المصاريف"  fill="#f43f5e" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="الصافي"    fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary table */}
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <RefreshCw size={16} className="text-indigo-500" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">ملخص مفصل</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/40">
                          {["الفرع", "الإيرادات", "المصاريف", "الصافي", "هامش الربح", "الأطباء", "الصيانات النشطة", "الاتجاه"].map((h) => (
                            <th key={h} className="px-5 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {BRANCH_DATA.map((b) => {
                          const margin = Math.round((b.kpis.net / b.kpis.revenue) * 100);
                          return (
                            <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                              <td className="px-5 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                <span className="inline-flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: b.color }} />
                                  {b.name}
                                </span>
                              </td>
                              <td className="px-5 py-4 font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">{b.kpis.revenue.toLocaleString()} ج.م</td>
                              <td className="px-5 py-4 font-semibold text-rose-500 whitespace-nowrap">{b.kpis.expenses.toLocaleString()} ج.م</td>
                              <td className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{b.kpis.net.toLocaleString()} ج.م</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2 min-w-[100px]">
                                  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                    <div className="h-full rounded-full" style={{ width: `${margin}%`, background: b.color }} />
                                  </div>
                                  <span className="text-xs font-bold shrink-0" style={{ color: b.color }}>{margin}%</span>
                                </div>
                              </td>
                              <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">{b.kpis.doctors}</td>
                              <td className="px-5 py-4 font-semibold text-gray-700 dark:text-gray-300">{b.kpis.activeOrders}</td>
                              <td className="px-5 py-4"><TrendBadge value={b.trend} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* RADAR */}
            {activeTab === "radar" && (
              <motion.div key="radar" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4 flex items-center gap-2">
                    <Activity size={18} className="text-white" />
                    <h3 className="text-sm font-bold text-white">رادار أداء الفروع — مقارنة شاملة</h3>
                  </div>
                  <div className="p-6 flex justify-center">
                    <ResponsiveContainer width="100%" height={440}>
                      <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                        <PolarGrid stroke="#1e293b" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 13, fontWeight: 700 }} />
                        <RechartsTooltip {...darkTooltip} formatter={(v) => [`${v}%`]} />
                        <Radar name="الرئيسي"        dataKey="الرئيسي"        stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.22} strokeWidth={2} />
                        <Radar name="فرع السرو"      dataKey="السرو"           stroke="#6366f1" fill="#6366f1" fillOpacity={0.22} strokeWidth={2} />
                        <Radar name="دمياط الجديدة"  dataKey="دمياط الجديدة"  stroke="#10b981" fill="#10b981" fillOpacity={0.22} strokeWidth={2} />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
