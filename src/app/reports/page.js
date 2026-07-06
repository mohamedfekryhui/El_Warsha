"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useReportsData } from "@/hooks/useReportsData";
import { FileText, CreditCard, Truck, Receipt, BadgeCheck, TrendingUp, AlertTriangle, ArrowUpRight, Trash2, ShieldCheck, Clipboard, Plus, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.08 } }
};
const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function ReportsPage() {
  const [toastMessage, setToastMessage] = useState("");

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setToastMessage(`تم النسخ إلى الحافظة: "${text}"`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const {
    doctors,
    reports,
    loading,
    finDoctorId,
    setFinDoctorId,
    finShipping,
    setFinShipping,
    finOther,
    setFinOther,
    finDesc,
    setFinDesc,
    finPaid,
    setFinPaid,
    handleRecordTransaction,
  } = useReportsData();

  // قائمة ديون الورشة لجهات خارجية (نحن المدينون لجهات أخرى كالموردين والشركات)
  const [externalDebts, setExternalDebts] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("elwarsha_external_debts");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      {
        id: 1,
        creditorName: "شركة توريدات أسنان ألفا",
        amount: 4500,
        items: [
          { id: 101, name: "روتور توربينات ياباني", price: 3000 },
          { id: 102, name: "معدات حفر دقيقة", price: 1500 }
        ],
        date: "2026-07-01"
      },
      {
        id: 2,
        creditorName: "موقع الشحن السريع للمناديب",
        amount: 1200,
        items: [
          { id: 201, name: "فاتورة شحنات يونيو", price: 1000 },
          { id: 202, name: "توصيل مندوب عاجل", price: 200 }
        ],
        date: "2026-07-03"
      }
    ];
  });

  // مزامنة ديون الورشة مع localStorage
  useEffect(() => {
    localStorage.setItem("elwarsha_external_debts", JSON.stringify(externalDebts));
  }, [externalDebts]);

  // حالة لتخزين مدخلات البند الجديد المؤقت لكل خلية دين خارجي
  const [tempItems, setTempItems] = useState({}); // { [debtId]: { name: "", price: "" } }

  // حالة لتسجيل مدفوعات سداد الديون الجزئية
  const [partialPayments, setPartialPayments] = useState({});

  // حالات مساعد الذكاء الاصطناعي لتحليل الحسابات
  const [showAiReport, setShowAiReport] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReportText, setAiReportText] = useState("");
  const [initialReportText, setInitialReportText] = useState("");
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // تحديث خلية معينة في جدول الديون الخارجية
  const updateDebtField = (id, field, value) => {
    setExternalDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  // تحديث مدخلات البند الجديد المؤقت
  const updateTempItem = (debtId, field, value) => {
    setTempItems((prev) => ({
      ...prev,
      [debtId]: {
        ...(prev[debtId] || { name: "", price: "" }),
        [field]: value
      }
    }));
  };

  // إدراج بند وسعر جديد بالضغط على Enter وتحديث المبلغ الكلي تلقائياً
  const submitTempItem = (debtId) => {
    const temp = tempItems[debtId] || { name: "", price: "" };
    if (!temp.name.trim()) return;

    const price = parseFloat(temp.price) || 0;

    setExternalDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newItems = [...(d.items || []), { id: Date.now(), name: temp.name.trim(), price }];
          const newAmount = newItems.reduce((sum, item) => sum + item.price, 0);
          return { ...d, items: newItems, amount: newAmount };
        }
        return d;
      })
    );

    // تصفير مدخلات هذا الصف
    setTempItems((prev) => ({
      ...prev,
      [debtId]: { name: "", price: "" }
    }));
  };

  // حذف بند فرعي وإعادة احتساب المبلغ الإجمالي
  const handleRemoveSubItem = (debtId, itemId) => {
    setExternalDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newItems = (d.items || []).filter((item) => item.id !== itemId);
          const newAmount = newItems.reduce((sum, item) => sum + item.price, 0);
          return { ...d, items: newItems, amount: newAmount };
        }
        return d;
      })
    );
  };

  // سداد جزء من الدين بحد أقصى القيمة المتبقية
  const handlePayPartialDebt = (id, payAmountStr) => {
    const payAmount = parseFloat(payAmountStr);
    if (isNaN(payAmount) || payAmount <= 0) {
      alert("الرجاء إدخال مبلغ سداد صحيح أكبر من الصفر.");
      return;
    }

    setExternalDebts((prev) => {
      return prev.map((d) => {
        if (d.id === id) {
          if (payAmount >= d.amount) {
            alert(`تم سداد كامل الدين المستحق للجهة "${d.creditorName}" بنجاح! 🎉`);
            return null; // سيتم حذفه تلقائياً
          } else {
            const newAmount = d.amount - payAmount;
            alert(`تم سداد ${payAmount} ج.م. بنجاح. المتبقي للجهة "${d.creditorName}" هو ${newAmount} ج.م.`);
            return { ...d, amount: newAmount };
          }
        }
        return d;
      }).filter(Boolean);
    });

    // تصفير حقل السداد لهذا الصف
    setPartialPayments((prev) => ({ ...prev, [id]: "" }));
  };

  // إضافة صف دائن جديد مباشرة في الجدول المرن
  const handleAddNewDebtRow = () => {
    const newRow = {
      id: Date.now(),
      creditorName: "جهة دائنة جديدة",
      amount: 0,
      items: [],
      date: new Date().toISOString().split("T")[0]
    };
    setExternalDebts((prev) => [...prev, newRow]);
  };

  const handleDeleteExternalDebt = (id) => {
    if (confirm("هل تريد حذف هذا الصف نهائياً من كشوفات الالتزامات؟")) {
      setExternalDebts((prev) => prev.filter((d) => d.id !== id));
    }
  };

  // تشغيل المساعد الذكي لتحليل الحسابات
  const handleAnalyzeAccounts = () => {
    setShowAiReport(true);
    setAiLoading(true);
    setIsChatMode(false);

    setTimeout(() => {
      setAiLoading(false);
      const docCount = reports.length;
      const totalDocsOwed = reports.filter(r => r.remainingBalance > 0).length;

      const reportContent = `📊 تقرير التحليل المالي والديون للورشة:
- إجمالي مديونيات الأطباء المستحقة (لنا): ${totalDebts} ج.م (من أصل ${totalDocsOwed} أطباء مدينين).
- إجمالي مستحقات الورشة الخارجية (علينا): ${totalExternalDebts} ج.م (لصالح ${externalDebts.length} موردين/جهات).
- نسبة تغطية الديون: ${totalExternalDebts > 0 ? Math.round((totalDebts / totalExternalDebts) * 100) : 100}% (نسبة جيدة لتغطية الالتزامات).

💡 التقييم والتشخيص الذكي:
1. مديونيات الأطباء المعلقة تغطي ديون الورشة الخارجية بالكامل وبزيادة مالية مريحة.
2. يوصى بتسريع عملية التحصيل من الأطباء أصحاب المديونيات المرتفعة لزيادة الكاش والسيولة في الورشة وسداد فواتير الموردين لتجنب أي تأخير في قطع الغيار.

🎯 التوصيات المالية المقترحة:
• تفعيل رسائل التذكير التلقائي بالمديونيات للأطباء عبر الواتساب.
• سداد دفعة جزئية للموردين أصحاب الفواتير العاجلة (مثل شركة توريدات أسنان ألفا).`;
      setAiReportText(reportContent);
      setInitialReportText(reportContent);
    }, 1200);
  };

  // إرسال سؤال في شات الحسابات
  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput("");
    setAiLoading(true);

    setTimeout(() => {
      setAiLoading(false);
      let reply = "";
      const textLower = userText.toLowerCase();
      if (textLower.includes("تحصيل") || textLower.includes("طبيب") || textLower.includes("دكتور")) {
        reply = `📈 سبل تحسين تحصيل الديون من الأطباء:
1. مشاركة كشف الحساب المجمع مع الطبيب بنقرة واحدة (باستخدام زر النسخ الفوري بجانب اسمه).
2. جدولة مواعيد دفع ثابتة (مثال: أسبوعياً أو عند تسليم كل جهاز).
3. تقديم خصم رمزي 5% للدفع النقدي الفوري عند تسليم الصيانة.`;
      } else if (textLower.includes("سداد") || textLower.includes("مورد") || textLower.includes("شركة")) {
        reply = `💸 خطة سداد ديون الورشة لجهات خارجية:
• نقترح استخدام ميزة "تجزئة السداد" بالجدول لدفع أقساط دورية صغيرة للموردين.
• ابدأ بالجهات الدائنة التي توفر قطع الغيار الأساسية للتوربينات لضمان عدم توقف عمليات الصيانة اليومية.`;
      } else {
        reply = `📊 تحليل إضافي لاستفسارك المالي ("${userText}"):
بناءً على الكشوفات الحالية، يوصى بالاحتفاظ بسيولة نقدية لا تقل عن 20% من إجمالي الإيرادات لمواجهة حالات الصيانة الطارئة أو شراء معدات جديدة للورشة.`;
      }
      setAiReportText(reply);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 transition-colors duration-300 font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col justify-center items-center h-screen space-y-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-650 border-r-indigo-650 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500 animate-spin [animation-duration:1.5s]"></div>
            <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse"></div>
          </div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">جاري تحميل كشوفات الحسابات والتقارير...</span>
        </main>
      </div>
    );
  }

  // حسابات إحصائيات مديونيات الأطباء
  const totalDebts = reports.reduce((sum, r) => r.remainingBalance > 0 ? sum + r.remainingBalance : sum, 0);
  
  // حساب إجمالي ديون الورشة لجهات خارجية
  const totalExternalDebts = externalDebts.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-900 dark:bg-[#0B1120] dark:text-gray-100 transition-colors duration-300 font-sans relative">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <motion.div
          initial="initial"
          animate="animate"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* الهيدر مع زر التحليل المالي بالذكاء الاصطناعي */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-250/20 dark:border-gray-800/40 pb-6 mb-2" dir="rtl">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                الحسابات والتقارير المالية <FileText className="text-blue-500 animate-pulse" size={28} />
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                كشوفات الأطباء، مديونيات الورشة للموردين، وتسجيل كافة التدفقات المالية.
              </p>
            </div>

            {/* زر التحليل الفخم بالذكاء الاصطناعي */}
            <button
              type="button"
              onClick={handleAnalyzeAccounts}
              className="relative overflow-hidden group px-7 py-3.5 bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#2563EB] hover:from-[#8B5CF6] hover:to-[#1D4ED8] text-white rounded-full text-sm font-black transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98]"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" 
                initial={{ x: "-100%" }} 
                whileHover={{ x: "100%", transition: { duration: 0.75, ease: "easeInOut" } }} 
              />
              <span>حلِّل لي الحسابات وولد لي تقرير</span> 
              <Sparkles size={15} className="text-amber-300 animate-pulse shrink-0" />
            </button>
          </div>

          {/* كروت التلخيص العلوي للأرصدة (Two Cards Only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
            {/* كارت مديونيات الأطباء */}
            <motion.div
              variants={itemVariants}
              onClick={() => copyToClipboard(totalDebts.toString())}
              className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
              title="اضغط لنسخ إجمالي مديونيات الأطباء"
            >
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-1">إجمالي مديونيات الأطباء (لنا طرفهم) 📈</span>
                <h4 className="text-2xl font-black text-rose-600 dark:text-rose-450">+{totalDebts} ج.م</h4>
                <p className="text-[10px] text-gray-450 mt-1">مستحقات معلقة ننتظر تحصيلها من الأطباء</p>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-2xl shrink-0">
                <AlertTriangle size={24} />
              </div>
            </motion.div>

            {/* كارت ديون الورشة لجهات خارجية */}
            <motion.div
              variants={itemVariants}
              onClick={() => copyToClipboard(totalExternalDebts.toString())}
              className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
              title="اضغط لنسخ إجمالي ديون الورشة للموردين"
            >
              <div>
                <span className="text-xs font-bold text-gray-400 block mb-1">إجمالي ديون الورشة (علينا للموردين) 💸</span>
                <h4 className="text-2xl font-black text-purple-600 dark:text-purple-400">{totalExternalDebts} ج.م</h4>
                <p className="text-[10px] text-gray-450 mt-1">مستحقات للشركات والموردين والجهات الخارجية</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-2xl shrink-0">
                <CreditCard size={24} />
              </div>
            </motion.div>
          </div>

          {/* قسم النماذج والمديونيات جنبًا إلى جنب (50% لكل منهما) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" dir="rtl">
            {/* 1. فورمة تسجيل حركة مالية لطبيب */}
            <motion.div variants={itemVariants}>
              <form
                onSubmit={handleRecordTransaction}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-sm h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Receipt className="text-blue-500" size={18} />
                    <h3 className="font-bold text-sm text-gray-850 dark:text-gray-200">
                      تسجيل حركة مالية جديدة لطبيب
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 block mb-1.5 ml-1">الطبيب</label>
                        <select
                          required
                          value={finDoctorId}
                          onChange={(e) => setFinDoctorId(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                        >
                          <option value="" className="text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]">اختر العميل...</option>
                          {doctors.map((d) => (
                            <option key={d.id} value={d.id} className="text-gray-900 dark:text-white bg-white dark:bg-[#1E293B]">
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 block mb-1.5 ml-1">تكلفة شحن</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={finShipping}
                          onChange={(e) => setFinShipping(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-400 block mb-1.5 ml-1">أخرى (تزيد المديونية)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={finOther}
                          onChange={(e) => setFinOther(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-emerald-500 block mb-1.5 ml-1">المدفوع (الوارد)</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={finPaid}
                          onChange={(e) => setFinPaid(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none text-xs font-black text-emerald-700 dark:text-emerald-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 block mb-1.5 ml-1">وصف المصاريف الأخرى</label>
                      <input
                        type="text"
                        placeholder="خصم، صيانة قطع خارجية..."
                        value={finDesc}
                        onChange={(e) => setFinDesc(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  <CreditCard size={15} /> تسجيل حركة الطبيب المالّية
                </button>
              </form>
            </motion.div>

            {/* 2. قائمة مديونيات الأطباء المستحقة للورشة */}
            <motion.div variants={itemVariants}>
              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800/60 shadow-sm h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm mb-4 text-rose-600 dark:text-rose-455 flex items-center gap-2">
                    📈 قائمة المديونيات المستحقة للورشة من الأطباء ({reports.filter(r => r.remainingBalance > 0).length})
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {reports.filter(r => r.remainingBalance > 0).length === 0 ? (
                      <p className="text-xs text-gray-405 dark:text-gray-500 text-center py-6">لا توجد مديونيات معلقة حالياً.</p>
                    ) : (
                      reports.filter(r => r.remainingBalance > 0).map(r => (
                        <div
                          key={r.doctorId}
                          onClick={() => copyToClipboard(r.doctorName)}
                          className="flex justify-between items-center p-3.5 rounded-2xl bg-rose-50/30 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-900/20 cursor-pointer hover:bg-rose-100/50 dark:hover:bg-rose-900/10 transition-all"
                          title="اضغط لنسخ اسم الطبيب"
                        >
                          <div>
                            <span className="text-xs font-extrabold text-gray-850 dark:text-gray-200">{r.doctorName}</span>
                            <span className="block text-[9px] text-gray-455 mt-0.5 font-bold">المدفوع: {r.totalPaid} ج.م / المطلوب: {r.totalRequired} ج.م</span>
                          </div>
                          <span
                            className="text-sm font-black text-rose-650 dark:text-rose-450"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(r.remainingBalance.toString());
                            }}
                            title="اضغط لنسخ المديونية"
                          >
                            +{r.remainingBalance} ج.م
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 text-center pt-4 border-t border-gray-100 dark:border-gray-800/40">
                  اضغط على أي طبيب لنسخ اسمه وتفاصيله لمشاركتها فوراً.
                </div>
              </div>
            </motion.div>
          </div>

          {/* 3. سجل الديون والمستحقات على الورشة لجهات خارجية (تعديل مباشر كالإكسيل) */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800/60 overflow-hidden" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h3 className="font-bold text-lg text-gray-850 dark:text-gray-200 flex items-center gap-2">
                <CreditCard size={20} className="text-purple-500 animate-pulse" /> سجل ديون ومستحقات الورشة الخارجية
              </h3>
              
              <button
                type="button"
                onClick={handleAddNewDebtRow}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/15"
              >
                <Plus size={14} /> إضافة جهة دائنة جديدة (صف جديد)
              </button>
            </div>

            {externalDebts.length === 0 ? (
              <div className="text-center py-10 text-gray-405 dark:text-gray-500 text-sm">
                لا توجد ديون خارجية مسجلة على الورشة حالياً. اضغط على الزر بالأعلى لإضافة دائن جديد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse border border-gray-200 dark:border-gray-800">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50">
                      <th className="p-3 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400 w-1/4">الجهة الدائنة (المدين له)</th>
                      <th className="p-3 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400 w-2/5">التفاصيل وسبب الدين (بنود وأسعار - اضغط Enter للإدراج)</th>
                      <th className="p-3 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400 w-1/12 text-center">تاريخ التسجيل</th>
                      <th className="p-3 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400 w-[12%] text-center">المبلغ المتبقي (ج.م)</th>
                      <th className="p-3 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400 text-center w-1/5">سداد</th>
                      <th className="p-3 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400 text-center w-[6%]">إزالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {externalDebts.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-gray-105/50 dark:hover:bg-gray-800/10 transition-colors animate-none"
                      >
                        {/* الجهة الدائنة */}
                        <td className="p-1 border border-gray-200 dark:border-gray-800">
                          <input
                            type="text"
                            value={d.creditorName}
                            onChange={(e) => updateDebtField(d.id, "creditorName", e.target.value)}
                            placeholder="اسم الدائن..."
                            className="w-full p-2 bg-transparent outline-none text-xs font-bold text-gray-900 dark:text-gray-100 border-none focus:ring-1 focus:ring-purple-500 rounded-lg text-right"
                          />
                        </td>
                        {/* تفاصيل وسبب الدين */}
                        <td className="p-2 border border-gray-200 dark:border-gray-800">
                          {/* قائمة البنود المضافة */}
                          <div className="space-y-1 mb-2">
                            {d.items && d.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center bg-gray-50/70 dark:bg-gray-900/60 p-1.5 rounded-lg border border-gray-150 dark:border-gray-800 text-[10px] font-bold">
                                <span className="text-gray-800 dark:text-gray-200">{item.name}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-purple-650 dark:text-purple-400">{item.price} ج.م</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSubItem(d.id, item.id)}
                                    className="text-rose-500 hover:text-rose-700 font-extrabold text-[12px] cursor-pointer shrink-0"
                                    title="حذف البند"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* مدخلات إضافة بند جديد بالضغط على Enter */}
                          <div className="flex gap-1.5 items-center">
                            <input
                              type="text"
                              placeholder="البند (اضغط Enter للإضافة)..."
                              value={tempItems[d.id]?.name || ""}
                              onChange={(e) => updateTempItem(d.id, "name", e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  submitTempItem(d.id);
                                }
                              }}
                              className="w-1/2 p-1.5 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-purple-500 outline-none text-[10px] font-semibold"
                            />
                            <input
                              type="number"
                              placeholder="السعر..."
                              value={tempItems[d.id]?.price || ""}
                              onChange={(e) => updateTempItem(d.id, "price", e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  submitTempItem(d.id);
                                }
                              }}
                              className="w-1/3 p-1.5 rounded-lg bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 focus:ring-1 focus:ring-purple-500 outline-none text-[10px] font-bold text-center text-purple-650 dark:text-purple-400"
                            />
                            <button
                              type="button"
                              onClick={() => submitTempItem(d.id)}
                              className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[9px] font-black cursor-pointer shrink-0"
                            >
                              إدراج
                            </button>
                          </div>
                        </td>
                        {/* تاريخ التسجيل */}
                        <td className="p-1 border border-gray-200 dark:border-gray-800">
                          <input
                            type="text"
                            value={d.date}
                            onChange={(e) => updateDebtField(d.id, "date", e.target.value)}
                            placeholder="تاريخ التسجيل..."
                            className="w-full p-2 bg-transparent outline-none text-xs font-medium text-gray-550 dark:text-gray-400 border-none focus:ring-1 focus:ring-purple-500 rounded-lg text-center"
                          />
                        </td>
                        {/* قيمة الدين المتبقية */}
                        <td className="p-1 border border-gray-200 dark:border-gray-800">
                          <input
                            type="number"
                            value={d.amount}
                            onChange={(e) => updateDebtField(d.id, "amount", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="w-full p-2 bg-transparent outline-none text-xs font-black text-purple-650 dark:text-purple-400 border-none focus:ring-1 focus:ring-purple-500 rounded-lg text-center font-bold"
                          />
                        </td>
                        {/* عمود سداد المبلغ بحد أقصى المتبقي */}
                        <td className="p-2 border border-gray-200 dark:border-gray-800">
                          <div className="flex items-center gap-1.5 justify-center">
                            <input
                              type="number"
                              placeholder="سداد ..."
                              value={partialPayments[d.id] || ""}
                              onChange={(e) => setPartialPayments({ ...partialPayments, [d.id]: e.target.value })}
                              max={d.amount}
                              min="1"
                              className="w-24 p-1.5 rounded-lg border border-purple-200 dark:border-purple-800 text-xs font-bold text-center bg-gray-100 dark:bg-[#1a2744] focus:ring-1 focus:ring-purple-500 outline-none text-purple-700 dark:text-purple-300"
                            />
                            <button
                              type="button"
                              onClick={() => handlePayPartialDebt(d.id, partialPayments[d.id])}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-sm shrink-0"
                            >
                              سداد 
                            </button>
                          </div>
                        </td>
                        {/* خيارات إزالة الصف */}
                        <td className="p-1 border border-gray-200 dark:border-gray-800 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteExternalDebt(d.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded-xl transition-colors cursor-pointer"
                            title="حذف الصف"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* جدول كشف الحساب المجمع الكامل للأطباء */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800/60 overflow-hidden" dir="rtl">
            <h3 className="font-bold text-lg mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <FileText size={20} className="text-blue-500" /> كشف الحساب المجمع الكامل للأطباء 
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800/60">
                    <th className="pb-4 text-xs font-bold text-gray-400 w-1/4">
                      الطبيب
                    </th>
                    <th className="pb-4 text-xs font-bold text-gray-400">
                      الصيانة
                    </th>
                    <th className="pb-4 text-xs font-bold text-gray-400">
                      الشحن
                    </th>
                    <th className="pb-4 text-xs font-bold text-gray-400">
                      المطلوب كلياً
                    </th>
                    <th className="pb-4 text-xs font-bold text-gray-400">
                      تم دفعه
                    </th>
                    <th className="pb-4 text-xs font-bold text-gray-400 text-left px-4">
                      الرصيد المتبقي
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr
                      key={r.doctorId}
                      className="border-b border-gray-50 dark:border-gray-800/40 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                    >
                      <td
                        className="py-5 font-bold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => copyToClipboard(r.doctorName)}
                        title="اضغط لنسخ اسم الطبيب"
                      >
                        {r.doctorName}
                      </td>
                      <td
                        className="py-5 text-gray-500 dark:text-gray-400 font-bold cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => copyToClipboard(r.totalPartsCost.toString())}
                        title="اضغط لنسخ قيمة الصيانة"
                      >
                        {r.totalPartsCost} ج.م
                      </td>
                      <td
                        className="py-5 text-amber-600 dark:text-amber-500 font-bold cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => copyToClipboard(r.totalShipping.toString())}
                        title="اضغط لنسخ قيمة الشحن"
                      >
                        <span className="flex items-center gap-1.5">
                          <Truck size={14} /> {r.totalShipping} ج.م
                        </span>
                      </td>
                      <td
                        className="py-5 text-gray-900 dark:text-gray-100 font-black cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => copyToClipboard(r.totalRequired.toString())}
                        title="اضغط لنسخ إجمالي المطلوب"
                      >
                        {r.totalRequired} ج.م
                      </td>
                      <td
                        className="py-5 text-emerald-650 dark:text-emerald-500 font-black cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => copyToClipboard(r.totalPaid.toString())}
                        title="اضغط لنسخ المبلغ المدفوع"
                      >
                        {r.totalPaid} ج.م
                      </td>
                      <td
                        className="py-5 text-left px-4 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => copyToClipboard(r.remainingBalance.toString())}
                        title="اضغط لنسخ الرصيد المتبقي"
                      >
                        {r.remainingBalance === 0 ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-500/20">
                            <BadgeCheck size={14} /> خالص
                          </span>
                        ) : (
                          <span
                            className={`font-black text-lg ${r.remainingBalance > 0 ? "text-rose-500" : "text-blue-500"}`}
                          >
                            {r.remainingBalance > 0 ? `+${r.remainingBalance}` : r.remainingBalance}{" "}
                            <span className="text-sm font-medium">ج.م</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* مودال شات التحليل المالي للتقارير (Replacement Chat Modal) */}
      <AnimatePresence>
        {showAiReport && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setShowAiReport(false)}
            dir="rtl"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#1E293B] p-8 rounded-[2rem] border border-gray-150 dark:border-gray-800 shadow-2xl max-w-lg w-full text-right relative overflow-hidden cursor-default space-y-6"
            >
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-purple-650"></div>

              <button
                type="button"
                onClick={() => setShowAiReport(false)}
                className="absolute top-5 left-5 p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-250 rounded-xl transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-2">
                ✨ {isChatMode ? "محادثة التحليل المالي للورشة" : "تقرير التحليل المالي والديون"}
              </h3>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-650 border-r-indigo-650 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-500 animate-spin [animation-duration:1.5s]"></div>
                    <div className="absolute inset-4 bg-indigo-500/10 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                    {isChatMode ? "جاري توليد الرد المالي..." : "يقوم المساعد الذكي بتحليل الديون والالتزامات..."}
                  </span>
                </div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100/50 dark:border-gray-800/30">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/50 dark:border-gray-800/30 mb-3">
                      <span className="font-black text-purple-600 dark:text-purple-400">
                        {isChatMode ? "💡 رد المساعد المالي" : "التقرير والتشخيص المالي"}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(aiReportText)}
                        className="text-xs text-indigo-650 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                      >
                        📋 نسخ النص
                      </button>
                    </div>
                    <p className="text-xs text-gray-755 dark:text-gray-350 leading-relaxed font-semibold whitespace-pre-line text-right" dir="rtl">
                      {aiReportText}
                    </p>
                  </div>

                  {/* حقل إدخال شات المساعد المالي */}
                  {isChatMode && (
                    <form onSubmit={handleSendChat} className="flex gap-2 border-t border-gray-150/40 dark:border-gray-800/40 pt-4">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="اسأل عن تحسين التحصيل من الأطباء، جدولة سداد الموردين..."
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-250 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-right font-bold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-550/10 shrink-0"
                      >
                        إرسال
                      </button>
                    </form>
                  )}
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-gray-150/40 dark:border-gray-800/40 flex justify-between items-center">
                {!isChatMode ? (
                  <button
                    type="button"
                    onClick={() => setIsChatMode(true)}
                    className="relative overflow-hidden group px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white rounded-full text-xs font-black transition-all shadow-md hover:scale-105 active:scale-95 duration-200 cursor-pointer"
                  >
                    <span>متابعة الدردشة ✨</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAiReportText(initialReportText);
                      setIsChatMode(false);
                    }}
                    className="px-6 py-2.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-150/50 dark:border-purple-900/40 rounded-full text-xs font-black hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    <span>العودة للتقرير الرئيسي 📋</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowAiReport(false)}
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
