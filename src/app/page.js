"use client";
import Sidebar from "@/components/Sidebar";
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
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [profits, setProfits] = useState(null);
  const [stats, setStats] = useState({ doctorsCount: 0, activeOrdersCount: 0 });

  // States للمهام والأجندة المربوطة بالداتابيز
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [events, setEvents] = useState({}); // شكلها: { "15": [{id, text, type}] }
  const [loading, setLoading] = useState(true);

  // جلب البيانات من الـ Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, docRes, ordRes, todoRes, evRes] = await Promise.all([
          fetch(API_ENDPOINTS.profits),
          fetch(API_ENDPOINTS.doctors),
          fetch(API_ENDPOINTS.activeOrders),
          fetch(API_ENDPOINTS.todos).catch(() => ({ json: () => [] })), // لو لسه معملتش الكنترولر ميكراشش
          fetch(API_ENDPOINTS.events).catch(() => ({ json: () => [] })),
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
        if (fetchedEvents.length) {
          fetchedEvents.forEach((ev) => {
            const day = parseInt(ev.date.split("-")[2]); // افتراض التاريخ YYYY-MM-DD
            if (!eventsMap[day]) eventsMap[day] = [];
            eventsMap[day].push({ id: ev.id, text: ev.title, type: ev.type });
          });
          setEvents(eventsMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // إضافة مهمة للداتابيز
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const res = await fetch(API_ENDPOINTS.todos, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTodo }),
    });
    if (res.ok) {
      const added = await res.json();
      setTodos([...todos, added]);
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
    0,
  ).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
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
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 font-sans transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
           نظرة عامة <Sparkles className="text-amber-500" size={24} />
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center h-64 items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600"></div>
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
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <MetricCard
                  title="تحت الصيانة"
                  value={stats.activeOrdersCount}
                  icon={<Wrench size={22} />}
                  color="amber"
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

            {/* 2. الصف الأول من الرسوم البيانية (Area + Pie) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm h-80"
              >
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" size={20} /> مؤشر
                  الإيرادات والأرباح
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.2}
                    />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: "#1e293b",
                        color: "#fff",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      fill="#6366f1"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm h-80"
              >
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <PieIcon className="text-rose-500" size={20} /> حالات الصيانة
                  الحالية
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: "#1e293b",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* 3. الصف الثاني من الرسوم البيانية (Line + 2 Bar Charts) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm h-72"
              >
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <LineIcon className="text-blue-500" size={20} /> نمو قاعدة
                  العملاء
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={growthData}>
                    <XAxis dataKey="name" hide />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        backgroundColor: "#1e293b",
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="doctors"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm h-72"
              >
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Activity className="text-amber-500" size={20} /> أكثر القطع
                  سحباً
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={inventoryUsageData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar dataKey="used" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm h-72"
              >
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Award className="text-indigo-500" size={20} /> كبار العملاء
                  (الإيرادات)
                </h3>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={topDoctorsData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={90}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#6366f1"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* 4. المهام والنتيجة (مربوطين بالداتابيز) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* To-Do List */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800/60 flex flex-col h-[450px]"
              >
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <CheckSquare className="text-indigo-500" size={20} /> مهام
                  الورشة الفورية
                </h3>
                <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="مهمة جديدة..."
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white p-3 rounded-xl"
                  >
                    <Plus size={18} />
                  </button>
                </form>
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  <AnimatePresence>
                    {todos.map((t) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl group"
                      >
                        <span className="text-sm font-medium">{t.text}</span>
                        <button
                          onClick={() => handleRemoveTodo(t.id)}
                          className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* 📅 Google Calendar Clone */}
              <motion.div
                variants={itemVariants}
                className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800/60 h-[450px] flex flex-col"
              >
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Calendar className="text-blue-500" size={20} /> أجندة الورشة
                  التفاعلية
                </h3>
                <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex-1">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="bg-gray-50 dark:bg-gray-800 p-2 text-center text-xs font-bold text-gray-500"
                    >
                      {day}
                    </div>
                  ))}
                  {daysArray.map((day) => (
                    <div
                      key={day}
                      onClick={() => handleAddEventToDay(day)}
                      className="bg-white dark:bg-[#1E293B] p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer group relative overflow-y-auto"
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
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
    rose: "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
  };
  return (
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
      <div>
        <p className="text-sm font-bold text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-black">{value}</h3>
      </div>
      <div className={`p-3.5 rounded-2xl ${colors[color]}`}>{icon}</div>
    </div>
  );
}
