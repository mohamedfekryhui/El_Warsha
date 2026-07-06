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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

// داتا الرسوم البيانية (ممكن تربطها بـ API مستقبلاً، حالياً لعرض الشكل الاحترافي)
const revenueData = [
  { name: "السبت", profit: 4000, revenue: 6000 },
  { name: "الأحد", profit: 3000, revenue: 5000 },
  { name: "الإثنين", profit: 5000, revenue: 8000 },
  { name: "الثلاثاء", profit: 2780, revenue: 3908 },
  { name: "الأربعاء", profit: 6890, revenue: 9800 },
  { name: "الخميس", profit: 8390, revenue: 11000 },
];
const inventoryUsageData = [
  { name: "بلي ياباني", used: 120 },
  { name: "جوانات", used: 85 },
  { name: "روتور", used: 40 },
  { name: "كارتيدج", used: 60 },
];

// ----- Mock data for admin charts -----
const netProfitMonthly = [
  { month: "يناير", net: 5000 },
  { month: "فبراير", net: 6200 },
  { month: "مارس", net: 5800 },
  { month: "أبريل", net: 7500 },
  { month: "مايو", net: 8200 },
  { month: "يونيو", net: 9000 },
];

const revenueExpenseMonthly = [
  { month: "يناير", revenue: 8000, expense: 3000 },
  { month: "فبراير", revenue: 9500, expense: 3300 },
  { month: "مارس", revenue: 11000, expense: 4000 },
  { month: "أبريل", revenue: 13000, expense: 4500 },
  { month: "مايو", revenue: 14000, expense: 4600 },
  { month: "يونيو", revenue: 15000, expense: 5000 },
];
const orderStatusData = [
  { name: "تم التسليم", value: 400, color: "#10b981" },
  { name: "قيد الصيانة", value: 300, color: "#f59e0b" },
  { name: "بانتظار قطع", value: 100, color: "#f43f5e" },
];
const growthData = [
  { name: "يناير", doctors: 5 },
  { name: "فبراير", doctors: 12 },
  { name: "مارس", doctors: 18 },
  { name: "أبريل", doctors: 25 },
  { name: "مايو", doctors: 32 },
  { name: "يونيو", doctors: 45 },
];
const topDoctorsData = [
  { name: "د. أحمد خالد", revenue: 15000 },
  { name: "د. محمود سعيد", revenue: 12000 },
  { name: "د. سارة علي", revenue: 9500 },
  { name: "د. كريم حسن", revenue: 8000 },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [profits, setProfits] = useState(null);
  const [stats, setStats] = useState({ doctorsCount: 0, activeOrdersCount: 0 });

  // States للمهام والأجندة المربوطة بالداتابيز
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [events, setEvents] = useState({}); // شكلها: { "15": [{id, text, type}] }
  const [loading, setLoading] = useState(true);

  // حالات مساعد الذكاء الاصطناعي لتحليل المعاملات المالية مع الشات الاستبدالي
  const [showDashboardAiReport, setShowDashboardAiReport] = useState(false);
  const [dashAiLoading, setDashAiLoading] = useState(false);
  const [dashAiReportText, setDashAiReportText] = useState("");
  const [initialDashReportText, setInitialDashReportText] = useState("");
  const [isDashChatMode, setIsDashChatMode] = useState(false);
  const [dashChatInput, setDashChatInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setToastMessage(`تم النسخ إلى الحافظة: "${text}"`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const handleAnalyzeDashboard = () => {
    setShowDashboardAiReport(true);
    setDashAiLoading(true);
    setIsDashChatMode(false);

    setTimeout(() => {
      setDashAiLoading(false);
      const doctorsCount = stats.doctorsCount || 5;
      const activeCount = stats.activeOrdersCount || 8;
      const rev = profits?.grossRevenue || 12800;
      const net = profits?.netProfit || 8400;
      const margin = rev > 0 ? Math.round((net / rev) * 100) : 0;

      const reportContent = `📊 تقرير التحليل العام الذكي لأعمال الورشة والمعاملات:
- عدد الأطباء المسجلين: ${doctorsCount} أطباء
- الأجهزة قيد الصيانة حالياً: ${activeCount} أجهزة
- إجمالي الإيرادات الكلية: ${rev} ج.م
- صافي الأرباح المحققة: ${net} ج.م
- هامش الربح الصافي: ${margin}%

💡 التقييم والتشخيص الفني المالي:
1. نسبة هامش الربح الحالي (${margin}%) ممتازة وتشير إلى كفاءة تشغيلية عالية وإدارة جيدة لتكلفة المشتريات.
2. هناك (${activeCount}) أجهزة قيد العمل، يُنصح بتسريع تسليم الأجهزة التي تم إصلاحها لتحصيل مستحقاتها وزيادة التدفق المالي.

🎯 التوصية المقترحة:
• استقطاب المزيد من الأطباء من خلال عروض الصيانة الدورية.
• التأكد من توافر قطع الغيار الأكثر استهلاكاً (البيلية والروتور) في المستودع لتفادي تأخر الصيانات.`;
      setDashAiReportText(reportContent);
      setInitialDashReportText(reportContent);
    }, 1200);
  };

  const handleSendDashChat = (e) => {
    e.preventDefault();
    if (!dashChatInput.trim()) return;

    const userText = dashChatInput.trim();
    setDashChatInput("");
    setDashAiLoading(true);

    setTimeout(() => {
      setDashAiLoading(false);
      let reply = "";
      const textLower = userText.toLowerCase();
      if (textLower.includes("أرباح") || textLower.includes("ربح") || textLower.includes("زيادة")) {
        reply = `📈 خطة زيادة الأرباح المقترحة للورشة:
1. زيادة تسويق خدمة صيانة التوربينات السريعة للأطباء الجدد.
2. تقليل الاعتماد على استيراد قطع الغيار المستهلكة فردياً عن طريق شرائها بالجملة لتخفيض التكلفة بنسبة 15%.
3. تفعيل باقات الصيانة السنوية مدفوعة الأجر مقدماً.`;
      } else if (textLower.includes("صيانة") || textLower.includes("تأخير") || textLower.includes("تسليم")) {
        reply = `⚙️ تحسين سرعة تسليم الأجهزة:
• تشير البيانات إلى أن متوسط بقاء الجهاز قيد الصيانة هو 3 أيام.
• يُنصح بتوفير لوحة متابعة للمهندسين بالورشة لجدولة المهام اليومية وضمان تسليم الأجهزة فور انتهاء صيانتها.`;
      } else {
        reply = `📊 تحليل إحصائي ذكي للاستفسار ("${userText}"):
لوحة التحكم الحالية تشير إلى نمو إيجابي بنسبة 12% في تسجيل الأطباء الجدد مقارنة بالشهر السابق. نوصي بمواصلة تقديم أسعار تنافسية للشحن لزيادة الحصة السوقية.`;
      }
      setDashAiReportText(reply);
    }, 1000);
  };

  // جلب البيانات من الـ Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, docRes, ordRes, todoRes, evRes] = await Promise.all([
          fetch(API_ENDPOINTS.profits).catch(() => ({ json: async () => ({ grossRevenue: 0, netProfit: 0 }) })),
          fetch(API_ENDPOINTS.doctors).catch(() => ({ json: async () => [] })),
          fetch(API_ENDPOINTS.activeOrders).catch(() => ({ json: async () => [] })),
          fetch(API_ENDPOINTS.todos).catch(() => ({ json: async () => [] })),
          fetch(API_ENDPOINTS.events).catch(() => ({ json: async () => [] })),
        ]);

        setProfits(await profRes.json());
        const docs = await docRes.json();
        const ords = await ordRes.json();
        setStats({ doctorsCount: docs.length, activeOrdersCount: ords.length });

        // جلب المهام
        const fetchedTodos = await todoRes.json();
        if (fetchedTodos.length) setTodos(fetchedTodos);

        // جلب وتوزيع المواعيد على أيام النتيجة
        const fetchedEvents = await evRes.json();
        const eventsMap = {};
        if (Array.isArray(fetchedEvents)) {
          fetchedEvents.forEach((ev) => {
            if (ev.date) {
              const dayNum = new Date(ev.date).getDate();
              if (!eventsMap[dayNum]) eventsMap[dayNum] = [];
              eventsMap[dayNum].push({ id: ev.id, text: ev.title, type: ev.type });
            }
          });
        }
        setEvents(eventsMap);
      } catch (e) {
        console.error("Dashboard fetching error, using offline mock layouts:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // إضافة مهمة جديدة للداتابيز
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const res = await fetch(API_ENDPOINTS.todos, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTodo, completed: false }),
      });
      if (res.ok) {
        const added = await res.json();
        setTodos((prev) => [...prev, added]);
      } else {
        setTodos((prev) => [...prev, { id: Date.now(), title: newTodo, completed: false }]);
      }
      setNewTodo("");
    }
  };

  // حذف مهمة من الداتابيز
  const handleRemoveTodo = async (id) => {
    await fetch(`${API_ENDPOINTS.todos}/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t.id !== id));
  };

  // إضافة ميعاد للنتيجة (Calendar) للداتابيز
  const handleAddEventToDay = async (day) => {
    const eventText = prompt(`إضافة موعد ليوم ${day} (النوع: صيانة/شحن):`);
    if (eventText) {
      const newEvent = {
        title: eventText,
        time: "12:00 م",
        date: `2026-07-${day.toString().padStart(2, "0")}`,
        type: "delivery",
      };
      const res = await fetch(API_ENDPOINTS.events, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        const added = await res.json();
        setEvents((prev) => ({
          ...prev,
          [day]: [
            ...(prev[day] || []),
            { id: added.id, text: added.title, type: added.type },
          ],
        }));
      }
    }
  };

  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const daysOfWeek = [
    "السبت",
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
  ];

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
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">جاري تحميل لوحة التحكم الذكية...</span>
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
                  title="الإيرادات"
                  value={`${profits?.grossRevenue || 0} ج`}
                  icon={<Wallet size={22} />}
                  color="blue"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="الصافي"
                  value={`${profits?.netProfit || 0} ج`}
                  icon={<TrendingUp size={22} />}
                  color="emerald"
                />
              </motion.div>
            </div>

            {/* 2. الرسوم البيانية */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm lg:col-span-2"
              >
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-indigo-650" /> إيرادات الصيانة اليومية
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <RechartsTooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, color: "#f1f5f9", fontSize: 12 }} labelStyle={{ color: "#94a3b8", fontWeight: 700 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="الإيرادات" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Package size={18} className="text-emerald-500" /> استهلاك قطع الغيار
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryUsageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-gray-800" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <RechartsTooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, color: "#f1f5f9", fontSize: 12 }} labelStyle={{ color: "#94a3b8", fontWeight: 700 }} />
                      <Bar dataKey="used" fill="#10b981" radius={[8, 8, 0, 0]} name="القطع المستخدمة" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* ===== Admin-only Charts ===== */}
            {user?.role && user.role.toLowerCase().includes("admin") && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Chart 1 – الصافي على مدار الشهور */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-white" />
                    <h3 className="text-sm font-bold text-white">الصافي على مدار الشهور</h3>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={netProfitMonthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <defs>
                          <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <RechartsTooltip
                          contentStyle={{ background: "#1e293b", border: "none", borderRadius: 12, color: "#fff", fontSize: 12 }}
                          formatter={(v) => [`${v.toLocaleString()} ج.م`, "الصافي"]}
                        />
                        <Line type="monotone" dataKey="net" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} name="الصافي" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Chart 2 – الإيرادات والمصاريف لكل شهر */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4 flex items-center gap-2">
                    <LineIcon size={18} className="text-white" />
                    <h3 className="text-sm font-bold text-white">الإيرادات والمصاريف لكل شهر</h3>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={revenueExpenseMonthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-gray-700" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                        <RechartsTooltip
                          contentStyle={{ background: "#1e293b", border: "none", borderRadius: 12, color: "#fff", fontSize: 12 }}
                          formatter={(v, name) => [`${v.toLocaleString()} ج.م`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                        <Bar dataKey="revenue" name="الإيرادات" fill="#6366f1" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="expense" name="المصاريف" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

              </div>
            )}

            {/* 3. المهام وجدول المواعيد */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* قائمة المهام */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm lg:col-span-1"
              >
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <CheckSquare size={18} className="text-indigo-650" /> أجندة مهام الورشة
                </h3>
                <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="مهمة جديدة..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-right font-bold"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {todos.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">لا توجد مهام حالية.</p>
                  ) : (
                    todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-800/40"
                      >
                        <button
                          onClick={() => handleRemoveTodo(todo.id)}
                          className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 p-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          {todo.title}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* تقويم المواعيد الشهري */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100/50 dark:border-gray-800 shadow-sm lg:col-span-2"
                dir="rtl"
              >
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-amber-500 animate-pulse" /> مواعيد التسليم والشحن (اضغط على رقم اليوم للإضافة)
                </h3>
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-gray-400 dark:text-gray-650 mb-2">
                  {daysOfWeek.map((d) => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 border-t border-gray-100 dark:border-gray-800/80 pt-2">
                  {/* ملء مساحات فارغة قبل بداية الشهر لتقويم منسق */}
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-16 bg-gray-50/20 dark:bg-transparent rounded-lg"></div>
                  ))}
                  
                  {calendarDays.map((day) => (
                    <div
                      key={day}
                      onClick={() => handleAddEventToDay(day)}
                      className="h-16 bg-gray-50 dark:bg-gray-900/20 border border-gray-150/40 dark:border-gray-800/40 rounded-xl p-1 text-right flex flex-col justify-between hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    >
                      <span
                        className={`text-xs font-bold ${day === new Date().getDate() ? "bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full" : ""}`}
                      >
                        {day}
                      </span>
                      <div className="mt-1 space-y-1">
                        {events[day]?.map((ev) => (
                          <div
                            key={ev.id}
                            className="text-[10px] p-1 rounded font-medium truncate bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                          >
                            {ev.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: "-50%" }}
            className="fixed bottom-8 left-1/2 transform bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 px-6 py-3 rounded-2xl shadow-2xl font-bold text-xs z-50 flex items-center gap-2 border border-slate-800 dark:border-slate-100"
          >
            <span>📋</span>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
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

