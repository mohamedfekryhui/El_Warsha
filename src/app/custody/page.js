"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/AuthContext";
import { MapPin, Plus, Package, Trash2, ShieldCheck, AlertCircle, FileSpreadsheet, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const containerVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.08 } }
};
const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const COLORS = ["#6366F1", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function CustodyPage() {
  const { user, currentBranchId } = useAuth();
  
  // التحقق من صلاحيات المشرف (Admin)
  const userRole = user?.role || "";
  const isAdmin = typeof userRole === "string" && userRole.toLowerCase().includes("admin");

  // الفروع المتاحة
  const branches = user?.branches || [];
  
  // الفرع المختار افتراضياً
  const [selectedBranch, setSelectedBranch] = useState("");

  // تعيين الفرع الافتراضي عند التحميل
  useEffect(() => {
    if (currentBranchId !== null && currentBranchId !== undefined && currentBranchId !== "") {
      setSelectedBranch(String(currentBranchId));
    } else if (branches.length > 0) {
      const firstBranch = branches[0];
      const firstId = typeof firstBranch === "object" ? firstBranch.id : firstBranch;
      setSelectedBranch(String(firstId));
    } else {
      setSelectedBranch("الرئيسي");
    }
  }, [currentBranchId, branches]);

  // قائمة العهود المخزنة محلياً
  const [custodyData, setCustodyData] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("elwarsha_custody_data");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      { id: 1, branchId: "الرئيسي", name: "ميكروسكوب صيانة هاندبيس", price: 25000, dateAdded: "2026-07-01" },
      { id: 2, branchId: "الرئيسي", name: "جهاز اختبار ضغط الهواء", price: 4500, dateAdded: "2026-07-02" },
      { id: 3, branchId: "الرئيسي", name: "طقم مفكات ألواح دقيقة", price: 800, dateAdded: "2026-07-03" },
      { id: 4, branchId: "1", name: "كومبريسور صامت 50 لتر", price: 12000, dateAdded: "2026-07-01" },
      { id: 5, branchId: "1", name: "جهاز تنظيف التراسونيك", price: 3500, dateAdded: "2026-07-02" },
      { id: 6, branchId: "1", name: "جهاز تزييت هاندبيس أوتوماتيك", price: 9000, dateAdded: "2026-07-03" }
    ];
  });

  // مزامنة البيانات مع localStorage
  useEffect(() => {
    localStorage.setItem("elwarsha_custody_data", JSON.stringify(custodyData));
  }, [custodyData]);

  // حقول إضافة عهدة جديدة (للأدمن فقط)
  const [newToolName, setNewToolName] = useState("");
  const [newToolPrice, setNewToolPrice] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState("");

  const handleAiAnalyze = () => {
    setShowAiModal(true);
    setAiLoading(true);
    setAiReport("");
    setTimeout(() => {
      const totalValue = custodyData.reduce((s, c) => s + (parseFloat(c.price) || 0), 0);
      const totalItems = custodyData.length;
      const branches = Array.from(new Set(custodyData.map(c => c.branchId))).length;
      const avgValue = totalItems > 0 ? Math.round(totalValue / totalItems) : 0;
      setAiReport(
`📦 تقرير تحليل عهدة الفروع الذكي:

🏢 عدد الفروع المسجلة: ${branches}
🔧 إجمالي العهد: ${totalItems} عنصر
💰 إجمالي القيمة: ${totalValue.toLocaleString()} ج.م
📊 متوسط قيمة العنصر الواحد: ${avgValue.toLocaleString()} ج.م

💡 التوصيات:
• مراجعة العهدة ذات القيمة العالية والتحقق من سلامتها دورياً.
• توثيق العهدة بالصور وأرقام التسلسل لكل عنصر في حال الفقد.
• تأمين على العهدة ذات القيمة التضخمية العالية (> 10,000 ج.م).`
      );
      setAiLoading(false);
    }, 1200);
  };

  const handleAddCustody = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("عذراً، إضافة العهدة متاحة للمشرفين فقط.");
      return;
    }
    if (!newToolName.trim() || !newToolPrice) return;

    const newItem = {
      id: Date.now(),
      branchId: selectedBranch,
      name: newToolName.trim(),
      price: parseFloat(newToolPrice || 0),
      dateAdded: new Date().toISOString().split("T")[0]
    };

    setCustodyData((prev) => [...prev, newItem]);
    alert("تم إضافة العهدة بنجاح للفرع! 📦");
    setNewToolName("");
    setNewToolPrice("");
  };

  // تعديل حقل محدد في العهدة (للأدمن فقط)
  const handleUpdateCustodyField = (id, field, value) => {
    if (!isAdmin) return;
    setCustodyData((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // حذف عهدة (للأدمن فقط)
  const handleDeleteCustody = (id) => {
    if (!isAdmin) {
      alert("عذراً، الحذف متاح للمشرفين فقط.");
      return;
    }
    setCustodyData((prev) => prev.filter((c) => c.id !== id));
  };

  // فلترة العهد للفرع المختار
  const currentBranchItems = custodyData.filter((item) => String(item.branchId) === String(selectedBranch));

  // إجمالي قيمة العهدة للفرع الحالي
  const totalBranchValue = currentBranchItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  // إيجاد اسم الفرع المختار لعرضه
  const getBranchName = (id) => {
    if (id === "الرئيسي") return "الرئيسي";
    const found = branches.find((b) => String(b.id) === String(id));
    return found ? (found.name || found) : `فرع كود: ${id}`;
  };

  // تجميع قيمة العهدة وعدد الأدوات لكل فرع للرسوم البيانية
  const branchSummaryData = [];
  const allBranchIds = Array.from(new Set(["الرئيسي", ...branches.map(b => typeof b === "object" ? String(b.id) : String(b)), ...custodyData.map(c => String(c.branchId))]));

  allBranchIds.forEach(bId => {
    const items = custodyData.filter(item => String(item.branchId) === String(bId));
    const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const totalCount = items.length;
    const name = getBranchName(bId);
    
    if (totalValue > 0 || String(bId) === String(selectedBranch)) {
      branchSummaryData.push({
        id: bId,
        name,
        value: totalValue,
        count: totalCount
      });
    }
  });

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 transition-colors duration-300 font-sans">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* هيدر الصفحة */}
          <div className="mb-2 flex items-start justify-between gap-4 flex-wrap" dir="rtl">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                عهدة الفروع والمعدات <Package className="text-indigo-500" size={28} />
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                متابعة العهد والأجهزة والمعدات المستديمة المسلمة لكل فرع وقيمتها الإجمالية.
              </p>
            </div>
            <button
              onClick={handleAiAnalyze}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Sparkles size={15} className="text-amber-300 animate-pulse" />
              تقرير العهدة الذكي
            </button>
          </div>

          {/* تنبيه لغير المسؤولين */}
          {!isAdmin && (
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs font-bold text-amber-700 dark:text-amber-400" dir="rtl">
              <AlertCircle size={18} className="shrink-0" />
              <span>عرض فقط: يمكنك استعراض العهد والأسعار الخاصة بفروعك فقط. تسجيل وتعديل العهد متاح للمسؤولين والـ Admin فقط.</span>
            </div>
          )}

          {/* قسم التحكم والاختيار */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* كارت اختيار الفرع */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800/60 space-y-4" dir="rtl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <MapPin size={20} />
                </div>
                <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">
                  اختر الفرع المراد عرضه
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                تصفح العهدة والأصول التابعة لأي فرع من فروع الورشة المسجلة لديك.
              </p>
              
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <option value="الرئيسي" className="text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]">فرع الورشة الرئيسي</option>
                {branches.map((b) => {
                  const bId = typeof b === "object" ? b.id : b;
                  const bName = typeof b === "object" ? b.name : b;
                  return (
                    <option key={bId} value={bId} className="text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]">
                      {bName}
                    </option>
                  );
                })}
              </select>
            </motion.div>

            {/* كارت إضافة عهدة جديدة (متاح للآدمن فقط) */}
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800/60" dir="rtl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">
                    تسجيل وإسناد عهدة جديدة لـ {getBranchName(selectedBranch)}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    {isAdmin ? "قم بإضافة أداة أو جهاز جديد للفرع النشط مباشرة." : "هذه الخاصية مقفلة ومتاحة للمسؤولين فقط."}
                  </p>
                </div>
              </div>

              {isAdmin ? (
                <form onSubmit={handleAddCustody} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1">
                      اسم الأداة / العهدة
                    </label>
                    <input
                      type="text"
                      required
                      value={newToolName}
                      onChange={(e) => setNewToolName(e.target.value)}
                      placeholder="مثال: كومبريسور هواء صامت"
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-teal-500 outline-none font-bold text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 mr-1 text-right">
                      سعر الأداة (ج.م)
                    </label>
                    <input
                      type="number"
                      required
                      value={newToolPrice}
                      onChange={(e) => setNewToolPrice(e.target.value)}
                      placeholder="0"
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-xs focus:ring-2 focus:ring-teal-500 outline-none text-center font-bold"
                    />
                  </div>
                  <div className="sm:col-span-3 pt-2">
                    <button
                      type="submit"
                      className="w-full bg-teal-650 hover:bg-teal-700 text-white p-3 rounded-xl font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer text-xs"
                    >
                      حفظ وتسجيل العهدة للفرع
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-8 text-center text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl text-xs font-semibold">
                  <ShieldCheck size={28} className="mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                  غير مسموح لك بإضافة عهد جديدة. يرجى مراجعة المسؤول الرئيسي.
                </div>
              )}
            </motion.div>
          </div>

          {/* قسم الرسوم البيانية للعهد */}
          {branchSummaryData.length > 0 && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* 1. مخطط الأعمدة لقيمة العهدة */}
              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800/60" dir="rtl">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> مقارنة إجمالي قيمة العهدة بين الفروع (ج.م)
                </h4>
                <div className="h-64 w-full text-xs font-semibold">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchSummaryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                      <YAxis tick={{ fill: '#9CA3AF' }} />
                      <RechartsTooltip formatter={(val) => `${val.toLocaleString()} ج.م`} contentStyle={{ direction: 'rtl', borderRadius: '12px' }} />
                      <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} name="إجمالي القيمة" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. مخطط الكعكة لنسبة توزيع العهدة */}
              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800/60 flex flex-col justify-between" dir="rtl">
                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-555 bg-teal-500"></span> نسبة توزيع العهد والأصول بالفروع
                </h4>
                
                <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
                  <div className="h-52 w-52 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={branchSummaryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {branchSummaryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(val) => `${val.toLocaleString()} ج.م`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* دليل الألوان للرسم الدائري */}
                  <div className="flex flex-col gap-2.5 text-xs w-full">
                    {branchSummaryData.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 font-bold">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                          <span className="text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 shrink-0">
                          {item.value.toLocaleString()} ج.م ({((item.value / branchSummaryData.reduce((s, x) => s + x.value, 0)) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* جدول عرض العهدة الحالي للفرع المختار */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-800/60 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" dir="rtl">
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-emerald-500" /> تفاصيل أدوات العهدة في: {getBranchName(selectedBranch)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                  {isAdmin ? "يمكن للمشرف تعديل اسم الأداة أو السعر بالضغط المباشر داخل خلايا الجدول إكسيل." : "قائمة الأصول المسجلة لهذا الفرع وقيمها المالية المسجلة."}
                </p>
              </div>
              
              {/* إجمالي قيمة العهدة بالفرع */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-150/40 dark:border-emerald-950/20 rounded-2xl flex items-center gap-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-sm shrink-0">
                <span>إجمالي قيمة العهدة بالفرع:</span>
                <span className="text-base font-black text-gray-900 dark:text-white">{totalBranchValue.toLocaleString()} ج.م</span>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800/80 rounded-xl" dir="rtl">
              <table className="w-full text-right border-collapse min-w-[700px] border border-gray-200 dark:border-gray-800 divide-y divide-gray-200 dark:divide-gray-800">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 divide-x divide-x-reverse divide-gray-200 dark:divide-gray-800">
                    <th className="p-3 text-center text-xs font-bold w-12">#</th>
                    <th className="p-3 text-xs font-bold w-3/5">اسم الأداة / العهدة المسلمة للفرع</th>
                    <th className="p-3 text-xs font-bold w-1/4 text-center">السعر / القيمة الحالية (ج.م)</th>
                    <th className="p-3 text-xs font-bold w-1/4 text-center">تاريخ الإسناد</th>
                    {isAdmin && <th className="p-3 text-xs font-bold w-12 text-center">حذف</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#151F32]">
                  {currentBranchItems.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} className="p-10 text-center text-gray-400 text-xs font-semibold">
                        لا توجد أدوات عهدة مسجلة في هذا الفرع حالياً.
                      </td>
                    </tr>
                  ) : (
                    currentBranchItems.map((item, idx) => (
                      <tr key={item.id} className="divide-x divide-x-reverse divide-gray-200 dark:divide-gray-800 hover:bg-gray-50/40 dark:hover:bg-gray-900/10">
                        <td className="p-3 text-center text-xs font-bold text-gray-400 dark:text-gray-600 bg-gray-50/50 dark:bg-gray-900/30">
                          {idx + 1}
                        </td>
                        <td className="p-1">
                          {isAdmin ? (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateCustodyField(item.id, "name", e.target.value)}
                              className="w-full h-9 px-2 bg-transparent text-xs text-gray-900 dark:text-white border-0 outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                            />
                          ) : (
                            <span className="px-2 text-xs font-bold text-gray-700 dark:text-gray-300">{item.name}</span>
                          )}
                        </td>
                        <td className="p-1">
                          {isAdmin ? (
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateCustodyField(item.id, "price", parseFloat(e.target.value) || 0)}
                              className="w-full h-9 bg-transparent text-xs text-gray-900 dark:text-white border-0 outline-none text-center font-bold focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <div className="text-center text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {item.price.toLocaleString()} ج.م
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center text-xs text-gray-500 dark:text-gray-400 font-semibold">
                          {item.dateAdded}
                        </td>
                        {isAdmin && (
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف ${item.name} من عهدة هذا الفرع؟`)) {
                                  handleDeleteCustody(item.id);
                                }
                              }}
                              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} className="mx-auto" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

        </motion.div>

      {/* ── AI Modal: تقرير العهدة الذكي ── */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAiModal(false)} dir="rtl">
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-2xl max-w-lg w-full text-right relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />
            <button onClick={() => setShowAiModal(false)} className="absolute top-5 left-5 p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-400 rounded-xl cursor-pointer">
              <X size={16} />
            </button>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2 mb-5">
              <Sparkles size={20} className="text-violet-500" /> تقرير العهدة الذكي
            </h3>
            {aiLoading ? (
              <div className="flex flex-col items-center py-10 gap-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 border-r-indigo-500 animate-spin" />
                </div>
                <span className="text-xs font-bold text-gray-400 animate-pulse">جاري تحليل بيانات العهدة...</span>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-semibold whitespace-pre-line">{aiReport}</p>
              </div>
            )}
            <button onClick={() => setShowAiModal(false)} className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold transition-all cursor-pointer">
              حسناً
            </button>
          </motion.div>
        </div>
      )}
      </main>
    </div>
  );
}
